package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.ApplianceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplianceCategoryRepository
        extends JpaRepository<ApplianceCategory, Long> {

}