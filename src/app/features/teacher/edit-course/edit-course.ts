import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { CourseService } from '../../../core/services/course.service';
import { CourseDetailResponse } from '../../../core/models/course.model';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatExpansionModule, MatDividerModule,
    MatProgressSpinnerModule, MatSelectModule, MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './edit-course.html',
  styleUrl: './edit-course.scss'
})
export class EditCourseComponent implements OnInit {
  courseId!: number;
  course!: CourseDetailResponse;
  loading = true;

  courseForm!: FormGroup;
  sectionForm!: FormGroup;

  addingLessonForSection: number | null = null;
  lessonForm!: FormGroup;

  addingQuizForSection: number | null = null;
  quizForm!: FormGroup;

  addingQuestionForQuiz: number | null = null;
  questionForm!: FormGroup;

  categories = ['Программирование', 'Дизайн', 'Бизнес', 'Математика', 'Языки', 'Другое'];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private courseService: CourseService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForms();
    this.loadCourse();
  }

  private initForms() {
    this.courseForm = this.fb.group({
      title:        ['', Validators.required],
      description:  [''],
      category:     [''],
      thumbnailUrl: ['']
    });
    this.sectionForm = this.fb.group({
      title:    ['', Validators.required],
      position: [1]
    });
    this.lessonForm = this.fb.group({
      title:           ['', Validators.required],
      description:     [''],
      videoUrl:        [''],
      durationMinutes: [null],
      position:        [1]
    });
    this.quizForm = this.fb.group({
      title:        ['', Validators.required],
      passingScore: [70, [Validators.min(1), Validators.max(100)]]
    });
    this.questionForm = this.fb.group({
      text:          ['', Validators.required],
      correctAnswer: ['A', Validators.required],
      options: this.fb.array([
        this.fb.group({ optionKey: ['A'], text: ['', Validators.required] }),
        this.fb.group({ optionKey: ['B'], text: ['', Validators.required] }),
        this.fb.group({ optionKey: ['C'], text: ['', Validators.required] }),
        this.fb.group({ optionKey: ['D'], text: ['', Validators.required] })
      ])
    });
  }

  get questionOptions(): FormArray { return this.questionForm.get('options') as FormArray; }
  getOptionControls(): AbstractControl[] { return this.questionOptions.controls; }

  loadCourse() {
    this.loading = true;
    this.courseService.getCourseDetail(this.courseId).subscribe({
      next: c => {
        this.course = c;
        this.courseForm.patchValue(c);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snack.open('Не удалось загрузить курс', '', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveCourse() {
    if (this.courseForm.invalid) return;
    this.courseService.updateCourse(this.courseId, this.courseForm.value).subscribe(() => {
      this.snack.open('Курс сохранён', '', { duration: 2000 });
      this.loadCourse();
    });
  }

  togglePublish() {
    this.courseService.togglePublish(this.courseId).subscribe(() => {
      this.course.published = !this.course.published;
      this.snack.open(this.course.published ? 'Опубликован' : 'Снят с публикации', '', { duration: 2000 });
      this.cdr.detectChanges();
    });
  }

  addSection() {
    if (this.sectionForm.invalid) return;
    const pos = this.course.sections.length + 1;
    this.courseService.createSection(this.courseId, { ...this.sectionForm.value, position: pos })
      .subscribe(() => { this.sectionForm.reset({ position: 1 }); this.loadCourse(); });
  }

  deleteSection(sectionId: number) {
    if (!confirm('Удалить раздел и все его уроки?')) return;
    this.courseService.deleteSection(sectionId).subscribe(() => this.loadCourse());
  }

  showAddLesson(sectionId: number) {
    this.addingLessonForSection = sectionId;
    const section = this.course.sections.find(s => s.id === sectionId)!;
    this.lessonForm.reset({ position: section.lessons.length + 1 });
  }

  addLesson(sectionId: number) {
    if (this.lessonForm.invalid) return;
    this.courseService.createLesson(sectionId, this.lessonForm.value).subscribe(() => {
      this.addingLessonForSection = null;
      this.loadCourse();
    });
  }

  deleteLesson(lessonId: number) {
    if (!confirm('Удалить урок?')) return;
    this.courseService.deleteLesson(lessonId).subscribe(() => this.loadCourse());
  }

  showAddQuiz(sectionId: number) {
    this.addingQuizForSection = sectionId;
    this.quizForm.reset({ title: 'Тест раздела', passingScore: 70 });
  }

  createSectionQuiz(sectionId: number) {
    if (this.quizForm.invalid) return;
    this.courseService.createSectionQuiz(sectionId, this.quizForm.value).subscribe(() => {
      this.addingQuizForSection = null;
      this.loadCourse();
    });
  }

  showAddQuestion(quizId: number) {
    this.addingQuestionForQuiz = quizId;
    this.questionForm.reset({
      correctAnswer: 'A',
      options: [
        { optionKey: 'A', text: '' },
        { optionKey: 'B', text: '' },
        { optionKey: 'C', text: '' },
        { optionKey: 'D', text: '' }
      ]
    });
  }

  addQuestion(quizId: number) {
    if (this.questionForm.invalid) return;
    this.courseService.addQuestion(quizId, this.questionForm.value).subscribe(() => {
      this.addingQuestionForQuiz = null;
      this.loadCourse();
    });
  }

  deleteQuestion(questionId: number) {
    if (!confirm('Удалить вопрос?')) return;
    this.courseService.deleteQuestion(questionId).subscribe(() => this.loadCourse());
  }
}
