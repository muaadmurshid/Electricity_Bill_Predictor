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

function typeStyle(type) {
  switch (type) {
    case "BUDGET_WARNING":
      return {
        background: "#fff4d7",
        color: "#795d12",
      };

    case "BUDGET_EXCEEDED":
      return {
        background: "#fff0f0",
        color: "#9a1f1f",
      };

    case "GOAL_AT_RISK":
      return {
        background: "#fff4d7",
        color: "#795d12",
      };

    case "GOAL_MISSED":
      return {
        background: "#fff0f0",
        color: "#9a1f1f",
      };

    default:
      return {
        background: "#f1eaea",
        color: "#765f5f",
      };
  }
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

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

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

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
        Number(countData || 0)
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

      if (notification.isRead) {
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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>
          TARGETS
        </p>

        <h1 style={styles.title}>
          Notifications
        </h1>

        <p style={styles.lead}>
          Review automatic alerts
          generated by the budget and
          energy-goal workflows. New
          notifications are unread until
          you mark them as read.
        </p>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {success && (
        <div style={styles.success}>
          {success}
        </div>
      )}

      <section
        style={
          styles.selectorCard
        }
      >
        <div
          style={
            styles.selectorGrid
          }
        >
          <div>
            <label
              style={
                styles.label
              }
            >
              Household
            </label>

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
              style={
                styles.input
              }
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
          </div>

          <div
            style={
              styles.filterArea
            }
          >
            <label
              style={
                styles.checkboxLabel
              }
            >
              <input
                type="checkbox"
                checked={
                  unreadOnly
                }
                onChange={(event) =>
                  setUnreadOnly(
                    event.target
                      .checked
                  )
                }
              />

              Show unread only
            </label>
          </div>
        </div>
      </section>

      <div
        style={
          styles.summaryGrid
        }
      >
        <section
          style={
            styles.summaryCard
          }
        >
          <p
            style={
              styles.summaryLabel
            }
          >
            Unread notifications
          </p>

          <h2
            style={
              styles.summaryValue
            }
          >
            {unreadCount}
          </h2>
        </section>

        <section
          style={
            styles.summaryCard
          }
        >
          <p
            style={
              styles.summaryLabel
            }
          >
            Displayed
          </p>

          <h2
            style={
              styles.summaryValue
            }
          >
            {
              sortedNotifications.length
            }
          </h2>
        </section>
      </div>

      <section style={styles.card}>
        <div
          style={
            styles.cardHeader
          }
        >
          <div>
            <p
              style={
                styles.cardEyebrow
              }
            >
              ALERTS
            </p>

            <h2
              style={
                styles.cardTitle
              }
            >
              Household notifications
            </h2>
          </div>

          {unreadCount > 0 && (
            <span
              style={
                styles.unreadBadge
              }
            >
              {unreadCount} unread
            </span>
          )}
        </div>

        {!selectedHouseholdId ? (
          <p
            style={
              styles.muted
            }
          >
            Select a household to
            view notifications.
          </p>
        ) : loading ? (
          <p
            style={
              styles.muted
            }
          >
            Loading notifications...
          </p>
        ) : sortedNotifications.length ===
          0 ? (
          <p
            style={
              styles.muted
            }
          >
            {unreadOnly
              ? "No unread notifications found."
              : "No notifications found for this household."}
          </p>
        ) : (
          <div
            style={
              styles.list
            }
          >
            {sortedNotifications.map(
              (notification) => (
                <article
                  key={
                    notification.notificationId
                  }
                  style={{
                    ...styles.notificationItem,

                    ...(notification.isRead
                      ? styles.readItem
                      : styles.unreadItem),
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={
                        styles.notificationHeading
                      }
                    >
                      <div>
                        <h3
                          style={
                            styles.notificationTitle
                          }
                        >
                          {
                            notification.notificationTitle
                          }
                        </h3>

                        <p
                          style={
                            styles.date
                          }
                        >
                          {formatDateTime(
                            notification.createdDate
                          )}
                        </p>
                      </div>

                      <div
                        style={
                          styles.badges
                        }
                      >
                        <span
                          style={{
                            ...styles.typeBadge,
                            ...typeStyle(
                              notification.notificationType
                            ),
                          }}
                        >
                          {typeLabel(
                            notification.notificationType
                          )}
                        </span>

                        <span
                          style={{
                            ...styles.readBadge,

                            ...(notification.isRead
                              ? styles.readBadgeRead
                              : styles.readBadgeUnread),
                          }}
                        >
                          {notification.isRead
                            ? "Read"
                            : "Unread"}
                        </span>
                      </div>
                    </div>

                    <p
                      style={
                        styles.message
                      }
                    >
                      {
                        notification.notificationMessage
                      }
                    </p>
                  </div>

                  <div
                    style={
                      styles.actions
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleReadToggle(
                          notification
                        )
                      }
                      disabled={
                        updatingId ===
                        notification.notificationId
                      }
                      style={
                        styles.secondaryButton
                      }
                    >
                      {notification.isRead
                        ? "Mark unread"
                        : "Mark read"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          notification.notificationId
                        )
                      }
                      disabled={
                        updatingId ===
                        notification.notificationId
                      }
                      style={
                        styles.deleteButton
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

const styles = {
  page: {
    padding: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "24px",
  },

  eyebrow: {
    fontSize: "12px",
    letterSpacing: "0.14em",
    marginBottom: "8px",
    color: "#7a5c5c",
  },

  title: {
    fontSize: "34px",
    margin: "0 0 10px 0",
  },

  lead: {
    maxWidth: "800px",
    lineHeight: 1.6,
    color: "#765f5f",
  },

  error: {
    padding: "14px 16px",
    marginBottom: "20px",
    border:
      "1px solid #e5b4b4",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#9a1f1f",
  },

  success: {
    padding: "14px 16px",
    marginBottom: "20px",
    border:
      "1px solid #b9d8b9",
    borderRadius: "10px",
    background: "#effbef",
    color: "#286428",
  },

  selectorCard: {
    background: "#ffffff",
    border:
      "1px solid #e6dcdc",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "22px",
  },

  selectorGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    alignItems: "end",
  },

  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border:
      "1px solid #d8caca",
    borderRadius: "8px",
    fontSize: "15px",
  },

  filterArea: {
    display: "flex",
    alignItems: "center",
    minHeight: "42px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    color: "#5f5050",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  summaryCard: {
    background: "#ffffff",
    border:
      "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "20px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

  summaryLabel: {
    margin: "0 0 8px",
    color: "#806d6d",
    fontSize: "13px",
  },

  summaryValue: {
    margin: 0,
    color: "#3f1515",
    fontSize: "28px",
  },

  card: {
    background: "#ffffff",
    border:
      "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "24px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
  },

  cardEyebrow: {
    margin: "0 0 5px",
    fontSize: "11px",
    letterSpacing: "0.12em",
    color: "#8a6e6e",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
  },

  unreadBadge: {
    borderRadius: "999px",
    padding: "6px 11px",
    background: "#7f0000",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 700,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  notificationItem: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "20px",
    padding: "18px",
    borderRadius: "10px",
    border:
      "1px solid #eadede",
  },

  unreadItem: {
    background: "#fffafa",
    borderLeft:
      "4px solid #7f0000",
  },

  readItem: {
    background: "#ffffff",
    opacity: 0.85,
  },

  notificationHeading: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },

  notificationTitle: {
    margin: "0 0 5px",
  },

  date: {
    margin: 0,
    color: "#8a7474",
    fontSize: "12px",
  },

  badges: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  },

  typeBadge: {
    borderRadius: "999px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: 700,
  },

  readBadge: {
    borderRadius: "999px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: 700,
  },

  readBadgeUnread: {
    background: "#f5e6e6",
    color: "#7f0000",
  },

  readBadgeRead: {
    background: "#eeeeee",
    color: "#666666",
  },

  message: {
    margin: "14px 0 0",
    color: "#5f5050",
    lineHeight: 1.6,
  },

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "110px",
  },

  secondaryButton: {
    padding: "8px 12px",
    border:
      "1px solid #cbbbbb",
    borderRadius: "7px",
    background: "#ffffff",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "7px",
    background: "#a22323",
    color: "#ffffff",
    cursor: "pointer",
  },

  muted: {
    color: "#806d6d",
  },
};