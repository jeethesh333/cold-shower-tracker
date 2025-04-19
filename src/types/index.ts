export interface SessionNote {
  date: string;
  note: string;
}

export interface ChallengeData {
  days: number;
  startDate: string;
  userName: string;
  completedDays: string[];
  notes: Record<string, string>;
  lastLoggedDate: string | null;
}

export interface MotivationalQuote {
  text: string;
} 