import "./App.css";
import { Routes, Route } from "react-router-dom";
import { SocketProvider } from "./socket";

// Both
import Home from "./pages/Home";

// Instructor pages
import InstructorLogin from "./pages/Instructor/InstructorLogin";
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
import CreateJankenpoGamePage from "./pages/Instructor/CreateJankenpoGamePage";
import GameDashboard from "./pages/Instructor/GameDashboard";

// Student pages
import StudentJoin from "./pages/Student/StudentJoin";
import JanKenPoPage from "./pages/Games/JanKenPoPage";
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
          path="/instructor/create/jankenpo"
          element={
            <SocketProvider>
              <CreateJankenpoGamePage />
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
