package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;

public class MlBillPredictionResult {

    private Double predictedConsumptionKwh;
    private BigDecimal predictedBillAmount;

    public MlBillPredictionResult() {
    }

    public MlBillPredictionResult(
            Double predictedConsumptionKwh,
            BigDecimal predictedBillAmount) {

        this.predictedConsumptionKwh =
                predictedConsumptionKwh;

        this.predictedBillAmount =
                predictedBillAmount;
    }

    public Double getPredictedConsumptionKwh() {
        return predictedConsumptionKwh;
    }

    public void setPredictedConsumptionKwh(
            Double predictedConsumptionKwh) {

        this.predictedConsumptionKwh =
                predictedConsumptionKwh;
    }

    public BigDecimal getPredictedBillAmount() {
        return predictedBillAmount;
    }

    public void setPredictedBillAmount(
            BigDecimal predictedBillAmount) {

        this.predictedBillAmount =
                predictedBillAmount;
    }
}