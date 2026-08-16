import { useEffect, useState } from "react";

import householdService from "../services/householdService";
import roomService from "../services/roomService";
import applianceService from "../services/applianceService";
import applianceCategoryService from "../services/applianceCategoryService";

export default function Appliances() {
  const [households, setHouseholds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [appliances, setAppliances] = useState([]);

  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    applianceName: "",
    categoryId: "",
    brand: "",
    model: "",
    ratedPower: "",
    quantity: "1",
    energyRating: "",
    typicalDailyHours: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    initialise();
  }, []);

  useEffect(() => {
    if (selectedHouseholdId) {
      loadRooms(selectedHouseholdId);
    } else {
      setRooms([]);
      setSelectedRoomId("");
      setAppliances([]);
    }
  }, [selectedHouseholdId]);

  useEffect(() => {
    if (selectedRoomId) {
      loadAppliances(selectedRoomId);
    } else {
      setAppliances([]);
    }
  }, [selectedRoomId]);

  async function initialise() {
    try {
      setLoading(true);
      setError("");

      const [householdData, categoryData] = await Promise.all([
        householdService.list(),
        applianceCategoryService.list(),
      ]);

      const householdList = Array.isArray(householdData)
        ? householdData
        : [];

      const categoryList = Array.isArray(categoryData)
        ? categoryData
        : [];

      setHouseholds(householdList);
      setCategories(categoryList);

      if (householdList.length > 0) {
        setSelectedHouseholdId(
          String(householdList[0].householdId)
        );
      }
    } catch (err) {
      console.error("Failed to initialise appliances page:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load appliance information."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRooms(householdId) {
    try {
      setLoading(true);
      setError("");

      const data = await roomService.listByHousehold(householdId);

      const roomList = Array.isArray(data) ? data : [];

      setRooms(roomList);

      if (roomList.length > 0) {
        setSelectedRoomId(String(roomList[0].roomId));
      } else {
        setSelectedRoomId("");
        setAppliances([]);
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load rooms."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAppliances(roomId) {
    try {
      setLoading(true);
      setError("");

      const data = await applianceService.listByRoom(roomId);

      setAppliances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load appliances:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load appliances."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleHouseholdChange(event) {
    setSelectedHouseholdId(event.target.value);
    setSelectedRoomId("");
    resetForm();
  }

  function handleRoomChange(event) {
    setSelectedRoomId(event.target.value);
    resetForm();
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!selectedRoomId) {
      setError("Please select a room first.");
      return false;
    }

    if (!formData.applianceName.trim()) {
      setError("Please enter an appliance name.");
      return false;
    }

    if (!formData.categoryId) {
      setError("Please select an appliance category.");
      return false;
    }

    if (
      !formData.ratedPower ||
      Number(formData.ratedPower) <= 0
    ) {
      setError("Rated power must be greater than 0.");
      return false;
    }

    if (
      !formData.quantity ||
      Number(formData.quantity) < 1
    ) {
      setError("Quantity must be at least 1.");
      return false;
    }

    if (
      formData.typicalDailyHours !== "" &&
      Number(formData.typicalDailyHours) < 0
    ) {
      setError("Typical daily hours cannot be negative.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    const payload = {
      room: {
        roomId: Number(selectedRoomId),
      },

      category: {
        categoryId: Number(formData.categoryId),
      },

      applianceName: formData.applianceName.trim(),

      brand: formData.brand.trim(),

      model: formData.model.trim(),

      ratedPower: Number(formData.ratedPower),

      quantity: Number(formData.quantity),

      energyRating: formData.energyRating.trim(),

      typicalDailyHours:
        formData.typicalDailyHours === ""
          ? 0
          : Number(formData.typicalDailyHours),

      status: formData.status,
    };

    try {
      setSaving(true);

      if (editingId) {
        await applianceService.update(editingId, payload);
      } else {
        await applianceService.create(payload);
      }

      resetForm();

      await loadAppliances(selectedRoomId);
    } catch (err) {
      console.error("Failed to save appliance:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save appliance."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(appliance) {
    setEditingId(appliance.applianceId);

    if (appliance.room?.roomId) {
      setSelectedRoomId(String(appliance.room.roomId));
    }

    setFormData({
      applianceName: appliance.applianceName || "",

      categoryId:
        appliance.category?.categoryId !== undefined &&
        appliance.category?.categoryId !== null
          ? String(appliance.category.categoryId)
          : "",

      brand: appliance.brand || "",

      model: appliance.model || "",

      ratedPower:
        appliance.ratedPower !== undefined &&
        appliance.ratedPower !== null
          ? String(appliance.ratedPower)
          : "",

      quantity:
        appliance.quantity !== undefined &&
        appliance.quantity !== null
          ? String(appliance.quantity)
          : "1",

      energyRating: appliance.energyRating || "",

      typicalDailyHours:
        appliance.typicalDailyHours !== undefined &&
        appliance.typicalDailyHours !== null
          ? String(appliance.typicalDailyHours)
          : "",

      status: appliance.status || "ACTIVE",
    });
  }

  function resetForm() {
    setEditingId(null);

    setFormData({
      applianceName: "",
      categoryId: "",
      brand: "",
      model: "",
      ratedPower: "",
      quantity: "1",
      energyRating: "",
      typicalDailyHours: "",
      status: "ACTIVE",
    });
  }

  async function handleDelete(applianceId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appliance?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await applianceService.remove(applianceId);

      if (editingId === applianceId) {
        resetForm();
      }

      await loadAppliances(selectedRoomId);
    } catch (err) {
      console.error("Failed to delete appliance:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to delete appliance."
      );
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>MY HOME</p>

        <h1 style={styles.title}>Appliances</h1>

        <p style={styles.lead}>
          Add the appliances used in each room. Their power,
          quantity and daily use are used when analysing household
          electricity consumption.
        </p>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <section style={styles.selectorCard}>
        <div style={styles.selectorGrid}>
          <div>
            <label style={styles.label}>
              Household
            </label>

            <select
              value={selectedHouseholdId}
              onChange={handleHouseholdChange}
              style={styles.input}
            >
              <option value="">
                Select household
              </option>

              {households.map((household) => (
                <option
                  key={household.householdId}
                  value={household.householdId}
                >
                  {household.householdName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>
              Room
            </label>

            <select
              value={selectedRoomId}
              onChange={handleRoomChange}
              style={styles.input}
              disabled={!selectedHouseholdId}
            >
              <option value="">
                Select room
              </option>

              {rooms.map((room) => (
                <option
                  key={room.roomId}
                  value={room.roomId}
                >
                  {room.roomName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editingId
              ? "Edit appliance"
              : "Add appliance"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>
                Appliance name
              </label>

              <input
                type="text"
                name="applianceName"
                value={formData.applianceName}
                onChange={handleChange}
                required
                placeholder="Example: Ceiling Fan"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Category
              </label>

              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.categoryId}
                    value={category.categoryId}
                  >
                    {category.categoryName ||
                      category.name ||
                      `Category ${category.categoryId}`}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Example: Panasonic"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Model
                </label>

                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Optional"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Rated power (W)
                </label>

                <input
                  type="number"
                  name="ratedPower"
                  value={formData.ratedPower}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Example: 75"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Quantity
                </label>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Energy rating
                </label>

                <input
                  type="text"
                  name="energyRating"
                  value={formData.energyRating}
                  onChange={handleChange}
                  placeholder="Example: A"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Typical daily hours
                </label>

                <input
                  type="number"
                  name="typicalDailyHours"
                  value={formData.typicalDailyHours}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  step="0.1"
                  placeholder="Example: 6"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </div>

            <div style={styles.actions}>
              <button
                type="submit"
                style={styles.primaryButton}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update appliance"
                    : "Create appliance"}
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
          <h2 style={styles.cardTitle}>
            Appliances
          </h2>

          {!selectedRoomId ? (
            <p style={styles.muted}>
              Select a room to view appliances.
            </p>
          ) : loading ? (
            <p style={styles.muted}>
              Loading appliances...
            </p>
          ) : appliances.length === 0 ? (
            <p style={styles.muted}>
              No appliances found in this room.
            </p>
          ) : (
            <div style={styles.list}>
              {appliances.map((appliance) => (
                <div
                  key={appliance.applianceId}
                  style={styles.applianceItem}
                >
                  <div>
                    <h3 style={styles.applianceName}>
                      {appliance.applianceName}
                    </h3>

                    <p style={styles.detail}>
                      <strong>Category:</strong>{" "}
                      {appliance.category?.categoryName ||
                        appliance.category?.name ||
                        "—"}
                    </p>

                    <p style={styles.detail}>
                      <strong>Power:</strong>{" "}
                      {appliance.ratedPower} W
                    </p>

                    <p style={styles.detail}>
                      <strong>Quantity:</strong>{" "}
                      {appliance.quantity}
                    </p>

                    <p style={styles.detail}>
                      <strong>Typical daily use:</strong>{" "}
                      {appliance.typicalDailyHours ?? 0} hours
                    </p>

                    <p style={styles.detail}>
                      <strong>Status:</strong>{" "}
                      {appliance.status}
                    </p>

                    <p style={styles.detail}>
                      <strong>Appliance ID:</strong>{" "}
                      {appliance.applianceId}
                    </p>
                  </div>

                  <div style={styles.itemActions}>
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(appliance)
                      }
                      style={styles.editButton}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          appliance.applianceId
                        )
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

  selectorCard: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "22px",
  },

  selectorGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(340px, 1fr))",
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

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
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

  applianceItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "18px",
    border: "1px solid #eadede",
    borderRadius: "10px",
    background: "#fffafa",
  },

  applianceName: {
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