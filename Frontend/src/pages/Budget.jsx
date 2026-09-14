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

function statusClass(status) {
  switch (status) {
    case "WITHIN_BUDGET":
      return "budget-status-good";

    case "WARNING":
      return "budget-status-warning";

    case "OVER_BUDGET":
      return "budget-status-danger";

    default:
      return "budget-status-neutral";
  }
}

export default function Budget() {
  const today =
    new Date();

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

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState({
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
        Array.isArray(
          budgetData
        )
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

    const month =
      Number(
        formData.budgetMonth
      );

    const year =
      Number(
        formData.budgetYear
      );

    const amount =
      Number(
        formData.budgetAmount
      );

    const threshold =
      Number(
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
        householdId:
          Number(
            selectedHouseholdId
          ),
      },

      budgetMonth:
        Number(
          formData.budgetMonth
        ),

      budgetYear:
        Number(
          formData.budgetYear
        ),

      budgetAmount:
        Number(
          formData.budgetAmount
        ),

      warningThreshold:
        Number(
          formData.warningThreshold
        ),

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
      budgetMonth:
        String(
          budget.budgetMonth
        ),

      budgetYear:
        String(
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
    <div className="budget-redesign">
      <section className="budget-redesign-hero">
        <div className="budget-redesign-orb budget-redesign-orb-one" />
        <div className="budget-redesign-orb budget-redesign-orb-two" />

        <div className="budget-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Monthly spending target
          </p>

          <h1>
            Keep your electricity bill
            within your plan.
          </h1>

          <p>
            Set a monthly spending limit
            and warning threshold, then
            compare it automatically with
            your predicted electricity
            cost.
          </p>
        </div>

        <div className="budget-redesign-hero-badge">
          <span>
            ₨
          </span>

          <div>
            <small>
              Budget control
            </small>

            <strong>
              Monthly target
            </strong>
          </div>
        </div>

        <div className="budget-redesign-household">
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

                resetForm();

                setError("");
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
        </div>
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

      {latestBudget && (
        <section className="budget-redesign-overview">
          <div className="budget-redesign-overview-main">
            <div className="budget-redesign-overview-head">
              <div>
                <p className="dashboard-kicker dashboard-kicker-light">
                  Latest budget
                </p>

                <h2>
                  {getMonthName(
                    latestBudget.budgetMonth
                  )}{" "}
                  {
                    latestBudget.budgetYear
                  }
                </h2>
              </div>

              <span
                className={`budget-redesign-status ${statusClass(
                  latestBudget.status
                )}`}
              >
                {statusLabel(
                  latestBudget.status
                )}
              </span>
            </div>

            <div className="budget-redesign-overview-values">
              <div>
                <span>
                  Monthly budget
                </span>

                <strong>
                  {formatCurrency(
                    latestBudget.budgetAmount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Current estimate
                </span>

                <strong>
                  {formatCurrency(
                    latestBudget.currentEstimatedAmount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Warning threshold
                </span>

                <strong>
                  {
                    latestBudget.warningThreshold
                  }
                  %
                </strong>
              </div>
            </div>

            <div className="budget-redesign-progress">
              <div className="budget-redesign-progress-track">
                <div
                  className="budget-redesign-progress-fill"
                  style={{
                    width: `${progressPercent(
                      latestBudget
                    )}%`,
                  }}
                />
              </div>

              <div className="budget-redesign-progress-foot">
                <span>
                  {progressPercent(
                    latestBudget
                  ).toFixed(1)}
                  % estimated
                </span>

                <strong>
                  {statusLabel(
                    latestBudget.status
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="budget-redesign-gauge">
            <div
              className="budget-redesign-gauge-ring"
              style={{
                "--budget-progress":
                  `${Math.min(
                    100,
                    progressPercent(
                      latestBudget
                    )
                  ) * 3.6}deg`,
              }}
            >
              <div>
                <strong>
                  {progressPercent(
                    latestBudget
                  ).toFixed(0)}
                  %
                </strong>

                <span>
                  budget used
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="budget-redesign-grid">
        <article className="budget-redesign-form-card">
          <div className="budget-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Budget setup
              </p>

              <h2>
                {editingId
                  ? "Edit monthly budget"
                  : "Create monthly budget"}
              </h2>
            </div>

            <span className="budget-redesign-form-icon">
              ₨
            </span>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="budget-redesign-form"
          >
            <div className="budget-redesign-two-column">
              <label>
                <span>
                  Month
                </span>

                <select
                  name="budgetMonth"
                  value={
                    formData.budgetMonth
                  }
                  onChange={
                    handleChange
                  }
                >
                  {MONTHS.map(
                    (monthItem) => (
                      <option
                        key={
                          monthItem.value
                        }
                        value={
                          monthItem.value
                        }
                      >
                        {
                          monthItem.label
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
                />
              </label>
            </div>

            <label>
              <span>
                Monthly budget
              </span>

              <div className="budget-redesign-money-input">
                <span>
                  LKR
                </span>

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
                  placeholder="7500"
                />
              </div>
            </label>

            <label>
              <span>
                Warning threshold
              </span>

              <div className="budget-redesign-threshold-input">
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
                />

                <span>
                  %
                </span>
              </div>

              <small>
                A threshold of 80% means
                you will enter the warning
                state once your predicted
                bill reaches 80% of the
                monthly budget.
              </small>
            </label>

            <div className="budget-redesign-actions">
              <button
                type="submit"
                className="budget-redesign-primary"
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
                  className="budget-redesign-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="budget-redesign-history">
          <div className="budget-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                History
              </p>

              <h2>
                Previous budgets
              </h2>
            </div>

            <span className="budget-redesign-count">
              {
                filteredBudgets.length
              }
            </span>
          </div>

          {!selectedHouseholdId ? (
            <div className="budget-redesign-empty">
              Select a household to view
              budgets.
            </div>
          ) : loading ? (
            <div className="budget-redesign-empty">
              Loading budgets...
            </div>
          ) : filteredBudgets.length ===
            0 ? (
            <div className="budget-redesign-empty">
              <div className="budget-redesign-empty-icon">
                ₨
              </div>

              <strong>
                No budgets yet
              </strong>

              <span>
                Create your first monthly
                budget using the form.
              </span>
            </div>
          ) : (
            <div className="budget-redesign-list">
              {filteredBudgets.map(
                (budget) => (
                  <article
                    key={
                      budget.budgetId
                    }
                    className="budget-redesign-item"
                  >
                    <div className="budget-redesign-item-top">
                      <div>
                        <span>
                          Monthly budget
                        </span>

                        <h3>
                          {getMonthName(
                            budget.budgetMonth
                          )}{" "}
                          {
                            budget.budgetYear
                          }
                        </h3>
                      </div>

                      <span
                        className={`budget-redesign-status ${statusClass(
                          budget.status
                        )}`}
                      >
                        {statusLabel(
                          budget.status
                        )}
                      </span>
                    </div>

                    <div className="budget-redesign-item-values">
                      <div>
                        <span>
                          Budget
                        </span>

                        <strong>
                          {formatCurrency(
                            budget.budgetAmount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Estimated
                        </span>

                        <strong>
                          {formatCurrency(
                            budget.currentEstimatedAmount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Warning
                        </span>

                        <strong>
                          {
                            budget.warningThreshold
                          }
                          %
                        </strong>
                      </div>
                    </div>

                    <div className="budget-redesign-item-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            budget
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="budget-redesign-delete"
                        onClick={() =>
                          handleDelete(
                            budget.budgetId
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}