import "./App.css";
import { Routes, Route } from "react-router-dom";
import { SocketProvider } from "./socket";
import Home from "./pages/Home";
import StudentJoin from "./pages/Student/StudentJoin";
import InstructorLogin from "./pages/Instructor/InstructorLogin";
import JanKenPoPage from "./pages/Games/JanKenPoPage";

// non test shit
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
import CreateJankenpoGamePage from "./pages/Instructor/CreateJankenpoGamePage";
import GameDashboard from "./pages/Instructor/GameDashboard";
import DisplayGameInfoPage from "./pages/Instructor/DisplayGameInfoPage";

// Student pages

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
          path="/instructor/create/jankenpo"
          element={
            <SocketProvider>
              <CreateJankenpoGamePage />
            </SocketProvider>
          }
        />

        <Route
          path="/instructor/displayGameInfo"
          element={
            <SocketProvider>
              <DisplayGameInfoPage />
            </SocketProvider>
          }
        />

        <Route
          path="/games/jankenpo"
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
    </div>
  );
}

export default App;
