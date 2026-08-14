package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Appliance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplianceRepository
        extends JpaRepository<Appliance, Long> {

    List<Appliance> findByRoomHouseholdHouseholdId(
            Long householdId
    );
}