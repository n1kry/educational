package com.platform.educational.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String thumbnailUrl;
    private boolean published;
    private String teacherName;
    private int sectionCount;
}
