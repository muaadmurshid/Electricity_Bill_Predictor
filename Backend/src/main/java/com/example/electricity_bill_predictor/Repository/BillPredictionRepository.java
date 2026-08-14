package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.BillPrediction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillPredictionRepository
        extends JpaRepository<BillPrediction, Long> {

}