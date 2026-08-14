package com.example.electricity_bill_predictor.Controller;
import jakarta.validation.Valid;
import com.example.electricity_bill_predictor.Entity.Appliance;
import com.example.electricity_bill_predictor.Service.ApplianceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appliances")
@CrossOrigin(origins = "*")
public class ApplianceController {

    private final ApplianceService applianceService;

    public ApplianceController(ApplianceService applianceService) {
        this.applianceService = applianceService;
    }

    // GET /api/appliances
    @GetMapping
    public List<Appliance> getAllAppliances() {
        return applianceService.getAllAppliances();
    }

    // GET /api/appliances/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Appliance> getApplianceById(
            @PathVariable Long id) {

        Appliance appliance = applianceService.getApplianceById(id);

        return ResponseEntity.ok(appliance);
    }

    // POST /api/appliances
    @PostMapping
    public ResponseEntity<Appliance> createAppliance(
            @Valid @RequestBody Appliance appliance) {

        Appliance createdAppliance =
                applianceService.createAppliance(appliance);

        return ResponseEntity.ok(createdAppliance);
    }

    // PUT /api/appliances/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Appliance> updateAppliance(
            @PathVariable Long id,
            @RequestBody Appliance appliance) {

        try {
            Appliance updatedAppliance =
                    applianceService.updateAppliance(id, appliance);

            return ResponseEntity.ok(updatedAppliance);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/appliances/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppliance(
            @PathVariable Long id) {

        try {
            applianceService.deleteAppliance(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}