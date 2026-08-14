package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class HouseholdAnalyticsSummary {

    private Long householdId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalConsumptionKwh;

    private ApplianceConsumptionSummary highestConsumingAppliance;

    private List<ApplianceConsumptionSummary> applianceBreakdown;

    private List<CategoryConsumptionSummary> categoryBreakdown;

    public HouseholdAnalyticsSummary() {
    }

    public HouseholdAnalyticsSummary(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal totalConsumptionKwh,
            ApplianceConsumptionSummary highestConsumingAppliance,
            List<ApplianceConsumptionSummary> applianceBreakdown,
            List<CategoryConsumptionSummary> categoryBreakdown) {

        this.householdId = householdId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalConsumptionKwh = totalConsumptionKwh;
        this.highestConsumingAppliance = highestConsumingAppliance;
        this.applianceBreakdown = applianceBreakdown;
        this.categoryBreakdown = categoryBreakdown;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getTotalConsumptionKwh() {
        return totalConsumptionKwh;
    }

    public void setTotalConsumptionKwh(
            BigDecimal totalConsumptionKwh) {

        this.totalConsumptionKwh =
                totalConsumptionKwh;
    }

    public ApplianceConsumptionSummary getHighestConsumingAppliance() {
        return highestConsumingAppliance;
    }

    public void setHighestConsumingAppliance(
            ApplianceConsumptionSummary highestConsumingAppliance) {

        this.highestConsumingAppliance =
                highestConsumingAppliance;
    }

    public List<ApplianceConsumptionSummary> getApplianceBreakdown() {
        return applianceBreakdown;
    }

    public void setApplianceBreakdown(
            List<ApplianceConsumptionSummary> applianceBreakdown) {

        this.applianceBreakdown =
                applianceBreakdown;
    }

    public List<CategoryConsumptionSummary> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(
            List<CategoryConsumptionSummary> categoryBreakdown) {

        this.categoryBreakdown =
                categoryBreakdown;
    }
}