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
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-gentle-float`}></div>
        <div className={`absolute top-1/3 -left-32 w-64 h-64 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-float-reverse`}></div>
        <div className={`absolute bottom-20 right-1/4 w-48 h-48 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-pulse-slow`}></div>
      </div>

      <div className="relative max-w-8xl mx-auto px-6 py-12">
        {/* Elevated Header with enhanced design */}
        <div className="mb-16">
          <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-3xl ${currentTheme.shadow} shadow-xl p-8`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="flex items-center space-x-4 mb-6 lg:mb-0">
                <div className="animate-breathe flex-shrink-0">
                  <AppLogo size={64} className="drop-shadow-lg" />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className={`text-4xl font-bold bg-gradient-to-r ${currentTheme.gradientText} bg-clip-text text-transparent mb-2`}>
                    Mindful Goals
                  </h1>
                  <p className={`${currentTheme.textSecondary} text-lg leading-relaxed`}>
                    Cultivate intention, track progress, find peace in purpose
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Theme Selector */}
                <ThemeSelector />

                {/* Enhanced User Profile */}
                <div className={`flex items-center gap-3 px-6 py-3 ${currentTheme.surface} ${currentTheme.border} border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className="relative">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className={`w-10 h-10 rounded-full border-2 ${currentTheme.border}`}
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentTheme.primary} flex items-center justify-center`}>
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br ${currentTheme.accent} rounded-full border-2 border-white`}></div>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${currentTheme.text}`}>
                      {user?.displayName || 'Mindful User'}
                    </p>
                    <p className={`text-xs ${currentTheme.textSecondary}`}>Welcome back</p>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`group px-5 py-3 rounded-2xl border transition-all duration-300 flex items-center gap-2 font-medium ${showAnalytics
                      ? `bg-gradient-to-r ${currentTheme.secondary} text-white ${currentTheme.border} shadow-lg ${currentTheme.shadow}`
                      : `${currentTheme.surface} ${currentTheme.text} ${currentTheme.border} hover:bg-gradient-to-r hover:${currentTheme.gradient} hover:shadow-lg ${currentTheme.shadow}`
                      }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {showAnalytics ? 'Hide Analytics' : 'Analytics'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`group px-5 py-3 rounded-2xl border transition-all duration-300 flex items-center gap-2 font-medium ${showCalendar
                      ? `bg-gradient-to-r ${currentTheme.info} text-white ${currentTheme.border} shadow-lg ${currentTheme.shadow}`
                      : `${currentTheme.surface} ${currentTheme.text} ${currentTheme.border} hover:bg-gradient-to-r hover:${currentTheme.gradient} hover:shadow-lg ${currentTheme.shadow}`
                      }`}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {showCalendar ? 'Hide Calendar' : 'Calendar'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowGoalForm(true)}
                    className={`group px-6 py-3 bg-gradient-to-r ${currentTheme.primary} text-white rounded-2xl hover:scale-105 transition-all duration-300 hover:shadow-lg ${currentTheme.shadow} flex items-center gap-2 font-semibold`}
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Create Goal</span>
                    <Sparkles className="w-4 h-4 opacity-70" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className={`px-4 py-3 ${currentTheme.surface} ${currentTheme.textSecondary} rounded-2xl hover:${currentTheme.text} transition-all duration-300 flex items-center gap-2 border ${currentTheme.border}`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section with enhanced design */}
        {showAnalytics && (
          <div className="mb-12">
            <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-3xl shadow-xl ${currentTheme.shadow} p-8`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.secondary} rounded-xl flex items-center justify-center animate-gentle-float`}>
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Your Journey Analytics</h2>
              </div>
              <PerformanceGraph allData={allData} />
            </div>
          </div>
        )}

        {/* Enhanced Date Header */}
        <div className="mb-10">
          <div className="text-center">
            <h2 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>
              {formatDisplayDate(selectedDate)}
            </h2>
            <div className={`w-24 h-1 bg-gradient-to-r ${currentTheme.primary} rounded-full mx-auto animate-mindful-shimmer`}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Enhanced Calendar */}
          {showCalendar && (
            <div className="xl:col-span-1">
              <div className="sticky top-8">
                <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-3xl shadow-xl ${currentTheme.shadow} p-6`}>
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    dayData={allData}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Content with enhanced spacing */}
          <div className={`${showCalendar ? 'xl:col-span-4' : 'xl:col-span-5'} space-y-10`}>
            {/* Enhanced Stats */}
            <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-3xl shadow-xl ${currentTheme.shadow} p-8`}>
              <DayStats dayData={dayData} />
            </div>

            {/* Enhanced Goals Section */}
            <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-3xl shadow-xl ${currentTheme.shadow} p-8`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.primary} rounded-xl flex items-center justify-center animate-zen-pulse`}>
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold ${currentTheme.text}`}>
                    Today's Intentions ({dayData.goals.length})
                  </h3>
                </div>
              </div>

              {dayData.goals.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mb-8">
                    <div className={`w-24 h-24 bg-gradient-to-br ${currentTheme.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-breathe`}>
                      <div className={`w-16 h-16 bg-gradient-to-br ${currentTheme.primary} rounded-2xl flex items-center justify-center`}>
                        <Plus className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${currentTheme.accent} rounded-full flex items-center justify-center mx-auto animate-zen-pulse`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold ${currentTheme.text} mb-4`}>Your canvas awaits</h3>
                  <p className={`${currentTheme.textSecondary} text-lg mb-8 max-w-md mx-auto leading-relaxed`}>
                    Begin your mindful journey by setting an intention for today. Every great achievement starts with a single, thoughtful goal.
                  </p>
                  <button
                    onClick={() => setShowGoalForm(true)}
                    className={`group px-8 py-4 bg-gradient-to-r ${currentTheme.primary} text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${currentTheme.shadow} flex items-center gap-3 mx-auto font-semibold text-lg`}
                  >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Set Your First Intention</span>
                    <Sparkles className="w-5 h-5 opacity-70" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

      {/* Enhanced Goal Form Modal */}
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