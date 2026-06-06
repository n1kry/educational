package com.platform.educational.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LessonRequest {
    @NotBlank
    private String title;
    private String description;
    private String videoUrl;
    private Integer durationMinutes;
    private int position;
}
