import { User } from "./auth";

// ---------- Questions ----------
export interface Question {
  id: string;
  question: string;
  order: number;
  category: string | null;
  image_url: string | null;
  multi_select?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionWithOptions extends Question {
  question_options: QuestionOption[];
}

// ---------- Traveler Types ----------
export interface TravelerType {
  id: string;
  name: string;
  description: string | null;
  prompt_description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- User Test & Answers ----------
export interface UserTravelerTest {
  id: string;
  user_id: string;
  traveler_type_id: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  traveler_type?: TravelerType;
}

export interface UserAnswer {
  id: string;
  user_traveler_test_id: string;
  question_option_id: string;
}

export interface UserAnswerBulkCreate {
  user_traveler_test_id: string;
  // Backend expects the property name `answers` (list of question_option IDs)
  answers: string[];
}

export interface TestResult extends UserTravelerTest {
  traveler_type: TravelerType;
}
