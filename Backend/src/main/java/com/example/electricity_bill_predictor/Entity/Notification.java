package com.example.electricity_bill_predictor.Entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @NotNull(message = "Household is required")
    @ManyToOne
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @NotBlank(message = "Notification title is required")
    @Column(name = "notification_title", nullable = false)
    private String notificationTitle;

    @NotBlank(message = "Notification message is required")
    @Column(name = "notification_message", nullable = false)
    private String notificationMessage;

    @NotBlank(message = "Notification type is required")
    @Column(name = "notification_type", nullable = false)
    private String notificationType;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
    }

    @NotNull(message = "Read status is required")
    @Column(name = "is_read", nullable = false)
    private Boolean isRead;

    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public String getNotificationTitle() {
        return notificationTitle;
    }

    public void setNotificationTitle(String notificationTitle) {
        this.notificationTitle = notificationTitle;
    }

    public String getNotificationMessage() {
        return notificationMessage;
    }

    public void setNotificationMessage(String notificationMessage) {
        this.notificationMessage = notificationMessage;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }
}