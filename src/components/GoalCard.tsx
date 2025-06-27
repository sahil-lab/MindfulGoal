import React, { useState } from 'react';
import { Play, Pause, Check, Clock, Target, Trash2, Calendar, Sparkles, TreePine } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Goal, TimeEntry } from '../types/Goal';
import { formatTime, generateId, formatDateKey } from '../utils/storage';

interface GoalCardProps {
  goal: Goal;
  currentDate: string;
  onUpdate: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, currentDate, onUpdate, onDelete }) => {
  const { currentTheme } = useTheme();
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<{ startTime: Date } | null>(null);

  // Safety check for required props
  if (!goal || !currentDate) {
    console.error('GoalCard: Missing required props', { goal, currentDate });
    return null;
  }

  const categoryConfig = {
    work: {
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50/80 via-indigo-50/60 to-blue-50/80',
      borderColor: 'border-blue-200/60',
      textColor: 'text-blue-700',
      icon: '💼',
    },
    personal: {
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50/80 via-pink-50/60 to-purple-50/80',
      borderColor: 'border-purple-200/60',
      textColor: 'text-purple-700',
      icon: '🌟',
    },
    health: {
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50/80 via-teal-50/60 to-emerald-50/80',
      borderColor: 'border-emerald-200/60',
      textColor: 'text-emerald-700',
      icon: '🌱',
    },
    learning: {
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50/80 via-orange-50/60 to-amber-50/80',
      borderColor: 'border-amber-200/60',
      textColor: 'text-amber-700',
      icon: '📚',
    },
    other: {
      gradient: 'from-slate-500 to-gray-600',
      bgGradient: 'from-slate-50/80 via-gray-50/60 to-slate-50/80',
      borderColor: 'border-slate-200/60',
      textColor: 'text-slate-700',
      icon: '✨',
    },
  };

  const config = categoryConfig[goal.category] || categoryConfig.other;

  // Calculate progress for current date - with safety checks
  const todayEntries = goal.timeEntries?.filter(entry => entry?.date === currentDate) || [];
  const todayLoggedHours = todayEntries.reduce((sum, entry) => sum + ((entry?.duration || 0) / 60), 0);
  const targetHours = goal.targetHours || 1;
  const progress = Math.min((todayLoggedHours / targetHours) * 100, 100);
  const isCompleted = goal.completed || progress >= 100;

  // Calculate total progress across all dates
  const totalLoggedHours = goal.timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0) / 60, 0) || 0;

  const getDaysBetween = (startDate: string, endDate: string): number => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } catch (error) {
      console.error('Error calculating days between dates:', error);
      return 1;
    }
  };

  const totalTargetHours = goal.isMultiDay ?
    (goal.targetHours || 1) * getDaysBetween(goal.startDate || '', goal.endDate || '') :
    (goal.targetHours || 1);

  const startTracking = () => {
    setIsTracking(true);
    setCurrentSession({ startTime: new Date() });
  };

  const stopTracking = () => {
    if (!currentSession) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - currentSession.startTime.getTime()) / (1000 * 60));

    const newTimeEntry: TimeEntry = {
      id: generateId(),
      date: currentDate,
      startTime: currentSession.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
    };

    const updatedGoal: Goal = {
      ...goal,
      loggedHours: goal.loggedHours + (duration / 60),
      timeEntries: [...goal.timeEntries, newTimeEntry],
    };

    onUpdate(updatedGoal);
    setIsTracking(false);
    setCurrentSession(null);
  };

  const toggleComplete = () => {
    onUpdate({ ...goal, completed: !goal.completed });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this intention? This will remove it from all dates.')) {
      onDelete(goal.id);
    }
  };

  const formatDateRange = () => {
    try {
      if (!goal.isMultiDay || !goal.startDate || !goal.endDate) return null;

      const start = new Date(goal.startDate);
      const end = new Date(goal.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
      if (goal.startDate === goal.endDate) return null;

      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } catch (error) {
      console.error('Error formatting date range:', error);
      return null;
    }
  };

  try {
    return (
      <div className={`
        group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]
        ${isCompleted
          ? 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-teal-50/30'
          : `${config.borderColor} bg-gradient-to-br ${config.bgGradient}`
        }
        ${isTracking ? 'ring-4 ring-blue-200/50 ring-offset-2 ring-offset-white/50' : ''}
      `}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.gradient} opacity-5 rounded-full blur-3xl transform translate-x-8 -translate-y-8`}></div>
          <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${config.gradient} opacity-5 rounded-full blur-2xl transform -translate-x-4 translate-y-4`}></div>
        </div>

        {/* Achievement badge */}
        {isCompleted && (
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl z-10">
            <div className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-amber-400">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>
        )}

        {/* Tracking indicator */}
        {isTracking && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white text-xs font-medium shadow-lg z-10">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Recording</span>
          </div>
        )}

        <div className="relative p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-xl">{config.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${isCompleted ? 'text-emerald-800 line-through opacity-75' : 'text-slate-800'} group-hover:text-slate-900 transition-colors`}>
                    {goal.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold border backdrop-blur-sm ${isCompleted
                      ? 'bg-emerald-100/80 text-emerald-700 border-emerald-200/80'
                      : `bg-white/80 ${config.textColor} ${config.borderColor}`
                      }`}>
                      {goal.category}
                    </span>
                    {goal.isMultiDay && (
                      <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-100/80 text-indigo-700 border border-indigo-200/80 backdrop-blur-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Journey
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {goal.description && (
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/60">
                  <p className="text-slate-600 leading-relaxed">{goal.description}</p>
                </div>
              )}

              {formatDateRange() && (
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <TreePine className="w-4 h-4" />
                  <span>{formatDateRange()}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 ml-6">
              <button
                onClick={toggleComplete}
                className={`
                group p-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110
                ${isCompleted
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                    : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-700 border border-slate-200/60'
                  }
              `}
              >
                <Check className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </button>
              <button
                onClick={handleDelete}
                className="group p-3 rounded-2xl bg-red-50/80 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 border border-red-100"
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Today's Progress */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-slate-600" />
                  <span className="font-semibold text-slate-700">Today's Focus</span>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {formatTime(Math.round(todayLoggedHours * 60))} / {formatTime((goal.targetHours || 1) * 60)}
                </span>
              </div>
              <div className="relative w-full bg-slate-200/60 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ease-out shadow-sm ${isCompleted
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : `bg-gradient-to-r ${config.gradient}`
                    }`}
                  style={{ width: `${progress}%` }}
                ></div>
                {progress > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                )}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>{Math.round(progress)}% complete</span>
                <span>{Math.max(0, targetHours - todayLoggedHours).toFixed(1)}h remaining</span>
              </div>
            </div>

            {/* Multi-day Total Progress */}
            {goal.isMultiDay && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <span className="font-semibold text-slate-700">Journey Progress</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {formatTime(Math.round(totalLoggedHours * 60))} / {formatTime(totalTargetHours * 60)}
                  </span>
                </div>
                <div className="relative w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-indigo-400 to-purple-500 shadow-sm"
                    style={{ width: `${Math.min((totalLoggedHours / totalTargetHours) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {todayEntries.length} session{todayEntries.length !== 1 ? 's' : ''} today
                  </span>
                </div>
                {goal.isMultiDay && (
                  <div className="text-slate-400 text-sm">
                    • {goal.timeEntries.length} total sessions
                  </div>
                )}
              </div>

              <button
                onClick={isTracking ? stopTracking : startTracking}
                disabled={isCompleted}
                className={`
                group px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl
                ${isTracking
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 hover:scale-105'
                    : isCompleted
                      ? 'bg-slate-100/80 text-slate-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${config.gradient} text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-200/50`
                  }
              `}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Complete Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>{isCompleted ? 'Completed' : 'Begin Focus'}</span>
                    {!isCompleted && <Sparkles className="w-4 h-4 opacity-70" />}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering GoalCard:', error, { goal, currentDate });
    return (
      <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/80 rounded-3xl p-6 text-center shadow-lg">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-xl">⚠️</span>
        </div>
        <p className="text-red-600 font-medium">Unable to display intention</p>
        <p className="text-red-500 text-sm">{goal?.title || 'Unknown goal'}</p>
      </div>
    );
  }
};

export default GoalCard;