export interface SessionNote {
  date: string;
  note: string;
}

export interface ChallengeData {
  startDate: string;
  totalDays: number;
  completedDates: string[];
  notes: SessionNote[];
}

export interface MotivationalQuote {
  text: string;
} 