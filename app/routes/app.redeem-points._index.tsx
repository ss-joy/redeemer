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
import redemptionRulesService from "app/services/redemption-rules.service";
import { useState, useCallback } from "react";
import type { RedemptionRuleType } from "@prisma/client";

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
            const {
              ruleType,
              ruleName,
              pointsRequiredForRedemption,
              discountPercentage,
              isActive,
            } = data;
            await redemptionRulesService.updateRedemptionRuleByShopId(
              admin,
              ruleType as RedemptionRuleType,
              String(isActive) === "true",
              +pointsRequiredForRedemption,
              +discountPercentage,
              ruleName as string,
            );
            break;

          case "delete-rule":
            const { ruleTypeToDelete } = data;
            await redemptionRulesService.deleteRedemptionRuleByShopId(
              admin,
              ruleTypeToDelete as RedemptionRuleType,
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
    const shopRedemptionRules =
      await redemptionRulesService.getAllRedemptionRulesByShopId(admin);
    return SuccessResponseWithCors({
      request,
      data: {
        shopRedemptionRules: shopRedemptionRules,
      },
    });
  } catch (error) {
    return ErrorResponseWithCors({ request, error });
  }
}

const RedeemPointsPage = () => {
  const loaderData = useLoaderData<typeof loader>();

  const {
    data: { shopRedemptionRules },
  } = loaderData;

  const navigate = useNavigate();
  const submit = useSubmit();

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [ruleToDelete, setRuleToDelete] = useState<any>(null);
  const [formData, setFormData] = useState({
    ruleName: "",
    pointsRequiredForRedemption: "100",
    discountPercentage: "5",
    isActive: false,
  });

  console.log(shopRedemptionRules);

  // Handler functions
  const handleEditRule = useCallback((rule: any) => {
    setSelectedRule(rule);
    setFormData({
      ruleName: rule.ruleName,
      pointsRequiredForRedemption: rule.pointsRequiredForRedemption.toString(),
      discountPercentage: rule.discountPercentage.toString(),
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
      ORDER_DISCOUNT: "Order Discount",
    };
    return typeMap[ruleType] || ruleType;
  };

  // Helper function to format discount display
  const formatDiscount = (discountPercentage: number) => {
    return `${discountPercentage}% discount`;
  };

  // Prepare table data
  const tableRows = shopRedemptionRules.map((rule: any, index: number) => [
    `${index + 1}. ${rule.ruleName}`,
    formatRuleType(rule.ruleType),
    `${rule.pointsRequiredForRedemption} points`,
    formatDiscount(rule.discountPercentage),
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
    "Points Required",
    "Discount",
    "Status",
    "Action",
  ];

  return (
    <Page
      title="Redeem Points"
      subtitle="Manage how customers can redeem their loyalty points for rewards and discounts."
      primaryAction={{
        content: "Add redemption method",
        icon: PlusIcon,
        onAction: () => navigate("/app/redeem-points/rules"),
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
          {shopRedemptionRules && shopRedemptionRules.length > 0 ? (
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
                footerContent={`Page 1 of 1 with ${shopRedemptionRules.length} total results`}
              />
            </Card>
          ) : (
            <Card>
              <Box padding="800">
                <EmptyState
                  heading="Redeem Points"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <BlockStack gap="400">
                    <Text as="p" variant="bodyMd" alignment="start">
                      This page will give you a detailed view of all the
                      redemption methods customers can use to redeem their
                      loyalty points for rewards and discounts.
                    </Text>

                    <Text as="p" variant="bodyMd" alignment="start">
                      You can add, delete, modify, and customize redemption
                      rules to best suit your brand, product category, and
                      customer segment. The main objective of setting up
                      redemption methods is to provide valuable rewards that
                      encourage repeat purchases and customer loyalty.
                    </Text>

                    <Text as="p" variant="bodyMd" alignment="start">
                      Setting up redemption rules helps increase customer
                      retention, average order value, and overall customer
                      satisfaction with your loyalty program.
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
        title="Edit Redemption Rule"
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
                options={[{ label: "Order Discount", value: "ORDER_DISCOUNT" }]}
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
                label="Points Required for Redemption"
                type="number"
                value={formData.pointsRequiredForRedemption}
                onChange={(value) =>
                  handleFormChange("pointsRequiredForRedemption", value)
                }
                placeholder="100"
                autoComplete="off"
                helpText="Number of points required to redeem this reward"
              />

              <TextField
                label="Discount Percentage"
                type="number"
                value={formData.discountPercentage}
                onChange={(value) =>
                  handleFormChange("discountPercentage", value)
                }
                placeholder="5"
                autoComplete="off"
                helpText="Percentage discount customers will receive"
                suffix="%"
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
        title="Delete Redemption Rule"
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

export default RedeemPointsPage;
