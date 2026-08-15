import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";

export default function NotFound() {
  return (
    <div style={{ padding: "var(--space-8) var(--space-5)" }}>
      <EmptyState
        title="That page does not exist"
        message="The link may be out of date, or the page may have moved."
        action={
          <Link to="/dashboard">
            <Button>Back to dashboard</Button>
          </Link>
        }
      />
    </div>
  );
}
