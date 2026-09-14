package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.Entity.Appliance;
import com.example.electricity_bill_predictor.Service.ApplianceImageService;
import com.example.electricity_bill_predictor.Service.ApplianceService;

import jakarta.validation.Valid;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appliances")
public class ApplianceController {

    private final ApplianceService applianceService;
    private final ApplianceImageService applianceImageService;

    public ApplianceController(
            ApplianceService applianceService,
            ApplianceImageService applianceImageService) {

        this.applianceService =
                applianceService;

        this.applianceImageService =
                applianceImageService;
    }

    // =========================================================
    // GET /api/appliances
    // =========================================================
    @GetMapping
    public ResponseEntity<List<Appliance>>
    getAllAppliances() {

        return ResponseEntity.ok(
                applianceService
                        .getAllAppliances()
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
                        .createAppliance(
                                appliance
                        )
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

        /*
         * Validate ownership and get the
         * existing image before deleting.
         */
        Appliance appliance =
                applianceService
                        .getApplianceById(id);

        String imagePath =
                appliance.getImagePath();

        applianceService
                .deleteAppliance(id);

        /*
         * Remove stored image after the
         * appliance has been deleted.
         */
        if (imagePath != null &&
                !imagePath.isBlank()) {

            applianceImageService
                    .deleteImage(
                            imagePath
                    );
        }

        return ResponseEntity
                .noContent()
                .build();
    }

    // =========================================================
    // POST /api/appliances/{id}/image
    //
    // Upload or replace appliance image.
    // JWT + ownership protection applies.
    // =========================================================
    @PostMapping(
            value = "/{id}/image",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, Object>>
    uploadApplianceImage(
            @PathVariable Long id,
            @RequestParam("file")
            MultipartFile file) {

        /*
         * getApplianceById performs
         * ownership validation.
         */
        Appliance appliance =
                applianceService
                        .getApplianceById(id);

        String previousImage =
                appliance.getImagePath();

        String storedFilename =
                applianceImageService
                        .storeImage(file);

        Appliance updatedAppliance =
                applianceService
                        .updateApplianceImagePath(
                                id,
                                storedFilename
                        );

        /*
         * Delete old image only after
         * the new image is successfully saved.
         */
        if (previousImage != null &&
                !previousImage.isBlank() &&
                !previousImage.equals(
                        storedFilename
                )) {

            applianceImageService
                    .deleteImage(
                            previousImage
                    );
        }

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Appliance image uploaded successfully",

                        "applianceId",
                        updatedAppliance
                                .getApplianceId(),

                        "imagePath",
                        storedFilename
                )
        );
    }

    // =========================================================
    // GET /api/appliances/{id}/image
    //
    // Returns appliance image.
    // Ownership is checked first.
    // =========================================================
    @GetMapping("/{id}/image")
    public ResponseEntity<Resource>
    getApplianceImage(
            @PathVariable Long id) {

        Appliance appliance =
                applianceService
                        .getApplianceById(id);

        Resource resource =
                applianceImageService
                        .loadImage(
                                appliance
                                        .getImagePath()
                        );

        MediaType mediaType =
                MediaTypeFactory
                        .getMediaType(
                                resource
                        )
                        .orElse(
                                MediaType
                                        .APPLICATION_OCTET_STREAM
                        );

        return ResponseEntity
                .ok()
                .contentType(
                        mediaType
                )
                .body(
                        resource
                );
    }

    // =========================================================
    // DELETE /api/appliances/{id}/image
    // =========================================================
    @DeleteMapping("/{id}/image")
    public ResponseEntity<Void>
    deleteApplianceImage(
            @PathVariable Long id) {

        Appliance appliance =
                applianceService
                        .getApplianceById(id);

        String imagePath =
                appliance.getImagePath();

        if (imagePath != null &&
                !imagePath.isBlank()) {

            applianceImageService
                    .deleteImage(
                            imagePath
                    );
        }

        applianceService
                .removeApplianceImagePath(
                        id
                );

        return ResponseEntity
                .noContent()
                .build();
    }
}