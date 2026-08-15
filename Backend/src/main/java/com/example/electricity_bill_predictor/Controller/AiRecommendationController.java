package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.AiRecommendationRequest;
import com.example.electricity_bill_predictor.DTO.AiRecommendationResponse;
import com.example.electricity_bill_predictor.Entity.Recommendation;
import com.example.electricity_bill_predictor.Service.AiRecommendationService;
import com.example.electricity_bill_predictor.Service.RecommendationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-recommendations")
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;
    private final RecommendationService recommendationService;

    public AiRecommendationController(
            AiRecommendationService aiRecommendationService,
            RecommendationService recommendationService) {

        this.aiRecommendationService = aiRecommendationService;
        this.recommendationService = recommendationService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Recommendation> generateRecommendation(
            @RequestBody AiRecommendationRequest request) {

        if (request.getHouseholdId() == null) {
            throw new IllegalArgumentException(
                    "Household ID is required"
            );
        }

        AiRecommendationResponse aiResponse =
                aiRecommendationService.generateRecommendation(
                        request
                );

        Recommendation savedRecommendation =
                recommendationService.saveAiRecommendation(
                        request.getHouseholdId(),
                        aiResponse
                );

        return ResponseEntity.ok(
                savedRecommendation
        );
    }
}