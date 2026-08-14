package com.example.electricity_bill_predictor.Controller;

import jakarta.validation.Valid;

import com.example.electricity_bill_predictor.Entity.BillPrediction;
import com.example.electricity_bill_predictor.Service.BillPredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bill-predictions")
@CrossOrigin(origins = "*")
public class BillPredictionController {

    private final BillPredictionService billPredictionService;

    public BillPredictionController(
            BillPredictionService billPredictionService) {
        this.billPredictionService = billPredictionService;
    }

    // GET /api/bill-predictions
    @GetMapping
    public List<BillPrediction> getAllPredictions() {
        return billPredictionService.getAllBillPredictions();
    }

    // GET /api/bill-predictions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<BillPrediction> getBillPredictionById(
            @PathVariable Long id) {

        BillPrediction billPrediction =
                billPredictionService.getBillPredictionById(id);

        return ResponseEntity.ok(billPrediction);
    }

    // POST /api/bill-predictions
    @PostMapping
    public ResponseEntity<BillPrediction> createPrediction(
           @Valid @RequestBody BillPrediction prediction) {

        BillPrediction createdPrediction =
                billPredictionService.createBillPrediction(prediction);

        return ResponseEntity.ok(createdPrediction);
    }

    // PUT /api/bill-predictions/{id}
    @PutMapping("/{id}")
    public ResponseEntity<BillPrediction> updatePrediction(
            @PathVariable Long id,
            @Valid @RequestBody BillPrediction prediction) {

        try {
            BillPrediction updatedPrediction =
                    billPredictionService.updateBillPrediction(id, prediction);

            return ResponseEntity.ok(updatedPrediction);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/bill-predictions/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrediction(
            @PathVariable Long id) {

        try {
            billPredictionService.deleteBillPrediction(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}