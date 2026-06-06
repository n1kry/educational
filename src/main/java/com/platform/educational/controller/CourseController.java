package com.platform.educational.controller;

import com.platform.educational.dto.request.CourseRequest;
import com.platform.educational.dto.request.LessonRequest;
import com.platform.educational.dto.request.SectionRequest;
import com.platform.educational.dto.response.CourseDetailResponse;
import com.platform.educational.dto.response.CourseResponse;
import com.platform.educational.dto.response.LessonResponse;
import com.platform.educational.dto.response.SectionResponse;
import com.platform.educational.entity.User;
import com.platform.educational.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/courses")
    public List<CourseResponse> getPublishedCourses() {
        return courseService.getPublishedCourses();
    }

    @GetMapping("/courses/{id}")
    public CourseDetailResponse getCourseDetail(@PathVariable Long id) {
        return courseService.getCourseDetail(id);
    }

    @GetMapping("/courses/my")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public List<CourseResponse> getMyCourses(@AuthenticationPrincipal User user) {
        return courseService.getTeacherCourses(user.getId());
    }

    @PostMapping("/courses")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest req,
                                                       @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(req, user));
    }

    @PutMapping("/courses/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public CourseResponse updateCourse(@PathVariable Long id,
                                       @Valid @RequestBody CourseRequest req,
                                       @AuthenticationPrincipal User user) {
        return courseService.updateCourse(id, req, user);
    }

    @PatchMapping("/courses/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> togglePublish(@PathVariable Long id,
                                              @AuthenticationPrincipal User user) {
        courseService.togglePublish(id, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/courses/{courseId}/sections")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<SectionResponse> createSection(@PathVariable Long courseId,
                                                         @Valid @RequestBody SectionRequest req,
                                                         @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createSection(courseId, req, user));
    }

    @PutMapping("/sections/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public SectionResponse updateSection(@PathVariable Long id,
                                         @Valid @RequestBody SectionRequest req,
                                         @AuthenticationPrincipal User user) {
        return courseService.updateSection(id, req, user);
    }

    @DeleteMapping("/sections/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id,
                                              @AuthenticationPrincipal User user) {
        courseService.deleteSection(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sections/{sectionId}/lessons")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<LessonResponse> createLesson(@PathVariable Long sectionId,
                                                       @Valid @RequestBody LessonRequest req,
                                                       @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createLesson(sectionId, req, user));
    }

    @PutMapping("/lessons/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public LessonResponse updateLesson(@PathVariable Long id,
                                       @Valid @RequestBody LessonRequest req,
                                       @AuthenticationPrincipal User user) {
        return courseService.updateLesson(id, req, user);
    }

    @DeleteMapping("/lessons/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id,
                                             @AuthenticationPrincipal User user) {
        courseService.deleteLesson(id, user);
        return ResponseEntity.noContent().build();
    }
}
