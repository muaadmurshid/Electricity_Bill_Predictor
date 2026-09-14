import {
  useEffect,
  useMemo,
  useState,
} from "react";

import adminService from "../services/adminService";

export default function AdminDashboard() {
  const [
    summary,
    setSummary,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data =
        await adminService.getDashboard();

      setSummary(data);
    } catch (err) {
      console.error(
        "Failed to load admin dashboard:",
        err
      );

      if (
        err?.response?.status === 403
      ) {
        setError(
          "You do not have permission to access the administration dashboard."
        );
      } else {
        setError(
          err?.response?.data
            ?.error ||
            err?.response?.data
              ?.message ||
            "Failed to load administration dashboard."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const stats =
    useMemo(
      () => ({
        users:
          summary?.totalUsers ??
          0,

        households:
          summary?.totalHouseholds ??
          0,

        appliances:
          summary?.totalAppliances ??
          0,

        bills:
          summary?.totalElectricityBills ??
          0,

        predictions:
          summary?.totalBillPredictions ??
          0,
      }),
      [summary]
    );

  const totalSystemRecords =
    stats.users +
    stats.households +
    stats.appliances +
    stats.bills +
    stats.predictions;

  const recordsPerUser =
    stats.users > 0
      ? (
          (
            stats.households +
            stats.appliances +
            stats.bills +
            stats.predictions
          ) /
          stats.users
        ).toFixed(1)
      : "0.0";

  return (
    <div className="admin-dashboard-redesign">
      <section className="admin-dashboard-hero">
        <div className="admin-dashboard-orb admin-dashboard-orb-one" />
        <div className="admin-dashboard-orb admin-dashboard-orb-two" />

        <div className="admin-dashboard-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Administration
          </p>

          <h1>
            Keep an eye on the whole
            energy platform.
          </h1>

          <p>
            Review system-wide activity
            across users, households,
            appliances, electricity bills
            and generated bill
            predictions.
          </p>
        </div>

        <div className="admin-dashboard-hero-badge">
          <span>
            A
          </span>

          <div>
            <small>
              System control
            </small>

            <strong>
              Admin dashboard
            </strong>
          </div>
        </div>

        <div className="admin-dashboard-hero-strip">
          <div>
            <span>
              Registered users
            </span>

            <strong>
              {stats.users}
            </strong>
          </div>

          <div>
            <span>
              Total platform records
            </span>

            <strong>
              {totalSystemRecords}
            </strong>
          </div>

          <div>
            <span>
              Records per user
            </span>

            <strong>
              {recordsPerUser}
            </strong>
          </div>
        </div>
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {loading ? (
        <section className="admin-dashboard-loading">
          Loading administration dashboard...
        </section>
      ) : summary ? (
        <>
          <section className="admin-dashboard-summary">
            <article className="admin-dashboard-stat admin-dashboard-stat-feature">
              <div className="admin-dashboard-stat-icon">
                ◯
              </div>

              <span>
                Users
              </span>

              <strong>
                {stats.users}
              </strong>

              <p>
                Registered system accounts.
              </p>
            </article>

            <article className="admin-dashboard-stat">
              <div className="admin-dashboard-stat-icon admin-dashboard-stat-icon-green">
                ⌂
              </div>

              <span>
                Households
              </span>

              <strong>
                {stats.households}
              </strong>

              <p>
                Households registered in
                the system.
              </p>
            </article>

            <article className="admin-dashboard-stat">
              <div className="admin-dashboard-stat-icon">
                ⏻
              </div>

              <span>
                Appliances
              </span>

              <strong>
                {stats.appliances}
              </strong>

              <p>
                Appliances recorded across
                all households.
              </p>
            </article>

            <article className="admin-dashboard-stat">
              <div className="admin-dashboard-stat-icon">
                Rs
              </div>

              <span>
                Electricity bills
              </span>

              <strong>
                {stats.bills}
              </strong>

              <p>
                Historical electricity
                bill records.
              </p>
            </article>
          </section>

          <section className="admin-dashboard-grid">
            <article className="admin-dashboard-prediction-card">
              <div className="admin-dashboard-card-head">
                <div>
                  <p className="dashboard-kicker dashboard-kicker-light">
                    Machine learning
                  </p>

                  <h2>
                    Bill predictions
                  </h2>
                </div>

                <span className="admin-dashboard-prediction-icon">
                  ML
                </span>
              </div>

              <div className="admin-dashboard-prediction-value">
                <strong>
                  {stats.predictions}
                </strong>

                <span>
                  predictions generated
                </span>
              </div>

              <p>
                Forecast records created
                by the electricity
                prediction workflow.
              </p>
            </article>

            <article className="admin-dashboard-overview-card">
              <div className="admin-dashboard-card-head">
                <div>
                  <p className="dashboard-kicker">
                    Platform overview
                  </p>

                  <h2>
                    Current system records
                  </h2>
                </div>

                <span className="admin-dashboard-overview-icon">
                  ▦
                </span>
              </div>

              <div className="admin-dashboard-overview-list">
                <OverviewRow
                  label="Registered users"
                  value={stats.users}
                  icon="◯"
                />

                <OverviewRow
                  label="Households"
                  value={stats.households}
                  icon="⌂"
                />

                <OverviewRow
                  label="Appliances"
                  value={stats.appliances}
                  icon="⏻"
                />

                <OverviewRow
                  label="Electricity bills"
                  value={stats.bills}
                  icon="Rs"
                />

                <OverviewRow
                  label="Bill predictions"
                  value={stats.predictions}
                  icon="ML"
                  last
                />
              </div>
            </article>
          </section>

          <section className="admin-dashboard-health">
            <div>
              <p className="dashboard-kicker dashboard-kicker-light">
                System snapshot
              </p>

              <h2>
                Platform activity at a
                glance.
              </h2>

              <p>
                The administration
                dashboard combines the
                main operational records
                used across the
                Electricity Bill
                Predictor.
              </p>
            </div>

            <div className="admin-dashboard-health-values">
              <div>
                <span>
                  User accounts
                </span>

                <strong>
                  {stats.users}
                </strong>
              </div>

              <div>
                <span>
                  Energy assets
                </span>

                <strong>
                  {stats.appliances}
                </strong>
              </div>

              <div>
                <span>
                  Billing records
                </span>

                <strong>
                  {stats.bills}
                </strong>
              </div>

              <div>
                <span>
                  ML outputs
                </span>

                <strong>
                  {stats.predictions}
                </strong>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="admin-dashboard-loading">
          No administration statistics
          are available.
        </section>
      )}
    </div>
  );
}

function OverviewRow({
  label,
  value,
  icon,
  last = false,
}) {
  return (
    <div
      className={`admin-dashboard-overview-row ${
        last
          ? "admin-dashboard-overview-row-last"
          : ""
      }`}
    >
      <div className="admin-dashboard-overview-row-label">
        <span>
          {icon}
        </span>

        <strong>
          {label}
        </strong>
      </div>

      <strong className="admin-dashboard-overview-row-value">
        {value ?? 0}
      </strong>
    </div>
  );
}