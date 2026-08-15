import { Link } from "react-router-dom";
import AuthPanel from "../components/layout/AuthPanel";
import Button from "../components/common/Button";

/** Public front page at "/". Signed-in users land on /dashboard instead. */
export default function Landing() {
  return (
    <div className="auth">
      <AuthPanel
        headline="Your electricity bill, before the bill."
        sub="A prediction tool for Sri Lankan households: record what your appliances use, and see the estimated bill for next month against current tariff blocks."
      />

      <div className="auth-form-side">
        <div className="auth-form">
          <p className="eyebrow">Electricity Bill Predictor</p>
          <h1 style={{ marginTop: "var(--space-2)" }}>
            Find out what next month costs
          </h1>
          <p className="auth-form-lead">
            Add your rooms and appliances, record usage as you go, and get a predicted
            bill, a spending budget, and practical ways to bring it down.
          </p>

          <div className="stack-sm" style={{ marginTop: "var(--space-5)" }}>
            <Link to="/register">
              <Button block>Create an account</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" block>
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
