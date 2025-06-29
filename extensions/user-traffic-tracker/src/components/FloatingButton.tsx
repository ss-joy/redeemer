import { motion } from "motion/react";

const FloatingButton = ({
  infoOpen,
  onClick,
  customerRewardData,
  customerId,
}: {
  infoOpen: boolean;
  onClick: () => void;
  customerRewardData: number;
  customerId: string;
}) => {
  return (
    <motion.button
      whileTap={{
        scale: [0.9, 1.1, 1],
      }}
      className="tw-w-fit tw-flex tw-justify-center tw-items-center tw-gap-2 tw-p-2 tw-bg-blue-500 tw-rounded-lg tw-text-white tw-border-0 tw-text-2xl"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="tw-size-[2rem]"
      >
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
      </svg>{" "}
      {infoOpen ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      ) : (
        <>Redeemer {customerId ? customerRewardData : null}</>
      )}
    </motion.button>
  );
};

export default FloatingButton;
