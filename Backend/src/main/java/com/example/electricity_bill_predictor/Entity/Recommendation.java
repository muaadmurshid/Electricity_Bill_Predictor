package com.example.electricity_bill_predictor.Entity;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation")
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recommendation_id")
    private Long recommendationId;

    @NotNull(message = "Household is required")
    @ManyToOne
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @NotBlank(message = "Recommendation title is required")
    @Column(name = "recommendation_title", nullable = false, length = 150)
    private String recommendationTitle;

    @Column(name = "recommendation_description", columnDefinition = "TEXT")
    private String recommendationDescription;

    @NotBlank(message = "Recommendation type is required")
    @Column(name = "recommendation_type", length = 50)
    private String recommendationType;

    @NotBlank(message = "Priority is required")
    @Column(name = "priority", length = 30)
    private String priority;

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Estimated saving kWh cannot be negative"
    )
    @Column(name = "estimated_saving_kwh", precision = 10, scale = 3)
    private BigDecimal estimatedSavingKwh;

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Estimated saving amount cannot be negative"
    )
    @Column(name = "estimated_saving_amount", precision = 10, scale = 2)
    private BigDecimal estimatedSavingAmount;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
    }

    @NotBlank(message = "Status is required")
    @Column(name = "status", nullable = false, length = 30)
    private String status;

    public Long getRecommendationId() {
        return recommendationId;
    }

    public void setRecommendationId(Long recommendationId) {
        this.recommendationId = recommendationId;
    }

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public String getRecommendationTitle() {
        return recommendationTitle;
    }

    public void setRecommendationTitle(String recommendationTitle) {
        this.recommendationTitle = recommendationTitle;
    }

    public String getRecommendationDescription() {
        return recommendationDescription;
    }

    public void setRecommendationDescription(String recommendationDescription) {
        this.recommendationDescription = recommendationDescription;
    }

    public String getRecommendationType() {
        return recommendationType;
    }

    public void setRecommendationType(String recommendationType) {
        this.recommendationType = recommendationType;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public BigDecimal getEstimatedSavingKwh() {
        return estimatedSavingKwh;
    }

    public void setEstimatedSavingKwh(BigDecimal estimatedSavingKwh) {
        this.estimatedSavingKwh = estimatedSavingKwh;
    }

    public BigDecimal getEstimatedSavingAmount() {
        return estimatedSavingAmount;
    }

    public void setEstimatedSavingAmount(BigDecimal estimatedSavingAmount) {
        this.estimatedSavingAmount = estimatedSavingAmount;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}