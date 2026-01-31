import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../components/Layout';
import { LoginPage } from '../pages/LoginPage';
import { TermsPage } from '../pages/TermsPage';
import { HomePage } from '../pages/HomePage';
import { HangoutsListPage } from '../pages/HangoutsListPage';
import { HangoutsCreatePage } from '../pages/HangoutsCreatePage';
import { HangoutsRoomPage } from '../pages/HangoutsRoomPage';
import { VideoramaPage } from '../pages/VideoramaPage';
import { VideoramaCreatePage } from '../pages/VideoramaCreatePage';
import { VideoramaEditPage } from '../pages/VideoramaEditPage';

const App = () => {
  const { refreshMe } = useAuth();

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hangouts"
          element={
            <ProtectedRoute>
              <HangoutsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hangouts/create"
          element={
            <ProtectedRoute requireRole={["PRIME", "ADMIN"]}>
              <HangoutsCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hangouts/room/:roomId"
          element={
            <ProtectedRoute>
              <HangoutsRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videorama"
          element={
            <ProtectedRoute>
              <VideoramaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videorama/create"
          element={
            <ProtectedRoute requireRole={["PRIME", "ADMIN"]}>
              <VideoramaCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videorama/edit/:id"
          element={
            <ProtectedRoute>
              <VideoramaEditPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

export default App;
