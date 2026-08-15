package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Entity.Notification;

import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.Repository.NotificationRepository;

import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final HouseholdRepository householdRepository;
    private final CurrentUserService currentUserService;

    public NotificationService(
            NotificationRepository notificationRepository,
            HouseholdRepository householdRepository,
            CurrentUserService currentUserService) {

        this.notificationRepository =
                notificationRepository;

        this.householdRepository =
                householdRepository;

        this.currentUserService =
                currentUserService;
    }

    // =========================================================
    // GET ALL NOTIFICATIONS FOR CURRENT USER
    // =========================================================
    public List<Notification> getAllNotifications() {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        return notificationRepository
                .findByHouseholdUserUserIdOrderByCreatedDateDesc(
                        currentUserId
                );
    }

    // =========================================================
    // GET NOTIFICATION BY ID
    // =========================================================
    public Notification getNotificationById(
            Long notificationId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found with id: "
                                                + notificationId
                                )
                        );

        validateNotificationOwnership(
                notification,
                currentUserId
        );

        return notification;
    }

    // =========================================================
    // GET ALL NOTIFICATIONS FOR HOUSEHOLD
    // =========================================================
    public List<Notification> getNotificationsByHousehold(
            Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        return notificationRepository
                .findByHouseholdHouseholdIdOrderByCreatedDateDesc(
                        householdId
                );
    }

    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================
    public List<Notification> getUnreadNotificationsByHousehold(
            Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        return notificationRepository
                .findByHouseholdHouseholdIdAndIsReadFalseOrderByCreatedDateDesc(
                        householdId
                );
    }

    // =========================================================
    // COUNT UNREAD NOTIFICATIONS
    // =========================================================
    public long countUnreadNotifications(
            Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        return notificationRepository
                .countByHouseholdHouseholdIdAndIsReadFalse(
                        householdId
                );
    }

    // =========================================================
    // CREATE NOTIFICATION MANUALLY
    // =========================================================
    public Notification createNotification(
            Notification notification) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        if (notification.getHousehold() == null ||
                notification
                        .getHousehold()
                        .getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        Long householdId =
                notification
                        .getHousehold()
                        .getHouseholdId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        notification.setHousehold(
                household
        );

        if (notification.getIsRead() == null) {

            notification.setIsRead(
                    false
            );
        }

        return notificationRepository.save(
                notification
        );
    }

    // =========================================================
    // CREATE AUTOMATIC SYSTEM NOTIFICATION
    // Used by Budget / Energy Goal workflows
    // =========================================================
    public Notification createAutomaticNotification(
            Long householdId,
            String title,
            String message,
            String type) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        if (title == null ||
                title.isBlank()) {

            throw new IllegalArgumentException(
                    "Notification title is required"
            );
        }

        if (message == null ||
                message.isBlank()) {

            throw new IllegalArgumentException(
                    "Notification message is required"
            );
        }

        if (type == null ||
                type.isBlank()) {

            throw new IllegalArgumentException(
                    "Notification type is required"
            );
        }

        Notification notification =
                new Notification();

        notification.setHousehold(
                household
        );

        notification.setNotificationTitle(
                title
        );

        notification.setNotificationMessage(
                message
        );

        notification.setNotificationType(
                type
        );

        notification.setIsRead(
                false
        );

        return notificationRepository.save(
                notification
        );
    }

    // =========================================================
    // MARK AS READ
    // =========================================================
    public Notification markAsRead(
            Long notificationId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found with id: "
                                                + notificationId
                                )
                        );

        validateNotificationOwnership(
                notification,
                currentUserId
        );

        notification.setIsRead(
                true
        );

        return notificationRepository.save(
                notification
        );
    }

    // =========================================================
    // MARK AS UNREAD
    // =========================================================
    public Notification markAsUnread(
            Long notificationId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found with id: "
                                                + notificationId
                                )
                        );

        validateNotificationOwnership(
                notification,
                currentUserId
        );

        notification.setIsRead(
                false
        );

        return notificationRepository.save(
                notification
        );
    }

    // =========================================================
    // UPDATE NOTIFICATION
    // =========================================================
    public Notification updateNotification(
            Long notificationId,
            Notification notificationDetails) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Notification existingNotification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found with id: "
                                                + notificationId
                                )
                        );

        validateNotificationOwnership(
                existingNotification,
                currentUserId
        );

        if (notificationDetails.getHousehold() == null ||
                notificationDetails
                        .getHousehold()
                        .getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        Long householdId =
                notificationDetails
                        .getHousehold()
                        .getHouseholdId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        existingNotification.setHousehold(
                household
        );

        existingNotification.setNotificationTitle(
                notificationDetails.getNotificationTitle()
        );

        existingNotification.setNotificationMessage(
                notificationDetails.getNotificationMessage()
        );

        existingNotification.setNotificationType(
                notificationDetails.getNotificationType()
        );

        existingNotification.setIsRead(
                notificationDetails.getIsRead()
        );

        return notificationRepository.save(
                existingNotification
        );
    }

    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================
    public void deleteNotification(
            Long notificationId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Notification existingNotification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found with id: "
                                                + notificationId
                                )
                        );

        validateNotificationOwnership(
                existingNotification,
                currentUserId
        );

        notificationRepository.delete(
                existingNotification
        );
    }

    // =========================================================
    // VERIFY HOUSEHOLD OWNERSHIP
    // =========================================================
    private Household getOwnedHousehold(
            Long householdId,
            Long currentUserId) {

        Household household =
                householdRepository
                        .findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        if (household.getUser() == null ||
                household
                        .getUser()
                        .getUserId() == null ||
                !household
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Household not found with id: "
                            + householdId
            );
        }

        return household;
    }

    // =========================================================
    // VERIFY NOTIFICATION OWNERSHIP
    // =========================================================
    private void validateNotificationOwnership(
            Notification notification,
            Long currentUserId) {

        if (notification.getHousehold() == null ||
                notification
                        .getHousehold()
                        .getUser() == null ||
                notification
                        .getHousehold()
                        .getUser()
                        .getUserId() == null ||
                !notification
                        .getHousehold()
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Notification not found with id: "
                            + notification.getNotificationId()
            );
        }
    }
}