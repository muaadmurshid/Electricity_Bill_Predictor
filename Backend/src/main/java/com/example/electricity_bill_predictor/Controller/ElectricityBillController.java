package com.example.electricity_bill_predictor.Controller;

import jakarta.validation.Valid;

import com.example.electricity_bill_predictor.Entity.ElectricityBill;
import com.example.electricity_bill_predictor.Service.ElectricityBillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/electricity-bills")
@CrossOrigin(origins = "*")
public class ElectricityBillController {

    private final ElectricityBillService electricityBillService;

    public ElectricityBillController(
            ElectricityBillService electricityBillService) {
        this.electricityBillService = electricityBillService;
    }

    // GET /api/electricity-bills
    @GetMapping
    public List<ElectricityBill> getAllBills() {
        return electricityBillService.getAllElectricityBills();
    }

    // GET /api/electricity-bills/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ElectricityBill> getElectricityBillById(
            @PathVariable Long id) {

        ElectricityBill electricityBill =
                electricityBillService.getElectricityBillById(id);

        return ResponseEntity.ok(electricityBill);
    }

    // POST /api/electricity-bills
    @PostMapping
    public ResponseEntity<ElectricityBill> createElectricityBill(
            @Valid @RequestBody ElectricityBill electricityBill) {

        ElectricityBill createdBill =
                electricityBillService.createElectricityBill(electricityBill);

        return ResponseEntity.ok(createdBill);
    }

    // PUT /api/electricity-bills/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ElectricityBill> updateBill(
            @PathVariable Long id,
            @Valid @RequestBody ElectricityBill bill) {

        try {
            ElectricityBill updatedBill =
                    electricityBillService.updateElectricityBill(id, bill);

            return ResponseEntity.ok(updatedBill);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/electricity-bills/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(
            @PathVariable Long id) {

        try {
            electricityBillService.deleteElectricityBill(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}