import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { UserResponse } from '../../../core/models/course.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatSelectModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsersComponent implements OnInit {
  users: UserResponse[] = [];
  loading = true;
  displayedColumns = ['id', 'name', 'email', 'role', 'status', 'actions'];
  roles = ['STUDENT', 'TEACHER', 'ADMIN'];

  constructor(
    private adminService: AdminService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

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
}
