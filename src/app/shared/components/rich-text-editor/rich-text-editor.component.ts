import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  forwardRef,
  signal,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
  FormsModule,
} from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '@core/services/theme.service';

export interface RichTextEditorConfig {
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  toolbar?: any; // Permitir cualquier configuración de toolbar de Quill
  readonly?: boolean;
  height?: string;
}

@Component({
  selector: 'app-rich-text-editor',
  imports: [
    CommonModule,
    FormsModule,
    QuillModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
})
export class RichTextEditorComponent
  implements OnInit, OnDestroy, ControlValueAccessor, Validator
{
  private themeService = inject(ThemeService);

  @Input() config: RichTextEditorConfig = {};
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() appearance: 'outline' | 'fill' = 'outline';

  // Signals
  readonly value = signal<string>('');
  readonly textLength = signal<number>(0);
  readonly isValid = signal<boolean>(true);
  readonly isFocused = signal<boolean>(false);
  readonly isDirty = signal<boolean>(false);

  // Quill configuration
  quillModules: any = {};
  editorStyle: any = {};

  // ControlValueAccessor
  private onChange = (value: string) => {};
  private onTouched = () => {};
  readonly isDisabled = signal<boolean>(false);

  ngOnInit(): void {
    this.setupQuillConfig();
    this.setupThemeWatcher();
  }

  ngOnDestroy(): void {
    // No hay subscriptions manuales que limpiar
  }

  private setupQuillConfig(): void {
    const defaultToolbar = [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean'],
    ];

    this.quillModules = {
      toolbar: this.config.toolbar || defaultToolbar,
    };

    this.editorStyle = {
      height: this.config.height || '120px',
    };
  }

  private setupThemeWatcher(): void {
    // En Angular 19 con signals, no necesitamos subscription manual
    // Los estilos se actualizan automáticamente vía CSS y el tema service
  }

  private updateEditorTheme(): void {
    // Esta función se puede expandir para aplicar estilos específicos del tema
    // Los estilos principales se manejan vía CSS
  }

  onContentChanged(event: any): void {
    const htmlContent = event.html || '';
    const textContent = event.text || '';
    
    this.value.set(htmlContent);
    this.textLength.set(textContent.length);
    this.isDirty.set(true);
    
    this.validateContent();
    this.onChange(htmlContent);
  }

  onSelectionChanged(event: any): void {
    // Manejar cambios de selección si es necesario
  }

  onEditorCreated(quill: any): void {
    // Configuraciones adicionales del editor
    if (this.config.readonly) {
      quill.disable();
    }
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  private validateContent(): void {
    const textLen = this.textLength();
    let valid = true;

    if (this.required && textLen === 0) {
      valid = false;
    }

    if (this.config.minLength && textLen < this.config.minLength) {
      valid = false;
    }

    if (this.config.maxLength && textLen > this.config.maxLength) {
      valid = false;
    }

    this.isValid.set(valid);
  }

  // Getters para el template
  get hasMaxLength(): boolean {
    return !!this.config.maxLength;
  }

  get isOverLimit(): boolean {
    return this.hasMaxLength && this.textLength() > this.config.maxLength!;
  }

  get showCounter(): boolean {
    return this.hasMaxLength;
  }

  get counterText(): string {
    if (!this.hasMaxLength) return '';
    return `${this.textLength()}/${this.config.maxLength}`;
  }

  get placeholderText(): string {
    return this.config.placeholder || 'Escribe aquí...';
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value || '');
    // Calcular longitud del texto sin HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value || '';
    this.textLength.set(tempDiv.textContent?.length || 0);
    this.validateContent();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // Validator implementation
  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.isValid()) {
      const errors: ValidationErrors = {};
      
      if (this.required && this.textLength() === 0) {
        errors['required'] = true;
      }
      
      if (this.config.minLength && this.textLength() < this.config.minLength) {
        errors['minlength'] = {
          requiredLength: this.config.minLength,
          actualLength: this.textLength(),
        };
      }
      
      if (this.config.maxLength && this.textLength() > this.config.maxLength) {
        errors['maxlength'] = {
          requiredLength: this.config.maxLength,
          actualLength: this.textLength(),
        };
      }
      
      return errors;
    }
    
    return null;
  }
}