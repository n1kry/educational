package com.platform.educational.service;

import com.platform.educational.dto.response.ProgressResponse;
import com.platform.educational.entity.*;
import com.platform.educational.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProgressService {

    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizResultRepository quizResultRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final SectionRepository sectionRepository;
    private final QuizRepository quizRepository;
    private final EnrollmentRepository enrollmentRepository;

    public ProgressResponse getCourseProgress(Long courseId, User student) {
        List<Long> completedLessonIds = lessonProgressRepository
                .findByStudentIdAndCourseId(student.getId(), courseId)
                .stream().filter(LessonProgress::isCompleted).map(lp -> lp.getLesson().getId()).toList();

        List<Long> passedQuizIds = quizResultRepository
                .findByStudentIdAndCourseId(student.getId(), courseId)
                .stream().filter(QuizResult::isPassed).map(qr -> qr.getQuiz().getId()).toList();

        CourseProgress cp = courseProgressRepository
                .findByStudentIdAndCourseId(student.getId(), courseId).orElse(null);

        int percent = cp != null ? cp.getProgressPercent() : 0;
        String completedAt = (cp != null && cp.getCompletedAt() != null)
                ? cp.getCompletedAt().toString()
                : null;

        return ProgressResponse.builder()
                .progressPercent(percent)
                .completedLessonIds(completedLessonIds)
                .passedQuizIds(passedQuizIds)
                .completedAt(completedAt)
                .build();
    }

    @Transactional
    public void completeLesson(Long lessonId, User student) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        Long courseId = lesson.getSection().getCourse().getId();
        checkEnrolled(student.getId(), courseId);

        LessonProgress progress = lessonProgressRepository
                .findByStudentIdAndLessonId(student.getId(), lessonId)
                .orElse(LessonProgress.builder().student(student).lesson(lesson).build());

        if (!progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            lessonProgressRepository.save(progress);
            recalculate(student, courseId);
        }
    }

    @Transactional
    public void onQuizPassed(User student, Long courseId) {
        recalculate(student, courseId);
    }

    public boolean isSectionQuizUnlocked(Long sectionId, Long studentId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Section not found"));
        List<Section> sections = sectionRepository
                .findByCourseIdOrderByPositionAsc(section.getCourse().getId());

        int idx = -1;
        for (int i = 0; i < sections.size(); i++) {
            if (sections.get(i).getId().equals(sectionId)) { idx = i; break; }
        }
        if (idx <= 0) return true;

        Section prev = sections.get(idx - 1);
        if (prev.getQuiz() == null) return true;

        return quizResultRepository.findByStudentIdAndQuizId(studentId, prev.getQuiz().getId())
                .map(QuizResult::isPassed).orElse(false);
    }

    private void recalculate(User student, Long courseId) {
        long totalLessons = lessonRepository.findBySectionCourseId(courseId).size();
        long totalQuizzes = quizRepository.countByCourseId(courseId);
        long totalWeight = totalLessons + totalQuizzes * 2;
        if (totalWeight == 0) return;

        long completedLessons = lessonProgressRepository
                .countByStudentIdAndLessonSectionCourseIdAndCompletedTrue(student.getId(), courseId);
        long passedQuizzes = quizResultRepository.countPassedByStudentAndCourse(student.getId(), courseId);

        int percent = (int) Math.min(100, ((completedLessons + passedQuizzes * 2) * 100.0 / totalWeight));

        Course course = new Course(); course.setId(courseId);
        CourseProgress cp = courseProgressRepository
                .findByStudentIdAndCourseId(student.getId(), courseId)
                .orElse(CourseProgress.builder().student(student).course(course).build());
        cp.setProgressPercent(percent);
        if (percent == 100 && cp.getCompletedAt() == null) {
            cp.setCompletedAt(LocalDateTime.now());
        }
        courseProgressRepository.save(cp);
    }

    private void checkEnrolled(Long studentId, Long courseId) {
        if (!enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not enrolled");
        }
    }
}
