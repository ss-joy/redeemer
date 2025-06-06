import { useState } from "react";
import { Toaster, toast } from "sonner";
// import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Toaster richColors />
      <div className="card">
        <button
          onClick={() => {
            setCount((count) => count + 1);

            toast("yooo");
          }}
        >
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;
