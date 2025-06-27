import { Goal, DayData } from '../types/Goal';
import { mongoService, fallbackStorage } from '../services/mongodb';

const STORAGE_KEY = 'goal-tracker-data';

// Helper function to get user-specific storage key
const getUserStorageKey = (userId: string, suffix: string = '') => {
  return `goal-tracker-${userId}${suffix ? `-${suffix}` : ''}`;
};

// Enhanced ID generation to avoid conflicts
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const extraRandom = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomPart}-${extraRandom}`;
};

export const loadData = (userId?: string): Record<string, DayData> => {
  try {
    const key = userId ? getUserStorageKey(userId) : STORAGE_KEY;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading data:', error);
    return {};
  }
};

export const saveData = (data: Record<string, DayData>, userId?: string): void => {
  try {
    const key = userId ? getUserStorageKey(userId) : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(data));
    console.log('✅ Data saved to localStorage successfully');
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

export const getDayData = (date: string, userId?: string): DayData => {
  console.log('📅 getDayData called for date:', date, 'userId:', userId);

  const allData = loadData(userId);
  const dayGoals = getGoalsForDate(date, userId);

  console.log('📊 Found goals for date:', dayGoals.length);

  const result = allData[date] || {
    date,
    goals: dayGoals,
    totalLoggedHours: dayGoals.reduce((sum, goal) => {
      const dayEntries = goal.timeEntries.filter(entry => entry.date === date);
      return sum + dayEntries.reduce((entrySum, entry) => entrySum + entry.duration / 60, 0);
    }, 0),
    completedGoals: dayGoals.filter(goal => goal.completed).length,
  };

  console.log('📊 Returning day data:', result);
  return result;
};

export const saveDayData = (dayData: DayData, userId?: string): void => {
  const allData = loadData(userId);
  allData[dayData.date] = dayData;
  saveData(allData, userId);

  // Also try to save to MongoDB if userId is provided
  if (userId) {
    mongoService.saveDayData(dayData, userId).catch(error => {
      console.error('Failed to save day data to MongoDB:', error);
      // Continue with localStorage fallback
    });
  }
};

export const saveGoal = async (goal: Goal, userId?: string): Promise<void> => {
  console.log('💾 saveGoal called with:', {
    goalId: goal.id,
    title: goal.title,
    userId: userId ? userId.substring(0, 8) + '...' : 'none'
  });

  try {
    // Validate goal data
    if (!goal.id || !goal.title) {
      throw new Error('Invalid goal data: missing id or title');
    }

    // Get current goals and ensure unique ID
    const allGoals = getAllGoals(userId);
    console.log('📊 Current total goals count:', allGoals.length);

    // Check for ID conflicts and regenerate if necessary
    const existingGoal = allGoals.find(g => g.id === goal.id && g.title !== goal.title);
    if (existingGoal) {
      console.warn('⚠️ ID conflict detected, regenerating ID');
      goal.id = generateId();
    }

    // Remove existing goal if updating (same ID and title)
    const filteredGoals = allGoals.filter(g => g.id !== goal.id);
    filteredGoals.push(goal);

    console.log('📊 Updated goals count:', filteredGoals.length);

    // Store goals with better error handling
    const goalsKey = userId ? getUserStorageKey(userId, 'goals') : 'goal-tracker-goals';
    console.log('🗃️ Saving to localStorage key:', goalsKey);

    try {
      localStorage.setItem(goalsKey, JSON.stringify(filteredGoals));
      console.log('✅ Goals saved to localStorage successfully');
    } catch (storageError) {
      console.error('❌ Failed to save goals to localStorage:', storageError);
      const errorMessage = storageError instanceof Error ? storageError.message : String(storageError);
      throw new Error('Failed to save to local storage: ' + errorMessage);
    }

    // Update all affected dates with proper error handling
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const allData = loadData(userId);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = formatDateKey(d);
      const dayGoals = getGoalsForDate(dateKey, userId);

      const dayData = allData[dateKey] || {
        date: dateKey,
        goals: [],
        totalLoggedHours: 0,
        completedGoals: 0,
      };

      dayData.goals = dayGoals;
      dayData.totalLoggedHours = dayGoals.reduce((sum, g) => {
        const dayEntries = g.timeEntries.filter(entry => entry.date === dateKey);
        return sum + dayEntries.reduce((entrySum, entry) => entrySum + entry.duration / 60, 0);
      }, 0);
      dayData.completedGoals = dayGoals.filter(g => g.completed).length;

      allData[dateKey] = dayData;
    }

    // Save updated day data
    saveData(allData, userId);
    console.log('✅ Day data updated successfully');

    // Try to save to MongoDB if userId is provided
    if (userId) {
      try {
        console.log('🌐 Attempting to save to MongoDB...');
        await mongoService.saveGoal(goal, userId, formatDateKey(new Date()));
        console.log('✅ Saved to MongoDB successfully');
      } catch (mongoError) {
        console.error('❌ Failed to save goal to MongoDB:', mongoError);
        // Don't throw here, localStorage is working
      }
    }

    console.log('🎉 Goal saved successfully!');

  } catch (error) {
    console.error('❌ Critical error in saveGoal:', error);
    throw error;
  }
};

export const getAllGoals = (userId?: string): Goal[] => {
  try {
    const key = userId ? getUserStorageKey(userId, 'goals') : 'goal-tracker-goals';
    const goals = localStorage.getItem(key);
    const parsedGoals = goals ? JSON.parse(goals) : [];
    console.log('📋 getAllGoals returning:', parsedGoals.length, 'goals');
    return parsedGoals;
  } catch (error) {
    console.error('Error loading goals:', error);
    return [];
  }
};

export const getGoalsForDate = (date: string, userId?: string): Goal[] => {
  const allGoals = getAllGoals(userId);
  console.log('🔍 getGoalsForDate - All goals:', allGoals.length, 'for date:', date);

  const filteredGoals = allGoals.filter(goal => {
    const goalStart = new Date(goal.startDate);
    const goalEnd = new Date(goal.endDate);
    const checkDate = new Date(date);

    const isInRange = checkDate >= goalStart && checkDate <= goalEnd;
    console.log(`  📋 Goal "${goal.title}": ${goal.startDate} to ${goal.endDate} - includes ${date}? ${isInRange}`);

    return isInRange;
  });

  console.log('🎯 Filtered goals for date:', filteredGoals.length);
  return filteredGoals;
};

export const deleteGoal = async (goalId: string, userId?: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting goal:', goalId);

    const allGoals = getAllGoals(userId);
    const goal = allGoals.find(g => g.id === goalId);

    if (!goal) {
      console.warn('⚠️ Goal not found for deletion:', goalId);
      return;
    }

    const filteredGoals = allGoals.filter(g => g.id !== goalId);
    const goalsKey = userId ? getUserStorageKey(userId, 'goals') : 'goal-tracker-goals';
    localStorage.setItem(goalsKey, JSON.stringify(filteredGoals));

    // Update all affected dates
    const allData = loadData(userId);
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = formatDateKey(d);
      const dayGoals = getGoalsForDate(dateKey, userId);

      if (allData[dateKey]) {
        allData[dateKey].goals = dayGoals;
        allData[dateKey].totalLoggedHours = dayGoals.reduce((sum, g) => {
          const dayEntries = g.timeEntries.filter(entry => entry.date === dateKey);
          return sum + dayEntries.reduce((entrySum, entry) => entrySum + entry.duration / 60, 0);
        }, 0);
        allData[dateKey].completedGoals = dayGoals.filter(g => g.completed).length;
      }
    }

    saveData(allData, userId);

    // Also try to delete from MongoDB if userId is provided
    if (userId) {
      try {
        await mongoService.deleteGoal(goalId, userId);
        console.log('✅ Deleted from MongoDB successfully');
      } catch (error) {
        console.error('Failed to delete goal from MongoDB:', error);
        // Continue with localStorage fallback
      }
    }

    console.log('✅ Goal deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting goal:', error);
    throw error;
  }
};

export const loadUserDataFromMongo = async (userId: string): Promise<void> => {
  try {
    console.log('🌐 Loading user data from MongoDB...');
    const mongoData = await mongoService.getAllUserData(userId);
    if (Object.keys(mongoData).length > 0) {
      saveData(mongoData, userId);
      console.log('✅ User data loaded from MongoDB');
    } else {
      console.log('ℹ️ No MongoDB data found, using localStorage');
    }
  } catch (error) {
    console.error('Failed to load user data from MongoDB:', error);
    console.log('ℹ️ Falling back to localStorage');
  }
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDateKey(d));
  }

  return dates;
};