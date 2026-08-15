package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Recommendation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository
        extends JpaRepository<Recommendation, Long> {

    // Existing: recommendation history for household
    List<Recommendation>
    findByHouseholdHouseholdIdOrderByCreatedDateDesc(
            Long householdId
    );

    // NEW: recommendations belonging only to current user
    List<Recommendation>
    findByHouseholdUserUserIdOrderByCreatedDateDesc(
            Long userId
    );
}