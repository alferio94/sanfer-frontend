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