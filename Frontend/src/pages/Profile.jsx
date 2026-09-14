import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";

export default function Profile() {
  const { user, logout } = useAuth();

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "User";

  const roleLabel = user?.role || "USER";

  return (
    <div className="profile-redesign">
      <section className="profile-redesign-hero">
        <div className="profile-redesign-orb profile-redesign-orb-one" />
        <div className="profile-redesign-orb profile-redesign-orb-two" />

        <div className="profile-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Account
          </p>

          <h1>
            Your personal account space.
          </h1>

          <p>
            Review the account currently signed in to the system and manage
            your active session from one place.
          </p>
        </div>

        <div className="profile-redesign-hero-badge">
          <span>
            {user
              ? initials(
                  user.firstName,
                  user.lastName
                )
              : "U"}
          </span>

          <div>
            <small>
              Signed in as
            </small>

            <strong>
              {fullName}
            </strong>
          </div>
        </div>

        <div className="profile-redesign-identity">
          <div className="profile-redesign-avatar-large">
            {user
              ? initials(
                  user.firstName,
                  user.lastName
                )
              : "U"}
          </div>

          <div>
            <span>
              Account holder
            </span>

            <strong>
              {fullName}
            </strong>

            <p>
              {user?.email || "No email available"}
            </p>
          </div>

          <span className="profile-redesign-role">
            {roleLabel}
          </span>
        </div>
      </section>

      <section className="profile-redesign-summary">
        <article className="profile-redesign-stat profile-redesign-stat-feature">
          <div className="profile-redesign-stat-icon">
            ◯
          </div>

          <span>
            Account ID
          </span>

          <strong>
            {user?.userId ?? "—"}
          </strong>

          <p>
            Unique account identifier.
          </p>
        </article>

        <article className="profile-redesign-stat">
          <div className="profile-redesign-stat-icon profile-redesign-stat-icon-green">
            @
          </div>

          <span>
            Email
          </span>

          <strong className="profile-redesign-stat-email">
            {user?.email || "—"}
          </strong>

          <p>
            Email linked to this account.
          </p>
        </article>

        <article className="profile-redesign-stat">
          <div className="profile-redesign-stat-icon">
            ◈
          </div>

          <span>
            Role
          </span>

          <strong>
            {roleLabel}
          </strong>

          <p>
            Current access level.
          </p>
        </article>
      </section>

      <section className="profile-redesign-grid">
        <article className="profile-redesign-details-card">
          <div className="profile-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Account information
              </p>

              <h2>
                Your details
              </h2>
            </div>

            <span className="profile-redesign-card-icon">
              ◯
            </span>
          </div>

          <div className="profile-redesign-details">
            <div>
              <span>
                First name
              </span>

              <strong>
                {user?.firstName || "—"}
              </strong>
            </div>

            <div>
              <span>
                Last name
              </span>

              <strong>
                {user?.lastName || "—"}
              </strong>
            </div>

            <div>
              <span>
                Email address
              </span>

              <strong>
                {user?.email || "—"}
              </strong>
            </div>

            <div>
              <span>
                Account ID
              </span>

              <strong>
                #{user?.userId ?? "—"}
              </strong>
            </div>

            <div>
              <span>
                Role
              </span>

              <strong>
                {roleLabel}
              </strong>
            </div>
          </div>

          <div className="profile-redesign-note">
            <span>
              i
            </span>

            <div>
              <strong>
                Profile editing is not enabled yet
              </strong>

              <p>
                This page currently displays the account information already
                available from the authenticated session.
              </p>
            </div>
          </div>
        </article>

        <article className="profile-redesign-session-card">
          <div className="profile-redesign-card-head">
            <div>
              <p className="dashboard-kicker dashboard-kicker-light">
                Security
              </p>

              <h2>
                Active session
              </h2>
            </div>

            <span className="profile-redesign-session-icon">
              ⇥
            </span>
          </div>

          <div className="profile-redesign-session-status">
            <span className="profile-redesign-session-dot" />

            <div>
              <strong>
                Signed in
              </strong>

              <p>
                Your current authentication session is active.
              </p>
            </div>
          </div>

          <div className="profile-redesign-session-info">
            <div>
              <span>
                Session account
              </span>

              <strong>
                {fullName}
              </strong>
            </div>

            <div>
              <span>
                Authentication
              </span>

              <strong>
                Token based
              </strong>
            </div>
          </div>

          <div className="profile-redesign-signout-box">
            <h3>
              Sign out of this device
            </h3>

            <p>
              Signing out clears the locally saved authentication session.
              You will need to sign in again to access protected pages.
            </p>

            <button
              type="button"
              onClick={logout}
              className="profile-redesign-signout"
            >
              Sign out
              <span>
                ⇥
              </span>
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}