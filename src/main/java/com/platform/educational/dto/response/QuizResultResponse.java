package com.platform.educational.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class QuizResultResponse {
    private int score;
    private boolean passed;
    private int attempts;
    private LocalDateTime passedAt;
    private String message;
}
