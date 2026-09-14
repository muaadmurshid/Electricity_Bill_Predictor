import {
  useEffect,
  useMemo,
  useState,
} from "react";

import householdService from "../services/householdService";
import recommendationService from "../services/recommendationService";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function getMonthName(month) {
  return (
    MONTHS.find(
      (item) =>
        item.value ===
        Number(month)
    )?.label || month
  );
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

  return `${Number(value).toFixed(
    3
  )} kWh`;
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

function priorityClass(priority) {
  switch (priority) {
    case "HIGH":
      return "recommendation-priority-high";

    case "MEDIUM":
      return "recommendation-priority-medium";

    case "LOW":
      return "recommendation-priority-low";

    default:
      return "recommendation-priority-neutral";
  }
}

function typeLabel(type) {
  switch (type) {
    case "APPLIANCE_USAGE":
      return "Appliance usage";

    case "BEHAVIOUR":
      return "Behaviour";

    case "SCHEDULE":
      return "Schedule";

    case "ENERGY_EFFICIENCY":
      return "Energy efficiency";

    default:
      return type || "Recommendation";
  }
}

function makeDateRange(
  year,
  month
) {
  const numericYear =
    Number(year);

  const numericMonth =
    Number(month);

  const lastDay =
    new Date(
      numericYear,
      numericMonth,
      0
    ).getDate();

  const monthText =
    String(
      numericMonth
    ).padStart(2, "0");

  return {
    startDate:
      `${numericYear}-${monthText}-01`,

    endDate:
      `${numericYear}-${monthText}-${String(
        lastDay
      ).padStart(2, "0")}`,
  };
}

function getPredictionMonth(
  prediction
) {
  if (
    prediction?.targetMonth
  ) {
    const target =
      String(
        prediction.targetMonth
      );

    const match =
      target.match(
        /^(\d{4})-(\d{1,2})/
      );

    if (match) {
      return {
        year:
          Number(match[1]),

        month:
          Number(match[2]),
      };
    }
  }

  if (
    prediction?.predictionDate
  ) {
    const date =
      new Date(
        prediction.predictionDate
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return {
        year:
          date.getFullYear(),

        month:
          date.getMonth() + 1,
      };
    }
  }

  return null;
}

function findHighestCategory(
  categoryBreakdown
) {
  if (
    !Array.isArray(
      categoryBreakdown
    ) ||
    categoryBreakdown.length ===
      0
  ) {
    return null;
  }

  return categoryBreakdown.reduce(
    (highest, current) => {
      if (!highest) {
        return current;
      }

      return Number(
        current.totalConsumptionKwh ||
          0
      ) >
        Number(
          highest.totalConsumptionKwh ||
            0
        )
        ? current
        : highest;
    },
    null
  );
}

export default function Recommendations() {
  const today =
    new Date();

  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    recommendations,
    setRecommendations,
  ] = useState([]);

  const [
    predictions,
    setPredictions,
  ] = useState([]);

  const [
    year,
    setYear,
  ] = useState(
    today.getFullYear()
  );

  const [
    month,
    setMonth,
  ] = useState(
    today.getMonth() + 1
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    aiError,
    setAiError,
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
      loadHouseholdData(
        selectedHouseholdId
      );
    } else {
      setRecommendations([]);
      setPredictions([]);
    }
  }, [
    selectedHouseholdId,
  ]);

  async function initialise() {
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

      if (
        list.length > 0
      ) {
        setSelectedHouseholdId(
          String(
            list[0].householdId
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to initialise recommendations:",
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

  async function loadHouseholdData(
    householdId
  ) {
    try {
      setLoading(true);
      setError("");
      setAiError("");

      const [
        recommendationData,
        predictionData,
      ] =
        await Promise.all([
          recommendationService.listByHousehold(
            householdId
          ),

          recommendationService.predictionHistory(
            householdId
          ),
        ]);

      setRecommendations(
        Array.isArray(
          recommendationData
        )
          ? recommendationData
          : []
      );

      const predictionList =
        Array.isArray(
          predictionData
        )
          ? predictionData
          : [];

      setPredictions(
        predictionList
      );

      if (
        predictionList.length >
        0
      ) {
        const latest =
          predictionList[0];

        const period =
          getPredictionMonth(
            latest
          );

        if (period) {
          setYear(
            period.year
          );

          setMonth(
            period.month
          );
        }
      }
    } catch (err) {
      console.error(
        "Failed to load recommendation data:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load recommendation information."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedHousehold =
    useMemo(
      () =>
        households.find(
          (household) =>
            String(
              household.householdId
            ) ===
            String(
              selectedHouseholdId
            )
        ) || null,
      [
        households,
        selectedHouseholdId,
      ]
    );

  const matchingPrediction =
    useMemo(() => {
      return (
        predictions.find(
          (prediction) => {
            const period =
              getPredictionMonth(
                prediction
              );

            return (
              period?.year ===
                Number(year) &&
              period?.month ===
                Number(month)
            );
          }
        ) || null
      );
    }, [
      predictions,
      year,
      month,
    ]);

  async function handleGenerate() {
    setError("");
    setAiError("");
    setSuccess("");

    if (
      !selectedHousehold
    ) {
      setError(
        "Please select a household."
      );

      return;
    }

    if (
      !matchingPrediction
    ) {
      setError(
        `No saved prediction was found for ${getMonthName(
          month
        )} ${year}. Run a bill prediction for this household and month first.`
      );

      return;
    }

    const {
      startDate,
      endDate,
    } = makeDateRange(
      year,
      month
    );

    try {
      setGenerating(true);

      const analytics =
        await recommendationService.analytics(
          selectedHouseholdId,
          startDate,
          endDate
        );

      const highestAppliance =
        analytics
          ?.highestConsumingAppliance ||
        null;

      const highestCategory =
        findHighestCategory(
          analytics
            ?.categoryBreakdown
        );

      const payload = {
        householdId:
          Number(
            selectedHouseholdId
          ),

        householdName:
          selectedHousehold.householdName ||
          "Household",

        year:
          Number(year),

        month:
          Number(month),

        monthlyConsumptionKwh:
          Number(
            analytics
              ?.totalConsumptionKwh ||
              0
          ),

        predictedConsumptionKwh:
          Number(
            matchingPrediction
              .predictedConsumptionKwh ||
              0
          ),

        predictedBillAmount:
          Number(
            matchingPrediction
              .predictedBillAmount ||
              0
          ),

        highestConsumingAppliance:
          highestAppliance
            ?.applianceName ||
          "No appliance data available",

        highestApplianceConsumptionKwh:
          Number(
            highestAppliance
              ?.totalConsumptionKwh ||
              0
          ),

        highestConsumingCategory:
          highestCategory
            ?.categoryName ||
          "No category data available",

        highestCategoryConsumptionKwh:
          Number(
            highestCategory
              ?.totalConsumptionKwh ||
              0
          ),
      };

      await recommendationService.generate(
        payload
      );

      setSuccess(
        "Energy recommendation generated and saved successfully."
      );

      const refreshed =
        await recommendationService.listByHousehold(
          selectedHouseholdId
        );

      setRecommendations(
        Array.isArray(
          refreshed
        )
          ? refreshed
          : []
      );
    } catch (err) {
      console.error(
        "Recommendation generation failed:",
        err
      );

      setAiError(
        "Energy recommendation service is temporarily unavailable."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(
    recommendationId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this recommendation?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        recommendationId
      );

      setError("");
      setSuccess("");
      setAiError("");

      await recommendationService.remove(
        recommendationId
      );

      setRecommendations(
        (previous) =>
          previous.filter(
            (item) =>
              item.recommendationId !==
              recommendationId
          )
      );

      setSuccess(
        "Recommendation deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete recommendation:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to delete recommendation."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const sortedRecommendations =
    useMemo(() => {
      return [
        ...recommendations,
      ].sort(
        (a, b) =>
          new Date(
            b.createdDate || 0
          ) -
          new Date(
            a.createdDate || 0
          )
      );
    }, [recommendations]);

  return (
    <div className="recommendation-redesign">
      <section className="recommendation-redesign-hero">
        <div className="recommendation-redesign-orb recommendation-redesign-orb-one" />
        <div className="recommendation-redesign-orb recommendation-redesign-orb-two" />

        <div className="recommendation-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Intelligent energy advisor
          </p>

          <h1>
            Turn your energy data into
            practical advice.
          </h1>

          <p>
            Our trained recommendation
            model analyses your household
            consumption, prediction and
            appliance usage to choose the
            right energy-saving strategy,
            while AI turns that decision
            into clear household advice.
          </p>
        </div>

        <div className="recommendation-redesign-engine">
          <div className="recommendation-redesign-engine-icon">
            ML
          </div>

          <div>
            <small>
              Decision engine
            </small>

            <strong>
              ML + AI Advisor
            </strong>
          </div>
        </div>

        <div className="recommendation-redesign-generator">
          <div className="recommendation-redesign-controls">
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
                  setAiError("");
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

            <label>
              <span>
                Year
              </span>

              <input
                type="number"
                value={year}
                min="2020"
                max="2100"
                onChange={(event) =>
                  setYear(
                    Number(
                      event.target.value
                    )
                  )
                }
              />
            </label>

            <label>
              <span>
                Month
              </span>

              <select
                value={month}
                onChange={(event) =>
                  setMonth(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                {MONTHS.map(
                  (item) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>
            </label>

            <button
              type="button"
              className="recommendation-redesign-primary"
              onClick={
                handleGenerate
              }
              disabled={
                generating ||
                !selectedHouseholdId ||
                !matchingPrediction
              }
            >
              {generating
                ? "Generating..."
                : "Generate advice"}
            </button>
          </div>

          <div
            className={`recommendation-redesign-prediction ${
              matchingPrediction
                ? "recommendation-redesign-prediction-ready"
                : ""
            }`}
          >
            {matchingPrediction ? (
              <>
                <div className="recommendation-redesign-prediction-status">
                  <span>
                    ✓
                  </span>

                  Prediction ready
                </div>

                <div>
                  <span>
                    Consumption forecast
                  </span>

                  <strong>
                    {formatKwh(
                      matchingPrediction.predictedConsumptionKwh
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Predicted bill
                  </span>

                  <strong>
                    {formatCurrency(
                      matchingPrediction.predictedBillAmount
                    )}
                  </strong>
                </div>
              </>
            ) : (
              <div className="recommendation-redesign-prediction-empty">
                No saved prediction for{" "}
                {getMonthName(month)}{" "}
                {year}. Run a prediction
                first.
              </div>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {aiError && (
        <div className="recommendation-redesign-warning">
          <span>
            !
          </span>

          {aiError}
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

      <section className="recommendation-redesign-intro">
        <div>
          <p className="dashboard-kicker">
            Saved advice
          </p>

          <h2>
            Recommendation history
          </h2>

          <p>
            Review personalized
            energy-saving guidance
            generated for this household.
          </p>
        </div>

        <div className="recommendation-redesign-count">
          <strong>
            {
              sortedRecommendations.length
            }
          </strong>

          <span>
            saved
          </span>
        </div>
      </section>

      {!selectedHouseholdId ? (
        <div className="recommendation-redesign-empty">
          Select a household to view
          recommendations.
        </div>
      ) : loading ? (
        <div className="recommendation-redesign-empty">
          Loading recommendations...
        </div>
      ) : sortedRecommendations.length ===
        0 ? (
        <div className="recommendation-redesign-empty">
          <div className="recommendation-redesign-empty-icon">
            ✦
          </div>

          <h3>
            No recommendations yet
          </h3>

          <p>
            Generate your first energy
            recommendation after creating
            a successful bill prediction.
          </p>
        </div>
      ) : (
        <div className="recommendation-redesign-grid">
          {sortedRecommendations.map(
            (
              recommendation,
              index
            ) => (
              <article
                key={
                  recommendation.recommendationId
                }
                className={`recommendation-redesign-card ${
                  index === 0
                    ? "recommendation-redesign-card-featured"
                    : ""
                }`}
              >
                <div className="recommendation-redesign-card-top">
                  <div className="recommendation-redesign-badges">
                    <span className="recommendation-redesign-type">
                      {typeLabel(
                        recommendation.recommendationType
                      )}
                    </span>

                    <span
                      className={`recommendation-redesign-priority ${priorityClass(
                        recommendation.priority
                      )}`}
                    >
                      {recommendation.priority ||
                        "—"}{" "}
                      priority
                    </span>

                    <span className="recommendation-redesign-status">
                      {recommendation.status ||
                        "—"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="recommendation-redesign-delete"
                    onClick={() =>
                      handleDelete(
                        recommendation.recommendationId
                      )
                    }
                    disabled={
                      deletingId ===
                      recommendation.recommendationId
                    }
                  >
                    {deletingId ===
                    recommendation.recommendationId
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>

                <div className="recommendation-redesign-card-copy">
                  <p className="dashboard-kicker">
                    Energy recommendation
                  </p>

                  <h3>
                    {
                      recommendation.recommendationTitle
                    }
                  </h3>

                  <span className="recommendation-redesign-date">
                    {formatDateTime(
                      recommendation.createdDate
                    )}
                  </span>

                  <p className="recommendation-redesign-description">
                    {recommendation.recommendationDescription ||
                      "No description provided."}
                  </p>
                </div>

                <div className="recommendation-redesign-savings">
                  <div>
                    <span>
                      Estimated energy
                      saving
                    </span>

                    <strong>
                      {formatKwh(
                        recommendation.estimatedSavingKwh
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Estimated bill
                      saving
                    </span>

                    <strong>
                      {formatCurrency(
                        recommendation.estimatedSavingAmount
                      )}
                    </strong>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}