package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.Entity.Appliance;
import com.example.electricity_bill_predictor.Service.ApplianceService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appliances")
public class ApplianceController {

    private final ApplianceService applianceService;

    public ApplianceController(
            ApplianceService applianceService) {

        this.applianceService =
                applianceService;
    }

    // =========================================================
    // GET /api/appliances
    // Returns current user's appliances only
    // =========================================================
    @GetMapping
    public ResponseEntity<List<Appliance>>
    getAllAppliances() {

        return ResponseEntity.ok(
                applianceService.getAllAppliances()
        );
    }

    // =========================================================
    // GET /api/appliances/room/{roomId}
    // =========================================================
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Appliance>>
    getAppliancesByRoomId(
            @PathVariable Long roomId) {

        return ResponseEntity.ok(
                applianceService
                        .getAppliancesByRoomId(
                                roomId
                        )
        );
    }

    // =========================================================
    // GET /api/appliances/{id}
    // =========================================================
    @GetMapping("/{id}")
    public ResponseEntity<Appliance>
    getApplianceById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                applianceService
                        .getApplianceById(id)
        );
    }

    // =========================================================
    // POST /api/appliances
    // =========================================================
    @PostMapping
    public ResponseEntity<Appliance>
    createAppliance(
            @Valid
            @RequestBody Appliance appliance) {

        return ResponseEntity.ok(
                applianceService
                        .createAppliance(appliance)
        );
    }

    // =========================================================
    // PUT /api/appliances/{id}
    // =========================================================
    @PutMapping("/{id}")
    public ResponseEntity<Appliance>
    updateAppliance(
            @PathVariable Long id,
            @Valid
            @RequestBody Appliance appliance) {

        return ResponseEntity.ok(
                applianceService
                        .updateAppliance(
                                id,
                                appliance
                        )
        );
    }

    // =========================================================
    // DELETE /api/appliances/{id}
    // =========================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteAppliance(
            @PathVariable Long id) {

        applianceService
                .deleteAppliance(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}