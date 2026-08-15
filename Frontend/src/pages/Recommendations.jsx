import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function Recommendations() {
  return (
    <ModulePlaceholder
      eyebrow="Insight"
      title="Recommendations"
      lead="Practical ways to bring your bill down, based on what your home actually uses."
      needs={["AiRecommendationController.java", "RecommendationController.java", "Recommendation.java"]}
      notes="Generation can fail if the OpenAI account has no credits. Catch it and show: Energy recommendation service is temporarily unavailable. Saved recommendations should still load."
    />
  );
}
