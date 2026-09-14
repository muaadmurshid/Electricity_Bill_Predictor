package com.example.electricity_bill_predictor.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Entity
@Table(name = "appliance")
public class Appliance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appliance_id")
    private Long applianceId;

    @NotNull(message = "Room is required")
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @NotNull(message = "Appliance category is required")
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private ApplianceCategory category;

    @NotBlank(message = "Appliance name is required")
    @Column(name = "appliance_name", nullable = false)
    private String applianceName;

    @Column(name = "brand")
    private String brand;

    @Column(name = "model")
    private String model;

    @NotNull(message = "Rated power is required")
    @DecimalMin(
            value = "0.01",
            message = "Rated power must be greater than 0"
    )
    @Column(name = "rated_power", nullable = false)
    private BigDecimal ratedPower;

    @NotNull(message = "Quantity is required")
    @Min(
            value = 1,
            message = "Quantity must be at least 1"
    )
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "energy_rating")
    private String energyRating;

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Typical daily hours cannot be negative"
    )
    @Column(name = "typical_daily_hours")
    private BigDecimal typicalDailyHours;

    @NotBlank(message = "Status is required")
    @Column(name = "status", nullable = false)
    private String status;

    // =========================================================
    // SMART APPLIANCE IDENTIFICATION FIELDS
    // =========================================================

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Voltage cannot be negative"
    )
    @Column(name = "voltage")
    private BigDecimal voltage;

    @Column(name = "image_path", length = 500)
    private String imagePath;

    @Column(name = "ai_detected", nullable = false)
    private Boolean aiDetected = false;

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getApplianceId() {
        return applianceId;
    }

    public void setApplianceId(Long applianceId) {
        this.applianceId = applianceId;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public ApplianceCategory getCategory() {
        return category;
    }

    public void setCategory(ApplianceCategory category) {
        this.category = category;
    }

    public String getApplianceName() {
        return applianceName;
    }

    public void setApplianceName(String applianceName) {
        this.applianceName = applianceName;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public BigDecimal getRatedPower() {
        return ratedPower;
    }

    public void setRatedPower(BigDecimal ratedPower) {
        this.ratedPower = ratedPower;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getEnergyRating() {
        return energyRating;
    }

    public void setEnergyRating(String energyRating) {
        this.energyRating = energyRating;
    }

    public BigDecimal getTypicalDailyHours() {
        return typicalDailyHours;
    }

    public void setTypicalDailyHours(BigDecimal typicalDailyHours) {
        this.typicalDailyHours = typicalDailyHours;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getVoltage() {
        return voltage;
    }

    public void setVoltage(BigDecimal voltage) {
        this.voltage = voltage;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public Boolean getAiDetected() {
        return aiDetected;
    }

    public void setAiDetected(Boolean aiDetected) {
        this.aiDetected = aiDetected;
    }
}