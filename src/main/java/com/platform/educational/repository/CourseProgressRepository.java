package com.platform.educational.repository;

import com.platform.educational.entity.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {
    Optional<CourseProgress> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
