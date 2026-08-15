package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;

public class AiRecommendationResponse {

    private String recommendationTitle;
    private String recommendationDescription;
    private String recommendationType;
    private String priority;

    private BigDecimal estimatedSavingKwh;
    private BigDecimal estimatedSavingAmount;

    public String getRecommendationTitle() {
        return recommendationTitle;
    }

    public void setRecommendationTitle(
            String recommendationTitle) {
        this.recommendationTitle = recommendationTitle;
    }

    public String getRecommendationDescription() {
        return recommendationDescription;
    }

    public void setRecommendationDescription(
            String recommendationDescription) {
        this.recommendationDescription =
                recommendationDescription;
    }

    public String getRecommendationType() {
        return recommendationType;
    }

    public void setRecommendationType(
            String recommendationType) {
        this.recommendationType = recommendationType;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public BigDecimal getEstimatedSavingKwh() {
        return estimatedSavingKwh;
    }

    public void setEstimatedSavingKwh(
            BigDecimal estimatedSavingKwh) {
        this.estimatedSavingKwh = estimatedSavingKwh;
    }

    public BigDecimal getEstimatedSavingAmount() {
        return estimatedSavingAmount;
    }

    public void setEstimatedSavingAmount(
            BigDecimal estimatedSavingAmount) {
        this.estimatedSavingAmount = estimatedSavingAmount;
    }
}