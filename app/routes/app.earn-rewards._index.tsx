import {
  Page,
  Card,
  Text,
  EmptyState,
  Layout,
  Box,
  BlockStack,
  DataTable,
  Badge,
  Button,
  InlineStack,
  Modal,
  Form,
  FormLayout,
  TextField,
  Select,
  Checkbox,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import {
  ErrorResponseWithCors,
  SuccessResponseWithCors,
} from "app/lib/response.app.lib";
import { authenticate } from "app/shopify.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import rewardRulesService from "app/services/reward-rules.service";
import { useState, useCallback } from "react";
import type { RuleType } from "@prisma/client";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { admin } = await authenticate.admin(request);

    const fd = await request.formData();
    const data = Object.fromEntries(fd);
    const reqMethod = request.method.toUpperCase();
    const { actionType } = data;

    switch (reqMethod) {
      case "POST":
        switch (actionType) {
          case "edit-rule":
            const { ruleType, ruleName, rewardPoints, isActive } = data;
            await rewardRulesService.updateRewardRuleByShopId(
              admin,
              ruleType as any,
              String(isActive) === "true",
              +rewardPoints,
              ruleName as string,
            );
            break;

          case "delete-rule":
            const { ruleTypeToDelete } = data;
            await rewardRulesService.deleteRewardRuleByShopId(
              admin,
              ruleTypeToDelete as RuleType,
            );
            break;

          default:
            return ErrorResponseWithCors({
              request,
              error: new Error(`Unknown action type: ${actionType}`),
            });
        }
        break;

      default:
        return ErrorResponseWithCors({
          request,
          error: new Error("Method not allowed"),
        });
    }

    return SuccessResponseWithCors({ request });
  } catch (error) {
    console.log(error);
    return ErrorResponseWithCors({ request, error });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  try {
    const shopRules = await rewardRulesService.getAllRewardRulesByShopId(admin);
    return SuccessResponseWithCors({
      request,
      data: {
        shopRules: shopRules,
      },
    });
  } catch (error) {
    return ErrorResponseWithCors({ request, error });
  }
}

const EarnRewardsPage = () => {
  const loaderData = useLoaderData<typeof loader>();
  const parsedLoaderData = JSON.parse(loaderData);
  const {
    data: { shopRules },
  } = parsedLoaderData;

  const navigate = useNavigate();
  const submit = useSubmit();

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [ruleToDelete, setRuleToDelete] = useState<any>(null);
  const [formData, setFormData] = useState({
    ruleName: "",
    rewardPoints: "0",
    isActive: false,
  });

  console.log(shopRules);

  // Handler functions
  const handleEditRule = useCallback((rule: any) => {
    setSelectedRule(rule);
    setFormData({
      ruleName: rule.ruleName,
      rewardPoints: rule.rewardPoints.toString(),
      isActive: rule.isActive,
    });
    setIsEditModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedRule(null);
  }, []);

  const handleFormSubmit = useCallback(() => {
    if (!selectedRule) return;

    const data = {
      ruleType: selectedRule.ruleType,
      ...formData,
      actionType: "edit-rule",
    };

    submit(data, {
      method: "POST",
    });

    setIsEditModalOpen(false);
  }, [selectedRule, formData, submit]);

  const handleFormChange = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  // Delete handlers
  const handleDeleteRule = useCallback((rule: any) => {
    setRuleToDelete(rule);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setRuleToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!ruleToDelete) return;

    const data = {
      ruleTypeToDelete: ruleToDelete.ruleType,
      actionType: "delete-rule",
    };

    submit(data, {
      method: "POST",
    });

    setIsDeleteModalOpen(false);
    setRuleToDelete(null);
  }, [ruleToDelete, submit]);

  // Helper function to format rule type for display
  const formatRuleType = (ruleType: string) => {
    const typeMap: { [key: string]: string } = {
      NEW_CUSTOMER: "Creating Account",
      STORE_VISIT: "Store Visit",
      PURCHASE: "Purchase",
      PURCHASE_SUBSCRIPTION: "Purchase Subscription",
      BIRTHDAY: "Birthday",
      BUY_SPECIFIC_PRODUCT: "Buy Specific Product",
    };
    return typeMap[ruleType] || ruleType;
  };

  // Helper function to format reward points
  const formatReward = (points: number, ruleType: string) => {
    if (ruleType === "PURCHASE") {
      return `${points} points per ₹1 spent`;
    }
    return `${points} points`;
  };

  // Prepare table data
  const tableRows = shopRules.map((rule: any, index: number) => [
    `${index + 1}. ${rule.ruleName}`,
    formatRuleType(rule.ruleType),
    formatReward(rule.rewardPoints, rule.ruleType),
    `${rule.totalAwaredCount} times`,
    `${rule.totalAwardedPoints} points`,
    rule.isActive ? (
      <Badge tone="success">Active</Badge>
    ) : (
      <Badge tone="critical">Inactive</Badge>
    ),
    <InlineStack gap="200" key={index}>
      <Button size="micro" variant="plain" onClick={() => handleEditRule(rule)}>
        Edit
      </Button>
      <Button
        size="micro"
        variant="plain"
        tone="critical"
        onClick={() => handleDeleteRule(rule)}
      >
        Delete
      </Button>
      <Button size="micro" variant="plain">
        Completion Log
      </Button>
    </InlineStack>,
  ]);

  const tableHeadings = [
    "Name",
    "Type",
    "Reward",
    "Total Completed",
    "Total Awarded",
    "Status",
    "Action",
  ];

  return (
    <Page
      title="Earn Rewards"
      subtitle="This page will give you a detailed view of all the activities a shopper can perform related to your store or business to earn rewards (points or credits)."
      primaryAction={{
        content: "Add ways to earn",
        icon: PlusIcon,
        onAction: () => navigate("/app/earn-rewards/rules"),
      }}
      secondaryActions={[
        {
          content: "View Tutorials",
          onAction: () => console.log("View Tutorials clicked"),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          {shopRules && shopRules.length > 0 ? (
            <Card>
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                ]}
                headings={tableHeadings}
                rows={tableRows}
                footerContent={`Page 1 of 1 with ${shopRules.length} total results`}
              />
            </Card>
          ) : (
            <Card>
              <Box padding="800">
                <EmptyState
                  heading="Earn Rewards"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <BlockStack gap="400">
                    <Text as="p" variant="bodyMd" alignment="start">
                      This page will give you a detailed view of all the
                      activities a shopper can perform related to your store or
                      business to earn rewards (points or credits).
                    </Text>

                    <Text as="p" variant="bodyMd" alignment="start">
                      You can add, delete, modify, and customize the rule setup
                      to best suit your brand, product category, and customer
                      segment. The main objective of setting up ways to earn
                      rewards is to incentivize your shoppers to interact and
                      engage with your store, thereby increasing your store's
                      reach, sales volume, and revenue.
                    </Text>
                  </BlockStack>
                </EmptyState>
              </Box>
            </Card>
          )}
        </Layout.Section>
      </Layout>

      {/* Edit Rule Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={handleModalClose}
        title="Edit Reward Rule"
        primaryAction={{
          content: "Update Rule",
          onAction: handleFormSubmit,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleModalClose,
          },
        ]}
      >
        <Modal.Section>
          <Form onSubmit={handleFormSubmit}>
            <FormLayout>
              <Select
                label="Rule Type"
                options={[
                  { label: "Purchase", value: "PURCHASE" },
                  { label: "New Customer", value: "NEW_CUSTOMER" },
                  { label: "Visit Store", value: "STORE_VISIT" },
                  { label: "Birthday", value: "BIRTHDAY" },
                  {
                    label: "Buy Specific Product",
                    value: "BUY_SPECIFIC_PRODUCT",
                  },
                ]}
                value={selectedRule?.ruleType || ""}
                onChange={() => {}} // Read-only
                disabled
              />

              <TextField
                label="Rule Name"
                value={formData.ruleName}
                onChange={(value) => handleFormChange("ruleName", value)}
                placeholder="Enter a name for this rule"
                autoComplete="off"
              />

              <TextField
                label="Reward Points"
                type="number"
                value={formData.rewardPoints}
                onChange={(value) => handleFormChange("rewardPoints", value)}
                placeholder="0"
                autoComplete="off"
                helpText="Number of points customers will earn"
              />

              <Checkbox
                label="Activate rule"
                checked={formData.isActive}
                onChange={(value) => handleFormChange("isActive", value)}
                helpText="Enable or disable this rule"
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        title="Delete Reward Rule"
        primaryAction={{
          content: "Delete Rule",
          onAction: handleConfirmDelete,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleDeleteModalClose,
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            Are you sure you want to delete the rule "{ruleToDelete?.ruleName}"?
            This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
};

export default EarnRewardsPage;
