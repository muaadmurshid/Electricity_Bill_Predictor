package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;

public class AiRecommendationRequest {

    private Long householdId;
    private String householdName;

    private Integer year;
    private Integer month;

    private BigDecimal monthlyConsumptionKwh;
    private BigDecimal predictedConsumptionKwh;
    private BigDecimal predictedBillAmount;

    private String highestConsumingAppliance;
    private BigDecimal highestApplianceConsumptionKwh;

    private String highestConsumingCategory;
    private BigDecimal highestCategoryConsumptionKwh;

    public Long getHouseholdId() {
        return householdId;
    }

    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }

    public String getHouseholdName() {
        return householdName;
    }

    public void setHouseholdName(String householdName) {
        this.householdName = householdName;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public BigDecimal getMonthlyConsumptionKwh() {
        return monthlyConsumptionKwh;
    }

    public void setMonthlyConsumptionKwh(
            BigDecimal monthlyConsumptionKwh) {
        this.monthlyConsumptionKwh = monthlyConsumptionKwh;
    }

    public BigDecimal getPredictedConsumptionKwh() {
        return predictedConsumptionKwh;
    }

    public void setPredictedConsumptionKwh(
            BigDecimal predictedConsumptionKwh) {
        this.predictedConsumptionKwh = predictedConsumptionKwh;
    }

    public BigDecimal getPredictedBillAmount() {
        return predictedBillAmount;
    }

    public void setPredictedBillAmount(
            BigDecimal predictedBillAmount) {
        this.predictedBillAmount = predictedBillAmount;
    }

    public String getHighestConsumingAppliance() {
        return highestConsumingAppliance;
    }

    public void setHighestConsumingAppliance(
            String highestConsumingAppliance) {
        this.highestConsumingAppliance = highestConsumingAppliance;
    }

    public BigDecimal getHighestApplianceConsumptionKwh() {
        return highestApplianceConsumptionKwh;
    }

    public void setHighestApplianceConsumptionKwh(
            BigDecimal highestApplianceConsumptionKwh) {
        this.highestApplianceConsumptionKwh =
                highestApplianceConsumptionKwh;
    }

    public String getHighestConsumingCategory() {
        return highestConsumingCategory;
    }

    public void setHighestConsumingCategory(
            String highestConsumingCategory) {
        this.highestConsumingCategory = highestConsumingCategory;
    }

    public BigDecimal getHighestCategoryConsumptionKwh() {
        return highestCategoryConsumptionKwh;
    }

    public void setHighestCategoryConsumptionKwh(
            BigDecimal highestCategoryConsumptionKwh) {
        this.highestCategoryConsumptionKwh =
                highestCategoryConsumptionKwh;
    }
}