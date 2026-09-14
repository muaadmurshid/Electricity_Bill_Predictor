import {
  useEffect,
  useMemo,
  useState,
} from "react";

import householdService from "../services/householdService";
import notificationService from "../services/notificationService";

function typeLabel(type) {
  switch (type) {
    case "BUDGET_WARNING":
      return "Budget warning";

    case "BUDGET_EXCEEDED":
      return "Budget exceeded";

    case "GOAL_AT_RISK":
      return "Goal at risk";

    case "GOAL_MISSED":
      return "Goal missed";

    default:
      return type || "Notification";
  }
}

function typeClass(type) {
  switch (type) {
    case "BUDGET_WARNING":
      return "notification-type-warning";

    case "BUDGET_EXCEEDED":
      return "notification-type-danger";

    case "GOAL_AT_RISK":
      return "notification-type-warning";

    case "GOAL_MISSED":
      return "notification-type-danger";

    default:
      return "notification-type-neutral";
  }
}

function typeIcon(type) {
  switch (type) {
    case "BUDGET_WARNING":
      return "₨";

    case "BUDGET_EXCEEDED":
      return "!";

    case "GOAL_AT_RISK":
      return "◎";

    case "GOAL_MISSED":
      return "×";

    default:
      return "◉";
  }
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-LK",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export default function Notifications() {
  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadOnly,
    setUnreadOnly,
  ] = useState(false);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  useEffect(() => {
    initialise();
  }, []);

  useEffect(() => {
    if (
      selectedHouseholdId
    ) {
      loadNotifications(
        selectedHouseholdId
      );
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [
    selectedHouseholdId,
    unreadOnly,
  ]);

  async function initialise() {
    try {
      setLoading(true);
      setError("");

      const data =
        await householdService.list();

      const householdList =
        Array.isArray(data)
          ? data
          : [];

      setHouseholds(
        householdList
      );

      if (
        householdList.length >
        0
      ) {
        setSelectedHouseholdId(
          String(
            householdList[0]
              .householdId
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to initialise notifications page:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load households."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadNotifications(
    householdId
  ) {
    try {
      setLoading(true);
      setError("");

      const [
        notificationData,
        countData,
      ] = await Promise.all([
        unreadOnly
          ? notificationService.unread(
              householdId
            )
          : notificationService.listByHousehold(
              householdId
            ),

        notificationService.unreadCount(
          householdId
        ),
      ]);

      setNotifications(
        Array.isArray(
          notificationData
        )
          ? notificationData
          : []
      );

      setUnreadCount(
        Number(
          countData || 0
        )
      );
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReadToggle(
    notification
  ) {
    try {
      setUpdatingId(
        notification.notificationId
      );

      setError("");
      setSuccess("");

      if (
        notification.isRead
      ) {
        await notificationService.markUnread(
          notification.notificationId
        );

        setSuccess(
          "Notification marked as unread."
        );
      } else {
        await notificationService.markRead(
          notification.notificationId
        );

        setSuccess(
          "Notification marked as read."
        );
      }

      await loadNotifications(
        selectedHouseholdId
      );

      window.dispatchEvent(
        new Event(
          "notifications-updated"
        )
      );
    } catch (err) {
      console.error(
        "Failed to update notification:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to update notification."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(
    notificationId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this notification?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(
        notificationId
      );

      setError("");
      setSuccess("");

      await notificationService.remove(
        notificationId
      );

      setSuccess(
        "Notification deleted successfully."
      );

      await loadNotifications(
        selectedHouseholdId
      );

      window.dispatchEvent(
        new Event(
          "notifications-updated"
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete notification:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to delete notification."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const sortedNotifications =
    useMemo(() => {
      return [
        ...notifications,
      ].sort(
        (a, b) =>
          new Date(
            b.createdDate || 0
          ) -
          new Date(
            a.createdDate || 0
          )
      );
    }, [notifications]);

  const readCount =
    sortedNotifications.filter(
      (notification) =>
        notification.isRead
    ).length;

  const totalCount =
    sortedNotifications.length;

  return (
    <div className="notification-redesign">
      <section className="notification-redesign-hero">
        <div className="notification-redesign-orb notification-redesign-orb-one" />
        <div className="notification-redesign-orb notification-redesign-orb-two" />

        <div className="notification-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Alerts and updates
          </p>

          <h1>
            Stay ahead of important
            energy changes.
          </h1>

          <p>
            Budget warnings and
            energy-goal alerts appear
            here automatically, so you
            can respond before costs or
            consumption move too far
            from your plan.
          </p>
        </div>

        <div className="notification-redesign-hero-badge">
          <span>
            ◉
          </span>

          <div>
            <small>
              Alert centre
            </small>

            <strong>
              Notifications
            </strong>
          </div>
        </div>

        <div className="notification-redesign-controls">
          <label>
            <span>
              Household
            </span>

            <select
              value={
                selectedHouseholdId
              }
              onChange={(event) => {
                setSelectedHouseholdId(
                  event.target.value
                );

                setError("");
                setSuccess("");
              }}
            >
              <option value="">
                Select household
              </option>

              {households.map(
                (household) => (
                  <option
                    key={
                      household.householdId
                    }
                    value={
                      household.householdId
                    }
                  >
                    {
                      household.householdName
                    }
                  </option>
                )
              )}
            </select>
          </label>

          <label className="notification-redesign-toggle">
            <input
              type="checkbox"
              checked={
                unreadOnly
              }
              onChange={(event) =>
                setUnreadOnly(
                  event.target.checked
                )
              }
            />

            <span className="notification-redesign-toggle-track">
              <span />
            </span>

            <strong>
              Show unread only
            </strong>
          </label>
        </div>
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {success && (
        <div className="prediction-redesign-success">
          <span>
            ✓
          </span>

          {success}
        </div>
      )}

      <section className="notification-redesign-summary">
        <article className="notification-redesign-stat notification-redesign-stat-feature">
          <div className="notification-redesign-stat-icon">
            ◉
          </div>

          <span>
            Unread
          </span>

          <strong>
            {unreadCount}
          </strong>

          <p>
            Notifications needing your
            attention.
          </p>
        </article>

        <article className="notification-redesign-stat">
          <div className="notification-redesign-stat-icon">
            ▦
          </div>

          <span>
            Displayed
          </span>

          <strong>
            {totalCount}
          </strong>

          <p>
            Alerts shown in the current
            view.
          </p>
        </article>

        <article className="notification-redesign-stat">
          <div className="notification-redesign-stat-icon notification-redesign-stat-icon-green">
            ✓
          </div>

          <span>
            Read
          </span>

          <strong>
            {readCount}
          </strong>

          <p>
            Notifications already
            reviewed.
          </p>
        </article>
      </section>

      <section className="notification-redesign-panel">
        <div className="notification-redesign-panel-head">
          <div>
            <p className="dashboard-kicker">
              Alert history
            </p>

            <h2>
              Household notifications
            </h2>

            <p>
              Review, mark and manage
              alerts generated by your
              budget and energy-goal
              workflows.
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="notification-redesign-unread-count">
              {
                unreadCount
              }{" "}
              unread
            </span>
          )}
        </div>

        {!selectedHouseholdId ? (
          <div className="notification-redesign-empty">
            Select a household to view
            notifications.
          </div>
        ) : loading ? (
          <div className="notification-redesign-empty">
            Loading notifications...
          </div>
        ) : sortedNotifications.length ===
          0 ? (
          <div className="notification-redesign-empty">
            <div className="notification-redesign-empty-icon">
              ◉
            </div>

            <strong>
              {unreadOnly
                ? "No unread notifications"
                : "Nothing to report"}
            </strong>

            <span>
              {unreadOnly
                ? "All current alerts have been reviewed."
                : "Budget and energy-goal alerts will appear here automatically."}
            </span>
          </div>
        ) : (
          <div className="notification-redesign-list">
            {sortedNotifications.map(
              (
                notification
              ) => (
                <article
                  key={
                    notification.notificationId
                  }
                  className={`notification-redesign-item ${
                    notification.isRead
                      ? "notification-redesign-item-read"
                      : "notification-redesign-item-unread"
                  }`}
                >
                  <div
                    className={`notification-redesign-type-icon ${typeClass(
                      notification.notificationType
                    )}`}
                  >
                    {typeIcon(
                      notification.notificationType
                    )}
                  </div>

                  <div className="notification-redesign-content">
                    <div className="notification-redesign-item-head">
                      <div>
                        <div className="notification-redesign-badges">
                          <span
                            className={`notification-redesign-type ${typeClass(
                              notification.notificationType
                            )}`}
                          >
                            {typeLabel(
                              notification.notificationType
                            )}
                          </span>

                          <span
                            className={`notification-redesign-read-status ${
                              notification.isRead
                                ? "notification-redesign-read-status-read"
                                : "notification-redesign-read-status-unread"
                            }`}
                          >
                            {notification.isRead
                              ? "Read"
                              : "Unread"}
                          </span>
                        </div>

                        <h3>
                          {
                            notification.notificationTitle
                          }
                        </h3>

                        <span className="notification-redesign-date">
                          {formatDateTime(
                            notification.createdDate
                          )}
                        </span>
                      </div>

                      {!notification.isRead && (
                        <span className="notification-redesign-dot" />
                      )}
                    </div>

                    <p className="notification-redesign-message">
                      {
                        notification.notificationMessage
                      }
                    </p>
                  </div>

                  <div className="notification-redesign-actions">
                    <button
                      type="button"
                      className="notification-redesign-secondary"
                      onClick={() =>
                        handleReadToggle(
                          notification
                        )
                      }
                      disabled={
                        updatingId ===
                        notification.notificationId
                      }
                    >
                      {updatingId ===
                      notification.notificationId
                        ? "Updating..."
                        : notification.isRead
                          ? "Mark unread"
                          : "Mark read"}
                    </button>

                    <button
                      type="button"
                      className="notification-redesign-delete"
                      onClick={() =>
                        handleDelete(
                          notification.notificationId
                        )
                      }
                      disabled={
                        updatingId ===
                        notification.notificationId
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}