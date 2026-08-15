package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.ElectricityBill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElectricityBillRepository
        extends JpaRepository<ElectricityBill, Long> {

    // Return bills belonging only to current user
    List<ElectricityBill>
    findByHouseholdUserUserIdOrderByBillDateDesc(
            Long userId
    );

    // Return bills for one household owned by current user
    List<ElectricityBill>
    findByHouseholdHouseholdIdAndHouseholdUserUserIdOrderByBillDateDesc(
            Long householdId,
            Long userId
    );
}