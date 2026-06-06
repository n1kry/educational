package com.platform.educational.controller;

import com.platform.educational.dto.request.QuestionRequest;
import com.platform.educational.dto.request.QuizRequest;
import com.platform.educational.dto.request.QuizSubmitRequest;
import com.platform.educational.dto.response.QuizResultResponse;
import com.platform.educational.entity.User;
import com.platform.educational.service.CourseService;
import com.platform.educational.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final CourseService courseService;


    @PostMapping("/sections/{sectionId}/quiz")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Object> createSectionQuiz(@PathVariable Long sectionId,
                                                    @Valid @RequestBody QuizRequest req,
                                                    @AuthenticationPrincipal User user) {
        var quiz = quizService.createSectionQuiz(sectionId, req, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.toQuizResponse(quiz));
    }

    @PostMapping("/courses/{courseId}/quiz/final")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Object> createFinalQuiz(@PathVariable Long courseId,
                                                   @Valid @RequestBody QuizRequest req,
                                                   @AuthenticationPrincipal User user) {
        var quiz = quizService.createFinalQuiz(courseId, req, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.toQuizResponse(quiz));
    }

    @PostMapping("/quizzes/{quizId}/questions")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> addQuestion(@PathVariable Long quizId,
                                            @Valid @RequestBody QuestionRequest req,
                                            @AuthenticationPrincipal User user) {
        quizService.addQuestion(quizId, req, user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/questions/{questionId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId,
                                               @AuthenticationPrincipal User user) {
        quizService.deleteQuestion(questionId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quizzes/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public QuizResultResponse submitQuiz(@RequestBody QuizSubmitRequest req,
                                         @AuthenticationPrincipal User user) {
        return quizService.submitQuiz(req, user);
    }
}
