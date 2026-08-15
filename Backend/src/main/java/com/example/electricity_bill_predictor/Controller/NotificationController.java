package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.Entity.Notification;
import com.example.electricity_bill_predictor.Service.NotificationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    // GET /api/notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {

        List<Notification> notifications =
                notificationService.getAllNotifications();

        return ResponseEntity.ok(notifications);
    }

    // GET /api/notifications/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(
            @PathVariable Long id) {

        Notification notification =
                notificationService.getNotificationById(id);

        return ResponseEntity.ok(notification);
    }

    // GET /api/notifications/household/{householdId}
    @GetMapping("/household/{householdId}")
    public ResponseEntity<List<Notification>>
    getNotificationsByHousehold(
            @PathVariable Long householdId) {

        List<Notification> notifications =
                notificationService
                        .getNotificationsByHousehold(
                                householdId
                        );

        return ResponseEntity.ok(notifications);
    }

    // GET /api/notifications/household/{householdId}/unread
    @GetMapping("/household/{householdId}/unread")
    public ResponseEntity<List<Notification>>
    getUnreadNotificationsByHousehold(
            @PathVariable Long householdId) {

        List<Notification> notifications =
                notificationService
                        .getUnreadNotificationsByHousehold(
                                householdId
                        );

        return ResponseEntity.ok(notifications);
    }

    // GET /api/notifications/household/{householdId}/unread-count
    @GetMapping("/household/{householdId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @PathVariable Long householdId) {

        long unreadCount =
                notificationService
                        .countUnreadNotifications(
                                householdId
                        );

        return ResponseEntity.ok(
                Map.of(
                        "unreadCount",
                        unreadCount
                )
        );
    }

    // POST /api/notifications
    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @Valid @RequestBody Notification notification) {

        Notification createdNotification =
                notificationService
                        .createNotification(
                                notification
                        );

        return ResponseEntity.ok(
                createdNotification
        );
    }

    // PUT /api/notifications/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Notification> updateNotification(
            @PathVariable Long id,
            @Valid @RequestBody Notification notification) {

        Notification updatedNotification =
                notificationService
                        .updateNotification(
                                id,
                                notification
                        );

        return ResponseEntity.ok(
                updatedNotification
        );
    }

    // PUT /api/notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id) {

        Notification notification =
                notificationService.markAsRead(id);

        return ResponseEntity.ok(notification);
    }

    // PUT /api/notifications/{id}/unread
    @PutMapping("/{id}/unread")
    public ResponseEntity<Notification> markAsUnread(
            @PathVariable Long id) {

        Notification notification =
                notificationService.markAsUnread(id);

        return ResponseEntity.ok(notification);
    }

    // DELETE /api/notifications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id) {

        notificationService.deleteNotification(id);

        return ResponseEntity.noContent().build();
    }
}