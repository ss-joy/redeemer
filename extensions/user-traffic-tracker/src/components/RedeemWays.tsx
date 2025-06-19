import { useState } from "react";

const RedeemWays = () => {
  const [ways, setWays] = useState<string[]>([1, 2, 3, 45]);
  return (
    <div className="tw-space-y-3 tw-mb-6 ">
      {ways.map((way) => {
        return (
          <div className="tw-p-2 tw-bg-white tw-rounded-lg tw-text-blue-500 tw-text-center">
            {way}
          </div>
        );
      })}
    </div>
  );
};

export default RedeemWays;
