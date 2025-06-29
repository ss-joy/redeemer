import { motion } from "motion/react";

const LeftChevronIcon = ({ onClick }: { onClick: () => void }) => {
  return (
    <motion.svg
      whileHover={{
        x: 4,
        scale: 1.8,
      }}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className={"tw-size-7 hover:tw-cursor-pointer tw-relative tw-right-2"}
    >
      <path d="m15 18-6-6 6-6" />
    </motion.svg>
  );
};

export default LeftChevronIcon;
