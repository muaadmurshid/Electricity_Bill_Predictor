import { useEffect, useMemo, useState } from "react";

import householdService from "../services/householdService";
import tariffService from "../services/tariffService";
import predictionService from "../services/predictionService";

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

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatKwh(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Number(value).toFixed(3)} kWh`;
}

function formatTargetMonth(value) {
  if (!value) {
    return "—";
  }

  const [year, month] = String(value).split("-");

  if (!year || !month) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(
    new Date(
      Number(year),
      Number(month) - 1,
      1
    )
  );
}

export default function Predictions() {
  const currentDate = new Date();

  const [households, setHouseholds] = useState([]);
  const [tariffs, setTariffs] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    selectedTariffId,
    setSelectedTariffId,
  ] = useState("");

  const [year, setYear] = useState(
    currentDate.getFullYear()
  );

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1
  );

  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    initialise();
  }, []);

  useEffect(() => {
    if (selectedHouseholdId) {
      loadPredictionData(selectedHouseholdId);
    } else {
      setLatest(null);
      setHistory([]);
    }
  }, [selectedHouseholdId]);

  async function initialise() {
    try {
      setLoading(true);
      setError("");

      const [
        householdData,
        tariffData,
      ] = await Promise.all([
        householdService.list(),
        tariffService.list(),
      ]);

      const householdList =
        Array.isArray(householdData)
          ? householdData
          : [];

      const tariffList =
        Array.isArray(tariffData)
          ? tariffData
          : [];

      const activeTariffs =
        tariffList.filter(
          (tariff) =>
            String(
              tariff.status || ""
            ).toUpperCase() === "ACTIVE"
        );

      setHouseholds(householdList);
      setTariffs(activeTariffs);

      if (householdList.length > 0) {
        setSelectedHouseholdId(
          String(
            householdList[0].householdId
          )
        );
      }

      if (activeTariffs.length > 0) {
        setSelectedTariffId(
          String(
            activeTariffs[0].tariffId
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to initialise prediction page:",
        err
      );

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load prediction information."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadPredictionData(
    householdId
  ) {
    try {
      setLoading(true);
      setError("");

      const historyRequest =
        predictionService
          .history(householdId)
          .catch(() => []);

      const latestRequest =
        predictionService
          .latest(householdId)
          .catch((err) => {
            if (
              err?.response?.status === 404
            ) {
              return null;
            }

            throw err;
          });

      const [
        historyData,
        latestData,
      ] = await Promise.all([
        historyRequest,
        latestRequest,
      ]);

      setHistory(
        Array.isArray(historyData)
          ? historyData
          : []
      );

      setLatest(latestData || null);
    } catch (err) {
      console.error(
        "Failed to load prediction history:",
        err
      );

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load prediction history."
      );
    } finally {
      setLoading(false);
    }
  }

  function validatePrediction() {
    if (!selectedHouseholdId) {
      setError(
        "Please select a household."
      );

      return false;
    }

    if (!selectedTariffId) {
      setError(
        "Please select an active tariff."
      );

      return false;
    }

    const numericYear =
      Number(year);

    const numericMonth =
      Number(month);

    if (
      !Number.isInteger(
        numericYear
      ) ||
      numericYear < 2000 ||
      numericYear > 2100
    ) {
      setError(
        "Please enter a valid prediction year."
      );

      return false;
    }

    if (
      !Number.isInteger(
        numericMonth
      ) ||
      numericMonth < 1 ||
      numericMonth > 12
    ) {
      setError(
        "Please select a valid prediction month."
      );

      return false;
    }

    return true;
  }

  async function handlePredict(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validatePrediction()) {
      return;
    }

    try {
      setPredicting(true);

      const result =
        await predictionService.predict({
          householdId: Number(
            selectedHouseholdId
          ),

          tariffId: Number(
            selectedTariffId
          ),

          year: Number(year),

          month: Number(month),
        });

      setLatest(result);

      setSuccess(
        "Prediction completed and saved successfully."
      );

      await loadPredictionData(
        selectedHouseholdId
      );
    } catch (err) {
      console.error(
        "Prediction failed:",
        err
      );

      const status =
        err?.response?.status;

      if (!err?.response) {
        setError(
          "The prediction service could not be reached. Check that Spring Boot is running on port 8080 and the ML service is running on port 8000."
        );
      } else if (
        status === 400
      ) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "The prediction could not be created. Check that enough historical usage data exists for the selected household and month."
        );
      } else if (
        status === 500 ||
        status === 502 ||
        status === 503
      ) {
        setError(
          "The machine-learning prediction service is currently unavailable or failed to process the request. Check the FastAPI service on port 8000."
        );
      } else {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to generate the bill prediction."
        );
      }
    } finally {
      setPredicting(false);
    }
  }

  const sortedHistory =
    useMemo(() => {
      return [...history].sort(
        (a, b) => {
          const dateA =
            new Date(
              a.predictionDate ||
                a.targetMonth ||
                0
            );

          const dateB =
            new Date(
              b.predictionDate ||
                b.targetMonth ||
                0
            );

          return dateB - dateA;
        }
      );
    }, [history]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>
          INSIGHT
        </p>

        <h1 style={styles.title}>
          Predictions
        </h1>

        <p style={styles.lead}>
          Predict upcoming household
          electricity consumption and the
          estimated bill using the trained
          machine-learning model and the
          selected Sri Lankan electricity
          tariff.
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

      <section style={styles.formCard}>
        <form
          onSubmit={handlePredict}
        >
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>
                Household
              </label>

              <select
                value={
                  selectedHouseholdId
                }
                onChange={(event) =>
                  setSelectedHouseholdId(
                    event.target.value
                  )
                }
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
              <label style={styles.label}>
                Tariff
              </label>

              <select
                value={
                  selectedTariffId
                }
                onChange={(event) =>
                  setSelectedTariffId(
                    event.target.value
                  )
                }
                style={styles.input}
              >
                <option value="">
                  Select active tariff
                </option>

                {tariffs.map(
                  (tariff) => (
                    <option
                      key={
                        tariff.tariffId
                      }
                      value={
                        tariff.tariffId
                      }
                    >
                      {tariff.tariffName}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label style={styles.label}>
                Target year
              </label>

              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) =>
                  setYear(
                    event.target.value
                  )
                }
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Target month
              </label>

              <select
                value={month}
                onChange={(event) =>
                  setMonth(
                    event.target.value
                  )
                }
                style={styles.input}
              >
                {MONTHS.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div style={styles.predictArea}>
            <p style={styles.formNote}>
              The frontend sends this request
              to Spring Boot. Spring Boot
              builds the ML input, calls the
              FastAPI/XGBoost service,
              calculates the tariff bill and
              saves the result.
            </p>

            <button
              type="submit"
              style={styles.primaryButton}
              disabled={
                predicting ||
                loading ||
                !selectedHouseholdId ||
                !selectedTariffId
              }
            >
              {predicting
                ? "Running prediction..."
                : "Run prediction"}
            </button>
          </div>
        </form>
      </section>

      <div style={styles.summaryGrid}>
        <section style={styles.summaryCard}>
          <p style={styles.summaryLabel}>
            Predicted consumption
          </p>

          <h2 style={styles.summaryValue}>
            {latest
              ? formatKwh(
                  latest.predictedConsumptionKwh
                )
              : "—"}
          </h2>

          <p style={styles.summarySub}>
            {latest
              ? formatTargetMonth(
                  latest.targetMonth
                )
              : "No prediction yet"}
          </p>
        </section>

        <section style={styles.summaryCard}>
          <p style={styles.summaryLabel}>
            Predicted bill
          </p>

          <h2 style={styles.summaryValue}>
            {latest
              ? formatCurrency(
                  latest.predictedBillAmount
                )
              : "—"}
          </h2>

          <p style={styles.summarySub}>
            Estimated electricity bill
          </p>
        </section>

        <section style={styles.summaryCard}>
          <p style={styles.summaryLabel}>
            Lower estimate
          </p>

          <h2 style={styles.summaryValue}>
            {latest?.lowerEstimate !==
            null &&
            latest?.lowerEstimate !==
              undefined
              ? formatKwh(
                  latest.lowerEstimate
                )
              : "—"}
          </h2>

          <p style={styles.summarySub}>
            Prediction range
          </p>
        </section>

        <section style={styles.summaryCard}>
          <p style={styles.summaryLabel}>
            Upper estimate
          </p>

          <h2 style={styles.summaryValue}>
            {latest?.upperEstimate !==
            null &&
            latest?.upperEstimate !==
              undefined
              ? formatKwh(
                  latest.upperEstimate
                )
              : "—"}
          </h2>

          <p style={styles.summarySub}>
            Prediction range
          </p>
        </section>
      </div>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <p style={styles.cardEyebrow}>
              LATEST
            </p>

            <h2 style={styles.cardTitle}>
              Latest prediction
            </h2>
          </div>

          {latest && (
            <span style={styles.statusBadge}>
              {latest.predictionStatus}
            </span>
          )}
        </div>

        {loading ? (
          <p style={styles.muted}>
            Loading prediction...
          </p>
        ) : !latest ? (
          <p style={styles.muted}>
            No saved prediction exists for
            this household yet.
          </p>
        ) : (
          <div style={styles.detailGrid}>
            <div>
              <p style={styles.detailLabel}>
                Target month
              </p>

              <strong>
                {formatTargetMonth(
                  latest.targetMonth
                )}
              </strong>
            </div>

            <div>
              <p style={styles.detailLabel}>
                Prediction date
              </p>

              <strong>
                {latest.predictionDate ||
                  "—"}
              </strong>
            </div>

            <div>
              <p style={styles.detailLabel}>
                Tariff
              </p>

              <strong>
                {latest.tariff?.tariffName ||
                  `Tariff ${
                    latest.tariff?.tariffId ??
                    ""
                  }`}
              </strong>
            </div>

            <div>
              <p style={styles.detailLabel}>
                Prediction ID
              </p>

              <strong>
                {latest.predictionId}
              </strong>
            </div>
          </div>
        )}
      </section>

      <section
        style={{
          ...styles.card,
          marginTop: "22px",
        }}
      >
        <div style={styles.cardHeader}>
          <div>
            <p style={styles.cardEyebrow}>
              HISTORY
            </p>

            <h2 style={styles.cardTitle}>
              Prediction history
            </h2>
          </div>

          <span style={styles.historyCount}>
            {sortedHistory.length}
          </span>
        </div>

        {loading ? (
          <p style={styles.muted}>
            Loading prediction history...
          </p>
        ) : sortedHistory.length === 0 ? (
          <p style={styles.muted}>
            No prediction history exists for
            this household.
          </p>
        ) : (
          <div style={styles.historyList}>
            {sortedHistory.map(
              (prediction) => (
                <div
                  key={
                    prediction.predictionId
                  }
                  style={styles.historyItem}
                >
                  <div>
                    <h3 style={styles.historyTitle}>
                      {formatTargetMonth(
                        prediction.targetMonth
                      )}
                    </h3>

                    <p style={styles.detail}>
                      <strong>
                        Consumption:
                      </strong>{" "}
                      {formatKwh(
                        prediction.predictedConsumptionKwh
                      )}
                    </p>

                    <p style={styles.detail}>
                      <strong>
                        Predicted bill:
                      </strong>{" "}
                      {formatCurrency(
                        prediction.predictedBillAmount
                      )}
                    </p>

                    <p style={styles.detail}>
                      <strong>
                        Prediction date:
                      </strong>{" "}
                      {prediction.predictionDate}
                    </p>

                    <p style={styles.detail}>
                      <strong>
                        Tariff:
                      </strong>{" "}
                      {prediction.tariff?.tariffName ||
                        "—"}
                    </p>
                  </div>

                  <span style={styles.statusBadge}>
                    {
                      prediction.predictionStatus
                    }
                  </span>
                </div>
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
    border: "1px solid #e5b4b4",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#9a1f1f",
  },

  success: {
    padding: "14px 16px",
    marginBottom: "20px",
    border: "1px solid #b9d8b9",
    borderRadius: "10px",
    background: "#effbef",
    color: "#286428",
  },

  formCard: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "22px",
    boxShadow:
      "0 2px 8px rgba(0, 0, 0, 0.04)",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
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

  predictArea: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    marginTop: "18px",
  },

  formNote: {
    margin: 0,
    maxWidth: "700px",
    color: "#806d6d",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  primaryButton: {
    padding: "11px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#7f0000",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "20px",
    boxShadow:
      "0 2px 8px rgba(0, 0, 0, 0.04)",
  },

  summaryLabel: {
    margin: "0 0 10px",
    color: "#7a5c5c",
    fontSize: "13px",
    fontWeight: 600,
  },

  summaryValue: {
    margin: "0 0 8px",
    color: "#3f1515",
    fontSize: "24px",
  },

  summarySub: {
    margin: 0,
    color: "#806d6d",
    fontSize: "13px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "24px",
    boxShadow:
      "0 2px 8px rgba(0, 0, 0, 0.04)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
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

  statusBadge: {
    borderRadius: "999px",
    padding: "6px 11px",
    background: "#fff1d7",
    color: "#765b16",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.04em",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },

  detailLabel: {
    margin: "0 0 5px",
    color: "#806d6d",
    fontSize: "13px",
  },

  historyCount: {
    minWidth: "28px",
    height: "28px",
    display: "grid",
    placeItems: "center",
    borderRadius: "999px",
    background: "#7f0000",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    padding: "18px",
    border: "1px solid #eadede",
    borderRadius: "10px",
    background: "#fffafa",
  },

  historyTitle: {
    margin: "0 0 10px",
  },

  detail: {
    margin: "6px 0",
    color: "#5f5050",
  },

  muted: {
    color: "#806d6d",
  },
};