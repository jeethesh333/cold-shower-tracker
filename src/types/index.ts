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

export interface Milestone {
  id: string;
  name: string;
  description: string;
  requiredProgress: number;
  icon: string;
  color: string;
}

export const MILESTONES: Milestone[] = [
  {
    id: 'ice-breaker',
    name: 'Ice Breaker',
    description: 'Started your cold shower journey',
    requiredProgress: 10,
    icon: '❄️',
    color: 'blue.200'
  },
  {
    id: 'frost-walker',
    name: 'Frost Walker',
    description: '25% of your challenge completed',
    requiredProgress: 25,
    icon: '🌨️',
    color: 'blue.300'
  },
  {
    id: 'cold-warrior',
    name: 'Cold Warrior',
    description: 'Halfway through your challenge',
    requiredProgress: 50,
    icon: '⚔️',
    color: 'blue.400'
  },
  {
    id: 'ice-master',
    name: 'Ice Master',
    description: '75% of your challenge mastered',
    requiredProgress: 75,
    icon: '👑',
    color: 'blue.500'
  },
  {
    id: 'frost-legend',
    name: 'Frost Legend',
    description: 'Challenge completed!',
    requiredProgress: 100,
    icon: '🏆',
    color: 'blue.600'
  }
]; 