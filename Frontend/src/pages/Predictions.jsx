import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function Predictions() {
  return (
    <ModulePlaceholder
      eyebrow="Insight"
      title="Predictions"
      lead="The estimated consumption and bill for an upcoming month, and everything predicted before it."
      needs={["MlController.java (or the /api/ml controller)", "BillPredictionController.java", "BillPrediction.java"]}
      notes="Prediction runs as POST /api/ml/predict-household with householdId, tariffId, year and month as query parameters. React never calls the FastAPI service directly."
    />
  );
}
