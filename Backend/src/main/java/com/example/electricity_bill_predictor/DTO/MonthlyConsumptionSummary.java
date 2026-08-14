package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MonthlyConsumptionSummary {

    private Long householdId;
    private Integer year;
    private Integer month;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalConsumptionKwh;

    public MonthlyConsumptionSummary() {
    }

    public MonthlyConsumptionSummary(
            Long householdId,
            Integer year,
            Integer month,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal totalConsumptionKwh) {

        this.householdId = householdId;
        this.year = year;
        this.month = month;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalConsumptionKwh = totalConsumptionKwh;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
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
}