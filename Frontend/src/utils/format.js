/**
 * Display helpers. These only format values that the backend already
 * calculated — no bill maths, no tariff logic on the frontend.
 */

const EMPTY = "—";

/** 1300 -> "Rs. 1,300.00" */
export function formatLkr(value, { decimals = 2 } = {}) {
  const n = toNumber(value);
  if (n === null) return EMPTY;
  return `Rs. ${n.toLocaleString("en-LK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** 63.42 -> "63.4" (pair it with a <span class="unit">kWh</span>) */
export function formatKwh(value, { decimals = 1 } = {}) {
  const n = toNumber(value);
  if (n === null) return EMPTY;
  return n.toLocaleString("en-LK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** 1200 -> "1,200" */
export function formatWatts(value) {
  const n = toNumber(value);
  if (n === null) return EMPTY;
  return n.toLocaleString("en-LK");
}

/** 0.8043 -> "80%" ; pass isRatio=false for a value already in percent */
export function formatPercent(value, { isRatio = false, decimals = 0 } = {}) {
  const n = toNumber(value);
  if (n === null) return EMPTY;
  const pct = isRatio ? n * 100 : n;
  return `${pct.toFixed(decimals)}%`;
}

/** "2026-09-14T10:05:00" -> "14 Sep 2026" */
export function formatDate(value) {
  const d = toDate(value);
  if (!d) return EMPTY;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "2026-09-14T10:05:00" -> "14 Sep 2026, 10:05" */
export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return EMPTY;
  return `${formatDate(d)}, ${d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/** (2026, 9) -> "September 2026" */
export function formatMonth(year, month) {
  if (!year || !month) return EMPTY;
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** "2026-09" or "2026-09-01" -> "September 2026" */
export function formatBillingMonth(value) {
  if (!value) return EMPTY;
  const [year, month] = String(value).split("-");
  return formatMonth(year, month);
}

/** Today as "2026-08-15", for date inputs. */
export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** "Nimal", "Perera" -> "NP" */
export function initials(firstName = "", lastName = "") {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return (a + b).toUpperCase() || "U";
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
