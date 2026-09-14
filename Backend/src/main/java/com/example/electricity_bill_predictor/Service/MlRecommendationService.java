package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.MlRecommendationRequest;
import com.example.electricity_bill_predictor.DTO.MlRecommendationResponse;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MlRecommendationService {

    private final RestClient restClient;

    public MlRecommendationService() {

        this.restClient =
                RestClient.builder()
                        .baseUrl(
                                "http://127.0.0.1:8000"
                        )
                        .build();
    }

    public MlRecommendationResponse
    predictRecommendation(
            MlRecommendationRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "ML recommendation request cannot be null"
            );
        }

        MlRecommendationResponse response =
                restClient.post()
                        .uri("/recommend")
                        .body(request)
                        .retrieve()
                        .body(
                                MlRecommendationResponse.class
                        );

        if (response == null ||
                response.getRecommendationClass() == null ||
                response
                        .getRecommendationClass()
                        .isBlank()) {

            throw new IllegalStateException(
                    "ML recommendation service returned no recommendation"
            );
        }

        return response;
    }
}