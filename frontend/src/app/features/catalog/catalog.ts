import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth.service';
import { CourseResponse } from '../../core/models/course.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    FormsModule, SlicePipe,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCheckboxModule, MatTooltipModule, MatSnackBarModule
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class CatalogComponent implements OnInit {
  all: CourseResponse[] = [];
  filtered: CourseResponse[] = [];
  loading = true;

  search = '';
  selectedCategory = '';
  hideEnrolled = true;
  hideOwn = true;
  enrolledIds = new Set<number>();

  categories = ['Программирование', 'Дизайн', 'Бизнес', 'Математика', 'Языки', 'Другое'];

  enrolling = new Set<number>();

  constructor(
    private courseService: CourseService,
    public auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get canCreateCourses(): boolean {
    return this.auth.role() === 'TEACHER' || this.auth.role() === 'ADMIN';
  }

  canEnroll(course: CourseResponse): boolean {
    if (!this.auth.isLoggedIn()) return false;
    return course.teacherId !== this.auth.userId();

  }

  ngOnInit() {
    this.courseService.getPublishedCourses().subscribe({
      next: courses => {
        this.all = courses;
        this.loading = false;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });

    if (this.auth.isLoggedIn()) {
      this.courseService.getMyEnrollments().subscribe({
        next: list => {
          this.enrolledIds = new Set(list.map(e => e.courseId));
          this.applyFilter();
          this.cdr.detectChanges();
        }
      });
    }
  }

  applyFilter() {
    this.filtered = this.all.filter(c => {
      const matchSearch = !this.search ||
        c.title.toLowerCase().includes(this.search.toLowerCase()) ||
        this.plainText(c.description).toLowerCase().includes(this.search.toLowerCase());
      const matchCat = !this.selectedCategory || c.category === this.selectedCategory;
      const matchEnrolled = !this.hideEnrolled || !this.enrolledIds.has(c.id);
      const matchOwn = !this.hideOwn || c.teacherId !== this.auth.userId();
      return matchSearch && matchCat && matchEnrolled && matchOwn;
    });
  }

  plainText(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent ?? tmp.innerText ?? '';
  }

  enroll(course: CourseResponse, event: MouseEvent) {
    event.stopPropagation();
    if (this.enrolling.has(course.id)) return;
    this.enrolling.add(course.id);
    this.courseService.enroll(course.id).subscribe({
      next: () => {
        this.enrolledIds.add(course.id);
        this.enrolling.delete(course.id);
        this.snack.open(`Вы записались на «${course.title}»`, '', { duration: 3000 });
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: () => {
        this.enrolling.delete(course.id);
        this.cdr.detectChanges();
      }
    });
  }

  open(id: number) {
    this.router.navigate(['/courses', id]);
  }
}
