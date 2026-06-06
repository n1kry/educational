import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CourseService } from '../../../core/services/course.service';
import { CourseResponse } from '../../../core/models/course.model';

@Component({
  selector: 'app-teacher-courses',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule
  ],
  templateUrl: './teacher-courses.html',
  styleUrl: './teacher-courses.scss'
})
export class TeacherCoursesComponent implements OnInit {
  courses: CourseResponse[] = [];
  loading = true;

  constructor(
    private courseService: CourseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.courseService.getMyCourses().subscribe({
      next: c => { this.courses = c; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  togglePublish(course: CourseResponse) {
    this.courseService.togglePublish(course.id).subscribe(() => {
      course.published = !course.published;
      this.cdr.detectChanges();
    });
  }

  deleteCourse(id: number) {
    if (!confirm('Удалить курс?')) return;
    this.courseService.deleteCourse(id).subscribe(() => {
      this.courses = this.courses.filter(c => c.id !== id);
      this.cdr.detectChanges();
    });
  }

  edit(id: number) {
    this.router.navigate(['/teacher/edit', id]);
  }
}
