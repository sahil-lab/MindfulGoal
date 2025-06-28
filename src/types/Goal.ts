export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'work' | 'personal' | 'health' | 'learning' | 'other';
  targetHours: number;
  loggedHours: number;
  completed: boolean;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  timeEntries: TimeEntry[];
  createdAt: string;
  isMultiDay: boolean;
}

export interface TimeEntry {
  id: string;
  date: string; // YYYY-MM-DD format - which day this entry belongs to
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  note?: string;
}

export interface DayData {
  date: string;
  goals: Goal[];
  totalLoggedHours: number;
  completedGoals: number;
  checkedIn?: boolean; // Track if user checked in today
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'goals' | 'time' | 'special';
  requirement: number;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  totalGoalsCompleted: number;
  totalTimeLogged: number; // in minutes
  achievements: Achievement[];
  lastCheckIn?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}