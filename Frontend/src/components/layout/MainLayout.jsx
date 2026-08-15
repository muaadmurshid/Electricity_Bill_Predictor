import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * Sidebar + content on desktop; the sidebar becomes a slide-over drawer
 * below 900px.
 *
 * The unread notification count is passed down from here so the bell and
 * the sidebar always agree. Wire it up once NotificationController is
 * confirmed — see the note below.
 */
export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const unreadCount = 0;
  // TODO (notifications module): replace the line above with
  //   const [unreadCount, setUnreadCount] = useState(0);
  //   useEffect(() => {
  //     notificationService.unreadCount(householdId).then(setUnreadCount).catch(() => {});
  //   }, [householdId]);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      {sidebarOpen && (
        <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="app-main">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} unreadCount={unreadCount} />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
