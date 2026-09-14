package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.AiRecommendationRequest;
import com.example.electricity_bill_predictor.DTO.AiRecommendationResponse;
import com.example.electricity_bill_predictor.DTO.MlRecommendationRequest;
import com.example.electricity_bill_predictor.DTO.MlRecommendationResponse;
import com.example.electricity_bill_predictor.Entity.Recommendation;
import com.example.electricity_bill_predictor.Service.AiRecommendationService;
import com.example.electricity_bill_predictor.Service.MlRecommendationService;
import com.example.electricity_bill_predictor.Service.RecommendationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-recommendations")
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;
    private final MlRecommendationService mlRecommendationService;
    private final RecommendationService recommendationService;

    public AiRecommendationController(
            AiRecommendationService aiRecommendationService,
            MlRecommendationService mlRecommendationService,
            RecommendationService recommendationService) {

        this.aiRecommendationService =
                aiRecommendationService;

        this.mlRecommendationService =
                mlRecommendationService;

        this.recommendationService =
                recommendationService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Recommendation>
    generateRecommendation(
            @RequestBody
            AiRecommendationRequest request) {

        validateRequest(
                request
        );

        MlRecommendationRequest mlRequest =
                new MlRecommendationRequest();

        mlRequest.setMonth(
                request.getMonth()
        );

        mlRequest.setMonthlyConsumptionKwh(
                request
                        .getMonthlyConsumptionKwh()
                        .doubleValue()
        );

        mlRequest.setPredictedConsumptionKwh(
                request
                        .getPredictedConsumptionKwh()
                        .doubleValue()
        );

        mlRequest.setPredictedBillAmount(
                request
                        .getPredictedBillAmount()
                        .doubleValue()
        );

        mlRequest.setHighestApplianceConsumptionKwh(
                request
                        .getHighestApplianceConsumptionKwh()
                        .doubleValue()
        );

        mlRequest.setHighestCategoryConsumptionKwh(
                request
                        .getHighestCategoryConsumptionKwh()
                        .doubleValue()
        );

        mlRequest.setHighestConsumingCategory(
                request
                        .getHighestConsumingCategory()
        );

        MlRecommendationResponse mlResponse =
                mlRecommendationService
                        .predictRecommendation(
                                mlRequest
                        );

        request.setRecommendationClass(
                mlResponse.getRecommendationClass()
        );

        AiRecommendationResponse aiResponse =
                aiRecommendationService
                        .generateRecommendation(
                                request
                        );

        Recommendation savedRecommendation =
                recommendationService
                        .saveAiRecommendation(
                                request.getHouseholdId(),
                                aiResponse
                        );

        return ResponseEntity.ok(
                savedRecommendation
        );
    }

    private void validateRequest(
            AiRecommendationRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Recommendation request cannot be null"
            );
        }

        if (request.getHouseholdId() == null) {
            throw new IllegalArgumentException(
                    "Household ID is required"
            );
        }

        if (request.getMonth() == null ||
                request.getMonth() < 1 ||
                request.getMonth() > 12) {

            throw new IllegalArgumentException(
                    "Month must be between 1 and 12"
            );
        }

        if (request.getMonthlyConsumptionKwh() == null) {
            throw new IllegalArgumentException(
                    "Monthly consumption is required"
            );
        }

        if (request.getPredictedConsumptionKwh() == null) {
            throw new IllegalArgumentException(
                    "Predicted consumption is required"
            );
        }

        if (request.getPredictedBillAmount() == null) {
            throw new IllegalArgumentException(
                    "Predicted bill amount is required"
            );
        }

        if (request.getHighestApplianceConsumptionKwh() == null) {
            throw new IllegalArgumentException(
                    "Highest appliance consumption is required"
            );
        }

        if (request.getHighestCategoryConsumptionKwh() == null) {
            throw new IllegalArgumentException(
                    "Highest category consumption is required"
            );
        }

        if (request.getHighestConsumingCategory() == null ||
                request
                        .getHighestConsumingCategory()
                        .isBlank()) {

            throw new IllegalArgumentException(
                    "Highest consuming category is required"
            );
        }
    }
}