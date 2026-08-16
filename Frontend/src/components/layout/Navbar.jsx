import {
  Link,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { initials } from "../../utils/format";

const TITLES = {
  "/dashboard":
    "Dashboard",

  "/admin/dashboard":
  "Admin dashboard",

  "/admin/users":
  "User management",

  "/admin/tariffs":
  "Tariff management",
  "/households":
    "Household",

  "/rooms":
    "Rooms",

  "/appliances":
    "Appliances",

  "/usage":
    "Daily usage",

  "/daily-usage":
    "Daily usage",

  "/bills":
    "Electricity bills",

  "/predictions":
    "Predictions",

  "/analytics":
    "Analytics",

  "/budget":
    "Budget",

  "/goals":
    "Energy goals",

  "/recommendations":
    "Recommendations",

  "/notifications":
    "Notifications",

  "/profile":
    "Profile",
};

export default function Navbar({
  onOpenSidebar,
  unreadCount = 0,
}) {
  const { user } =
    useAuth();

  const { pathname } =
    useLocation();

  const title =
    TITLES[pathname] ||
    "Electricity Bill Predictor";

  const displayName =
    user?.firstName ||
    user?.email ||
    "Account";

  const avatarText =
    user?.firstName
      ? initials(
          user.firstName,
          user.lastName
        )
      : user?.email
        ?.charAt(0)
        ?.toUpperCase() ||
        "U";

  return (
    <header className="navbar">
      <button
        type="button"
        className="icon-btn navbar-menu-btn"
        onClick={
          onOpenSidebar
        }
        aria-label="Open menu"
      >
        ☰
      </button>

      <span className="navbar-title">
        {title}
      </span>

      <span className="navbar-spacer" />

      <Link
        to="/notifications"
        className="icon-btn bell"
        aria-label="Notifications"
      >
        ◉

        {unreadCount > 0 && (
          <span className="bell-dot">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </Link>

      <Link
        to="/profile"
        className="user-chip"
      >
        <span className="user-name">
          {displayName}
        </span>

        <span
          className="avatar"
          aria-hidden="true"
        >
          {avatarText}
        </span>
      </Link>
    </header>
  );
}