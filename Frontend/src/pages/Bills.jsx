import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function Bills() {
  return (
    <ModulePlaceholder
      eyebrow="Records"
      title="Electricity bills"
      lead="Your past bills. The more months you add, the better the prediction gets."
      needs={["ElectricityBillController.java", "ElectricityBill.java"]}
      notes="Confirm the exact billing month format the backend expects — a date, a yyyy-MM string, or separate year and month fields."
    />
  );
}
