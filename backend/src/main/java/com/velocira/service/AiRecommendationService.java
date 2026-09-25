package com.velocira.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.velocira.config.AiProperties;
import com.velocira.dto.ai.AiRecommendRequest;
import com.velocira.dto.ai.AiRecommendResponse;
import com.velocira.dto.car.CarSearchRequest;
import com.velocira.dto.car.CarSummaryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiRecommendationService {

    private final AiProperties aiProperties;
    private final CarService carService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final RestClient restClient = RestClient.create("https://api.groq.com/openai/v1");

    private static final String SYSTEM_PROMPT = """
        You extract structured car-rental search filters from a customer's natural-language
        request. Respond with ONLY a single JSON object, no markdown fences, no preamble, no
        explanation outside the JSON. Fields (all optional, use null when not mentioned):
        {
          "category": one of "Hatchback","Sedan","Compact SUV","Mid SUV","Full-Size SUV","MPV","Off-Roader","Crossover" or null,
          "minSeats": integer or null,
          "maxPricePerDay": number (INR) or null,
          "location": city name mentioned, or null,
          "transmission": "MANUAL" or "AUTOMATIC" or null,
          "fuel": "PETROL","DIESEL","ELECTRIC","HYBRID" or null,
          "explanation": a short one-sentence restatement of what you understood, in plain English
        }
        Only use the exact category values listed above (map "SUV" to the closest match, e.g.
        "Mid SUV"). Do not invent vehicle names, brands, or prices — you are only extracting
        search criteria, not recommending specific vehicles.
        """;

    /**
     * NOTE ON THIS ENVIRONMENT: this calls out to api.groq.com, which
     * requires AI_API_KEY to be a real Groq API key.
     * The request/response shape follows OpenAI-compatible Chat Completions API.
     * If the call fails for any reason (no key configured, network error,
     * malformed response), this falls back to a simple local keyword parser.
     */
    public AiRecommendResponse recommend(AiRecommendRequest req) {
        try {
            ParsedFilters filters = callGroqOrFallback(req.query());

            CarSearchRequest searchRequest = new CarSearchRequest(
                filters.location, null, null, filters.category, null,
                null, filters.maxPricePerDay, 
                sanitizeEnum(filters.transmission), 
                sanitizeEnum(filters.fuel), 
                filters.minSeats,
                "RECOMMENDED"
            );

            // The AI only ever supplies search criteria — every car in the
            // response comes from CarService.search() against the real
            // database, never from the model's own output.
            List<CarSummaryDto> matches = carService.search(searchRequest).stream().limit(6).toList();

            return new AiRecommendResponse(
                filters.explanation,
                matches,
                new AiRecommendResponse.ParsedIntent(
                    filters.category, filters.minSeats, filters.maxPricePerDay,
                    filters.location, filters.transmission, filters.fuel
                )
            );
        } catch (Exception ex) {
            log.error("Critical error in recommendation flow: {}", ex.getMessage(), ex);
            return new AiRecommendResponse(
                "We encountered an issue while processing your request. Here are some of our popular cars instead.",
                carService.search(new CarSearchRequest(null, null, null, null, null, null, null, null, null, null, "RECOMMENDED")).stream().limit(6).toList(),
                null
            );
        }
    }

    private String sanitizeEnum(String value) {
        return (value == null || value.isBlank()) ? null : value.toUpperCase().trim();
    }

    private ParsedFilters callGroqOrFallback(String query) {
        log.info("Processing AI recommendation for query: '{}'", query);
        if (aiProperties.apiKey() == null || aiProperties.apiKey().isBlank()) {
            log.info("AI_API_KEY not configured — using local keyword fallback.");
            return keywordFallback(query);
        }

        try {
            Map<String, Object> body = Map.of(
                "model", aiProperties.model() != null ? aiProperties.model() : "llama3-8b-8192",
                "messages", List.of(
                    Map.of("role", "system", "content", SYSTEM_PROMPT),
                    Map.of("role", "user", "content", query)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0
            );

            log.debug("Sending request to Groq API with model: {}", body.get("model"));
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + aiProperties.apiKey())
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(Map.class);

            if (response == null) {
                throw new IllegalStateException("Empty response from Groq API");
            }

            String text = extractText(response);
            log.debug("AI Response Text: {}", text);
            JsonNode json = objectMapper.readTree(text);

            return new ParsedFilters(
                textOrNull(json, "category"),
                intOrNull(json, "minSeats"),
                bigDecimalOrNull(json, "maxPricePerDay"),
                textOrNull(json, "location"),
                textOrNull(json, "transmission"),
                textOrNull(json, "fuel"),
                textOrNull(json, "explanation")
            );
        } catch (Exception ex) {
            log.error("Groq AI recommendation call failed: {}", ex.getMessage(), ex);
            log.info("Falling back to keyword parsing due to API error.");
            return keywordFallback(query);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (choices == null || choices.isEmpty()) {
            log.error("Groq API response missing choices: {}", response);
            throw new IllegalStateException("No choices in AI response");
        }
        Map<String, Object> choice = choices.get(0);
        Map<String, Object> message = (Map<String, Object>) choice.get("message");
        String content = ((String) message.get("content")).trim();

        // Strip markdown code fences if present (e.g. ```json ... ```)
        if (content.startsWith("```")) {
            content = content.replaceAll("^```(?:json)?\\n?|\\n?```$", "");
        }
        return content.trim();
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return (v == null || v.isNull()) ? null : v.asText();
    }

    private Integer intOrNull(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return (v == null || v.isNull()) ? null : v.asInt();
    }

    private BigDecimal bigDecimalOrNull(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return (v == null || v.isNull()) ? null : BigDecimal.valueOf(v.asDouble());
    }

    /** A simple, honest degradation path — regex/keyword extraction so the
     *  feature still does something useful without a configured AI key,
     *  rather than being entirely non-functional. */
    private ParsedFilters keywordFallback(String query) {
        String lower = query.toLowerCase();

        String category = null;
        if (lower.contains("suv")) category = lower.contains("compact") ? "Compact SUV" : "Mid SUV";
        else if (lower.contains("sedan")) category = "Sedan";
        else if (lower.contains("hatchback")) category = "Hatchback";
        else if (lower.contains("off-road") || lower.contains("offroad") || lower.contains("thar")) category = "Off-Roader";
        else if (lower.contains("mpv") || lower.contains("7 seat") || lower.contains("family")) category = "MPV";

        Integer minSeats = null;
        Matcher seatMatcher = Pattern.compile("(\\d+)\\s*(people|seat|passenger)").matcher(lower);
        if (seatMatcher.find()) minSeats = Integer.parseInt(seatMatcher.group(1));

        BigDecimal maxPrice = null;
        Matcher priceMatcher = Pattern.compile("under\\s*(?:rs\\.?|₹)?\\s*([\\d,]+)").matcher(lower);
        if (priceMatcher.find()) maxPrice = new BigDecimal(priceMatcher.group(1).replace(",", ""));

        String transmission = null;
        if (lower.contains("automatic")) transmission = "AUTOMATIC";
        else if (lower.contains("manual")) transmission = "MANUAL";

        String fuel = null;
        if (lower.contains("diesel")) fuel = "DIESEL";
        else if (lower.contains("petrol")) fuel = "PETROL";
        else if (lower.contains("electric")) fuel = "ELECTRIC";

        return new ParsedFilters(category, minSeats, maxPrice, null, transmission, fuel,
            "Here's what matched your search based on the fleet available.");
    }

    private record ParsedFilters(
        String category, Integer minSeats, BigDecimal maxPricePerDay,
        String location, String transmission, String fuel, String explanation
    ) {}
}
