package com.example.electricity_bill_predictor.DTO;

public class MlRecommendationResponse {

    private String recommendationClass;

    public String getRecommendationClass() {
        return recommendationClass;
    }

    public void setRecommendationClass(
            String recommendationClass) {
        this.recommendationClass =
                recommendationClass;
    }
}