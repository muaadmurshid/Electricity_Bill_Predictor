import { useEffect, useMemo, useState } from "react";

import usageService from "../services/dailyusageService";
import householdService from "../services/householdService";
import roomService from "../services/roomService";
import applianceService from "../services/applianceService";

export default function DailyUsage() {
  const [households, setHouseholds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [usageRecords, setUsageRecords] = useState([]);

  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    applianceId: "",
    usageDate: "",
    hoursUsed: "",
    usageNotes: "",
  });

  useEffect(() => {
    loadInitialData();
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

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const [householdData, usageData] = await Promise.all([
        householdService.list(),
        usageService.list(),
      ]);

      const householdList = Array.isArray(householdData)
        ? householdData
        : [];

      setHouseholds(householdList);

      setUsageRecords(
        Array.isArray(usageData) ? usageData : []
      );

      if (householdList.length > 0) {
        setSelectedHouseholdId(
          String(householdList[0].householdId)
        );
      }
    } catch (err) {
      console.error("Failed to load daily usage data:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load daily usage data."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadUsageRecords() {
    try {
      const data = await usageService.list();

      setUsageRecords(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error("Failed to load usage records:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load usage records."
      );
    }
  }

  async function loadRooms(householdId) {
    try {
      setLoading(true);
      setError("");

      const data =
        await roomService.listByHousehold(householdId);

      const roomList = Array.isArray(data)
        ? data
        : [];

      setRooms(roomList);

      if (roomList.length > 0) {
        setSelectedRoomId(
          String(roomList[0].roomId)
        );
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

      const data =
        await applianceService.listByRoom(roomId);

      setAppliances(
        Array.isArray(data) ? data : []
      );
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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.applianceId) {
      setError("Please select an appliance.");
      return;
    }

    const payload = {
      appliance: {
        applianceId: Number(formData.applianceId),
      },
      usageDate: formData.usageDate,
      hoursUsed: Number(formData.hoursUsed),
      usageNotes: formData.usageNotes.trim(),
    };

    try {
      setError("");
      setSuccess("");

      if (editingId) {
        await usageService.update(
          editingId,
          payload
        );

        setSuccess(
          "Daily usage updated successfully."
        );
      } else {
        await usageService.create(payload);

        setSuccess(
          "Daily usage recorded successfully."
        );
      }

      resetForm();
      await loadUsageRecords();
    } catch (err) {
      console.error("Failed to save daily usage:", err);

      if (err?.response?.status === 409) {
        setError(
          "A usage record already exists for this appliance on the selected date."
        );
      } else {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to save daily usage."
        );
      }
    }
  }

  function startEdit(record) {
    setEditingId(record.usageId);

    const applianceId =
      record.appliance?.applianceId;

    const roomId =
      record.appliance?.room?.roomId;

    const householdId =
      record.appliance?.room?.household?.householdId;

    if (householdId) {
      setSelectedHouseholdId(
        String(householdId)
      );
    }

    if (roomId) {
      setSelectedRoomId(
        String(roomId)
      );
    }

    setFormData({
      applianceId:
        applianceId !== undefined &&
        applianceId !== null
          ? String(applianceId)
          : "",

      usageDate:
        record.usageDate || "",

      hoursUsed:
        record.hoursUsed !== null &&
        record.hoursUsed !== undefined
          ? String(record.hoursUsed)
          : "",

      usageNotes:
        record.usageNotes || "",
    });

    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);

    setFormData({
      applianceId: "",
      usageDate: "",
      hoursUsed: "",
      usageNotes: "",
    });
  }

  async function handleDelete(usageId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this daily usage record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await usageService.remove(usageId);

      setSuccess(
        "Daily usage record deleted successfully."
      );

      if (editingId === usageId) {
        resetForm();
      }

      await loadUsageRecords();
    } catch (err) {
      console.error("Failed to delete daily usage:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to delete daily usage."
      );
    }
  }

  const filteredUsageRecords = useMemo(() => {
    if (!selectedHouseholdId) {
      return usageRecords;
    }

    return usageRecords.filter((record) => {
      const householdId =
        record.appliance?.room?.household?.householdId;

      return (
        String(householdId) ===
        String(selectedHouseholdId)
      );
    });
  }, [
    usageRecords,
    selectedHouseholdId,
  ]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>
          RECORDS
        </p>

        <h1 style={styles.title}>
          Daily usage
        </h1>

        <p style={styles.lead}>
          Record how many hours each appliance runs each day.
          Electricity consumption is calculated automatically by
          the backend using the appliance rated power and quantity.
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
        <div style={styles.selectorGrid}>
          <div>
            <label style={styles.label}>
              Select household
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
              Select room
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
              ? "Edit daily usage"
              : "Record daily usage"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>
                Appliance
              </label>

              <select
                name="applianceId"
                value={formData.applianceId}
                onChange={handleChange}
                required
                style={styles.input}
                disabled={!selectedRoomId}
              >
                <option value="">
                  Select appliance
                </option>

                {appliances.map((appliance) => (
                  <option
                    key={appliance.applianceId}
                    value={appliance.applianceId}
                  >
                    {appliance.applianceName}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Usage date
              </label>

              <input
                type="date"
                name="usageDate"
                value={formData.usageDate}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Hours used
              </label>

             <input
                type="number"
                name="hoursUsed"
                value={formData.hoursUsed}
                onChange={handleChange}
                required
                min="0"
                max="24"
                step="0.1"
                style={styles.input}
                placeholder="Example: 5.5"
/>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Usage notes
              </label>

              <textarea
                name="usageNotes"
                value={formData.usageNotes}
                onChange={handleChange}
                rows="4"
                style={styles.input}
                placeholder="Optional notes"
              />
            </div>

            <div style={styles.actions}>
              <button
                type="submit"
                style={styles.primaryButton}
              >
                {editingId
                  ? "Update usage"
                  : "Record usage"}
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
            Usage records
          </h2>

          {loading ? (
            <p style={styles.muted}>
              Loading daily usage...
            </p>
          ) : filteredUsageRecords.length === 0 ? (
            <p style={styles.muted}>
              No daily usage records found for this household.
            </p>
          ) : (
            <div style={styles.list}>
              {filteredUsageRecords.map((record) => (
                <div
                  key={record.usageId}
                  style={styles.usageItem}
                >
                  <div>
                    <h3 style={styles.applianceName}>
                      {record.appliance?.applianceName ||
                        "Appliance"}
                    </h3>

                    <p style={styles.detail}>
                      <strong>Date:</strong>{" "}
                      {record.usageDate}
                    </p>

                    <p style={styles.detail}>
                      <strong>Hours used:</strong>{" "}
                      {record.hoursUsed}
                    </p>

                    <p style={styles.detail}>
                      <strong>Consumption:</strong>{" "}
                      {record.estimatedConsumptionKwh ?? "—"} kWh
                    </p>

                    <p style={styles.detail}>
                      <strong>Room:</strong>{" "}
                      {record.appliance?.room?.roomName ||
                        "—"}
                    </p>

                    <p style={styles.detail}>
                      <strong>Notes:</strong>{" "}
                      {record.usageNotes || "—"}
                    </p>

                    <p style={styles.detail}>
                      <strong>Usage ID:</strong>{" "}
                      {record.usageId}
                    </p>
                  </div>

                  <div style={styles.itemActions}>
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(record)
                      }
                      style={styles.editButton}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          record.usageId
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
    maxWidth: "780px",
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

  selectorGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
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

  usageItem: {
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