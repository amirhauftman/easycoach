import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/layout/Header';
import Breadcrumb from './components/common/Breadcrumb';
import MatchDetail from './pages/MatchDetail';
import PlayerDetail from './pages/PlayerDetail';
import VideoPage from './pages/VideoPage';
import MatchesPage from './pages/MatchesPage';
import './components/common/Breadcrumb.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="content-container">
          <Breadcrumb />
          <Routes>
            <Route path="/" element={<MatchesPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:matchId" element={<MatchDetail />} />
            <Route path="/matches/:matchId/video" element={<VideoPage />} />
            <Route path="/players/:playerId" element={<PlayerDetail />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;