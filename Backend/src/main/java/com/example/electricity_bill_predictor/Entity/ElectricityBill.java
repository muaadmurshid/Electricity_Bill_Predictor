package com.example.electricity_bill_predictor.Entity;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "electricity_bill")
public class ElectricityBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bill_id")
    private Long billId;

    @NotNull(message = "Household is required")
    @ManyToOne
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @NotBlank(message = "Billing period is required")
    @Column(name = "billing_period", nullable = false)
    private String billingPeriod;

    @NotNull(message = "Units consumed is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Units consumed cannot be negative"
    )
    @Column(name = "units_consumed_kwh", nullable = false)
    private BigDecimal unitsConsumedKwh;

    @NotNull(message = "Bill amount is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Bill amount cannot be negative"
    )
    @Column(name = "bill_amount", nullable = false)
    private BigDecimal billAmount;

    @NotNull(message = "Bill date is required")
    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @NotBlank(message = "Payment status is required")
    @Column(name = "payment_status", nullable = false)
    private String paymentStatus;

    // Getters and Setters

    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
    }

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public String getBillingPeriod() {
        return billingPeriod;
    }

    public void setBillingPeriod(String billingPeriod) {
        this.billingPeriod = billingPeriod;
    }

    public BigDecimal getUnitsConsumedKwh() {
        return unitsConsumedKwh;
    }

    public void setUnitsConsumedKwh(BigDecimal unitsConsumedKwh) {
        this.unitsConsumedKwh = unitsConsumedKwh;
    }

    public BigDecimal getBillAmount() {
        return billAmount;
    }

    public void setBillAmount(BigDecimal billAmount) {
        this.billAmount = billAmount;
    }

    public LocalDate getBillDate() {
        return billDate;
    }

    public void setBillDate(LocalDate billDate) {
        this.billDate = billDate;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}