package com.platform.educational.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class SectionResponse {
    private Long id;
    private String title;
    private int position;
    private List<LessonResponse> lessons;
    private QuizResponse quiz;
}
