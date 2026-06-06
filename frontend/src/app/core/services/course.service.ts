import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CourseRequest, CourseResponse, CourseDetailResponse,
  SectionRequest, SectionResponse,
  LessonRequest, LessonResponse,
  QuizRequest, QuizResponse,
  QuestionRequest,
  QuizSubmitRequest, QuizResultResponse,
  EnrollmentResponse, ProgressResponse
} from '../models/course.model';

const BASE = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class CourseService {
  constructor(private http: HttpClient) {}

  getPublishedCourses() { 
    return this.http.get<CourseResponse[]>(`${BASE}/courses`); 
  }
  getCourseDetail(id: number) { 
    return this.http.get<CourseDetailResponse>(`${BASE}/courses/${id}`); 
  }

  getMyCourses() { 
    return this.http.get<CourseResponse[]>(`${BASE}/courses/my`); 
  }
  createCourse(req: CourseRequest) { 
    return this.http.post<CourseResponse>(`${BASE}/courses`, req); 
  }
  updateCourse(id: number, req: CourseRequest) {
    return this.http.put<CourseResponse>(`${BASE}/courses/${id}`, req);
  }
  togglePublish(id: number) { 
    return this.http.patch<void>(`${BASE}/courses/${id}/publish`, {}); 
  }
  deleteCourse(id: number) { 
    return this.http.delete<void>(`${BASE}/courses/${id}`); 
  }

  createSection(courseId: number, req: SectionRequest) { 
    return this.http.post<SectionResponse>(`${BASE}/courses/${courseId}/sections`, req); 
  }
  updateSection(id: number, req: SectionRequest) { 
    return this.http.put<SectionResponse>(`${BASE}/sections/${id}`, req); 
  }
  deleteSection(id: number) { 
    return this.http.delete<void>(`${BASE}/sections/${id}`); 
  }

  createLesson(sectionId: number, req: LessonRequest) { 
    return this.http.post<LessonResponse>(`${BASE}/sections/${sectionId}/lessons`, req); 
  }
  updateLesson(id: number, req: LessonRequest) { 
    return this.http.put<LessonResponse>(`${BASE}/lessons/${id}`, req); 
  }
  deleteLesson(id: number) { 
    return this.http.delete<void>(`${BASE}/lessons/${id}`); 
  }

  createSectionQuiz(sectionId: number, req: QuizRequest) { 
    return this.http.post<QuizResponse>(`${BASE}/sections/${sectionId}/quiz`, req); 
  }
  createFinalQuiz(courseId: number, req: QuizRequest) { 
    return this.http.post<QuizResponse>(`${BASE}/courses/${courseId}/quiz/final`, req); 
  }
  addQuestion(quizId: number, req: QuestionRequest) { 
    return this.http.post<void>(`${BASE}/quizzes/${quizId}/questions`, req); 
  }
  deleteQuestion(questionId: number) { 
    return this.http.delete<void>(`${BASE}/questions/${questionId}`); 
  }

  enroll(courseId: number) { 
    return this.http.post<void>(`${BASE}/enrollments/${courseId}`, {}); 
  }
  unenroll(courseId: number) { 
    return this.http.delete<void>(`${BASE}/enrollments/${courseId}`); 
  }
  getMyEnrollments() { 
    return this.http.get<EnrollmentResponse[]>(`${BASE}/enrollments`); 
  }
  getProgress(courseId: number) { 
    return this.http.get<ProgressResponse>(`${BASE}/progress/${courseId}`); 
  }
  completeLesson(lessonId: number) { 
    return this.http.post<void>(`${BASE}/lessons/${lessonId}/complete`, {}); 
  }
  submitQuiz(req: QuizSubmitRequest) { 
    return this.http.post<QuizResultResponse>(`${BASE}/quizzes/submit`, req); 
  }
}
