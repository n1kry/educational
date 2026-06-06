import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentResponse } from '../../../core/models/course.model';

@Component({
  selector: 'app-unenroll-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h3 mat-dialog-title>Отписаться от курса</h3>
    <mat-dialog-content>
      <p>Вы уверены? Весь прогресс по курсу <strong>«{{ data.courseTitle }}»</strong>
         будет удалён без возможности восстановления.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Отмена</button>
      <button mat-flat-button [mat-dialog-close]="true" style="background:var(--mat-sys-error);color:#fff">
        Отписаться
      </button>
    </mat-dialog-actions>
  `
})
export class UnenrollDialogComponent {
  data = inject(MAT_DIALOG_DATA) as { courseTitle: string };
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [
    RouterLink, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatProgressSpinnerModule,
    MatCheckboxModule, MatDialogModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  templateUrl: './my-courses.html',
  styleUrl: './my-courses.scss'
})
export class MyCoursesComponent implements OnInit {
  enrollments: EnrollmentResponse[] = [];
  loading = true;

  search = '';
  selectedCategory = '';
  hideCompleted = true;
  showUpdatedCompleted = false;

  constructor(
    private courseService: CourseService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.courseService.getMyEnrollments().subscribe({
      next: list => { this.enrollments = list; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get categories(): string[] {
    return [...new Set(this.enrollments.map(e => e.category).filter(Boolean))].sort();
  }

  get filteredEnrollments(): EnrollmentResponse[] {
    const q = this.search.toLowerCase().trim();
    return this.enrollments.filter(e => {
      if (q && !e.courseTitle.toLowerCase().includes(q)) return false;
      if (this.selectedCategory && e.category !== this.selectedCategory) return false;
      if (e.completedAt) {
        if (!this.hideCompleted) return true;
        return this.showUpdatedCompleted && this.isUpdatedAfterCompletion(e);
      }
      return true;
    });
  }

  isUpdatedAfterCompletion(e: EnrollmentResponse): boolean {
    if (!e.completedAt || !e.courseUpdatedAt) return false;
    return new Date(e.courseUpdatedAt) > new Date(e.completedAt);
  }

  formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  clearFilters() {
    this.search = '';
    this.selectedCategory = '';
  }

  get hasActiveFilters(): boolean {
    return !!this.search || !!this.selectedCategory;
  }

  go(courseId: number) { this.router.navigate(['/learn', courseId]); }

  unenroll(e: EnrollmentResponse, event: MouseEvent) {
    event.stopPropagation();
    this.dialog.open(UnenrollDialogComponent, {
      data: { courseTitle: e.courseTitle },
      width: '420px'
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.courseService.unenroll(e.courseId).subscribe({
        next: () => {
          this.enrollments = this.enrollments.filter(x => x.courseId !== e.courseId);
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
    });
  }
}
