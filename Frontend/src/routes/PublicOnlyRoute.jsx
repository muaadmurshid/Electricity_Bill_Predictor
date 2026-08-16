import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute() {
  const {
    authenticated,
    initialising,
    isAdmin,
  } = useAuth();

  if (initialising) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f3f1",
          color: "#3a1111",
        }}
      >
        Loading...
      </div>
    );
  }

  if (authenticated) {
    return (
      <Navigate
        to={
          isAdmin
            ? "/admin/dashboard"
            : "/dashboard"
        }
        replace
      />
    );
  }

  return <Outlet />;
}