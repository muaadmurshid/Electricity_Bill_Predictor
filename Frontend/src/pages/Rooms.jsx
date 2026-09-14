import {
  useEffect,
  useMemo,
  useState,
} from "react";

import roomService from "../services/roomService";
import householdService from "../services/householdService";

function formatRoomType(value) {
  switch (value) {
    case "LIVING_ROOM":
      return "Living Room";

    case "BEDROOM":
      return "Bedroom";

    case "KITCHEN":
      return "Kitchen";

    case "BATHROOM":
      return "Bathroom";

    case "DINING_ROOM":
      return "Dining Room";

    case "OFFICE":
      return "Office";

    case "OTHER":
      return "Other";

    default:
      return value || "—";
  }
}

function roomIcon(type) {
  switch (type) {
    case "LIVING_ROOM":
      return "◫";

    case "BEDROOM":
      return "▭";

    case "KITCHEN":
      return "▦";

    case "BATHROOM":
      return "◌";

    case "DINING_ROOM":
      return "◈";

    case "OFFICE":
      return "□";

    default:
      return "▤";
  }
}

export default function Rooms() {
  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    rooms,
    setRooms,
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
    roomName: "",
    roomType: "",
    description: "",
  });

  useEffect(() => {
    loadHouseholds();
  }, []);

  useEffect(() => {
    if (
      selectedHouseholdId
    ) {
      loadRooms(
        selectedHouseholdId
      );
    } else {
      setRooms([]);
    }
  }, [
    selectedHouseholdId,
  ]);

  async function loadHouseholds() {
    try {
      setLoading(true);
      setError("");

      const data =
        await householdService.list();

      const householdList =
        Array.isArray(data)
          ? data
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

  async function loadRooms(
    householdId
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await roomService.listByHousehold(
          householdId
        );

      setRooms(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load rooms:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load rooms."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleHouseholdChange(
    event
  ) {
    const value =
      event.target.value;

    setSelectedHouseholdId(
      value
    );

    resetForm();

    setError("");
    setSuccess("");
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
        "Please select a household first."
      );

      return false;
    }

    if (
      !formData.roomName.trim()
    ) {
      setError(
        "Please enter a room name."
      );

      return false;
    }

    if (
      !formData.roomType
    ) {
      setError(
        "Please select a room type."
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

    const payload = {
      household: {
        householdId:
          Number(
            selectedHouseholdId
          ),
      },

      roomName:
        formData.roomName.trim(),

      roomType:
        formData.roomType.trim(),

      description:
        formData.description.trim(),
    };

    try {
      setSaving(true);

      if (editingId) {
        await roomService.update(
          editingId,
          payload
        );

        setSuccess(
          "Room updated successfully."
        );
      } else {
        await roomService.create(
          payload
        );

        setSuccess(
          "Room created successfully."
        );
      }

      resetForm();

      await loadRooms(
        selectedHouseholdId
      );
    } catch (err) {
      console.error(
        "Failed to save room:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to save room."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(room) {
    setEditingId(
      room.roomId
    );

    if (
      room.household &&
      room.household.householdId
    ) {
      setSelectedHouseholdId(
        String(
          room.household
            .householdId
        )
      );
    }

    setFormData({
      roomName:
        room.roomName || "",

      roomType:
        room.roomType || "",

      description:
        room.description || "",
    });

    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);

    setFormData({
      roomName: "",
      roomType: "",
      description: "",
    });
  }

  async function handleDelete(
    roomId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this room?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await roomService.remove(
        roomId
      );

      if (
        editingId === roomId
      ) {
        resetForm();
      }

      setSuccess(
        "Room deleted successfully."
      );

      await loadRooms(
        selectedHouseholdId
      );
    } catch (err) {
      console.error(
        "Failed to delete room:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to delete room."
      );
    }
  }

  const selectedHousehold =
    useMemo(
      () =>
        households.find(
          (household) =>
            String(
              household.householdId
            ) ===
            String(
              selectedHouseholdId
            )
        ) || null,
      [
        households,
        selectedHouseholdId,
      ]
    );

  const roomTypeCount =
    useMemo(() => {
      return new Set(
        rooms
          .map(
            (room) =>
              room.roomType
          )
          .filter(Boolean)
      ).size;
    }, [rooms]);

  return (
    <div className="rooms-redesign">
      <section className="rooms-redesign-hero">
        <div className="rooms-redesign-orb rooms-redesign-orb-one" />
        <div className="rooms-redesign-orb rooms-redesign-orb-two" />

        <div className="rooms-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            My home
          </p>

          <h1>
            Organise your home room by
            room.
          </h1>

          <p>
            Create the spaces inside your
            household so appliances and
            electricity usage can be
            organised in the correct
            location.
          </p>
        </div>

        <div className="rooms-redesign-hero-badge">
          <span>
            ▤
          </span>

          <div>
            <small>
              Home structure
            </small>

            <strong>
              Rooms
            </strong>
          </div>
        </div>

        <div className="rooms-redesign-household">
          <label>
            <span>
              Household
            </span>

            <select
              value={
                selectedHouseholdId
              }
              onChange={
                handleHouseholdChange
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

      <section className="rooms-redesign-summary">
        <article className="rooms-redesign-stat rooms-redesign-stat-feature">
          <div className="rooms-redesign-stat-icon">
            ▤
          </div>

          <span>
            Rooms
          </span>

          <strong>
            {
              rooms.length
            }
          </strong>

          <p>
            Spaces created for this
            household.
          </p>
        </article>

        <article className="rooms-redesign-stat">
          <div className="rooms-redesign-stat-icon rooms-redesign-stat-icon-green">
            ◈
          </div>

          <span>
            Room types
          </span>

          <strong>
            {
              roomTypeCount
            }
          </strong>

          <p>
            Different room categories in
            use.
          </p>
        </article>

        <article className="rooms-redesign-stat">
          <div className="rooms-redesign-stat-icon">
            ⌂
          </div>

          <span>
            Household
          </span>

          <strong>
            {selectedHousehold
              ?.householdName ||
              "—"}
          </strong>

          <p>
            Current household profile.
          </p>
        </article>
      </section>

      <section className="rooms-redesign-grid">
        <article className="rooms-redesign-form-card">
          <div className="rooms-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Room setup
              </p>

              <h2>
                {editingId
                  ? "Edit room"
                  : "Add room"}
              </h2>
            </div>

            <span className="rooms-redesign-form-icon">
              ▤
            </span>
          </div>

          <form
            className="rooms-redesign-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              <span>
                Room name
              </span>

              <input
                type="text"
                name="roomName"
                value={
                  formData.roomName
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Example: Living Room"
              />
            </label>

            <label>
              <span>
                Room type
              </span>

              <select
                name="roomType"
                value={
                  formData.roomType
                }
                onChange={
                  handleChange
                }
                required
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
            </label>

            <label>
              <span>
                Description
              </span>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                placeholder="Optional room description"
                rows="5"
              />
            </label>

            <div className="rooms-redesign-actions">
              <button
                type="submit"
                className="rooms-redesign-primary"
                disabled={
                  saving ||
                  !selectedHouseholdId
                }
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update room"
                    : "Create room"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="rooms-redesign-secondary"
                  onClick={
                    resetForm
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="rooms-redesign-list-card">
          <div className="rooms-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Household spaces
              </p>

              <h2>
                Your rooms
              </h2>
            </div>

            <span className="rooms-redesign-count">
              {
                rooms.length
              }
            </span>
          </div>

          {!selectedHouseholdId ? (
            <div className="rooms-redesign-empty">
              Select a household to view
              rooms.
            </div>
          ) : loading ? (
            <div className="rooms-redesign-empty">
              Loading rooms...
            </div>
          ) : rooms.length ===
            0 ? (
            <div className="rooms-redesign-empty">
              <div className="rooms-redesign-empty-icon">
                ▤
              </div>

              <strong>
                No rooms yet
              </strong>

              <span>
                Add your first room using
                the form.
              </span>
            </div>
          ) : (
            <div className="rooms-redesign-list">
              {rooms.map(
                (room) => (
                  <article
                    key={
                      room.roomId
                    }
                    className="rooms-redesign-item"
                  >
                    <div className="rooms-redesign-item-top">
                      <div className="rooms-redesign-item-icon">
                        {roomIcon(
                          room.roomType
                        )}
                      </div>

                      <div className="rooms-redesign-item-title">
                        <span>
                          {formatRoomType(
                            room.roomType
                          )}
                        </span>

                        <h3>
                          {
                            room.roomName
                          }
                        </h3>

                        <p>
                          {room.description ||
                            "No description"}
                        </p>
                      </div>
                    </div>

                    <div className="rooms-redesign-item-values">
                      <div>
                        <span>
                          Room type
                        </span>

                        <strong>
                          {formatRoomType(
                            room.roomType
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Room ID
                        </span>

                        <strong>
                          #
                          {
                            room.roomId
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="rooms-redesign-item-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            room
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="rooms-redesign-delete"
                        onClick={() =>
                          handleDelete(
                            room.roomId
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