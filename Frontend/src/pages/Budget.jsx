import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function Budget() {
  return (
    <ModulePlaceholder
      eyebrow="Targets"
      title="Budget"
      lead="Your monthly spending limit, and how close the predicted bill is to it."
      needs={["BudgetController.java", "Budget.java"]}
      notes="Show the status badge and the block meter using the status the backend returns — WITHIN_BUDGET, WARNING or OVER_BUDGET. Never work the status out on the frontend."
    />
  );
}
