/**
 * A single headline figure. `tone` colours the left edge:
 * "primary" (default) | "warning" | "danger" | "neutral"
 */
export default function StatCard({ label, value, unit, note, tone = "primary", children }) {
  const toneClass =
    tone === "warning"
      ? "stat-warning"
      : tone === "danger"
      ? "stat-danger"
      : tone === "neutral"
      ? "stat-neutral"
      : "";

  return (
    <article className={`stat ${toneClass}`}>
      <p className="eyebrow">{label}</p>
      <div className="stat-value">
        <span className="figure figure-lg">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>
      {note && <p className="stat-note">{note}</p>}
      {children}
    </article>
  );
}
