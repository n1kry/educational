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
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuillModule } from 'ngx-quill';
import { QUILL_MODULES } from '../../../shared/quill-config';
import { CourseService } from '../../../core/services/course.service';
import { CourseDetailResponse, QuestionResponse, QuizResponse, SectionResponse, LessonResponse } from '../../../core/models/course.model';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatExpansionModule, MatDividerModule,
    MatProgressSpinnerModule, MatSelectModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule, QuillModule
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

  editingSection: number | null = null;
  editingSectionForm!: FormGroup;

  editingLesson: number | null = null;
  editingLessonForm!: FormGroup;

  editingQuiz: number | null = null;
  editingQuizForm!: FormGroup;

  editingQuestion: number | null = null;
  editingQuestionForm!: FormGroup;

  categories = ['Программирование', 'Дизайн', 'Бизнес', 'Математика', 'Языки', 'Другое'];
  quillModules = QUILL_MODULES;

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
      category:     ['', Validators.required],
      thumbnailUrl: ['']
    });
    this.sectionForm = this.fb.group({
      title:       ['', Validators.required],
      description: [''],
      position:    [1]
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

    this.editingSectionForm = this.fb.group({
      title:       ['', Validators.required],
      description: [''],
      position:    [1]
    });
    this.editingLessonForm = this.fb.group({
      title:           ['', Validators.required],
      description:     [''],
      videoUrl:        [''],
      durationMinutes: [null],
      position:        [1]
    });
    this.editingQuizForm = this.fb.group({
      title:        ['', Validators.required],
      passingScore: [70, [Validators.min(1), Validators.max(100)]]
    });
    this.editingQuestionForm = this.fb.group({
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
  get editingQuestionOptions(): FormArray { return this.editingQuestionForm.get('options') as FormArray; }
  getOptionControls(): AbstractControl[] { return this.questionOptions.controls; }
  getEditingOptionControls(): AbstractControl[] { return this.editingQuestionOptions.controls; }

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
      .subscribe(() => { this.sectionForm.reset({ title: '', description: '', position: 1 }); this.loadCourse(); });
  }

  showEditSection(section: SectionResponse) {
    this.editingSection = section.id;
    this.editingSectionForm.patchValue({
      title: section.title,
      description: section.description,
      position: section.position
    });
    this.cdr.detectChanges();
  }

  saveSection() {
    if (this.editingSectionForm.invalid || !this.editingSection) return;
    this.courseService.updateSection(this.editingSection, this.editingSectionForm.value).subscribe(() => {
      this.editingSection = null;
      this.snack.open('Раздел сохранён', '', { duration: 2000 });
      this.loadCourse();
    });
  }

  deleteSection(sectionId: number) {
    if (!confirm('Удалить раздел и все его уроки?')) return;
    this.courseService.deleteSection(sectionId).subscribe(() => this.loadCourse());
  }

  showAddLesson(sectionId: number) {
    this.addingLessonForSection = sectionId;
    const section = this.course.sections.find(s => s.id === sectionId)!;
    this.lessonForm.reset({ title: '', description: '', videoUrl: '', durationMinutes: null, position: section.lessons.length + 1 });
  }

  addLesson(sectionId: number) {
    if (this.lessonForm.invalid) return;
    this.courseService.createLesson(sectionId, this.lessonForm.value).subscribe(() => {
      this.addingLessonForSection = null;
      this.loadCourse();
    });
  }

  showEditLesson(lesson: LessonResponse) {
    this.editingLesson = lesson.id;
    this.editingLessonForm.patchValue({
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      durationMinutes: lesson.durationMinutes,
      position: lesson.position
    });
    this.cdr.detectChanges();
  }

  saveLesson() {
    if (this.editingLessonForm.invalid || !this.editingLesson) return;
    this.courseService.updateLesson(this.editingLesson, this.editingLessonForm.value).subscribe(() => {
      this.editingLesson = null;
      this.snack.open('Урок сохранён', '', { duration: 2000 });
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

  showEditQuiz(quiz: QuizResponse) {
    this.editingQuiz = quiz.id;
    this.editingQuizForm.patchValue({ title: quiz.title, passingScore: quiz.passingScore });
  }

  saveQuiz() {
    if (this.editingQuizForm.invalid || !this.editingQuiz) return;
    this.courseService.updateQuiz(this.editingQuiz, this.editingQuizForm.value).subscribe(() => {
      this.editingQuiz = null;
      this.snack.open('Тест сохранён', '', { duration: 2000 });
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

  showEditQuestion(q: QuestionResponse) {
    this.editingQuestion = q.id;
    this.editingQuestionForm.patchValue({ text: q.text, correctAnswer: q.correctAnswer });
    const arr = this.editingQuestionOptions;
    arr.controls.forEach((ctrl, i) => {
      const opt = q.options[i];
      if (opt) ctrl.patchValue({ optionKey: opt.optionKey, text: opt.text });
    });
    this.cdr.detectChanges();
  }

  saveQuestion() {
    if (this.editingQuestionForm.invalid || !this.editingQuestion) return;
    this.courseService.updateQuestion(this.editingQuestion, this.editingQuestionForm.value).subscribe(() => {
      this.editingQuestion = null;
      this.snack.open('Вопрос сохранён', '', { duration: 2000 });
      this.loadCourse();
    });
  }

  deleteQuestion(questionId: number) {
    if (!confirm('Удалить вопрос?')) return;
    this.courseService.deleteQuestion(questionId).subscribe(() => this.loadCourse());
  }
}
