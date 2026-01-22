export type QuestionType = 'text' | 'multiple_choice' | 'rating' | 'boolean';
export type SurveyType = 'entry' | 'exit';

export interface SurveyQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  order: number;
  options?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  type: SurveyType;
  isActive: boolean;
  event: {
    id: string;
    name: string;
  };
  groups?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  questions?: SurveyQuestion[];
}

export interface SurveyAnswer {
  questionId: string;
  answerValue?: string;
  selectedOption?: string;
  ratingValue?: number;
  booleanValue?: boolean;
}

export interface SurveyResponse {
  id: string;
  submittedAt: string;
  survey: {
    id: string;
    title: string;
    type: SurveyType;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  answers: Array<{
    id: string;
    answerValue?: string;
    selectedOption?: string;
    ratingValue?: number;
    booleanValue?: boolean;
    question: {
      id: string;
      questionText: string;
      questionType: QuestionType;
    };
  }>;
}

export interface SurveyMetrics {
  surveyId: string;
  title: string;
  type: SurveyType;
  totalResponses: number;
  totalQuestions: number;
  isActive: boolean;
}

export interface CreateSurveyRequest {
  title: string;
  description: string;
  type: SurveyType;
  isActive: boolean;
  eventId: string;
  groupIds?: string[];
  questions: Array<{
    questionText: string;
    questionType: QuestionType;
    isRequired: boolean;
    order: number;
    options?: string[];
  }>;
}

export interface UpdateSurveyRequest {
  title?: string;
  description?: string;
  isActive?: boolean;
  groupIds?: string[];
  questions?: Array<{
    id?: string;
    questionText: string;
    questionType: QuestionType;
    isRequired: boolean;
    order: number;
    options?: string[];
  }>;
}

export interface SubmitSurveyRequest {
  surveyId: string;
  userId: string;
  answers: SurveyAnswer[];
}

// ============================================
// SURVEY REPORT INTERFACES
// ============================================

export interface ReportFilters {
  groupId: string | null;
  groupName: string | null;
}

export interface SurveyReportResponse {
  survey: {
    id: string;
    title: string;
    description: string | null;
    type: SurveyType;
    isActive: boolean;
    eventId: string;
    eventName: string;
  };
  summary: SurveyReportSummary;
  questionStats: QuestionStatistics[];
  filters: ReportFilters;
}

export interface SurveyReportSummary {
  totalResponses: number;
  totalQuestions: number;
  completionRate: number;
  averageRating: number | null;
}

export interface QuestionStatistics {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  order: number;
  options?: string[];
  totalAnswers: number;
  stats: RatingStats | MultipleChoiceStats | BooleanStats | TextStats;
}

export interface RatingStats {
  average: number;
  min: number;
  max: number;
  distribution: Record<number, number>;
}

export interface MultipleChoiceStats {
  distribution: Record<string, { count: number; percentage: number }>;
}

export interface BooleanStats {
  yes: { count: number; percentage: number };
  no: { count: number; percentage: number };
}

export interface TextStats {
  responses: string[];
  totalResponses: number;
}

// ============================================
// SURVEY RESPONDENTS
// ============================================

export interface SurveyRespondentsResponse {
  surveyId: string;
  surveyTitle: string;
  surveyType: SurveyType;
  totalRespondents: number;
  respondents: RespondentInfo[];
  filters: ReportFilters;
}

export interface RespondentInfo {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  groups: GroupInfo[];
}

export interface GroupInfo {
  id: string;
  name: string;
  color: string;
}

// ============================================
// COMPLETION RATE
// ============================================

export interface CompletionRateResponse {
  surveyId: string;
  surveyTitle: string;
  surveyType: SurveyType;
  totalAssigned: number;
  totalCompleted: number;
  completionRate: number;
  pending: number;
  filters: ReportFilters;
}

// ============================================
// EXPORT
// ============================================

export interface SurveyExportResponse {
  survey: {
    id: string;
    title: string;
    description: string | null;
    type: SurveyType;
    eventName: string;
    exportedAt: string;
  };
  questions: ExportQuestion[];
  data: ExportAnswerData[];
  filters: ReportFilters;
}

export interface ExportQuestion {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  options?: string[];
}

export interface ExportAnswerData {
  respondentId: string;
  respondentName: string;
  respondentEmail: string;
  submittedAt: string;
  groups: string[];
  answers: {
    questionId: string;
    questionText: string;
    questionType: string;
    answer: string | number | boolean | null;
  }[];
}