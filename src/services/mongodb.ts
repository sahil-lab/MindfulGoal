import { Goal, DayData } from '../types/Goal';

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI;
const API_BASE_URL = '/api'; // This will be handled by your backend

export interface MongoGoal extends Goal {
    userId: string;
    date: string;
}

export interface MongoDayData extends DayData {
    userId: string;
}

// Helper function to make API calls to your backend
async function apiCall(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
}

export const mongoService = {
    // Save a goal to MongoDB
    async saveGoal(goal: Goal, userId: string, date: string): Promise<void> {
        const mongoGoal: MongoGoal = {
            ...goal,
            userId,
            date,
        };

        await apiCall('/goals', {
            method: 'POST',
            body: JSON.stringify(mongoGoal),
        });
    },

    // Get goals for a specific user and date
    async getGoalsForDate(userId: string, date: string): Promise<Goal[]> {
        const response = await apiCall(`/goals/${userId}/${date}`);
        return response.goals || [];
    },

    // Update a goal
    async updateGoal(goal: Goal, userId: string, date: string): Promise<void> {
        const mongoGoal: MongoGoal = {
            ...goal,
            userId,
            date,
        };

        await apiCall(`/goals/${goal.id}`, {
            method: 'PUT',
            body: JSON.stringify(mongoGoal),
        });
    },

    // Delete a goal
    async deleteGoal(goalId: string, userId: string): Promise<void> {
        await apiCall(`/goals/${goalId}`, {
            method: 'DELETE',
            body: JSON.stringify({ userId }),
        });
    },

    // Get all data for a user (for analytics)
    async getAllUserData(userId: string): Promise<Record<string, DayData>> {
        const response = await apiCall(`/user-data/${userId}`);
        return response.data || {};
    },

    // Save day data
    async saveDayData(dayData: DayData, userId: string): Promise<void> {
        const mongoDayData: MongoDayData = {
            ...dayData,
            userId,
        };

        await apiCall('/day-data', {
            method: 'POST',
            body: JSON.stringify(mongoDayData),
        });
    },
};

// Fallback storage service that uses localStorage when MongoDB is not available
export const fallbackStorage = {
    saveGoal: (goal: Goal, userId: string, date: string) => {
        const key = `goals_${userId}_${date}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = existing.filter((g: Goal) => g.id !== goal.id);
        updated.push(goal);
        localStorage.setItem(key, JSON.stringify(updated));
    },

    getGoalsForDate: (userId: string, date: string): Goal[] => {
        const key = `goals_${userId}_${date}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    updateGoal: (goal: Goal, userId: string, date: string) => {
        const key = `goals_${userId}_${date}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = existing.map((g: Goal) => g.id === goal.id ? goal : g);
        localStorage.setItem(key, JSON.stringify(updated));
    },

    deleteGoal: (goalId: string, userId: string, date: string) => {
        const key = `goals_${userId}_${date}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = existing.filter((g: Goal) => g.id !== goalId);
        localStorage.setItem(key, JSON.stringify(updated));
    },

    getAllUserData: (userId: string): Record<string, DayData> => {
        const data: Record<string, DayData> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`goals_${userId}_`)) {
                const date = key.split('_')[2];
                const goals = JSON.parse(localStorage.getItem(key) || '[]');
                data[date] = {
                    date,
                    goals,
                    totalLoggedHours: goals.reduce((sum: number, goal: Goal) => sum + goal.loggedHours, 0),
                    completedGoals: goals.filter((goal: Goal) => goal.completed).length,
                };
            }
        }
        return data;
    }
}; 