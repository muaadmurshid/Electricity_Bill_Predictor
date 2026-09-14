package com.example.electricity_bill_predictor.DTO;

public class MlRecommendationRequest {

    private Integer month;
    private Double monthlyConsumptionKwh;
    private Double predictedConsumptionKwh;
    private Double predictedBillAmount;
    private Double highestApplianceConsumptionKwh;
    private Double highestCategoryConsumptionKwh;
    private String highestConsumingCategory;

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Double getMonthlyConsumptionKwh() {
        return monthlyConsumptionKwh;
    }

    public void setMonthlyConsumptionKwh(
            Double monthlyConsumptionKwh) {
        this.monthlyConsumptionKwh =
                monthlyConsumptionKwh;
    }

    public Double getPredictedConsumptionKwh() {
        return predictedConsumptionKwh;
    }

    public void setPredictedConsumptionKwh(
            Double predictedConsumptionKwh) {
        this.predictedConsumptionKwh =
                predictedConsumptionKwh;
    }

    public Double getPredictedBillAmount() {
        return predictedBillAmount;
    }

    public void setPredictedBillAmount(
            Double predictedBillAmount) {
        this.predictedBillAmount =
                predictedBillAmount;
    }

    public Double getHighestApplianceConsumptionKwh() {
        return highestApplianceConsumptionKwh;
    }

    public void setHighestApplianceConsumptionKwh(
            Double highestApplianceConsumptionKwh) {
        this.highestApplianceConsumptionKwh =
                highestApplianceConsumptionKwh;
    }

    public Double getHighestCategoryConsumptionKwh() {
        return highestCategoryConsumptionKwh;
    }

    public void setHighestCategoryConsumptionKwh(
            Double highestCategoryConsumptionKwh) {
        this.highestCategoryConsumptionKwh =
                highestCategoryConsumptionKwh;
    }

    public String getHighestConsumingCategory() {
        return highestConsumingCategory;
    }

    public void setHighestConsumingCategory(
            String highestConsumingCategory) {
        this.highestConsumingCategory =
                highestConsumingCategory;
    }
}