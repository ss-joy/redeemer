import {
  Page,
  Card,
  Text,
  EmptyState,
  Layout,
  Box,
  BlockStack,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";

const EarnRewardsPage = () => {
  return (
    <Page
      title="Earn Rewards"
      subtitle="This page will give you a detailed view of all the activities a shopper can perform related to your store or business to earn rewards (points or credits)."
      primaryAction={{
        content: "Add ways to earn",
        icon: PlusIcon,
        onAction: () => console.log("Add ways to earn clicked"),
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
                    You can add, delete, modify, and customize the rule setup to
                    best suit your brand, product category, and customer
                    segment. The main objective of setting up ways to earn
                    rewards is to incentivize your shoppers to interact and
                    engage with your store, thereby increasing your store's
                    reach, sales volume, and revenue.
                  </Text>
                </BlockStack>
              </EmptyState>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default EarnRewardsPage;
