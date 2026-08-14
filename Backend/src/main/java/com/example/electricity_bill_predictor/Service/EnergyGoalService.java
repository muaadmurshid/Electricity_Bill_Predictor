package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.EnergyGoal;
import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Repository.EnergyGoalRepository;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnergyGoalService {

    private final EnergyGoalRepository energyGoalRepository;
    private final HouseholdRepository householdRepository;

    public EnergyGoalService(
            EnergyGoalRepository energyGoalRepository,
            HouseholdRepository householdRepository) {

        this.energyGoalRepository = energyGoalRepository;
        this.householdRepository = householdRepository;
    }

    // GET ALL ENERGY GOALS
    public List<EnergyGoal> getAllGoals() {
        return energyGoalRepository.findAll();
    }

    // GET ENERGY GOAL BY ID
    public EnergyGoal getEnergyGoalById(Long id) {

        return energyGoalRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Energy goal not found with id: " + id
                        )
                );
    }

    // CREATE ENERGY GOAL
    public EnergyGoal createGoal(EnergyGoal goal) {

        Long householdId =
                goal.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        goal.setHousehold(household);

        return energyGoalRepository.saveAndFlush(goal);
    }

    // UPDATE ENERGY GOAL
    public EnergyGoal updateGoal(
            Long id,
            EnergyGoal goal) {

        EnergyGoal existingGoal =
                energyGoalRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Energy goal not found with id: " + id
                                )
                        );

        Long householdId =
                goal.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        existingGoal.setHousehold(household);
        existingGoal.setGoalName(goal.getGoalName());
        existingGoal.setGoalType(goal.getGoalType());
        existingGoal.setTargetValue(goal.getTargetValue());
        existingGoal.setStartDate(goal.getStartDate());
        existingGoal.setEndDate(goal.getEndDate());
        existingGoal.setCurrentValue(goal.getCurrentValue());
        existingGoal.setStatus(goal.getStatus());

        return energyGoalRepository.saveAndFlush(existingGoal);
    }

    // DELETE ENERGY GOAL
    public void deleteGoal(Long id) {

        EnergyGoal existingGoal =
                energyGoalRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Energy goal not found with id: " + id
                                )
                        );

        energyGoalRepository.delete(existingGoal);
    }
}