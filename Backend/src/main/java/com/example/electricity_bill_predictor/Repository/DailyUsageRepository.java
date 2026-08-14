package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.DailyUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DailyUsageRepository
        extends JpaRepository<DailyUsage, Long> {

    List<DailyUsage>
    findByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate
    );

    boolean existsByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate
    );
}