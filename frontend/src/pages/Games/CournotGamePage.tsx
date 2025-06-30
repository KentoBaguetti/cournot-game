import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/Button";
import { useSocket } from "../../socket";

export default function CournotGamePage() {
  const socket = useSocket();

  const [userQuantity, setUserQuantity] = useState<number>(0);
  const [marketPrice, setMarketPrice] = useState<number>(0);
  const [userProfit, setUserProfit] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [recievedGameData, setRecievedGameData] = useState<boolean>(false);
  const [roundNo, setRoundNo] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
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
    if (userQuantity && isReady) {
      socket.emit("player:move", { action: userQuantity });
    }

    if (!isReady) {
      socket.emit("player:unready");
    }

    if (!recievedGameData) {
      socket.emit("player:getGameData");
      setRecievedGameData(true);
    }

    //listeners
    socket.on("server:cournotInfo", (data) => {
      console.log("cournot info", data);
      setX(data.x);
      setY(data.y);
      setZ(data.z);
    });

    socket.on("server:userRoundEnd", ({ userProfit }) => {
      setUserProfit(userProfit);
    });

    socket.on("server:roundStart", ({ roundNo }) => {
      setRoundNo(roundNo);
    });

    socket.on("server:timerUpdate", ({ remainingTime }) => {
      setTimeRemaining(remainingTime);
      const [minutes, seconds] = parseTimeRemaining(remainingTime);
      setMinutes(minutes);
      setSeconds(seconds);
    });

    // cleanup
    return () => {
      socket.off("server:cournotInfo");
      socket.off("server:userRoundEnd");
      socket.off("server:roundStart");
      socket.off("server:timerUpdate");
    };
  }, [
    socket,
    userQuantity,
    x,
    isReady,
    recievedGameData,
    roundNo,
    timeRemaining,
  ]);

  const handleNumberInput =
    (setFunction: (value: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d*$/.test(value)) {
        setFunction(Number(value));
      }
    };

  // parse the remaining seconds into minutes and seconds
  const parseTimeRemaining = (remainingTime: number): [number, number] => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return [minutes, seconds];
  };

  return (
    <Layout showHeader={true} title="Cournot Game">
      <div className="">
        <div>Cournot game page</div>
        <p>Round: {roundNo}</p>
        <p>Time Remaining Raw: {timeRemaining}</p>
        <p>
          Time Remaining: {minutes}:{seconds.toString().padStart(2, "0")}
        </p>
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
          disabled={isReady}
        />
        <Button
          onClick={() => {
            setUserQuantity(userQuantity);
            setIsReady(!isReady);
            console.log(userQuantity);
          }}
        >
          {isReady ? "Unconfirm" : "Confirm"}
        </Button>
      </div>
    </Layout>
  );
}

// this helper method will be for the market price calculator to aid students
const calculateMarketPrice = (x: number, totalMarketProduction: number) => {
  return x - totalMarketProduction;
};
