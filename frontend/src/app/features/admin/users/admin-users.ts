import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserResponse } from '../../../core/models/course.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatTooltipModule, MatBadgeModule
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsersComponent implements OnInit {
  users: UserResponse[] = [];
  loading = true;
  displayedColumns = ['id', 'name', 'email', 'role', 'status', 'teacher-request', 'actions'];
  roles = ['STUDENT', 'TEACHER', 'ADMIN'];

  constructor(
    private adminService: AdminService,
    private auth: AuthService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  get currentUserId(): number | null { return this.auth.userId(); }

  get pendingTeacherCount(): number {
    return this.users.filter(u => u.requestedTeacher).length;
  }

  isSelf(user: UserResponse): boolean {
    return user.id === this.currentUserId;
  }

  ngOnInit() { this.load(); }

  load() {
    this.adminService.getUsers().subscribe({
      next: u => { this.users = u; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  toggleActive(user: UserResponse) {
    this.adminService.toggleActive(user.id).subscribe({
      next: () => {
        user.active = !user.active;
        this.snack.open(user.active ? 'Пользователь активирован' : 'Пользователь заблокирован', '', { duration: 2000 });
        this.cdr.detectChanges();
      }
    });
  }

  changeRole(user: UserResponse, role: string) {
    this.adminService.changeRole(user.id, role).subscribe({
      next: () => {
        user.role = role;
        this.snack.open('Роль изменена', '', { duration: 2000 });
        this.cdr.detectChanges();
      }
    });
  }

  approveTeacher(user: UserResponse) {
    this.adminService.approveTeacher(user.id).subscribe({
      next: () => {
        user.role = 'TEACHER';
        user.requestedTeacher = false;
        this.snack.open(`${user.name} — роль TEACHER подтверждена`, '', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  denyTeacher(user: UserResponse) {
    this.adminService.denyTeacher(user.id).subscribe({
      next: () => {
        user.requestedTeacher = false;
        this.snack.open(`${user.name} — запрос отклонён`, '', { duration: 2000 });
        this.cdr.detectChanges();
      }
    });
  }
}
