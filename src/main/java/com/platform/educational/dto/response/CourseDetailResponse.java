package com.platform.educational.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class CourseDetailResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String thumbnailUrl;
    private boolean published;
    private Long teacherId;
    private String teacherName;
    private List<SectionResponse> sections;
    private QuizResponse finalQuiz;
}
