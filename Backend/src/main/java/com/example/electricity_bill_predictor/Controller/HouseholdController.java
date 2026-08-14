package com.example.electricity_bill_predictor.Controller;
import jakarta.validation.Valid;
import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Service.HouseholdService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/households")
@CrossOrigin(origins = "*")
public class HouseholdController {

    private final HouseholdService householdService;

    public HouseholdController(HouseholdService householdService) {
        this.householdService = householdService;
    }

    // GET /api/households
    @GetMapping
    public List<Household> getAllHouseholds() {
        return householdService.getAllHouseholds();
    }

    // GET /api/households/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Household> getHouseholdById(@PathVariable Long id) {

        Household household = householdService.getHouseholdById(id);

        return ResponseEntity.ok(household);
    }

    // POST /api/households
    @PostMapping
    public ResponseEntity<Household> createHousehold(
            @Valid @RequestBody Household household) {

        Household createdHousehold =
                householdService.createHousehold(household);

        return ResponseEntity.ok(createdHousehold);
    }

    // PUT /api/households/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Household> updateHousehold(
            @PathVariable Long id,
            @Valid @RequestBody Household household) {

        try {
            Household updatedHousehold =
                    householdService.updateHousehold(id, household);

            return ResponseEntity.ok(updatedHousehold);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/households/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHousehold(@PathVariable Long id) {

        try {
            householdService.deleteHousehold(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}