import {
  useEffect,
  useMemo,
  useState,
} from "react";

import adminTariffService from "../services/adminTariffService";

const EMPTY_TARIFF = {
  tariffName: "",
  effectiveFrom: "",
  effectiveTo: "",
  ratePerUnit: "",
  fixedCharge: "",
  status: "INACTIVE",
};

const EMPTY_RATE = {
  minUnits: "",
  maxUnits: "",
  ratePerUnit: "",
  fixedCharge: "",
  consumerGroup: "",
  blockOrder: "",
};

function money(value) {
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

function formatDate(value) {
  if (!value) {
    return "Open ended";
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

export default function AdminTariffs() {
  const [
    tariffs,
    setTariffs,
  ] = useState([]);

  const [
    rates,
    setRates,
  ] = useState([]);

  const [
    selectedTariffId,
    setSelectedTariffId,
  ] = useState("");

  const [
    tariffForm,
    setTariffForm,
  ] = useState(
    EMPTY_TARIFF
  );

  const [
    rateForm,
    setRateForm,
  ] = useState(
    EMPTY_RATE
  );

  const [
    editingTariffId,
    setEditingTariffId,
  ] = useState(null);

  const [
    editingRateId,
    setEditingRateId,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    savingTariff,
    setSavingTariff,
  ] = useState(false);

  const [
    savingRate,
    setSavingRate,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  useEffect(() => {
    loadTariffs();
  }, []);

  useEffect(() => {
    if (
      selectedTariffId
    ) {
      loadRates(
        selectedTariffId
      );
    } else {
      setRates([]);
    }
  }, [selectedTariffId]);

  async function loadTariffs() {
    try {
      setLoading(true);
      setError("");

      const data =
        await adminTariffService.listTariffs();

      const list =
        Array.isArray(data)
          ? data
          : [];

      setTariffs(list);

      if (
        list.length > 0 &&
        !selectedTariffId
      ) {
        setSelectedTariffId(
          String(
            list[0].tariffId
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to load tariffs:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load tariffs."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRates(
    tariffId
  ) {
    try {
      const data =
        await adminTariffService.listRatesByTariff(
          tariffId
        );

      setRates(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load tariff rates:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load tariff rates."
      );
    }
  }

  function handleTariffChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setTariffForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  function handleRateChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setRateForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  function validateTariff() {
    if (
      !tariffForm.tariffName.trim()
    ) {
      setError(
        "Tariff name is required."
      );

      return false;
    }

    if (
      !tariffForm.effectiveFrom
    ) {
      setError(
        "Effective from date is required."
      );

      return false;
    }

    if (
      tariffForm.effectiveTo &&
      tariffForm.effectiveTo <
        tariffForm.effectiveFrom
    ) {
      setError(
        "Effective to date cannot be before effective from date."
      );

      return false;
    }

    if (
      tariffForm.ratePerUnit ===
        "" ||
      Number(
        tariffForm.ratePerUnit
      ) < 0
    ) {
      setError(
        "Rate per unit cannot be negative."
      );

      return false;
    }

    if (
      tariffForm.fixedCharge ===
        "" ||
      Number(
        tariffForm.fixedCharge
      ) < 0
    ) {
      setError(
        "Fixed charge cannot be negative."
      );

      return false;
    }

    if (
      tariffForm.status ===
      "ACTIVE"
    ) {
      const anotherActive =
        tariffs.some(
          (tariff) =>
            tariff.status ===
              "ACTIVE" &&
            tariff.tariffId !==
              editingTariffId
        );

      if (anotherActive) {
        setError(
          "Another ACTIVE tariff already exists. Make it inactive before activating this tariff."
        );

        return false;
      }
    }

    return true;
  }

  async function saveTariff(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateTariff()) {
      return;
    }

    const payload = {
      tariffName:
        tariffForm.tariffName.trim(),

      effectiveFrom:
        tariffForm.effectiveFrom,

      effectiveTo:
        tariffForm.effectiveTo ||
        null,

      ratePerUnit:
        Number(
          tariffForm.ratePerUnit
        ),

      fixedCharge:
        Number(
          tariffForm.fixedCharge
        ),

      status:
        tariffForm.status,
    };

    try {
      setSavingTariff(true);

      if (
        editingTariffId
      ) {
        await adminTariffService.updateTariff(
          editingTariffId,
          payload
        );

        setSuccess(
          "Tariff updated successfully."
        );
      } else {
        await adminTariffService.createTariff(
          payload
        );

        setSuccess(
          "Tariff created successfully."
        );
      }

      cancelTariffEdit();

      await loadTariffs();
    } catch (err) {
      console.error(
        "Failed to save tariff:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to save tariff."
      );
    } finally {
      setSavingTariff(false);
    }
  }

  function editTariff(
    tariff
  ) {
    setEditingTariffId(
      tariff.tariffId
    );

    setTariffForm({
      tariffName:
        tariff.tariffName ||
        "",

      effectiveFrom:
        tariff.effectiveFrom ||
        "",

      effectiveTo:
        tariff.effectiveTo ||
        "",

      ratePerUnit:
        tariff.ratePerUnit !==
          null &&
        tariff.ratePerUnit !==
          undefined
          ? String(
              tariff.ratePerUnit
            )
          : "",

      fixedCharge:
        tariff.fixedCharge !==
          null &&
        tariff.fixedCharge !==
          undefined
          ? String(
              tariff.fixedCharge
            )
          : "",

      status:
        tariff.status ||
        "INACTIVE",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelTariffEdit() {
    setEditingTariffId(null);

    setTariffForm(
      EMPTY_TARIFF
    );
  }

  async function deleteTariff(
    tariff
  ) {
    const confirmed =
      window.confirm(
        `Delete tariff "${tariff.tariffName}"?\n\nDelete its tariff-rate blocks first if they are still linked.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await adminTariffService.deleteTariff(
        tariff.tariffId
      );

      if (
        String(
          selectedTariffId
        ) ===
        String(
          tariff.tariffId
        )
      ) {
        setSelectedTariffId("");
        setRates([]);
      }

      setSuccess(
        "Tariff deleted successfully."
      );

      await loadTariffs();
    } catch (err) {
      console.error(
        "Failed to delete tariff:",
        err
      );

      setError(
        "Unable to delete this tariff. It may still have tariff rates or prediction records linked to it."
      );
    }
  }

  function validateRate() {
    if (
      !selectedTariffId
    ) {
      setError(
        "Select a tariff first."
      );

      return false;
    }

    if (
      rateForm.minUnits ===
        "" ||
      Number(
        rateForm.minUnits
      ) < 0
    ) {
      setError(
        "Minimum units must be zero or greater."
      );

      return false;
    }

    if (
      rateForm.maxUnits !==
        "" &&
      Number(
        rateForm.maxUnits
      ) < 0
    ) {
      setError(
        "Maximum units cannot be negative."
      );

      return false;
    }

    if (
      rateForm.maxUnits !==
        "" &&
      Number(
        rateForm.maxUnits
      ) <
        Number(
          rateForm.minUnits
        )
    ) {
      setError(
        "Maximum units cannot be below minimum units."
      );

      return false;
    }

    if (
      rateForm.ratePerUnit ===
        "" ||
      Number(
        rateForm.ratePerUnit
      ) < 0
    ) {
      setError(
        "Rate per unit cannot be negative."
      );

      return false;
    }

    if (
      rateForm.fixedCharge ===
        "" ||
      Number(
        rateForm.fixedCharge
      ) < 0
    ) {
      setError(
        "Fixed charge cannot be negative."
      );

      return false;
    }

    if (
      !rateForm.consumerGroup.trim()
    ) {
      setError(
        "Consumer group is required."
      );

      return false;
    }

    if (
      rateForm.blockOrder ===
        "" ||
      Number(
        rateForm.blockOrder
      ) < 1
    ) {
      setError(
        "Block order must be at least 1."
      );

      return false;
    }

    return true;
  }

  async function saveRate(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateRate()) {
      return;
    }

    const payload = {
      tariff: {
        tariffId:
          Number(
            selectedTariffId
          ),
      },

      minUnits:
        Number(
          rateForm.minUnits
        ),

      maxUnits:
        rateForm.maxUnits ===
        ""
          ? null
          : Number(
              rateForm.maxUnits
            ),

      ratePerUnit:
        Number(
          rateForm.ratePerUnit
        ),

      fixedCharge:
        Number(
          rateForm.fixedCharge
        ),

      consumerGroup:
        rateForm.consumerGroup.trim(),

      blockOrder:
        Number(
          rateForm.blockOrder
        ),
    };

    try {
      setSavingRate(true);

      if (
        editingRateId
      ) {
        await adminTariffService.updateRate(
          editingRateId,
          payload
        );

        setSuccess(
          "Tariff rate updated successfully."
        );
      } else {
        await adminTariffService.createRate(
          payload
        );

        setSuccess(
          "Tariff rate created successfully."
        );
      }

      cancelRateEdit();

      await loadRates(
        selectedTariffId
      );
    } catch (err) {
      console.error(
        "Failed to save tariff rate:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to save tariff rate."
      );
    } finally {
      setSavingRate(false);
    }
  }

  function editRate(
    rate
  ) {
    setEditingRateId(
      rate.tariffRateId
    );

    setRateForm({
      minUnits:
        String(
          rate.minUnits
        ),

      maxUnits:
        rate.maxUnits ===
        null
          ? ""
          : String(
              rate.maxUnits
            ),

      ratePerUnit:
        String(
          rate.ratePerUnit
        ),

      fixedCharge:
        String(
          rate.fixedCharge
        ),

      consumerGroup:
        rate.consumerGroup ||
        "",

      blockOrder:
        String(
          rate.blockOrder
        ),
    });

    setError("");
    setSuccess("");
  }

  function cancelRateEdit() {
    setEditingRateId(null);

    setRateForm(
      EMPTY_RATE
    );
  }

  async function deleteRate(
    rate
  ) {
    const confirmed =
      window.confirm(
        `Delete tariff block ${rate.blockOrder}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await adminTariffService.deleteRate(
        rate.tariffRateId
      );

      setSuccess(
        "Tariff rate deleted successfully."
      );

      await loadRates(
        selectedTariffId
      );
    } catch (err) {
      console.error(
        "Failed to delete tariff rate:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to delete tariff rate."
      );
    }
  }

  const selectedTariff =
    useMemo(
      () =>
        tariffs.find(
          (tariff) =>
            String(
              tariff.tariffId
            ) ===
            String(
              selectedTariffId
            )
        ) || null,
      [
        tariffs,
        selectedTariffId,
      ]
    );

  const sortedRates =
    useMemo(
      () =>
        [...rates].sort(
          (a, b) =>
            Number(
              a.blockOrder
            ) -
            Number(
              b.blockOrder
            )
        ),
      [rates]
    );

  const activeTariff =
    useMemo(
      () =>
        tariffs.find(
          (tariff) =>
            tariff.status ===
            "ACTIVE"
        ) || null,
      [tariffs]
    );

  const activeCount =
    useMemo(
      () =>
        tariffs.filter(
          (tariff) =>
            tariff.status ===
            "ACTIVE"
        ).length,
      [tariffs]
    );

  const totalRateBlocks =
    rates.length;

  return (
    <div className="admin-tariffs-redesign">
      <section className="admin-tariffs-hero">
        <div className="admin-tariffs-orb admin-tariffs-orb-one" />
        <div className="admin-tariffs-orb admin-tariffs-orb-two" />

        <div className="admin-tariffs-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Administration
          </p>

          <h1>
            Control the electricity
            tariff structure.
          </h1>

          <p>
            Manage tariff periods,
            activation status and the
            consumption blocks used by
            the Sri Lankan residential
            electricity bill calculation
            workflow.
          </p>
        </div>

        <div className="admin-tariffs-hero-badge">
          <span>
            Rs
          </span>

          <div>
            <small>
              Billing configuration
            </small>

            <strong>
              Tariff management
            </strong>
          </div>
        </div>

        <div className="admin-tariffs-hero-strip">
          <div>
            <span>
              Tariffs
            </span>

            <strong>
              {tariffs.length}
            </strong>
          </div>

          <div>
            <span>
              Active tariffs
            </span>

            <strong>
              {activeCount}
            </strong>
          </div>

          <div>
            <span>
              Selected tariff
            </span>

            <strong>
              {selectedTariff
                ?.tariffName ||
                "None"}
            </strong>
          </div>
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

      <section className="admin-tariffs-summary">
        <article className="admin-tariffs-stat admin-tariffs-stat-feature">
          <div className="admin-tariffs-stat-icon">
            Rs
          </div>

          <span>
            Total tariffs
          </span>

          <strong>
            {tariffs.length}
          </strong>

          <p>
            Saved tariff configurations.
          </p>
        </article>

        <article className="admin-tariffs-stat">
          <div className="admin-tariffs-stat-icon admin-tariffs-stat-icon-green">
            ✓
          </div>

          <span>
            Active tariff
          </span>

          <strong className="admin-tariffs-stat-text">
            {activeTariff
              ?.tariffName ||
              "None"}
          </strong>

          <p>
            Tariff currently used by the
            system.
          </p>
        </article>

        <article className="admin-tariffs-stat">
          <div className="admin-tariffs-stat-icon">
            ▦
          </div>

          <span>
            Rate blocks
          </span>

          <strong>
            {
              totalRateBlocks
            }
          </strong>

          <p>
            Blocks in the selected
            tariff.
          </p>
        </article>

        <article className="admin-tariffs-stat">
          <div className="admin-tariffs-stat-icon">
            ◈
          </div>

          <span>
            Selected tariff
          </span>

          <strong className="admin-tariffs-stat-text">
            {selectedTariff
              ?.tariffName ||
              "None"}
          </strong>

          <p>
            Tariff currently being
            configured.
          </p>
        </article>
      </section>

      <section className="admin-tariffs-top-grid">
        <article className="admin-tariffs-form-card">
          <div className="admin-tariffs-card-head">
            <div>
              <p className="dashboard-kicker">
                Tariff setup
              </p>

              <h2>
                {editingTariffId
                  ? "Edit tariff"
                  : "Create tariff"}
              </h2>
            </div>

            <span className="admin-tariffs-card-icon">
              Rs
            </span>
          </div>

          <form
            className="admin-tariffs-form"
            onSubmit={
              saveTariff
            }
          >
            <label>
              <span>
                Tariff name
              </span>

              <input
                name="tariffName"
                value={
                  tariffForm.tariffName
                }
                onChange={
                  handleTariffChange
                }
                required
                placeholder="Example: Development Tariff"
              />
            </label>

            <div className="admin-tariffs-two-column">
              <label>
                <span>
                  Effective from
                </span>

                <input
                  type="date"
                  name="effectiveFrom"
                  value={
                    tariffForm.effectiveFrom
                  }
                  onChange={
                    handleTariffChange
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Effective to
                </span>

                <input
                  type="date"
                  name="effectiveTo"
                  value={
                    tariffForm.effectiveTo
                  }
                  onChange={
                    handleTariffChange
                  }
                />
              </label>
            </div>

            <div className="admin-tariffs-two-column">
              <label>
                <span>
                  Base rate per unit
                </span>

                <div className="admin-tariffs-unit-input">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="ratePerUnit"
                    value={
                      tariffForm.ratePerUnit
                    }
                    onChange={
                      handleTariffChange
                    }
                    required
                  />

                  <span>
                    LKR
                  </span>
                </div>
              </label>

              <label>
                <span>
                  Base fixed charge
                </span>

                <div className="admin-tariffs-unit-input">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="fixedCharge"
                    value={
                      tariffForm.fixedCharge
                    }
                    onChange={
                      handleTariffChange
                    }
                    required
                  />

                  <span>
                    LKR
                  </span>
                </div>
              </label>
            </div>

            <label>
              <span>
                Status
              </span>

              <select
                name="status"
                value={
                  tariffForm.status
                }
                onChange={
                  handleTariffChange
                }
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </label>

            <div className="admin-tariffs-info-box">
              <span>
                i
              </span>

              <div>
                <strong>
                  Only one active tariff
                </strong>

                <p>
                  The system prevents more
                  than one tariff from
                  being active at the same
                  time.
                </p>
              </div>
            </div>

            <div className="admin-tariffs-actions">
              <button
                type="submit"
                className="admin-tariffs-primary"
                disabled={
                  savingTariff
                }
              >
                {savingTariff
                  ? "Saving..."
                  : editingTariffId
                    ? "Update tariff"
                    : "Create tariff"}
              </button>

              {editingTariffId && (
                <button
                  type="button"
                  className="admin-tariffs-secondary"
                  onClick={
                    cancelTariffEdit
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="admin-tariffs-list-card">
          <div className="admin-tariffs-card-head">
            <div>
              <p className="dashboard-kicker">
                Tariff library
              </p>

              <h2>
                Existing tariffs
              </h2>
            </div>

            <span className="admin-tariffs-count">
              {
                tariffs.length
              }
            </span>
          </div>

          {loading ? (
            <div className="admin-tariffs-empty">
              Loading tariffs...
            </div>
          ) : tariffs.length ===
            0 ? (
            <div className="admin-tariffs-empty">
              <strong>
                No tariffs found
              </strong>

              <span>
                Create the first tariff
                configuration.
              </span>
            </div>
          ) : (
            <div className="admin-tariffs-list">
              {tariffs.map(
                (tariff) => {
                  const selected =
                    String(
                      selectedTariffId
                    ) ===
                    String(
                      tariff.tariffId
                    );

                  return (
                    <article
                      key={
                        tariff.tariffId
                      }
                      className={`admin-tariffs-item ${
                        selected
                          ? "admin-tariffs-item-selected"
                          : ""
                      }`}
                    >
                      <div className="admin-tariffs-item-top">
                        <div className="admin-tariffs-item-icon">
                          Rs
                        </div>

                        <div className="admin-tariffs-item-title">
                          <div className="admin-tariffs-item-badges">
                            <span
                              className={`admin-tariffs-status ${
                                tariff.status ===
                                "ACTIVE"
                                  ? "admin-tariffs-status-active"
                                  : "admin-tariffs-status-inactive"
                              }`}
                            >
                              {
                                tariff.status
                              }
                            </span>

                            {selected && (
                              <span className="admin-tariffs-selected-badge">
                                SELECTED
                              </span>
                            )}
                          </div>

                          <h3>
                            {
                              tariff.tariffName
                            }
                          </h3>

                          <p>
                            {formatDate(
                              tariff.effectiveFrom
                            )}
                            {" → "}
                            {formatDate(
                              tariff.effectiveTo
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="admin-tariffs-item-values">
                        <div>
                          <span>
                            Base rate
                          </span>

                          <strong>
                            {money(
                              tariff.ratePerUnit
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Fixed charge
                          </span>

                          <strong>
                            {money(
                              tariff.fixedCharge
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Tariff ID
                          </span>

                          <strong>
                            #
                            {
                              tariff.tariffId
                            }
                          </strong>
                        </div>
                      </div>

                      <div className="admin-tariffs-item-actions">
                        <button
                          type="button"
                          className="admin-tariffs-select"
                          onClick={() =>
                            setSelectedTariffId(
                              String(
                                tariff.tariffId
                              )
                            )
                          }
                        >
                          {selected
                            ? "Selected"
                            : "Manage blocks"}
                        </button>

                        <button
                          type="button"
                          className="admin-tariffs-secondary"
                          onClick={() =>
                            editTariff(
                              tariff
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-tariffs-delete"
                          onClick={() =>
                            deleteTariff(
                              tariff
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </article>
      </section>

      <section className="admin-tariffs-block-section">
        <div className="admin-tariffs-block-header">
          <div>
            <p className="dashboard-kicker dashboard-kicker-light">
              Consumption blocks
            </p>

            <h2>
              Configure tariff rate
              blocks.
            </h2>

            <p>
              {selectedTariff
                ? `Currently managing ${selectedTariff.tariffName}.`
                : "Select a tariff before managing its consumption blocks."}
            </p>
          </div>

          <div className="admin-tariffs-block-summary">
            <span>
              Selected
            </span>

            <strong>
              {selectedTariff
                ?.tariffName ||
                "None"}
            </strong>

            <small>
              {
                sortedRates.length
              }{" "}
              rate blocks
            </small>
          </div>
        </div>

        {!selectedTariff ? (
          <div className="admin-tariffs-block-empty">
            Select a tariff above to
            manage its rate blocks.
          </div>
        ) : (
          <div className="admin-tariffs-block-grid">
            <article className="admin-tariffs-rate-form">
              <div className="admin-tariffs-inner-head">
                <div>
                  <span>
                    Block editor
                  </span>

                  <h3>
                    {editingRateId
                      ? "Edit rate block"
                      : "Add rate block"}
                  </h3>
                </div>

                <span className="admin-tariffs-block-icon">
                  ▦
                </span>
              </div>

              <form
                className="admin-tariffs-form"
                onSubmit={
                  saveRate
                }
              >
                <label>
                  <span>
                    Consumer group
                  </span>

                  <input
                    name="consumerGroup"
                    value={
                      rateForm.consumerGroup
                    }
                    onChange={
                      handleRateChange
                    }
                    placeholder="Example: LOW_USAGE"
                    required
                  />
                </label>

                <div className="admin-tariffs-two-column">
                  <label>
                    <span>
                      Minimum units
                    </span>

                    <input
                      type="number"
                      min="0"
                      name="minUnits"
                      value={
                        rateForm.minUnits
                      }
                      onChange={
                        handleRateChange
                      }
                      required
                    />
                  </label>

                  <label>
                    <span>
                      Maximum units
                    </span>

                    <input
                      type="number"
                      min="0"
                      name="maxUnits"
                      value={
                        rateForm.maxUnits
                      }
                      onChange={
                        handleRateChange
                      }
                      placeholder="Blank = open ended"
                    />
                  </label>
                </div>

                <div className="admin-tariffs-two-column">
                  <label>
                    <span>
                      Rate per unit
                    </span>

                    <div className="admin-tariffs-unit-input">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="ratePerUnit"
                        value={
                          rateForm.ratePerUnit
                        }
                        onChange={
                          handleRateChange
                        }
                        required
                      />

                      <span>
                        LKR
                      </span>
                    </div>
                  </label>

                  <label>
                    <span>
                      Fixed charge
                    </span>

                    <div className="admin-tariffs-unit-input">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="fixedCharge"
                        value={
                          rateForm.fixedCharge
                        }
                        onChange={
                          handleRateChange
                        }
                        required
                      />

                      <span>
                        LKR
                      </span>
                    </div>
                  </label>
                </div>

                <label>
                  <span>
                    Block order
                  </span>

                  <input
                    type="number"
                    min="1"
                    name="blockOrder"
                    value={
                      rateForm.blockOrder
                    }
                    onChange={
                      handleRateChange
                    }
                    required
                  />
                </label>

                <div className="admin-tariffs-actions">
                  <button
                    type="submit"
                    className="admin-tariffs-primary"
                    disabled={
                      savingRate
                    }
                  >
                    {savingRate
                      ? "Saving..."
                      : editingRateId
                        ? "Update block"
                        : "Add block"}
                  </button>

                  {editingRateId && (
                    <button
                      type="button"
                      className="admin-tariffs-secondary"
                      onClick={
                        cancelRateEdit
                      }
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </article>

            <article className="admin-tariffs-rate-list">
              <div className="admin-tariffs-inner-head">
                <div>
                  <span>
                    Block structure
                  </span>

                  <h3>
                    Existing blocks
                  </h3>
                </div>

                <span className="admin-tariffs-count">
                  {
                    sortedRates.length
                  }
                </span>
              </div>

              {sortedRates.length ===
              0 ? (
                <div className="admin-tariffs-empty">
                  <strong>
                    No rate blocks
                  </strong>

                  <span>
                    Add the first block
                    for this tariff.
                  </span>
                </div>
              ) : (
                <div className="admin-tariffs-rate-items">
                  {sortedRates.map(
                    (rate) => (
                      <article
                        key={
                          rate.tariffRateId
                        }
                        className="admin-tariffs-rate-item"
                      >
                        <div className="admin-tariffs-rate-order">
                          {
                            rate.blockOrder
                          }
                        </div>

                        <div className="admin-tariffs-rate-main">
                          <div className="admin-tariffs-rate-top">
                            <div>
                              <span>
                                Consumer group
                              </span>

                              <h4>
                                {
                                  rate.consumerGroup
                                }
                              </h4>
                            </div>

                            <span className="admin-tariffs-group-badge">
                              {rate.minUnits}
                              {"–"}
                              {rate.maxUnits ===
                              null
                                ? "∞"
                                : rate.maxUnits}{" "}
                              kWh
                            </span>
                          </div>

                          <div className="admin-tariffs-rate-values">
                            <div>
                              <span>
                                Unit rate
                              </span>

                              <strong>
                                {money(
                                  rate.ratePerUnit
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Fixed charge
                              </span>

                              <strong>
                                {money(
                                  rate.fixedCharge
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Rate ID
                              </span>

                              <strong>
                                #
                                {
                                  rate.tariffRateId
                                }
                              </strong>
                            </div>
                          </div>

                          <div className="admin-tariffs-rate-actions">
                            <button
                              type="button"
                              className="admin-tariffs-secondary"
                              onClick={() =>
                                editRate(
                                  rate
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-tariffs-delete"
                              onClick={() =>
                                deleteRate(
                                  rate
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </article>
          </div>
        )}
      </section>
    </div>
  );
}