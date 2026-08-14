package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

}