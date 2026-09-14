package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;

public class TariffScenario {

    private Integer units;
    private BigDecimal estimatedBill;

    public TariffScenario(
            Integer units,
            BigDecimal estimatedBill) {

        this.units = units;
        this.estimatedBill = estimatedBill;
    }

    public Integer getUnits() {
        return units;
    }

    public void setUnits(Integer units) {
        this.units = units;
    }

    public BigDecimal getEstimatedBill() {
        return estimatedBill;
    }

    public void setEstimatedBill(
            BigDecimal estimatedBill) {

        this.estimatedBill = estimatedBill;
    }
}