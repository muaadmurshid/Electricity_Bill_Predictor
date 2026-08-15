package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // Existing:
    // Get all notifications for a household
    List<Notification>
    findByHouseholdHouseholdIdOrderByCreatedDateDesc(
            Long householdId
    );

    // Existing:
    // Get unread notifications for a household
    List<Notification>
    findByHouseholdHouseholdIdAndIsReadFalseOrderByCreatedDateDesc(
            Long householdId
    );

    // Existing:
    // Count unread notifications
    long countByHouseholdHouseholdIdAndIsReadFalse(
            Long householdId
    );

    // NEW:
    // Get notifications belonging only to current user
    List<Notification>
    findByHouseholdUserUserIdOrderByCreatedDateDesc(
            Long userId
    );
}