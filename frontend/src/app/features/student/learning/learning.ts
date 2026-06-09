import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CourseService } from '../../../core/services/course.service';
import { CourseDetailResponse, LessonResponse, ProgressResponse, SectionResponse } from '../../../core/models/course.model';

@Component({
  selector: 'app-learning',
  standalone: true,
  imports: [
    MatSidenavModule, MatListModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatProgressSpinnerModule, MatDividerModule,
    MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './learning.html',
  styleUrl: './learning.scss'
})
export class LearningComponent implements OnInit {
  courseId!: number;
  course!: CourseDetailResponse;
  loading = true;

  activeLesson: LessonResponse | null = null;
  safeUrl: SafeResourceUrl | null = null;
  completing = false;
  private returnLessonId: number | null = null;
  progress: ProgressResponse = { progressPercent: 0, completedLessonIds: [], passedQuizIds: [], completedAt: null };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private sanitizer: DomSanitizer,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.returnLessonId = (history.state as any)?.lessonId ?? null;
    this.load();
  }

  private load() {
    this.loading = true;
    this.courseService.getCourseDetail(this.courseId).subscribe({
      next: course => {
        this.course = course;
        this.courseService.getProgress(this.courseId).subscribe({
          next: p => {
            this.progress = p;
            if (!this.activeLesson) {
              const target = this.returnLessonId
                ? course.sections.flatMap(s => s.lessons).find(l => l.id === this.returnLessonId)
                : null;
              this.selectLesson(target ?? course.sections[0]?.lessons[0]);
              this.returnLessonId = null;
            }
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => { this.loading = false; this.cdr.detectChanges(); }
        });
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  selectLesson(lesson: LessonResponse | undefined) {
    if (!lesson) return;
    this.activeLesson = lesson;
    this.safeUrl = lesson.videoUrl ? this.toEmbedUrl(lesson.videoUrl) : null;
    this.cdr.detectChanges();
  }

  isCompleted(lessonId: number): boolean {
    return this.progress?.completedLessonIds?.includes(lessonId) ?? false;
  }

  isQuizPassed(quizId: number): boolean {
    return this.progress?.passedQuizIds?.includes(quizId) ?? false;
  }

  isQuizLocked(section: SectionResponse): boolean {
    if (!section.quiz) return true;
    const idx = this.course.sections.indexOf(section);
    if (idx === 0) return false;
    const prev = this.course.sections[idx - 1];
    return !prev.quiz || !this.isQuizPassed(prev.quiz.id);
  }

  completeLesson() {
    if (!this.activeLesson || this.isCompleted(this.activeLesson.id)) return;
    this.completing = true;
    this.courseService.completeLesson(this.activeLesson.id).subscribe({
      next: () => {
        this.completing = false;
        this.snack.open('Урок пройден!', '', { duration: 2000 });
        this.load();
      },
      error: () => { this.completing = false; this.cdr.detectChanges(); }
    });
  }

  goQuiz(quizId: number) {
    const quiz = this.findQuizById(quizId);
    const sectionIdx = this.course.sections.findIndex(s => s.quiz?.id === quizId);
    const section = sectionIdx >= 0 ? this.course.sections[sectionIdx] : null;
    const lastLessonId = section?.lessons.at(-1)?.id ?? null;
    const nextSection = sectionIdx >= 0 ? this.course.sections[sectionIdx + 1] : null;
    const nextLessonId = nextSection?.lessons[0]?.id ?? null;
    this.router.navigate(['/quiz', quizId], {
      state: { quiz, courseId: this.courseId, lastLessonId, nextLessonId }
    });
  }

  private findQuizById(quizId: number) {
    for (const s of this.course.sections) {
      if (s.quiz?.id === quizId) return s.quiz;
    }
    return this.course.finalQuiz?.id === quizId ? this.course.finalQuiz : null;
  }

  formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private toEmbedUrl(url: string): SafeResourceUrl {
    let videoId = '';
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (watchMatch) videoId = watchMatch[1];
    else if (shortMatch) videoId = shortMatch[1];
    const embed = videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  }
}
