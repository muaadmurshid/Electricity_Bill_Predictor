import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const USER_NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: "◱",
      },
    ],
  },
  {
    label: "My home",
    items: [
      {
        to: "/households",
        label: "Household",
        icon: "⌂",
      },
      {
        to: "/rooms",
        label: "Rooms",
        icon: "▤",
      },
      {
        to: "/appliances",
        label: "Appliances",
        icon: "⏻",
      },
    ],
  },
  {
    label: "Records",
    items: [
      {
        to: "/usage",
        label: "Daily usage",
        icon: "⏱",
      },
      {
        to: "/bills",
        label: "Electricity bills",
        icon: "▦",
      },
    ],
  },
  {
    label: "Insight",
    items: [
      {
        to: "/predictions",
        label: "Predictions",
        icon: "◈",
      },
      {
        to: "/analytics",
        label: "Analytics",
        icon: "◔",
      },
      {
        to: "/tariff-intelligence",
        label: "Tariff intelligence",
        icon: "₨",
      },
      {
        to: "/recommendations",
        label: "Recommendations",
        icon: "✦",
      },
    ],
  },
  {
    label: "Targets",
    items: [
      {
        to: "/budget",
        label: "Budget",
        icon: "₨",
      },
      {
        to: "/goals",
        label: "Energy goals",
        icon: "◎",
      },
      {
        to: "/notifications",
        label: "Notifications",
        icon: "◉",
      },
    ],
  },
];

const ADMIN_NAV_GROUPS = [
  {
    label: "Administration",
    items: [
      {
        to: "/admin/dashboard",
        label: "Admin dashboard",
        icon: "◱",
      },
      {
        to: "/admin/users",
        label: "User management",
        icon: "◯",
      },
      {
        to: "/admin/tariffs",
        label: "Tariff management",
        icon: "▦",
      },
    ],
  },
];

export default function Sidebar({
  open,
  onNavigate,
  unreadCount = 0,
}) {
  const {
    user,
    logout,
    isAdmin,
  } = useAuth();

  const navigate =
    useNavigate();

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  const groups = isAdmin
    ? ADMIN_NAV_GROUPS
    : USER_NAV_GROUPS;

  return (
    <aside
      className={`sidebar ${
        open
          ? "sidebar-open"
          : ""
      }`}
    >
      <div className="sidebar-brand">
        <span
          className="brand-mark"
          aria-hidden="true"
        >
          <span
            style={{
              height: "7px",
            }}
          />

          <span
            style={{
              height: "11px",
            }}
          />

          <span
            style={{
              height: "15px",
            }}
          />

          <span
            style={{
              height: "20px",
            }}
          />
        </span>

        <span>
          <span className="brand-name">
            Bill Predictor
          </span>

          <br />

          <span className="brand-sub">
            {isAdmin
              ? "Administration"
              : "Home energy"}
          </span>
        </span>
      </div>

      <nav
        className="sidebar-nav"
        aria-label="Main navigation"
      >
        {groups.map(
          (group) => (
            <div
              className="nav-group"
              key={
                group.label
              }
            >
              <p className="nav-group-label">
                {group.label}
              </p>

              <ul>
                {group.items.map(
                  (item) => (
                    <li
                      key={
                        item.to
                      }
                    >
                      <NavLink
                        to={
                          item.to
                        }
                        onClick={
                          onNavigate
                        }
                        className={({
                          isActive,
                        }) =>
                          `nav-link ${
                            isActive
                              ? "nav-link-active"
                              : ""
                          }`
                        }
                      >
                        <span
                          className="nav-icon"
                          aria-hidden="true"
                        >
                          {
                            item.icon
                          }
                        </span>

                        {
                          item.label
                        }

                        {!isAdmin &&
                          item.to ===
                            "/notifications" &&
                          unreadCount >
                            0 && (
                            <span className="nav-count">
                              {
                                unreadCount >
                                99
                                  ? "99+"
                                  : unreadCount
                              }
                            </span>
                          )}
                      </NavLink>
                    </li>
                  )
                )}
              </ul>
            </div>
          )
        )}
      </nav>

      <div className="sidebar-foot">
        <NavLink
          to="/profile"
          onClick={
            onNavigate
          }
          className={({
            isActive,
          }) =>
            `nav-link ${
              isActive
                ? "nav-link-active"
                : ""
            }`
          }
        >
          <span
            className="nav-icon"
            aria-hidden="true"
          >
            ◯
          </span>

          {user
            ? `${user.firstName || ""} ${
                user.lastName || ""
              }`.trim() ||
              user.email
            : "Profile"}
        </NavLink>

        <button
          type="button"
          className="nav-link"
          onClick={
            handleLogout
          }
        >
          <span
            className="nav-icon"
            aria-hidden="true"
          >
            ⇥
          </span>

          Log out
        </button>
      </div>
    </aside>
  );
}