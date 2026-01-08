
export enum Category {
  RECURVO = 'Recurvo',
  COMPOSTO = 'Composto'
}

export enum Role {
  ATLETA = 'Atleta',
  TECNICO = 'Técnico'
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  category: Category;
  role: Role;
  brotocoin_balance: number;
  avatar_url?: string;
}

export interface ShotHistoryItem {
  id: string;
  date: string;
  score: number;
  distance: number;
  end_scores?: Record<number, (string | number)[]>;
}

export interface AthleteData extends Profile {
  attendance_history: string[]; // ISO strings of dates attended
  weekly_attendance: number;
  monthly_attendance: number;
  avg_score: number;
  today_shots: number;
  today_best_score: number;
  history: ShotHistoryItem[];
  last_redemptions?: Record<string, string>; // goalId -> ISO date string
  individual_goals?: {
    daily_score?: number;
    daily_shots?: number;
    weekly_attendance?: number;
  };
}

export interface GlobalGoals {
  daily_score_target: number;
  daily_shots_target: number;
  weekly_attendance_target: number;
}

export interface TrainingPlan {
  id: string;
  athlete_id: string; // "all" or specific ID
  title: string;
  description: string;
  duration: string;
  intensity: 'Baixa' | 'Média' | 'Alta';
  completed: boolean;
  last_completed_at?: string; // Para reset diário
  created_at: string;
}

export interface ShotSession {
  id: string;
  athlete_id: string;
  date: string;
  distance: number;
  bow_type: Category;
  total_score: number;
  arrows_per_end: number;
  num_ends: number;
}
