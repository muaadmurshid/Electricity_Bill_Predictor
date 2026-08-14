package com.example.electricity_bill_predictor.Controller;

import jakarta.validation.Valid;

import com.example.electricity_bill_predictor.Entity.Notification;
import com.example.electricity_bill_predictor.Service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // GET /api/notifications
    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    // GET /api/notifications/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(
            @PathVariable Long id) {

        Notification notification =
                notificationService.getNotificationById(id);

        return ResponseEntity.ok(notification);
    }

    // POST /api/notifications
    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @Valid @RequestBody Notification notification) {

        Notification createdNotification =
                notificationService.createNotification(notification);

        return ResponseEntity.ok(createdNotification);
    }

    // PUT /api/notifications/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Notification> updateNotification(
            @PathVariable Long id,
            @Valid @RequestBody Notification notification) {

        Notification updatedNotification =
                notificationService.updateNotification(
                        id,
                        notification
                );

        return ResponseEntity.ok(updatedNotification);
    }

    // DELETE /api/notifications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id) {

        notificationService.deleteNotification(id);

        return ResponseEntity.noContent().build();
    }
}