export interface SessionNote {
  date: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeData {
  days: number;
  startDate: string;
  userName: string;
  completedDays: string[];
  notes: Record<string, SessionNote>;
  lastLoggedDate: string | null;
}

export interface MotivationalQuote {
  text: string;
} 