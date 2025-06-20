import "./App.css";
import { Routes, Route } from "react-router-dom";
import { SocketProvider } from "./socket";
import Home from "./pages/Home";
import StudentJoin from "./pages/Student/StudentJoin";
import StudentGamePage from "./pages/Student/StudentGamePage";
import InstructorLogin from "./pages/Instructor/InstructorLogin";
import JanKenPoPage from "./pages/Games/JanKenPoPage";

// non test shit
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
import CreateGamePage from "./pages/Instructor/CreateGamePage";
import CreateJankenpoGamePage from "./pages/Instructor/CreateJankenpoGamePage";
import GameDashboard from "./pages/Instructor/GameDashboard";
import GameLobby from "./pages/Student/GameLobby";

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<InstructorLogin />} />

        <Route path="/student" element={<StudentJoin />} />

        <Route
          path="/instructorDashboard"
          element={
            <SocketProvider>
              <InstructorDashboard />
            </SocketProvider>
          }
        />

        <Route
          path="/instructor/gameDashboard"
          element={
            <SocketProvider>
              <GameDashboard />
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
        <Route
          path="/student/gameLobby"
          element={
            <SocketProvider>
              <GameLobby />
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
