package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Appliance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplianceRepository
        extends JpaRepository<Appliance, Long> {

    // Existing method - keep for analytics / ML use
    List<Appliance> findByRoomHouseholdHouseholdId(
            Long householdId
    );

    // Get all appliances belonging to current user
    List<Appliance> findByRoomHouseholdUserUserId(
            Long userId
    );

    // Get appliances from one room owned by current user
    List<Appliance>
    findByRoomRoomIdAndRoomHouseholdUserUserId(
            Long roomId,
            Long userId
    );
}