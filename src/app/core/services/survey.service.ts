import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, BehaviorSubject, map } from 'rxjs';
import {
  Survey,
  SurveyQuestion,
  SurveyResponse,
  SurveyMetrics,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  SubmitSurveyRequest,
  SurveyReportResponse,
  SurveyRespondentsResponse,
  CompletionRateResponse,
  SurveyExportResponse,
} from '../models/survey.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private http = inject(HttpClient);

  // Signals para estado local
  private readonly _surveys = signal<Survey[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // BehaviorSubject para operaciones que necesitan ser observables
  private surveysSubject = new BehaviorSubject<Survey[]>([]);

  // Getters públicos
  readonly surveys = this._surveys.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly surveys$ = this.surveysSubject.asObservable();

  // Endpoints
  private readonly baseUrl = '/survey';
  private readonly questionUrl = '/survey-question';
  private readonly responseUrl = '/survey-response';

  constructor() {}

  // Obtener todas las encuestas
  getAllSurveys(): Observable<Survey[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Survey[]>(environment.apiUrl + this.baseUrl).pipe(
      tap((surveys) => {
        this._surveys.set(surveys);
        this.surveysSubject.next(surveys);
        this._loading.set(false);
      }),
      catchError((error) => {
        console.error('Error fetching surveys:', error);
        this._error.set('Error al cargar las encuestas');
        this._loading.set(false);
        return of([]);
      })
    );
  }

  // Obtener encuestas por evento
  getSurveysByEvent(eventId: string): Observable<Survey[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<Survey[]>(`${environment.apiUrl}${this.baseUrl}/event/${eventId}`)
      .pipe(
        tap((surveys) => {
          this._loading.set(false);
        }),
        catchError((error) => {
          console.error('Error fetching surveys by event:', error);
          this._error.set('Error al cargar las encuestas del evento');
          this._loading.set(false);
          return of([]);
        })
      );
  }

  // Obtener encuesta por ID
  getSurveyById(surveyId: string): Observable<Survey | null> {
    return this.http
      .get<Survey>(`${environment.apiUrl}${this.baseUrl}/${surveyId}`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching survey:', error);
          this._error.set('Error al cargar la encuesta');
          return of(null);
        })
      );
  }

  // Obtener encuesta con preguntas
  getSurveyWithQuestions(surveyId: string): Observable<Survey | null> {
    return this.http
      .get<Survey>(
        `${environment.apiUrl}${this.baseUrl}/${surveyId}/with-questions`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching survey with questions:', error);
          this._error.set('Error al cargar la encuesta con preguntas');
          return of(null);
        })
      );
  }

  // Obtener métricas de encuesta
  getSurveyMetrics(surveyId: string): Observable<SurveyMetrics | null> {
    return this.http
      .get<SurveyMetrics>(
        `${environment.apiUrl}${this.baseUrl}/${surveyId}/metrics`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching survey metrics:', error);
          this._error.set('Error al cargar las métricas de la encuesta');
          return of(null);
        })
      );
  }

  // Crear encuesta completa con preguntas
  createSurveyWithQuestions(
    surveyData: CreateSurveyRequest
  ): Observable<Survey | null> {
    return this.http
      .post<Survey>(
        `${environment.apiUrl}${this.baseUrl}/with-questions`,
        surveyData
      )
      .pipe(
        tap((survey) => {
          if (survey) {
            // Actualizar el estado local
            const currentSurveys = this._surveys();
            this._surveys.set([...currentSurveys, survey]);
            this.surveysSubject.next(this._surveys());
          }
        }),
        catchError((error) => {
          console.error('Error creating survey:', error);
          this._error.set('Error al crear la encuesta');
          return of(null);
        })
      );
  }

  // Actualizar encuesta completa con preguntas
  updateSurveyWithQuestions(
    surveyId: string,
    surveyData: UpdateSurveyRequest
  ): Observable<Survey | null> {
    return this.http
      .put<Survey>(
        `${environment.apiUrl}${this.baseUrl}/${surveyId}/with-questions`,
        surveyData
      )
      .pipe(
        tap((survey) => {
          if (survey) {
            // Actualizar el estado local
            const currentSurveys = this._surveys();
            const updatedSurveys = currentSurveys.map((s) =>
              s.id === surveyId ? survey : s
            );
            this._surveys.set(updatedSurveys);
            this.surveysSubject.next(updatedSurveys);
          }
        }),
        catchError((error) => {
          console.error('Error updating survey:', error);
          this._error.set('Error al actualizar la encuesta');
          return of(null);
        })
      );
  }

  // Eliminar encuesta
  deleteSurvey(surveyId: string): Observable<boolean> {
    return this.http
      .delete(`${environment.apiUrl}${this.baseUrl}/${surveyId}`)
      .pipe(
        tap(() => {
          // Actualizar el estado local
          const currentSurveys = this._surveys();
          const filteredSurveys = currentSurveys.filter(
            (survey) => survey.id !== surveyId
          );
          this._surveys.set(filteredSurveys);
          this.surveysSubject.next(filteredSurveys);
        }),
        map(() => true),
        catchError((error) => {
          console.error('Error deleting survey:', error);
          this._error.set('Error al eliminar la encuesta');
          return of(false);
        })
      );
  }

  // ===== PREGUNTAS =====

  // Obtener preguntas de una encuesta
  getQuestionsBySurvey(surveyId: string): Observable<SurveyQuestion[]> {
    return this.http
      .get<SurveyQuestion[]>(
        `${environment.apiUrl}${this.questionUrl}/survey/${surveyId}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching survey questions:', error);
          this._error.set('Error al cargar las preguntas de la encuesta');
          return of([]);
        })
      );
  }

  // Crear pregunta
  createQuestion(questionData: {
    questionText: string;
    questionType: string;
    isRequired: boolean;
    order: number;
    options?: string[];
    surveyId: string;
  }): Observable<SurveyQuestion | null> {
    return this.http
      .post<SurveyQuestion>(
        `${environment.apiUrl}${this.questionUrl}`,
        questionData
      )
      .pipe(
        catchError((error) => {
          console.error('Error creating question:', error);
          this._error.set('Error al crear la pregunta');
          return of(null);
        })
      );
  }

  // Actualizar pregunta
  updateQuestion(
    questionId: string,
    questionData: Partial<SurveyQuestion>
  ): Observable<SurveyQuestion | null> {
    return this.http
      .put<SurveyQuestion>(
        `${environment.apiUrl}${this.questionUrl}/${questionId}`,
        questionData
      )
      .pipe(
        catchError((error) => {
          console.error('Error updating question:', error);
          this._error.set('Error al actualizar la pregunta');
          return of(null);
        })
      );
  }

  // Eliminar pregunta
  deleteQuestion(questionId: string): Observable<boolean> {
    return this.http
      .delete(`${environment.apiUrl}${this.questionUrl}/${questionId}`)
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error('Error deleting question:', error);
          this._error.set('Error al eliminar la pregunta');
          return of(false);
        })
      );
  }

  // ===== RESPUESTAS =====

  // Enviar respuesta completa de encuesta
  submitSurveyResponse(
    responseData: SubmitSurveyRequest
  ): Observable<SurveyResponse | null> {
    return this.http
      .post<SurveyResponse>(
        `${environment.apiUrl}${this.responseUrl}/submit`,
        responseData
      )
      .pipe(
        catchError((error) => {
          console.error('Error submitting survey response:', error);
          this._error.set('Error al enviar las respuestas de la encuesta');
          return of(null);
        })
      );
  }

  // Verificar si un usuario ya respondió una encuesta
  checkUserResponse(surveyId: string, userId: string): Observable<boolean> {
    return this.http
      .get<boolean>(
        `${environment.apiUrl}${this.responseUrl}/check/${surveyId}/${userId}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error checking user response:', error);
          return of(false);
        })
      );
  }

  // Obtener todas las respuestas de una encuesta
  getResponsesBySurvey(surveyId: string): Observable<SurveyResponse[]> {
    return this.http
      .get<SurveyResponse[]>(
        `${environment.apiUrl}${this.responseUrl}/survey/${surveyId}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching survey responses:', error);
          this._error.set('Error al cargar las respuestas de la encuesta');
          return of([]);
        })
      );
  }

  // Obtener respuestas de un usuario
  getResponsesByUser(userId: string): Observable<SurveyResponse[]> {
    return this.http
      .get<SurveyResponse[]>(
        `${environment.apiUrl}${this.responseUrl}/user/${userId}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching user responses:', error);
          this._error.set('Error al cargar las respuestas del usuario');
          return of([]);
        })
      );
  }

  // Obtener detalles de una respuesta
  getResponseById(responseId: string): Observable<SurveyResponse | null> {
    return this.http
      .get<SurveyResponse>(
        `${environment.apiUrl}${this.responseUrl}/${responseId}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching response details:', error);
          this._error.set('Error al cargar los detalles de la respuesta');
          return of(null);
        })
      );
  }

  // Eliminar respuesta
  deleteResponse(responseId: string): Observable<boolean> {
    return this.http
      .delete(`${environment.apiUrl}${this.responseUrl}/${responseId}`)
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error('Error deleting response:', error);
          this._error.set('Error al eliminar la respuesta');
          return of(false);
        })
      );
  }

  // ===== MÉTODOS DE UTILIDAD =====

  // Limpiar errores
  clearError(): void {
    this._error.set(null);
  }

  // Refrescar encuestas de un evento
  refreshEventSurveys(eventId: string): Observable<Survey[]> {
    return this.getSurveysByEvent(eventId);
  }

  // ===== REPORTES =====

  /**
   * Obtener reporte completo de encuesta con estadísticas por pregunta
   */
  getSurveyReport(
    surveyId: string,
    groupId?: string
  ): Observable<SurveyReportResponse | null> {
    const params = groupId ? `?groupId=${groupId}` : '';
    return this.http
      .get<SurveyReportResponse>(
        `${environment.apiUrl}${this.baseUrl}/${surveyId}/report${params}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching survey report:', error);
          this._error.set('Error al cargar el reporte de la encuesta');
          return of(null);
        })
      );
  }

  /**
   * Obtener lista de respondentes de una encuesta
   */
  getSurveyRespondents(
    surveyId: string,
    groupId?: string
  ): Observable<SurveyRespondentsResponse | null> {
    const params = groupId ? `?groupId=${groupId}` : '';
    return this.http
      .get<SurveyRespondentsResponse>(
        `${environment.apiUrl}${this.baseUrl}/${surveyId}/respondents${params}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching survey respondents:', error);
          this._error.set('Error al cargar los respondentes de la encuesta');
          return of(null);
        })
      );
  }

  /**
   * Obtener tasa de completado de una encuesta
   */
  getCompletionRate(
    surveyId: string,
    groupId?: string
  ): Observable<CompletionRateResponse | null> {
    const params = groupId ? `?groupId=${groupId}` : '';
    return this.http
      .get<CompletionRateResponse>(
        `${environment.apiUrl}${this.baseUrl}/${surveyId}/completion-rate${params}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching completion rate:', error);
          this._error.set('Error al cargar la tasa de completado');
          return of(null);
        })
      );
  }

  /**
   * Obtener datos para exportar a Excel
   */
  getSurveyExportData(
    surveyId: string,
    groupId?: string
  ): Observable<SurveyExportResponse | null> {
    const params = groupId ? `?groupId=${groupId}` : '';
    return this.http
      .get<SurveyExportResponse>(
        `${environment.apiUrl}${this.baseUrl}/${surveyId}/export${params}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching export data:', error);
          this._error.set('Error al obtener datos para exportar');
          return of(null);
        })
      );
  }
}