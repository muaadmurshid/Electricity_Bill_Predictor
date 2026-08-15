import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function Analytics() {
  return (
    <ModulePlaceholder
      eyebrow="Insight"
      title="Analytics"
      lead="Where your electricity goes — by month, by appliance and by category."
      needs={["the consumption analytics controller", "the response DTOs for monthly / appliance / category breakdowns"]}
      notes="Charts go here: a line chart for monthly consumption, a bar chart by appliance, and a doughnut by category. Chart.js and react-chartjs-2 are already in package.json."
    />
  );
}
