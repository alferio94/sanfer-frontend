import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Injected services
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  
  // Public services (for template)
  readonly authService = inject(AuthService);

  // Form and UI state
  loginForm!: FormGroup;
  hidePassword = true;

  ngOnInit(): void {
    this.initializeForm();
    this.checkIfAlreadyAuthenticated();
  }

  /**
   * Inicializa el formulario de login
   */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.maxLength(255)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(255)
      ]],
      rememberMe: [false]
    });
  }

  /**
   * Verifica si el usuario ya está autenticado
   */
  private checkIfAlreadyAuthenticated(): void {
    if (this.authService.isUserAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Maneja el envío del formulario de login
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.authService.loading()) {
      const { email, password, rememberMe } = this.loginForm.value;
      
      this.authService.login(email, password, rememberMe).subscribe({
        next: (response) => {
          this.showSuccessMessage('¡Bienvenido de vuelta!');
          // La navegación se maneja automáticamente en el AuthService
        },
        error: (error) => {
          this.showErrorMessage(error.message || 'Error al iniciar sesión');
          this.loginForm.patchValue({ password: '' }); // Limpiar contraseña
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }


  /**
   * Obtiene los errores de un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
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
    }
    
    return '';
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene la etiqueta legible de un campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Marca todos los campos del formulario como tocados
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
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
}