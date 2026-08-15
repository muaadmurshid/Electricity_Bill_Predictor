/**
 * Renders a backend status enum. The backend decides the status —
 * this only picks a colour and a readable label for it.
 */
const TONE = {
  WITHIN_BUDGET: "success",
  ON_TRACK: "success",
  ACHIEVED: "success",
  ACTIVE: "success",
  WARNING: "warning",
  AT_RISK: "warning",
  PENDING: "warning",
  OVER_BUDGET: "danger",
  MISSED: "danger",
  FAILED: "danger",
  COMPLETED: "info",
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "info",
};

const LABEL = {
  WITHIN_BUDGET: "Within budget",
  OVER_BUDGET: "Over budget",
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  ACHIEVED: "Achieved",
  MISSED: "Missed",
  WARNING: "Warning",
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const key = String(status).toUpperCase();
  const tone = TONE[key] || "neutral";
  const label = LABEL[key] || key.replace(/_/g, " ").toLowerCase();

  return <span className={`badge badge-${tone}`}>{label}</span>;
}
