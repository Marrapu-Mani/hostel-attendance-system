import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ScanAttendancePage from "./pages/ScanAttendance";
import AdminDashboardPage from "./pages/AdminDashboard";

import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();

  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";

  return (
    <Router>
      <Routes>
        {/* Home Route */}
        <Route
          path="/"
          element={
            user ? (
              isStudent ? (
                <Dashboard />
              ) : isAdmin ? (
                <Navigate to="/admin" />
              ) : null
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        {/* Register Route */}
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />

        {/* Admin Route (Admin only) */}
        <Route
          path="/admin"
          element={
            user && isAdmin ? <AdminDashboardPage /> : <Navigate to="/" />
          }
        />

        <Route
          path="/scan"
          element={
            user && isAdmin ? <ScanAttendancePage /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
