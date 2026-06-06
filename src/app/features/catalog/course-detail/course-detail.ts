import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { CourseDetailResponse } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatExpansionModule,
    MatProgressSpinnerModule, MatChipsModule, MatSnackBarModule, MatDividerModule
  ],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss'
})
export class CourseDetailComponent implements OnInit {
  course!: CourseDetailResponse;
  loading = true;
  enrolling = false;
  enrolled = false;
  completedAt: string | null = null;
  courseId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    public auth: AuthService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.courseService.getCourseDetail(this.courseId).subscribe({
      next: c => {
        this.course = c;
        this.loading = false;
        this.checkEnrollment();
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get isStudent(): boolean {
    return this.auth.role() === 'STUDENT';
  }

  private checkEnrollment() {
    if (!this.isStudent) return;
    this.courseService.getMyEnrollments().subscribe({
      next: list => {
        const entry = list.find(e => e.courseId === this.courseId);
        this.enrolled = !!entry;
        this.completedAt = entry?.completedAt ?? null;
        this.cdr.detectChanges();
      }
    });
  }

  enroll() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.enrolling = true;
    this.courseService.enroll(this.courseId).subscribe({
      next: () => {
        this.enrolled = true;
        this.enrolling = false;
        this.snack.open('Вы записаны на курс!', '', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.enrolling = false;
        this.snack.open(err?.message ?? 'Ошибка записи', '', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  goLearn() {
    this.router.navigate(['/learn', this.courseId]);
  }

  formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  totalLessons(): number {
    return this.course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  }
}
