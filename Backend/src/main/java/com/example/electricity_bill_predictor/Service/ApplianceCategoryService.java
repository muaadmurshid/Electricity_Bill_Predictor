package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;
import com.example.electricity_bill_predictor.Entity.ApplianceCategory;
import com.example.electricity_bill_predictor.Repository.ApplianceCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplianceCategoryService {

    private final ApplianceCategoryRepository applianceCategoryRepository;

    public ApplianceCategoryService(
            ApplianceCategoryRepository applianceCategoryRepository) {
        this.applianceCategoryRepository = applianceCategoryRepository;
    }

    // Get all appliance categories
    public List<ApplianceCategory> getAllCategories() {
        return applianceCategoryRepository.findAll();
    }

    // Get category by ID
    public ApplianceCategory getCategoryById(Long id) {
        return applianceCategoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appliance category not found with id: " + id
                        )
                );
    }

    // Create category
    public ApplianceCategory createCategory(ApplianceCategory category) {
        return applianceCategoryRepository.save(category);
    }

    // Update category
    public ApplianceCategory updateCategory(
            Long categoryId,
            ApplianceCategory categoryDetails) {

        ApplianceCategory existingCategory =
                applianceCategoryRepository.findById(categoryId)
                        .orElseThrow(() ->
                                new RuntimeException("Appliance category not found"));

        existingCategory.setCategoryName(
                categoryDetails.getCategoryName()
        );

        existingCategory.setDescription(
                categoryDetails.getDescription()
        );

        return applianceCategoryRepository.save(existingCategory);
    }

    // Delete category
    public void deleteCategory(Long categoryId) {

        if (!applianceCategoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Appliance category not found");
        }

        applianceCategoryRepository.deleteById(categoryId);
    }
}