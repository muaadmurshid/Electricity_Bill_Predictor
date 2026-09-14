package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.ApplianceVisionResponse;
import com.example.electricity_bill_predictor.Service.ApplianceVisionService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/appliance-vision")
public class ApplianceVisionController {

    private final ApplianceVisionService applianceVisionService;

    public ApplianceVisionController(
            ApplianceVisionService applianceVisionService) {

        this.applianceVisionService =
                applianceVisionService;
    }

    // =========================================================
    // POST /api/appliance-vision/analyse
    //
    // Analyses an appliance image using Vision AI.
    // JWT authentication is required automatically
    // by the existing SecurityConfig.
    // =========================================================
    @PostMapping(
            value = "/analyse",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApplianceVisionResponse>
    analyseAppliance(
            @RequestParam("file")
            MultipartFile file) {

        ApplianceVisionResponse response =
                applianceVisionService
                        .analyseImage(file);

        return ResponseEntity.ok(
                response
        );
    }
}