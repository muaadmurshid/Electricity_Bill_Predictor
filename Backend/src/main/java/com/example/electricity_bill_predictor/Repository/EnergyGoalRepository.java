package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.EnergyGoal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EnergyGoalRepository
        extends JpaRepository<EnergyGoal, Long> {

    // Existing: goals for one household
    List<EnergyGoal>
    findByHouseholdHouseholdIdOrderByCreatedDateDesc(
            Long householdId
    );

    // Existing: active goals for one household/date
    List<EnergyGoal>
    findByHouseholdHouseholdIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long householdId,
            LocalDate date1,
            LocalDate date2
    );

    // NEW: all goals belonging to current user
    List<EnergyGoal>
    findByHouseholdUserUserIdOrderByCreatedDateDesc(
            Long userId
    );
}