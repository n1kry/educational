import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserResponse, CourseResponse } from '../models/course.model';

const BASE = 'http://localhost:8080/api/admin';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getUsers() { return this.http.get<UserResponse[]>(`${BASE}/users`); }
  toggleActive(id: number) { return this.http.patch<void>(`${BASE}/users/${id}/toggle-active`, {}); }
  changeRole(id: number, role: string) { return this.http.patch<void>(`${BASE}/users/${id}/role?role=${role}`, {}); }
  approveTeacher(id: number) { return this.http.post<void>(`${BASE}/users/${id}/approve-teacher`, {}); }
  denyTeacher(id: number) { return this.http.post<void>(`${BASE}/users/${id}/deny-teacher`, {}); }
  getAllCourses() { return this.http.get<CourseResponse[]>(`${BASE}/courses`); }
  deleteCourse(id: number) { return this.http.delete<void>(`${BASE}/courses/${id}`); }
}
