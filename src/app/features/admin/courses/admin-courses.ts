import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin.service';
import { CourseResponse } from '../../../core/models/course.model';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.scss'
})
export class AdminCoursesComponent implements OnInit {
  courses: CourseResponse[] = [];
  loading = true;
  displayedColumns = ['id', 'title', 'teacher', 'category', 'status', 'sections', 'actions'];

  constructor(
    private adminService: AdminService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.adminService.getAllCourses().subscribe({
      next: c => { this.courses = c; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  delete(id: number) {
    if (!confirm('Удалить курс?')) return;
    this.adminService.deleteCourse(id).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => c.id !== id);
        this.snack.open('Курс удалён', '', { duration: 2000 });
        this.cdr.detectChanges();
      }
    });
  }
}
