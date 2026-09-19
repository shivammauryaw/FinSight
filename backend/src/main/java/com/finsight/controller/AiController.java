package com.finsight.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.dto.AiRequestDto;
import com.finsight.dto.AnalyticsDto;
import com.finsight.service.AnalyticsService;
import com.finsight.service.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;
    private final AnalyticsService analyticsService;
    private final ObjectMapper objectMapper;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@Valid @RequestBody AiRequestDto request, Authentication authentication) {
        // Here we just fetch general analytics to provide as context.
        // In a real app, timePeriod could be used to fetch specific start/end dates.
        AnalyticsDto analytics = analyticsService.getAnalytics(authentication.getName(), null, null);
        
        String context = "No data available";
        try {
            context = objectMapper.writeValueAsString(analytics);
        } catch (Exception e) {
            e.printStackTrace();
        }

        String aiResponse = geminiService.analyzeFinancialData(request.getPrompt(), context);
        return ResponseEntity.ok(Map.of("response", aiResponse));
    }
}
