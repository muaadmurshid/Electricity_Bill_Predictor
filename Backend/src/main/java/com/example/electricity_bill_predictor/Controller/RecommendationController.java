package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.Entity.Recommendation;
import com.example.electricity_bill_predictor.Service.RecommendationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(
            RecommendationService recommendationService) {

        this.recommendationService =
                recommendationService;
    }

    // GET current user's recommendations
    @GetMapping
    public ResponseEntity<List<Recommendation>>
    getAllRecommendations() {

        return ResponseEntity.ok(
                recommendationService
                        .getAllRecommendations()
        );
    }

    // GET recommendation by ID
    @GetMapping("/{id}")
    public ResponseEntity<Recommendation>
    getRecommendationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                recommendationService
                        .getRecommendationById(id)
        );
    }

    // GET recommendation history for household
    @GetMapping("/household/{householdId}")
    public ResponseEntity<List<Recommendation>>
    getRecommendationsByHousehold(
            @PathVariable Long householdId) {

        return ResponseEntity.ok(
                recommendationService
                        .getRecommendationsByHousehold(
                                householdId
                        )
        );
    }

    // CREATE recommendation
    @PostMapping
    public ResponseEntity<Recommendation>
    createRecommendation(
            @Valid
            @RequestBody
            Recommendation recommendation) {

        return ResponseEntity.ok(
                recommendationService
                        .createRecommendation(
                                recommendation
                        )
        );
    }

    // UPDATE recommendation
    @PutMapping("/{id}")
    public ResponseEntity<Recommendation>
    updateRecommendation(
            @PathVariable Long id,
            @Valid
            @RequestBody
            Recommendation recommendation) {

        return ResponseEntity.ok(
                recommendationService
                        .updateRecommendation(
                                id,
                                recommendation
                        )
        );
    }

    // DELETE recommendation
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteRecommendation(
            @PathVariable Long id) {

        recommendationService
                .deleteRecommendation(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}