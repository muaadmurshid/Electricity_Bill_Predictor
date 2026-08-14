package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

}