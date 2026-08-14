package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.EnergyGoal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnergyGoalRepository extends JpaRepository<EnergyGoal, Long> {

}