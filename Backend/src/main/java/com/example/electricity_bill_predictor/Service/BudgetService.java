package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.Budget;
import com.example.electricity_bill_predictor.Entity.Household;

import com.example.electricity_bill_predictor.Repository.BudgetRepository;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;

import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final HouseholdRepository householdRepository;
    private final CurrentUserService currentUserService;

    public BudgetService(
            BudgetRepository budgetRepository,
            HouseholdRepository householdRepository,
            CurrentUserService currentUserService) {

        this.budgetRepository =
                budgetRepository;

        this.householdRepository =
                householdRepository;

        this.currentUserService =
                currentUserService;
    }

    // =========================================================
    // GET ALL BUDGETS FOR CURRENT USER
    // =========================================================
    public List<Budget> getAllBudgets() {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        return budgetRepository
                .findByHouseholdUserUserIdOrderByBudgetYearDescBudgetMonthDesc(
                        currentUserId
                );
    }

    // =========================================================
    // GET BUDGET BY ID
    // =========================================================
    public Budget getBudgetById(
            Long budgetId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Budget budget =
                budgetRepository.findById(budgetId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Budget not found with id: "
                                                + budgetId
                                )
                        );

        validateBudgetOwnership(
                budget,
                currentUserId
        );

        return budget;
    }

    // =========================================================
    // CREATE BUDGET
    // =========================================================
    public Budget createBudget(
            Budget budget) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        if (budget.getHousehold() == null ||
                budget
                        .getHousehold()
                        .getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        Long householdId =
                budget
                        .getHousehold()
                        .getHouseholdId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        validateWarningThreshold(
                budget.getWarningThreshold()
        );

        boolean budgetExists =
                budgetRepository
                        .existsByHouseholdHouseholdIdAndBudgetYearAndBudgetMonth(
                                householdId,
                                budget.getBudgetYear(),
                                budget.getBudgetMonth()
                        );

        if (budgetExists) {

            throw new IllegalArgumentException(
                    "A budget already exists for household "
                            + householdId
                            + " for "
                            + budget.getBudgetYear()
                            + "-"
                            + budget.getBudgetMonth()
            );
        }

        budget.setHousehold(
                household
        );

        if (budget.getCurrentEstimatedAmount() == null) {

            budget.setCurrentEstimatedAmount(
                    BigDecimal.ZERO
            );
        }

        if (budget.getStatus() == null ||
                budget.getStatus().isBlank()) {

            budget.setStatus(
                    "ACTIVE"
            );
        }

        return budgetRepository.save(
                budget
        );
    }

    // =========================================================
    // UPDATE BUDGET
    // =========================================================
    public Budget updateBudget(
            Long budgetId,
            Budget budgetDetails) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Budget existingBudget =
                budgetRepository.findById(budgetId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Budget not found with id: "
                                                + budgetId
                                )
                        );

        validateBudgetOwnership(
                existingBudget,
                currentUserId
        );

        if (budgetDetails.getHousehold() == null ||
                budgetDetails
                        .getHousehold()
                        .getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        Long householdId =
                budgetDetails
                        .getHousehold()
                        .getHouseholdId();

        // New household must also belong to current user
        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        validateWarningThreshold(
                budgetDetails.getWarningThreshold()
        );

        /*
         * If month/year changes, make sure another
         * budget does not already exist for that period.
         */
        boolean periodChanged =
                !existingBudget
                        .getHousehold()
                        .getHouseholdId()
                        .equals(householdId)
                        ||
                        !existingBudget
                                .getBudgetYear()
                                .equals(budgetDetails.getBudgetYear())
                        ||
                        !existingBudget
                                .getBudgetMonth()
                                .equals(budgetDetails.getBudgetMonth());

        if (periodChanged) {

            boolean budgetExists =
                    budgetRepository
                            .existsByHouseholdHouseholdIdAndBudgetYearAndBudgetMonth(
                                    householdId,
                                    budgetDetails.getBudgetYear(),
                                    budgetDetails.getBudgetMonth()
                            );

            if (budgetExists) {

                throw new IllegalArgumentException(
                        "A budget already exists for household "
                                + householdId
                                + " for "
                                + budgetDetails.getBudgetYear()
                                + "-"
                                + budgetDetails.getBudgetMonth()
                );
            }
        }

        existingBudget.setHousehold(
                household
        );

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

        return budgetRepository.save(
                existingBudget
        );
    }

    // =========================================================
    // AUTOMATIC UPDATE USING PREDICTED BILL
    // Called from prediction workflow
    // =========================================================
    public Budget updateBudgetStatus(
            Long householdId,
            Integer year,
            Integer month,
            BigDecimal predictedBillAmount) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        // Prevent prediction workflow from updating
        // another user's household budget
        getOwnedHousehold(
                householdId,
                currentUserId
        );

        if (predictedBillAmount == null ||
                predictedBillAmount.compareTo(
                        BigDecimal.ZERO
                ) < 0) {

            throw new IllegalArgumentException(
                    "Predicted bill amount must be zero or greater"
            );
        }

        Budget budget =
                budgetRepository
                        .findByHouseholdHouseholdIdAndBudgetYearAndBudgetMonth(
                                householdId,
                                year,
                                month
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Budget not found for household "
                                                + householdId
                                                + " for "
                                                + year
                                                + "-"
                                                + month
                                )
                        );

        validateBudgetOwnership(
                budget,
                currentUserId
        );

        budget.setCurrentEstimatedAmount(
                predictedBillAmount
        );

        BigDecimal budgetAmount =
                budget.getBudgetAmount();

        BigDecimal warningThreshold =
                budget.getWarningThreshold();

        validateWarningThreshold(
                warningThreshold
        );

        if (predictedBillAmount.compareTo(
                budgetAmount
        ) > 0) {

            budget.setStatus(
                    "OVER_BUDGET"
            );

        } else {

            BigDecimal warningLimit =
                    budgetAmount
                            .multiply(
                                    warningThreshold
                            )
                            .divide(
                                    BigDecimal.valueOf(100)
                            );

            if (predictedBillAmount.compareTo(
                    warningLimit
            ) >= 0) {

                budget.setStatus(
                        "WARNING"
                );

            } else {

                budget.setStatus(
                        "WITHIN_BUDGET"
                );
            }
        }

        return budgetRepository.save(
                budget
        );
    }

    // =========================================================
    // DELETE BUDGET
    // =========================================================
    public void deleteBudget(
            Long budgetId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Budget existingBudget =
                budgetRepository.findById(budgetId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Budget not found with id: "
                                                + budgetId
                                )
                        );

        validateBudgetOwnership(
                existingBudget,
                currentUserId
        );

        budgetRepository.delete(
                existingBudget
        );
    }

    // =========================================================
    // VERIFY HOUSEHOLD OWNERSHIP
    // =========================================================
    private Household getOwnedHousehold(
            Long householdId,
            Long currentUserId) {

        Household household =
                householdRepository
                        .findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        if (household.getUser() == null ||
                household
                        .getUser()
                        .getUserId() == null ||
                !household
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Household not found with id: "
                            + householdId
            );
        }

        return household;
    }

    // =========================================================
    // VERIFY BUDGET OWNERSHIP
    // =========================================================
    private void validateBudgetOwnership(
            Budget budget,
            Long currentUserId) {

        if (budget.getHousehold() == null ||
                budget
                        .getHousehold()
                        .getUser() == null ||
                budget
                        .getHousehold()
                        .getUser()
                        .getUserId() == null ||
                !budget
                        .getHousehold()
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Budget not found with id: "
                            + budget.getBudgetId()
            );
        }
    }

    // =========================================================
    // WARNING THRESHOLD VALIDATION
    // =========================================================
    private void validateWarningThreshold(
            BigDecimal warningThreshold) {

        if (warningThreshold == null) {

            throw new IllegalArgumentException(
                    "Warning threshold is required"
            );
        }

        if (warningThreshold.compareTo(
                BigDecimal.ZERO
        ) < 0 ||
                warningThreshold.compareTo(
                        BigDecimal.valueOf(100)
                ) > 0) {

            throw new IllegalArgumentException(
                    "Warning threshold must be between 0 and 100"
            );
        }
    }
}