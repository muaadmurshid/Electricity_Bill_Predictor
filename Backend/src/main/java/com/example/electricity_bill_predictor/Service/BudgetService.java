package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.Budget;
import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Repository.BudgetRepository;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final HouseholdRepository householdRepository;

    public BudgetService(
            BudgetRepository budgetRepository,
            HouseholdRepository householdRepository) {

        this.budgetRepository = budgetRepository;
        this.householdRepository = householdRepository;
    }

    // Get all budgets
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    // Get budget by ID
    public Budget getBudgetById(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Budget not found with id: " + id
                        )
                );
    }

    // Create budget
    public Budget createBudget(Budget budget) {

        Long householdId =
                budget.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        budget.setHousehold(household);

        return budgetRepository.save(budget);
    }

    // Update budget
    public Budget updateBudget(
            Long budgetId,
            Budget budgetDetails) {

        Budget existingBudget =
                budgetRepository.findById(budgetId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Budget not found with id: "
                                                + budgetId
                                )
                        );

        Long householdId =
                budgetDetails.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        existingBudget.setHousehold(household);

        existingBudget.setBudgetMonth(
                budgetDetails.getBudgetMonth()
        );

        existingBudget.setBudgetYear(
                budgetDetails.getBudgetYear()
        );

        existingBudget.setBudgetAmount(
                budgetDetails.getBudgetAmount()
        );

        existingBudget.setWarningThreshold(
                budgetDetails.getWarningThreshold()
        );

        existingBudget.setCurrentEstimatedAmount(
                budgetDetails.getCurrentEstimatedAmount()
        );

        existingBudget.setStatus(
                budgetDetails.getStatus()
        );

        return budgetRepository.save(existingBudget);
    }

    // Delete budget
    public void deleteBudget(Long budgetId) {

        Budget existingBudget =
                budgetRepository.findById(budgetId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Budget not found with id: "
                                                + budgetId
                                )
                        );

        budgetRepository.delete(existingBudget);
    }
}