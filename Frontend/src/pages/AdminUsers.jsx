import {
  useEffect,
  useMemo,
  useState,
} from "react";

import adminUserService from "../services/adminUserService";

function formatDate(value) {
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
    }
  ).format(date);
}

export default function AdminUsers() {
  const [
    users,
    setUsers,
  ] = useState([]);

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

  const [
    search,
    setSearch,
  ] = useState("");

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
        err?.response?.status ===
          403
          ? "You do not have permission to manage users."
          : err?.response?.data
              ?.error ||
              err?.response?.data
                ?.message ||
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
      user.accountStatus ===
      newStatus
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
      setUpdatingId(
        user.userId
      );

      setError("");
      setSuccess("");

      const updated =
        await adminUserService.updateStatus(
          user.userId,
          newStatus
        );

      setUsers(
        (previous) =>
          previous.map(
            (item) =>
              item.userId ===
              user.userId
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
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to update account status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(
    user
  ) {
    if (
      user.role === "ADMIN"
    ) {
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
      setUpdatingId(
        user.userId
      );

      setError("");
      setSuccess("");

      await adminUserService.remove(
        user.userId
      );

      setUsers(
        (previous) =>
          previous.filter(
            (item) =>
              item.userId !==
              user.userId
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
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Unable to delete this user. The account may still have related household records."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredUsers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return users;
      }

      return users.filter(
        (user) => {
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

          return text.includes(
            query
          );
        }
      );
    }, [users, search]);

  const activeCount =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.accountStatus ===
            "ACTIVE"
        ).length,
      [users]
    );

  const inactiveCount =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.accountStatus ===
            "INACTIVE"
        ).length,
      [users]
    );

  const adminCount =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.role ===
            "ADMIN"
        ).length,
      [users]
    );

  return (
    <div className="admin-users-redesign">
      <section className="admin-users-hero">
        <div className="admin-users-orb admin-users-orb-one" />
        <div className="admin-users-orb admin-users-orb-two" />

        <div className="admin-users-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Administration
          </p>

          <h1>
            Manage who can access the
            platform.
          </h1>

          <p>
            Review registered accounts,
            search users, control account
            availability and remove
            standard user accounts when
            necessary.
          </p>
        </div>

        <div className="admin-users-hero-badge">
          <span>
            ◯
          </span>

          <div>
            <small>
              Access control
            </small>

            <strong>
              User management
            </strong>
          </div>
        </div>

        <div className="admin-users-search-panel">
          <label>
            <span>
              Search users
            </span>

            <input
              type="search"
              placeholder="Search by name, email, role, phone or status..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </label>

          <div className="admin-users-search-result">
            <span>
              Showing
            </span>

            <strong>
              {
                filteredUsers.length
              }
            </strong>
          </div>
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

      <section className="admin-users-summary">
        <article className="admin-users-stat admin-users-stat-feature">
          <div className="admin-users-stat-icon">
            ◯
          </div>

          <span>
            Total users
          </span>

          <strong>
            {
              users.length
            }
          </strong>

          <p>
            Registered system accounts.
          </p>
        </article>

        <article className="admin-users-stat">
          <div className="admin-users-stat-icon admin-users-stat-icon-green">
            ✓
          </div>

          <span>
            Active
          </span>

          <strong>
            {
              activeCount
            }
          </strong>

          <p>
            Accounts currently allowed
            to sign in.
          </p>
        </article>

        <article className="admin-users-stat">
          <div className="admin-users-stat-icon">
            !
          </div>

          <span>
            Inactive
          </span>

          <strong>
            {
              inactiveCount
            }
          </strong>

          <p>
            Accounts currently blocked
            from signing in.
          </p>
        </article>

        <article className="admin-users-stat">
          <div className="admin-users-stat-icon">
            A
          </div>

          <span>
            Administrators
          </span>

          <strong>
            {
              adminCount
            }
          </strong>

          <p>
            Accounts with administrative
            access.
          </p>
        </article>
      </section>

      <section className="admin-users-panel">
        <div className="admin-users-panel-head">
          <div>
            <p className="dashboard-kicker">
              Registered accounts
            </p>

            <h2>
              Platform users
            </h2>

            <p>
              Passwords are never
              returned or displayed in
              this administration view.
            </p>
          </div>

          <span className="admin-users-panel-count">
            {
              filteredUsers.length
            }
          </span>
        </div>

        {loading ? (
          <div className="admin-users-empty">
            Loading users...
          </div>
        ) : filteredUsers.length ===
          0 ? (
          <div className="admin-users-empty">
            <div className="admin-users-empty-icon">
              ◯
            </div>

            <strong>
              No matching users
            </strong>

            <span>
              Try another search term.
            </span>
          </div>
        ) : (
          <div className="admin-users-list">
            {filteredUsers.map(
              (user) => (
                <article
                  key={
                    user.userId
                  }
                  className={`admin-users-item ${
                    user.role ===
                    "ADMIN"
                      ? "admin-users-item-admin"
                      : ""
                  }`}
                >
                  <div className="admin-users-item-main">
                    <div className="admin-users-avatar">
                      {(
                        user.firstName?.[0] ||
                        "U"
                      ).toUpperCase()}

                      {(
                        user.lastName?.[0] ||
                        ""
                      ).toUpperCase()}
                    </div>

                    <div className="admin-users-identity">
                      <div className="admin-users-badges">
                        <span
                          className={`admin-users-role ${
                            user.role ===
                            "ADMIN"
                              ? "admin-users-role-admin"
                              : "admin-users-role-user"
                          }`}
                        >
                          {
                            user.role
                          }
                        </span>

                        <span
                          className={`admin-users-status ${
                            user.accountStatus ===
                            "ACTIVE"
                              ? "admin-users-status-active"
                              : "admin-users-status-inactive"
                          }`}
                        >
                          {
                            user.accountStatus
                          }
                        </span>
                      </div>

                      <h3>
                        {user.firstName}{" "}
                        {user.lastName}
                      </h3>

                      <p>
                        {user.email}
                      </p>
                    </div>

                    <div className="admin-users-id">
                      <span>
                        User ID
                      </span>

                      <strong>
                        #
                        {
                          user.userId
                        }
                      </strong>
                    </div>
                  </div>

                  <div className="admin-users-item-details">
                    <div>
                      <span>
                        Phone
                      </span>

                      <strong>
                        {user.phoneNumber ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Created
                      </span>

                      <strong>
                        {formatDate(
                          user.createdDate
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Account type
                      </span>

                      <strong>
                        {user.role ===
                        "ADMIN"
                          ? "Administrator"
                          : "Standard user"}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-users-item-actions">
                    {user.role ===
                    "ADMIN" ? (
                      <div className="admin-users-protected">
                        <span>
                          ◈
                        </span>

                        Administrator account
                        protected
                      </div>
                    ) : (
                      <>
                        <label>
                          <span>
                            Account status
                          </span>

                          <select
                            value={
                              user.accountStatus
                            }
                            disabled={
                              updatingId ===
                              user.userId
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                user,
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="ACTIVE">
                              Active
                            </option>

                            <option value="INACTIVE">
                              Inactive
                            </option>
                          </select>
                        </label>

                        <button
                          type="button"
                          className="admin-users-delete"
                          disabled={
                            updatingId ===
                            user.userId
                          }
                          onClick={() =>
                            handleDelete(
                              user
                            )
                          }
                        >
                          {updatingId ===
                          user.userId
                            ? "Updating..."
                            : "Delete user"}
                        </button>
                      </>
                    )}
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