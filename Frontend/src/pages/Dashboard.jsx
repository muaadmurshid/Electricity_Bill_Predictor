import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Card from "../components/common/Card";
import BlockMeter from "../components/common/BlockMeter";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";

import householdService from "../services/householdService";
import predictionService from "../services/predictionService";
import budgetService from "../services/budgetService";
import goalService from "../services/goalService";
import recommendationService from "../services/recommendationService";
import notificationService from "../services/notificationService";

const STEPS = [
  {
    title: "Create your household",
    text: "Add your home details and household information.",
    to: "/households",
  },
  {
    title: "Add your rooms",
    text: "Organise your appliances by room.",
    to: "/rooms",
  },
  {
    title: "Add your appliances",
    text: "Add appliance power information or identify devices using AI.",
    to: "/appliances",
  },
  {
    title: "Record daily usage",
    text: "Track how long your appliances are used each day.",
    to: "/usage",
  },
  {
    title: "Add your past bills",
    text: "Build your household electricity history.",
    to: "/bills",
  },
  {
    title: "Set your targets",
    text: "Create a monthly budget and energy-saving goal.",
    to: "/budget",
  },
];

function toDateString(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function currentMonthRange() {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  );

  return {
    startDate: toDateString(start),
    endDate: toDateString(end),
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-LK",
    {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }
  ).format(Number(value));
}

function formatKwh(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return Number(value).toFixed(2);
}

function budgetTone(status) {
  switch (status) {
    case "WITHIN_BUDGET":
      return "good";

    case "WARNING":
      return "warning";

    case "OVER_BUDGET":
      return "danger";

    default:
      return "neutral";
  }
}

function goalTone(status) {
  switch (status) {
    case "ON_TRACK":
    case "ACHIEVED":
      return "good";

    case "AT_RISK":
      return "warning";

    case "MISSED":
      return "danger";

    default:
      return "neutral";
  }
}

function budgetStatusText(status) {
  switch (status) {
    case "WITHIN_BUDGET":
      return "Within budget";

    case "WARNING":
      return "Warning";

    case "OVER_BUDGET":
      return "Over budget";

    case "ACTIVE":
      return "Awaiting prediction";

    default:
      return status || "No status";
  }
}

function goalStatusText(status) {
  switch (status) {
    case "ON_TRACK":
      return "On track";

    case "AT_RISK":
      return "At risk";

    case "ACHIEVED":
      return "Achieved";

    case "MISSED":
      return "Missed";

    default:
      return status || "No status";
  }
}

function notificationTypeLabel(type) {
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

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-LK",
    {
      dateStyle: "medium",
    }
  ).format(date);
}

export default function Dashboard() {
  const { user } = useAuth();

  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    householdId,
    setHouseholdId,
  ] = useState("");

  const [
    analytics,
    setAnalytics,
  ] = useState(null);

  const [
    latestPrediction,
    setLatestPrediction,
  ] = useState(null);

  const [
    currentBudget,
    setCurrentBudget,
  ] = useState(null);

  const [
    activeGoal,
    setActiveGoal,
  ] = useState(null);

  const [
    recommendations,
    setRecommendations,
  ] = useState([]);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const monthRange =
    useMemo(
      () => currentMonthRange(),
      []
    );

  useEffect(() => {
    loadHouseholds();
  }, []);

  useEffect(() => {
    if (householdId) {
      loadDashboard(
        householdId
      );
    }
  }, [householdId]);

  async function loadHouseholds() {
    try {
      setLoading(true);
      setError("");

      const data =
        await householdService.list();

      const list =
        Array.isArray(data)
          ? data
          : [];

      setHouseholds(list);

      if (list.length > 0) {
        setHouseholdId(
          String(
            list[0].householdId
          )
        );
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(
        "Failed to load households:",
        err
      );

      setError(
        "Unable to load dashboard."
      );

      setLoading(false);
    }
  }

  async function loadDashboard(
    selectedHouseholdId
  ) {
    setLoading(true);
    setError("");

    const results =
      await Promise.allSettled([
        recommendationService.analytics(
          selectedHouseholdId,
          monthRange.startDate,
          monthRange.endDate
        ),

        predictionService.latest(
          selectedHouseholdId
        ),

        budgetService.list(),

        goalService.listByHousehold(
          selectedHouseholdId
        ),

        recommendationService.listByHousehold(
          selectedHouseholdId
        ),

        notificationService.listByHousehold(
          selectedHouseholdId
        ),
      ]);

    const [
      analyticsResult,
      predictionResult,
      budgetResult,
      goalResult,
      recommendationResult,
      notificationResult,
    ] = results;

    setAnalytics(
      analyticsResult.status ===
        "fulfilled"
        ? analyticsResult.value
        : null
    );

    setLatestPrediction(
      predictionResult.status ===
        "fulfilled"
        ? predictionResult.value
        : null
    );

    const budgetList =
      budgetResult.status ===
        "fulfilled" &&
      Array.isArray(
        budgetResult.value
      )
        ? budgetResult.value
        : [];

    const matchedBudget =
      budgetList.find(
        (budget) =>
          String(
            budget.household
              ?.householdId
          ) ===
            String(
              selectedHouseholdId
            ) &&
          Number(
            budget.budgetYear
          ) ===
            monthRange.year &&
          Number(
            budget.budgetMonth
          ) ===
            monthRange.month
      ) || null;

    setCurrentBudget(
      matchedBudget
    );

    const goalList =
      goalResult.status ===
        "fulfilled" &&
      Array.isArray(
        goalResult.value
      )
        ? goalResult.value
        : [];

    const today =
      toDateString(
        new Date()
      );

    const matchedGoal =
      goalList.find(
        (goal) =>
          goal.startDate <=
            today &&
          goal.endDate >= today
      ) || null;

    setActiveGoal(
      matchedGoal
    );

    setRecommendations(
      recommendationResult.status ===
        "fulfilled" &&
      Array.isArray(
        recommendationResult.value
      )
        ? recommendationResult.value
        : []
    );

    setNotifications(
      notificationResult.status ===
        "fulfilled" &&
      Array.isArray(
        notificationResult.value
      )
        ? notificationResult.value
        : []
    );

    setLoading(false);
  }

  const selectedHousehold =
    households.find(
      (household) =>
        String(
          household.householdId
        ) ===
        String(householdId)
    );

  const highestAppliance =
    analytics
      ?.highestConsumingAppliance ||
    null;

  const budgetPercent =
    currentBudget &&
    Number(
      currentBudget.budgetAmount
    ) > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (Number(
              currentBudget.currentEstimatedAmount ||
                0
            ) /
              Number(
                currentBudget.budgetAmount
              )) *
              100
          )
        )
      : 0;

  const recentRecommendations =
    recommendations.slice(
      0,
      2
    );

  const recentNotifications =
    notifications.slice(
      0,
      3
    );

  const latestRecommendation =
    recentRecommendations.length > 0
      ? recentRecommendations[0]
      : null;

  return (
    <div className="energy-dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero-orb dashboard-hero-orb-one" />
        <div className="dashboard-hero-orb dashboard-hero-orb-two" />

        <div className="dashboard-hero-content">
          <div>
            <p className="dashboard-kicker">
              Home energy overview
            </p>

            <h1>
              Good to see you,{" "}
              {user?.firstName ||
                "there"}.
            </h1>

            <p className="dashboard-hero-text">
              Track your electricity,
              understand your spending
              and make smarter energy
              decisions from one place.
            </p>
          </div>

          <div className="dashboard-hero-actions">
            <Link
              to="/predictions"
              className="dashboard-primary-action"
            >
              Run prediction
              <span>→</span>
            </Link>

            <Link
              to="/tariff-intelligence"
              className="dashboard-glass-action"
            >
              Tariff intelligence
            </Link>
          </div>
        </div>

        {households.length > 0 && (
          <div className="dashboard-household-switcher">
            <div>
              <span className="dashboard-small-label">
                Active household
              </span>

              <strong>
                {selectedHousehold
                  ?.householdName ||
                  "Household"}
              </strong>
            </div>

            <select
              value={householdId}
              onChange={(event) =>
                setHouseholdId(
                  event.target.value
                )
              }
            >
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
        )}
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="dashboard-glass-panel dashboard-loading">
          <div className="spinner" />

          <p>
            Loading your energy
            overview...
          </p>
        </div>
      ) : households.length ===
        0 ? (
        <div className="dashboard-glass-panel">
          <EmptyState
            title="Create your first household"
            message="Your dashboard will start showing electricity insights after you create a household."
            action={
              <Link to="/households">
                <Button
                  variant="secondary"
                  size="sm"
                >
                  Create household
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <section className="dashboard-metric-grid">
            <article className="dashboard-metric-card">
              <div className="dashboard-metric-icon">
                ⚡
              </div>

              <span className="dashboard-small-label">
                This month
              </span>

              <div className="dashboard-metric-value">
                {analytics
                  ? formatKwh(
                      analytics.totalConsumptionKwh
                    )
                  : "—"}

                <span>
                  kWh
                </span>
              </div>

              <p>
                Recorded household
                consumption.
              </p>
            </article>

            <article className="dashboard-metric-card dashboard-metric-card-burgundy">
              <div className="dashboard-metric-icon">
                ₨
              </div>

              <span className="dashboard-small-label">
                Predicted bill
              </span>

              <div className="dashboard-metric-value dashboard-metric-value-currency">
                {latestPrediction
                  ? formatCurrency(
                      latestPrediction.predictedBillAmount
                    )
                  : "—"}
              </div>

              <p>
                {latestPrediction
                  ? "Latest saved prediction."
                  : "Run your first prediction."}
              </p>
            </article>

            <article
              className={`dashboard-metric-card dashboard-tone-${budgetTone(
                currentBudget?.status
              )}`}
            >
              <div className="dashboard-metric-icon">
                ◔
              </div>

              <span className="dashboard-small-label">
                Monthly budget
              </span>

              <div className="dashboard-metric-value dashboard-metric-value-currency">
                {currentBudget
                  ? formatCurrency(
                      currentBudget.budgetAmount
                    )
                  : "—"}
              </div>

              <p>
                {currentBudget
                  ? budgetStatusText(
                      currentBudget.status
                    )
                  : "No budget set yet."}
              </p>
            </article>

            <article
              className={`dashboard-metric-card dashboard-tone-${goalTone(
                activeGoal?.status
              )}`}
            >
              <div className="dashboard-metric-icon">
                ◎
              </div>

              <span className="dashboard-small-label">
                Energy goal
              </span>

              <div className="dashboard-metric-value">
                {activeGoal
                  ? formatKwh(
                      activeGoal.targetValue
                    )
                  : "—"}

                {activeGoal && (
                  <span>
                    kWh
                  </span>
                )}
              </div>

              <p>
                {activeGoal
                  ? goalStatusText(
                      activeGoal.status
                    )
                  : "No active energy goal."}
              </p>
            </article>
          </section>

          <section className="dashboard-main-grid">
            <article className="dashboard-glass-panel dashboard-budget-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p className="dashboard-kicker">
                    Monthly budget
                  </p>

                  <h2>
                    Budget position
                  </h2>
                </div>

                <Link
                  to="/budget"
                  className="dashboard-text-link"
                >
                  View budget
                </Link>
              </div>

              {currentBudget ? (
                <>
                  <div className="dashboard-budget-summary">
                    <div>
                      <span>
                        Estimated
                      </span>

                      <strong>
                        {formatCurrency(
                          currentBudget.currentEstimatedAmount ||
                            0
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Limit
                      </span>

                      <strong>
                        {formatCurrency(
                          currentBudget.budgetAmount
                        )}
                      </strong>
                    </div>
                  </div>

                  <BlockMeter
                    percent={
                      budgetPercent
                    }
                    thresholdPercent={
                      Number(
                        currentBudget.warningThreshold ||
                          80
                      )
                    }
                    leftLabel=""
                    rightLabel=""
                  />

                  <div className="dashboard-budget-foot">
                    <span>
                      {budgetPercent.toFixed(
                        0
                      )}
                      % of budget
                    </span>

                    <strong>
                      {budgetStatusText(
                        currentBudget.status
                      )}
                    </strong>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No budget this month"
                  message="Set a monthly budget to compare it with your predicted electricity bill."
                  action={
                    <Link to="/budget">
                      <Button
                        variant="secondary"
                        size="sm"
                      >
                        Set budget
                      </Button>
                    </Link>
                  }
                />
              )}
            </article>

            <article className="dashboard-glass-panel dashboard-appliance-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p className="dashboard-kicker">
                    Usage insight
                  </p>

                  <h2>
                    Highest consumer
                  </h2>
                </div>

                <Link
                  to="/analytics"
                  className="dashboard-text-link"
                >
                  Analytics
                </Link>
              </div>

              {highestAppliance ? (
                <div className="dashboard-appliance-content">
                  <div className="dashboard-appliance-icon">
                    ⚡
                  </div>

                  <div>
                    <span className="dashboard-small-label">
                      Appliance
                    </span>

                    <h3>
                      {
                        highestAppliance.applianceName
                      }
                    </h3>

                    <div className="dashboard-appliance-stats">
                      <div>
                        <span>
                          Consumption
                        </span>

                        <strong>
                          {formatKwh(
                            highestAppliance.totalConsumptionKwh
                          )}{" "}
                          kWh
                        </strong>
                      </div>

                      <div>
                        <span>
                          Share
                        </span>

                        <strong>
                          {highestAppliance.percentageShare !==
                            null &&
                          highestAppliance.percentageShare !==
                            undefined
                            ? `${Number(
                                highestAppliance.percentageShare
                              ).toFixed(
                                1
                              )}%`
                            : "—"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Nothing to compare yet"
                  message="Record appliance usage and the highest consumer will appear here."
                  action={
                    <Link to="/usage">
                      <Button
                        variant="secondary"
                        size="sm"
                      >
                        Record usage
                      </Button>
                    </Link>
                  }
                />
              )}
            </article>
          </section>

          <section className="dashboard-feature-grid">
            <article className="dashboard-recommendation-card">
              <div className="dashboard-recommendation-head">
                <div>
                  <p className="dashboard-kicker dashboard-kicker-light">
                    Smart recommendation
                  </p>

                  <h2>
                    Energy advice for your home
                  </h2>
                </div>

                <span className="dashboard-ai-pill">
                  AI + ML
                </span>
              </div>

              {latestRecommendation ? (
                <>
                  <h3>
                    {
                      latestRecommendation.recommendationTitle
                    }
                  </h3>

                  <p>
                    {
                      latestRecommendation.recommendationDescription
                    }
                  </p>

                  <Link
                    to="/recommendations"
                    className="dashboard-light-link"
                  >
                    View recommendations
                    <span>→</span>
                  </Link>
                </>
              ) : (
                <>
                  <h3>
                    No recommendation yet
                  </h3>

                  <p>
                    Generate personalized
                    energy-saving advice
                    from your household
                    data.
                  </p>

                  <Link
                    to="/recommendations"
                    className="dashboard-light-link"
                  >
                    Open recommendations
                    <span>→</span>
                  </Link>
                </>
              )}
            </article>

            <article className="dashboard-glass-panel dashboard-goal-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p className="dashboard-kicker">
                    Energy target
                  </p>

                  <h2>
                    Goal status
                  </h2>
                </div>

                <Link
                  to="/goals"
                  className="dashboard-text-link"
                >
                  View goals
                </Link>
              </div>

              {activeGoal ? (
                <div className="dashboard-goal-content">
                  <div className="dashboard-goal-ring">
                    <div>
                      <strong>
                        {formatKwh(
                          activeGoal.targetValue
                        )}
                      </strong>

                      <span>
                        kWh target
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="dashboard-small-label">
                      Current status
                    </span>

                    <h3>
                      {goalStatusText(
                        activeGoal.status
                      )}
                    </h3>

                    <p>
                      Keep monitoring your
                      electricity usage to
                      stay within your
                      target.
                    </p>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No active goal"
                  message="Create an energy target to monitor your monthly consumption."
                  action={
                    <Link to="/goals">
                      <Button
                        variant="secondary"
                        size="sm"
                      >
                        Create goal
                      </Button>
                    </Link>
                  }
                />
              )}
            </article>
          </section>

          <section className="dashboard-bottom-grid">
            <article className="dashboard-glass-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p className="dashboard-kicker">
                    Alerts
                  </p>

                  <h2>
                    Recent notifications
                  </h2>
                </div>

                <Link
                  to="/notifications"
                  className="dashboard-text-link"
                >
                  View all
                </Link>
              </div>

              {recentNotifications.length >
              0 ? (
                <div className="dashboard-notification-list">
                  {recentNotifications.map(
                    (
                      notification
                    ) => (
                      <div
                        key={
                          notification.notificationId
                        }
                        className={`dashboard-notification-item ${
                          notification.isRead
                            ? ""
                            : "dashboard-notification-unread"
                        }`}
                      >
                        <div className="dashboard-notification-dot" />

                        <div>
                          <strong>
                            {
                              notification.notificationTitle
                            }
                          </strong>

                          <p>
                            {notificationTypeLabel(
                              notification.notificationType
                            )}
                          </p>

                          <span>
                            {formatDate(
                              notification.createdDate
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <EmptyState
                  title="Nothing to report"
                  message="Budget and energy-goal alerts will appear here."
                />
              )}
            </article>

            <article className="dashboard-glass-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p className="dashboard-kicker">
                    Quick access
                  </p>

                  <h2>
                    Energy tools
                  </h2>
                </div>
              </div>

              <div className="dashboard-tool-grid">
                <Link
                  to="/predictions"
                  className="dashboard-tool-card"
                >
                  <span>
                    ◈
                  </span>

                  <div>
                    <strong>
                      Predictions
                    </strong>

                    <p>
                      Forecast next month.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/tariff-intelligence"
                  className="dashboard-tool-card"
                >
                  <span>
                    ₨
                  </span>

                  <div>
                    <strong>
                      Tariff intelligence
                    </strong>

                    <p>
                      Explore tariff blocks.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/analytics"
                  className="dashboard-tool-card"
                >
                  <span>
                    ◔
                  </span>

                  <div>
                    <strong>
                      Analytics
                    </strong>

                    <p>
                      Understand your usage.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/recommendations"
                  className="dashboard-tool-card"
                >
                  <span>
                    ✦
                  </span>

                  <div>
                    <strong>
                      Recommendations
                    </strong>

                    <p>
                      Get saving advice.
                    </p>
                  </div>
                </Link>
              </div>
            </article>
          </section>

          <section className="dashboard-setup-section">
            <div className="dashboard-section-heading">
              <div>
                <p className="dashboard-kicker">
                  Household profile
                </p>

                <h2>
                  Complete your energy setup
                </h2>
              </div>
            </div>

            <div className="dashboard-setup-grid">
              {STEPS.map(
                (
                  step,
                  index
                ) => (
                  <Link
                    to={step.to}
                    className="dashboard-setup-card"
                    key={
                      step.title
                    }
                  >
                    <span className="dashboard-setup-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <strong>
                      {
                        step.title
                      }
                    </strong>

                    <p>
                      {
                        step.text
                      }
                    </p>

                    <span className="dashboard-setup-arrow">
                      →
                    </span>
                  </Link>
                )
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}