import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {}, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <p className="">Test page</p>
    </div>
  );
}

export default App;
