import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { QuizResponse, QuizResultResponse } from '../../../core/models/course.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatRadioModule, MatProgressSpinnerModule, MatDividerModule
  ],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss'
})
export class QuizComponent implements OnInit {
  quizId!: number;
  quiz: QuizResponse | null = null;
  loading = true;
  submitting = false;

  answers: Record<number, string> = {};
  result: QuizResultResponse | null = null;
  objectKeys = Object.keys;

  private courseId: number | null = null;
  private lastLessonId: number | null = null;
  nextLessonId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));

    this.loadQuiz();
  }

  private loadQuiz() {
    const state = history.state as { quiz?: QuizResponse; courseId?: number; lastLessonId?: number; nextLessonId?: number };
    this.courseId = state?.courseId ?? null;
    this.lastLessonId = state?.lastLessonId ?? null;
    this.nextLessonId = state?.nextLessonId ?? null;
    if (state?.quiz) {
      this.quiz = state.quiz;
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  allAnswered(): boolean {
    if (!this.quiz) return false;
    return this.quiz.questions.every(q => this.answers[q.id]);
  }

  submit() {
    if (!this.allAnswered() || !this.quiz) return;
    this.submitting = true;
    this.courseService.submitQuiz({ quizId: this.quizId, answers: this.answers }).subscribe({
      next: res => {
        this.result = res;
        this.submitting = false;
        this.cdr.detectChanges();
      },
      error: () => { this.submitting = false; this.cdr.detectChanges(); }
    });
  }

  back() {
    if (this.courseId) {
      this.router.navigate(['/learn', this.courseId],
        this.lastLessonId ? { state: { lessonId: this.lastLessonId } } : {});
    } else {
      this.router.navigate(['/my-courses']);
    }
  }

  continueToNext() {
    if (this.courseId && this.nextLessonId) {
      this.router.navigate(['/learn', this.courseId], { state: { lessonId: this.nextLessonId } });
    } else {
      this.back();
    }
  }
}
