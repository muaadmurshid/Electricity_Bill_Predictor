package com.example.electricity_bill_predictor.Entity;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tariff")
public class Tariff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tariff_id")
    private Long tariffId;

    @NotBlank(message = "Tariff name is required")
    @Column(name = "tariff_name", nullable = false)
    private String tariffName;

    @NotNull(message = "Effective from date is required")
    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @NotNull(message = "Rate per unit is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Rate per unit cannot be negative"
    )
    @Column(name = "rate_per_unit", nullable = false)
    private BigDecimal ratePerUnit;

    @NotNull(message = "Fixed charge is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Fixed charge cannot be negative"
    )
    @Column(name = "fixed_charge", nullable = false)
    private BigDecimal fixedCharge;

    @NotBlank(message = "Tariff status is required")
    @Column(name = "status", nullable = false)
    private String status;

    @AssertTrue(message = "Effective to date cannot be before effective from date")
    public boolean isTariffDateRangeValid() {

        return effectiveFrom == null
                || effectiveTo == null
                || !effectiveTo.isBefore(effectiveFrom);
    }

    public Long getTariffId() {
        return tariffId;
    }

    public void setTariffId(Long tariffId) {
        this.tariffId = tariffId;
    }

    public String getTariffName() {
        return tariffName;
    }

    public void setTariffName(String tariffName) {
        this.tariffName = tariffName;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public BigDecimal getRatePerUnit() {
        return ratePerUnit;
    }

    public void setRatePerUnit(BigDecimal ratePerUnit) {
        this.ratePerUnit = ratePerUnit;
    }

    public BigDecimal getFixedCharge() {
        return fixedCharge;
    }

    public void setFixedCharge(BigDecimal fixedCharge) {
        this.fixedCharge = fixedCharge;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}