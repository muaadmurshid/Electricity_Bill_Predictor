package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.EnergyGoal;
import com.example.electricity_bill_predictor.Entity.Household;

import com.example.electricity_bill_predictor.Repository.EnergyGoalRepository;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;

import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class EnergyGoalService {

    private final EnergyGoalRepository energyGoalRepository;
    private final HouseholdRepository householdRepository;
    private final CurrentUserService currentUserService;

    public EnergyGoalService(
            EnergyGoalRepository energyGoalRepository,
            HouseholdRepository householdRepository,
            CurrentUserService currentUserService) {

        this.energyGoalRepository = energyGoalRepository;
        this.householdRepository = householdRepository;
        this.currentUserService = currentUserService;
    }

    // GET ALL GOALS FOR CURRENT USER
    public List<EnergyGoal> getAllGoals() {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        return energyGoalRepository
                .findByHouseholdUserUserIdOrderByCreatedDateDesc(
                        currentUserId
                );
    }

    // GET GOAL BY ID
    public EnergyGoal getEnergyGoalById(
            Long id) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        EnergyGoal goal =
                energyGoalRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Energy goal not found with id: "
                                                + id
                                )
                        );

        validateGoalOwnership(
                goal,
                currentUserId
        );

        return goal;
    }

    // GET GOALS FOR ONE HOUSEHOLD
    public List<EnergyGoal> getGoalsByHousehold(
            Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        return energyGoalRepository
                .findByHouseholdHouseholdIdOrderByCreatedDateDesc(
                        householdId
                );
    }

    // CREATE GOAL
    public EnergyGoal createGoal(
            EnergyGoal goal) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        if (goal.getHousehold() == null ||
                goal.getHousehold().getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        Long householdId =
                goal.getHousehold().getHouseholdId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        validateGoal(goal);

        goal.setHousehold(household);

        if (goal.getCurrentValue() == null) {
            goal.setCurrentValue(
                    BigDecimal.ZERO
            );
        }

        if (goal.getStatus() == null ||
                goal.getStatus().isBlank()) {

            goal.setStatus(
                    "ON_TRACK"
            );
        }

        return energyGoalRepository.saveAndFlush(
                goal
        );
    }

    // UPDATE GOAL
    public EnergyGoal updateGoal(
            Long id,
            EnergyGoal goalDetails) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        EnergyGoal existingGoal =
                energyGoalRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Energy goal not found with id: "
                                                + id
                                )
                        );

        validateGoalOwnership(
                existingGoal,
                currentUserId
        );

        if (goalDetails.getHousehold() == null ||
                goalDetails.getHousehold().getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        Long householdId =
                goalDetails.getHousehold().getHouseholdId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        validateGoal(
                goalDetails
        );

        existingGoal.setHousehold(
                household
        );

        existingGoal.setGoalName(
                goalDetails.getGoalName()
        );

        existingGoal.setGoalType(
                goalDetails.getGoalType()
        );

        existingGoal.setTargetValue(
                goalDetails.getTargetValue()
        );

        existingGoal.setStartDate(
                goalDetails.getStartDate()
        );

        existingGoal.setEndDate(
                goalDetails.getEndDate()
        );

        existingGoal.setCurrentValue(
                goalDetails.getCurrentValue()
        );

        existingGoal.setStatus(
                goalDetails.getStatus()
        );

        return energyGoalRepository.saveAndFlush(
                existingGoal
        );
    }

    // AUTOMATIC GOAL PROGRESS UPDATE
    public EnergyGoal updateGoalProgress(
            Long goalId,
            BigDecimal currentValue) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        if (currentValue == null ||
                currentValue.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Current value must be zero or greater"
            );
        }

        EnergyGoal goal =
                energyGoalRepository.findById(goalId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Energy goal not found with id: "
                                                + goalId
                                )
                        );

        validateGoalOwnership(
                goal,
                currentUserId
        );

        goal.setCurrentValue(
                currentValue
        );

        BigDecimal targetValue =
                goal.getTargetValue();

        LocalDate today =
                LocalDate.now();

        if (today.isAfter(goal.getEndDate())) {

            if (currentValue.compareTo(targetValue) <= 0) {
                goal.setStatus("ACHIEVED");
            } else {
                goal.setStatus("MISSED");
            }

        } else {

            if (currentValue.compareTo(targetValue) <= 0) {
                goal.setStatus("ON_TRACK");
            } else {
                goal.setStatus("AT_RISK");
            }
        }

        return energyGoalRepository.saveAndFlush(
                goal
        );
    }

    // GET ACTIVE GOALS FOR HOUSEHOLD
    public List<EnergyGoal> getActiveGoals(
            Long householdId,
            LocalDate date) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        return energyGoalRepository
                .findByHouseholdHouseholdIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        householdId,
                        date,
                        date
                );
    }

    // DELETE GOAL
    public void deleteGoal(
            Long id) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        EnergyGoal existingGoal =
                energyGoalRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Energy goal not found with id: "
                                                + id
                                )
                        );

        validateGoalOwnership(
                existingGoal,
                currentUserId
        );

        energyGoalRepository.delete(
                existingGoal
        );
    }

    // VALIDATE GOAL
    private void validateGoal(
            EnergyGoal goal) {

        if (goal.getTargetValue() == null ||
                goal.getTargetValue()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Target value must be zero or greater"
            );
        }

        if (goal.getStartDate() == null ||
                goal.getEndDate() == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (goal.getEndDate()
                .isBefore(goal.getStartDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }
    }

    // HOUSEHOLD OWNERSHIP
    private Household getOwnedHousehold(
            Long householdId,
            Long currentUserId) {

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        if (household.getUser() == null ||
                household.getUser().getUserId() == null ||
                !household.getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Household not found with id: "
                            + householdId
            );
        }

        return household;
    }

    // GOAL OWNERSHIP
    private void validateGoalOwnership(
            EnergyGoal goal,
            Long currentUserId) {

        if (goal.getHousehold() == null ||
                goal.getHousehold().getUser() == null ||
                goal.getHousehold()
                        .getUser()
                        .getUserId() == null ||
                !goal.getHousehold()
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Energy goal not found with id: "
                            + goal.getGoalId()
            );
        }
    }
}