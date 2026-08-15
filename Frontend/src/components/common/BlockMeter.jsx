/**
 * The app's signature element.
 *
 * Sri Lankan electricity is billed in blocks, so progress here is drawn
 * as a ladder of discrete steps instead of a smooth bar. Used for budget
 * usage and energy-goal progress.
 *
 * `percent` and `tone` both come from the backend — this component only
 * draws them. It never decides whether you are over budget.
 */
export default function BlockMeter({
  percent = 0,
  steps = 20,
  tone = "success", // "success" | "warning" | "danger"
  thresholdPercent, // e.g. 80 -> marks the warning step
  leftLabel,
  rightLabel,
}) {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
  const filled = Math.round((safePercent / 100) * steps);
  const thresholdStep =
    thresholdPercent == null
      ? null
      : Math.round((Math.max(0, Math.min(100, thresholdPercent)) / 100) * steps);

  const toneClass =
    tone === "danger" ? "meter-danger" : tone === "warning" ? "meter-warning" : "";

  return (
    <div>
      <div
        className={`meter ${toneClass}`}
        role="progressbar"
        aria-valuenow={Math.round(safePercent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: steps }).map((_, i) => {
          const isFilled = i < filled;
          const isThreshold = thresholdStep !== null && i === thresholdStep - 1;
          return (
            <span
              key={i}
              className={[
                "meter-step",
                isFilled ? "meter-step-filled" : "",
                isThreshold ? "meter-step-threshold" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              // Later steps are taller, like a rising tariff block.
              style={{ height: `${55 + (i / Math.max(steps - 1, 1)) * 45}%` }}
            />
          );
        })}
      </div>

      {(leftLabel || rightLabel) && (
        <div className="meter-legend">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
