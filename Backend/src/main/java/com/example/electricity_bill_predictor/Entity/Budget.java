package com.example.electricity_bill_predictor.Entity;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budget")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "budget_id")
    private Long budgetId;

    @NotNull(message = "Household is required")
    @ManyToOne
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @NotNull(message = "Budget month is required")
    @Min(value = 1, message = "Budget month must be between 1 and 12")
    @Max(value = 12, message = "Budget month must be between 1 and 12")
    @Column(name = "budget_month", nullable = false)
    private Integer budgetMonth;

    @NotNull(message = "Budget year is required")
    @Min(value = 2020, message = "Budget year is invalid")
    @Column(name = "budget_year", nullable = false)
    private Integer budgetYear;

    @NotNull(message = "Budget amount is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Budget amount cannot be negative"
    )
    @Column(name = "budget_amount", nullable = false)
    private BigDecimal budgetAmount;

    @NotNull(message = "Warning threshold is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Warning threshold cannot be negative"
    )
    @Column(name = "warning_threshold", nullable = false)
    private BigDecimal warningThreshold;

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Current estimated amount cannot be negative"
    )
    @Column(name = "current_estimated_amount")
    private BigDecimal currentEstimatedAmount;

    @NotBlank(message = "Status is required")
    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
    }

    public Long getBudgetId() {
        return budgetId;
    }

    public void setBudgetId(Long budgetId) {
        this.budgetId = budgetId;
    }

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public Integer getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(Integer budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public Integer getBudgetYear() {
        return budgetYear;
    }

    public void setBudgetYear(Integer budgetYear) {
        this.budgetYear = budgetYear;
    }

    public BigDecimal getBudgetAmount() {
        return budgetAmount;
    }

    public void setBudgetAmount(BigDecimal budgetAmount) {
        this.budgetAmount = budgetAmount;
    }

    public BigDecimal getWarningThreshold() {
        return warningThreshold;
    }

    public void setWarningThreshold(BigDecimal warningThreshold) {
        this.warningThreshold = warningThreshold;
    }

    public BigDecimal getCurrentEstimatedAmount() {
        return currentEstimatedAmount;
    }

    public void setCurrentEstimatedAmount(BigDecimal currentEstimatedAmount) {
        this.currentEstimatedAmount = currentEstimatedAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}