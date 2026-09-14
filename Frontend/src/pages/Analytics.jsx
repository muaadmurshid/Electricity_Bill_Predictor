import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bar,
  Doughnut,
  Line,
} from "react-chartjs-2";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

import householdService from "../services/householdService";
import analyticsService from "../services/analyticsService";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

function formatDate(date) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function defaultStartDate() {
  const date = new Date();

  date.setDate(
    date.getDate() - 30
  );

  return formatDate(date);
}

function defaultEndDate() {
  return formatDate(
    new Date()
  );
}

function monthLabel(
  year,
  month
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      1
    )
  );
}

export default function Analytics() {
  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    startDate,
    setStartDate,
  ] = useState(
    defaultStartDate()
  );

  const [
    endDate,
    setEndDate,
  ] = useState(
    defaultEndDate()
  );

  const [
    analytics,
    setAnalytics,
  ] = useState(null);

  const [
    monthlyData,
    setMonthlyData,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadHouseholds();
  }, []);

  useEffect(() => {
    if (
      selectedHouseholdId
    ) {
      loadAnalytics();
    } else {
      setAnalytics(null);
      setMonthlyData([]);
    }
  }, [selectedHouseholdId]);

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
        setSelectedHouseholdId(
          String(
            list[0].householdId
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to load households:",
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

  async function loadAnalytics() {
    if (
      !selectedHouseholdId ||
      !startDate ||
      !endDate
    ) {
      return;
    }

    if (
      startDate > endDate
    ) {
      setError(
        "Start date cannot be after end date."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        analyticsData,
        monthHistory,
      ] = await Promise.all([
        analyticsService.analytics(
          selectedHouseholdId,
          startDate,
          endDate
        ),

        loadSixMonthHistory(
          selectedHouseholdId
        ),
      ]);

      setAnalytics(
        analyticsData
      );

      setMonthlyData(
        monthHistory
      );
    } catch (err) {
      console.error(
        "Failed to load analytics:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load household analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSixMonthHistory(
    householdId
  ) {
    const requests = [];

    const today =
      new Date();

    for (
      let offset = 5;
      offset >= 0;
      offset -= 1
    ) {
      const date =
        new Date(
          today.getFullYear(),
          today.getMonth() -
            offset,
          1
        );

      const year =
        date.getFullYear();

      const month =
        date.getMonth() + 1;

      requests.push(
        analyticsService
          .monthlySummary(
            householdId,
            year,
            month
          )
          .catch(() => ({
            householdId:
              Number(
                householdId
              ),
            year,
            month,
            totalConsumptionKwh:
              0,
          }))
      );
    }

    return Promise.all(
      requests
    );
  }

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    loadAnalytics();
  }

  const applianceBreakdown =
    Array.isArray(
      analytics?.applianceBreakdown
    )
      ? analytics.applianceBreakdown
      : [];

  const categoryBreakdown =
    Array.isArray(
      analytics?.categoryBreakdown
    )
      ? analytics.categoryBreakdown
      : [];

  const highest =
    analytics?.highestConsumingAppliance ||
    null;

  const monthlyChartData =
    useMemo(
      () => ({
        labels:
          monthlyData.map(
            (item) =>
              monthLabel(
                item.year,
                item.month
              )
          ),

        datasets: [
          {
            label:
              "Consumption (kWh)",

            data:
              monthlyData.map(
                (item) =>
                  Number(
                    item.totalConsumptionKwh ||
                      0
                  )
              ),

            borderColor:
              "#6c151e",

            backgroundColor:
              "rgba(108, 21, 30, 0.10)",

            pointBackgroundColor:
              "#6c151e",

            pointBorderColor:
              "#f5dabf",

            pointBorderWidth:
              2,

            borderWidth:
              3,

            tension:
              0.35,

            fill:
              true,
          },
        ],
      }),
      [monthlyData]
    );

  const applianceChartData =
    useMemo(
      () => ({
        labels:
          applianceBreakdown.map(
            (item) =>
              item.applianceName
          ),

        datasets: [
          {
            label:
              "Consumption (kWh)",

            data:
              applianceBreakdown.map(
                (item) =>
                  Number(
                    item.totalConsumptionKwh ||
                      0
                  )
              ),

            backgroundColor:
              "rgba(15, 61, 58, 0.78)",

            borderColor:
              "#0f3d3a",

            borderWidth:
              1,

            borderRadius:
              8,
          },
        ],
      }),
      [applianceBreakdown]
    );

  const categoryChartData =
    useMemo(
      () => ({
        labels:
          categoryBreakdown.map(
            (item) =>
              item.categoryName
          ),

        datasets: [
          {
            label:
              "Consumption (kWh)",

            data:
              categoryBreakdown.map(
                (item) =>
                  Number(
                    item.totalConsumptionKwh ||
                      0
                  )
              ),

            backgroundColor: [
              "#6c151e",
              "#0f3d3a",
              "#d6a63d",
              "#6d2932",
              "#c7b7a3",
              "#8f6f62",
            ],

            borderColor:
              "#fffaf6",

            borderWidth:
              3,
          },
        ],
      }),
      [categoryBreakdown]
    );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio:
      false,

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 18,
          color: "#7a6661",
          font: {
            size: 11,
          },
        },
      },

      tooltip: {
        backgroundColor:
          "#3b080c",

        titleColor:
          "#ffffff",

        bodyColor:
          "#f5dabf",

        padding:
          11,

        cornerRadius:
          10,
      },
    },

    scales: {
      x: {
        grid: {
          display:
            false,
        },

        ticks: {
          color:
            "#8d7470",
        },
      },

      y: {
        grid: {
          color:
            "rgba(108, 21, 30, 0.06)",
        },

        ticks: {
          color:
            "#8d7470",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio:
      false,

    cutout:
      "67%",

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          boxWidth: 12,
          padding: 16,
          color: "#7a6661",
          font: {
            size: 11,
          },
        },
      },

      tooltip: {
        backgroundColor:
          "#3b080c",

        titleColor:
          "#ffffff",

        bodyColor:
          "#f5dabf",

        padding:
          11,

        cornerRadius:
          10,
      },
    },
  };

  return (
    <div className="analytics-redesign">
      <section className="analytics-redesign-hero">
        <div className="analytics-redesign-orb analytics-redesign-orb-one" />
        <div className="analytics-redesign-orb analytics-redesign-orb-two" />

        <div className="analytics-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Energy analytics
          </p>

          <h1>
            See where your electricity
            is really going.
          </h1>

          <p>
            Explore household consumption,
            appliance behaviour, category
            usage and recent energy trends
            in one clear view.
          </p>
        </div>

        <div className="analytics-redesign-hero-badge">
          <span>
            ◔
          </span>

          <div>
            <small>
              Live insight
            </small>

            <strong>
              Usage analytics
            </strong>
          </div>
        </div>

        <form
          className="analytics-redesign-filter"
          onSubmit={
            handleSubmit
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
              Start date
            </span>

            <input
              type="date"
              value={
                startDate
              }
              onChange={(event) =>
                setStartDate(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>
              End date
            </span>

            <input
              type="date"
              value={
                endDate
              }
              onChange={(event) =>
                setEndDate(
                  event.target.value
                )
              }
            />
          </label>

          <button
            type="submit"
            className="analytics-redesign-primary"
            disabled={
              loading ||
              !selectedHouseholdId
            }
          >
            {loading
              ? "Loading..."
              : "Apply range"}
          </button>
        </form>
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {loading &&
      !analytics ? (
        <div className="analytics-redesign-loading">
          Loading household analytics...
        </div>
      ) : !selectedHouseholdId ? (
        <div className="analytics-redesign-loading">
          Select a household to view
          analytics.
        </div>
      ) : (
        <>
          <section className="analytics-redesign-summary">
            <article className="analytics-redesign-stat analytics-redesign-stat-feature">
              <div className="analytics-redesign-stat-icon">
                ⚡
              </div>

              <span>
                Total consumption
              </span>

              <strong>
                {Number(
                  analytics
                    ?.totalConsumptionKwh ||
                    0
                ).toFixed(
                  3
                )}
                <small>
                  kWh
                </small>
              </strong>

              <p>
                {analytics
                  ?.startDate ||
                  startDate}{" "}
                to{" "}
                {analytics
                  ?.endDate ||
                  endDate}
              </p>
            </article>

            <article className="analytics-redesign-stat analytics-redesign-stat-burgundy">
              <div className="analytics-redesign-stat-icon">
                ◈
              </div>

              <span>
                Highest consumer
              </span>

              <strong>
                {highest
                  ?.applianceName ||
                  "No data"}
              </strong>

              <p>
                {highest
                  ? `${Number(
                      highest.totalConsumptionKwh ||
                        0
                    ).toFixed(
                      3
                    )} kWh`
                  : "No usage recorded"}
              </p>
            </article>

            <article className="analytics-redesign-stat">
              <div className="analytics-redesign-stat-icon analytics-redesign-stat-icon-green">
                ⏻
              </div>

              <span>
                Appliances tracked
              </span>

              <strong>
                {
                  applianceBreakdown.length
                }
              </strong>

              <p>
                Appliances with recorded
                usage.
              </p>
            </article>

            <article className="analytics-redesign-stat">
              <div className="analytics-redesign-stat-icon">
                ▦
              </div>

              <span>
                Categories active
              </span>

              <strong>
                {
                  categoryBreakdown.length
                }
              </strong>

              <p>
                Energy categories
                represented.
              </p>
            </article>
          </section>

          <section className="analytics-redesign-main-grid">
            <article className="analytics-redesign-chart-card analytics-redesign-chart-card-wide">
              <div className="analytics-redesign-card-head">
                <div>
                  <p className="dashboard-kicker">
                    Consumption trend
                  </p>

                  <h2>
                    Six-month energy
                    pattern
                  </h2>
                </div>

                <span className="analytics-redesign-chip">
                  6 months
                </span>
              </div>

              <div className="analytics-redesign-chart analytics-redesign-chart-line">
                <Line
                  data={
                    monthlyChartData
                  }
                  options={
                    chartOptions
                  }
                />
              </div>
            </article>

            <article className="analytics-redesign-insight-card">
              <p className="dashboard-kicker dashboard-kicker-light">
                Highest consumer
              </p>

              {highest ? (
                <>
                  <div className="analytics-redesign-insight-icon">
                    ⚡
                  </div>

                  <h2>
                    {
                      highest.applianceName
                    }
                  </h2>

                  <p>
                    This appliance used
                    the most electricity
                    during the selected
                    period.
                  </p>

                  <div className="analytics-redesign-insight-values">
                    <div>
                      <span>
                        Consumption
                      </span>

                      <strong>
                        {Number(
                          highest.totalConsumptionKwh ||
                            0
                        ).toFixed(
                          3
                        )}{" "}
                        kWh
                      </strong>
                    </div>

                    <div>
                      <span>
                        Share
                      </span>

                      <strong>
                        {Number(
                          highest.percentageShare ||
                            0
                        ).toFixed(
                          1
                        )}
                        %
                      </strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="analytics-redesign-insight-empty">
                  No appliance usage
                  recorded for this
                  period.
                </div>
              )}
            </article>
          </section>

          <section className="analytics-redesign-chart-grid">
            <article className="analytics-redesign-chart-card">
              <div className="analytics-redesign-card-head">
                <div>
                  <p className="dashboard-kicker">
                    Appliances
                  </p>

                  <h2>
                    Consumption by
                    appliance
                  </h2>
                </div>
              </div>

              {applianceBreakdown.length ===
              0 ? (
                <div className="analytics-redesign-empty">
                  No appliance
                  consumption data exists
                  for this period.
                </div>
              ) : (
                <div className="analytics-redesign-chart">
                  <Bar
                    data={
                      applianceChartData
                    }
                    options={
                      chartOptions
                    }
                  />
                </div>
              )}
            </article>

            <article className="analytics-redesign-chart-card">
              <div className="analytics-redesign-card-head">
                <div>
                  <p className="dashboard-kicker">
                    Categories
                  </p>

                  <h2>
                    Consumption by
                    category
                  </h2>
                </div>
              </div>

              {categoryBreakdown.length ===
              0 ? (
                <div className="analytics-redesign-empty">
                  No category
                  consumption data exists
                  for this period.
                </div>
              ) : (
                <div className="analytics-redesign-chart">
                  <Doughnut
                    data={
                      categoryChartData
                    }
                    options={
                      doughnutOptions
                    }
                  />
                </div>
              )}
            </article>
          </section>

          <section className="analytics-redesign-breakdown">
            <div className="analytics-redesign-section-head">
              <div>
                <p className="dashboard-kicker">
                  Breakdown
                </p>

                <h2>
                  Appliance details
                </h2>
              </div>

              <span>
                {
                  applianceBreakdown.length
                }{" "}
                tracked
              </span>
            </div>

            {applianceBreakdown.length ===
            0 ? (
              <div className="analytics-redesign-empty">
                No appliance data
                available.
              </div>
            ) : (
              <div className="analytics-redesign-appliance-grid">
                {applianceBreakdown.map(
                  (
                    appliance
                  ) => (
                    <article
                      className="analytics-redesign-appliance-item"
                      key={
                        appliance.applianceId
                      }
                    >
                      <div className="analytics-redesign-appliance-icon">
                        ⚡
                      </div>

                      <div className="analytics-redesign-appliance-copy">
                        <span>
                          Appliance
                        </span>

                        <strong>
                          {
                            appliance.applianceName
                          }
                        </strong>

                        <p>
                          {Number(
                            appliance.totalConsumptionKwh ||
                              0
                          ).toFixed(
                            3
                          )}{" "}
                          kWh
                        </p>
                      </div>

                      <div className="analytics-redesign-percent">
                        {Number(
                          appliance.percentageShare ||
                            0
                        ).toFixed(
                          1
                        )}
                        %
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}