package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;

public class BillCalculationResult {

    private Integer unitsConsumed;
    private String consumerGroup;
    private BigDecimal energyCharge;
    private BigDecimal fixedCharge;
    private BigDecimal totalBill;

    public BillCalculationResult() {
    }

    public BillCalculationResult(
            Integer unitsConsumed,
            String consumerGroup,
            BigDecimal energyCharge,
            BigDecimal fixedCharge,
            BigDecimal totalBill) {

        this.unitsConsumed = unitsConsumed;
        this.consumerGroup = consumerGroup;
        this.energyCharge = energyCharge;
        this.fixedCharge = fixedCharge;
        this.totalBill = totalBill;
    }

    public Integer getUnitsConsumed() {
        return unitsConsumed;
    }

    public void setUnitsConsumed(Integer unitsConsumed) {
        this.unitsConsumed = unitsConsumed;
    }

    public String getConsumerGroup() {
        return consumerGroup;
    }

    public void setConsumerGroup(String consumerGroup) {
        this.consumerGroup = consumerGroup;
    }

    public BigDecimal getEnergyCharge() {
        return energyCharge;
    }

    public void setEnergyCharge(BigDecimal energyCharge) {
        this.energyCharge = energyCharge;
    }

    public BigDecimal getFixedCharge() {
        return fixedCharge;
    }

    public void setFixedCharge(BigDecimal fixedCharge) {
        this.fixedCharge = fixedCharge;
    }

    public BigDecimal getTotalBill() {
        return totalBill;
    }

    public void setTotalBill(BigDecimal totalBill) {
        this.totalBill = totalBill;
    }
}