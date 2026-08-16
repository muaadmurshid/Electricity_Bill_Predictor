import { useEffect, useState } from "react";

import householdService from "../services/householdService";
import billService from "../services/billService";

export default function Bills() {
  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
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
    if (selectedHouseholdId) {
      loadBills(selectedHouseholdId);
    } else {
      setBills([]);
    }
  }, [selectedHouseholdId]);

  async function loadHouseholds() {
    try {
      setLoading(true);
      setError("");

      const data = await householdService.list();

      const householdList = Array.isArray(data)
        ? data
        : [];

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

  async function loadBills(householdId) {
    try {
      setLoading(true);
      setError("");

      const data =
        await billService.listByHousehold(householdId);

      setBills(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error("Failed to load electricity bills:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load electricity bills."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleHouseholdChange(event) {
    setSelectedHouseholdId(event.target.value);
    resetForm();

    setError("");
    setSuccess("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!selectedHouseholdId) {
      setError("Please select a household first.");
      return false;
    }

    if (!formData.billingPeriod.trim()) {
      setError("Please enter the billing period.");
      return false;
    }

    if (
      formData.unitsConsumedKwh === "" ||
      Number(formData.unitsConsumedKwh) < 0
    ) {
      setError("Units consumed cannot be negative.");
      return false;
    }

    if (
      formData.billAmount === "" ||
      Number(formData.billAmount) < 0
    ) {
      setError("Bill amount cannot be negative.");
      return false;
    }

    if (!formData.billDate) {
      setError("Please select the bill date.");
      return false;
    }

    if (!formData.paymentStatus.trim()) {
      setError("Please select a payment status.");
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

    const payload = {
      household: {
        householdId: Number(selectedHouseholdId),
      },

      billingPeriod:
        formData.billingPeriod.trim(),

      unitsConsumedKwh:
        Number(formData.unitsConsumedKwh),

      billAmount:
        Number(formData.billAmount),

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
        await billService.create(payload);

        setSuccess(
          "Electricity bill added successfully."
        );
      }

      resetForm();

      await loadBills(
        selectedHouseholdId
      );
    } catch (err) {
      console.error("Failed to save electricity bill:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save electricity bill."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(bill) {
    setEditingId(bill.billId);

    if (bill.household?.householdId) {
      setSelectedHouseholdId(
        String(
          bill.household.householdId
        )
      );
    }

    setFormData({
      billingPeriod:
        bill.billingPeriod || "",

      unitsConsumedKwh:
        bill.unitsConsumedKwh !== null &&
        bill.unitsConsumedKwh !== undefined
          ? String(bill.unitsConsumedKwh)
          : "",

      billAmount:
        bill.billAmount !== null &&
        bill.billAmount !== undefined
          ? String(bill.billAmount)
          : "",

      billDate:
        bill.billDate || "",

      paymentStatus:
        bill.paymentStatus || "UNPAID",
    });

    setError("");
    setSuccess("");
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

  async function handleDelete(billId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this electricity bill?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await billService.remove(billId);

      if (editingId === billId) {
        resetForm();
      }

      setSuccess(
        "Electricity bill deleted successfully."
      );

      await loadBills(
        selectedHouseholdId
      );
    } catch (err) {
      console.error("Failed to delete electricity bill:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to delete electricity bill."
      );
    }
  }

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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>
          RECORDS
        </p>

        <h1 style={styles.title}>
          Electricity bills
        </h1>

        <p style={styles.lead}>
          Store previous household electricity bills.
          Historical bills support consumption analysis and
          improve the information available to the prediction
          system.
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
              ? "Edit electricity bill"
              : "Add electricity bill"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>
                Billing period
              </label>

              <input
                type="text"
                name="billingPeriod"
                value={formData.billingPeriod}
                onChange={handleChange}
                required
                placeholder="Example: August 2026"
                style={styles.input}
              />

              <p style={styles.hint}>
                Enter the period exactly as shown on the bill,
                for example: August 2026.
              </p>
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Units consumed (kWh)
                </label>

                <input
                  type="number"
                  name="unitsConsumedKwh"
                  value={formData.unitsConsumedKwh}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.001"
                  placeholder="Example: 145.6"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Bill amount (LKR)
                </label>

                <input
                  type="number"
                  name="billAmount"
                  value={formData.billAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Example: 6250.00"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Bill date
                </label>

                <input
                  type="date"
                  name="billDate"
                  value={formData.billDate}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Payment status
                </label>

                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  required
                  style={styles.input}
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
              </div>
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
                    ? "Update bill"
                    : "Add bill"}
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
            Bill history
          </h2>

          {!selectedHouseholdId ? (
            <p style={styles.muted}>
              Select a household to view electricity bills.
            </p>
          ) : loading ? (
            <p style={styles.muted}>
              Loading electricity bills...
            </p>
          ) : bills.length === 0 ? (
            <p style={styles.muted}>
              No electricity bills found for this household.
            </p>
          ) : (
            <div style={styles.list}>
              {bills.map((bill) => (
                <div
                  key={bill.billId}
                  style={styles.billItem}
                >
                  <div style={styles.billContent}>
                    <div style={styles.billHeading}>
                      <h3 style={styles.billTitle}>
                        {bill.billingPeriod}
                      </h3>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(bill.paymentStatus === "PAID"
                            ? styles.statusPaid
                            : bill.paymentStatus === "OVERDUE"
                              ? styles.statusOverdue
                              : styles.statusPending),
                        }}
                      >
                        {bill.paymentStatus}
                      </span>
                    </div>

                    <p style={styles.detail}>
                      <strong>
                        Units consumed:
                      </strong>{" "}
                      {bill.unitsConsumedKwh} kWh
                    </p>

                    <p style={styles.detail}>
                      <strong>
                        Amount:
                      </strong>{" "}
                      {formatCurrency(
                        bill.billAmount
                      )}
                    </p>

                    <p style={styles.detail}>
                      <strong>
                        Bill date:
                      </strong>{" "}
                      {bill.billDate}
                    </p>

                    <p style={styles.detail}>
                      <strong>
                        Bill ID:
                      </strong>{" "}
                      {bill.billId}
                    </p>
                  </div>

                  <div style={styles.itemActions}>
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(bill)
                      }
                      style={styles.editButton}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          bill.billId
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

  hint: {
    margin: "7px 0 0",
    fontSize: "13px",
    color: "#806d6d",
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

  billItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "18px",
    border: "1px solid #eadede",
    borderRadius: "10px",
    background: "#fffafa",
  },

  billContent: {
    flex: 1,
  },

  billHeading: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "10px",
  },

  billTitle: {
    margin: 0,
  },

  detail: {
    margin: "6px 0",
    color: "#5f5050",
  },

  statusBadge: {
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.04em",
  },

  statusPaid: {
    background: "#e9f7e9",
    color: "#286428",
  },

  statusPending: {
    background: "#fff4d7",
    color: "#795d12",
  },

  statusOverdue: {
    background: "#fff0f0",
    color: "#9a1f1f",
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