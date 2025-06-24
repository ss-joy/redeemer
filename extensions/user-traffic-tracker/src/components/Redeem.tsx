import axios from "axios";
import { backendUrl } from "../util/index.util";

const Redeem = ({
  shopId,
  customerId,
  shopName,
}: {
  shopId: string | undefined;
  customerId: string | undefined;
  shopName: string | undefined;
}) => {
  async function generateCouponCode() {
    if (!shopId || !customerId) {
      console.error("Shop ID or Customer ID is missing");
      return;
    }
    const data = await axios.post(`${backendUrl}/app/api/coupon`, {
      shopId,
      customerId,
      actionType: "createCoupon",
      shopName,
    });
    console.log(data);
  }
  return (
    <div className="tw-space-y-3 tw-mb-6 ">
      <button
        className="tw-p-2 tw-bg-white tw-rounded-lg tw-text-blue-500 tw-text-center"
        onClick={() => generateCouponCode()}
      >
        Redeem
      </button>
    </div>
  );
};

export default Redeem;
