package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.ElectricityBill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ElectricityBillRepository
        extends JpaRepository<ElectricityBill, Long> {

}