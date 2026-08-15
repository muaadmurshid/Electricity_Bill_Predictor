import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

/**
 * Blocks private pages. While the stored session is being read we show a
 * spinner, otherwise a refresh would bounce a logged-in user to /login.
 */
export default function ProtectedRoute() {
  const { authenticated, initialising } = useAuth();
  const location = useLocation();

  if (initialising) return <LoadingSpinner label="Loading your account" />;

  if (!authenticated) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
