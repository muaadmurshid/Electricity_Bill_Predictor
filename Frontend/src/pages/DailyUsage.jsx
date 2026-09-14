import {
  useEffect,
  useMemo,
  useState,
} from "react";

import usageService from "../services/dailyusageService";
import householdService from "../services/householdService";
import roomService from "../services/roomService";
import applianceService from "../services/applianceService";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(`${value}T00:00:00`);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-LK",
    {
      dateStyle: "medium",
    }
  ).format(date);
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

export default function DailyUsage() {
  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    rooms,
    setRooms,
  ] = useState([]);

  const [
    appliances,
    setAppliances,
  ] = useState([]);

  const [
    usageRecords,
    setUsageRecords,
  ] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    selectedRoomId,
    setSelectedRoomId,
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
    applianceId: "",
    usageDate: "",
    hoursUsed: "",
    usageNotes: "",
  });

  useEffect(() => {
    loadInitialData();
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
      setSelectedRoomId("");
      setAppliances([]);
    }
  }, [selectedHouseholdId]);

  useEffect(() => {
    if (
      selectedRoomId
    ) {
      loadAppliances(
        selectedRoomId
      );
    } else {
      setAppliances([]);
    }
  }, [selectedRoomId]);

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const [
        householdData,
        usageData,
      ] = await Promise.all([
        householdService.list(),
        usageService.list(),
      ]);

      const householdList =
        Array.isArray(
          householdData
        )
          ? householdData
          : [];

      setHouseholds(
        householdList
      );

      setUsageRecords(
        Array.isArray(
          usageData
        )
          ? usageData
          : []
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
        "Failed to load daily usage data:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load daily usage data."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadUsageRecords() {
    try {
      const data =
        await usageService.list();

      setUsageRecords(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load usage records:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load usage records."
      );
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

      const roomList =
        Array.isArray(data)
          ? data
          : [];

      setRooms(
        roomList
      );

      if (
        roomList.length > 0
      ) {
        setSelectedRoomId(
          String(
            roomList[0].roomId
          )
        );
      } else {
        setSelectedRoomId("");
        setAppliances([]);
      }
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

  async function loadAppliances(
    roomId
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await applianceService.listByRoom(
          roomId
        );

      setAppliances(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load appliances:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load appliances."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleHouseholdChange(
    event
  ) {
    setSelectedHouseholdId(
      event.target.value
    );

    setSelectedRoomId("");

    resetForm();

    setError("");
    setSuccess("");
  }

  function handleRoomChange(
    event
  ) {
    setSelectedRoomId(
      event.target.value
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
      !formData.applianceId
    ) {
      setError(
        "Please select an appliance."
      );

      return false;
    }

    if (
      !formData.usageDate
    ) {
      setError(
        "Please select a usage date."
      );

      return false;
    }

    if (
      formData.hoursUsed ===
        "" ||
      Number(
        formData.hoursUsed
      ) < 0 ||
      Number(
        formData.hoursUsed
      ) > 24
    ) {
      setError(
        "Hours used must be between 0 and 24."
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
      appliance: {
        applianceId:
          Number(
            formData.applianceId
          ),
      },

      usageDate:
        formData.usageDate,

      hoursUsed:
        Number(
          formData.hoursUsed
        ),

      usageNotes:
        formData.usageNotes.trim(),
    };

    try {
      setSaving(true);

      if (editingId) {
        await usageService.update(
          editingId,
          payload
        );

        setSuccess(
          "Daily usage updated successfully."
        );
      } else {
        await usageService.create(
          payload
        );

        setSuccess(
          "Daily usage recorded successfully."
        );
      }

      resetForm();

      await loadUsageRecords();
    } catch (err) {
      console.error(
        "Failed to save daily usage:",
        err
      );

      if (
        err?.response?.status ===
        409
      ) {
        setError(
          "A usage record already exists for this appliance on the selected date."
        );
      } else {
        setError(
          err?.response?.data
            ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to save daily usage."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  function startEdit(record) {
    setEditingId(
      record.usageId
    );

    const applianceId =
      record.appliance
        ?.applianceId;

    const roomId =
      record.appliance?.room
        ?.roomId;

    const householdId =
      record.appliance?.room
        ?.household
        ?.householdId;

    if (householdId) {
      setSelectedHouseholdId(
        String(
          householdId
        )
      );
    }

    if (roomId) {
      setSelectedRoomId(
        String(roomId)
      );
    }

    setFormData({
      applianceId:
        applianceId !==
          undefined &&
        applianceId !==
          null
          ? String(
              applianceId
            )
          : "",

      usageDate:
        record.usageDate ||
        "",

      hoursUsed:
        record.hoursUsed !==
          null &&
        record.hoursUsed !==
          undefined
          ? String(
              record.hoursUsed
            )
          : "",

      usageNotes:
        record.usageNotes ||
        "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

  async function handleDelete(
    usageId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this daily usage record?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await usageService.remove(
        usageId
      );

      setSuccess(
        "Daily usage record deleted successfully."
      );

      if (
        editingId === usageId
      ) {
        resetForm();
      }

      await loadUsageRecords();
    } catch (err) {
      console.error(
        "Failed to delete daily usage:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to delete daily usage."
      );
    }
  }

  const filteredUsageRecords =
    useMemo(() => {
      if (
        !selectedHouseholdId
      ) {
        return usageRecords;
      }

      return usageRecords.filter(
        (record) => {
          const householdId =
            record.appliance
              ?.room
              ?.household
              ?.householdId;

          return (
            String(
              householdId
            ) ===
            String(
              selectedHouseholdId
            )
          );
        }
      );
    }, [
      usageRecords,
      selectedHouseholdId,
    ]);

  const sortedUsageRecords =
    useMemo(() => {
      return [
        ...filteredUsageRecords,
      ].sort(
        (a, b) =>
          new Date(
            b.usageDate || 0
          ) -
          new Date(
            a.usageDate || 0
          )
      );
    }, [
      filteredUsageRecords,
    ]);

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

  const selectedRoom =
    useMemo(
      () =>
        rooms.find(
          (room) =>
            String(
              room.roomId
            ) ===
            String(
              selectedRoomId
            )
        ) || null,
      [
        rooms,
        selectedRoomId,
      ]
    );

  const totalConsumption =
    useMemo(
      () =>
        filteredUsageRecords.reduce(
          (
            total,
            record
          ) =>
            total +
            Number(
              record.estimatedConsumptionKwh ||
                0
            ),
          0
        ),
      [filteredUsageRecords]
    );

  const totalHours =
    useMemo(
      () =>
        filteredUsageRecords.reduce(
          (
            total,
            record
          ) =>
            total +
            Number(
              record.hoursUsed ||
                0
            ),
          0
        ),
      [filteredUsageRecords]
    );

  const uniqueApplianceCount =
    useMemo(() => {
      return new Set(
        filteredUsageRecords
          .map(
            (record) =>
              record.appliance
                ?.applianceId
          )
          .filter(Boolean)
      ).size;
    }, [
      filteredUsageRecords,
    ]);

  return (
    <div className="usage-redesign">
      <section className="usage-redesign-hero">
        <div className="usage-redesign-orb usage-redesign-orb-one" />
        <div className="usage-redesign-orb usage-redesign-orb-two" />

        <div className="usage-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Daily energy records
          </p>

          <h1>
            Turn appliance hours into
            real energy data.
          </h1>

          <p>
            Record how long appliances
            run each day. Your backend
            automatically converts those
            hours, rated power and
            quantity into estimated
            electricity consumption.
          </p>
        </div>

        <div className="usage-redesign-hero-badge">
          <span>
            ⏱
          </span>

          <div>
            <small>
              Usage tracking
            </small>

            <strong>
              Daily records
            </strong>
          </div>
        </div>

        <div className="usage-redesign-selectors">
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

          <label>
            <span>
              Room
            </span>

            <select
              value={
                selectedRoomId
              }
              onChange={
                handleRoomChange
              }
              disabled={
                !selectedHouseholdId
              }
            >
              <option value="">
                Select room
              </option>

              {rooms.map(
                (room) => (
                  <option
                    key={
                      room.roomId
                    }
                    value={
                      room.roomId
                    }
                  >
                    {
                      room.roomName
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

      <section className="usage-redesign-summary">
        <article className="usage-redesign-stat usage-redesign-stat-feature">
          <div className="usage-redesign-stat-icon">
            ⚡
          </div>

          <span>
            Consumption
          </span>

          <strong>
            {totalConsumption.toFixed(
              3
            )}
            <small>
              kWh
            </small>
          </strong>

          <p>
            Recorded for the selected
            household.
          </p>
        </article>

        <article className="usage-redesign-stat">
          <div className="usage-redesign-stat-icon usage-redesign-stat-icon-green">
            ⏱
          </div>

          <span>
            Usage hours
          </span>

          <strong>
            {totalHours.toFixed(
              1
            )}
            <small>
              hrs
            </small>
          </strong>

          <p>
            Total appliance operating
            time recorded.
          </p>
        </article>

        <article className="usage-redesign-stat">
          <div className="usage-redesign-stat-icon">
            ⏻
          </div>

          <span>
            Appliances tracked
          </span>

          <strong>
            {
              uniqueApplianceCount
            }
          </strong>

          <p>
            Appliances with saved usage
            records.
          </p>
        </article>

        <article className="usage-redesign-stat">
          <div className="usage-redesign-stat-icon">
            ▤
          </div>

          <span>
            Current room
          </span>

          <strong>
            {selectedRoom
              ?.roomName ||
              "—"}
          </strong>

          <p>
            {selectedHousehold
              ?.householdName ||
              "No household selected"}
          </p>
        </article>
      </section>

      <section className="usage-redesign-grid">
        <article className="usage-redesign-form-card">
          <div className="usage-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Usage entry
              </p>

              <h2>
                {editingId
                  ? "Edit daily usage"
                  : "Record daily usage"}
              </h2>
            </div>

            <span className="usage-redesign-form-icon">
              ⏱
            </span>
          </div>

          <form
            className="usage-redesign-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              <span>
                Appliance
              </span>

              <select
                name="applianceId"
                value={
                  formData.applianceId
                }
                onChange={
                  handleChange
                }
                required
                disabled={
                  !selectedRoomId
                }
              >
                <option value="">
                  Select appliance
                </option>

                {appliances.map(
                  (appliance) => (
                    <option
                      key={
                        appliance.applianceId
                      }
                      value={
                        appliance.applianceId
                      }
                    >
                      {
                        appliance.applianceName
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <div className="usage-redesign-two-column">
              <label>
                <span>
                  Usage date
                </span>

                <input
                  type="date"
                  name="usageDate"
                  value={
                    formData.usageDate
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Hours used
                </span>

                <div className="usage-redesign-unit-input">
                  <input
                    type="number"
                    name="hoursUsed"
                    value={
                      formData.hoursUsed
                    }
                    onChange={
                      handleChange
                    }
                    required
                    min="0"
                    max="24"
                    step="0.1"
                    placeholder="5.5"
                  />

                  <span>
                    hrs
                  </span>
                </div>
              </label>
            </div>

            <label>
              <span>
                Usage notes
              </span>

              <textarea
                name="usageNotes"
                value={
                  formData.usageNotes
                }
                onChange={
                  handleChange
                }
                rows="5"
                placeholder="Optional notes about how this appliance was used"
              />
            </label>

            <div className="usage-redesign-calculation-note">
              <span>
                ⚡
              </span>

              <div>
                <strong>
                  Consumption is
                  automatic
                </strong>

                <p>
                  You only enter the
                  appliance and hours
                  used. The backend uses
                  rated power and
                  quantity to calculate
                  estimated kWh.
                </p>
              </div>
            </div>

            <div className="usage-redesign-actions">
              <button
                type="submit"
                className="usage-redesign-primary"
                disabled={
                  saving ||
                  !selectedRoomId
                }
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update usage"
                    : "Record usage"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="usage-redesign-secondary"
                  onClick={
                    resetForm
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="usage-redesign-history-card">
          <div className="usage-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Energy history
              </p>

              <h2>
                Usage records
              </h2>
            </div>

            <span className="usage-redesign-count">
              {
                sortedUsageRecords.length
              }
            </span>
          </div>

          {!selectedHouseholdId ? (
            <div className="usage-redesign-empty">
              Select a household to view
              daily usage.
            </div>
          ) : loading ? (
            <div className="usage-redesign-empty">
              Loading daily usage...
            </div>
          ) : sortedUsageRecords.length ===
            0 ? (
            <div className="usage-redesign-empty">
              <div className="usage-redesign-empty-icon">
                ⏱
              </div>

              <strong>
                No usage recorded yet
              </strong>

              <span>
                Record appliance usage to
                start building your
                household energy history.
              </span>
            </div>
          ) : (
            <div className="usage-redesign-list">
              {sortedUsageRecords.map(
                (record) => (
                  <article
                    key={
                      record.usageId
                    }
                    className="usage-redesign-item"
                  >
                    <div className="usage-redesign-item-top">
                      <div className="usage-redesign-item-icon">
                        ⏻
                      </div>

                      <div className="usage-redesign-item-title">
                        <span>
                          {
                            record.appliance
                              ?.room
                              ?.roomName ||
                            "Room"
                          }
                        </span>

                        <h3>
                          {record.appliance
                            ?.applianceName ||
                            "Appliance"}
                        </h3>

                        <p>
                          {formatDate(
                            record.usageDate
                          )}
                        </p>
                      </div>

                      <div className="usage-redesign-energy-badge">
                        <span>
                          Consumption
                        </span>

                        <strong>
                          {formatKwh(
                            record.estimatedConsumptionKwh
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="usage-redesign-item-values">
                      <div>
                        <span>
                          Hours used
                        </span>

                        <strong>
                          {
                            record.hoursUsed
                          }{" "}
                          hrs
                        </strong>
                      </div>

                      <div>
                        <span>
                          Room
                        </span>

                        <strong>
                          {record.appliance
                            ?.room
                            ?.roomName ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Usage ID
                        </span>

                        <strong>
                          #
                          {
                            record.usageId
                          }
                        </strong>
                      </div>
                    </div>

                    {record.usageNotes && (
                      <div className="usage-redesign-notes">
                        <span>
                          Notes
                        </span>

                        <p>
                          {
                            record.usageNotes
                          }
                        </p>
                      </div>
                    )}

                    <div className="usage-redesign-item-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            record
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="usage-redesign-delete"
                        onClick={() =>
                          handleDelete(
                            record.usageId
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