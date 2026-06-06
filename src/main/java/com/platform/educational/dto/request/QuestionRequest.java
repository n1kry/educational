package com.platform.educational.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {
    @NotBlank
    private String text;
    @NotBlank
    private String correctAnswer;
    @Size(min = 2, max = 4)
    private List<AnswerOptionRequest> options;

    @Data
    public static class AnswerOptionRequest {
        @NotBlank
        private String optionKey;
        @NotBlank
        private String text;
    }
}
