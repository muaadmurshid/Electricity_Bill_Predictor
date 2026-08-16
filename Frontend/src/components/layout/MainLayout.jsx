import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import householdService from "../../services/householdService";
import notificationService from "../../services/notificationService";

export default function MainLayout() {
  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const { pathname } =
    useLocation();

  const loadUnreadCount =
    useCallback(async () => {
      try {
        const households =
          await householdService.list();

        const list =
          Array.isArray(households)
            ? households
            : [];

        if (list.length === 0) {
          setUnreadCount(0);
          return;
        }

        const results =
          await Promise.allSettled(
            list.map(
              (household) =>
                notificationService.unreadCount(
                  household.householdId
                )
            )
          );

        const total =
          results.reduce(
            (
              sum,
              result
            ) => {
              if (
                result.status ===
                "fulfilled"
              ) {
                return (
                  sum +
                  Number(
                    result.value ||
                      0
                  )
                );
              }

              return sum;
            },
            0
          );

        setUnreadCount(
          total
        );
      } catch (error) {
        console.error(
          "Failed to load unread notification count:",
          error
        );

        setUnreadCount(0);
      }
    }, []);

  useEffect(() => {
    setSidebarOpen(false);

    loadUnreadCount();
  }, [
    pathname,
    loadUnreadCount,
  ]);

  useEffect(() => {
    function handleNotificationUpdate() {
      loadUnreadCount();
    }

    window.addEventListener(
      "notifications-updated",
      handleNotificationUpdate
    );

    return () => {
      window.removeEventListener(
        "notifications-updated",
        handleNotificationUpdate
      );
    };
  }, [loadUnreadCount]);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onNavigate={() =>
          setSidebarOpen(false)
        }
        unreadCount={
          unreadCount
        }
      />

      {sidebarOpen && (
        <div
          className="sidebar-scrim"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-hidden="true"
        />
      )}

      <div className="app-main">
        <Navbar
          onOpenSidebar={() =>
            setSidebarOpen(true)
          }
          unreadCount={
            unreadCount
          }
        />

        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}