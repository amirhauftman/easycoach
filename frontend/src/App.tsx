import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MatchDetail from './pages/MatchDetail';
import PlayerDetail from './pages/PlayerDetail';
import PlayersPage from './pages/PlayersPage';
import VideoPage from './pages/VideoPage';
import MatchesPage from './pages/MatchesPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MatchesPage />} />
      <Route path="/matches" element={<MatchesPage />} />
      <Route path="/matches/:matchId" element={<MatchDetail />} />
      <Route path="/matches/:matchId/video" element={<VideoPage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/players/:playerId" element={<PlayerDetail />} />
    </Routes>
  );
};

export default App;