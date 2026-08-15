import { useEffect, useState } from "react";
import roomService from "../services/roomService";
import householdService from "../services/householdService";

export default function Rooms() {
  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    roomName: "",
    roomType: "",
    description: "",
  });

  useEffect(() => {
    loadHouseholds();
  }, []);

  useEffect(() => {
    if (selectedHouseholdId) {
      loadRooms(selectedHouseholdId);
    } else {
      setRooms([]);
    }
  }, [selectedHouseholdId]);

  async function loadHouseholds() {
    try {
      setLoading(true);
      setError("");

      const data = await householdService.list();
      const householdList = Array.isArray(data) ? data : [];

      setHouseholds(householdList);

      if (householdList.length > 0) {
        setSelectedHouseholdId(
          String(householdList[0].householdId)
        );
      }
    } catch (err) {
      console.error("Failed to load households:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load households."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRooms(householdId) {
    try {
      setLoading(true);
      setError("");

      const data =
        await roomService.listByHousehold(householdId);

      setRooms(Array.isArray(data) ? data : []);
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

  function handleHouseholdChange(event) {
    const value = event.target.value;

    setSelectedHouseholdId(value);
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

    if (!selectedHouseholdId) {
      setError("Please select a household first.");
      return;
    }

    const payload = {
      household: {
        householdId: Number(selectedHouseholdId),
      },
      roomName: formData.roomName.trim(),
      roomType: formData.roomType.trim(),
      description: formData.description.trim(),
    };

    try {
      setError("");

      if (editingId) {
        await roomService.update(
          editingId,
          payload
        );
      } else {
        await roomService.create(payload);
      }

      resetForm();

      await loadRooms(
        selectedHouseholdId
      );
    } catch (err) {
      console.error("Failed to save room:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save room."
      );
    }
  }

  function startEdit(room) {
    setEditingId(room.roomId);

    if (
      room.household &&
      room.household.householdId
    ) {
      setSelectedHouseholdId(
        String(room.household.householdId)
      );
    }

    setFormData({
      roomName: room.roomName || "",
      roomType: room.roomType || "",
      description: room.description || "",
    });
  }

  function resetForm() {
    setEditingId(null);

    setFormData({
      roomName: "",
      roomType: "",
      description: "",
    });
  }

  async function handleDelete(roomId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await roomService.remove(roomId);

      if (editingId === roomId) {
        resetForm();
      }

      await loadRooms(
        selectedHouseholdId
      );
    } catch (err) {
      console.error("Failed to delete room:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to delete room."
      );
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>
          MY HOME
        </p>

        <h1 style={styles.title}>
          Rooms
        </h1>

        <p style={styles.lead}>
          Manage the rooms inside your household.
          Appliances can then be assigned to the
          correct room.
        </p>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <section style={styles.householdSelector}>
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
      </section>

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editingId
              ? "Edit room"
              : "Add room"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>
                Room name
              </label>

              <input
                type="text"
                name="roomName"
                value={formData.roomName}
                onChange={handleChange}
                required
                placeholder="Example: Living Room"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Room type
              </label>

              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">
                  Select room type
                </option>

                <option value="LIVING_ROOM">
                  Living Room
                </option>

                <option value="BEDROOM">
                  Bedroom
                </option>

                <option value="KITCHEN">
                  Kitchen
                </option>

                <option value="BATHROOM">
                  Bathroom
                </option>

                <option value="DINING_ROOM">
                  Dining Room
                </option>

                <option value="OFFICE">
                  Office
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional room description"
                rows="4"
                style={styles.input}
              />
            </div>

            <div style={styles.actions}>
              <button
                type="submit"
                style={styles.primaryButton}
              >
                {editingId
                  ? "Update room"
                  : "Create room"}
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
            Rooms
          </h2>

          {!selectedHouseholdId ? (
            <p style={styles.muted}>
              Select a household to view rooms.
            </p>
          ) : loading ? (
            <p style={styles.muted}>
              Loading rooms...
            </p>
          ) : rooms.length === 0 ? (
            <p style={styles.muted}>
              No rooms found for this household.
            </p>
          ) : (
            <div style={styles.list}>
              {rooms.map((room) => (
                <div
                  key={room.roomId}
                  style={styles.roomItem}
                >
                  <div>
                    <h3 style={styles.roomName}>
                      {room.roomName}
                    </h3>

                    <p style={styles.detail}>
                      <strong>
                        Room type:
                      </strong>{" "}
                      {room.roomType}
                    </p>

                    <p style={styles.detail}>
                      <strong>
                        Description:
                      </strong>{" "}
                      {room.description ||
                        "No description"}
                    </p>

                    <p style={styles.detail}>
                      <strong>
                        Room ID:
                      </strong>{" "}
                      {room.roomId}
                    </p>
                  </div>

                  <div style={styles.itemActions}>
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(room)
                      }
                      style={styles.editButton}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          room.roomId
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

  householdSelector: {
    background: "#ffffff",
    border: "1px solid #e6dcdc",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "22px",
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

  roomItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "18px",
    border:
      "1px solid #eadede",
    borderRadius: "10px",
    background: "#fffafa",
  },

  roomName: {
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