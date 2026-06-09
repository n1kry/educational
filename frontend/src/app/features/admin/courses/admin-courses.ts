import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminService } from '../../../core/services/admin.service';
import { CourseResponse } from '../../../core/models/course.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule
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
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.adminService.getAllCourses().subscribe({
      next: c => { this.courses = c; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  delete(id: number) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Удалить курс', message: 'Это действие нельзя отменить. Курс будет удалён безвозвратно.' }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.adminService.deleteCourse(id).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== id);
          this.snack.open('Курс удалён', '', { duration: 2000 });
          this.cdr.detectChanges();
        }
      });
    });
  }
}
