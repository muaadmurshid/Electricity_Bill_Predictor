import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { initials } from "../utils/format";

/**
 * Shows the account details already held in AuthContext.
 * Editing a profile needs UserController — add it when that is confirmed.
 */
export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" lead="Your account details." />

      <div className="grid grid-2">
        <Card title="Your details">
          <div className="row" style={{ marginBottom: "var(--space-5)" }}>
            <span
              className="avatar"
              style={{ width: 48, height: 48, fontSize: "var(--text-base)" }}
            >
              {user ? initials(user.firstName, user.lastName) : "U"}
            </span>
            <div>
              <p style={{ fontWeight: 500, color: "var(--color-ink)" }}>
                {user ? `${user.firstName} ${user.lastName}` : "—"}
              </p>
              <p className="text-sm muted">{user?.email || "—"}</p>
            </div>
          </div>

          <table className="table">
            <tbody>
              <tr>
                <td className="muted">Account ID</td>
                <td className="num">{user?.userId ?? "—"}</td>
              </tr>
              <tr>
                <td className="muted">Email</td>
                <td className="num">{user?.email ?? "—"}</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title="Session" subtitle="Signing out clears your saved token">
          <p className="text-sm">
            You stay signed in on this device until you sign out or the token expires.
          </p>
          <div style={{ marginTop: "var(--space-5)" }}>
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
