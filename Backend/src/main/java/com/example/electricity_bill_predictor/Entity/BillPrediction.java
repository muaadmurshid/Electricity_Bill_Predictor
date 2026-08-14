package com.example.electricity_bill_predictor.Entity;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bill_prediction")
public class BillPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prediction_id")
    private Long predictionId;

    @NotNull(message = "Household is required")
    @ManyToOne
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;


    @NotNull(message = "Tariff is required")
    @ManyToOne
    @JoinColumn(name = "tariff_id", nullable = false)
    private Tariff tariff;

    @NotNull(message = "Prediction date is required")
    @Column(name = "prediction_date", nullable = false)
    private LocalDate predictionDate;

    @NotNull(message = "Target month is required")
    @Column(name = "target_month", nullable = false)
    private LocalDate targetMonth;

    @NotNull(message = "Predicted consumption is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Predicted consumption cannot be negative"
    )
    @Column(name = "predicted_consumption_kwh", nullable = false)
    private BigDecimal predictedConsumptionKwh;

    @NotNull(message = "Predicted bill amount is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Predicted bill amount cannot be negative"
    )
    @Column(name = "predicted_bill_amount", nullable = false)
    private BigDecimal predictedBillAmount;

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Lower estimate cannot be negative"
    )
    @Column(name = "lower_estimate")
    private BigDecimal lowerEstimate;

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Upper estimate cannot be negative"
    )
    @Column(name = "upper_estimate")
    private BigDecimal upperEstimate;

    @NotBlank(message = "Prediction status is required")
    @Column(name = "prediction_status", nullable = false)
    private String predictionStatus;

    public Long getPredictionId() {
        return predictionId;
    }

    public void setPredictionId(Long predictionId) {
        this.predictionId = predictionId;
    }

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public Tariff getTariff() {
        return tariff;
    }

    public void setTariff(Tariff tariff) {
        this.tariff = tariff;
    }

    public LocalDate getPredictionDate() {
        return predictionDate;
    }

    public void setPredictionDate(LocalDate predictionDate) {
        this.predictionDate = predictionDate;
    }

    public LocalDate getTargetMonth() {
        return targetMonth;
    }

    public void setTargetMonth(LocalDate targetMonth) {
        this.targetMonth = targetMonth;
    }

    public BigDecimal getPredictedConsumptionKwh() {
        return predictedConsumptionKwh;
    }

    public void setPredictedConsumptionKwh(BigDecimal predictedConsumptionKwh) {
        this.predictedConsumptionKwh = predictedConsumptionKwh;
    }

    public BigDecimal getPredictedBillAmount() {
        return predictedBillAmount;
    }

    public void setPredictedBillAmount(BigDecimal predictedBillAmount) {
        this.predictedBillAmount = predictedBillAmount;
    }

    public BigDecimal getLowerEstimate() {
        return lowerEstimate;
    }

    public void setLowerEstimate(BigDecimal lowerEstimate) {
        this.lowerEstimate = lowerEstimate;
    }

    public BigDecimal getUpperEstimate() {
        return upperEstimate;
    }

    public void setUpperEstimate(BigDecimal upperEstimate) {
        this.upperEstimate = upperEstimate;
    }

    public String getPredictionStatus() {
        return predictionStatus;
    }

    public void setPredictionStatus(String predictionStatus) {
        this.predictionStatus = predictionStatus;
    }
}