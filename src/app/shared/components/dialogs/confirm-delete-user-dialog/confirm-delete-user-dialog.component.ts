import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ConfirmDeleteUserDialogData {
  userName: string;
  userEmail: string;
}

@Component({
  selector: 'app-confirm-delete-user-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-delete-user-dialog">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-title">
            <mat-icon class="header-icon warning-icon">warning</mat-icon>
            <h2>Confirmar Eliminación</h2>
          </div>
          <button
            mat-icon-button
            class="close-button"
            (click)="onCancel()"
            matTooltip="Cerrar"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <p class="header-subtitle">
          Esta acción eliminará al usuario del evento de forma permanente
        </p>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <div class="warning-section">
          <div class="warning-card">
            <mat-icon class="warning-icon">info</mat-icon>
            <div class="warning-content">
              <h4>¿Estás seguro de que deseas eliminar al usuario del evento?</h4>
              <p>El usuario ya no tendrá acceso a este evento y perderá todos sus datos relacionados.</p>
            </div>
          </div>
        </div>

        <div class="user-details-section">
          <h3 class="section-title">
            <mat-icon>person</mat-icon>
            Información del Usuario
          </h3>
          
          <div class="user-info-card">
            <div class="user-detail">
              <mat-icon>badge</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Nombre:</span>
                <span class="detail-value">{{ data.userName }}</span>
              </div>
            </div>
            
            <div class="user-detail">
              <mat-icon>email</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ data.userEmail }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="consequences-section">
          <div class="consequences-card">
            <mat-icon class="error-icon">error</mat-icon>
            <div class="consequences-content">
              <h4>Consecuencias de esta acción:</h4>
              <ul>
                <li>El usuario será eliminado del evento</li>
                <li>Perderá acceso a la aplicación móvil para este evento</li>
                <li>Se eliminará su asignación a grupos del evento</li>
                <li>Esta acción no se puede deshacer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="footer-actions">
          <button
            mat-button
            type="button"
            class="cancel-button"
            (click)="onCancel()"
          >
            Cancelar
          </button>

          <button
            mat-raised-button
            color="warn"
            type="button"
            class="delete-button"
            (click)="onConfirm()"
          >
            <mat-icon>delete</mat-icon>
            Eliminar Usuario
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-delete-user-dialog {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      width: 100%;
      max-width: 500px;

      .modal-header {
        padding: 24px 24px 16px;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
        background: var(--mat-sys-surface);

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;

          .header-title {
            display: flex;
            align-items: center;
            gap: 12px;

            .header-icon {
              color: #ff9800;
              font-size: 28px;
              width: 28px;
              height: 28px;
            }

            h2 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
              color: var(--mat-sys-on-surface);
            }
          }

          .close-button {
            color: var(--mat-sys-on-surface-variant);
            
            &:hover {
              background-color: var(--mat-sys-surface-variant);
            }
          }
        }

        .header-subtitle {
          margin: 0;
          color: var(--mat-sys-on-surface-variant);
          font-size: 14px;
          line-height: 1.4;
        }
      }

      .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;

        .warning-section {
          .warning-card {
            display: flex;
            gap: 12px;
            padding: 16px;
            background: rgba(255, 152, 0, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(255, 152, 0, 0.3);

            .warning-icon {
              color: #ff9800;
              font-size: 20px;
              width: 20px;
              height: 20px;
              flex-shrink: 0;
              margin-top: 2px;
            }

            .warning-content {
              flex: 1;

              h4 {
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--mat-sys-on-surface);
              }

              p {
                margin: 0;
                font-size: 14px;
                color: var(--mat-sys-on-surface-variant);
                line-height: 1.4;
              }
            }
          }
        }

        .user-details-section {
          .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--mat-sys-on-surface);

            mat-icon {
              color: var(--mat-sys-primary);
              font-size: 20px;
              width: 20px;
              height: 20px;
            }
          }

          .user-info-card {
            background: var(--mat-sys-surface-container);
            border-radius: 8px;
            border: 1px solid var(--mat-sys-outline-variant);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;

            .user-detail {
              display: flex;
              align-items: center;
              gap: 12px;

              mat-icon {
                color: var(--mat-sys-on-surface-variant);
                font-size: 18px;
                width: 18px;
                height: 18px;
                flex-shrink: 0;
              }

              .detail-content {
                display: flex;
                flex-direction: column;
                gap: 2px;

                .detail-label {
                  font-size: 12px;
                  color: var(--mat-sys-on-surface-variant);
                  font-weight: 500;
                }

                .detail-value {
                  font-size: 14px;
                  color: var(--mat-sys-on-surface);
                  font-weight: 600;
                }
              }
            }
          }
        }

        .consequences-section {
          .consequences-card {
            display: flex;
            gap: 12px;
            padding: 16px;
            background: rgba(244, 67, 54, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(244, 67, 54, 0.3);

            .error-icon {
              color: var(--mat-sys-error);
              font-size: 20px;
              width: 20px;
              height: 20px;
              flex-shrink: 0;
              margin-top: 2px;
            }

            .consequences-content {
              flex: 1;

              h4 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--mat-sys-error);
              }

              ul {
                margin: 0;
                padding-left: 16px;
                
                li {
                  font-size: 13px;
                  color: var(--mat-sys-on-surface-variant);
                  margin-bottom: 4px;
                  line-height: 1.4;
                }
              }
            }
          }
        }
      }

      .modal-footer {
        padding: 16px 24px 24px;
        border-top: 1px solid var(--mat-sys-outline-variant);
        background: var(--mat-sys-surface);

        .footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;

          .cancel-button {
            color: var(--mat-sys-on-surface-variant);
            
            &:hover {
              background-color: var(--mat-sys-surface-variant);
            }
          }

          .delete-button {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 160px;
          }
        }
      }
    }

    // Responsive design
    @media (max-width: 768px) {
      .confirm-delete-user-dialog {
        max-width: 95vw;
        max-height: 95vh;

        .modal-header {
          padding: 16px 16px 12px;

          .header-content {
            .header-title {
              h2 {
                font-size: 20px;
              }
            }
          }
        }

        .modal-body {
          padding: 16px;
          gap: 20px;
        }

        .modal-footer {
          padding: 12px 16px 16px;

          .footer-actions {
            flex-direction: column;
            gap: 8px;

            .cancel-button,
            .delete-button {
              width: 100%;
            }
          }
        }
      }
    }
  `]
})
export class ConfirmDeleteUserDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDeleteUserDialogComponent>);
  public data = inject<ConfirmDeleteUserDialogData>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close('cancel');
  }

  onConfirm(): void {
    this.dialogRef.close('confirm');
  }
}