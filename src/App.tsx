import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, BarChart3, LogOut, User, Sparkles, Target } from 'lucide-react';
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './config/firebase';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import Calendar from './components/Calendar';
import GoalForm from './components/GoalForm';
import GoalCard from './components/GoalCard';
import DayStats from './components/DayStats';
import PerformanceGraph from './components/PerformanceGraph';
import ThemeSelector from './components/ThemeSelector';
import AppLogo from './components/AppLogo';
import { Goal, DayData } from './types/Goal';
import { getDayData, loadData, formatDateKey, saveGoal, deleteGoal, loadUserDataFromMongo, generateId } from './utils/storage';

function App() {
  const { currentTheme } = useTheme();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [dayData, setDayData] = useState<DayData>({ date: '', goals: [], totalLoggedHours: 0, completedGoals: 0 });
  const [allData, setAllData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Load user data from MongoDB if available
        await loadUserDataFromMongo(user.uid);
        refreshData(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDisplayDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (formatDateKey(date) === formatDateKey(today)) {
      return 'Today';
    } else if (formatDateKey(date) === formatDateKey(yesterday)) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  useEffect(() => {
    if (user) {
      refreshData(user.uid);
    }
  }, [selectedDate, user]);

  const refreshData = (userId: string) => {
    const dateKey = formatDateKey(selectedDate);
    const data = getDayData(dateKey, userId);
    setDayData(data);
    setAllData(loadData(userId));
  };

  const handleAddGoal = async (goalData: Omit<Goal, 'id' | 'loggedHours' | 'completed' | 'timeEntries' | 'createdAt'>) => {
    if (!user) {
      console.error('❌ No user found - cannot add goal');
      alert('You must be logged in to add goals. Please refresh the page and try again.');
      return;
    }

    console.log('🎯 Adding new goal:', goalData.title);

    // Generate a unique ID using the enhanced generator
    const goalId = generateId();
    console.log('🆔 Generated goal ID:', goalId);

    const newGoal: Goal = {
      ...goalData,
      id: goalId,
      loggedHours: 0,
      completed: false,
      timeEntries: [],
      createdAt: new Date().toISOString(),
    };

    console.log('📝 Complete goal object:', {
      id: newGoal.id,
      title: newGoal.title,
      category: newGoal.category,
      targetHours: newGoal.targetHours,
      startDate: newGoal.startDate,
      endDate: newGoal.endDate,
      isMultiDay: newGoal.isMultiDay
    });

    try {
      console.log('💾 Attempting to save goal...');
      await saveGoal(newGoal, user.uid);

      console.log('🔄 Refreshing data after save...');
      refreshData(user.uid);

      console.log('✅ Goal added successfully! Closing form...');
      setShowGoalForm(false);

      // Show success message
      console.log('🎉 Goal "' + newGoal.title + '" has been added successfully!');

    } catch (error) {
      console.error('❌ Error saving goal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Failed to save goal: ' + errorMessage + '\n\nPlease try again. If the problem persists, try refreshing the page.');
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    if (!user) return;
    await saveGoal(updatedGoal, user.uid);
    refreshData(user.uid);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    await deleteGoal(goalId, user.uid);
    refreshData(user.uid);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${currentTheme.background}`}>
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className={`w-20 h-20 border-4 border-current/20 rounded-full animate-spin border-t-current ${currentTheme.text}`}></div>
            <div className={`absolute inset-0 w-20 h-20 border-4 border-current/10 rounded-full animate-ping opacity-30 ${currentTheme.text}`}></div>
          </div>
          <div className="text-center">
            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-2`}>Preparing your mindful space</h3>
            <p className={currentTheme.textSecondary}>Loading your goals and intentions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.background}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-gentle-float`}></div>
        <div className={`absolute top-1/3 -left-32 w-64 h-64 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-float-reverse`}></div>
        <div className={`absolute bottom-20 right-1/4 w-48 h-48 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-pulse-slow`}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-2xl ${currentTheme.shadow} shadow-lg p-4`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 lg:mb-0">
                <div className="animate-breathe flex-shrink-0">
                  <AppLogo size={48} className="drop-shadow-lg" />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className={`text-2xl font-bold bg-gradient-to-r ${currentTheme.gradientText} bg-clip-text text-transparent mb-1`}>
                    Mindful Goals
                  </h1>
                  <p className={`${currentTheme.textSecondary} text-sm leading-relaxed`}>
                    Cultivate intention, track progress, find peace in purpose
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeSelector />

                <div className={`flex items-center gap-2 px-3 py-2 ${currentTheme.surface} ${currentTheme.border} border rounded-xl shadow-md hover:shadow-lg transition-all duration-300`}>
                  <div className="relative">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className={`w-8 h-8 rounded-full border-2 ${currentTheme.border}`}
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentTheme.primary} flex items-center justify-center`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br ${currentTheme.accent} rounded-full border border-white`}></div>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${currentTheme.text}`}>
                      {user?.displayName || 'Mindful User'}
                    </p>
                    <p className={`text-xs ${currentTheme.textSecondary}`}>Welcome back</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`group px-3 py-2 rounded-xl border transition-all duration-300 flex items-center gap-1 font-medium text-sm ${showAnalytics
                      ? `bg-gradient-to-r ${currentTheme.secondary} text-white ${currentTheme.border} shadow-lg ${currentTheme.shadow}`
                      : `${currentTheme.surface} ${currentTheme.text} ${currentTheme.border} hover:bg-gradient-to-r hover:${currentTheme.gradient} hover:shadow-lg ${currentTheme.shadow}`
                      }`}
                  >
                    <BarChart3 className="w-3 h-3" />
                    <span className="hidden sm:inline">
                      {showAnalytics ? 'Hide Analytics' : 'Analytics'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`group px-3 py-2 rounded-xl border transition-all duration-300 flex items-center gap-1 font-medium text-sm ${showCalendar
                      ? `bg-gradient-to-r ${currentTheme.info} text-white ${currentTheme.border} shadow-lg ${currentTheme.shadow}`
                      : `${currentTheme.surface} ${currentTheme.text} ${currentTheme.border} hover:bg-gradient-to-r hover:${currentTheme.gradient} hover:shadow-lg ${currentTheme.shadow}`
                      }`}
                  >
                    <CalendarIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">
                      {showCalendar ? 'Hide Calendar' : 'Calendar'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowGoalForm(true)}
                    className={`group px-4 py-2 bg-gradient-to-r ${currentTheme.primary} text-white rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-lg ${currentTheme.shadow} flex items-center gap-1 font-semibold text-sm`}
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Create Goal</span>
                    <Sparkles className="w-3 h-3 opacity-70" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className={`px-3 py-2 ${currentTheme.surface} ${currentTheme.textSecondary} rounded-xl hover:${currentTheme.text} transition-all duration-300 flex items-center gap-1 border ${currentTheme.border}`}
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAnalytics && (
          <div className="mb-6">
            <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-2xl shadow-lg ${currentTheme.shadow} p-4`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 bg-gradient-to-br ${currentTheme.secondary} rounded-lg flex items-center justify-center animate-gentle-float`}>
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h2 className={`text-lg font-bold ${currentTheme.text}`}>Your Journey Analytics</h2>
              </div>
              <PerformanceGraph allData={allData} />
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="text-center">
            <h2 className={`text-xl font-bold ${currentTheme.text} mb-2`}>
              {formatDisplayDate(selectedDate)}
            </h2>
            <div className={`w-16 h-0.5 bg-gradient-to-r ${currentTheme.primary} rounded-full mx-auto animate-mindful-shimmer`}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {showCalendar && (
            <div className="xl:col-span-1">
              <div className="sticky top-4">
                <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-2xl shadow-lg ${currentTheme.shadow} p-4`}>
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    dayData={allData}
                  />
                </div>
              </div>
            </div>
          )}

          <div className={`${showCalendar ? 'xl:col-span-4' : 'xl:col-span-5'} space-y-6`}>
            <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-2xl shadow-lg ${currentTheme.shadow} p-4`}>
              <DayStats dayData={dayData} />
            </div>

            <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-2xl shadow-lg ${currentTheme.shadow} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 bg-gradient-to-br ${currentTheme.primary} rounded-lg flex items-center justify-center animate-zen-pulse`}>
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold ${currentTheme.text}`}>
                    Today's Intentions ({dayData.goals.length})
                  </h3>
                </div>
              </div>

              {dayData.goals.length === 0 ? (
                <div className="text-center py-8">
                  <div className="relative mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${currentTheme.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 animate-breathe`}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${currentTheme.primary} rounded-xl flex items-center justify-center`}>
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className={`absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br ${currentTheme.accent} rounded-full flex items-center justify-center mx-auto animate-zen-pulse`}>
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold ${currentTheme.text} mb-2`}>Your canvas awaits</h3>
                  <p className={`${currentTheme.textSecondary} text-sm mb-4 max-w-md mx-auto leading-relaxed`}>
                    Begin your mindful journey by setting an intention for today. Every great achievement starts with a single, thoughtful goal.
                  </p>
                  <button
                    onClick={() => setShowGoalForm(true)}
                    className={`group px-4 py-2 bg-gradient-to-r ${currentTheme.primary} text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${currentTheme.shadow} flex items-center gap-2 mx-auto font-semibold text-sm`}
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Set Your First Intention</span>
                    <Sparkles className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {dayData.goals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      currentDate={formatDateKey(selectedDate)}
                      onUpdate={handleUpdateGoal}
                      onDelete={handleDeleteGoal}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showGoalForm && (
        <GoalForm
          onSave={handleAddGoal}
          onCancel={() => setShowGoalForm(false)}
          selectedDate={formatDateKey(selectedDate)}
        />
      )}
    </div>
  );
}

export default App;