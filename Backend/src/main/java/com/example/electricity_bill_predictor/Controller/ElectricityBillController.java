package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.Entity.ElectricityBill;
import com.example.electricity_bill_predictor.Service.ElectricityBillService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/electricity-bills")
public class ElectricityBillController {

    private final ElectricityBillService electricityBillService;

    public ElectricityBillController(
            ElectricityBillService electricityBillService) {

        this.electricityBillService =
                electricityBillService;
    }

    // GET current user's bills
    @GetMapping
    public ResponseEntity<List<ElectricityBill>>
    getAllBills() {

        return ResponseEntity.ok(
                electricityBillService
                        .getAllElectricityBills()
        );
    }

    // GET bills for one owned household
    @GetMapping("/household/{householdId}")
    public ResponseEntity<List<ElectricityBill>>
    getBillsByHousehold(
            @PathVariable Long householdId) {

        return ResponseEntity.ok(
                electricityBillService
                        .getBillsByHousehold(
                                householdId
                        )
        );
    }

    // GET bill by ID
    @GetMapping("/{id}")
    public ResponseEntity<ElectricityBill>
    getElectricityBillById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                electricityBillService
                        .getElectricityBillById(id)
        );
    }

    // CREATE bill
    @PostMapping
    public ResponseEntity<ElectricityBill>
    createElectricityBill(
            @Valid
            @RequestBody
            ElectricityBill electricityBill) {

        return ResponseEntity.ok(
                electricityBillService
                        .createElectricityBill(
                                electricityBill
                        )
        );
    }

    // UPDATE bill
    @PutMapping("/{id}")
    public ResponseEntity<ElectricityBill>
    updateBill(
            @PathVariable Long id,
            @Valid
            @RequestBody
            ElectricityBill bill) {

        return ResponseEntity.ok(
                electricityBillService
                        .updateElectricityBill(
                                id,
                                bill
                        )
        );
    }

    // DELETE bill
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteBill(
            @PathVariable Long id) {

        electricityBillService
                .deleteElectricityBill(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}