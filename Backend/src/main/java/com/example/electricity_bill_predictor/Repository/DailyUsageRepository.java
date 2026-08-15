package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.DailyUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyUsageRepository
        extends JpaRepository<DailyUsage, Long> {

    // Existing method used by analytics
    List<DailyUsage>
    findByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate
    );

    // Existing method
    boolean
    existsByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate
    );

    // NEW:
    // Return only daily usage records belonging
    // to the currently logged-in user
    List<DailyUsage>
    findByApplianceRoomHouseholdUserUserId(
            Long userId
    );
}