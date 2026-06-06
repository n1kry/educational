package com.platform.educational.service;

import com.platform.educational.dto.request.QuestionRequest;
import com.platform.educational.dto.request.QuizRequest;
import com.platform.educational.dto.request.QuizSubmitRequest;
import com.platform.educational.dto.response.QuizResultResponse;
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
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;
    private final QuizResultRepository quizResultRepository;
    private final ProgressService progressService;

    @Transactional
    public Quiz createSectionQuiz(Long sectionId, QuizRequest req, User teacher) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Section not found"));
        checkOwnership(section.getCourse(), teacher);
        if (section.getQuiz() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Section already has a quiz");
        }
        Quiz quiz = Quiz.builder()
                .section(section)
                .title(req.getTitle())
                .passingScore(req.getPassingScore())
                .finalQuiz(false)
                .build();
        return quizRepository.save(quiz);
    }

    @Transactional
    public Quiz createFinalQuiz(Long courseId, QuizRequest req, User teacher) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        checkOwnership(course, teacher);
        if (quizRepository.findByCourseIdAndFinalQuizTrue(courseId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Final quiz already exists");
        }
        Quiz quiz = Quiz.builder()
                .course(course)
                .title(req.getTitle())
                .passingScore(req.getPassingScore())
                .finalQuiz(true)
                .build();
        return quizRepository.save(quiz);
    }

    @Transactional
    public Question addQuestion(Long quizId, QuestionRequest req, User teacher) {
        Quiz quiz = findQuizOrThrow(quizId);
        checkQuizOwnership(quiz, teacher);

        Question question = Question.builder()
                .quiz(quiz)
                .text(req.getText())
                .correctAnswer(req.getCorrectAnswer())
                .build();
        questionRepository.save(question);

        req.getOptions().forEach(o -> question.getOptions().add(
                AnswerOption.builder()
                        .question(question)
                        .optionKey(o.getOptionKey())
                        .text(o.getText())
                        .build()
        ));
        return questionRepository.save(question);
    }

    @Transactional
    public void deleteQuestion(Long questionId, User teacher) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        checkQuizOwnership(question.getQuiz(), teacher);
        questionRepository.delete(question);
    }

    @Transactional
    public QuizResultResponse submitQuiz(QuizSubmitRequest req, User student) {
        Quiz quiz = findQuizOrThrow(req.getQuizId());
        Long courseId = resolveCourseId(quiz);

        if (!quiz.isFinalQuiz() && quiz.getSection() != null) {
            if (!progressService.isSectionQuizUnlocked(quiz.getSection().getId(), student.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Complete the previous section first");
            }
        }

        List<Question> questions = quiz.getQuestions();
        if (questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz has no questions");
        }

        long correct = questions.stream()
                .filter(q -> req.getAnswers().getOrDefault(q.getId(), "").equals(q.getCorrectAnswer()))
                .count();

        int score = (int) (correct * 100.0 / questions.size());
        boolean passed = score >= quiz.getPassingScore();

        QuizResult result = quizResultRepository.findByStudentIdAndQuizId(student.getId(), quiz.getId())
                .orElse(QuizResult.builder().student(student).quiz(quiz).attempts(0).build());

        result.setScore(score);
        result.setPassed(passed);
        result.setAttempts(result.getAttempts() + 1);
        if (passed && result.getPassedAt() == null) result.setPassedAt(LocalDateTime.now());
        quizResultRepository.save(result);

        if (passed) progressService.onQuizPassed(student, courseId);

        return QuizResultResponse.builder()
                .score(score)
                .passed(passed)
                .attempts(result.getAttempts())
                .passedAt(result.getPassedAt())
                .message(passed ? "Тест пройден!" : "Недостаточно баллов. Попробуйте ещё раз.")
                .build();
    }

    private Quiz findQuizOrThrow(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
    }

    private Long resolveCourseId(Quiz quiz) {
        if (quiz.getSection() != null) return quiz.getSection().getCourse().getId();
        if (quiz.getCourse() != null) return quiz.getCourse().getId();
        throw new IllegalStateException("Quiz has no associated course");
    }

    private void checkOwnership(Course course, User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !course.getTeacher().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private void checkQuizOwnership(Quiz quiz, User user) {
        Course course = quiz.isFinalQuiz() ? quiz.getCourse() : quiz.getSection().getCourse();
        checkOwnership(course, user);
    }
}
