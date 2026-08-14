package com.example.electricity_bill_predictor.Controller;

import jakarta.validation.Valid;

import com.example.electricity_bill_predictor.Entity.Budget;
import com.example.electricity_bill_predictor.Service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    // GET /api/budgets
    @GetMapping
    public List<Budget> getAllBudgets() {
        return budgetService.getAllBudgets();
    }

    // GET /api/budgets/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(
            @PathVariable Long id) {

        Budget budget = budgetService.getBudgetById(id);

        return ResponseEntity.ok(budget);
    }

    // POST /api/budgets
    @PostMapping
    public ResponseEntity<Budget> createBudget(
            @Valid @RequestBody Budget budget) {

        Budget createdBudget =
                budgetService.createBudget(budget);

        return ResponseEntity.ok(createdBudget);
    }

    // PUT /api/budgets/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody Budget budget) {

        try {
            Budget updatedBudget =
                    budgetService.updateBudget(id, budget);

            return ResponseEntity.ok(updatedBudget);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/budgets/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id) {

        try {
            budgetService.deleteBudget(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}