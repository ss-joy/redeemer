import { useEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const divElement = document.getElementById("app-data-store");
  }, []);

  return (
    <>
      <div className="card">
        <button
          className="tw-bg-blue-500 tw-p-2 tw-rounded-lg tw-m-4 w-[300px] tw-text-white tw-border-0 tw-animate-bounce"
          onClick={() => {
            setCount((count) => count + 1);
          }}
        >
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;
