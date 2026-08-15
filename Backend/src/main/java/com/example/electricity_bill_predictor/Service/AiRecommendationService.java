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

    public AiRecommendationService(ObjectMapper objectMapper) {

        this.objectMapper = objectMapper;

        this.restClient = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .build();
    }

    public AiRecommendationResponse generateRecommendation(
            AiRecommendationRequest request) {

        try {

            String prompt = buildPrompt(request);

            Map<String, Object> requestBody = new HashMap<>();

            requestBody.put("model", "gpt-5-mini");

            requestBody.put(
                    "input",
                    List.of(
                            Map.of(
                                    "role", "system",
                                    "content",
                                    "You are an energy efficiency advisor for "
                                            + "Sri Lankan residential households. "
                                            + "Provide practical and realistic electricity "
                                            + "saving advice based only on the supplied data. "
                                            + "Return only valid JSON."
                            ),
                            Map.of(
                                    "role", "user",
                                    "content", prompt
                            )
                    )
            );

            String responseBody =
                    restClient.post()
                            .uri("/responses")
                            .header(
                                    "Authorization",
                                    "Bearer " + openAiApiKey
                            )
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(requestBody)
                            .retrieve()
                            .body(String.class);

            return parseResponse(responseBody);

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Failed to generate AI recommendation: "
                            + e.getMessage(),
                    e
            );
        }
    }

    private String buildPrompt(
            AiRecommendationRequest request) {

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

                Generate ONE personalized electricity-saving recommendation.

                Return ONLY JSON using exactly this structure:

                {
                  "recommendationTitle": "short title",
                  "recommendationDescription": "practical explanation",
                  "recommendationType": "APPLIANCE_USAGE",
                  "priority": "HIGH",
                  "estimatedSavingKwh": 0.0,
                  "estimatedSavingAmount": 0.0
                }

                Rules:
                - recommendationType should be one of:
                  APPLIANCE_USAGE,
                  BEHAVIOUR,
                  SCHEDULE,
                  ENERGY_EFFICIENCY

                - priority should be:
                  HIGH,
                  MEDIUM,
                  or LOW

                - Do not invent appliances that are not provided.
                - Keep the advice practical for a household.
                - Savings must be non-negative.
                - If exact savings cannot be reliably determined,
                  use 0.0 rather than inventing a number.
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
                        request.getHighestCategoryConsumptionKwh()
                );
    }

    private AiRecommendationResponse parseResponse(
            String responseBody) throws Exception {

        JsonNode root =
                objectMapper.readTree(responseBody);

        JsonNode output =
                root.path("output");

        if (!output.isArray() || output.isEmpty()) {
            throw new IllegalStateException(
                    "OpenAI response did not contain output"
            );
        }

        String jsonText = null;

        for (JsonNode outputItem : output) {

            JsonNode content =
                    outputItem.path("content");

            if (content.isArray()) {

                for (JsonNode contentItem : content) {

                    if ("output_text".equals(
                            contentItem.path("type").asText())) {

                        jsonText =
                                contentItem.path("text").asText();

                        break;
                    }
                }
            }

            if (jsonText != null) {
                break;
            }
        }

        if (jsonText == null || jsonText.isBlank()) {
            throw new IllegalStateException(
                    "OpenAI response did not contain recommendation text"
            );
        }

        JsonNode recommendationJson =
                objectMapper.readTree(jsonText);

        AiRecommendationResponse response =
                new AiRecommendationResponse();

        response.setRecommendationTitle(
                recommendationJson
                        .path("recommendationTitle")
                        .asText()
        );

        response.setRecommendationDescription(
                recommendationJson
                        .path("recommendationDescription")
                        .asText()
        );

        response.setRecommendationType(
                recommendationJson
                        .path("recommendationType")
                        .asText()
        );

        response.setPriority(
                recommendationJson
                        .path("priority")
                        .asText()
        );

        response.setEstimatedSavingKwh(
                new BigDecimal(
                        recommendationJson
                                .path("estimatedSavingKwh")
                                .asText("0.0")
                )
        );

        response.setEstimatedSavingAmount(
                new BigDecimal(
                        recommendationJson
                                .path("estimatedSavingAmount")
                                .asText("0.0")
                )
        );

        return response;
    }
}