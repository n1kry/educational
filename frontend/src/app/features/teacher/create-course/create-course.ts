import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { QuillModule } from 'ngx-quill';
import { QUILL_MODULES } from '../../../shared/quill-config';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSelectModule,
    QuillModule
  ],
  templateUrl: './create-course.html',
  styleUrl: './create-course.scss'
})
export class CreateCourseComponent {
  form: FormGroup;
  loading = false;

  categories = ['Программирование', 'Дизайн', 'Бизнес', 'Математика', 'Языки', 'Другое'];
  quillModules = QUILL_MODULES;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      title:        ['', Validators.required],
      description:  [''],
      category:     ['', Validators.required],
      thumbnailUrl: ['']
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.courseService.createCourse(this.form.value).subscribe({
      next: course => { this.loading = false; this.router.navigate(['/teacher/edit', course.id]); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }
}
