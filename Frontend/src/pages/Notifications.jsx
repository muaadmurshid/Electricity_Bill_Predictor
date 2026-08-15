import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function Notifications() {
  return (
    <ModulePlaceholder
      eyebrow="Targets"
      title="Notifications"
      lead="Alerts raised when your budget or your energy goal is at risk."
      needs={["NotificationController.java", "Notification.java"]}
      notes="Types are BUDGET_WARNING, BUDGET_EXCEEDED, GOAL_AT_RISK and GOAL_MISSED. The unread count also feeds the bell in MainLayout."
    />
  );
}
