import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { useSocket } from "../../socket";

export default function CournotGamePage() {
  const socket = useSocket();

  const [userQuantity, setUserQuantity] = useState<number>(0);
  const [marketPrice, setMarketPrice] = useState<number>(0);
  const [userProfit, setUserProfit] = useState<number>(0);
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [z, setZ] = useState<number>(0);

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (userQuantity) {
      const marketPrice = calculateMarketPrice(x, userQuantity);
      setMarketPrice(marketPrice);
    }

    // emits
    if (userQuantity) {
      socket.emit("player:move", { action: userQuantity });
    }

    socket.emit("player:getGameData");

    //listeners
    socket.on("server:cournotInfo", (data) => {
      console.log("cournot info", data);
      setX(data.x);
      setY(data.y);
      setZ(data.z);
    });

    // cleanup
    return () => {
      socket.off("server:cournotInfo");
    };
  }, [socket, userQuantity]);

  const handleNumberInput =
    (setFunction: (value: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d*$/.test(value)) {
        setFunction(Number(value));
      }
    };

  return (
    <Layout showHeader={true} title="Cournot Game">
      <div>Cournot game page</div>
      <p>x: {x}</p>
      <p>y: {y}</p>
      <p>z: {z}</p>
      <p>user profit: {userProfit}</p>
      <p>market price: {marketPrice}</p>
      <input
        id="userQuantity"
        type="text"
        value={userQuantity}
        onChange={handleNumberInput(setUserQuantity)}
        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        inputMode="numeric"
        pattern="[0-9]*"
      />
      <button onClick={() => setUserQuantity(userQuantity)}>
        Set Quantity
      </button>
    </Layout>
  );
}

const calculateMarketPrice = (x: number, totalMarketProduction: number) => {
  return x - totalMarketProduction;
};
