package com.platform.educational.repository;

import com.platform.educational.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByStudentIdAndLessonId(Long studentId, Long lessonId);

    @Query("SELECT lp FROM LessonProgress lp WHERE lp.student.id = :studentId AND lp.lesson.section.course.id = :courseId")
    List<LessonProgress> findByStudentIdAndCourseId(Long studentId, Long courseId);

    long countByStudentIdAndLessonSectionCourseIdAndCompletedTrue(Long studentId, Long courseId);
}
