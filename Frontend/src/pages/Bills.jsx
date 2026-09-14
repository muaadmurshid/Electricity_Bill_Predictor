import {
  useEffect,
  useMemo,
  useState,
} from "react";

import householdService from "../services/householdService";
import billService from "../services/billService";

function formatCurrency(value) {
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

function formatStatus(value) {
  switch (value) {
    case "PAID":
      return "Paid";

    case "UNPAID":
      return "Unpaid";

    case "PARTIALLY_PAID":
      return "Partially paid";

    case "OVERDUE":
      return "Overdue";

    default:
      return value || "—";
  }
}

function statusClass(value) {
  switch (value) {
    case "PAID":
      return "bill-status-paid";

    case "OVERDUE":
      return "bill-status-overdue";

    case "PARTIALLY_PAID":
      return "bill-status-partial";

    default:
      return "bill-status-unpaid";
  }
}

export default function Bills() {
  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    bills,
    setBills,
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
    billingPeriod: "",
    unitsConsumedKwh: "",
    billAmount: "",
    billDate: "",
    paymentStatus: "UNPAID",
  });

  useEffect(() => {
    loadHouseholds();
  }, []);

  useEffect(() => {
    if (
      selectedHouseholdId
    ) {
      loadBills(
        selectedHouseholdId
      );
    } else {
      setBills([]);
    }
  }, [selectedHouseholdId]);

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

  async function loadBills(
    householdId
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await billService.listByHousehold(
          householdId
        );

      setBills(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load electricity bills:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load electricity bills."
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
      !formData.billingPeriod.trim()
    ) {
      setError(
        "Please enter the billing period."
      );

      return false;
    }

    if (
      formData.unitsConsumedKwh ===
        "" ||
      Number(
        formData.unitsConsumedKwh
      ) < 0
    ) {
      setError(
        "Units consumed cannot be negative."
      );

      return false;
    }

    if (
      formData.billAmount ===
        "" ||
      Number(
        formData.billAmount
      ) < 0
    ) {
      setError(
        "Bill amount cannot be negative."
      );

      return false;
    }

    if (!formData.billDate) {
      setError(
        "Please select the bill date."
      );

      return false;
    }

    if (
      !formData.paymentStatus.trim()
    ) {
      setError(
        "Please select a payment status."
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

      billingPeriod:
        formData.billingPeriod.trim(),

      unitsConsumedKwh:
        Number(
          formData.unitsConsumedKwh
        ),

      billAmount:
        Number(
          formData.billAmount
        ),

      billDate:
        formData.billDate,

      paymentStatus:
        formData.paymentStatus,
    };

    try {
      setSaving(true);

      if (editingId) {
        await billService.update(
          editingId,
          payload
        );

        setSuccess(
          "Electricity bill updated successfully."
        );
      } else {
        await billService.create(
          payload
        );

        setSuccess(
          "Electricity bill added successfully."
        );
      }

      resetForm();

      await loadBills(
        selectedHouseholdId
      );
    } catch (err) {
      console.error(
        "Failed to save electricity bill:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to save electricity bill."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(bill) {
    setEditingId(
      bill.billId
    );

    if (
      bill.household
        ?.householdId
    ) {
      setSelectedHouseholdId(
        String(
          bill.household
            .householdId
        )
      );
    }

    setFormData({
      billingPeriod:
        bill.billingPeriod ||
        "",

      unitsConsumedKwh:
        bill.unitsConsumedKwh !==
          null &&
        bill.unitsConsumedKwh !==
          undefined
          ? String(
              bill.unitsConsumedKwh
            )
          : "",

      billAmount:
        bill.billAmount !==
          null &&
        bill.billAmount !==
          undefined
          ? String(
              bill.billAmount
            )
          : "",

      billDate:
        bill.billDate ||
        "",

      paymentStatus:
        bill.paymentStatus ||
        "UNPAID",
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
      billingPeriod: "",
      unitsConsumedKwh: "",
      billAmount: "",
      billDate: "",
      paymentStatus: "UNPAID",
    });
  }

  async function handleDelete(
    billId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this electricity bill?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await billService.remove(
        billId
      );

      if (
        editingId === billId
      ) {
        resetForm();
      }

      setSuccess(
        "Electricity bill deleted successfully."
      );

      await loadBills(
        selectedHouseholdId
      );
    } catch (err) {
      console.error(
        "Failed to delete electricity bill:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to delete electricity bill."
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

  const sortedBills =
    useMemo(() => {
      return [...bills].sort(
        (a, b) =>
          new Date(
            b.billDate || 0
          ) -
          new Date(
            a.billDate || 0
          )
      );
    }, [bills]);

  const totalUnits =
    useMemo(
      () =>
        bills.reduce(
          (
            total,
            bill
          ) =>
            total +
            Number(
              bill.unitsConsumedKwh ||
                0
            ),
          0
        ),
      [bills]
    );

  const totalAmount =
    useMemo(
      () =>
        bills.reduce(
          (
            total,
            bill
          ) =>
            total +
            Number(
              bill.billAmount ||
                0
            ),
          0
        ),
      [bills]
    );

  const unpaidCount =
    useMemo(
      () =>
        bills.filter(
          (bill) =>
            bill.paymentStatus !==
            "PAID"
        ).length,
      [bills]
    );

  const latestBill =
    sortedBills[0] || null;

  return (
    <div className="bills-redesign">
      <section className="bills-redesign-hero">
        <div className="bills-redesign-orb bills-redesign-orb-one" />
        <div className="bills-redesign-orb bills-redesign-orb-two" />

        <div className="bills-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Electricity records
          </p>

          <h1>
            Build a reliable history of
            your electricity bills.
          </h1>

          <p>
            Store monthly electricity
            bills and consumption so
            your household develops a
            stronger historical record
            for analysis and prediction.
          </p>
        </div>

        <div className="bills-redesign-hero-badge">
          <span>
            Rs
          </span>

          <div>
            <small>
              Billing history
            </small>

            <strong>
              Electricity bills
            </strong>
          </div>
        </div>

        <div className="bills-redesign-household">
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

      <section className="bills-redesign-summary">
        <article className="bills-redesign-stat bills-redesign-stat-feature">
          <div className="bills-redesign-stat-icon">
            Rs
          </div>

          <span>
            Total billed
          </span>

          <strong>
            {formatCurrency(
              totalAmount
            )}
          </strong>

          <p>
            Combined recorded bill
            amount.
          </p>
        </article>

        <article className="bills-redesign-stat">
          <div className="bills-redesign-stat-icon bills-redesign-stat-icon-green">
            ⚡
          </div>

          <span>
            Consumption
          </span>

          <strong>
            {totalUnits.toFixed(
              3
            )}
            <small>
              kWh
            </small>
          </strong>

          <p>
            Total historical electricity
            consumption.
          </p>
        </article>

        <article className="bills-redesign-stat">
          <div className="bills-redesign-stat-icon">
            ▦
          </div>

          <span>
            Bills recorded
          </span>

          <strong>
            {
              bills.length
            }
          </strong>

          <p>
            Saved electricity bill
            records.
          </p>
        </article>

        <article className="bills-redesign-stat">
          <div className="bills-redesign-stat-icon">
            !
          </div>

          <span>
            Outstanding
          </span>

          <strong>
            {
              unpaidCount
            }
          </strong>

          <p>
            Bills not currently marked
            as paid.
          </p>
        </article>
      </section>

      {latestBill && (
        <section className="bills-redesign-latest">
          <div>
            <p className="dashboard-kicker dashboard-kicker-light">
              Latest bill
            </p>

            <h2>
              {
                latestBill.billingPeriod
              }
            </h2>

            <p>
              {formatDate(
                latestBill.billDate
              )}
            </p>
          </div>

          <div className="bills-redesign-latest-values">
            <div>
              <span>
                Amount
              </span>

              <strong>
                {formatCurrency(
                  latestBill.billAmount
                )}
              </strong>
            </div>

            <div>
              <span>
                Consumption
              </span>

              <strong>
                {
                  latestBill.unitsConsumedKwh
                }{" "}
                kWh
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong>
                {formatStatus(
                  latestBill.paymentStatus
                )}
              </strong>
            </div>
          </div>
        </section>
      )}

      <section className="bills-redesign-grid">
        <article className="bills-redesign-form-card">
          <div className="bills-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Bill entry
              </p>

              <h2>
                {editingId
                  ? "Edit electricity bill"
                  : "Add electricity bill"}
              </h2>
            </div>

            <span className="bills-redesign-form-icon">
              Rs
            </span>
          </div>

          <form
            className="bills-redesign-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              <span>
                Billing period
              </span>

              <input
                type="text"
                name="billingPeriod"
                value={
                  formData.billingPeriod
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Example: August 2026"
              />

              <small>
                Enter the period as shown
                on your electricity bill.
              </small>
            </label>

            <div className="bills-redesign-two-column">
              <label>
                <span>
                  Units consumed
                </span>

                <div className="bills-redesign-unit-input">
                  <input
                    type="number"
                    name="unitsConsumedKwh"
                    value={
                      formData.unitsConsumedKwh
                    }
                    onChange={
                      handleChange
                    }
                    required
                    min="0"
                    step="0.001"
                    placeholder="145.6"
                  />

                  <span>
                    kWh
                  </span>
                </div>
              </label>

              <label>
                <span>
                  Bill amount
                </span>

                <div className="bills-redesign-unit-input">
                  <input
                    type="number"
                    name="billAmount"
                    value={
                      formData.billAmount
                    }
                    onChange={
                      handleChange
                    }
                    required
                    min="0"
                    step="0.01"
                    placeholder="6250.00"
                  />

                  <span>
                    LKR
                  </span>
                </div>
              </label>
            </div>

            <div className="bills-redesign-two-column">
              <label>
                <span>
                  Bill date
                </span>

                <input
                  type="date"
                  name="billDate"
                  value={
                    formData.billDate
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Payment status
                </span>

                <select
                  name="paymentStatus"
                  value={
                    formData.paymentStatus
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="UNPAID">
                    Unpaid
                  </option>

                  <option value="PAID">
                    Paid
                  </option>

                  <option value="PARTIALLY_PAID">
                    Partially paid
                  </option>

                  <option value="OVERDUE">
                    Overdue
                  </option>
                </select>
              </label>
            </div>

            <div className="bills-redesign-history-note">
              <span>
                ◈
              </span>

              <div>
                <strong>
                  Historical bills matter
                </strong>

                <p>
                  Consistent electricity
                  bill records provide
                  useful household history
                  for analysis and future
                  predictions.
                </p>
              </div>
            </div>

            <div className="bills-redesign-actions">
              <button
                type="submit"
                className="bills-redesign-primary"
                disabled={
                  saving ||
                  !selectedHouseholdId
                }
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update bill"
                    : "Add bill"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="bills-redesign-secondary"
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

        <article className="bills-redesign-history-card">
          <div className="bills-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Billing history
              </p>

              <h2>
                Your electricity bills
              </h2>
            </div>

            <span className="bills-redesign-count">
              {
                sortedBills.length
              }
            </span>
          </div>

          {!selectedHouseholdId ? (
            <div className="bills-redesign-empty">
              Select a household to view
              electricity bills.
            </div>
          ) : loading ? (
            <div className="bills-redesign-empty">
              Loading electricity bills...
            </div>
          ) : sortedBills.length ===
            0 ? (
            <div className="bills-redesign-empty">
              <div className="bills-redesign-empty-icon">
                Rs
              </div>

              <strong>
                No electricity bills yet
              </strong>

              <span>
                Add your first bill to
                start building a reliable
                household billing
                history.
              </span>
            </div>
          ) : (
            <div className="bills-redesign-list">
              {sortedBills.map(
                (bill) => (
                  <article
                    key={
                      bill.billId
                    }
                    className="bills-redesign-item"
                  >
                    <div className="bills-redesign-item-top">
                      <div className="bills-redesign-item-icon">
                        Rs
                      </div>

                      <div className="bills-redesign-item-title">
                        <span>
                          Electricity bill
                        </span>

                        <h3>
                          {
                            bill.billingPeriod
                          }
                        </h3>

                        <p>
                          {formatDate(
                            bill.billDate
                          )}
                        </p>
                      </div>

                      <span
                        className={`bills-redesign-status ${statusClass(
                          bill.paymentStatus
                        )}`}
                      >
                        {formatStatus(
                          bill.paymentStatus
                        )}
                      </span>
                    </div>

                    <div className="bills-redesign-item-values">
                      <div>
                        <span>
                          Amount
                        </span>

                        <strong>
                          {formatCurrency(
                            bill.billAmount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Consumption
                        </span>

                        <strong>
                          {
                            bill.unitsConsumedKwh
                          }{" "}
                          kWh
                        </strong>
                      </div>

                      <div>
                        <span>
                          Bill ID
                        </span>

                        <strong>
                          #
                          {
                            bill.billId
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="bills-redesign-item-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            bill
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="bills-redesign-delete"
                        onClick={() =>
                          handleDelete(
                            bill.billId
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