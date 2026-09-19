package com.finsight.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiRequestDto {
    @NotBlank(message = "Prompt cannot be empty")
    private String prompt;
    private String timePeriod; // e.g. "this_month", "last_month"
}
