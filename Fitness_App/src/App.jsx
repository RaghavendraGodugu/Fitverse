import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import WorkoutPlan from './pages/WorkoutPlan';
import Exercises from './pages/Exercises';
import Workouts from './pages/Workouts';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Login from './pages/Login';

// Create a client
const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="plan" element={<WorkoutPlan />} />
              <Route path="workouts" element={<Workouts />} />
              <Route path="exercises" element={<Exercises />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
