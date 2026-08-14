package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendationRepository
        extends JpaRepository<Recommendation, Long> {

}