package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.Entity.EnergyGoal;
import com.example.electricity_bill_predictor.Service.EnergyGoalService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/energy-goals")
public class EnergyGoalController {

    private final EnergyGoalService energyGoalService;

    public EnergyGoalController(
            EnergyGoalService energyGoalService) {

        this.energyGoalService =
                energyGoalService;
    }

    // GET current user's goals
    @GetMapping
    public ResponseEntity<List<EnergyGoal>>
    getAllGoals() {

        return ResponseEntity.ok(
                energyGoalService.getAllGoals()
        );
    }

    // GET goal by ID
    @GetMapping("/{id}")
    public ResponseEntity<EnergyGoal>
    getEnergyGoalById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                energyGoalService
                        .getEnergyGoalById(id)
        );
    }

    // GET goals for household
    @GetMapping("/household/{householdId}")
    public ResponseEntity<List<EnergyGoal>>
    getGoalsByHousehold(
            @PathVariable Long householdId) {

        return ResponseEntity.ok(
                energyGoalService
                        .getGoalsByHousehold(
                                householdId
                        )
        );
    }

    // CREATE goal
    @PostMapping
    public ResponseEntity<EnergyGoal>
    createGoal(
            @Valid
            @RequestBody
            EnergyGoal goal) {

        return ResponseEntity.ok(
                energyGoalService.createGoal(
                        goal
                )
        );
    }

    // UPDATE goal
    @PutMapping("/{id}")
    public ResponseEntity<EnergyGoal>
    updateGoal(
            @PathVariable Long id,
            @Valid
            @RequestBody
            EnergyGoal goal) {

        return ResponseEntity.ok(
                energyGoalService.updateGoal(
                        id,
                        goal
                )
        );
    }

    // DELETE goal
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteGoal(
            @PathVariable Long id) {

        energyGoalService.deleteGoal(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}