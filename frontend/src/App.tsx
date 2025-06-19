import "./App.css";
import { Routes, Route } from "react-router-dom";
import { SocketProvider } from "./socket";
import Home from "./pages/Home";
import StudentJoin from "./pages/StudentJoin";
import InstructorJoin from "./pages/InstructorJoin";
// import InstructorDashboard from "./pages/InstructorDashboard";
import StudentGamePage from "./pages/StudentGamePage";
import InstructorLogin from "./pages/Instructor/InstructorLogin";
import JanKenPoPage from "./pages/JanKenPoPage";

// non test shit
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
import CreateGamePage from "./pages/Instructor/CreateGamePage";
import CreateJankenpoGamePage from "./pages/Instructor/CreateJankenpoGamePage";

function App() {
  // const [message, setMessage] = useState("");
  // const [inputValue, setInputValue] = useState("");

  // useEffect(() => {
  //   socket.on("server-response", (data) => {
  //     setMessage(data);
  //   });

  //   return () => {
  //     socket.off("server-response");
  //   };
  // }, []);

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   socket.emit("client-message", inputValue);
  //   setInputValue("");
  // };

  // const createAndJoinGame = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   socket.emit("game:create", { roomId: "testgame1", gameType: "testgame" });
  // };

  // const joinGame = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   socket.emit("game:join", { roomId: "testgame1", host: false });
  // };

  // const handleCheckUsers = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   socket.emit("game:checkRoles", { roomId: "testgame1" });
  // };

  // const expandGameSize = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   socket.emit("game:expandSize", {
  //     roomId: "testgame1",
  //     setting: "maxPlayers",
  //     size: 3,
  //   });
  // };

  return (
    <div className="">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<InstructorLogin />} />

        <Route path="/student" element={<StudentJoin />} />

        <Route
          path="/instructor"
          element={
            <SocketProvider>
              <InstructorJoin />
            </SocketProvider>
          }
        />

        <Route
          path="/instructorDashboard"
          element={
            <SocketProvider>
              <InstructorDashboard />
            </SocketProvider>
          }
        />

        <Route
          path="/instructor/createGame/:gameId"
          element={
            <SocketProvider>
              <CreateGamePage />
            </SocketProvider>
          }
        />

        <Route
          path="/instructor/create/jankenpo"
          element={
            <SocketProvider>
              <CreateJankenpoGamePage />
            </SocketProvider>
          }
        />

        <Route
          path="/studentGame"
          element={
            <SocketProvider>
              <StudentGamePage />
            </SocketProvider>
          }
        />
        <Route
          path="/janKenPo"
          element={
            <SocketProvider>
              <JanKenPoPage />
            </SocketProvider>
          }
        />
      </Routes>
      {/* <p className="">Test page</p>
      <p>{message}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <form onSubmit={createAndJoinGame}>
        <p>Create a Test game</p>
        <button type="submit">Create Test game and join the game</button>
      </form>
      <form onSubmit={joinGame}>
        <p>join game</p>
        <button type="submit">join the game</button>
      </form>
      <form onSubmit={handleCheckUsers}>
        <p>Check users</p>
        <button type="submit">Check users</button>
      </form>
      <form onSubmit={expandGameSize}>
        <button type="submit">expand game size</button>
      </form> */}
    </div>
  );
}

export default App;
