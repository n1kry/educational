package com.platform.educational.service;

import com.platform.educational.dto.response.EnrollmentResponse;
import com.platform.educational.entity.*;
import com.platform.educational.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final CourseProgressRepository courseProgressRepository;

    @Transactional
    public void enroll(Long courseId, User student) {
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already enrolled");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        enrollmentRepository.save(Enrollment.builder()
                .student(student)
                .course(course)
                .build());

        courseProgressRepository.save(CourseProgress.builder()
                .student(student)
                .course(course)
                .progressPercent(0)
                .build());
    }

    public List<EnrollmentResponse> getMyEnrollments(User student) {
        return enrollmentRepository.findByStudentId(student.getId()).stream()
                .map(e -> {
                    int progress = courseProgressRepository
                            .findByStudentIdAndCourseId(student.getId(), e.getCourse().getId())
                            .map(CourseProgress::getProgressPercent)
                            .orElse(0);
                    return EnrollmentResponse.builder()
                            .courseId(e.getCourse().getId())
                            .courseTitle(e.getCourse().getTitle())
                            .thumbnailUrl(e.getCourse().getThumbnailUrl())
                            .enrolledAt(e.getEnrolledAt())
                            .progressPercent(progress)
                            .build();
                })
                .toList();
    }

    public boolean isEnrolled(Long courseId, Long studentId) {
        return enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
    }
}
