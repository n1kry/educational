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
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth.service';
import { CourseResponse } from '../../core/models/course.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCheckboxModule, MatTooltipModule
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
  enrolledIds = new Set<number>();

  categories = ['Программирование', 'Дизайн', 'Бизнес', 'Математика', 'Языки', 'Другое'];

  constructor(
    private courseService: CourseService,
    public auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get isStudent(): boolean {
    return this.auth.isLoggedIn() && this.auth.role() === 'STUDENT';
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

    if (this.isStudent) {
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
        c.description.toLowerCase().includes(this.search.toLowerCase());
      const matchCat = !this.selectedCategory || c.category === this.selectedCategory;
      const matchEnrolled = !this.isStudent || !this.hideEnrolled || !this.enrolledIds.has(c.id);
      return matchSearch && matchCat && matchEnrolled;
    });
  }

  open(id: number) {
    this.router.navigate(['/courses', id]);
  }
}
