package com.platform.educational.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class EnrollmentResponse {
    private Long courseId;
    private String courseTitle;
    private String thumbnailUrl;
    private LocalDateTime enrolledAt;
    private int progressPercent;
}
