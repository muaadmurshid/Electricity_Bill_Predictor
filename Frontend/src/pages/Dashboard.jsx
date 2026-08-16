import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
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
    text: "Name, location, house type and how many people live there.",
    to: "/households",
  },
  {
    title: "Add your rooms",
    text: "Living room, kitchen, bedrooms — whatever your home has.",
    to: "/rooms",
  },
  {
    title: "Add your appliances",
    text: "Rated power in watts, quantity, and the room each one is in.",
    to: "/appliances",
  },
  {
    title: "Record daily usage",
    text: "How many hours each appliance ran. Consumption is worked out for you.",
    to: "/usage",
  },
  {
    title: "Add your past bills",
    text: "Older bills help build your household energy history.",
    to: "/bills",
  },
  {
    title: "Set a budget and a goal",
    text: "Monitor your predicted bill and monthly energy target.",
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

  const start =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

  const end =
    new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );

  return {
    startDate:
      toDateString(start),

    endDate:
      toDateString(end),

    year:
      now.getFullYear(),

    month:
      now.getMonth() + 1,
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
      3
    );

  const recentNotifications =
    notifications.slice(
      0,
      3
    );

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Hello, ${
          user?.firstName ||
          "there"
        }`}
        lead="Your electricity at a glance — recent consumption, predicted cost, budget position and energy goal progress."
        action={
          <Link to="/predictions">
            <Button variant="secondary">
              Run a prediction
            </Button>
          </Link>
        }
      />

      <div className="stack">
        {error && (
          <div
            style={{
              padding:
                "14px 16px",
              borderRadius: "10px",
              background:
                "#fff0f0",
              color:
                "#9a1f1f",
            }}
          >
            {error}
          </div>
        )}

        {households.length > 0 && (
          <Card
            title="Household"
            subtitle="Choose the home shown on your dashboard"
          >
            <select
              value={
                householdId
              }
              onChange={(event) =>
                setHouseholdId(
                  event.target.value
                )
              }
              style={{
                width:
                  "min(100%, 420px)",
                padding:
                  "11px 12px",
                border:
                  "1px solid #d8caca",
                borderRadius:
                  "8px",
                background:
                  "#ffffff",
              }}
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
          </Card>
        )}

        {loading ? (
          <Card>
            <p className="muted">
              Loading dashboard...
            </p>
          </Card>
        ) : households.length ===
          0 ? (
          <Card>
            <EmptyState
              title="Create your first household"
              message="Your dashboard will start showing electricity information after you create a household."
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
          </Card>
        ) : (
          <>
            <div className="grid grid-4">
              <StatCard
                label="This month"
                value={
                  analytics
                    ? formatKwh(
                        analytics.totalConsumptionKwh
                      )
                    : "—"
                }
                unit="kWh"
                note={
                  analytics
                    ? "Recorded consumption this month."
                    : "Record daily usage to see this."
                }
                tone="neutral"
              />

              <StatCard
                label="Predicted bill"
                value={
                  latestPrediction
                    ? formatCurrency(
                        latestPrediction.predictedBillAmount
                      )
                    : "—"
                }
                note={
                  latestPrediction
                    ? "Latest saved prediction."
                    : "Available after your first prediction."
                }
                tone="neutral"
              />

              <StatCard
                label="Monthly budget"
                value={
                  currentBudget
                    ? formatCurrency(
                        currentBudget.budgetAmount
                      )
                    : "—"
                }
                note={
                  currentBudget
                    ? budgetStatusText(
                        currentBudget.status
                      )
                    : "No budget set for this month."
                }
                tone={
                  currentBudget
                    ? budgetTone(
                        currentBudget.status
                      )
                    : "neutral"
                }
              />

              <StatCard
                label="Energy goal"
                value={
                  activeGoal
                    ? formatKwh(
                        activeGoal.targetValue
                      )
                    : "—"
                }
                unit={
                  activeGoal
                    ? "kWh"
                    : ""
                }
                note={
                  activeGoal
                    ? goalStatusText(
                        activeGoal.status
                      )
                    : "No active goal."
                }
                tone={
                  activeGoal
                    ? goalTone(
                        activeGoal.status
                      )
                    : "neutral"
                }
              />
            </div>

            <div className="grid grid-2">
              <Card
                title="Budget usage"
                subtitle="Predicted bill against your monthly budget"
                action={
                  <Link
                    to="/budget"
                    className="text-sm"
                  >
                    View budget
                  </Link>
                }
              >
                {currentBudget ? (
                  <>
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
                      leftLabel={formatCurrency(
                        currentBudget.currentEstimatedAmount ||
                          0
                      )}
                      rightLabel={formatCurrency(
                        currentBudget.budgetAmount
                      )}
                    />

                    <p
                      className="text-sm muted"
                      style={{
                        marginTop:
                          "var(--space-4)",
                      }}
                    >
                      Status:{" "}
                      <strong>
                        {budgetStatusText(
                          currentBudget.status
                        )}
                      </strong>
                    </p>
                  </>
                ) : (
                  <EmptyState
                    title="No budget this month"
                    message="Set a monthly budget to compare it with your predicted bill."
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
              </Card>

              <Card
                title="Highest consuming appliance"
                subtitle="Where most of your recorded electricity goes this month"
              >
                {highestAppliance ? (
                  <div>
                    <p
                      style={{
                        margin:
                          "0 0 8px",
                        fontSize:
                          "20px",
                        fontWeight:
                          700,
                      }}
                    >
                      {
                        highestAppliance.applianceName
                      }
                    </p>

                    <p className="muted">
                      Consumption:{" "}
                      <strong>
                        {formatKwh(
                          highestAppliance.totalConsumptionKwh
                        )}{" "}
                        kWh
                      </strong>
                    </p>

                    {highestAppliance.percentageShare !==
                      null &&
                      highestAppliance.percentageShare !==
                        undefined && (
                      <p className="muted">
                        Share:{" "}
                        <strong>
                          {Number(
                            highestAppliance.percentageShare
                          ).toFixed(
                            1
                          )}
                          %
                        </strong>
                      </p>
                    )}
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
              </Card>
            </div>

            <Card
              title={
                selectedHousehold
                  ? `${selectedHousehold.householdName} setup`
                  : "Getting started"
              }
              subtitle="Main steps for building your household electricity profile"
            >
              <ol className="steps">
                {STEPS.map(
                  (
                    step,
                    index
                  ) => (
                    <li
                      className="step"
                      key={
                        step.title
                      }
                    >
                      <span className="step-num">
                        {index +
                          1}
                      </span>

                      <div>
                        <Link
                          to={
                            step.to
                          }
                          className="step-title"
                        >
                          {
                            step.title
                          }
                        </Link>

                        <p className="step-text">
                          {
                            step.text
                          }
                        </p>
                      </div>
                    </li>
                  )
                )}
              </ol>
            </Card>

            <div className="grid grid-2">
              <Card
                title="Recent recommendations"
                action={
                  <Link
                    to="/recommendations"
                    className="text-sm"
                  >
                    View all
                  </Link>
                }
              >
                {recentRecommendations.length >
                0 ? (
                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "14px",
                    }}
                  >
                    {recentRecommendations.map(
                      (
                        recommendation
                      ) => (
                        <div
                          key={
                            recommendation.recommendationId
                          }
                          style={{
                            padding:
                              "14px",
                            border:
                              "1px solid #eadede",
                            borderRadius:
                              "10px",
                            background:
                              "#fffafa",
                          }}
                        >
                          <strong>
                            {
                              recommendation.recommendationTitle
                            }
                          </strong>

                          <p
                            className="text-sm muted"
                            style={{
                              margin:
                                "6px 0 0",
                            }}
                          >
                            {
                              recommendation.recommendationDescription
                            }
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title="No recommendations yet"
                    message="Saved energy-saving recommendations will appear here."
                    action={
                      <Link to="/recommendations">
                        <Button
                          variant="secondary"
                          size="sm"
                        >
                          Open recommendations
                        </Button>
                      </Link>
                    }
                  />
                )}
              </Card>

              <Card
                title="Recent notifications"
                action={
                  <Link
                    to="/notifications"
                    className="text-sm"
                  >
                    View all
                  </Link>
                }
              >
                {recentNotifications.length >
                0 ? (
                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "12px",
                    }}
                  >
                    {recentNotifications.map(
                      (
                        notification
                      ) => (
                        <div
                          key={
                            notification.notificationId
                          }
                          style={{
                            padding:
                              "14px",
                            border:
                              "1px solid #eadede",
                            borderLeft:
                              notification.isRead
                                ? "1px solid #eadede"
                                : "4px solid #7f0000",
                            borderRadius:
                              "10px",
                            background:
                              notification.isRead
                                ? "#ffffff"
                                : "#fffafa",
                          }}
                        >
                          <strong>
                            {
                              notification.notificationTitle
                            }
                          </strong>

                          <p
                            className="text-sm muted"
                            style={{
                              margin:
                                "5px 0",
                            }}
                          >
                            {notificationTypeLabel(
                              notification.notificationType
                            )}
                          </p>

                          <span
                            className="text-sm muted"
                          >
                            {formatDate(
                              notification.createdDate
                            )}
                          </span>
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
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}