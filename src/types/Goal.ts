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
}