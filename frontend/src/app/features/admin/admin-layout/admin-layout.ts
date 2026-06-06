import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatTabsModule, MatIconModule],
  template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      <a mat-tab-link routerLink="users" routerLinkActive #usersLink="routerLinkActive"
         [active]="usersLink.isActive">
        <mat-icon style="margin-right:6px">people</mat-icon> Пользователи
      </a>
      <a mat-tab-link routerLink="courses" routerLinkActive #coursesLink="routerLinkActive"
         [active]="coursesLink.isActive">
        <mat-icon style="margin-right:6px">library_books</mat-icon> Курсы
      </a>
    </nav>
    <mat-tab-nav-panel #tabPanel>
      <div style="padding: 24px 0">
        <router-outlet />
      </div>
    </mat-tab-nav-panel>
  `
})
export class AdminLayoutComponent {}
