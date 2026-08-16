import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";

import adminUserService from "../services/adminUserService";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-LK",
    {
      dateStyle: "medium",
    }
  ).format(date);
}

function statusStyle(status) {
  if (status === "ACTIVE") {
    return {
      background: "#e9f7e9",
      color: "#286428",
    };
  }

  return {
    background: "#fff0f0",
    color: "#9a1f1f",
  };
}

function roleStyle(role) {
  if (role === "ADMIN") {
    return {
      background: "#f5e8e8",
      color: "#7f0000",
    };
  }

  return {
    background: "#eeeeee",
    color: "#5f5050",
  };
}

export default function AdminUsers() {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data =
        await adminUserService.list();

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load users:",
        err
      );

      setError(
        err?.response?.status === 403
          ? "You do not have permission to manage users."
          : err?.response?.data?.error ||
              err?.response?.data?.message ||
              "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    user,
    newStatus
  ) {
    if (
      user.accountStatus === newStatus
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Change ${user.email} to ${newStatus}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(user.userId);
      setError("");
      setSuccess("");

      const updated =
        await adminUserService.updateStatus(
          user.userId,
          newStatus
        );

      setUsers((previous) =>
        previous.map((item) =>
          item.userId === user.userId
            ? updated
            : item
        )
      );

      setSuccess(
        `Account status changed to ${newStatus}.`
      );
    } catch (err) {
      console.error(
        "Failed to update user status:",
        err
      );

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to update account status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(user) {
    if (user.role === "ADMIN") {
      setError(
        "Deleting an administrator from this screen is disabled for safety."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${user.firstName} ${user.lastName} (${user.email})?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(user.userId);
      setError("");
      setSuccess("");

      await adminUserService.remove(
        user.userId
      );

      setUsers((previous) =>
        previous.filter(
          (item) =>
            item.userId !== user.userId
        )
      );

      setSuccess(
        "User deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Unable to delete this user. The account may still have related household records."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredUsers =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return users;
      }

      return users.filter((user) => {
        const text = [
          user.firstName,
          user.lastName,
          user.email,
          user.phoneNumber,
          user.role,
          user.accountStatus,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      });
    }, [users, search]);

  const activeCount =
    users.filter(
      (user) =>
        user.accountStatus === "ACTIVE"
    ).length;

  const inactiveCount =
    users.filter(
      (user) =>
        user.accountStatus === "INACTIVE"
    ).length;

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="User management"
        lead="View registered accounts and control whether users are allowed to sign in."
      />

      <div className="stack">
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

        <div className="grid grid-3">
          <Card>
            <p style={styles.statLabel}>
              Total users
            </p>
            <h2 style={styles.statValue}>
              {users.length}
            </h2>
          </Card>

          <Card>
            <p style={styles.statLabel}>
              Active
            </p>
            <h2 style={styles.statValue}>
              {activeCount}
            </h2>
          </Card>

          <Card>
            <p style={styles.statLabel}>
              Inactive
            </p>
            <h2 style={styles.statValue}>
              {inactiveCount}
            </h2>
          </Card>
        </div>

        <Card
          title="Registered users"
          subtitle="Passwords are never returned or displayed."
        >
          <input
            type="search"
            placeholder="Search by name, email, role or status..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            style={styles.search}
          />

          {loading ? (
            <p className="muted">
              Loading users...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="muted">
              No matching users found.
            </p>
          ) : (
            <div
              style={
                styles.tableWrapper
              }
            >
              <table
                style={styles.table}
              >
                <thead>
                  <tr>
                    <th style={styles.th}>
                      User
                    </th>

                    <th style={styles.th}>
                      Contact
                    </th>

                    <th style={styles.th}>
                      Role
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>

                    <th style={styles.th}>
                      Created
                    </th>

                    <th style={styles.th}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (user) => (
                      <tr
                        key={user.userId}
                      >
                        <td style={styles.td}>
                          <strong>
                            {user.firstName}{" "}
                            {user.lastName}
                          </strong>

                          <div
                            style={
                              styles.userId
                            }
                          >
                            ID: {user.userId}
                          </div>
                        </td>

                        <td style={styles.td}>
                          <div>
                            {user.email}
                          </div>

                          <div
                            style={
                              styles.secondaryText
                            }
                          >
                            {user.phoneNumber ||
                              "No phone number"}
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              ...roleStyle(
                                user.role
                              ),
                            }}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              ...statusStyle(
                                user.accountStatus
                              ),
                            }}
                          >
                            {
                              user.accountStatus
                            }
                          </span>
                        </td>

                        <td style={styles.td}>
                          {formatDate(
                            user.createdDate
                          )}
                        </td>

                        <td style={styles.td}>
                          <div
                            style={
                              styles.actions
                            }
                          >
                            <select
                              value={
                                user.accountStatus
                              }
                              disabled={
                                updatingId ===
                                  user.userId ||
                                user.role ===
                                  "ADMIN"
                              }
                              onChange={(event) =>
                                handleStatusChange(
                                  user,
                                  event.target
                                    .value
                                )
                              }
                              style={
                                styles.statusSelect
                              }
                            >
                              <option value="ACTIVE">
                                Active
                              </option>

                              <option value="INACTIVE">
                                Inactive
                              </option>
                            </select>

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                  user.userId ||
                                user.role ===
                                  "ADMIN"
                              }
                              onClick={() =>
                                handleDelete(
                                  user
                                )
                              }
                              style={{
                                ...styles.deleteButton,

                                ...(user.role ===
                                "ADMIN"
                                  ? styles.disabled
                                  : {}),
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

const styles = {
  error: {
    padding: "14px 16px",
    border: "1px solid #e5b4b4",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#9a1f1f",
  },

  success: {
    padding: "14px 16px",
    border: "1px solid #b9d8b9",
    borderRadius: "10px",
    background: "#effbef",
    color: "#286428",
  },

  statLabel: {
    margin: "0 0 8px",
    color: "#806d6d",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  statValue: {
    margin: 0,
    fontSize: "32px",
    color: "#351414",
  },

  search: {
    width: "100%",
    maxWidth: "500px",
    padding: "11px 12px",
    marginBottom: "20px",
    border: "1px solid #d8caca",
    borderRadius: "8px",
    fontSize: "14px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    padding: "12px",
    textAlign: "left",
    borderBottom: "1px solid #ded1d1",
    color: "#765f5f",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },

  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #eee3e3",
    verticalAlign: "middle",
  },

  userId: {
    marginTop: "4px",
    color: "#947d7d",
    fontSize: "11px",
  },

  secondaryText: {
    marginTop: "4px",
    color: "#947d7d",
    fontSize: "12px",
  },

  badge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
  },

  actions: {
    display: "flex",
    gap: "8px",
  },

  statusSelect: {
    padding: "7px 9px",
    border: "1px solid #cbbbbb",
    borderRadius: "7px",
    background: "#ffffff",
  },

  deleteButton: {
    padding: "7px 11px",
    border: "none",
    borderRadius: "7px",
    background: "#a22323",
    color: "#ffffff",
    cursor: "pointer",
  },

  disabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
};