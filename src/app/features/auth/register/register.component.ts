import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

// Services
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  // Injected services
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  
  // Public services (for template)
  readonly authService = inject(AuthService);

  // Events
  @Output() success = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  // Form state
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  // Available roles
  readonly availableRoles = [
    { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema' },
    { value: 'manager', label: 'Gerente', description: 'Gestión de eventos y usuarios' },
    { value: 'operator', label: 'Operador', description: 'Operaciones básicas' }
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Inicializa el formulario de registro
   */
  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      apellido: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(255),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      rol: ['admin', [
        Validators.required
      ]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador personalizado para la fortaleza de la contraseña
   */
  private passwordStrengthValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);

    const passwordValid = hasNumber && hasUpper && hasLower && hasSpecial;

    if (!passwordValid) {
      return { 
        passwordStrength: {
          hasNumber,
          hasUpper,
          hasLower,
          hasSpecial
        }
      };
    }

    return null;
  }

  /**
   * Validador para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(form: AbstractControl): { [key: string]: any } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword.errors) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }

    return null;
  }

  /**
   * Maneja el envío del formulario de registro
   */
  onSubmit(): void {
    if (this.registerForm.valid && !this.authService.loading()) {
      const { confirmPassword, ...registerData } = this.registerForm.value;
      const requestData: RegisterRequest = registerData;

      this.authService.register(requestData).subscribe({
        next: (response) => {
          this.showSuccessMessage('Usuario registrado exitosamente');
          this.success.emit(response);
          this.resetForm();
        },
        error: (error) => {
          this.showErrorMessage(error.message || 'Error al registrar usuario');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Cancela el registro
   */
  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  /**
   * Obtiene los errores de un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors?.['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors?.['minlength']) {
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors?.['minlength'].requiredLength} caracteres`;
      }
      if (field.errors?.['maxlength']) {
        return `${this.getFieldLabel(fieldName)} no puede exceder ${field.errors?.['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors?.['pattern']) {
        return `${this.getFieldLabel(fieldName)} contiene caracteres no válidos`;
      }
      if (field.errors?.['passwordStrength']) {
        return this.getPasswordStrengthError(field.errors?.['passwordStrength']);
      }
      if (field.errors?.['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }
    
    return '';
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para la fortaleza de contraseña
   */
  private getPasswordStrengthError(strengthInfo: any): string {
    const requirements = [];
    
    if (!strengthInfo.hasNumber) requirements.push('un número');
    if (!strengthInfo.hasUpper) requirements.push('una mayúscula');
    if (!strengthInfo.hasLower) requirements.push('una minúscula');
    if (!strengthInfo.hasSpecial) requirements.push('un carácter especial (#?!@$%^&*-)');

    return `La contraseña debe contener: ${requirements.join(', ')}`;
  }

  /**
   * Obtiene la etiqueta legible de un campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      apellido: 'Apellido',
      email: 'Email',
      password: 'Contraseña',
      confirmPassword: 'Confirmación de contraseña',
      rol: 'Rol'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Marca todos los campos del formulario como tocados
   */
  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Resetea el formulario
   */
  private resetForm(): void {
    this.registerForm.reset({
      rol: 'admin'
    });
    this.hidePassword = true;
    this.hideConfirmPassword = true;
  }

  /**
   * Muestra un mensaje de éxito
   */
  private showSuccessMessage(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  /**
   * Muestra un mensaje de error
   */
  private showErrorMessage(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  // Helper methods for template validation checks
  hasNumber(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[0-9]/.test(password);
  }

  hasUpperCase(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasLowerCase(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[a-z]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[#?!@$%^&*-]/.test(password);
  }

  hasMinLength(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return password.length >= 8;
  }
}