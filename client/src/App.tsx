import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import { HomePage } from './pages/HomePage';
import { StudentJoin } from './pages/StudentJoin';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { GameConfiguration } from './pages/GameConfiguration';
import { GameRoom } from './pages/GameRoom';
import { Leaderboard } from './pages/Leaderboard';
import { InstructorManage } from './pages/InstructorManage';
import { RoundHistory } from './pages/RoundHistory';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/student/join" element={<StudentJoin />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/configure" element={<GameConfiguration />} />
          <Route path="/instructor/manage" element={<InstructorManage />} />
          <Route path="/game/room" element={<GameRoom />} />
          <Route path="/game/history" element={<RoundHistory />} />
          <Route path="/game/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;