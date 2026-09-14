import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

function formatTargetMonth(value) {
  if (!value) {
    return "—";
  }

  const [year, month] =
    String(value).split("-");

  if (!year || !month) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      Number(year),
      Number(month) - 1,
      1
    )
  );
}

export default function Predictions() {
  const currentDate = new Date();

  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    tariffs,
    setTariffs,
  ] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    selectedTariffId,
    setSelectedTariffId,
  ] = useState("");

  const [
    year,
    setYear,
  ] = useState(
    currentDate.getFullYear()
  );

  const [
    month,
    setMonth,
  ] = useState(
    currentDate.getMonth() + 1
  );

  const [
    latest,
    setLatest,
  ] = useState(null);

  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    predicting,
    setPredicting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  useEffect(() => {
    initialise();
  }, []);

  useEffect(() => {
    if (selectedHouseholdId) {
      loadPredictionData(
        selectedHouseholdId
      );
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
        Array.isArray(
          householdData
        )
          ? householdData
          : [];

      const tariffList =
        Array.isArray(
          tariffData
        )
          ? tariffData
          : [];

      const activeTariffs =
        tariffList.filter(
          (tariff) =>
            String(
              tariff.status ||
                ""
            ).toUpperCase() ===
            "ACTIVE"
        );

      setHouseholds(
        householdList
      );

      setTariffs(
        activeTariffs
      );

      if (
        householdList.length >
        0
      ) {
        setSelectedHouseholdId(
          String(
            householdList[0]
              .householdId
          )
        );
      }

      if (
        activeTariffs.length >
        0
      ) {
        setSelectedTariffId(
          String(
            activeTariffs[0]
              .tariffId
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to initialise prediction page:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
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
              err?.response
                ?.status === 404
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
        Array.isArray(
          historyData
        )
          ? historyData
          : []
      );

      setLatest(
        latestData || null
      );
    } catch (err) {
      console.error(
        "Failed to load prediction history:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load prediction history."
      );
    } finally {
      setLoading(false);
    }
  }

  function validatePrediction() {
    if (
      !selectedHouseholdId
    ) {
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

  async function handlePredict(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !validatePrediction()
    ) {
      return;
    }

    try {
      setPredicting(true);

      const result =
        await predictionService
          .predict({
            householdId:
              Number(
                selectedHouseholdId
              ),

            tariffId:
              Number(
                selectedTariffId
              ),

            year:
              Number(year),

            month:
              Number(month),
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
          err?.response?.data
            ?.error ||
            err?.response?.data
              ?.message ||
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
          err?.response?.data
            ?.error ||
            err?.response?.data
              ?.message ||
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
    <div className="prediction-redesign">
      <section className="prediction-redesign-hero">
        <div className="prediction-redesign-orb prediction-redesign-orb-one" />
        <div className="prediction-redesign-orb prediction-redesign-orb-two" />

        <div className="prediction-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Machine learning forecast
          </p>

          <h1>
            Predict your next
            electricity bill.
          </h1>

          <p>
            Use your household energy
            history and our trained
            XGBoost model to forecast
            upcoming electricity
            consumption and estimate the
            bill using your selected
            tariff.
          </p>
        </div>

        <div className="prediction-redesign-model-badge">
          <span>
            ML
          </span>

          <div>
            <small>
              Forecast engine
            </small>

            <strong>
              XGBoost
            </strong>
          </div>
        </div>

        <form
          className="prediction-redesign-form"
          onSubmit={
            handlePredict
          }
        >
          <label>
            <span>
              Household
            </span>

            <select
              value={
                selectedHouseholdId
              }
              onChange={(event) =>
                setSelectedHouseholdId(
                  event.target.value
                )
              }
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
              Tariff
            </span>

            <select
              value={
                selectedTariffId
              }
              onChange={(event) =>
                setSelectedTariffId(
                  event.target.value
                )
              }
            >
              <option value="">
                Select tariff
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
                    {
                      tariff.tariffName
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
              min="2000"
              max="2100"
              value={year}
              onChange={(event) =>
                setYear(
                  event.target.value
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
                  event.target.value
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
                    {
                      item.label
                    }
                  </option>
                )
              )}
            </select>
          </label>

          <button
            type="submit"
            className="prediction-redesign-primary"
            disabled={
              predicting ||
              loading ||
              !selectedHouseholdId ||
              !selectedTariffId
            }
          >
            {predicting
              ? "Predicting..."
              : "Run prediction"}
          </button>
        </form>
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

      <section className="prediction-redesign-summary">
        <article className="prediction-redesign-stat prediction-redesign-stat-feature">
          <div className="prediction-redesign-stat-icon">
            ⚡
          </div>

          <span>
            Predicted consumption
          </span>

          <strong>
            {latest
              ? formatKwh(
                  latest.predictedConsumptionKwh
                )
              : "—"}
          </strong>

          <p>
            {latest
              ? formatTargetMonth(
                  latest.targetMonth
                )
              : "No prediction yet"}
          </p>
        </article>

        <article className="prediction-redesign-stat prediction-redesign-stat-burgundy">
          <div className="prediction-redesign-stat-icon">
            ₨
          </div>

          <span>
            Predicted bill
          </span>

          <strong>
            {latest
              ? formatCurrency(
                  latest.predictedBillAmount
                )
              : "—"}
          </strong>

          <p>
            Estimated electricity cost.
          </p>
        </article>

        <article className="prediction-redesign-stat">
          <div className="prediction-redesign-stat-icon prediction-redesign-stat-icon-green">
            ↓
          </div>

          <span>
            Lower estimate
          </span>

          <strong>
            {latest?.lowerEstimate !==
              null &&
            latest?.lowerEstimate !==
              undefined
              ? formatKwh(
                  latest.lowerEstimate
                )
              : "—"}
          </strong>

          <p>
            Lower prediction range.
          </p>
        </article>

        <article className="prediction-redesign-stat">
          <div className="prediction-redesign-stat-icon">
            ↑
          </div>

          <span>
            Upper estimate
          </span>

          <strong>
            {latest?.upperEstimate !==
              null &&
            latest?.upperEstimate !==
              undefined
              ? formatKwh(
                  latest.upperEstimate
                )
              : "—"}
          </strong>

          <p>
            Upper prediction range.
          </p>
        </article>
      </section>

      <section className="prediction-redesign-latest">
        <div className="prediction-redesign-latest-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Latest prediction
          </p>

          <h2>
            Your newest energy
            forecast.
          </h2>

          <p>
            The latest saved prediction
            generated for the selected
            household.
          </p>
        </div>

        <div className="prediction-redesign-latest-card">
          {loading ? (
            <div className="prediction-redesign-empty">
              Loading prediction...
            </div>
          ) : !latest ? (
            <div className="prediction-redesign-empty">
              <strong>
                No saved prediction
              </strong>

              <span>
                Run your first prediction
                to see the forecast here.
              </span>
            </div>
          ) : (
            <>
              <div className="prediction-redesign-latest-head">
                <div>
                  <span>
                    Target month
                  </span>

                  <h3>
                    {formatTargetMonth(
                      latest.targetMonth
                    )}
                  </h3>
                </div>

                <span className="prediction-redesign-status">
                  {
                    latest.predictionStatus
                  }
                </span>
              </div>

              <div className="prediction-redesign-latest-values">
                <div>
                  <span>
                    Consumption
                  </span>

                  <strong>
                    {formatKwh(
                      latest.predictedConsumptionKwh
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Estimated bill
                  </span>

                  <strong>
                    {formatCurrency(
                      latest.predictedBillAmount
                    )}
                  </strong>
                </div>
              </div>

              <div className="prediction-redesign-meta">
                <div>
                  <span>
                    Prediction date
                  </span>

                  <strong>
                    {latest.predictionDate ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Tariff
                  </span>

                  <strong>
                    {latest.tariff
                      ?.tariffName ||
                      `Tariff ${
                        latest.tariff
                          ?.tariffId ??
                        ""
                      }`}
                  </strong>
                </div>

                <div>
                  <span>
                    Prediction ID
                  </span>

                  <strong>
                    {
                      latest.predictionId
                    }
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="prediction-redesign-history">
        <div className="prediction-redesign-section-head">
          <div>
            <p className="dashboard-kicker">
              History
            </p>

            <h2>
              Prediction history
            </h2>
          </div>

          <span className="prediction-redesign-history-count">
            {
              sortedHistory.length
            }
          </span>
        </div>

        {loading ? (
          <div className="prediction-redesign-history-empty">
            Loading prediction
            history...
          </div>
        ) : sortedHistory.length ===
          0 ? (
          <div className="prediction-redesign-history-empty">
            No prediction history
            exists for this household.
          </div>
        ) : (
          <div className="prediction-redesign-history-grid">
            {sortedHistory.map(
              (
                prediction
              ) => (
                <article
                  className="prediction-redesign-history-card"
                  key={
                    prediction.predictionId
                  }
                >
                  <div className="prediction-redesign-history-head">
                    <div>
                      <span>
                        Forecast
                      </span>

                      <h3>
                        {formatTargetMonth(
                          prediction.targetMonth
                        )}
                      </h3>
                    </div>

                    <span className="prediction-redesign-status">
                      {
                        prediction.predictionStatus
                      }
                    </span>
                  </div>

                  <div className="prediction-redesign-history-values">
                    <div>
                      <span>
                        Consumption
                      </span>

                      <strong>
                        {formatKwh(
                          prediction.predictedConsumptionKwh
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Predicted bill
                      </span>

                      <strong>
                        {formatCurrency(
                          prediction.predictedBillAmount
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="prediction-redesign-history-foot">
                    <span>
                      {
                        prediction.predictionDate
                      }
                    </span>

                    <span>
                      {prediction.tariff
                        ?.tariffName ||
                        "—"}
                    </span>
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