import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
import BlockMeter from "../components/common/BlockMeter";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";

/* ---------------------------------------------------------------------
   The dashboard shell.

   Every figure below is deliberately empty. Nothing is invented, and no
   value is calculated here — the numbers arrive once the matching
   controllers are confirmed. Where each one comes from:

     Current monthly consumption -> analyticsService.monthly(householdId)
     Predicted next bill         -> predictionService.latest(householdId)
     Monthly budget + status     -> budgetService.current(householdId)
     Energy goal + status        -> goalService.active(householdId)
     Highest consuming appliance -> analyticsService.highestConsumer(householdId)
     Recent recommendations      -> recommendationService.listByHousehold(id)
     Recent notifications        -> notificationService.listByHousehold(id)

   Pattern to use when you wire each one up:

     const [state, setState] = useState({ loading: true, error: "", data: null });
     useEffect(() => {
       let alive = true;
       budgetService.current(householdId)
         .then((data) => alive && setState({ loading: false, error: "", data }))
         .catch((err) => alive && setState({ loading: false, error: getErrorMessage(err), data: null }));
       return () => { alive = false; };
     }, [householdId]);

   Statuses (WITHIN_BUDGET / WARNING / OVER_BUDGET, ON_TRACK / AT_RISK /
   ACHIEVED / MISSED) come from the backend. Pass them to <StatusBadge />
   and to BlockMeter's `tone` — never re-derive them here.
   --------------------------------------------------------------------- */

const STEPS = [
  {
    title: "Create your household",
    text: "Name, location, house type and how many people live there.",
    to: "/households",
  },
  {
    title: "Add your rooms",
    text: "Living room, kitchen, bedrooms — whatever your home has.",
    to: "/rooms",
  },
  {
    title: "Add your appliances",
    text: "Rated power in watts, quantity, and the room each one is in.",
    to: "/appliances",
  },
  {
    title: "Record daily usage",
    text: "How many hours each appliance ran. Consumption is worked out for you.",
    to: "/usage",
  },
  {
    title: "Add your past bills",
    text: "Older bills make the prediction more accurate.",
    to: "/bills",
  },
  {
    title: "Set a budget and a goal",
    text: "You get a notification before either one is at risk.",
    to: "/budget",
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Hello, ${user?.firstName || "there"}`}
        lead="Your electricity at a glance — what you have used so far, what next month is likely to cost, and how that sits against your budget."
        action={
          <Link to="/predictions">
            <Button variant="secondary">Run a prediction</Button>
          </Link>
        }
      />

      <div className="stack">
        <div className="grid grid-4">
          <StatCard
            label="This month"
            value="—"
            unit="kWh"
            note="Record daily usage to see this."
            tone="neutral"
          />
          <StatCard
            label="Predicted bill"
            value="—"
            note="Available after your first prediction."
            tone="neutral"
          />
          <StatCard
            label="Monthly budget"
            value="—"
            note="No budget set yet."
            tone="neutral"
          />
          <StatCard
            label="Energy goal"
            value="—"
            unit="kWh"
            note="No active goal."
            tone="neutral"
          />
        </div>

        <div className="grid grid-2">
          <Card
            title="Budget usage"
            subtitle="Predicted bill against the budget you set"
            action={
              <Link to="/budget" className="text-sm">
                Set budget
              </Link>
            }
          >
            <BlockMeter
              percent={0}
              thresholdPercent={80}
              leftLabel="Rs. 0"
              rightLabel="No budget set"
            />
            <p className="text-sm muted" style={{ marginTop: "var(--space-4)" }}>
              Set a monthly budget and a warning threshold, and this fills as your
              predicted bill climbs through it.
            </p>
          </Card>

          <Card
            title="Highest consuming appliance"
            subtitle="Where most of your electricity goes"
          >
            <EmptyState
              title="Nothing to compare yet"
              message="Once you have recorded a few days of usage, the appliance using the most electricity appears here."
              action={
                <Link to="/appliances">
                  <Button variant="secondary" size="sm">
                    Add an appliance
                  </Button>
                </Link>
              }
            />
          </Card>
        </div>

        <Card
          title="Getting started"
          subtitle="Each step needs the one before it, so work down the list"
        >
          <ol className="steps">
            {STEPS.map((step, index) => (
              <li className="step" key={step.title}>
                <span className="step-num">{index + 1}</span>
                <div>
                  <Link to={step.to} className="step-title">
                    {step.title}
                  </Link>
                  <p className="step-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="grid grid-2">
          <Card title="Recent recommendations">
            <EmptyState
              title="No recommendations yet"
              message="After a prediction runs, you get practical suggestions for cutting your bill."
              action={
                <Link to="/recommendations">
                  <Button variant="secondary" size="sm">
                    Open recommendations
                  </Button>
                </Link>
              }
            />
          </Card>

          <Card title="Recent notifications">
            <EmptyState
              title="Nothing to report"
              message="You will be told here when your budget or your energy goal is at risk."
            />
          </Card>
        </div>
      </div>
    </>
  );
}
