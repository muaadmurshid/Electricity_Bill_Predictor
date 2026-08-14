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

    public NotificationService(
            NotificationRepository notificationRepository,
            HouseholdRepository householdRepository) {

        this.notificationRepository = notificationRepository;
        this.householdRepository = householdRepository;
    }

    // Get all notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Get notification by ID
    public Notification getNotificationById(Long id) {

        return notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Notification not found with id: " + id
                        )
                );
    }

    // Create notification
    public Notification createNotification(Notification notification) {

        Long householdId =
                notification.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        notification.setHousehold(household);

        return notificationRepository.save(notification);
    }

    // Update notification
    public Notification updateNotification(
            Long notificationId,
            Notification notificationDetails) {

        Notification existingNotification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found with id: "
                                                + notificationId
                                )
                        );

        Long householdId =
                notificationDetails.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        existingNotification.setHousehold(household);

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

        return notificationRepository.save(existingNotification);
    }

    // Delete notification
    public void deleteNotification(Long notificationId) {

        Notification existingNotification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found with id: "
                                                + notificationId
                                )
                        );

        notificationRepository.delete(existingNotification);
    }
}