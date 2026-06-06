package com.platform.educational.controller;

import com.platform.educational.dto.response.EnrollmentResponse;
import com.platform.educational.entity.User;
import com.platform.educational.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> enroll(@PathVariable Long courseId,
                                       @AuthenticationPrincipal User user) {
        enrollmentService.enroll(courseId, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public List<EnrollmentResponse> getMyEnrollments(@AuthenticationPrincipal User user) {
        return enrollmentService.getMyEnrollments(user);
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> unenroll(@PathVariable Long courseId,
                                         @AuthenticationPrincipal User user) {
        enrollmentService.unenroll(courseId, user);
        return ResponseEntity.noContent().build();
    }
}
