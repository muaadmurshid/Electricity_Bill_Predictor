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

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

            borderWidth: 2,
            tension: 0.25,
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

            borderWidth: 1,
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

            borderWidth: 1,
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
      },
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>
          INSIGHT
        </p>

        <h1 style={styles.title}>
          Analytics
        </h1>

        <p style={styles.lead}>
          Understand where your
          household electricity is
          being used. Compare total
          consumption, appliances,
          categories and recent
          monthly usage.
        </p>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <section
        style={
          styles.filterCard
        }
      >
        <form
          onSubmit={
            handleSubmit
          }
          style={
            styles.filterGrid
          }
        >
          <div>
            <label
              style={
                styles.label
              }
            >
              Household
            </label>

            <select
              value={
                selectedHouseholdId
              }
              onChange={(event) =>
                setSelectedHouseholdId(
                  event.target
                    .value
                )
              }
              style={
                styles.input
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
          </div>

          <div>
            <label
              style={
                styles.label
              }
            >
              Start date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(
                  event.target
                    .value
                )
              }
              style={
                styles.input
              }
            />
          </div>

          <div>
            <label
              style={
                styles.label
              }
            >
              End date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(
                  event.target
                    .value
                )
              }
              style={
                styles.input
              }
            />
          </div>

          <div
            style={
              styles.filterButtonArea
            }
          >
            <button
              type="submit"
              style={
                styles.primaryButton
              }
              disabled={
                loading ||
                !selectedHouseholdId
              }
            >
              {loading
                ? "Loading..."
                : "Apply"}
            </button>
          </div>
        </form>
      </section>

      {loading &&
      !analytics ? (
        <section
          style={styles.card}
        >
          <p
            style={
              styles.muted
            }
          >
            Loading household
            analytics...
          </p>
        </section>
      ) : !selectedHouseholdId ? (
        <section
          style={styles.card}
        >
          <p
            style={
              styles.muted
            }
          >
            Select a household to
            view analytics.
          </p>
        </section>
      ) : (
        <>
          <div
            style={
              styles.summaryGrid
            }
          >
            <section
              style={
                styles.summaryCard
              }
            >
              <p
                style={
                  styles.summaryLabel
                }
              >
                Total consumption
              </p>

              <h2
                style={
                  styles.summaryValue
                }
              >
                {Number(
                  analytics
                    ?.totalConsumptionKwh ||
                    0
                ).toFixed(3)}
                <span
                  style={
                    styles.unit
                  }
                >
                  {" "}
                  kWh
                </span>
              </h2>

              <p
                style={
                  styles.summarySub
                }
              >
                {analytics
                  ?.startDate ||
                  startDate}{" "}
                to{" "}
                {analytics
                  ?.endDate ||
                  endDate}
              </p>
            </section>

            <section
              style={
                styles.summaryCard
              }
            >
              <p
                style={
                  styles.summaryLabel
                }
              >
                Highest consumer
              </p>

              <h2
                style={
                  styles.summaryValue
                }
              >
                {highest
                  ?.applianceName ||
                  "No data"}
              </h2>

              <p
                style={
                  styles.summarySub
                }
              >
                {highest
                  ? `${Number(
                      highest.totalConsumptionKwh ||
                        0
                    ).toFixed(
                      3
                    )} kWh`
                  : "No usage recorded"}
              </p>
            </section>

            <section
              style={
                styles.summaryCard
              }
            >
              <p
                style={
                  styles.summaryLabel
                }
              >
                Appliances tracked
              </p>

              <h2
                style={
                  styles.summaryValue
                }
              >
                {
                  applianceBreakdown.length
                }
              </h2>

              <p
                style={
                  styles.summarySub
                }
              >
                With recorded usage
                in this period
              </p>
            </section>

            <section
              style={
                styles.summaryCard
              }
            >
              <p
                style={
                  styles.summaryLabel
                }
              >
                Categories active
              </p>

              <h2
                style={
                  styles.summaryValue
                }
              >
                {
                  categoryBreakdown.length
                }
              </h2>

              <p
                style={
                  styles.summarySub
                }
              >
                Consumption
                categories represented
              </p>
            </section>
          </div>

          <div
            style={
              styles.chartGrid
            }
          >
            <section
              style={
                styles.card
              }
            >
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
                    TREND
                  </p>

                  <h2
                    style={
                      styles.cardTitle
                    }
                  >
                    Six-month
                    consumption
                  </h2>
                </div>
              </div>

              <div
                style={
                  styles.chart
                }
              >
                <Line
                  data={
                    monthlyChartData
                  }
                  options={
                    chartOptions
                  }
                />
              </div>
            </section>

            <section
              style={
                styles.card
              }
            >
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
                    APPLIANCES
                  </p>

                  <h2
                    style={
                      styles.cardTitle
                    }
                  >
                    Consumption by
                    appliance
                  </h2>
                </div>
              </div>

              {applianceBreakdown.length ===
              0 ? (
                <p
                  style={
                    styles.muted
                  }
                >
                  No appliance
                  consumption data
                  exists for this
                  period.
                </p>
              ) : (
                <div
                  style={
                    styles.chart
                  }
                >
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
            </section>

            <section
              style={
                styles.card
              }
            >
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
                    CATEGORIES
                  </p>

                  <h2
                    style={
                      styles.cardTitle
                    }
                  >
                    Consumption by
                    category
                  </h2>
                </div>
              </div>

              {categoryBreakdown.length ===
              0 ? (
                <p
                  style={
                    styles.muted
                  }
                >
                  No category
                  consumption data
                  exists for this
                  period.
                </p>
              ) : (
                <div
                  style={
                    styles.chart
                  }
                >
                  <Doughnut
                    data={
                      categoryChartData
                    }
                    options={
                      chartOptions
                    }
                  />
                </div>
              )}
            </section>

            <section
              style={
                styles.card
              }
            >
              <p
                style={
                  styles.cardEyebrow
                }
              >
                BREAKDOWN
              </p>

              <h2
                style={
                  styles.cardTitle
                }
              >
                Appliance details
              </h2>

              {applianceBreakdown.length ===
              0 ? (
                <p
                  style={
                    styles.muted
                  }
                >
                  No data available.
                </p>
              ) : (
                <div
                  style={
                    styles.list
                  }
                >
                  {applianceBreakdown.map(
                    (
                      appliance
                    ) => (
                      <div
                        key={
                          appliance.applianceId
                        }
                        style={
                          styles.listItem
                        }
                      >
                        <div>
                          <strong>
                            {
                              appliance.applianceName
                            }
                          </strong>

                          <p
                            style={
                              styles.detail
                            }
                          >
                            {Number(
                              appliance.totalConsumptionKwh ||
                                0
                            ).toFixed(
                              3
                            )}{" "}
                            kWh
                          </p>
                        </div>

                        <span
                          style={
                            styles.percent
                          }
                        >
                          {Number(
                            appliance.percentageShare ||
                              0
                          ).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        </>
      )}
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
    maxWidth: "760px",
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

  filterCard: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "22px",
    boxShadow:
      "0 2px 8px rgba(0, 0, 0, 0.04)",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    alignItems: "end",
  },

  filterButtonArea: {
    display: "flex",
    alignItems: "end",
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

  primaryButton: {
    width: "100%",
    padding: "11px 18px",
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
    fontSize: "25px",
  },

  summarySub: {
    margin: 0,
    fontSize: "13px",
    color: "#806d6d",
  },

  unit: {
    fontSize: "14px",
    fontWeight: 500,
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "22px",
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
    justifyContent: "space-between",
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

  chart: {
    position: "relative",
    width: "100%",
    height: "320px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "18px",
  },

  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "13px 14px",
    border: "1px solid #eadede",
    borderRadius: "9px",
    background: "#fffafa",
  },

  detail: {
    margin: "5px 0 0",
    color: "#786565",
    fontSize: "13px",
  },

  percent: {
    fontWeight: 700,
    color: "#7f0000",
  },

  muted: {
    color: "#806d6d",
  },
};