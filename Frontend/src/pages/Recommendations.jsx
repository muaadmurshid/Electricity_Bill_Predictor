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

function priorityStyle(priority) {
  switch (priority) {
    case "HIGH":
      return {
        background: "#fff0f0",
        color: "#9a1f1f",
      };

    case "MEDIUM":
      return {
        background: "#fff4d7",
        color: "#795d12",
      };

    case "LOW":
      return {
        background: "#e9f7e9",
        color: "#286428",
      };

    default:
      return {
        background: "#f1eaea",
        color: "#765f5f",
      };
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
        "AI recommendation generation failed:",
        err
      );

      /*
       * The OpenAI API may currently
       * reject the request because of
       * unavailable quota/credits.
       *
       * Saved recommendations must
       * remain usable even when AI
       * generation is unavailable.
       */
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
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>
          INSIGHT
        </p>

        <h1 style={styles.title}>
          Recommendations
        </h1>

        <p style={styles.lead}>
          Generate personalized
          electricity-saving advice
          using your household
          consumption, prediction and
          appliance analytics. Saved
          recommendations remain
          available even when the AI
          service is temporarily
          unavailable.
        </p>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {aiError && (
        <div style={styles.warning}>
          {aiError}
        </div>
      )}

      {success && (
        <div style={styles.success}>
          {success}
        </div>
      )}

      <section
        style={
          styles.generatorCard
        }
      >
        <div
          style={
            styles.generatorHeader
          }
        >
          <div>
            <p
              style={
                styles.cardEyebrow
              }
            >
              AI ENERGY ADVISOR
            </p>

            <h2
              style={
                styles.cardTitle
              }
            >
              Generate recommendation
            </h2>
          </div>
        </div>

        <div
          style={
            styles.filterGrid
          }
        >
          <div>
            <label
              style={styles.label}
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
                setAiError("");
                setSuccess("");
              }}
              style={styles.input}
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

          <div>
            <label
              style={styles.label}
            >
              Year
            </label>

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
              style={styles.input}
            />
          </div>

          <div>
            <label
              style={styles.label}
            >
              Month
            </label>

            <select
              value={month}
              onChange={(event) =>
                setMonth(
                  Number(
                    event.target.value
                  )
                )
              }
              style={styles.input}
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
          </div>
        </div>

        <div
          style={
            styles.predictionStatus
          }
        >
          {matchingPrediction ? (
            <>
              <div>
                <p
                  style={
                    styles.summaryLabel
                  }
                >
                  Prediction available
                </p>

                <strong>
                  {formatKwh(
                    matchingPrediction.predictedConsumptionKwh
                  )}
                </strong>
              </div>

              <div>
                <p
                  style={
                    styles.summaryLabel
                  }
                >
                  Predicted bill
                </p>

                <strong>
                  {formatCurrency(
                    matchingPrediction.predictedBillAmount
                  )}
                </strong>
              </div>
            </>
          ) : (
            <p
              style={
                styles.muted
              }
            >
              No saved prediction
              found for{" "}
              {getMonthName(month)}{" "}
              {year}.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={
            handleGenerate
          }
          disabled={
            generating ||
            !selectedHouseholdId ||
            !matchingPrediction
          }
          style={{
            ...styles.primaryButton,

            ...(generating ||
            !selectedHouseholdId ||
            !matchingPrediction
              ? styles.disabledButton
              : {}),
          }}
        >
          {generating
            ? "Generating recommendation..."
            : "Generate recommendation"}
        </button>
      </section>

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
              SAVED ADVICE
            </p>

            <h2
              style={
                styles.cardTitle
              }
            >
              Recommendation history
            </h2>
          </div>

          <span
            style={
              styles.countBadge
            }
          >
            {
              sortedRecommendations.length
            }{" "}
            saved
          </span>
        </div>

        {!selectedHouseholdId ? (
          <p style={styles.muted}>
            Select a household to
            view recommendations.
          </p>
        ) : loading ? (
          <p style={styles.muted}>
            Loading recommendations...
          </p>
        ) : sortedRecommendations.length ===
          0 ? (
          <div
            style={
              styles.emptyState
            }
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              No recommendations yet
            </h3>

            <p style={styles.muted}>
              Generate a recommendation
              after creating a successful
              bill prediction for this
              household.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {sortedRecommendations.map(
              (recommendation) => (
                <article
                  key={
                    recommendation.recommendationId
                  }
                  style={
                    styles.recommendationCard
                  }
                >
                  <div
                    style={
                      styles.recommendationTop
                    }
                  >
                    <div>
                      <div
                        style={
                          styles.badges
                        }
                      >
                        <span
                          style={
                            styles.typeBadge
                          }
                        >
                          {typeLabel(
                            recommendation.recommendationType
                          )}
                        </span>

                        <span
                          style={{
                            ...styles.priorityBadge,
                            ...priorityStyle(
                              recommendation.priority
                            ),
                          }}
                        >
                          {recommendation.priority ||
                            "—"}{" "}
                          priority
                        </span>

                        <span
                          style={
                            styles.statusBadge
                          }
                        >
                          {recommendation.status ||
                            "—"}
                        </span>
                      </div>

                      <h3
                        style={
                          styles.recommendationTitle
                        }
                      >
                        {
                          recommendation.recommendationTitle
                        }
                      </h3>

                      <p
                        style={
                          styles.date
                        }
                      >
                        {formatDateTime(
                          recommendation.createdDate
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          recommendation.recommendationId
                        )
                      }
                      disabled={
                        deletingId ===
                        recommendation.recommendationId
                      }
                      style={
                        styles.deleteButton
                      }
                    >
                      {deletingId ===
                      recommendation.recommendationId
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>

                  <p
                    style={
                      styles.description
                    }
                  >
                    {recommendation.recommendationDescription ||
                      "No description provided."}
                  </p>

                  <div
                    style={
                      styles.savingsGrid
                    }
                  >
                    <div
                      style={
                        styles.savingBox
                      }
                    >
                      <p
                        style={
                          styles.summaryLabel
                        }
                      >
                        Estimated energy
                        saving
                      </p>

                      <strong
                        style={
                          styles.savingValue
                        }
                      >
                        {formatKwh(
                          recommendation.estimatedSavingKwh
                        )}
                      </strong>
                    </div>

                    <div
                      style={
                        styles.savingBox
                      }
                    >
                      <p
                        style={
                          styles.summaryLabel
                        }
                      >
                        Estimated bill
                        saving
                      </p>

                      <strong
                        style={
                          styles.savingValue
                        }
                      >
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
    margin: "0 0 10px",
  },

  lead: {
    maxWidth: "850px",
    lineHeight: 1.6,
    color: "#765f5f",
  },

  error: {
    padding: "14px 16px",
    marginBottom: "20px",
    border: "1px solid #e5b4b4",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#9a1f1f",
  },

  warning: {
    padding: "14px 16px",
    marginBottom: "20px",
    border: "1px solid #e6cf91",
    borderRadius: "10px",
    background: "#fff8e3",
    color: "#765711",
  },

  success: {
    padding: "14px 16px",
    marginBottom: "20px",
    border: "1px solid #b9d8b9",
    borderRadius: "10px",
    background: "#effbef",
    color: "#286428",
  },

  generatorCard: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "22px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

  generatorHeader: {
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
    fontSize: "21px",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
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
    border: "1px solid #d8caca",
    borderRadius: "8px",
    fontSize: "15px",
  },

  predictionStatus: {
    display: "flex",
    flexWrap: "wrap",
    gap: "30px",
    marginBottom: "18px",
    padding: "16px",
    borderRadius: "10px",
    background: "#fffafa",
    border: "1px solid #eadede",
  },

  summaryLabel: {
    margin: "0 0 5px",
    color: "#806d6d",
    fontSize: "12px",
  },

  primaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#7f0000",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "24px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },

  countBadge: {
    padding: "6px 11px",
    borderRadius: "999px",
    background: "#f5e8e8",
    color: "#7f0000",
    fontSize: "11px",
    fontWeight: 700,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  recommendationCard: {
    padding: "20px",
    border: "1px solid #eadede",
    borderRadius: "12px",
    background: "#fffafa",
  },

  recommendationTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
  },

  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginBottom: "10px",
  },

  typeBadge: {
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#f5e8e8",
    color: "#7f0000",
    fontSize: "11px",
    fontWeight: 700,
  },

  priorityBadge: {
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
  },

  statusBadge: {
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#eeeeee",
    color: "#5f5050",
    fontSize: "11px",
    fontWeight: 700,
  },

  recommendationTitle: {
    margin: "0 0 5px",
    color: "#351414",
  },

  date: {
    margin: 0,
    color: "#8a7474",
    fontSize: "12px",
  },

  description: {
    margin: "18px 0",
    color: "#5f5050",
    lineHeight: 1.65,
  },

  savingsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px",
  },

  savingBox: {
    padding: "14px",
    borderRadius: "9px",
    background: "#ffffff",
    border: "1px solid #eee3e3",
  },

  savingValue: {
    color: "#3f1515",
  },

  deleteButton: {
    padding: "8px 13px",
    border: "none",
    borderRadius: "7px",
    background: "#a22323",
    color: "#ffffff",
    cursor: "pointer",
  },

  emptyState: {
    padding: "20px",
    borderRadius: "10px",
    background: "#fffafa",
    border: "1px dashed #dbcaca",
  },

  muted: {
    color: "#806d6d",
  },
};