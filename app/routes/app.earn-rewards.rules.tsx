import type { RuleType } from "@prisma/client";
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
import {
  CreditCardIcon,
  PersonIcon,
  StoreIcon,
  CalendarIcon,
  ProductIcon,
} from "@shopify/polaris-icons";
import {
  ErrorResponseWithCors,
  SuccessResponseWithCors,
} from "app/lib/response.app.lib";
import rewardRulesService from "app/services/reward-rules.service";
import { authenticate } from "app/shopify.server";
import { useState, useCallback, useMemo } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { admin } = await authenticate.admin(request);
    const shopRules =
      await rewardRulesService.getActiveRewardRulesByShopId(admin);
    console.log("loader data=>", shopRules);
    return SuccessResponseWithCors({
      request,
      data: {
        shopRules: shopRules,
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
    console.log("action hit with data=>", new Date().toLocaleTimeString());

    switch (reqMethod) {
      case "POST":
        const { actionType, ruleType, ruleName, rewardPoints, isActive } = data;

        switch (actionType) {
          case "create-rule":
            await rewardRulesService.createRewardRule(
              admin,
              ruleType as RuleType,
              ruleName as string,
              +rewardPoints,
            );

            break;

          case "edit-rule":
            await rewardRulesService.updateRewardRuleByShopId(
              admin,
              ruleType as RuleType,
              String(isActive) === "true",
              +rewardPoints,
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

const RewardEarnRulesPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRuleType, setSelectedRuleType] = useState<string>("");

  const [formData, setFormData] = useState({
    ruleName: "",
    rewardPoints: "0",
    isActive: false,
  });
  const submit = useSubmit();

  const loaderData = useLoaderData<typeof loader>();

  const {
    data: { shopRules },
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
        rewardPoints: existingRule.rewardPoints.toString(),
        isActive: existingRule.isActive,
      });
      setIsModalOpen(true);
    }
  }, []);

  const handleCreateRule = useCallback((ruleType: string) => {
    // Map rule IDs to proper rule type values
    const ruleTypeMapping: { [key: string]: string } = {
      purchase: "PURCHASE",
      "purchase-subscription": "PURCHASE_SUBSCRIPTION",
      "new-customer": "NEW_CUSTOMER",
      "visit-store": "STORE_VISIT",
      birthday: "BIRTHDAY",
      "buy-specific-product": "BUY_SPECIFIC_PRODUCT",
    };

    const mappedRuleType = ruleTypeMapping[ruleType] || ruleType;
    setSelectedRuleType(mappedRuleType);

    // Set default rule name based on the selected rule
    const ruleNames: { [key: string]: string } = {
      PURCHASE: "Purchase Reward",
      PURCHASE_SUBSCRIPTION: "Subscription Purchase Reward",
      NEW_CUSTOMER: "New Customer Welcome Reward",
      STORE_VISIT: "Store Visit Reward",
      BIRTHDAY: "Birthday Reward",
      BUY_SPECIFIC_PRODUCT: "Specific Product Purchase Reward",
    };

    setFormData({
      ruleName: ruleNames[mappedRuleType] || "",
      rewardPoints: "10",
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
    const existingRule = shopRules.find(
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
  }, [selectedRuleType, formData, submit, shopRules]);

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
    value:
      | RuleType
      | "PURCHASE_SUBSCRIPTION"
      | "PURCHASE"
      | "BIRTHDAY"
      | "BUY_SPECIFIC_PRODUCT";
  }[] = [
    { label: "Purchase", value: "PURCHASE" },
    { label: "Purchase Subscription Product", value: "PURCHASE_SUBSCRIPTION" },
    { label: "New Customer", value: "NEW_CUSTOMER" },
    { label: "Visit Store", value: "STORE_VISIT" },
    { label: "Birthday", value: "BIRTHDAY" },
    { label: "Buy Specific Product", value: "BUY_SPECIFIC_PRODUCT" },
  ];

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
      id: "social-rules",
      content: "Social Rules",
      panelID: "social-rules-panel",
    },
    {
      id: "review-rules",
      content: "Review Rules",
      panelID: "review-rules-panel",
    },
  ];

  const earnRules = useMemo(() => {
    const earnRulesWithoutHasRule = [
      {
        id: "purchase",
        title: "Purchase",
        ruleType: "PURCHASE",
        description:
          "Customers receive points or store credits when they purchase a product.",
        icon: CreditCardIcon,
        learnMoreUrl: "#",
        category: "core",
      },
      {
        id: "purchase-subscription",
        title: "Purchase Subscription Product / Recurring Orders",
        ruleType: "PURCHASE_SUBSCRIPTION",
        description:
          "Customers receive points or store credits when they purchase a subscription product or when a recurring order is placed.",
        icon: CreditCardIcon,
        learnMoreUrl: "#",
        category: "core",
      },
      {
        id: "new-customer",
        title: "New Customer",
        ruleType: "NEW_CUSTOMER",
        description:
          "Customers receive points or store credits when they create an account.",
        icon: PersonIcon,
        learnMoreUrl: "#",
        category: "core",
      },
      {
        id: "visit-store",
        title: "Visit Store",
        ruleType: "STORE_VISIT",
        description:
          "New customers receive points or store credits when they visit your store.",
        icon: StoreIcon,
        learnMoreUrl: "#",
        category: "core",
      },
      {
        id: "birthday",
        title: "Birthday",
        ruleType: "BIRTHDAY",
        description:
          "Customers will receive points or store credits on their birthday.",
        icon: CalendarIcon,
        learnMoreUrl: "#",
        category: "core",
      },
      {
        id: "buy-specific-product",
        title: "Buy Specific Product",
        ruleType: "BUY_SPECIFIC_PRODUCT",
        description:
          "Customers earn points or store credits when they purchase a specific product.",
        icon: ProductIcon,
        learnMoreUrl: "#",
        category: "core",
      },
    ];
    return earnRulesWithoutHasRule.map((rule) => ({
      ...rule,
      hasRule: shopRules.find((shopRule: any) => {
        return shopRule.ruleType === rule.ruleType;
      }),
    }));
  }, [shopRules]);

  // Filter rules based on selected tab
  const getFilteredRules = () => {
    switch (selectedTab) {
      case 0: // All
        return earnRules;
      case 1: // Core Rules
        return earnRules.filter((rule) => rule.category === "core");
      case 2: // Social Rules
        return earnRules.filter((rule) => rule.category === "social");
      case 3: // Review Rules
        return earnRules.filter((rule) => rule.category === "review");
      default:
        return earnRules;
    }
  };

  const filteredRules = getFilteredRules();

  const RuleCard = ({ rule }: { rule: (typeof earnRules)[0] }) => (
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
      title="Ways to earn"
      backAction={{
        url: "/app/earn-rewards",
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
                  selectedTab === 2
                    ? "Social"
                    : selectedTab === 3
                      ? "Review"
                      : "Rules"
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
          shopRules.find((rule: any) => rule.ruleType === selectedRuleType)
            ? "Edit Reward Rule"
            : "Create Reward Rule"
        }
        primaryAction={{
          content: shopRules.find(
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
                label="Reward Points"
                type="number"
                value={formData.rewardPoints}
                onChange={(value) => handleFormChange("rewardPoints", value)}
                placeholder="0"
                autoComplete="off"
                helpText="Number of points customers will earn"
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

export default RewardEarnRulesPage;
