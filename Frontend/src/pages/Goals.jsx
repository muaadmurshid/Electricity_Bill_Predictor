import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function Goals() {
  return (
    <ModulePlaceholder
      eyebrow="Targets"
      title="Energy goals"
      lead="A consumption target for the month, and whether you are on track for it."
      needs={["EnergyGoalController.java", "EnergyGoal.java"]}
      notes="Statuses are ON_TRACK, AT_RISK, ACHIEVED and MISSED. StatusBadge already maps all four."
    />
  );
}
