package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;

public class TariffWhatIfResponse {

    private Integer currentUnits;
    private Integer targetUnits;

    private BigDecimal currentBill;
    private BigDecimal targetBill;

    private Integer unitDifference;
    private BigDecimal billDifference;
    private BigDecimal percentageDifference;

    public Integer getCurrentUnits() {
        return currentUnits;
    }

    public void setCurrentUnits(Integer currentUnits) {
        this.currentUnits = currentUnits;
    }

    public Integer getTargetUnits() {
        return targetUnits;
    }

    public void setTargetUnits(Integer targetUnits) {
        this.targetUnits = targetUnits;
    }

    public BigDecimal getCurrentBill() {
        return currentBill;
    }

    public void setCurrentBill(BigDecimal currentBill) {
        this.currentBill = currentBill;
    }

    public BigDecimal getTargetBill() {
        return targetBill;
    }

    public void setTargetBill(BigDecimal targetBill) {
        this.targetBill = targetBill;
    }

    public Integer getUnitDifference() {
        return unitDifference;
    }

    public void setUnitDifference(Integer unitDifference) {
        this.unitDifference = unitDifference;
    }

    public BigDecimal getBillDifference() {
        return billDifference;
    }

    public void setBillDifference(BigDecimal billDifference) {
        this.billDifference = billDifference;
    }

    public BigDecimal getPercentageDifference() {
        return percentageDifference;
    }

    public void setPercentageDifference(
            BigDecimal percentageDifference) {

        this.percentageDifference =
                percentageDifference;
    }
}