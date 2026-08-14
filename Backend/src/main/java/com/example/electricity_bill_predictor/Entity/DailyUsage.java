package com.example.electricity_bill_predictor.Entity;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "daily_usage")
public class DailyUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usage_id")
    private Long usageId;

    @NotNull(message = "Appliance is required")
    @ManyToOne
    @JoinColumn(name = "appliance_id", nullable = false)
    private Appliance appliance;

    @NotNull(message = "Usage date is required")
    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @NotNull(message = "Hours used is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Hours used cannot be negative"
    )
    @Column(name = "hours_used", nullable = false)
    private BigDecimal hoursUsed;

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Estimated consumption cannot be negative"
    )
    @Column(name = "estimated_consumption_kwh")
    private BigDecimal estimatedConsumptionKwh;
    @Column(name = "usage_notes")
    private String usageNotes;

    public Long getUsageId() {
        return usageId;
    }

    public void setUsageId(Long usageId) {
        this.usageId = usageId;
    }

    public Appliance getAppliance() {
        return appliance;
    }

    public void setAppliance(Appliance appliance) {
        this.appliance = appliance;
    }

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(LocalDate usageDate) {
        this.usageDate = usageDate;
    }

    public BigDecimal getHoursUsed() {
        return hoursUsed;
    }

    public void setHoursUsed(BigDecimal hoursUsed) {
        this.hoursUsed = hoursUsed;
    }

    public BigDecimal getEstimatedConsumptionKwh() {
        return estimatedConsumptionKwh;
    }

    public void setEstimatedConsumptionKwh(BigDecimal estimatedConsumptionKwh) {
        this.estimatedConsumptionKwh = estimatedConsumptionKwh;
    }

    public String getUsageNotes() {
        return usageNotes;
    }

    public void setUsageNotes(String usageNotes) {
        this.usageNotes = usageNotes;
    }
}