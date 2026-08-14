package com.example.electricity_bill_predictor.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Entity
@Table(name = "tariff_rate")
public class TariffRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tariff_rate_id")
    private Long tariffRateId;

    @NotNull(message = "Tariff is required")
    @ManyToOne
    @JoinColumn(name = "tariff_id", nullable = false)
    private Tariff tariff;

    @NotNull(message = "Minimum units is required")
    @Min(value = 0, message = "Minimum units cannot be negative")
    @Column(name = "min_units", nullable = false)
    private Integer minUnits;

    @Min(value = 0, message = "Maximum units cannot be negative")
    @Column(name = "max_units")
    private Integer maxUnits;

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

    @NotBlank(message = "Consumer group is required")
    @Column(name = "consumer_group", nullable = false)
    private String consumerGroup;

    @NotNull(message = "Block order is required")
    @Min(value = 1, message = "Block order must be at least 1")
    @Column(name = "block_order", nullable = false)
    private Integer blockOrder;


    // Getters and Setters

    public Long getTariffRateId() {
        return tariffRateId;
    }

    public void setTariffRateId(Long tariffRateId) {
        this.tariffRateId = tariffRateId;
    }

    public Tariff getTariff() {
        return tariff;
    }

    public void setTariff(Tariff tariff) {
        this.tariff = tariff;
    }

    public Integer getMinUnits() {
        return minUnits;
    }

    public void setMinUnits(Integer minUnits) {
        this.minUnits = minUnits;
    }

    public Integer getMaxUnits() {
        return maxUnits;
    }

    public void setMaxUnits(Integer maxUnits) {
        this.maxUnits = maxUnits;
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

    public String getConsumerGroup() {
        return consumerGroup;
    }

    public void setConsumerGroup(String consumerGroup) {
        this.consumerGroup = consumerGroup;
    }

    public Integer getBlockOrder() {
        return blockOrder;
    }

    public void setBlockOrder(Integer blockOrder) {
        this.blockOrder = blockOrder;
    }
}