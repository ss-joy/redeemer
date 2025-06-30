import type { RedemptionRuleType } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Tabs,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Icon,
  Link,
  Modal,
  Form,
  FormLayout,
  TextField,
  Select,
  Checkbox,
} from "@shopify/polaris";
import { DiscountIcon } from "@shopify/polaris-icons";
import {
  ErrorResponseWithCors,
  SuccessResponseWithCors,
} from "app/lib/response.app.lib";
import redemptionRulesService from "app/services/redemption-rules.service";
import { authenticate } from "app/shopify.server";
import { useState, useCallback, useMemo } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { admin } = await authenticate.admin(request);
    const shopRedemptionRules =
      await redemptionRulesService.getActiveRedemptionRulesByShopId(admin);
    console.log("redemption rules loader data=>", shopRedemptionRules);
    return SuccessResponseWithCors({
      request,
      data: {
        shopRedemptionRules: shopRedemptionRules,
      },
    });
  } catch (error) {
    return ErrorResponseWithCors({
      request,
      error: error,
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { admin } = await authenticate.admin(request);

    const fd = await request.formData();
    const data = Object.fromEntries(fd);
    const reqMethod = request.method.toUpperCase();
    console.log(
      "redemption rules action hit with data=>",
      new Date().toLocaleTimeString(),
    );

    switch (reqMethod) {
      case "POST":
        const {
          actionType,
          ruleType,
          ruleName,
          pointsRequiredForRedemption,
          discountPercentage,
          isActive,
        } = data;

        switch (actionType) {
          case "create-rule":
            await redemptionRulesService.createRedemptionRule(
              admin,
              ruleType as RedemptionRuleType,
              ruleName as string,
              +pointsRequiredForRedemption,
              +discountPercentage,
            );
            break;

          case "edit-rule":
            await redemptionRulesService.updateRedemptionRuleByShopId(
              admin,
              ruleType as RedemptionRuleType,
              String(isActive) === "true",
              +pointsRequiredForRedemption,
              +discountPercentage,
              ruleName as string,
            );
            break;
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

const RedemptionRulesPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRuleType, setSelectedRuleType] = useState<string>("");

  const [formData, setFormData] = useState({
    ruleName: "",
    pointsRequiredForRedemption: "100",
    discountPercentage: "5",
    isActive: false,
  });
  const submit = useSubmit();

  const loaderData = useLoaderData<typeof loader>();

  const {
    data: { shopRedemptionRules },
  } = loaderData;

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  const handleEditRule = useCallback((rule: any) => {
    const existingRule = rule.hasRule;
    if (existingRule) {
      setSelectedRuleType(existingRule.ruleType);
      setFormData({
        ruleName: existingRule.ruleName,
        pointsRequiredForRedemption:
          existingRule.pointsRequiredForRedemption.toString(),
        discountPercentage: existingRule.discountPercentage.toString(),
        isActive: existingRule.isActive,
      });
      setIsModalOpen(true);
    }
  }, []);

  const handleCreateRule = useCallback((ruleType: string) => {
    // Map rule IDs to proper rule type values
    const ruleTypeMapping: { [key: string]: string } = {
      "order-discount": "ORDER_DISCOUNT",
    };

    const mappedRuleType = ruleTypeMapping[ruleType] || ruleType;
    setSelectedRuleType(mappedRuleType);

    // Set default rule name based on the selected rule
    const ruleNames: { [key: string]: string } = {
      ORDER_DISCOUNT: "Order Discount Redemption",
    };

    setFormData({
      ruleName: ruleNames[mappedRuleType] || "",
      pointsRequiredForRedemption: "100",
      discountPercentage: "5",
      isActive: true,
    });

    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRuleType("");
  }, []);

  const handleFormSubmit = useCallback(() => {
    // Check if we're editing an existing rule
    const existingRule = shopRedemptionRules.find(
      (rule: any) => rule.ruleType === selectedRuleType,
    );

    const data = {
      ruleType: selectedRuleType,
      ...formData,
      actionType: existingRule ? "edit-rule" : "create-rule",
      ...(existingRule && { ruleId: existingRule.id }),
    };

    console.log("Form submitted with data=>", data);
    submit(data, {
      method: "POST",
    });

    setIsModalOpen(false);
  }, [selectedRuleType, formData, submit, shopRedemptionRules]);

  const handleFormChange = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const ruleTypeOptions: {
    label: string;
    value: RedemptionRuleType;
  }[] = [{ label: "Order Discount", value: "ORDER_DISCOUNT" }];

  const tabs = [
    {
      id: "all",
      content: "All",
      panelID: "all-panel",
    },
    {
      id: "core-rules",
      content: "Core Rules",
      panelID: "core-rules-panel",
    },
    {
      id: "advanced-rules",
      content: "Advanced Rules",
      panelID: "advanced-rules-panel",
    },
  ];

  const redemptionRules = useMemo(() => {
    const redemptionRulesWithoutHasRule = [
      {
        id: "order-discount",
        title: "Order Discount",
        ruleType: "ORDER_DISCOUNT",
        description:
          "Customers can redeem points for a percentage discount on their order.",
        icon: DiscountIcon,
        learnMoreUrl: "#",
        category: "core",
      },
    ];
    return redemptionRulesWithoutHasRule.map((rule) => ({
      ...rule,
      hasRule: shopRedemptionRules.find((shopRule: any) => {
        return shopRule.ruleType === rule.ruleType;
      }),
    }));
  }, [shopRedemptionRules]);

  // Filter rules based on selected tab
  const getFilteredRules = () => {
    switch (selectedTab) {
      case 0: // All
        return redemptionRules;
      case 1: // Core Rules
        return redemptionRules.filter((rule) => rule.category === "core");
      case 2: // Advanced Rules
        return redemptionRules.filter((rule) => rule.category === "advanced");
      default:
        return redemptionRules;
    }
  };

  const filteredRules = getFilteredRules();

  const RuleCard = ({ rule }: { rule: (typeof redemptionRules)[0] }) => (
    <Card>
      <div style={{ padding: "16px" }}>
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack align="start" blockAlign="center" gap="400">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "24px",
              }}
            >
              <Icon source={rule.icon} />
            </div>
            <BlockStack gap="200">
              <Text variant="headingMd" as="h3">
                {rule.title}
              </Text>
              <Text tone="subdued" as="p">
                {rule.description}
              </Text>
              <Link url={rule.learnMoreUrl}>Learn more here.</Link>
            </BlockStack>
          </InlineStack>
          {rule.hasRule ? (
            <Button
              variant={"secondary"}
              size="medium"
              onClick={() => handleEditRule(rule)}
            >
              Edit Rule
            </Button>
          ) : (
            <Button
              variant={"primary"}
              size="medium"
              onClick={() => handleCreateRule(rule.id)}
            >
              Create Rule
            </Button>
          )}
        </InlineStack>
      </div>
    </Card>
  );

  const EmptyState = ({ tabName }: { tabName: string }) => (
    <Card>
      <div style={{ padding: "40px", textAlign: "center" }}>
        <BlockStack gap="300" align="center">
          <Text variant="headingMd" as="h3" tone="subdued">
            No {tabName} rules yet
          </Text>
          <Text tone="subdued" as="p">
            {tabName} rules will appear here when they're created.
          </Text>
        </BlockStack>
      </div>
    </Card>
  );

  return (
    <Page
      title="Redemption Methods"
      backAction={{
        url: "/app/redeem-points",
      }}
    >
      <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
        <div style={{ padding: "20px 0" }}>
          <BlockStack gap="400">
            {filteredRules.length > 0 ? (
              filteredRules.map((rule) => (
                <RuleCard key={rule.id} rule={rule} />
              ))
            ) : (
              <EmptyState
                tabName={
                  selectedTab === 1
                    ? "Core"
                    : selectedTab === 2
                      ? "Advanced"
                      : "Redemption"
                }
              />
            )}
          </BlockStack>
        </div>
      </Tabs>

      {/* Create/Edit Rule Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleModalClose}
        title={
          shopRedemptionRules.find(
            (rule: any) => rule.ruleType === selectedRuleType,
          )
            ? "Edit Redemption Rule"
            : "Create Redemption Rule"
        }
        primaryAction={{
          content: shopRedemptionRules.find(
            (rule: any) => rule.ruleType === selectedRuleType,
          )
            ? "Update Rule"
            : "Create Rule",
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
                options={ruleTypeOptions}
                value={selectedRuleType}
                onChange={(value) => setSelectedRuleType(value)}
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
                label="Activate rule immediately"
                checked={formData.isActive}
                onChange={(value) => handleFormChange("isActive", value)}
                helpText="Rule will start working immediately after creation"
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Page>
  );
};

export default RedemptionRulesPage;
