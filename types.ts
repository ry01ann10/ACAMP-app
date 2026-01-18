
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
  avatar_url?: string;
  today_shots?: number;
}

export interface ShotHistoryItem {
  id: string;
  date: string;
  score: number;
  distance: number;
  end_scores?: Record<number, (string | number)[]>;
}

export interface AthleteData extends Profile {
  attendance_history: string[]; 
  weekly_attendance: number;
  monthly_attendance: number;
  avg_score: number;
  today_shots: number;
  today_best_score: number;
  history: ShotHistoryItem[];
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
  athlete_id: string;
  title: string;
  description: string;
  duration: string;
  intensity: 'Baixa' | 'Média' | 'Alta';
  completed: boolean;
  last_completed_at?: string;
  created_at: string;
}
