import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, BarChart3, LogOut, User, Sparkles, Target, Trophy } from 'lucide-react';
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
import AchievementSystem from './components/AchievementSystem';
import DailyTasksNotepad from './components/DailyTasksNotepad';
import { Goal, DayData, UserStats, TodoItem } from './types/Goal';
import { getDayData, loadData, formatDateKey, saveGoal, deleteGoal, loadUserDataFromMongo, generateId } from './utils/storage';
import { motion } from 'framer-motion';

function App() {
  const { currentTheme } = useTheme();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [dayData, setDayData] = useState<DayData>({ date: '', goals: [], totalLoggedHours: 0, completedGoals: 0 });
  const [allData, setAllData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    totalGoalsCompleted: 0,
    totalTimeLogged: 0,
    achievements: [],
  });
  const navigate = useNavigate();

  const inspirationalQuotes = [
    "Love yourself and your goals",
    "Keep yourself first and your goals on top",
    "Atomic habits make up for everything",
    "Slow and steady wins the race",
    "Go at your own speed and compare yourself to who you were yesterday",
    "Compare yourself to who you were yesterday",
    "Every little bit of progress counts",
    "Direction is more important than speed",
    "Do things that make you happy every day",
    "Habits come from repetition, and healthy habits are worth it",
    "Treat your life goals as a game",
    "Focus on what you like, not what you are made to like",
    "Choose goals that make you happy every day",
    "Curiosity over fear, always",
    "Chase value, not money",
    "A calm mind can solve anything",
    "Do whatever is possible for you now and be satisfied with that",
    "Consistency is the hardest thing to maintain, but it's the most worth it",
    "Everyone is missing out on something; always find your happiness wherever you are",
    "Happiness comes from within"
  ];

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % inspirationalQuotes.length;
        console.log(`Quote changing from ${prevIndex} to ${nextIndex}: "${inspirationalQuotes[nextIndex]}"`);
        return nextIndex;
      });
    }, 40000); // Change quote every 40 seconds

    return () => clearInterval(interval);
  }, [inspirationalQuotes.length]);

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
    const allUserData = loadData(userId);
    setAllData(allUserData);
    updateUserStats(allUserData);
  };

  const updateUserStats = (allUserData: Record<string, DayData>) => {
    const totalGoalsCompleted = Object.values(allUserData).reduce((sum, day) => sum + day.completedGoals, 0);
    const totalTimeLogged = Object.values(allUserData).reduce((sum, day) => sum + (day.totalLoggedHours * 60), 0);

    setUserStats(prev => ({
      ...prev,
      totalGoalsCompleted,
      totalTimeLogged,
    }));
  };

  const handleStatsUpdate = (newStats: UserStats) => {
    setUserStats(newStats);
    if (user) {
      localStorage.setItem(`userStats_${user.uid}`, JSON.stringify(newStats));
    }
  };

  const handleCheckIn = () => {
    const today = formatDateKey(selectedDate);
    const updatedDayData = { ...dayData, checkedIn: true };
    setDayData(updatedDayData);

    if (user) {
      const allUserData = { ...allData, [today]: updatedDayData };
      setAllData(allUserData);
      localStorage.setItem(`goalData_${user.uid}`, JSON.stringify(allUserData));
    }
  };

  useEffect(() => {
    if (user) {
      const savedStats = localStorage.getItem(`userStats_${user.uid}`);
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      }
      const savedTodos = localStorage.getItem(`todos_${user.uid}`);
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    }
  }, [user]);

  const handleUpdateTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    if (user) {
      localStorage.setItem(`todos_${user.uid}`, JSON.stringify(newTodos));
    }
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
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${currentTheme.background} overflow-hidden relative`}>
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-gentle-float opacity-30`}></div>
          <div className={`absolute top-1/3 -left-32 w-64 h-64 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-float-reverse opacity-20`}></div>
          <div className={`absolute bottom-20 right-1/4 w-48 h-48 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-pulse-slow opacity-25`}></div>

          {/* Floating Zen Elements */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/20 rounded-full animate-float-up-slow"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/15 rounded-full animate-float-up-delayed"></div>
          <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-white/10 rounded-full animate-float-up-slow"></div>
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-float-up-delayed"></div>
          <div className="absolute bottom-1/4 right-1/2 w-3 h-3 bg-white/15 rounded-full animate-float-up-slow"></div>
        </div>

        {/* Main Loading Content */}
        <div className="flex flex-col items-center space-y-8 z-10 text-center px-6">
          {/* Animated Logo/Icon */}
          <div className="relative">
            <div className="relative animate-breathe">
              <AppLogo size={80} className="drop-shadow-2xl" />

              {/* Rotating Ring */}
              <div className={`absolute inset-0 w-20 h-20 border-4 border-transparent border-t-current ${currentTheme.text} rounded-full animate-spin opacity-40`}></div>

              {/* Pulsing Outer Ring */}
              <div className={`absolute -inset-4 w-28 h-28 border-2 border-current ${currentTheme.text} rounded-full animate-ping opacity-20`}></div>
            </div>

            {/* Floating Sparkles around logo */}
            <div className={`absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-br ${currentTheme.accent} rounded-full animate-zen-pulse`}></div>
            <div className={`absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-br ${currentTheme.primary} rounded-full animate-zen-pulse delay-300`}></div>
            <div className={`absolute top-1/2 -right-4 w-2 h-2 bg-gradient-to-br ${currentTheme.secondary} rounded-full animate-zen-pulse delay-500`}></div>
          </div>

          {/* Loading Text with Animation */}
          <div className="space-y-4">
            <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2 animate-fade-in-up`}>
              Preparing your mindful space
            </h3>

            {/* Animated Dots */}
            <div className="flex items-center justify-center space-x-1">
              <div className={`w-2 h-2 bg-current ${currentTheme.text} rounded-full animate-bounce`}></div>
              <div className={`w-2 h-2 bg-current ${currentTheme.text} rounded-full animate-bounce delay-100`}></div>
              <div className={`w-2 h-2 bg-current ${currentTheme.text} rounded-full animate-bounce delay-200`}></div>
            </div>

            {/* Inspirational Loading Messages */}
            <div className="mt-6 max-w-md">
              <p className={`${currentTheme.textSecondary} text-sm leading-relaxed animate-fade-in-up delay-300 italic`}>
                "Loading your goals and intentions..."
              </p>
              <p className={`${currentTheme.textSecondary} text-xs mt-2 animate-fade-in-up delay-500 opacity-75`}>
                Taking a moment to center your digital mindfulness journey
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="w-64 space-y-2">
            <div className={`w-full h-1 bg-white/20 rounded-full overflow-hidden`}>
              <div className={`h-full bg-gradient-to-r ${currentTheme.primary} rounded-full animate-loading-progress`}></div>
            </div>
            <p className={`text-xs ${currentTheme.textSecondary} opacity-60`}>
              Cultivating your peaceful productivity environment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.background}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs */}
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-gentle-float opacity-30`}></div>
        <div className={`absolute top-1/3 -left-32 w-64 h-64 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-float-reverse opacity-20`}></div>
        <div className={`absolute bottom-20 right-1/4 w-48 h-48 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-3xl animate-pulse-slow opacity-25`}></div>

        {/* Peaceful drifting elements */}
        <div className="absolute top-1/4 left-0 w-4 h-4 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full animate-peaceful-drift opacity-20" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/2 left-0 w-3 h-3 bg-gradient-to-br from-green-200 to-blue-200 rounded-full animate-peaceful-drift opacity-15" style={{ animationDelay: '8s' }}></div>
        <div className="absolute top-3/4 left-0 w-5 h-5 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full animate-peaceful-drift opacity-25" style={{ animationDelay: '16s' }}></div>

        {/* Meditative flowing particles */}
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full animate-meditative-flow opacity-20" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-0 left-1/2 w-3 h-3 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full animate-meditative-flow opacity-15" style={{ animationDelay: '10s' }}></div>
        <div className="absolute top-0 left-3/4 w-2 h-2 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full animate-meditative-flow opacity-25" style={{ animationDelay: '20s' }}></div>

        {/* Gentle waving elements */}
        <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full animate-gentle-wave opacity-20"></div>
        <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full animate-gentle-wave opacity-15" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-5 h-5 bg-gradient-to-br from-sky-200 to-cyan-200 rounded-full animate-gentle-wave opacity-25" style={{ animationDelay: '8s' }}></div>

        {/* Serene spiraling orbs */}
        <div className="absolute top-1/4 right-1/4">
          <div className="w-3 h-3 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full animate-serene-spiral opacity-20"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/3">
          <div className="w-4 h-4 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full animate-serene-spiral opacity-15" style={{ animationDelay: '7s' }}></div>
        </div>

        {/* Tranquil orbiting elements */}
        <div className="absolute top-1/2 right-1/2">
          <div className="w-2 h-2 bg-gradient-to-br from-lime-200 to-green-200 rounded-full animate-tranquil-orbit opacity-20"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/2">
          <div className="w-3 h-3 bg-gradient-to-br from-fuchsia-200 to-purple-200 rounded-full animate-tranquil-orbit opacity-15" style={{ animationDelay: '12s' }}></div>
        </div>

        {/* Mindful breeze particles */}
        <div className="absolute top-1/6 right-1/6 w-2 h-2 bg-gradient-to-br from-slate-200 to-gray-200 rounded-full animate-mindful-breeze opacity-15"></div>
        <div className="absolute bottom-1/6 left-1/6 w-3 h-3 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-full animate-mindful-breeze opacity-20" style={{ animationDelay: '5s' }}></div>
        <div className="absolute top-5/6 right-1/3 w-2 h-2 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-full animate-mindful-breeze opacity-25" style={{ animationDelay: '10s' }}></div>

        {/* Additional floating zen elements */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/10 rounded-full animate-float-up-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/15 rounded-full animate-float-up-delayed"></div>
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-white/10 rounded-full animate-float-up-slow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-float-up-delayed" style={{ animationDelay: '6s' }}></div>
        <div className="absolute bottom-1/4 right-1/2 w-3 h-3 bg-white/15 rounded-full animate-float-up-slow" style={{ animationDelay: '9s' }}></div>
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
                    className={`group px-2 py-2 rounded-lg border transition-all duration-300 flex items-center gap-1 font-medium text-xs ${showAnalytics
                      ? `bg-gradient-to-r ${currentTheme.secondary} text-white ${currentTheme.border} shadow-lg ${currentTheme.shadow}`
                      : `${currentTheme.surface} ${currentTheme.text} ${currentTheme.border} hover:bg-gradient-to-r hover:${currentTheme.gradient} hover:shadow-lg ${currentTheme.shadow}`
                      }`}
                  >
                    <BarChart3 className="w-1 h-1" />
                    <span className="hidden md:inline">
                      {showAnalytics ? 'Hide Analytics' : 'Analytics'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowAchievements(!showAchievements)}
                    className={`group px-2 py-2 rounded-lg border transition-all duration-300 flex items-center gap-1 font-medium text-xs ${showAchievements
                      ? `bg-gradient-to-r ${currentTheme.accent} text-white ${currentTheme.border} shadow-lg ${currentTheme.shadow}`
                      : `${currentTheme.surface} ${currentTheme.text} ${currentTheme.border} hover:bg-gradient-to-r hover:${currentTheme.gradient} hover:shadow-lg ${currentTheme.shadow}`
                      }`}
                  >
                    <Trophy className="w-1 h-1" />
                    <span className="hidden md:inline">
                      {showAchievements ? 'Hide Achievements' : 'Achievements'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`group px-2 py-2 rounded-lg border transition-all duration-300 flex items-center gap-1 font-medium text-xs ${showCalendar
                      ? `bg-gradient-to-r ${currentTheme.info} text-white ${currentTheme.border} shadow-lg ${currentTheme.shadow}`
                      : `${currentTheme.surface} ${currentTheme.text} ${currentTheme.border} hover:bg-gradient-to-r hover:${currentTheme.gradient} hover:shadow-lg ${currentTheme.shadow}`
                      }`}
                  >
                    <CalendarIcon className="w-1 h-1" />
                    <span className="hidden md:inline">
                      {showCalendar ? 'Hide Calendar' : 'Calendar'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowGoalForm(true)}
                    className={`group px-3 py-2 bg-gradient-to-r ${currentTheme.primary} text-white rounded-lg hover:scale-105 transition-all duration-300 hover:shadow-lg ${currentTheme.shadow} flex items-center gap-1 font-semibold text-xs`}
                  >
                    <Plus className="w-1 h-1 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="hidden sm:inline">Create Goal</span>
                    <Sparkles className="w-2 h-2 opacity-70" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className={`px-3 py-2 ${currentTheme.surface} ${currentTheme.textSecondary} rounded-xl hover:${currentTheme.text} transition-all duration-300 flex items-center gap-1 border ${currentTheme.border}`}
                  >
                    <LogOut className="w-2.5 h-2.5" />
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

        {showAchievements && (
          <div className="mb-6">
            <AchievementSystem
              userStats={userStats}
              onUpdateStats={handleStatsUpdate}
              onCheckIn={handleCheckIn}
            />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center my-12 py-2"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Today
          </h2>

          <div className="flex justify-center mb-6">
            <DailyTasksNotepad todos={todos} onUpdateTodos={handleUpdateTodos} />
          </div>

          <motion.div
            key={currentQuoteIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <p className="text-xl text-slate-600 italic max-w-2xl mx-auto">
              "{inspirationalQuotes[currentQuoteIndex]}"
            </p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {showCalendar && (
            <div className="xl:col-span-1">
              <div className="sticky top-4">
                <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-2xl shadow-lg ${currentTheme.shadow} p-4 mb-4`}>
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