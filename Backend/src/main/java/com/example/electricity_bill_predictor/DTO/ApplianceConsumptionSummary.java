package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;

public class ApplianceConsumptionSummary {

    private Long applianceId;
    private String applianceName;
    private BigDecimal totalConsumptionKwh;
    private BigDecimal percentageShare;

    public ApplianceConsumptionSummary() {
    }

    public ApplianceConsumptionSummary(
            Long applianceId,
            String applianceName,
            BigDecimal totalConsumptionKwh) {

        this.applianceId = applianceId;
        this.applianceName = applianceName;
        this.totalConsumptionKwh = totalConsumptionKwh;
    }

    public ApplianceConsumptionSummary(
            Long applianceId,
            String applianceName,
            BigDecimal totalConsumptionKwh,
            BigDecimal percentageShare) {

        this.applianceId = applianceId;
        this.applianceName = applianceName;
        this.totalConsumptionKwh = totalConsumptionKwh;
        this.percentageShare = percentageShare;
    }

    public Long getApplianceId() {
        return applianceId;
    }

    public void setApplianceId(Long applianceId) {
        this.applianceId = applianceId;
    }

    public String getApplianceName() {
        return applianceName;
    }

    public void setApplianceName(String applianceName) {
        this.applianceName = applianceName;
    }

    public BigDecimal getTotalConsumptionKwh() {
        return totalConsumptionKwh;
    }

    public void setTotalConsumptionKwh(
            BigDecimal totalConsumptionKwh) {

        this.totalConsumptionKwh =
                totalConsumptionKwh;
    }

    public BigDecimal getPercentageShare() {
        return percentageShare;
    }

    public void setPercentageShare(
            BigDecimal percentageShare) {

        this.percentageShare =
                percentageShare;
    }
}