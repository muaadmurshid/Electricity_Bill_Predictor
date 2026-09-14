import {
  useEffect,
  useMemo,
  useState,
} from "react";

import householdService from "../services/householdService";
import goalService from "../services/goalService";

function statusLabel(status) {
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
      return status || "—";
  }
}

function statusClass(status) {
  switch (status) {
    case "ON_TRACK":
      return "goal-status-good";

    case "AT_RISK":
      return "goal-status-warning";

    case "ACHIEVED":
      return "goal-status-achieved";

    case "MISSED":
      return "goal-status-danger";

    default:
      return "goal-status-neutral";
  }
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

function formatGoalType(value) {
  switch (value) {
    case "MONTHLY_CONSUMPTION":
      return "Monthly consumption";

    case "ENERGY_REDUCTION":
      return "Energy reduction";

    case "CUSTOM":
      return "Custom";

    default:
      return value || "—";
  }
}

export default function Goals() {
  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    goals,
    setGoals,
  ] = useState([]);

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
    goalName: "",
    goalType: "MONTHLY_CONSUMPTION",
    targetValue: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    initialise();
  }, []);

  useEffect(() => {
    if (selectedHouseholdId) {
      loadGoals(
        selectedHouseholdId
      );
    } else {
      setGoals([]);
    }
  }, [selectedHouseholdId]);

  async function initialise() {
    try {
      setLoading(true);
      setError("");

      const householdData =
        await householdService.list();

      const householdList =
        Array.isArray(
          householdData
        )
          ? householdData
          : [];

      setHouseholds(
        householdList
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
        "Failed to initialise goals page:",
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

  async function loadGoals(
    householdId
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await goalService.listByHousehold(
          householdId
        );

      setGoals(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load energy goals:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load energy goals."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    event
  ) {
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

    if (
      !formData.goalName.trim()
    ) {
      setError(
        "Please enter a goal name."
      );

      return false;
    }

    if (
      !formData.goalType.trim()
    ) {
      setError(
        "Please select a goal type."
      );

      return false;
    }

    if (
      formData.targetValue ===
        "" ||
      Number(
        formData.targetValue
      ) < 0
    ) {
      setError(
        "Target value cannot be negative."
      );

      return false;
    }

    if (!formData.startDate) {
      setError(
        "Please select a start date."
      );

      return false;
    }

    if (!formData.endDate) {
      setError(
        "Please select an end date."
      );

      return false;
    }

    if (
      formData.endDate <
      formData.startDate
    ) {
      setError(
        "End date cannot be before start date."
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

    const existingGoal =
      editingId
        ? goals.find(
            (goal) =>
              goal.goalId ===
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

      goalName:
        formData.goalName.trim(),

      goalType:
        formData.goalType.trim(),

      targetValue:
        Number(
          formData.targetValue
        ),

      startDate:
        formData.startDate,

      endDate:
        formData.endDate,

      currentValue:
        existingGoal
          ?.currentValue ?? 0,

      status:
        existingGoal
          ?.status || "ON_TRACK",
    };

    try {
      setSaving(true);

      if (editingId) {
        await goalService.update(
          editingId,
          payload
        );

        setSuccess(
          "Energy goal updated successfully."
        );
      } else {
        await goalService.create(
          payload
        );

        setSuccess(
          "Energy goal created successfully."
        );
      }

      resetForm();

      await loadGoals(
        selectedHouseholdId
      );
    } catch (err) {
      console.error(
        "Failed to save energy goal:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to save energy goal."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(goal) {
    setEditingId(
      goal.goalId
    );

    if (
      goal.household
        ?.householdId
    ) {
      setSelectedHouseholdId(
        String(
          goal.household
            .householdId
        )
      );
    }

    setFormData({
      goalName:
        goal.goalName || "",

      goalType:
        goal.goalType ||
        "MONTHLY_CONSUMPTION",

      targetValue:
        goal.targetValue !==
          null &&
        goal.targetValue !==
          undefined
          ? String(
              goal.targetValue
            )
          : "",

      startDate:
        goal.startDate || "",

      endDate:
        goal.endDate || "",
    });

    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);

    setFormData({
      goalName: "",
      goalType:
        "MONTHLY_CONSUMPTION",
      targetValue: "",
      startDate: "",
      endDate: "",
    });
  }

  async function handleDelete(
    goalId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this energy goal?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await goalService.remove(
        goalId
      );

      if (
        editingId === goalId
      ) {
        resetForm();
      }

      setSuccess(
        "Energy goal deleted successfully."
      );

      await loadGoals(
        selectedHouseholdId
      );
    } catch (err) {
      console.error(
        "Failed to delete energy goal:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to delete energy goal."
      );
    }
  }

  const sortedGoals =
    useMemo(() => {
      return [...goals].sort(
        (a, b) =>
          new Date(
            b.createdDate || 0
          ) -
          new Date(
            a.createdDate || 0
          )
      );
    }, [goals]);

  const latestGoal =
    sortedGoals[0] || null;

  function progressPercent(
    goal
  ) {
    const target =
      Number(
        goal.targetValue || 0
      );

    const current =
      Number(
        goal.currentValue || 0
      );

    if (target <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (current / target) *
          100
      )
    );
  }

  return (
    <div className="goal-redesign">
      <section className="goal-redesign-hero">
        <div className="goal-redesign-orb goal-redesign-orb-one" />
        <div className="goal-redesign-orb goal-redesign-orb-two" />

        <div className="goal-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Energy targets
          </p>

          <h1>
            Turn lower electricity use
            into a measurable goal.
          </h1>

          <p>
            Set household consumption
            targets for a defined period
            and track your progress as
            predictions update your
            current energy position.
          </p>
        </div>

        <div className="goal-redesign-hero-badge">
          <span>
            ◎
          </span>

          <div>
            <small>
              Energy target
            </small>

            <strong>
              Goal tracking
            </strong>
          </div>
        </div>

        <div className="goal-redesign-household">
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

      {latestGoal && (
        <section className="goal-redesign-overview">
          <div className="goal-redesign-overview-main">
            <div className="goal-redesign-overview-head">
              <div>
                <p className="dashboard-kicker dashboard-kicker-light">
                  Current goal
                </p>

                <h2>
                  {
                    latestGoal.goalName
                  }
                </h2>
              </div>

              <span
                className={`goal-redesign-status ${statusClass(
                  latestGoal.status
                )}`}
              >
                {statusLabel(
                  latestGoal.status
                )}
              </span>
            </div>

            <div className="goal-redesign-overview-values">
              <div>
                <span>
                  Target
                </span>

                <strong>
                  {formatKwh(
                    latestGoal.targetValue
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Current
                </span>

                <strong>
                  {formatKwh(
                    latestGoal.currentValue
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Goal type
                </span>

                <strong>
                  {formatGoalType(
                    latestGoal.goalType
                  )}
                </strong>
              </div>
            </div>

            <div className="goal-redesign-period">
              <span>
                Goal period
              </span>

              <strong>
                {
                  latestGoal.startDate
                }{" "}
                →{" "}
                {
                  latestGoal.endDate
                }
              </strong>
            </div>

            <div className="goal-redesign-progress">
              <div className="goal-redesign-progress-track">
                <div
                  className="goal-redesign-progress-fill"
                  style={{
                    width: `${progressPercent(
                      latestGoal
                    )}%`,
                  }}
                />
              </div>

              <div className="goal-redesign-progress-foot">
                <span>
                  {progressPercent(
                    latestGoal
                  ).toFixed(1)}
                  % of target
                </span>

                <strong>
                  {statusLabel(
                    latestGoal.status
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="goal-redesign-gauge">
            <div
              className="goal-redesign-gauge-ring"
              style={{
                "--goal-progress":
                  `${progressPercent(
                    latestGoal
                  ) * 3.6}deg`,
              }}
            >
              <div>
                <strong>
                  {progressPercent(
                    latestGoal
                  ).toFixed(0)}
                  %
                </strong>

                <span>
                  progress
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="goal-redesign-grid">
        <article className="goal-redesign-form-card">
          <div className="goal-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Goal setup
              </p>

              <h2>
                {editingId
                  ? "Edit energy goal"
                  : "Create energy goal"}
              </h2>
            </div>

            <span className="goal-redesign-form-icon">
              ◎
            </span>
          </div>

          <form
            className="goal-redesign-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              <span>
                Goal name
              </span>

              <input
                type="text"
                name="goalName"
                value={
                  formData.goalName
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Example: Reduce September consumption"
              />
            </label>

            <label>
              <span>
                Goal type
              </span>

              <select
                name="goalType"
                value={
                  formData.goalType
                }
                onChange={
                  handleChange
                }
              >
                <option value="MONTHLY_CONSUMPTION">
                  Monthly consumption
                </option>

                <option value="ENERGY_REDUCTION">
                  Energy reduction
                </option>

                <option value="CUSTOM">
                  Custom
                </option>
              </select>
            </label>

            <label>
              <span>
                Target value
              </span>

              <div className="goal-redesign-value-input">
                <input
                  type="number"
                  name="targetValue"
                  value={
                    formData.targetValue
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="0.001"
                  required
                  placeholder="150"
                />

                <span>
                  kWh
                </span>
              </div>
            </label>

            <div className="goal-redesign-two-column">
              <label>
                <span>
                  Start date
                </span>

                <input
                  type="date"
                  name="startDate"
                  value={
                    formData.startDate
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                <span>
                  End date
                </span>

                <input
                  type="date"
                  name="endDate"
                  value={
                    formData.endDate
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>
            </div>

            <div className="goal-redesign-actions">
              <button
                type="submit"
                className="goal-redesign-primary"
                disabled={
                  saving ||
                  !selectedHouseholdId
                }
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update goal"
                    : "Create goal"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="goal-redesign-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="goal-redesign-history">
          <div className="goal-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                History
              </p>

              <h2>
                Goal history
              </h2>
            </div>

            <span className="goal-redesign-count">
              {
                sortedGoals.length
              }
            </span>
          </div>

          {!selectedHouseholdId ? (
            <div className="goal-redesign-empty">
              Select a household to view
              goals.
            </div>
          ) : loading ? (
            <div className="goal-redesign-empty">
              Loading energy goals...
            </div>
          ) : sortedGoals.length ===
            0 ? (
            <div className="goal-redesign-empty">
              <div className="goal-redesign-empty-icon">
                ◎
              </div>

              <strong>
                No energy goals yet
              </strong>

              <span>
                Create your first goal
                using the form.
              </span>
            </div>
          ) : (
            <div className="goal-redesign-list">
              {sortedGoals.map(
                (goal) => (
                  <article
                    key={
                      goal.goalId
                    }
                    className="goal-redesign-item"
                  >
                    <div className="goal-redesign-item-top">
                      <div>
                        <span>
                          Energy goal
                        </span>

                        <h3>
                          {
                            goal.goalName
                          }
                        </h3>
                      </div>

                      <span
                        className={`goal-redesign-status ${statusClass(
                          goal.status
                        )}`}
                      >
                        {statusLabel(
                          goal.status
                        )}
                      </span>
                    </div>

                    <div className="goal-redesign-item-values">
                      <div>
                        <span>
                          Target
                        </span>

                        <strong>
                          {formatKwh(
                            goal.targetValue
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Current
                        </span>

                        <strong>
                          {formatKwh(
                            goal.currentValue
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Type
                        </span>

                        <strong>
                          {formatGoalType(
                            goal.goalType
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="goal-redesign-item-period">
                      <span>
                        {
                          goal.startDate
                        }
                      </span>

                      <span>
                        →
                      </span>

                      <span>
                        {
                          goal.endDate
                        }
                      </span>
                    </div>

                    <div className="goal-redesign-item-progress">
                      <div>
                        <span
                          style={{
                            width: `${progressPercent(
                              goal
                            )}%`,
                          }}
                        />
                      </div>

                      <small>
                        {progressPercent(
                          goal
                        ).toFixed(1)}
                        %
                      </small>
                    </div>

                    <div className="goal-redesign-item-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            goal
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="goal-redesign-delete"
                        onClick={() =>
                          handleDelete(
                            goal.goalId
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