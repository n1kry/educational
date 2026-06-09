export interface CourseRequest {
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
}

export interface SectionRequest {
  title: string;
  description: string;
  position: number;
}

export interface LessonRequest {
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: number | null;
  position: number;
}

export interface QuizRequest {
  title: string;
  passingScore: number;
}

export interface AnswerOption {
  optionKey: string;
  text: string;
}

export interface QuestionRequest {
  text: string;
  correctAnswer: string;
  options: AnswerOption[];
}

export interface QuizSubmitRequest {
  quizId: number;
  answers: Record<number, string>;
}

export interface CourseResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  published: boolean;
  teacherId: number;
  teacherName: string;
  sectionCount: number;
}

export interface LessonResponse {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: number | null;
  position: number;
}

export interface OptionResponse {
  optionKey: string;
  text: string;
}

export interface QuestionResponse {
  id: number;
  text: string;
  correctAnswer: string;
  options: OptionResponse[];
}

export interface QuizResponse {
  id: number;
  title: string;
  passingScore: number;
  finalQuiz: boolean;
  questions: QuestionResponse[];
}

export interface SectionResponse {
  id: number;
  title: string;
  description: string;
  position: number;
  lessons: LessonResponse[];
  quiz: QuizResponse | null;
}

export interface CourseDetailResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  published: boolean;
  teacherId: number;
  teacherName: string;
  sections: SectionResponse[];
  finalQuiz: QuizResponse | null;
}

export interface QuizResultResponse {
  score: number;
  passed: boolean;
  attempts: number;
  passedAt: string | null;
  message: string;
}

export interface EnrollmentResponse {
  courseId: number;
  courseTitle: string;
  category: string;
  thumbnailUrl: string;
  enrolledAt: string;
  progressPercent: number;
  completedAt: string | null;
  courseUpdatedAt: string | null;
}

export interface ProgressResponse {
  progressPercent: number;
  completedLessonIds: number[];
  passedQuizIds: number[];
  completedAt: string | null;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  requestedTeacher: boolean;
}
