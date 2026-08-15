package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Household;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HouseholdRepository
        extends JpaRepository<Household, Long> {

    List<Household> findByUserUserId(Long userId);
}