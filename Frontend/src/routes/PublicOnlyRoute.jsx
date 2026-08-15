import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

/** Keeps a signed-in user off /login and /register. */
export default function PublicOnlyRoute() {
  const { authenticated, initialising } = useAuth();

  if (initialising) return <LoadingSpinner label="Loading" />;
  if (authenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
