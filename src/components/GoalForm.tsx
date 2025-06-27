import React, { useState } from 'react';
import { X, Plus, Calendar, Target, Sparkles, Heart, BookOpen, Briefcase, Leaf } from 'lucide-react';
import { Goal } from '../types/Goal';

interface GoalFormProps {
  onSave: (goal: Omit<Goal, 'id' | 'loggedHours' | 'completed' | 'timeEntries' | 'createdAt'>) => void;
  onCancel: () => void;
  selectedDate: string;
}

const GoalForm: React.FC<GoalFormProps> = ({ onSave, onCancel, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Goal['category']>('personal');
  const [targetHours, setTargetHours] = useState(1);
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    {
      value: 'work',
      label: 'Work',
      icon: Briefcase,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 via-indigo-50 to-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      description: 'Professional goals and tasks'
    },
    {
      value: 'personal',
      label: 'Personal',
      icon: Heart,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 via-pink-50 to-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300',
      description: 'Self-care and personal growth'
    },
    {
      value: 'health',
      label: 'Health',
      icon: Leaf,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 via-teal-50 to-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-300',
      description: 'Physical and mental wellness'
    },
    {
      value: 'learning',
      label: 'Learning',
      icon: BookOpen,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 via-orange-50 to-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300',
      description: 'Knowledge and skill development'
    },
    {
      value: 'other',
      label: 'Other',
      icon: Sparkles,
      gradient: 'from-slate-500 to-gray-600',
      bgGradient: 'from-slate-50 via-gray-50 to-slate-50',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-300',
      description: 'Miscellaneous intentions'
    },
  ];

  const selectedCategoryConfig = categories.find(cat => cat.value === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    console.log('📝 GoalForm: Submitting goal form');

    try {
      // Ensure end date is not before start date
      const finalEndDate = new Date(endDate) < new Date(startDate) ? startDate : endDate;

      const goalData = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        targetHours,
        startDate: isMultiDay ? startDate : selectedDate,
        endDate: isMultiDay ? finalEndDate : selectedDate,
        isMultiDay,
      };

      console.log('📝 GoalForm: Prepared goal data:', goalData);

      await onSave(goalData);

      // Reset form only after successful save
      console.log('✅ GoalForm: Goal saved successfully, resetting form');
      setTitle('');
      setDescription('');
      setCategory('personal');
      setTargetHours(1);
      setStartDate(selectedDate);
      setEndDate(selectedDate);
      setIsMultiDay(false);

    } catch (error) {
      console.error('❌ GoalForm: Error in form submission:', error);
      // Don't reset form on error so user doesn't lose their input
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayCount = () => {
    if (!isMultiDay) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleCancel = () => {
    console.log('🚫 GoalForm: Cancelling goal creation');
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/50">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Set Intention
                </h2>
                <p className="text-slate-600 text-sm">Plant a seed for mindful growth</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="group p-3 hover:bg-white/80 rounded-2xl transition-all duration-300 hover:scale-110 disabled:opacity-50 border border-slate-200/60"
            >
              <X className="w-5 h-5 text-slate-500 group-hover:text-slate-700 transition-colors" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 pb-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                What intention would you like to set?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Practice mindful reading, Morning meditation, Creative writing..."
                  className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all duration-300 text-slate-800 placeholder:text-slate-400"
                  required
                  disabled={isSubmitting}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Add meaning to your intention (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share why this intention matters to you, or add any helpful context..."
                rows={3}
                className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all duration-300 text-slate-800 placeholder:text-slate-400 resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Category */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Choose your intention's nature
              </label>
              <div className="grid grid-cols-1 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value as Goal['category'])}
                      disabled={isSubmitting}
                      className={`
                        group relative p-4 rounded-2xl transition-all duration-300 text-left border-2 disabled:opacity-50 hover:scale-[1.02] hover:shadow-lg
                        ${isSelected
                          ? `bg-gradient-to-r ${cat.bgGradient} ${cat.borderColor} shadow-lg scale-[1.02]`
                          : 'bg-white/60 border-slate-200/60 hover:bg-white/80 hover:border-slate-300/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300
                          ${isSelected ? `bg-gradient-to-br ${cat.gradient}` : 'bg-slate-100'}
                        `}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold ${isSelected ? cat.textColor : 'text-slate-700'}`}>
                            {cat.label}
                          </div>
                          <div className="text-sm text-slate-500 leading-relaxed">
                            {cat.description}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white rotate-45" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Hours */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Time to dedicate {isMultiDay ? '(per day)' : 'today'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  min="0.5"
                  step="0.5"
                  className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all duration-300 text-slate-800"
                  disabled={isSubmitting}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-slate-500 font-medium">
                  {targetHours === 1 ? 'hour' : 'hours'}
                </div>
              </div>
            </div>

            {/* Multi-day Toggle */}
            <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="multiDay"
                    checked={isMultiDay}
                    onChange={(e) => setIsMultiDay(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 bg-white/80 border-slate-300 rounded-lg focus:ring-emerald-500 focus:ring-2"
                    disabled={isSubmitting}
                  />
                  {isMultiDay && (
                    <div className="absolute inset-0 w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white rotate-45" />
                    </div>
                  )}
                </div>
                <label htmlFor="multiDay" className="flex items-center gap-3 text-slate-700 font-semibold cursor-pointer">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <span>Create a journey (multi-day intention)</span>
                </label>
              </div>

              {isMultiDay && (
                <div className="space-y-4 pt-4 border-t border-slate-200/60">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Journey begins
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all duration-300 text-sm text-slate-800"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Journey ends
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all duration-300 text-sm text-slate-800"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-700">Journey Overview</span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div><strong>Duration:</strong> {getDayCount()} day{getDayCount() !== 1 ? 's' : ''} of mindful practice</div>
                      <div><strong>Total commitment:</strong> {(targetHours * getDayCount()).toFixed(1)} hours of intentional time</div>
                    </div>
                  </div>
                </div>
              )}

              {!isMultiDay && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>This intention will bloom on <strong>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 text-slate-700 bg-slate-100/80 backdrop-blur-sm rounded-2xl hover:bg-slate-200/80 transition-all duration-300 font-semibold border border-slate-200/60 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className={`
                  flex-1 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                  ${selectedCategoryConfig
                    ? `bg-gradient-to-r ${selectedCategoryConfig.gradient} hover:scale-105 text-white`
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 text-white'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Planting intention...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Plant Intention</span>
                    <Sparkles className="w-4 h-4 opacity-80" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalForm;