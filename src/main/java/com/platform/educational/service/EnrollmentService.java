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
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizResultRepository quizResultRepository;

    @Transactional
    public void enroll(Long courseId, User student) {
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already enrolled");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        if (course.getTeacher().getId().equals(student.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot enroll in your own course");
        }

        enrollmentRepository.save(Enrollment.builder()
                .student(student)
                .course(course)
                .build());

        courseProgressRepository.save(CourseProgress.builder()
                .student(student)
                .course(course)
                .build());
    }

    @Transactional
    public void unenroll(Long courseId, User student) {
        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not enrolled"));

        lessonProgressRepository.deleteAll(
                lessonProgressRepository.findByStudentIdAndCourseId(student.getId(), courseId));
        quizResultRepository.deleteAll(
                quizResultRepository.findByStudentIdAndCourseId(student.getId(), courseId));
        courseProgressRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .ifPresent(courseProgressRepository::delete);
        enrollmentRepository.delete(enrollment);
    }

    public List<EnrollmentResponse> getMyEnrollments(User student) {
        return enrollmentRepository.findByStudentId(student.getId()).stream()
                .map(e -> {
                    CourseProgress cp = courseProgressRepository
                            .findByStudentIdAndCourseId(student.getId(), e.getCourse().getId())
                            .orElse(null);
                    int progress = cp != null ? cp.getProgressPercent() : 0;
                    String completedAt = (cp != null && cp.getCompletedAt() != null)
                            ? cp.getCompletedAt().toString()
                            : null;
                    String courseUpdatedAt = e.getCourse().getContentUpdatedAt() != null
                            ? e.getCourse().getContentUpdatedAt().toString()
                            : null;
                    return EnrollmentResponse.builder()
                            .courseId(e.getCourse().getId())
                            .courseTitle(e.getCourse().getTitle())
                            .category(e.getCourse().getCategory())
                            .thumbnailUrl(e.getCourse().getThumbnailUrl())
                            .enrolledAt(e.getEnrolledAt())
                            .progressPercent(progress)
                            .completedAt(completedAt)
                            .courseUpdatedAt(courseUpdatedAt)
                            .build();
                })
                .toList();
    }

    public boolean isEnrolled(Long courseId, Long studentId) {
        return enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
    }
}
