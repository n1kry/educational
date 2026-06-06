package com.platform.educational.service;

import com.platform.educational.dto.request.CourseRequest;
import com.platform.educational.dto.request.LessonRequest;
import com.platform.educational.dto.request.SectionRequest;
import com.platform.educational.dto.response.*;
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
public class CourseService {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;

    public List<CourseResponse> getPublishedCourses() {
        return courseRepository.findByPublishedTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseDetailResponse getCourseDetail(Long courseId) {
        Course course = findCourseOrThrow(courseId);
        return toDetailResponse(course);
    }

    public List<CourseResponse> getTeacherCourses(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest req, User teacher) {
        Course course = Course.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .thumbnailUrl(req.getThumbnailUrl())
                .published(false)
                .teacher(teacher)
                .build();
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseRequest req, User user) {
        Course course = findAndCheckOwnership(courseId, user);
        course.setTitle(req.getTitle());
        course.setDescription(req.getDescription());
        course.setCategory(req.getCategory());
        course.setThumbnailUrl(req.getThumbnailUrl());
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public void togglePublish(Long courseId, User user) {
        Course course = findAndCheckOwnership(courseId, user);
        course.setPublished(!course.isPublished());
        courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        courseRepository.deleteById(courseId);
    }

    @Transactional
    public SectionResponse createSection(Long courseId, SectionRequest req, User user) {
        Course course = findAndCheckOwnership(courseId, user);
        Section section = Section.builder()
                .course(course)
                .title(req.getTitle())
                .position(req.getPosition())
                .build();
        sectionRepository.save(section);
        touchContent(course);
        return toSectionResponse(section);
    }

    @Transactional
    public SectionResponse updateSection(Long sectionId, SectionRequest req, User user) {
        Section section = findSectionOrThrow(sectionId);
        checkCourseOwnership(section.getCourse(), user);
        section.setTitle(req.getTitle());
        section.setPosition(req.getPosition());
        sectionRepository.save(section);
        touchContent(section.getCourse());
        return toSectionResponse(section);
    }

    @Transactional
    public void deleteSection(Long sectionId, User user) {
        Section section = findSectionOrThrow(sectionId);
        Course course = section.getCourse();
        checkCourseOwnership(course, user);
        sectionRepository.delete(section);
        touchContent(course);
    }

    @Transactional
    public LessonResponse createLesson(Long sectionId, LessonRequest req, User user) {
        Section section = findSectionOrThrow(sectionId);
        checkCourseOwnership(section.getCourse(), user);
        Lesson lesson = Lesson.builder()
                .section(section)
                .title(req.getTitle())
                .description(req.getDescription())
                .videoUrl(req.getVideoUrl())
                .durationMinutes(req.getDurationMinutes())
                .position(req.getPosition())
                .build();
        lessonRepository.save(lesson);
        touchContent(section.getCourse());
        return toLessonResponse(lesson);
    }

    @Transactional
    public LessonResponse updateLesson(Long lessonId, LessonRequest req, User user) {
        Lesson lesson = findLessonOrThrow(lessonId);
        checkCourseOwnership(lesson.getSection().getCourse(), user);
        lesson.setTitle(req.getTitle());
        lesson.setDescription(req.getDescription());
        lesson.setVideoUrl(req.getVideoUrl());
        lesson.setDurationMinutes(req.getDurationMinutes());
        lesson.setPosition(req.getPosition());
        lessonRepository.save(lesson);
        touchContent(lesson.getSection().getCourse());
        return toLessonResponse(lesson);
    }

    @Transactional
    public void deleteLesson(Long lessonId, User user) {
        Lesson lesson = findLessonOrThrow(lessonId);
        Course course = lesson.getSection().getCourse();
        checkCourseOwnership(course, user);
        lessonRepository.delete(lesson);
        touchContent(course);
    }

    public CourseResponse toResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory())
                .thumbnailUrl(c.getThumbnailUrl())
                .published(c.isPublished())
                .teacherName(c.getTeacher().getName())
                .sectionCount(c.getSections().size())
                .build();
    }

    public CourseDetailResponse toDetailResponse(Course course) {
        List<SectionResponse> sections = sectionRepository
                .findByCourseIdOrderByPositionAsc(course.getId())
                .stream().map(this::toSectionResponse).toList();

        QuizResponse finalQuiz = quizRepository.findByCourseIdAndFinalQuizTrue(course.getId())
                .map(this::toQuizResponse).orElse(null);

        return CourseDetailResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .category(course.getCategory())
                .thumbnailUrl(course.getThumbnailUrl())
                .published(course.isPublished())
                .teacherName(course.getTeacher().getName())
                .sections(sections)
                .finalQuiz(finalQuiz)
                .build();
    }

    public SectionResponse toSectionResponse(Section s) {
        List<LessonResponse> lessons = s.getLessons().stream()
                .map(this::toLessonResponse).toList();
        QuizResponse quiz = s.getQuiz() != null ? toQuizResponse(s.getQuiz()) : null;
        return SectionResponse.builder()
                .id(s.getId())
                .title(s.getTitle())
                .position(s.getPosition())
                .lessons(lessons)
                .quiz(quiz)
                .build();
    }

    public LessonResponse toLessonResponse(Lesson l) {
        return LessonResponse.builder()
                .id(l.getId())
                .title(l.getTitle())
                .description(l.getDescription())
                .videoUrl(l.getVideoUrl())
                .durationMinutes(l.getDurationMinutes())
                .position(l.getPosition())
                .build();
    }

    public QuizResponse toQuizResponse(Quiz q) {
        List<com.platform.educational.dto.response.QuestionResponse> questions = q.getQuestions().stream()
                .map(question -> com.platform.educational.dto.response.QuestionResponse.builder()
                        .id(question.getId())
                        .text(question.getText())
                        .options(question.getOptions().stream()
                                .map(o -> com.platform.educational.dto.response.QuestionResponse.OptionResponse.builder()
                                        .optionKey(o.getOptionKey())
                                        .text(o.getText())
                                        .build())
                                .toList())
                        .build())
                .toList();
        return QuizResponse.builder()
                .id(q.getId())
                .title(q.getTitle())
                .passingScore(q.getPassingScore())
                .finalQuiz(q.isFinalQuiz())
                .questions(questions)
                .build();
    }

    private Course findCourseOrThrow(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    private Section findSectionOrThrow(Long id) {
        return sectionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Section not found"));
    }

    private Lesson findLessonOrThrow(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
    }

    private Course findAndCheckOwnership(Long courseId, User user) {
        Course course = findCourseOrThrow(courseId);
        checkCourseOwnership(course, user);
        return course;
    }

    private void touchContent(Course course) {
        course.setContentUpdatedAt(LocalDateTime.now());
        courseRepository.save(course);
    }

    private void checkCourseOwnership(Course course, User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !course.getTeacher().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}
