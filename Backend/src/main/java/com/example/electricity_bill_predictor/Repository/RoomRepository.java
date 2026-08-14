package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {

}