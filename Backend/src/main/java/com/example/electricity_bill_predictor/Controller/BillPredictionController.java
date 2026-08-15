package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.Entity.BillPrediction;
import com.example.electricity_bill_predictor.Service.BillPredictionService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bill-predictions")
public class BillPredictionController {

    private final BillPredictionService billPredictionService;

    public BillPredictionController(
            BillPredictionService billPredictionService) {

        this.billPredictionService =
                billPredictionService;
    }

    // GET current user's predictions
    @GetMapping
    public ResponseEntity<List<BillPrediction>>
    getAllPredictions() {

        return ResponseEntity.ok(
                billPredictionService
                        .getAllBillPredictions()
        );
    }

    // GET prediction by ID
    @GetMapping("/{id}")
    public ResponseEntity<BillPrediction>
    getBillPredictionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                billPredictionService
                        .getBillPredictionById(id)
        );
    }

    // GET household prediction history
    @GetMapping("/household/{householdId}")
    public ResponseEntity<List<BillPrediction>>
    getPredictionHistoryByHousehold(
            @PathVariable Long householdId) {

        return ResponseEntity.ok(
                billPredictionService
                        .getPredictionHistoryByHousehold(
                                householdId
                        )
        );
    }

    // GET latest household prediction
    @GetMapping("/household/{householdId}/latest")
    public ResponseEntity<BillPrediction>
    getLatestPredictionByHousehold(
            @PathVariable Long householdId) {

        return ResponseEntity.ok(
                billPredictionService
                        .getLatestPredictionByHousehold(
                                householdId
                        )
        );
    }

    // CREATE manual prediction
    @PostMapping
    public ResponseEntity<BillPrediction>
    createPrediction(
            @Valid
            @RequestBody
            BillPrediction prediction) {

        return ResponseEntity.ok(
                billPredictionService
                        .createBillPrediction(
                                prediction
                        )
        );
    }

    // UPDATE prediction
    @PutMapping("/{id}")
    public ResponseEntity<BillPrediction>
    updatePrediction(
            @PathVariable Long id,
            @Valid
            @RequestBody
            BillPrediction prediction) {

        return ResponseEntity.ok(
                billPredictionService
                        .updateBillPrediction(
                                id,
                                prediction
                        )
        );
    }

    // DELETE prediction
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deletePrediction(
            @PathVariable Long id) {

        billPredictionService
                .deleteBillPrediction(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}