import { Component, Inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
} from '@angular/forms';

// Material imports
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

// Models
import {
  Survey,
  SurveyQuestion,
  QuestionType,
  SurveyType,
  CreateSurveyRequest,
  UpdateSurveyRequest,
} from '@core/models/survey.interface';

interface CreateSurveyModalData {
  eventId: string;
  mode: 'create' | 'edit';
  survey?: Survey;
}

interface CreateSurveyModalResult {
  action: 'create' | 'edit' | 'cancel';
  data?: CreateSurveyRequest | UpdateSurveyRequest;
}

@Component({
  selector: 'app-create-survey-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTooltipModule,
    MatRadioModule,
    DragDropModule,
  ],
  templateUrl: './create-survey-modal.component.html',
  styleUrls: ['./create-survey-modal.component.scss'],
})
export class CreateSurveyModalComponent implements OnInit {
  surveyForm: FormGroup;
  loading = signal(false);

  readonly questionTypes: { value: QuestionType; label: string; icon: string }[] = [
    { value: 'text', label: 'Texto libre', icon: 'text_fields' },
    { value: 'multiple_choice', label: 'Opción múltiple', icon: 'radio_button_checked' },
    { value: 'rating', label: 'Calificación (1-10)', icon: 'star_rate' },
    { value: 'boolean', label: 'Sí/No', icon: 'check_box' },
  ];

  readonly surveyTypes: { value: SurveyType; label: string; description: string }[] = [
    {
      value: 'entry',
      label: 'Encuesta de Entrada',
      description: 'Se realiza al inicio del evento para conocer expectativas'
    },
    {
      value: 'exit',
      label: 'Encuesta de Salida',
      description: 'Se realiza al final del evento para recopilar feedback'
    },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateSurveyModalComponent, CreateSurveyModalResult>,
    @Inject(MAT_DIALOG_DATA) public data: CreateSurveyModalData
  ) {
    this.surveyForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.survey) {
      this.loadSurveyData(this.data.survey);
    }
  }

  // Getters
  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  get questionsCount(): number {
    return this.questions.length;
  }

  // Helper method to get FormGroup from AbstractControl
  getQuestionFormGroup(index: number): FormGroup {
    return this.questions.at(index) as FormGroup;
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['entry', [Validators.required]],
      isActive: [true],
      questions: this.fb.array([]),
    });
  }

  private loadSurveyData(survey: Survey): void {
    this.surveyForm.patchValue({
      title: survey.title,
      description: survey.description,
      type: survey.type,
      isActive: survey.isActive,
    });

    // Load questions
    if (survey.questions && survey.questions.length > 0) {
      survey.questions
        .sort((a, b) => a.order - b.order)
        .forEach((question) => {
          this.addQuestion(question);
        });
    }
  }

  // Question management
  addQuestion(questionData?: SurveyQuestion): void {
    const questionForm = this.fb.group({
      id: [questionData?.id || null],
      questionText: [
        questionData?.questionText || '',
        [Validators.required, Validators.minLength(5)],
      ],
      questionType: [questionData?.questionType || 'text', [Validators.required]],
      isRequired: [questionData?.isRequired || false],
      order: [questionData?.order || this.questions.length + 1],
      options: this.fb.array(
        questionData?.options?.map((option) => this.fb.control(option)) || []
      ),
    });

    this.questions.push(questionForm);
  }

  removeQuestion(index: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      this.questions.removeAt(index);
      this.updateQuestionOrders();
    }
  }

  duplicateQuestion(index: number): void {
    const originalQuestion = this.questions.at(index).value;
    const duplicatedQuestion = {
      ...originalQuestion,
      id: null, // Remove ID for new question
      questionText: `${originalQuestion.questionText} (Copia)`,
      order: this.questions.length + 1,
    };
    this.addQuestion(duplicatedQuestion);
  }

  // Question options management
  getQuestionOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    const options = this.getQuestionOptions(questionIndex);
    options.push(this.fb.control('', [Validators.required]));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getQuestionOptions(questionIndex);
    options.removeAt(optionIndex);
  }

  // Question type change handler
  onQuestionTypeChange(questionIndex: number, newType: QuestionType): void {
    const question = this.questions.at(questionIndex);
    const options = this.getQuestionOptions(questionIndex);

    // Clear options for non-multiple-choice questions
    if (newType !== 'multiple_choice') {
      while (options.length > 0) {
        options.removeAt(0);
      }
    } else if (newType === 'multiple_choice' && options.length === 0) {
      // Add default options for multiple choice
      this.addOption(questionIndex);
      this.addOption(questionIndex);
    }
  }

  // Drag and drop
  onQuestionDrop(event: CdkDragDrop<AbstractControl[]>): void {
    const questionsArray = this.questions.controls;
    moveItemInArray(questionsArray, event.previousIndex, event.currentIndex);
    this.questions.setControl(event.currentIndex, questionsArray[event.currentIndex]);
    this.updateQuestionOrders();
  }

  private updateQuestionOrders(): void {
    this.questions.controls.forEach((question, index) => {
      question.get('order')?.setValue(index + 1);
    });
  }

  // Form validation helpers
  isQuestionTypeMultipleChoice(questionIndex: number): boolean {
    return this.questions.at(questionIndex).get('questionType')?.value === 'multiple_choice';
  }

  hasMinimumOptions(questionIndex: number): boolean {
    if (!this.isQuestionTypeMultipleChoice(questionIndex)) return true;
    return this.getQuestionOptions(questionIndex).length >= 2;
  }

  // Form submission
  onSubmit(): void {
    if (this.surveyForm.valid) {
      this.loading.set(true);

      const formValue = this.surveyForm.value;
      const surveyData = {
        title: formValue.title,
        description: formValue.description,
        type: formValue.type,
        isActive: formValue.isActive,
        ...(this.isEditMode ? {} : { eventId: this.data.eventId }),
        questions: formValue.questions.map((question: any, index: number) => ({
          ...(question.id ? { id: question.id } : {}),
          questionText: question.questionText,
          questionType: question.questionType,
          isRequired: question.isRequired,
          order: index + 1,
          ...(question.questionType === 'multiple_choice' && question.options?.length > 0
            ? { options: question.options.filter((opt: string) => opt.trim() !== '') }
            : {}),
        })),
      };

      setTimeout(() => {
        this.loading.set(false);
        this.dialogRef.close({
          action: this.isEditMode ? 'edit' : 'create',
          data: surveyData,
        });
      }, 1000);
    } else {
      this.markFormGroupTouched(this.surveyForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  // Template helpers
  getQuestionTypeIcon(type: QuestionType): string {
    return this.questionTypes.find(qt => qt.value === type)?.icon || 'help';
  }

  getQuestionTypeLabel(type: QuestionType): string {
    return this.questionTypes.find(qt => qt.value === type)?.label || type;
  }

  // Validation getters for template
  get titleErrors(): string[] {
    const control = this.surveyForm.get('title');
    const errors: string[] = [];
    
    if (control?.touched && control?.errors) {
      if (control.errors['required']) errors.push('El título es requerido');
      if (control.errors['minlength']) errors.push('El título debe tener al menos 3 caracteres');
    }
    
    return errors;
  }

  get descriptionErrors(): string[] {
    const control = this.surveyForm.get('description');
    const errors: string[] = [];
    
    if (control?.touched && control?.errors) {
      if (control.errors['required']) errors.push('La descripción es requerida');
      if (control.errors['minlength']) errors.push('La descripción debe tener al menos 10 caracteres');
    }
    
    return errors;
  }

  getQuestionErrors(questionIndex: number): string[] {
    const question = this.questions.at(questionIndex);
    const questionTextControl = question.get('questionText');
    const errors: string[] = [];
    
    if (questionTextControl?.touched && questionTextControl?.errors) {
      if (questionTextControl.errors['required']) errors.push('El texto de la pregunta es requerido');
      if (questionTextControl.errors['minlength']) errors.push('La pregunta debe tener al menos 5 caracteres');
    }

    if (!this.hasMinimumOptions(questionIndex) && this.isQuestionTypeMultipleChoice(questionIndex)) {
      errors.push('Las preguntas de opción múltiple deben tener al menos 2 opciones');
    }
    
    return errors;
  }
}