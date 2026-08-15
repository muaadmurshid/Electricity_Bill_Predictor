package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.BillPrediction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillPredictionRepository
        extends JpaRepository<BillPrediction, Long> {

    // Existing:
    // Complete history for household
    List<BillPrediction>
    findByHouseholdHouseholdIdOrderByPredictionDateDesc(
            Long householdId
    );

    // Existing:
    // Latest prediction for household
    Optional<BillPrediction>
    findFirstByHouseholdHouseholdIdOrderByPredictionDateDescPredictionIdDesc(
            Long householdId
    );

    // NEW:
    // All predictions belonging to current user
    List<BillPrediction>
    findByHouseholdUserUserIdOrderByPredictionDateDesc(
            Long userId
    );
}