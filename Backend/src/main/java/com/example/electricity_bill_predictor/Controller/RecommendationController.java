package com.example.electricity_bill_predictor.Controller;

import jakarta.validation.Valid;

import com.example.electricity_bill_predictor.Entity.Recommendation;
import com.example.electricity_bill_predictor.Service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(
            RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    // GET /api/recommendations
    @GetMapping
    public List<Recommendation> getAllRecommendations() {
        return recommendationService.getAllRecommendations();
    }

    // GET /api/recommendations/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Recommendation> getRecommendationById(
            @PathVariable Long id) {

        Recommendation recommendation =
                recommendationService.getRecommendationById(id);

        return ResponseEntity.ok(recommendation);
    }

    // POST /api/recommendations
    @PostMapping
    public ResponseEntity<Recommendation> createRecommendation(
            @Valid @RequestBody Recommendation recommendation) {

        Recommendation createdRecommendation =
                recommendationService.createRecommendation(recommendation);

        return ResponseEntity.ok(createdRecommendation);
    }

    // PUT /api/recommendations/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Recommendation> updateRecommendation(
            @PathVariable Long id,
            @Valid @RequestBody Recommendation recommendation) {

        try {
            Recommendation updatedRecommendation =
                    recommendationService.updateRecommendation(
                            id, recommendation);

            return ResponseEntity.ok(updatedRecommendation);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/recommendations/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecommendation(
            @PathVariable Long id) {

        try {
            recommendationService.deleteRecommendation(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}