package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.MlRecommendationRequest;
import com.example.electricity_bill_predictor.DTO.MlRecommendationResponse;
import com.example.electricity_bill_predictor.Service.MlRecommendationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml-recommendation")
public class MlRecommendationController {

    private final MlRecommendationService mlRecommendationService;

    public MlRecommendationController(
            MlRecommendationService mlRecommendationService) {

        this.mlRecommendationService =
                mlRecommendationService;
    }

    @PostMapping("/predict")
    public ResponseEntity<MlRecommendationResponse>
    predictRecommendation(
            @RequestBody
            MlRecommendationRequest request) {

        MlRecommendationResponse response =
                mlRecommendationService
                        .predictRecommendation(
                                request
                        );

        return ResponseEntity.ok(
                response
        );
    }
}