import { useEffect, useState } from "react";
import householdService from "../services/householdService";

export default function Household() {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    householdName: "",
    location: "",
    houseType: "",
    numberOfResidents: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadHouseholds();
  }, []);

  async function loadHouseholds() {
    try {
      setLoading(true);
      setError("");

      const data = await householdService.list();

      setHouseholds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load households:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load household details."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const payload = {
      householdName: formData.householdName.trim(),
      location: formData.location.trim(),
      houseType: formData.houseType.trim(),
      numberOfResidents: Number(formData.numberOfResidents),
    };

    try {
      if (editingId) {
        await householdService.update(editingId, payload);
      } else {
        await householdService.create(payload);
      }

      resetForm();
      await loadHouseholds();
    } catch (err) {
      console.error("Failed to save household:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save household."
      );
    }
  }

  function startEdit(household) {
    setEditingId(household.householdId);

    setFormData({
      householdName: household.householdName || "",
      location: household.location || "",
      houseType: household.houseType || "",
      numberOfResidents:
        household.numberOfResidents !== null &&
        household.numberOfResidents !== undefined
          ? String(household.numberOfResidents)
          : "",
    });
  }

  function resetForm() {
    setEditingId(null);

    setFormData({
      householdName: "",
      location: "",
      houseType: "",
      numberOfResidents: "",
    });
  }

  async function handleDelete(householdId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this household?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await householdService.remove(householdId);

      if (editingId === householdId) {
        resetForm();
      }

      await loadHouseholds();
    } catch (err) {
      console.error("Failed to delete household:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to delete household."
      );
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>MY HOME</p>

        <h1 style={styles.title}>Household</h1>

        <p style={styles.lead}>
          Manage your household details. Rooms, appliances, electricity usage,
          bills, predictions and energy targets are connected to your household.
        </p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editingId ? "Edit household" : "Add household"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Household name</label>

              <input
                type="text"
                name="householdName"
                value={formData.householdName}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Example: My Home"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Location</label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Example: Colombo"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>House type</label>

              <select
                name="houseType"
                value={formData.houseType}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select house type</option>
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="ANNEX">Annex</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Number of residents</label>

              <input
                type="number"
                name="numberOfResidents"
                value={formData.numberOfResidents}
                onChange={handleChange}
                required
                min="1"
                style={styles.input}
                placeholder="Example: 4"
              />
            </div>

            <div style={styles.actions}>
              <button type="submit" style={styles.primaryButton}>
                {editingId ? "Update household" : "Create household"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Your household</h2>

          {loading ? (
            <p style={styles.muted}>Loading household...</p>
          ) : households.length === 0 ? (
            <p style={styles.muted}>
              No household found. Create your household using the form.
            </p>
          ) : (
            <div style={styles.list}>
              {households.map((household) => (
                <div
                  key={household.householdId}
                  style={styles.householdItem}
                >
                  <div>
                    <h3 style={styles.householdName}>
                      {household.householdName}
                    </h3>

                    <p style={styles.detail}>
                      <strong>Location:</strong> {household.location}
                    </p>

                    <p style={styles.detail}>
                      <strong>House type:</strong> {household.houseType}
                    </p>

                    <p style={styles.detail}>
                      <strong>Residents:</strong>{" "}
                      {household.numberOfResidents}
                    </p>

                    <p style={styles.detail}>
                      <strong>Household ID:</strong>{" "}
                      {household.householdId}
                    </p>
                  </div>

                  <div style={styles.itemActions}>
                    <button
                      type="button"
                      onClick={() => startEdit(household)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(household.householdId)
                      }
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
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
    maxWidth: "700px",
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },

  cardTitle: {
    marginTop: 0,
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
    border: "1px solid #d8caca",
    borderRadius: "8px",
    fontSize: "15px",
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

  householdItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "18px",
    border: "1px solid #eadede",
    borderRadius: "10px",
    background: "#fffafa",
  },

  householdName: {
    marginTop: 0,
    marginBottom: "12px",
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