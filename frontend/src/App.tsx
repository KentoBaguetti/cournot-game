import "./App.css";
import { Routes, Route } from "react-router-dom";
import { SocketProvider } from "./socket";
import Home from "./pages/Home";
import StudentJoin from "./pages/Student/StudentJoin";
import InstructorLogin from "./pages/Instructor/InstructorLogin";

// non test shit
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";

import GameDashboard from "./pages/Instructor/GameDashboard";
import DisplayGameInfoPage from "./pages/Instructor/DisplayGameInfoPage";

// Student pages
import GameLobby from "./pages/Student/GameLobby";

// create game pages
import CreateCournotGamePage from "./pages/Instructor/CreateCournotGamePage";

// game pages
import JanKenPoPage from "./pages/Games/JanKenPoPage";
import CournotGamePage from "./pages/Games/CournotGamePage";

function App() {
  return (
    <div className="min-h-screen bg-blue-50">
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
          path="/instructor/create/cournot"
          element={
            <SocketProvider>
              <CreateCournotGamePage />
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
          path="/games/cournot"
          element={
            <SocketProvider>
              <CournotGamePage />
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
