package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Household;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HouseholdRepository extends JpaRepository<Household, Long> {

}