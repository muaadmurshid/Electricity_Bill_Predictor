package com.example.electricity_bill_predictor.Controller;

import jakarta.validation.Valid;
import com.example.electricity_bill_predictor.Entity.EnergyGoal;
import com.example.electricity_bill_predictor.Service.EnergyGoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/energy-goals")
@CrossOrigin(origins = "*")
public class EnergyGoalController {

    private final EnergyGoalService energyGoalService;

    public EnergyGoalController(EnergyGoalService energyGoalService) {
        this.energyGoalService = energyGoalService;
    }

    // GET /api/energy-goals
    @GetMapping
    public List<EnergyGoal> getAllGoals() {
        return energyGoalService.getAllGoals();
    }

    // GET /api/energy-goals/{id}
    @GetMapping("/{id}")
    public ResponseEntity<EnergyGoal> getEnergyGoalById(
            @PathVariable Long id) {

        EnergyGoal energyGoal =
                energyGoalService.getEnergyGoalById(id);

        return ResponseEntity.ok(energyGoal);
    }

    // POST /api/energy-goals
    @PostMapping
    public ResponseEntity<EnergyGoal> createGoal(
            @Valid @RequestBody EnergyGoal goal) {

        EnergyGoal createdGoal =
                energyGoalService.createGoal(goal);

        return ResponseEntity.ok(createdGoal);
    }

    // PUT /api/energy-goals/{id}
    @PutMapping("/{id}")
    public ResponseEntity<EnergyGoal> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody EnergyGoal goal) {

        EnergyGoal updatedGoal =
                energyGoalService.updateGoal(id, goal);

        return ResponseEntity.ok(updatedGoal);
    }

    // DELETE /api/energy-goals/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Long id) {

        energyGoalService.deleteGoal(id);

        return ResponseEntity.noContent().build();
    }
}