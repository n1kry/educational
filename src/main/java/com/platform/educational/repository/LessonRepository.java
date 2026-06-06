package com.platform.educational.repository;

import com.platform.educational.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findBySectionIdOrderByPositionAsc(Long sectionId);
    List<Lesson> findBySectionCourseId(Long courseId);
}
