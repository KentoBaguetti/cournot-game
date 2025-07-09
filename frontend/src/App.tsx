import "./App.css";
import { Routes, Route } from "react-router-dom";
import { SocketProvider } from "./socket";
import ProtectedRoute from "./pages/ProtectedRoute";
import Home from "./pages/Home";

// instructor pages
import InstructorLogin from "./pages/Instructor/InstructorLogin";
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
import GameDashboard from "./pages/Instructor/GameDashboard";
import DisplayGameInfoPage from "./pages/Instructor/DisplayGameInfoPage";

// Student pages
import StudentJoin from "./pages/Student/StudentJoin";
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
            <ProtectedRoute>
              <SocketProvider>
                <InstructorDashboard />
              </SocketProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/gameDashboard"
          element={
            <ProtectedRoute>
              <SocketProvider>
                <GameDashboard />
              </SocketProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/create/cournot"
          element={
            <ProtectedRoute>
              <SocketProvider>
                <CreateCournotGamePage />
              </SocketProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/displayGameInfo"
          element={
            <ProtectedRoute>
              <SocketProvider>
                <DisplayGameInfoPage />
              </SocketProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/games/jankenpo"
          element={
            <ProtectedRoute>
              <SocketProvider>
                <JanKenPoPage />
              </SocketProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/games/cournot"
          element={
            <ProtectedRoute>
              <SocketProvider>
                <CournotGamePage />
              </SocketProvider>
            </ProtectedRoute>
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
