package com.example.electricity_bill_predictor.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MlPredictionRequest {

    private Integer year;
    private Integer month;

    @JsonProperty("number_of_residents")
    private Integer numberOfResidents;

    @JsonProperty("appliance_count")
    private Integer applianceCount;

    @JsonProperty("total_rated_power_w")
    private Double totalRatedPowerW;

    @JsonProperty("previous_month_kwh")
    private Double previousMonthKwh;

    @JsonProperty("previous_2_month_kwh")
    private Double previous2MonthKwh;

    @JsonProperty("previous_3_month_kwh")
    private Double previous3MonthKwh;

    @JsonProperty("average_last_3_months_kwh")
    private Double averageLast3MonthsKwh;

    public MlPredictionRequest() {
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

    public Integer getNumberOfResidents() {
        return numberOfResidents;
    }

    public void setNumberOfResidents(Integer numberOfResidents) {
        this.numberOfResidents = numberOfResidents;
    }

    public Integer getApplianceCount() {
        return applianceCount;
    }

    public void setApplianceCount(Integer applianceCount) {
        this.applianceCount = applianceCount;
    }

    public Double getTotalRatedPowerW() {
        return totalRatedPowerW;
    }

    public void setTotalRatedPowerW(Double totalRatedPowerW) {
        this.totalRatedPowerW = totalRatedPowerW;
    }

    public Double getPreviousMonthKwh() {
        return previousMonthKwh;
    }

    public void setPreviousMonthKwh(Double previousMonthKwh) {
        this.previousMonthKwh = previousMonthKwh;
    }

    public Double getPrevious2MonthKwh() {
        return previous2MonthKwh;
    }

    public void setPrevious2MonthKwh(Double previous2MonthKwh) {
        this.previous2MonthKwh = previous2MonthKwh;
    }

    public Double getPrevious3MonthKwh() {
        return previous3MonthKwh;
    }

    public void setPrevious3MonthKwh(Double previous3MonthKwh) {
        this.previous3MonthKwh = previous3MonthKwh;
    }

    public Double getAverageLast3MonthsKwh() {
        return averageLast3MonthsKwh;
    }

    public void setAverageLast3MonthsKwh(Double averageLast3MonthsKwh) {
        this.averageLast3MonthsKwh = averageLast3MonthsKwh;
    }
}