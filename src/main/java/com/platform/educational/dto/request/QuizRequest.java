package com.platform.educational.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuizRequest {
    @NotBlank
    private String title;
    @Min(1) @Max(100)
    private int passingScore = 70;
}
