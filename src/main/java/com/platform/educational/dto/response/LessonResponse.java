package com.platform.educational.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class LessonResponse {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private Integer durationMinutes;
    private int position;
}
