package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.BillCalculationResult;
import com.example.electricity_bill_predictor.Service.ElectricityBillCalculationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bill-calculation")
public class ElectricityBillCalculationController {

    private final ElectricityBillCalculationService
            electricityBillCalculationService;

    public ElectricityBillCalculationController(
            ElectricityBillCalculationService
                    electricityBillCalculationService) {

        this.electricityBillCalculationService =
                electricityBillCalculationService;
    }

    @GetMapping
    public ResponseEntity<BillCalculationResult> calculateBill(
            @RequestParam Long tariffId,
            @RequestParam Integer units) {

        BillCalculationResult result =
                electricityBillCalculationService.calculateBill(
                        tariffId,
                        units
                );

        return ResponseEntity.ok(result);
    }
}