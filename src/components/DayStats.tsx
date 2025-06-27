import React from 'react';
import { Target, Clock, TrendingUp, Award, Sparkles } from 'lucide-react';
import { DayData } from '../types/Goal';
import { formatTime } from '../utils/storage';

interface DayStatsProps {
  dayData: DayData;
}

const DayStats: React.FC<DayStatsProps> = ({ dayData }) => {
  const completionRate = dayData.goals.length > 0
    ? Math.round((dayData.completedGoals / dayData.goals.length) * 100)
    : 0;

  const totalTargetHours = dayData.goals.reduce((sum, goal) => sum + goal.targetHours, 0);
  const progressRate = totalTargetHours > 0
    ? Math.round((dayData.totalLoggedHours / totalTargetHours) * 100)
    : 0;

  const stats = [
    {
      icon: Target,
      label: 'Intentions Set',
      value: `${dayData.completedGoals}/${dayData.goals.length}`,
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-indigo-600',
      bgGradient: 'from-blue-50/80 to-indigo-50/50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      description: 'Goals achieved',
      progress: dayData.goals.length > 0 ? (dayData.completedGoals / dayData.goals.length) * 100 : 0,
    },
    {
      icon: Clock,
      label: 'Mindful Time',
      value: formatTime(Math.round(dayData.totalLoggedHours * 60)),
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-600',
      bgGradient: 'from-emerald-50/80 to-teal-50/50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      description: 'Hours invested',
      progress: Math.min((dayData.totalLoggedHours / 8) * 100, 100), // Assume 8 hours as full day
    },
    {
      icon: TrendingUp,
      label: 'Progress Flow',
      value: `${progressRate}%`,
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-pink-600',
      bgGradient: 'from-purple-50/80 to-pink-50/50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      description: 'Of targets met',
      progress: progressRate,
    },
    {
      icon: Award,
      label: 'Achievement',
      value: `${completionRate}%`,
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-600',
      bgGradient: 'from-amber-50/80 to-orange-50/50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      description: 'Success rate',
      progress: completionRate,
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Today's Journey</h2>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl border border-yellow-200">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700">
            {dayData.goals.length > 0 ? 'In progress' : 'Ready to begin'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-40`}></div>

            {/* Progress bar background */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50">
              <div
                className={`h-full bg-gradient-to-r ${stat.gradientFrom} ${stat.gradientTo} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(stat.progress, 100)}%` }}
              ></div>
            </div>

            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl shadow-lg ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium bg-gradient-to-r ${stat.gradientFrom} ${stat.gradientTo} bg-clip-text text-transparent uppercase tracking-wider`}>
                    {stat.label}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-3xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600">
                  {stat.description}
                </div>
              </div>

              {/* Floating badge for high performers */}
              {stat.progress >= 80 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Daily inspiration */}
      {dayData.goals.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Daily Reflection</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {completionRate === 100
              ? "Perfect! You've achieved all your intentions for today. Take a moment to appreciate your dedication."
              : completionRate >= 75
                ? "Excellent progress! You're well on your way to completing your daily intentions."
                : completionRate >= 50
                  ? "Good momentum! Continue with mindful focus to reach your goals."
                  : "Every journey begins with a single step. Stay present and keep moving forward."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DayStats;