package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.Entity.Budget;
import com.example.electricity_bill_predictor.Service.BudgetService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(
            BudgetService budgetService) {

        this.budgetService =
                budgetService;
    }

    // GET current user's budgets
    @GetMapping
    public ResponseEntity<List<Budget>>
    getAllBudgets() {

        return ResponseEntity.ok(
                budgetService.getAllBudgets()
        );
    }

    // GET budget by ID
    @GetMapping("/{id}")
    public ResponseEntity<Budget>
    getBudgetById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                budgetService.getBudgetById(id)
        );
    }

    // CREATE budget
    @PostMapping
    public ResponseEntity<Budget>
    createBudget(
            @Valid
            @RequestBody
            Budget budget) {

        return ResponseEntity.ok(
                budgetService.createBudget(
                        budget
                )
        );
    }

    // UPDATE budget
    @PutMapping("/{id}")
    public ResponseEntity<Budget>
    updateBudget(
            @PathVariable Long id,
            @Valid
            @RequestBody
            Budget budget) {

        return ResponseEntity.ok(
                budgetService.updateBudget(
                        id,
                        budget
                )
        );
    }

    // DELETE budget
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteBudget(
            @PathVariable Long id) {

        budgetService.deleteBudget(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}