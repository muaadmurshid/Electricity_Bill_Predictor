package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;
import java.util.List;

public class TariffIntelligenceResponse {

    private Long tariffId;
    private Integer currentUnits;

    private String consumerGroup;

    private Integer currentBlockMinUnits;
    private Integer currentBlockMaxUnits;

    private BigDecimal currentRatePerUnit;
    private BigDecimal currentFixedCharge;
    private BigDecimal currentEstimatedBill;

    private Integer nextThresholdUnits;
    private Integer unitsRemainingToNextThreshold;

    private List<TariffScenario> scenarios;

    public Long getTariffId() {
        return tariffId;
    }

    public void setTariffId(Long tariffId) {
        this.tariffId = tariffId;
    }

    public Integer getCurrentUnits() {
        return currentUnits;
    }

    public void setCurrentUnits(Integer currentUnits) {
        this.currentUnits = currentUnits;
    }

    public String getConsumerGroup() {
        return consumerGroup;
    }

    public void setConsumerGroup(String consumerGroup) {
        this.consumerGroup = consumerGroup;
    }

    public Integer getCurrentBlockMinUnits() {
        return currentBlockMinUnits;
    }

    public void setCurrentBlockMinUnits(
            Integer currentBlockMinUnits) {

        this.currentBlockMinUnits =
                currentBlockMinUnits;
    }

    public Integer getCurrentBlockMaxUnits() {
        return currentBlockMaxUnits;
    }

    public void setCurrentBlockMaxUnits(
            Integer currentBlockMaxUnits) {

        this.currentBlockMaxUnits =
                currentBlockMaxUnits;
    }

    public BigDecimal getCurrentRatePerUnit() {
        return currentRatePerUnit;
    }

    public void setCurrentRatePerUnit(
            BigDecimal currentRatePerUnit) {

        this.currentRatePerUnit =
                currentRatePerUnit;
    }

    public BigDecimal getCurrentFixedCharge() {
        return currentFixedCharge;
    }

    public void setCurrentFixedCharge(
            BigDecimal currentFixedCharge) {

        this.currentFixedCharge =
                currentFixedCharge;
    }

    public BigDecimal getCurrentEstimatedBill() {
        return currentEstimatedBill;
    }

    public void setCurrentEstimatedBill(
            BigDecimal currentEstimatedBill) {

        this.currentEstimatedBill =
                currentEstimatedBill;
    }

    public Integer getNextThresholdUnits() {
        return nextThresholdUnits;
    }

    public void setNextThresholdUnits(
            Integer nextThresholdUnits) {

        this.nextThresholdUnits =
                nextThresholdUnits;
    }

    public Integer getUnitsRemainingToNextThreshold() {
        return unitsRemainingToNextThreshold;
    }

    public void setUnitsRemainingToNextThreshold(
            Integer unitsRemainingToNextThreshold) {

        this.unitsRemainingToNextThreshold =
                unitsRemainingToNextThreshold;
    }

    public List<TariffScenario> getScenarios() {
        return scenarios;
    }

    public void setScenarios(
            List<TariffScenario> scenarios) {

        this.scenarios = scenarios;
    }
}