package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.AiRecommendationRequest;
import com.example.electricity_bill_predictor.DTO.AiRecommendationResponse;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiRecommendationService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String openAiApiKey;

    public AiRecommendationService(
            ObjectMapper objectMapper) {

        this.objectMapper =
                objectMapper;

        this.restClient =
                RestClient.builder()
                        .baseUrl(
                                "https://api.openai.com/v1"
                        )
                        .build();
    }

    public AiRecommendationResponse
    generateRecommendation(
            AiRecommendationRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "AI recommendation request cannot be null"
            );
        }

        if (request.getRecommendationClass() == null ||
                request
                        .getRecommendationClass()
                        .isBlank()) {

            throw new IllegalArgumentException(
                    "ML recommendation class is required"
            );
        }

        try {

            String recommendationType =
                    mapRecommendationType(
                            request.getRecommendationClass()
                    );

            String priority =
                    mapPriority(
                            request.getRecommendationClass()
                    );

            String prompt =
                    buildPrompt(
                            request,
                            recommendationType,
                            priority
                    );

            Map<String, Object> requestBody =
                    new HashMap<>();

            requestBody.put(
                    "model",
                    "gpt-5.6-luna"
            );

            requestBody.put(
                    "input",
                    List.of(
                            Map.of(
                                    "role",
                                    "system",

                                    "content",
                                    "You are an energy efficiency communication assistant "
                                            + "for Sri Lankan residential households. "
                                            + "The recommendation decision has already been "
                                            + "made by a trained machine learning model. "
                                            + "Do not change, replace or override that decision. "
                                            + "Your role is only to explain the supplied "
                                            + "recommendation clearly and practically. "
                                            + "Return only valid JSON."
                            ),

                            Map.of(
                                    "role",
                                    "user",
                                    "content",
                                    prompt
                            )
                    )
            );

            String responseBody =
                    restClient.post()
                            .uri(
                                    "/responses"
                            )
                            .header(
                                    "Authorization",
                                    "Bearer "
                                            + openAiApiKey
                            )
                            .contentType(
                                    MediaType.APPLICATION_JSON
                            )
                            .body(
                                    requestBody
                            )
                            .retrieve()
                            .body(
                                    String.class
                            );

            AiRecommendationResponse response =
                    parseResponse(
                            responseBody
                    );

            response.setRecommendationType(
                    recommendationType
            );

            response.setPriority(
                    priority
            );

            response.setEstimatedSavingKwh(
                    BigDecimal.ZERO
            );

            response.setEstimatedSavingAmount(
                    BigDecimal.ZERO
            );

            return response;

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Failed to generate AI recommendation explanation: "
                            + e.getMessage(),
                    e
            );
        }
    }

    private String buildPrompt(
            AiRecommendationRequest request,
            String recommendationType,
            String priority) {

        return """
                Household energy information:

                Household ID: %s
                Household Name: %s
                Year: %s
                Month: %s

                Monthly consumption: %s kWh
                Predicted next consumption: %s kWh
                Predicted electricity bill: LKR %s

                Highest consuming appliance: %s
                Appliance consumption: %s kWh

                Highest consuming category: %s
                Category consumption: %s kWh

                Machine learning recommendation class:
                %s

                Required recommendation type:
                %s

                Required priority:
                %s

                The recommendation class above was selected by our
                trained machine learning classifier.

                Do not choose another recommendation.

                Write a short title and a practical explanation for
                the user based on that recommendation class and the
                supplied household information.

                Return ONLY JSON using exactly this structure:

                {
                  "recommendationTitle": "short title",
                  "recommendationDescription": "practical explanation"
                }

                Rules:

                - Do not change the ML recommendation class.
                - Do not choose another recommendation category.
                - Do not invent appliances.
                - Do not invent technical specifications.
                - Use the supplied appliance and category information
                  where relevant.
                - Keep the recommendation practical for a Sri Lankan
                  residential household.
                - Keep the title short.
                - Keep the explanation clear and concise.
                - Do not calculate or invent estimated monetary or kWh
                  savings.
                """
                .formatted(
                        request.getHouseholdId(),
                        request.getHouseholdName(),
                        request.getYear(),
                        request.getMonth(),
                        request.getMonthlyConsumptionKwh(),
                        request.getPredictedConsumptionKwh(),
                        request.getPredictedBillAmount(),
                        request.getHighestConsumingAppliance(),
                        request.getHighestApplianceConsumptionKwh(),
                        request.getHighestConsumingCategory(),
                        request.getHighestCategoryConsumptionKwh(),
                        request.getRecommendationClass(),
                        recommendationType,
                        priority
                );
    }

    private AiRecommendationResponse parseResponse(
            String responseBody)
            throws Exception {

        JsonNode root =
                objectMapper.readTree(
                        responseBody
                );

        JsonNode output =
                root.path(
                        "output"
                );

        if (!output.isArray() ||
                output.isEmpty()) {

            throw new IllegalStateException(
                    "OpenAI response did not contain output"
            );
        }

        String jsonText = null;

        for (JsonNode outputItem :
                output) {

            JsonNode content =
                    outputItem.path(
                            "content"
                    );

            if (content.isArray()) {

                for (JsonNode contentItem :
                        content) {

                    if ("output_text".equals(
                            contentItem
                                    .path("type")
                                    .asText()
                    )) {

                        jsonText =
                                contentItem
                                        .path("text")
                                        .asText();

                        break;
                    }
                }
            }

            if (jsonText != null) {
                break;
            }
        }

        if (jsonText == null ||
                jsonText.isBlank()) {

            throw new IllegalStateException(
                    "OpenAI response did not contain recommendation text"
            );
        }

        jsonText =
                jsonText
                        .replace(
                                "```json",
                                ""
                        )
                        .replace(
                                "```",
                                ""
                        )
                        .trim();

        JsonNode recommendationJson =
                objectMapper.readTree(
                        jsonText
                );

        String title =
                recommendationJson
                        .path(
                                "recommendationTitle"
                        )
                        .asText()
                        .trim();

        String description =
                recommendationJson
                        .path(
                                "recommendationDescription"
                        )
                        .asText()
                        .trim();

        if (title.isBlank()) {
            throw new IllegalStateException(
                    "AI explanation did not contain a recommendation title"
            );
        }

        if (description.isBlank()) {
            throw new IllegalStateException(
                    "AI explanation did not contain a recommendation description"
            );
        }

        AiRecommendationResponse response =
                new AiRecommendationResponse();

        response.setRecommendationTitle(
                title
        );

        response.setRecommendationDescription(
                description
        );

        return response;
    }

    private String mapRecommendationType(
            String recommendationClass) {

        return switch (
                recommendationClass
        ) {

            case "REDUCE_COOLING_USAGE",
                 "REDUCE_LIGHTING_USAGE",
                 "OPTIMIZE_REFRIGERATION",
                 "REDUCE_HEATING_USAGE",
                 "REDUCE_HIGH_USAGE_APPLIANCE" ->
                    "APPLIANCE_USAGE";

            case "HIGH_BILL_WARNING" ->
                    "BEHAVIOUR";

            case "GENERAL_ENERGY_SAVING" ->
                    "ENERGY_EFFICIENCY";

            default ->
                    throw new IllegalArgumentException(
                            "Unsupported ML recommendation class: "
                                    + recommendationClass
                    );
        };
    }

    private String mapPriority(
            String recommendationClass) {

        return switch (
                recommendationClass
        ) {

            case "HIGH_BILL_WARNING" ->
                    "HIGH";

            case "REDUCE_COOLING_USAGE",
                 "REDUCE_HEATING_USAGE",
                 "REDUCE_HIGH_USAGE_APPLIANCE" ->
                    "MEDIUM";

            case "REDUCE_LIGHTING_USAGE",
                 "OPTIMIZE_REFRIGERATION",
                 "GENERAL_ENERGY_SAVING" ->
                    "LOW";

            default ->
                    throw new IllegalArgumentException(
                            "Unsupported ML recommendation class: "
                                    + recommendationClass
                    );
        };
    }
}