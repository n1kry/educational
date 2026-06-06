package com.platform.educational.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_results",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "quiz_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private boolean passed;

    @Column(nullable = false)
    private int attempts = 1;

    @Column(name = "passed_at")
    private LocalDateTime passedAt;
}
