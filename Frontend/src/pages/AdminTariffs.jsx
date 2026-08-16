import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";

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
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function statusStyle(status) {
  if (status === "ACTIVE") {
    return {
      background: "#e9f7e9",
      color: "#286428",
    };
  }

  return {
    background: "#eeeeee",
    color: "#665555",
  };
}

export default function AdminTariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [rates, setRates] = useState([]);

  const [
    selectedTariffId,
    setSelectedTariffId,
  ] = useState("");

  const [
    tariffForm,
    setTariffForm,
  ] = useState(EMPTY_TARIFF);

  const [
    rateForm,
    setRateForm,
  ] = useState(EMPTY_RATE);

  const [
    editingTariffId,
    setEditingTariffId,
  ] = useState(null);

  const [
    editingRateId,
    setEditingRateId,
  ] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingTariff, setSavingTariff] = useState(false);
  const [savingRate, setSavingRate] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadTariffs();
  }, []);

  useEffect(() => {
    if (selectedTariffId) {
      loadRates(selectedTariffId);
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

      const list = Array.isArray(data) ? data : [];

      setTariffs(list);

      if (list.length > 0 && !selectedTariffId) {
        setSelectedTariffId(
          String(list[0].tariffId)
        );
      }
    } catch (err) {
      console.error("Failed to load tariffs:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load tariffs."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRates(tariffId) {
    try {
      const data =
        await adminTariffService.listRatesByTariff(
          tariffId
        );

      setRates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load tariff rates:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load tariff rates."
      );
    }
  }

  function handleTariffChange(event) {
    const { name, value } = event.target;

    setTariffForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleRateChange(event) {
    const { name, value } = event.target;

    setRateForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateTariff() {
    if (!tariffForm.tariffName.trim()) {
      setError("Tariff name is required.");
      return false;
    }

    if (!tariffForm.effectiveFrom) {
      setError("Effective from date is required.");
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
      tariffForm.ratePerUnit === "" ||
      Number(tariffForm.ratePerUnit) < 0
    ) {
      setError("Rate per unit cannot be negative.");
      return false;
    }

    if (
      tariffForm.fixedCharge === "" ||
      Number(tariffForm.fixedCharge) < 0
    ) {
      setError("Fixed charge cannot be negative.");
      return false;
    }

    if (tariffForm.status === "ACTIVE") {
      const anotherActive = tariffs.some(
        (tariff) =>
          tariff.status === "ACTIVE" &&
          tariff.tariffId !== editingTariffId
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

  async function saveTariff(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateTariff()) {
      return;
    }

    const payload = {
      tariffName: tariffForm.tariffName.trim(),

      effectiveFrom:
        tariffForm.effectiveFrom,

      effectiveTo:
        tariffForm.effectiveTo || null,

      ratePerUnit:
        Number(tariffForm.ratePerUnit),

      fixedCharge:
        Number(tariffForm.fixedCharge),

      status:
        tariffForm.status,
    };

    try {
      setSavingTariff(true);

      if (editingTariffId) {
        await adminTariffService.updateTariff(
          editingTariffId,
          payload
        );

        setSuccess("Tariff updated successfully.");
      } else {
        await adminTariffService.createTariff(
          payload
        );

        setSuccess("Tariff created successfully.");
      }

      cancelTariffEdit();
      await loadTariffs();
    } catch (err) {
      console.error("Failed to save tariff:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save tariff."
      );
    } finally {
      setSavingTariff(false);
    }
  }

  function editTariff(tariff) {
    setEditingTariffId(tariff.tariffId);

    setTariffForm({
      tariffName:
        tariff.tariffName || "",

      effectiveFrom:
        tariff.effectiveFrom || "",

      effectiveTo:
        tariff.effectiveTo || "",

      ratePerUnit:
        tariff.ratePerUnit != null
          ? String(tariff.ratePerUnit)
          : "",

      fixedCharge:
        tariff.fixedCharge != null
          ? String(tariff.fixedCharge)
          : "",

      status:
        tariff.status || "INACTIVE",
    });

    setError("");
    setSuccess("");
  }

  function cancelTariffEdit() {
    setEditingTariffId(null);
    setTariffForm(EMPTY_TARIFF);
  }

  async function deleteTariff(tariff) {
    const confirmed = window.confirm(
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
        String(selectedTariffId) ===
        String(tariff.tariffId)
      ) {
        setSelectedTariffId("");
        setRates([]);
      }

      setSuccess("Tariff deleted successfully.");

      await loadTariffs();
    } catch (err) {
      console.error("Failed to delete tariff:", err);

      setError(
        "Unable to delete this tariff. It may still have tariff rates or prediction records linked to it."
      );
    }
  }

  function validateRate() {
    if (!selectedTariffId) {
      setError("Select a tariff first.");
      return false;
    }

    if (
      rateForm.minUnits === "" ||
      Number(rateForm.minUnits) < 0
    ) {
      setError(
        "Minimum units must be zero or greater."
      );
      return false;
    }

    if (
      rateForm.maxUnits !== "" &&
      Number(rateForm.maxUnits) < 0
    ) {
      setError(
        "Maximum units cannot be negative."
      );
      return false;
    }

    if (
      rateForm.maxUnits !== "" &&
      Number(rateForm.maxUnits) <
        Number(rateForm.minUnits)
    ) {
      setError(
        "Maximum units cannot be below minimum units."
      );
      return false;
    }

    if (
      rateForm.ratePerUnit === "" ||
      Number(rateForm.ratePerUnit) < 0
    ) {
      setError(
        "Rate per unit cannot be negative."
      );
      return false;
    }

    if (
      rateForm.fixedCharge === "" ||
      Number(rateForm.fixedCharge) < 0
    ) {
      setError(
        "Fixed charge cannot be negative."
      );
      return false;
    }

    if (!rateForm.consumerGroup.trim()) {
      setError("Consumer group is required.");
      return false;
    }

    if (
      rateForm.blockOrder === "" ||
      Number(rateForm.blockOrder) < 1
    ) {
      setError(
        "Block order must be at least 1."
      );
      return false;
    }

    return true;
  }

  async function saveRate(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateRate()) {
      return;
    }

    const payload = {
      tariff: {
        tariffId:
          Number(selectedTariffId),
      },

      minUnits:
        Number(rateForm.minUnits),

      maxUnits:
        rateForm.maxUnits === ""
          ? null
          : Number(rateForm.maxUnits),

      ratePerUnit:
        Number(rateForm.ratePerUnit),

      fixedCharge:
        Number(rateForm.fixedCharge),

      consumerGroup:
        rateForm.consumerGroup.trim(),

      blockOrder:
        Number(rateForm.blockOrder),
    };

    try {
      setSavingRate(true);

      if (editingRateId) {
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
      console.error("Failed to save tariff rate:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save tariff rate."
      );
    } finally {
      setSavingRate(false);
    }
  }

  function editRate(rate) {
    setEditingRateId(
      rate.tariffRateId
    );

    setRateForm({
      minUnits:
        String(rate.minUnits),

      maxUnits:
        rate.maxUnits == null
          ? ""
          : String(rate.maxUnits),

      ratePerUnit:
        String(rate.ratePerUnit),

      fixedCharge:
        String(rate.fixedCharge),

      consumerGroup:
        rate.consumerGroup || "",

      blockOrder:
        String(rate.blockOrder),
    });

    setError("");
    setSuccess("");
  }

  function cancelRateEdit() {
    setEditingRateId(null);
    setRateForm(EMPTY_RATE);
  }

  async function deleteRate(rate) {
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
      console.error("Failed to delete tariff rate:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to delete tariff rate."
      );
    }
  }

  const selectedTariff =
    useMemo(
      () =>
        tariffs.find(
          (tariff) =>
            String(tariff.tariffId) ===
            String(selectedTariffId)
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
            Number(a.blockOrder) -
            Number(b.blockOrder)
        ),
      [rates]
    );

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Tariff management"
        lead="Manage electricity tariffs and the consumption blocks used by the Sri Lankan residential bill calculation workflow."
      />

      <div className="stack">
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

        <div className="grid grid-2">
          <Card
            title={
              editingTariffId
                ? "Edit tariff"
                : "Create tariff"
            }
          >
            <form onSubmit={saveTariff}>
              <Field label="Tariff name">
                <input
                  name="tariffName"
                  value={tariffForm.tariffName}
                  onChange={handleTariffChange}
                  style={styles.input}
                  required
                />
              </Field>

              <div className="grid grid-2">
                <Field label="Effective from">
                  <input
                    type="date"
                    name="effectiveFrom"
                    value={
                      tariffForm.effectiveFrom
                    }
                    onChange={
                      handleTariffChange
                    }
                    style={styles.input}
                    required
                  />
                </Field>

                <Field label="Effective to">
                  <input
                    type="date"
                    name="effectiveTo"
                    value={
                      tariffForm.effectiveTo
                    }
                    onChange={
                      handleTariffChange
                    }
                    style={styles.input}
                  />
                </Field>
              </div>

              <div className="grid grid-2">
                <Field label="Rate per unit">
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
                    style={styles.input}
                    required
                  />
                </Field>

                <Field label="Fixed charge">
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
                    style={styles.input}
                    required
                  />
                </Field>
              </div>

              <Field label="Status">
                <select
                  name="status"
                  value={tariffForm.status}
                  onChange={
                    handleTariffChange
                  }
                  style={styles.input}
                >
                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </Field>

              <div style={styles.actions}>
                <button
                  type="submit"
                  disabled={savingTariff}
                  style={styles.primaryButton}
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
                    onClick={
                      cancelTariffEdit
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
          </Card>

          <Card title="Existing tariffs">
            {loading ? (
              <p className="muted">
                Loading tariffs...
              </p>
            ) : tariffs.length === 0 ? (
              <p className="muted">
                No tariffs found.
              </p>
            ) : (
              <div style={styles.list}>
                {tariffs.map(
                  (tariff) => (
                    <div
                      key={tariff.tariffId}
                      style={{
                        ...styles.tariffItem,

                        ...(String(
                          selectedTariffId
                        ) ===
                        String(
                          tariff.tariffId
                        )
                          ? styles.selectedItem
                          : {}),
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={
                            styles.headingRow
                          }
                        >
                          <strong>
                            {
                              tariff.tariffName
                            }
                          </strong>

                          <span
                            style={{
                              ...styles.badge,
                              ...statusStyle(
                                tariff.status
                              ),
                            }}
                          >
                            {tariff.status}
                          </span>
                        </div>

                        <p
                          className="text-sm muted"
                          style={{
                            margin:
                              "7px 0",
                          }}
                        >
                          {tariff.effectiveFrom}
                          {" → "}
                          {tariff.effectiveTo ||
                            "Open ended"}
                        </p>

                        <p
                          className="text-sm muted"
                          style={{
                            margin: 0,
                          }}
                        >
                          Rate:{" "}
                          {money(
                            tariff.ratePerUnit
                          )}
                          {" · "}
                          Fixed:{" "}
                          {money(
                            tariff.fixedCharge
                          )}
                        </p>
                      </div>

                      <div
                        style={
                          styles.itemActions
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTariffId(
                              String(
                                tariff.tariffId
                              )
                            )
                          }
                          style={
                            styles.secondaryButton
                          }
                        >
                          Rates
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            editTariff(
                              tariff
                            )
                          }
                          style={
                            styles.secondaryButton
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteTariff(
                              tariff
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
          </Card>
        </div>

        <Card
          title="Tariff rate blocks"
          subtitle={
            selectedTariff
              ? `Editing blocks for ${selectedTariff.tariffName}`
              : "Select a tariff first"
          }
        >
          {!selectedTariff ? (
            <p className="muted">
              Select a tariff to manage its rate blocks.
            </p>
          ) : (
            <div className="grid grid-2">
              <div>
                <h3>
                  {editingRateId
                    ? "Edit rate block"
                    : "Add rate block"}
                </h3>

                <form onSubmit={saveRate}>
                  <Field label="Consumer group">
                    <input
                      name="consumerGroup"
                      value={
                        rateForm.consumerGroup
                      }
                      onChange={
                        handleRateChange
                      }
                      style={styles.input}
                      placeholder="Example: LOW_USAGE"
                      required
                    />
                  </Field>

                  <div className="grid grid-2">
                    <Field label="Minimum units">
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
                        style={styles.input}
                        required
                      />
                    </Field>

                    <Field label="Maximum units">
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
                        style={styles.input}
                        placeholder="Leave blank if open-ended"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-2">
                    <Field label="Rate per unit">
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
                        style={styles.input}
                        required
                      />
                    </Field>

                    <Field label="Fixed charge">
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
                        style={styles.input}
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Block order">
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
                      style={styles.input}
                      required
                    />
                  </Field>

                  <div style={styles.actions}>
                    <button
                      type="submit"
                      disabled={savingRate}
                      style={
                        styles.primaryButton
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
                        onClick={
                          cancelRateEdit
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
              </div>

              <div>
                <h3>
                  Existing blocks
                </h3>

                {sortedRates.length ===
                0 ? (
                  <p className="muted">
                    No rate blocks for this tariff.
                  </p>
                ) : (
                  <div style={styles.list}>
                    {sortedRates.map(
                      (rate) => (
                        <div
                          key={
                            rate.tariffRateId
                          }
                          style={
                            styles.rateItem
                          }
                        >
                          <div>
                            <div
                              style={
                                styles.headingRow
                              }
                            >
                              <strong>
                                Block{" "}
                                {
                                  rate.blockOrder
                                }
                              </strong>

                              <span
                                style={
                                  styles.groupBadge
                                }
                              >
                                {
                                  rate.consumerGroup
                                }
                              </span>
                            </div>

                            <p
                              className="text-sm muted"
                              style={{
                                margin:
                                  "7px 0",
                              }}
                            >
                              Units:{" "}
                              {
                                rate.minUnits
                              }
                              {" – "}
                              {rate.maxUnits ==
                              null
                                ? "∞"
                                : rate.maxUnits}
                            </p>

                            <p
                              className="text-sm muted"
                              style={{
                                margin: 0,
                              }}
                            >
                              {money(
                                rate.ratePerUnit
                              )}
                              /unit
                              {" · "}
                              Fixed{" "}
                              {money(
                                rate.fixedCharge
                              )}
                            </p>
                          </div>

                          <div
                            style={
                              styles.itemActions
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                editRate(
                                  rate
                                )
                              }
                              style={
                                styles.secondaryButton
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteRate(
                                  rate
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
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
      </label>

      {children}
    </div>
  );
}

const styles = {
  error: {
    padding: "14px 16px",
    border: "1px solid #e5b4b4",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#9a1f1f",
  },

  success: {
    padding: "14px 16px",
    border: "1px solid #b9d8b9",
    borderRadius: "10px",
    background: "#effbef",
    color: "#286428",
  },

  field: {
    marginBottom: "15px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
  },

  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "10px 11px",
    border: "1px solid #d8caca",
    borderRadius: "8px",
    background: "#fff",
  },

  actions: {
    display: "flex",
    gap: "9px",
    marginTop: "16px",
  },

  primaryButton: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "8px",
    background: "#7f0000",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "8px 11px",
    border: "1px solid #cbbbbb",
    borderRadius: "7px",
    background: "#fff",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "8px 11px",
    border: "none",
    borderRadius: "7px",
    background: "#a22323",
    color: "#fff",
    cursor: "pointer",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  tariffItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    border: "1px solid #eadede",
    borderRadius: "10px",
    background: "#fffafa",
  },

  selectedItem: {
    borderLeft: "4px solid #7f0000",
  },

  rateItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "14px",
    border: "1px solid #eadede",
    borderRadius: "10px",
  },

  headingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  badge: {
    padding: "5px 8px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
  },

  groupBadge: {
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#f5e8e8",
    color: "#7f0000",
    fontSize: "10px",
    fontWeight: 700,
  },

  itemActions: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  },
};