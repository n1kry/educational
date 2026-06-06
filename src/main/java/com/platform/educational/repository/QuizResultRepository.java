package com.platform.educational.repository;

import com.platform.educational.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    Optional<QuizResult> findByStudentIdAndQuizId(Long studentId, Long quizId);

    @Query("SELECT qr FROM QuizResult qr WHERE qr.student.id = :studentId AND " +
           "(qr.quiz.section.course.id = :courseId OR (qr.quiz.course.id = :courseId AND qr.quiz.finalQuiz = true))")
    List<QuizResult> findByStudentIdAndCourseId(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    @Query("SELECT COUNT(qr) FROM QuizResult qr WHERE qr.student.id = :studentId AND qr.passed = true AND " +
           "(qr.quiz.section.course.id = :courseId OR (qr.quiz.course.id = :courseId AND qr.quiz.finalQuiz = true))")
    long countPassedByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
}
