/**
 * The left-hand panel on Login and Register.
 *
 * The ladder is the idea the whole product rests on: a Sri Lankan
 * electricity bill is not one rate, it is a set of blocks, and each unit
 * you add can land in a more expensive one. It is drawn with CSS only —
 * no images, no chart library on a public page.
 */
const LADDER = [
  { height: 22, label: "0–30" },
  { height: 34, label: "31–60" },
  { height: 48, label: "61–90" },
  { height: 64, label: "91–120" },
  { height: 84, label: "121–180" },
  { height: 100, label: "180+" },
];

export default function AuthPanel({ headline, sub }) {
  return (
    <div className="auth-panel">
      <div className="auth-panel-head">
        <span className="brand-mark" aria-hidden="true">
          <span style={{ height: "7px" }} />
          <span style={{ height: "11px" }} />
          <span style={{ height: "15px" }} />
          <span style={{ height: "20px" }} />
        </span>
        <span className="brand-name">Bill Predictor</span>
      </div>

      <div>
        <h2 className="auth-headline">{headline}</h2>
        <p className="auth-sub">{sub}</p>

        <div className="ladder" aria-hidden="true">
          {LADDER.map((block) => (
            <span
              key={block.label}
              className="ladder-step"
              style={{ height: `${block.height}%` }}
            />
          ))}
        </div>
        <div className="ladder-caption" aria-hidden="true">
          <span>Units (kWh)</span>
          <span>Rate rises per block</span>
        </div>
      </div>

      <p className="auth-foot">Final year project · Sri Lankan household tariffs</p>
    </div>
  );
}
