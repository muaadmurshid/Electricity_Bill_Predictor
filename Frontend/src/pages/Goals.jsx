import { useEffect, useMemo, useState } from "react";

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

function statusStyle(status) {
  switch (status) {
    case "ON_TRACK":
      return {
        background: "#e9f7e9",
        color: "#286428",
      };

    case "AT_RISK":
      return {
        background: "#fff4d7",
        color: "#795d12",
      };

    case "ACHIEVED":
      return {
        background: "#e8f2ff",
        color: "#285f8f",
      };

    case "MISSED":
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

function formatKwh(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Number(value).toFixed(3)} kWh`;
}

export default function Goals() {
  const [households, setHouseholds] = useState([]);

  const [selectedHouseholdId, setSelectedHouseholdId] =
    useState("");

  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
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
      loadGoals(selectedHouseholdId);
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
        Array.isArray(householdData)
          ? householdData
          : [];

      setHouseholds(householdList);

      if (householdList.length > 0) {
        setSelectedHouseholdId(
          String(
            householdList[0].householdId
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to initialise goals page:",
        err
      );

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load households."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadGoals(householdId) {
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
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load energy goals."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!selectedHouseholdId) {
      setError(
        "Please select a household."
      );

      return false;
    }

    if (!formData.goalName.trim()) {
      setError(
        "Please enter a goal name."
      );

      return false;
    }

    if (!formData.goalType.trim()) {
      setError(
        "Please select a goal type."
      );

      return false;
    }

    if (
      formData.targetValue === "" ||
      Number(formData.targetValue) < 0
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

  async function handleSubmit(event) {
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
              goal.goalId === editingId
          )
        : null;

    const payload = {
      household: {
        householdId: Number(
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
        existingGoal?.currentValue ??
        0,

      status:
        existingGoal?.status ||
        "ON_TRACK",
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
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save energy goal."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(goal) {
    setEditingId(goal.goalId);

    if (
      goal.household?.householdId
    ) {
      setSelectedHouseholdId(
        String(
          goal.household.householdId
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
        goal.targetValue !== null &&
        goal.targetValue !== undefined
          ? String(goal.targetValue)
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

  async function handleDelete(goalId) {
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

      if (editingId === goalId) {
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
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to delete energy goal."
      );
    }
  }

  const sortedGoals = useMemo(() => {
    return [...goals].sort(
      (a, b) =>
        new Date(b.createdDate || 0) -
        new Date(a.createdDate || 0)
    );
  }, [goals]);

  function progressPercent(goal) {
    const target =
      Number(goal.targetValue || 0);

    const current =
      Number(goal.currentValue || 0);

    if (target <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (current / target) * 100
      )
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>
          TARGETS
        </p>

        <h1 style={styles.title}>
          Energy goals
        </h1>

        <p style={styles.lead}>
          Set a household consumption target
          for a specific date range. When an
          ML prediction falls inside that goal
          period, the backend updates the
          current value and status automatically.
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

      <section style={styles.selectorCard}>
        <label style={styles.label}>
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

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editingId
              ? "Edit energy goal"
              : "Create energy goal"}
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
          >
            <div style={styles.field}>
              <label style={styles.label}>
                Goal name
              </label>

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
                placeholder="Example: Reduce July consumption"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Goal type
              </label>

              <select
                name="goalType"
                value={
                  formData.goalType
                }
                onChange={
                  handleChange
                }
                style={styles.input}
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
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Target value (kWh)
              </label>

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
                placeholder="Example: 150"
                style={styles.input}
              />
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Start date
                </label>

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
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  End date
                </label>

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
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.actions}>
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
                    ? "Update goal"
                    : "Create goal"}
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

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Goal history
          </h2>

          {!selectedHouseholdId ? (
            <p style={styles.muted}>
              Select a household to view goals.
            </p>
          ) : loading ? (
            <p style={styles.muted}>
              Loading energy goals...
            </p>
          ) : sortedGoals.length === 0 ? (
            <p style={styles.muted}>
              No energy goals found for this household.
            </p>
          ) : (
            <div style={styles.list}>
              {sortedGoals.map(
                (goal) => (
                  <div
                    key={goal.goalId}
                    style={
                      styles.goalItem
                    }
                  >
                    <div style={{ flex: 1 }}>
                      <div style={styles.itemHeading}>
                        <h3 style={styles.goalName}>
                          {goal.goalName}
                        </h3>

                        <span
                          style={{
                            ...styles.statusBadge,
                            ...statusStyle(
                              goal.status
                            ),
                          }}
                        >
                          {statusLabel(
                            goal.status
                          )}
                        </span>
                      </div>

                      <p style={styles.detail}>
                        <strong>
                          Goal type:
                        </strong>{" "}
                        {goal.goalType}
                      </p>

                      <p style={styles.detail}>
                        <strong>
                          Target:
                        </strong>{" "}
                        {formatKwh(
                          goal.targetValue
                        )}
                      </p>

                      <p style={styles.detail}>
                        <strong>
                          Current:
                        </strong>{" "}
                        {formatKwh(
                          goal.currentValue
                        )}
                      </p>

                      <p style={styles.detail}>
                        <strong>
                          Period:
                        </strong>{" "}
                        {goal.startDate} to{" "}
                        {goal.endDate}
                      </p>

                      <div
                        style={
                          styles.meterTrack
                        }
                      >
                        <div
                          style={{
                            ...styles.meterFill,
                            width: `${progressPercent(
                              goal
                            )}%`,
                          }}
                        />
                      </div>

                      <p style={styles.meterText}>
                        {progressPercent(
                          goal
                        ).toFixed(1)}
                        % of target value
                      </p>
                    </div>

                    <div style={styles.itemActions}>
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(goal)
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
                            goal.goalId
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

  selectorCard: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "22px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(380px, 1fr))",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "24px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

  cardTitle: {
    margin: "0 0 20px",
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
    border: "1px solid #d8caca",
    borderRadius: "8px",
    fontSize: "15px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "14px",
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
    border: "1px solid #cbbbbb",
    borderRadius: "8px",
    background: "#ffffff",
    cursor: "pointer",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  goalItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "18px",
    border: "1px solid #eadede",
    borderRadius: "10px",
    background: "#fffafa",
  },

  itemHeading: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "10px",
  },

  goalName: {
    margin: 0,
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

  meterTrack: {
    width: "100%",
    maxWidth: "420px",
    height: "10px",
    borderRadius: "999px",
    overflow: "hidden",
    background: "#eee4e4",
    marginTop: "12px",
  },

  meterFill: {
    height: "100%",
    borderRadius: "999px",
    background: "#7f0000",
  },

  meterText: {
    margin: "7px 0 0",
    fontSize: "12px",
    color: "#806d6d",
  },

  itemActions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  editButton: {
    padding: "8px 14px",
    border: "1px solid #a88",
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