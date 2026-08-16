import {
  useEffect,
  useMemo,
  useState,
} from "react";

import householdService from "../services/householdService";
import budgetService from "../services/budgetService";

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

function getMonthName(month) {
  return (
    MONTHS.find(
      (item) =>
        item.value ===
        Number(month)
    )?.label || month
  );
}

function statusLabel(status) {
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
      return status || "—";
  }
}

function statusStyle(status) {
  switch (status) {
    case "WITHIN_BUDGET":
      return {
        background: "#e9f7e9",
        color: "#286428",
      };

    case "WARNING":
      return {
        background: "#fff4d7",
        color: "#795d12",
      };

    case "OVER_BUDGET":
      return {
        background: "#fff0f0",
        color: "#9a1f1f",
      };

    default:
      return {
        background: "#f1eaea",
        color: "#765f5f",
      };
  }
}

export default function Budget() {
  const today = new Date();

  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    budgets,
    setBudgets,
  ] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [formData, setFormData] =
    useState({
      budgetMonth:
        String(
          today.getMonth() + 1
        ),

      budgetYear:
        String(
          today.getFullYear()
        ),

      budgetAmount: "",

      warningThreshold: "80",
    });

  useEffect(() => {
    initialise();
  }, []);

  async function initialise() {
    try {
      setLoading(true);
      setError("");

      const [
        householdData,
        budgetData,
      ] = await Promise.all([
        householdService.list(),
        budgetService.list(),
      ]);

      const householdList =
        Array.isArray(
          householdData
        )
          ? householdData
          : [];

      const budgetList =
        Array.isArray(budgetData)
          ? budgetData
          : [];

      setHouseholds(
        householdList
      );

      setBudgets(
        budgetList
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
    } catch (err) {
      console.error(
        "Failed to initialise budget page:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load budget information."
      );
    } finally {
      setLoading(false);
    }
  }

  async function reloadBudgets() {
    try {
      const data =
        await budgetService.list();

      setBudgets(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to reload budgets:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to reload budgets."
      );
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  function validateForm() {
    if (
      !selectedHouseholdId
    ) {
      setError(
        "Please select a household."
      );

      return false;
    }

    const month = Number(
      formData.budgetMonth
    );

    const year = Number(
      formData.budgetYear
    );

    const amount = Number(
      formData.budgetAmount
    );

    const threshold = Number(
      formData.warningThreshold
    );

    if (
      month < 1 ||
      month > 12
    ) {
      setError(
        "Budget month must be between 1 and 12."
      );

      return false;
    }

    if (year < 2020) {
      setError(
        "Budget year must be 2020 or later."
      );

      return false;
    }

    if (
      formData.budgetAmount ===
        "" ||
      amount < 0
    ) {
      setError(
        "Budget amount cannot be negative."
      );

      return false;
    }

    if (
      formData.warningThreshold ===
        "" ||
      threshold < 0 ||
      threshold > 100
    ) {
      setError(
        "Warning threshold must be between 0 and 100."
      );

      return false;
    }

    return true;
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    const existingBudget =
      editingId
        ? budgets.find(
            (budget) =>
              budget.budgetId ===
              editingId
          )
        : null;

    const payload = {
      household: {
        householdId: Number(
          selectedHouseholdId
        ),
      },

      budgetMonth: Number(
        formData.budgetMonth
      ),

      budgetYear: Number(
        formData.budgetYear
      ),

      budgetAmount: Number(
        formData.budgetAmount
      ),

      warningThreshold: Number(
        formData.warningThreshold
      ),

      /*
       * These values are owned by the backend.
       *
       * On create the service defaults:
       * currentEstimatedAmount = 0
       * status = ACTIVE
       *
       * We include valid values because the
       * entity validation requires status.
       */
      currentEstimatedAmount:
        existingBudget
          ?.currentEstimatedAmount ??
        0,

      status:
        existingBudget?.status ||
        "ACTIVE",
    };

    try {
      setSaving(true);

      if (editingId) {
        await budgetService.update(
          editingId,
          payload
        );

        setSuccess(
          "Budget updated successfully."
        );
      } else {
        await budgetService.create(
          payload
        );

        setSuccess(
          "Budget created successfully."
        );
      }

      resetForm();

      await reloadBudgets();
    } catch (err) {
      console.error(
        "Failed to save budget:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to save budget."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(budget) {
    setEditingId(
      budget.budgetId
    );

    setSelectedHouseholdId(
      String(
        budget.household
          ?.householdId || ""
      )
    );

    setFormData({
      budgetMonth: String(
        budget.budgetMonth
      ),

      budgetYear: String(
        budget.budgetYear
      ),

      budgetAmount:
        budget.budgetAmount !==
          null &&
        budget.budgetAmount !==
          undefined
          ? String(
              budget.budgetAmount
            )
          : "",

      warningThreshold:
        budget.warningThreshold !==
          null &&
        budget.warningThreshold !==
          undefined
          ? String(
              budget.warningThreshold
            )
          : "80",
    });

    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);

    setFormData({
      budgetMonth: String(
        today.getMonth() + 1
      ),

      budgetYear: String(
        today.getFullYear()
      ),

      budgetAmount: "",

      warningThreshold: "80",
    });
  }

  async function handleDelete(
    budgetId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this budget?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await budgetService.remove(
        budgetId
      );

      if (
        editingId === budgetId
      ) {
        resetForm();
      }

      setSuccess(
        "Budget deleted successfully."
      );

      await reloadBudgets();
    } catch (err) {
      console.error(
        "Failed to delete budget:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to delete budget."
      );
    }
  }

  const filteredBudgets =
    useMemo(() => {
      if (
        !selectedHouseholdId
      ) {
        return [];
      }

      return budgets.filter(
        (budget) =>
          String(
            budget.household
              ?.householdId
          ) ===
          String(
            selectedHouseholdId
          )
      );
    }, [
      budgets,
      selectedHouseholdId,
    ]);

  const latestBudget =
    filteredBudgets[0] ||
    null;

  function progressPercent(
    budget
  ) {
    const estimated =
      Number(
        budget.currentEstimatedAmount ||
          0
      );

    const amount =
      Number(
        budget.budgetAmount ||
          0
      );

    if (amount <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (estimated / amount) *
          100
      )
    );
  }

  return (
    <div style={styles.page}>
      <div
        style={styles.header}
      >
        <p
          style={styles.eyebrow}
        >
          TARGETS
        </p>

        <h1
          style={styles.title}
        >
          Budget
        </h1>

        <p style={styles.lead}>
          Set a monthly electricity
          spending limit and warning
          threshold. When a prediction
          is generated for the same
          month, the backend updates
          the estimated amount and
          budget status automatically.
        </p>
      </div>

      {error && (
        <div
          style={styles.error}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={styles.success}
        >
          {success}
        </div>
      )}

      <section
        style={
          styles.selectorCard
        }
      >
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

            resetForm();

            setError("");
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
      </section>

      {latestBudget && (
        <section
          style={
            styles.overviewCard
          }
        >
          <div
            style={
              styles.overviewHeader
            }
          >
            <div>
              <p
                style={
                  styles.cardEyebrow
                }
              >
                LATEST BUDGET
              </p>

              <h2
                style={
                  styles.cardTitle
                }
              >
                {getMonthName(
                  latestBudget.budgetMonth
                )}{" "}
                {
                  latestBudget.budgetYear
                }
              </h2>
            </div>

            <span
              style={{
                ...styles.statusBadge,
                ...statusStyle(
                  latestBudget.status
                ),
              }}
            >
              {statusLabel(
                latestBudget.status
              )}
            </span>
          </div>

          <div
            style={
              styles.overviewGrid
            }
          >
            <div>
              <p
                style={
                  styles.summaryLabel
                }
              >
                Monthly budget
              </p>

              <h3
                style={
                  styles.summaryValue
                }
              >
                {formatCurrency(
                  latestBudget.budgetAmount
                )}
              </h3>
            </div>

            <div>
              <p
                style={
                  styles.summaryLabel
                }
              >
                Current estimate
              </p>

              <h3
                style={
                  styles.summaryValue
                }
              >
                {formatCurrency(
                  latestBudget.currentEstimatedAmount
                )}
              </h3>
            </div>

            <div>
              <p
                style={
                  styles.summaryLabel
                }
              >
                Warning threshold
              </p>

              <h3
                style={
                  styles.summaryValue
                }
              >
                {
                  latestBudget.warningThreshold
                }
                %
              </h3>
            </div>
          </div>

          <div
            style={
              styles.meterTrack
            }
          >
            <div
              style={{
                ...styles.meterFill,
                width: `${progressPercent(
                  latestBudget
                )}%`,
              }}
            />
          </div>

          <p
            style={
              styles.meterText
            }
          >
            {progressPercent(
              latestBudget
            ).toFixed(1)}
            % of budget currently
            estimated
          </p>
        </section>
      )}

      <div style={styles.grid}>
        <section
          style={styles.card}
        >
          <h2
            style={
              styles.cardTitle
            }
          >
            {editingId
              ? "Edit budget"
              : "Create budget"}
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
          >
            <div
              style={
                styles.twoColumn
              }
            >
              <div
                style={
                  styles.field
                }
              >
                <label
                  style={
                    styles.label
                  }
                >
                  Month
                </label>

                <select
                  name="budgetMonth"
                  value={
                    formData.budgetMonth
                  }
                  onChange={
                    handleChange
                  }
                  style={
                    styles.input
                  }
                >
                  {MONTHS.map(
                    (month) => (
                      <option
                        key={
                          month.value
                        }
                        value={
                          month.value
                        }
                      >
                        {
                          month.label
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div
                style={
                  styles.field
                }
              >
                <label
                  style={
                    styles.label
                  }
                >
                  Year
                </label>

                <input
                  type="number"
                  name="budgetYear"
                  value={
                    formData.budgetYear
                  }
                  onChange={
                    handleChange
                  }
                  min="2020"
                  max="2100"
                  required
                  style={
                    styles.input
                  }
                />
              </div>
            </div>

            <div
              style={
                styles.field
              }
            >
              <label
                style={
                  styles.label
                }
              >
                Monthly budget
                (LKR)
              </label>

              <input
                type="number"
                name="budgetAmount"
                value={
                  formData.budgetAmount
                }
                onChange={
                  handleChange
                }
                min="0"
                step="0.01"
                required
                placeholder="Example: 7500"
                style={
                  styles.input
                }
              />
            </div>

            <div
              style={
                styles.field
              }
            >
              <label
                style={
                  styles.label
                }
              >
                Warning threshold
                (%)
              </label>

              <input
                type="number"
                name="warningThreshold"
                value={
                  formData.warningThreshold
                }
                onChange={
                  handleChange
                }
                min="0"
                max="100"
                step="1"
                required
                style={
                  styles.input
                }
              />

              <p
                style={
                  styles.hint
                }
              >
                Example: 80 means
                the backend changes
                the status to WARNING
                when the predicted
                bill reaches at least
                80% of the monthly
                budget.
              </p>
            </div>

            <div
              style={
                styles.actions
              }
            >
              <button
                type="submit"
                style={
                  styles.primaryButton
                }
                disabled={
                  saving ||
                  !selectedHouseholdId
                }
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update budget"
                    : "Create budget"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  style={
                    styles.secondaryButton
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section
          style={styles.card}
        >
          <h2
            style={
              styles.cardTitle
            }
          >
            Budget history
          </h2>

          {!selectedHouseholdId ? (
            <p
              style={
                styles.muted
              }
            >
              Select a household
              to view budgets.
            </p>
          ) : loading ? (
            <p
              style={
                styles.muted
              }
            >
              Loading budgets...
            </p>
          ) : filteredBudgets.length ===
            0 ? (
            <p
              style={
                styles.muted
              }
            >
              No budgets found
              for this household.
            </p>
          ) : (
            <div
              style={
                styles.list
              }
            >
              {filteredBudgets.map(
                (budget) => (
                  <div
                    key={
                      budget.budgetId
                    }
                    style={
                      styles.budgetItem
                    }
                  >
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <div
                        style={
                          styles.itemHeading
                        }
                      >
                        <h3
                          style={
                            styles.itemTitle
                          }
                        >
                          {getMonthName(
                            budget.budgetMonth
                          )}{" "}
                          {
                            budget.budgetYear
                          }
                        </h3>

                        <span
                          style={{
                            ...styles.statusBadge,
                            ...statusStyle(
                              budget.status
                            ),
                          }}
                        >
                          {statusLabel(
                            budget.status
                          )}
                        </span>
                      </div>

                      <p
                        style={
                          styles.detail
                        }
                      >
                        <strong>
                          Budget:
                        </strong>{" "}
                        {formatCurrency(
                          budget.budgetAmount
                        )}
                      </p>

                      <p
                        style={
                          styles.detail
                        }
                      >
                        <strong>
                          Estimated:
                        </strong>{" "}
                        {formatCurrency(
                          budget.currentEstimatedAmount
                        )}
                      </p>

                      <p
                        style={
                          styles.detail
                        }
                      >
                        <strong>
                          Warning:
                        </strong>{" "}
                        {
                          budget.warningThreshold
                        }
                        %
                      </p>
                    </div>

                    <div
                      style={
                        styles.itemActions
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            budget
                          )
                        }
                        style={
                          styles.editButton
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            budget.budgetId
                          )
                        }
                        style={
                          styles.deleteButton
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
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
    border:
      "1px solid #e5b4b4",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#9a1f1f",
  },

  success: {
    padding: "14px 16px",
    marginBottom: "20px",
    border:
      "1px solid #b9d8b9",
    borderRadius: "10px",
    background: "#effbef",
    color: "#286428",
  },

  selectorCard: {
    background: "#ffffff",
    border:
      "1px solid #e6dcdc",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "22px",
  },

  overviewCard: {
    background: "#ffffff",
    border:
      "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "22px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

  overviewHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },

  overviewGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  summaryLabel: {
    margin: "0 0 6px",
    color: "#806d6d",
    fontSize: "13px",
  },

  summaryValue: {
    margin: 0,
    color: "#3f1515",
  },

  meterTrack: {
    width: "100%",
    height: "12px",
    borderRadius: "999px",
    overflow: "hidden",
    background: "#eee4e4",
  },

  meterFill: {
    height: "100%",
    borderRadius: "999px",
    background: "#7f0000",
  },

  meterText: {
    margin: "8px 0 0",
    color: "#806d6d",
    fontSize: "13px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(380px, 1fr))",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    border:
      "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "24px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

  cardEyebrow: {
    margin: "0 0 5px",
    fontSize: "11px",
    letterSpacing: "0.12em",
    color: "#8a6e6e",
  },

  cardTitle: {
    margin: 0,
    marginBottom: "20px",
  },

  field: {
    marginBottom: "16px",
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
    border:
      "1px solid #d8caca",
    borderRadius: "8px",
    fontSize: "15px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
  },

  hint: {
    margin: "7px 0 0",
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#806d6d",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
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

  secondaryButton: {
    padding: "11px 18px",
    border:
      "1px solid #cbbbbb",
    borderRadius: "8px",
    background: "#ffffff",
    cursor: "pointer",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  budgetItem: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "20px",
    padding: "18px",
    border:
      "1px solid #eadede",
    borderRadius: "10px",
    background: "#fffafa",
  },

  itemHeading: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  itemTitle: {
    margin:
      "0 0 10px 0",
  },

  statusBadge: {
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "11px",
    fontWeight: 700,
  },

  detail: {
    margin: "6px 0",
    color: "#5f5050",
  },

  itemActions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  editButton: {
    padding: "8px 14px",
    border:
      "1px solid #a88",
    borderRadius: "7px",
    background: "#ffffff",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "7px",
    background: "#a22323",
    color: "#ffffff",
    cursor: "pointer",
  },

  muted: {
    color: "#806d6d",
  },
};