const Welcome = ({
  customerRewardData,
  customerId,
}: {
  customerRewardData: number;
  customerId: string;
}) => {
  return (
    <section className="tw-my-4">
      <h2 className="tw-text-4xl tw-m-0 tw-mb-3">Welcome 👋</h2>
      {customerId ? (
        <div className="tw-text-2xl tw-flex tw-flex-col tw-gap-3">
          <p className="tw-m-0">Your points</p>
          <p className="tw-m-0">{customerRewardData}</p>
        </div>
      ) : (
        <button className="tw-bg-sky-400 tw-p-5 tw-rounded-md tw-border-0 tw-w-full tw-text-center tw-text-white tw-font-bold tw-block">
          Login to continue
        </button>
      )}
    </section>
  );
};

export default Welcome;
