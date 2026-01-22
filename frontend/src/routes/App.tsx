import { Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import LoginPage from '../pages/LoginPage';
import TermsPage from '../pages/TermsPage';
import HangoutsListPage from '../pages/HangoutsListPage';
import HangoutsCreatePage from '../pages/HangoutsCreatePage';
import HangoutsRoomPage from '../pages/HangoutsRoomPage';
import VideoramaPage from '../pages/VideoramaPage';
import VideoramaCreatePage from '../pages/VideoramaCreatePage';
import VideoramaEditPage from '../pages/VideoramaEditPage';
import ProtectedRoute from './ProtectedRoute';

const App = () => (
  <Layout>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/terms" element={<TermsPage />} />
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
          <ProtectedRoute requiredAction="hangouts.create">
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
          <ProtectedRoute requiredAction="videorama.create">
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
      <Route path="*" element={<LoginPage />} />
    </Routes>
  </Layout>
);

export default App;
