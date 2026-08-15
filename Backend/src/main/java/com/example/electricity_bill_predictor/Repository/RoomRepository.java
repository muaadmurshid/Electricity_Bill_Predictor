package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHouseholdUserUserId(Long userId);

    List<Room> findByHouseholdHouseholdIdAndHouseholdUserUserId(
            Long householdId,
            Long userId
    );
}