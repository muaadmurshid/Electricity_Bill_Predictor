package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Budget;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository
        extends JpaRepository<Budget, Long> {

    // Existing:
    // Get all budgets for one household
    List<Budget>
    findByHouseholdHouseholdIdOrderByBudgetYearDescBudgetMonthDesc(
            Long householdId
    );

    // Existing:
    // Get budget for specific household/month/year
    Optional<Budget>
    findByHouseholdHouseholdIdAndBudgetYearAndBudgetMonth(
            Long householdId,
            Integer budgetYear,
            Integer budgetMonth
    );

    // Existing:
    // Prevent duplicate budget
    boolean
    existsByHouseholdHouseholdIdAndBudgetYearAndBudgetMonth(
            Long householdId,
            Integer budgetYear,
            Integer budgetMonth
    );

    // NEW:
    // Return only budgets belonging to current user
    List<Budget>
    findByHouseholdUserUserIdOrderByBudgetYearDescBudgetMonthDesc(
            Long userId
    );
}