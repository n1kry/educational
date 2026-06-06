package com.platform.educational.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class ProgressResponse {
    private int progressPercent;
    private List<Long> completedLessonIds;
    private List<Long> passedQuizIds;
    private String completedAt;
}
