package com.platform.educational.controller;

import com.platform.educational.dto.response.ProgressResponse;
import com.platform.educational.entity.User;
import com.platform.educational.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/progress/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ProgressResponse getCourseProgress(@PathVariable Long courseId,
                                              @AuthenticationPrincipal User user) {
        return progressService.getCourseProgress(courseId, user);
    }

    @PostMapping("/lessons/{lessonId}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> completeLesson(@PathVariable Long lessonId,
                                               @AuthenticationPrincipal User user) {
        progressService.completeLesson(lessonId, user);
        return ResponseEntity.ok().build();
    }
}
