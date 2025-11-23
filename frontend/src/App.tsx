import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/layout/Header';
import Breadcrumb from './components/common/Breadcrumb';
import ToastContainer from './components/common/ToastContainer';
import Loading from './components/common/Loading';
import './components/common/Breadcrumb.css';

// Lazy load page components for code splitting
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const MatchDetail = lazy(() => import('./pages/MatchDetail'));
const VideoPage = lazy(() => import('./pages/VideoPage'));
const PlayerDetail = lazy(() => import('./pages/PlayerDetail'));

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <ToastContainer />
      <main className="main-content">
        <div className="content-container">
          <Breadcrumb />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<MatchesPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/matches/:matchId" element={<MatchDetail />} />
              <Route path="/matches/:matchId/video" element={<VideoPage />} />
              <Route path="/players/:playerId" element={<PlayerDetail />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default App;