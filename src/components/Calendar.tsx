import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, Circle, CheckCircle } from 'lucide-react';
import { DayData } from '../types/Goal';
import { getGoalsForDate } from '../utils/storage';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dayData: Record<string, DayData>;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, dayData }) => {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    onDateSelect(newDate);
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const getDayInfo = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = formatDateKey(date);
    const goals = getGoalsForDate(dateKey);
    const completedGoals = goals.filter(goal => goal.completed).length;

    return {
      hasGoals: goals.length > 0,
      goalCount: goals.length,
      completedCount: completedGoals,
      allCompleted: goals.length > 0 && completedGoals === goals.length,
      progressPercentage: goals.length > 0 ? (completedGoals / goals.length) * 100 : 0
    };
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-14"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayInfo = getDayInfo(day);
      const dayIsToday = isToday(day);
      const dayIsSelected = isSelected(day);

      days.push(
        <button
          key={day}
          onClick={() => onDateSelect(new Date(currentYear, currentMonth, day))}
          className={`
            group relative h-14 w-full rounded-2xl transition-all duration-300 text-sm font-semibold
            hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2
            ${dayIsSelected
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform scale-105'
              : dayIsToday
                ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-800 border-2 border-amber-300 shadow-sm'
                : dayInfo.hasGoals
                  ? dayInfo.allCompleted
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200 hover:from-emerald-100 hover:to-teal-100'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-indigo-100'
                  : 'bg-white/60 hover:bg-white text-slate-600 hover:text-slate-800 border border-slate-200/60 hover:border-slate-300'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center h-full relative">
            <span className="text-lg leading-none">{day}</span>

            {/* Goal indicators */}
            {dayInfo.hasGoals && !dayIsSelected && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-1">
                  {dayInfo.allCompleted ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-xs font-medium">{dayInfo.goalCount}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium">{dayInfo.completedCount}/{dayInfo.goalCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Achievement sparkle for fully completed days */}
            {dayInfo.allCompleted && !dayIsSelected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            )}

            {/* Today indicator */}
            {dayIsToday && !dayIsSelected && (
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-white">
              </div>
            )}
          </div>

          {/* Progress bar for days with goals */}
          {dayInfo.hasGoals && !dayIsSelected && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-b-2xl overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${dayInfo.allCompleted
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                  }`}
                style={{ width: `${dayInfo.progressPercentage}%` }}
              ></div>
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <CalendarIcon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Mindful Calendar</h2>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80 shadow-sm">
        <button
          onClick={() => navigateMonth('prev')}
          className="group p-3 hover:bg-white/80 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg border border-slate-200/60"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
        </button>

        <div className="text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {monthNames[currentMonth]}
          </h3>
          <p className="text-slate-500 text-sm">{currentYear}</p>
        </div>

        <button
          onClick={() => navigateMonth('next')}
          className="group p-3 hover:bg-white/80 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg border border-slate-200/60"
        >
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={day} className="h-10 flex items-center justify-center">
            <span className={`text-sm font-semibold ${index === 0 || index === 6
                ? 'text-slate-500'
                : 'text-slate-600'
              }`}>
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-700">Legend</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm"></div>
            <span className="text-slate-600 font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-lg"></div>
            <span className="text-slate-600 font-medium">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"></div>
            <span className="text-slate-600 font-medium">In progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="relative w-4 h-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                <Sparkles className="absolute -top-0.5 -right-0.5 w-2 h-2 text-amber-500" />
              </div>
              <span className="text-slate-600 font-medium">Completed</span>
            </div>
          </div>
        </div>

        {/* Mindful note */}
        <div className="mt-4 pt-4 border-t border-slate-200/60">
          <p className="text-xs text-slate-500 leading-relaxed italic">
            Each day is a new opportunity to align with your intentions and find peace in purposeful action.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;