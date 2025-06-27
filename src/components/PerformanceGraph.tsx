import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Calendar, Target, Sparkles, Heart } from 'lucide-react';
import { DayData } from '../types/Goal';
import { formatTime } from '../utils/storage';

interface PerformanceGraphProps {
  allData: Record<string, DayData>;
}

type GraphType = 'line' | 'area' | 'bar' | 'pie';
type TimeRange = '7d' | '30d' | '90d' | 'all';

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ allData }) => {
  const [graphType, setGraphType] = useState<GraphType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const getFilteredData = () => {
    const sortedDates = Object.keys(allData).sort();
    const today = new Date();

    let filteredDates = sortedDates;

    if (timeRange !== 'all') {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() - days);

      filteredDates = sortedDates.filter(date => new Date(date) >= cutoffDate);
    }

    return filteredDates.map(date => {
      const dayData = allData[date];
      const completionRate = dayData.goals.length > 0
        ? Math.round((dayData.completedGoals / dayData.goals.length) * 100)
        : 0;

      const totalTargetHours = dayData.goals.reduce((sum, goal) => {
        const dayEntries = goal.timeEntries.filter(entry => entry.date === date);
        const targetForDay = goal.isMultiDay ? goal.targetHours : goal.targetHours;
        return sum + targetForDay;
      }, 0);

      const progressRate = totalTargetHours > 0
        ? Math.round((dayData.totalLoggedHours / totalTargetHours) * 100)
        : 0;

      return {
        date,
        displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        goals: dayData.goals.length,
        completedGoals: dayData.completedGoals,
        completionRate,
        loggedHours: Math.round(dayData.totalLoggedHours * 10) / 10,
        targetHours: Math.round(totalTargetHours * 10) / 10,
        progressRate: Math.min(progressRate, 100),
      };
    });
  };

  const getCategoryData = () => {
    const categoryStats: Record<string, { goals: number; hours: number; completed: number }> = {};

    Object.values(allData).forEach(dayData => {
      dayData.goals.forEach(goal => {
        if (!categoryStats[goal.category]) {
          categoryStats[goal.category] = { goals: 0, hours: 0, completed: 0 };
        }

        const dayEntries = goal.timeEntries.filter(entry => entry.date === dayData.date);
        const dayHours = dayEntries.reduce((sum, entry) => sum + entry.duration / 60, 0);

        categoryStats[goal.category].goals += 1;
        categoryStats[goal.category].hours += dayHours;
        if (goal.completed) {
          categoryStats[goal.category].completed += 1;
        }
      });
    });

    const categoryColors = {
      work: '#3B82F6',
      personal: '#8B5CF6',
      health: '#10B981',
      learning: '#F59E0B',
      other: '#6B7280',
    };

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      goals: stats.goals,
      hours: Math.round(stats.hours * 10) / 10,
      completed: stats.completed,
      completionRate: stats.goals > 0 ? Math.round((stats.completed / stats.goals) * 100) : 0,
      color: categoryColors[category as keyof typeof categoryColors] || '#6B7280',
    }));
  };

  const data = getFilteredData();
  const categoryData = getCategoryData();

  const graphTypes = [
    { type: 'line' as GraphType, icon: TrendingUp, label: 'Journey Flow', description: 'See your progress journey' },
    { type: 'area' as GraphType, icon: Activity, label: 'Energy Flow', description: 'Visualize time investment' },
    { type: 'bar' as GraphType, icon: BarChart3, label: 'Achievement Bars', description: 'Compare daily goals' },
    { type: 'pie' as GraphType, icon: PieChartIcon, label: 'Life Balance', description: 'Category distribution' },
  ];

  const timeRanges = [
    { value: '7d' as TimeRange, label: '7 Days', description: 'Recent week' },
    { value: '30d' as TimeRange, label: '30 Days', description: 'This month' },
    { value: '90d' as TimeRange, label: '90 Days', description: 'This season' },
    { value: 'all' as TimeRange, label: 'All Time', description: 'Full journey' },
  ];

  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/60">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-300/50 to-slate-400/50 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-breathe">
              <Target className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Your Canvas Awaits</h3>
            <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">
              Begin your mindful journey by setting intentions. Your beautiful progress story will unfold here.
            </p>
          </div>
        </div>
      );
    }

    const chartTooltipStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
    };

    switch (graphType) {
      case 'line':
        return (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-zen">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis
                  dataKey="displayDate"
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={500}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={500}
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value: any, name: string) => {
                    if (name === 'loggedHours' || name === 'targetHours') {
                      return [`${value}h`, name === 'loggedHours' ? 'Mindful Hours' : 'Target Hours'];
                    }
                    if (name === 'completionRate' || name === 'progressRate') {
                      return [`${value}%`, name === 'completionRate' ? 'Completion Flow' : 'Progress Flow'];
                    }
                    return [value, name === 'goals' ? 'Total Intentions' : 'Completed Intentions'];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="url(#completionGradient)"
                  strokeWidth={4}
                  dot={{ fill: '#10B981', strokeWidth: 3, r: 6, stroke: '#ffffff' }}
                  name="completionRate"
                />
                <Line
                  type="monotone"
                  dataKey="progressRate"
                  stroke="url(#progressGradient)"
                  strokeWidth={4}
                  dot={{ fill: '#3B82F6', strokeWidth: 3, r: 6, stroke: '#ffffff' }}
                  name="progressRate"
                />
                <defs>
                  <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'area':
        return (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-zen">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis
                  dataKey="displayDate"
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={500}
                />
                <YAxis stroke="#64748b" fontSize={12} fontWeight={500} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value: any, name: string) => {
                    if (name === 'loggedHours' || name === 'targetHours') {
                      return [`${value}h`, name === 'loggedHours' ? 'Mindful Hours' : 'Target Hours'];
                    }
                    return [value, name === 'goals' ? 'Total Intentions' : 'Completed Intentions'];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="loggedHours"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="url(#loggedGradient)"
                  name="loggedHours"
                />
                <Area
                  type="monotone"
                  dataKey="targetHours"
                  stackId="2"
                  stroke="#F59E0B"
                  fill="url(#targetGradient)"
                  name="targetHours"
                />
                <defs>
                  <linearGradient id="loggedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'bar':
        return (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-zen">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis
                  dataKey="displayDate"
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={500}
                />
                <YAxis stroke="#64748b" fontSize={12} fontWeight={500} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value: any, name: string) => [
                    value,
                    name === 'goals' ? 'Total Intentions' : 'Completed Intentions'
                  ]}
                />
                <Bar dataKey="goals" fill="#E2E8F0" name="goals" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completedGoals" fill="url(#completedGradient)" name="completedGoals" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'pie':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-zen">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-slate-700">Intentions by Nature</h4>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="goals"
                    label={({ category, goals }) => `${category}: ${goals}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-zen">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-slate-700">Mindful Hours by Nature</h4>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="hours"
                    label={({ category, hours }) => `${category}: ${hours}h`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: any) => [`${value}h`, 'Mindful Hours']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getInsights = () => {
    if (data.length === 0) return null;

    const avgCompletion = Math.round(data.reduce((sum, d) => sum + d.completionRate, 0) / data.length);
    const avgProgress = Math.round(data.reduce((sum, d) => sum + d.progressRate, 0) / data.length);
    const totalHours = data.reduce((sum, d) => sum + d.loggedHours, 0);
    const totalGoals = data.reduce((sum, d) => sum + d.goals, 0);
    const totalCompleted = data.reduce((sum, d) => sum + d.completedGoals, 0);

    const insights = [
      {
        value: `${avgCompletion}%`,
        label: 'Completion Harmony',
        gradient: 'from-blue-500 to-indigo-600',
        bgGradient: 'from-blue-50/80 to-indigo-50/60',
        description: 'Average daily achievement'
      },
      {
        value: `${avgProgress}%`,
        label: 'Progress Flow',
        gradient: 'from-emerald-500 to-teal-600',
        bgGradient: 'from-emerald-50/80 to-teal-50/60',
        description: 'Time investment efficiency'
      },
      {
        value: `${totalHours.toFixed(1)}h`,
        label: 'Mindful Hours',
        gradient: 'from-purple-500 to-pink-600',
        bgGradient: 'from-purple-50/80 to-pink-50/60',
        description: 'Total focused time'
      },
      {
        value: totalGoals.toString(),
        label: 'Life Intentions',
        gradient: 'from-amber-500 to-orange-600',
        bgGradient: 'from-amber-50/80 to-orange-50/60',
        description: 'Goals set with purpose'
      },
      {
        value: totalCompleted.toString(),
        label: 'Achievements',
        gradient: 'from-rose-500 to-pink-600',
        bgGradient: 'from-rose-50/80 to-pink-50/60',
        description: 'Completed intentions'
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden bg-gradient-to-br ${insight.bgGradient} rounded-2xl p-6 border border-white/60 shadow-zen hover:shadow-zen-lg transition-all duration-300 hover:scale-105`}
          >
            <div className="relative z-10">
              <div className={`text-2xl font-bold bg-gradient-to-r ${insight.gradient} bg-clip-text text-transparent mb-1`}>
                {insight.value}
              </div>
              <div className="text-sm font-semibold text-slate-700 mb-1">
                {insight.label}
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                {insight.description}
              </div>
            </div>
            <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-slate-600" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-slate-800">Journey Insights</h3>
          <div className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border border-emerald-200">
            <span className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Mindful Analytics
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Time Range Selector */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/60 shadow-zen">
            <div className="grid grid-cols-4 gap-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${timeRange === range.value
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-800'
                    }`}
                  title={range.description}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Graph Type Selector */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/60 shadow-zen">
            <div className="grid grid-cols-4 gap-1">
              {graphTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setGraphType(type.type)}
                  className={`p-3 rounded-xl transition-all duration-300 group ${graphType === type.type
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-800'
                    }`}
                  title={type.description}
                >
                  <type.icon className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform duration-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Cards */}
      {getInsights()}

      {/* Chart Legend */}
      {data.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-zen">
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            {graphType === 'line' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
                  <span className="font-medium">Completion Flow</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  <span className="font-medium">Progress Flow</span>
                </div>
              </>
            )}
            {graphType === 'area' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg"></div>
                  <span className="font-medium">Mindful Hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg opacity-60"></div>
                  <span className="font-medium">Target Hours</span>
                </div>
              </>
            )}
            {graphType === 'bar' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-slate-300 rounded-lg"></div>
                  <span className="font-medium">Total Intentions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg"></div>
                  <span className="font-medium">Completed Intentions</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Chart */}
      {renderChart()}

      {/* Category Summary for Pie Chart */}
      {graphType === 'pie' && categoryData.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-zen">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-slate-700">Life Balance Summary</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryData.map((category) => (
              <div key={category.category} className="group bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80 shadow-zen hover:shadow-zen-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-xl shadow-sm"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-semibold text-slate-700 group-hover:text-slate-800 transition-colors">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <div className="font-medium">{category.goals} intentions</div>
                    <div className="text-xs">{category.hours}h invested</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceGraph;