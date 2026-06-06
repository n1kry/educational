package com.platform.educational.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class QuizResponse {
    private Long id;
    private String title;
    private int passingScore;
    private boolean finalQuiz;
    private List<QuestionResponse> questions;
}
