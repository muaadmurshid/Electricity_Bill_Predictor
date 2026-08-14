package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.MlBillPredictionResult;
import com.example.electricity_bill_predictor.DTO.MlPredictionRequest;
import com.example.electricity_bill_predictor.DTO.MlPredictionResponse;
import com.example.electricity_bill_predictor.Service.MlPredictionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "*")
public class MlPredictionController {

    private final MlPredictionService mlPredictionService;

    public MlPredictionController(
            MlPredictionService mlPredictionService) {

        this.mlPredictionService = mlPredictionService;
    }

    @PostMapping("/predict")
    public ResponseEntity<MlPredictionResponse> predict(
            @RequestBody MlPredictionRequest request) {

        MlPredictionResponse response =
                mlPredictionService.predictConsumption(request);

        return ResponseEntity.ok(response);
    }
    @PostMapping("/predict-bill")
    public ResponseEntity<MlBillPredictionResult> predictBill(
            @RequestParam Long tariffId,
            @RequestBody MlPredictionRequest request) {

        MlBillPredictionResult result =
                mlPredictionService.predictBill(
                        tariffId,
                        request
                );

        return ResponseEntity.ok(result);
    }
    @PostMapping("/predict-household")
    public ResponseEntity<MlBillPredictionResult> predictHouseholdBill(
            @RequestParam Long householdId,
            @RequestParam Long tariffId,
            @RequestParam Integer year,
            @RequestParam Integer month) {

        MlPredictionRequest request =
                mlPredictionService.buildPredictionRequest(
                        householdId,
                        year,
                        month
                );

        MlBillPredictionResult result =
                mlPredictionService.predictBill(
                        tariffId,
                        request
                );

        return ResponseEntity.ok(result);
    }
}