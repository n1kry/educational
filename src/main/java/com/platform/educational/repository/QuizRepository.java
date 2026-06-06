package com.platform.educational.repository;

import com.platform.educational.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findBySectionId(Long sectionId);
    Optional<Quiz> findByCourseIdAndFinalQuizTrue(Long courseId);

    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.section.course.id = :courseId OR (q.course.id = :courseId AND q.finalQuiz = true)")
    long countByCourseId(@Param("courseId") Long courseId);
}
