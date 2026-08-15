package com.example.electricity_bill_predictor.Controller;


import com.example.electricity_bill_predictor.Entity.ApplianceCategory;
import com.example.electricity_bill_predictor.Service.ApplianceCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appliance-categories")
public class ApplianceCategoryController {

    private final ApplianceCategoryService applianceCategoryService;

    public ApplianceCategoryController(
            ApplianceCategoryService applianceCategoryService) {
        this.applianceCategoryService = applianceCategoryService;
    }

    // GET /api/appliance-categories
    @GetMapping
    public List<ApplianceCategory> getAllCategories() {
        return applianceCategoryService.getAllCategories();
    }

    // GET /api/appliance-categories/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApplianceCategory> getCategoryById(
            @PathVariable Long id) {

        ApplianceCategory category =
                applianceCategoryService.getCategoryById(id);

        return ResponseEntity.ok(category);
    }

    // POST /api/appliance-categories
    @PostMapping
    public ResponseEntity<ApplianceCategory> createCategory(
            @RequestBody ApplianceCategory category) {

        ApplianceCategory createdCategory =
                applianceCategoryService.createCategory(category);

        return ResponseEntity.ok(createdCategory);
    }

    // PUT /api/appliance-categories/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApplianceCategory> updateCategory(
            @PathVariable Long id,
            @RequestBody ApplianceCategory category) {

        try {
            ApplianceCategory updatedCategory =
                    applianceCategoryService.updateCategory(id, category);

            return ResponseEntity.ok(updatedCategory);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/appliance-categories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id) {

        try {
            applianceCategoryService.deleteCategory(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}