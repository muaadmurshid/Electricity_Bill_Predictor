package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.ApplianceVisionResponse;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ApplianceVisionService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String openAiApiKey;

    public ApplianceVisionService(
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

    // =========================================================
    // ANALYSE APPLIANCE IMAGE
    // =========================================================
    public ApplianceVisionResponse analyseImage(
            MultipartFile file) {

        try {

            validateImage(file);

            String base64Image =
                    Base64.getEncoder()
                            .encodeToString(
                                    file.getBytes()
                            );

            String mimeType =
                    file.getContentType();

            String imageDataUrl =
                    "data:"
                            + mimeType
                            + ";base64,"
                            + base64Image;

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
                                    "user",

                                    "content",
                                    List.of(
                                            Map.of(
                                                    "type",
                                                    "input_text",

                                                    "text",
                                                    buildPrompt()
                                            ),

                                            Map.of(
                                                    "type",
                                                    "input_image",

                                                    "image_url",
                                                    imageDataUrl
                                            )
                                    )
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

            return parseResponse(
                    responseBody
            );

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Failed to analyse appliance image: "
                            + exception.getMessage(),
                    exception
            );
        }
    }

    // =========================================================
    // PROMPT
    // =========================================================
    private String buildPrompt() {

        return """
                Analyse this household appliance image.

                Your task is to identify the appliance and read any
                visible manufacturer label or technical information.

                Return ONLY valid JSON using exactly this structure:

                {
                  "applianceName": "",
                  "brand": "",
                  "model": "",
                  "ratedPower": null,
                  "voltage": null,
                  "energyRating": "",
                  "categoryName": "",
                  "notes": ""
                }

                Rules:

                - applianceName should be a simple appliance type,
                  for example Refrigerator, Television, Ceiling Fan,
                  Air Conditioner, Washing Machine or Microwave.

                - brand must only be returned if it is visible or
                  reasonably identifiable from the image.

                - model must only be returned if the model number is
                  visible or clearly identifiable.

                - ratedPower must be the appliance wattage in watts.
                  Return only the numeric value.
                  Example: 1200

                - voltage must be in volts.
                  Return only the numeric value.
                  Example: 230

                - energyRating should only contain information that
                  is visible on an energy label.

                - categoryName should describe a general category
                  such as Cooling, Lighting, Kitchen, Entertainment,
                  Laundry, Heating or Other.

                - Do not invent technical specifications.

                - If a field cannot be reliably determined, return
                  an empty string or null.

                - notes should briefly explain any uncertainty.

                - Do not guess wattage or voltage based only on what
                  is typical for that appliance.

                - Prefer technical label information when visible.
                """;
    }

    // =========================================================
    // PARSE OPENAI RESPONSE
    // =========================================================
    private ApplianceVisionResponse parseResponse(
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
                    "Vision AI response did not contain output"
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
                    "Vision AI response did not contain appliance details"
            );
        }

        /*
         * Remove markdown code fences if the
         * model returns them unexpectedly.
         */
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

        JsonNode applianceJson =
                objectMapper.readTree(
                        jsonText
                );

        ApplianceVisionResponse response =
                new ApplianceVisionResponse();

        response.setApplianceName(
                textOrNull(
                        applianceJson,
                        "applianceName"
                )
        );

        response.setBrand(
                textOrNull(
                        applianceJson,
                        "brand"
                )
        );

        response.setModel(
                textOrNull(
                        applianceJson,
                        "model"
                )
        );

        response.setRatedPower(
                decimalOrNull(
                        applianceJson,
                        "ratedPower"
                )
        );

        response.setVoltage(
                decimalOrNull(
                        applianceJson,
                        "voltage"
                )
        );

        response.setEnergyRating(
                textOrNull(
                        applianceJson,
                        "energyRating"
                )
        );

        response.setCategoryName(
                textOrNull(
                        applianceJson,
                        "categoryName"
                )
        );

        response.setNotes(
                textOrNull(
                        applianceJson,
                        "notes"
                )
        );

        return response;
    }

    // =========================================================
    // IMAGE VALIDATION
    // =========================================================
    private void validateImage(
            MultipartFile file) {

        if (file == null ||
                file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Please select an appliance image"
            );
        }

        if (file.getSize() >
                10L * 1024L * 1024L) {

            throw new IllegalArgumentException(
                    "Appliance image must be 10 MB or smaller"
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null ||
                !List.of(
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                ).contains(
                        contentType
                                .toLowerCase()
                )) {

            throw new IllegalArgumentException(
                    "Only JPG, PNG and WEBP images are supported"
            );
        }
    }

    // =========================================================
    // HELPERS
    // =========================================================
    private String textOrNull(
            JsonNode node,
            String fieldName) {

        JsonNode field =
                node.path(
                        fieldName
                );

        if (field.isMissingNode() ||
                field.isNull()) {

            return null;
        }

        String value =
                field.asText()
                        .trim();

        return value.isEmpty()
                ? null
                : value;
    }

    private BigDecimal decimalOrNull(
            JsonNode node,
            String fieldName) {

        JsonNode field =
                node.path(
                        fieldName
                );

        if (field.isMissingNode() ||
                field.isNull()) {

            return null;
        }

        String value =
                field.asText()
                        .trim();

        if (value.isEmpty()) {
            return null;
        }

        try {

            return new BigDecimal(
                    value
            );

        } catch (
                NumberFormatException exception
        ) {

            return null;
        }
    }
}