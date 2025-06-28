import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Target, Clock, Star, Heart, CheckCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Achievement, UserStats } from '../types/Goal';

interface AchievementSystemProps {
    userStats: UserStats;
    onUpdateStats: (stats: UserStats) => void;
    onCheckIn: () => void;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ userStats, onUpdateStats, onCheckIn }) => {
    const { currentTheme } = useTheme();
    const [showCelebration, setShowCelebration] = useState(false);
    const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
    const [showCheckInMessage, setShowCheckInMessage] = useState(false);

    const defaultAchievements: Achievement[] = [
        {
            id: 'first-checkin',
            title: 'First Steps',
            description: 'Complete your first daily check-in',
            icon: '🌱',
            type: 'streak',
            requirement: 1,
            isUnlocked: false,
        },
        {
            id: 'streak-3',
            title: 'Building Momentum',
            description: 'Maintain a 3-day check-in streak',
            icon: '🔥',
            type: 'streak',
            requirement: 3,
            isUnlocked: false,
        },
        {
            id: 'streak-7',
            title: 'Week Warrior',
            description: 'Achieve a 7-day check-in streak',
            icon: '⚡',
            type: 'streak',
            requirement: 7,
            isUnlocked: false,
        },
        {
            id: 'streak-30',
            title: 'Mindful Master',
            description: 'Maintain a 30-day check-in streak',
            icon: '🏆',
            type: 'streak',
            requirement: 30,
            isUnlocked: false,
        },
        {
            id: 'goals-10',
            title: 'Goal Getter',
            description: 'Complete 10 total goals',
            icon: '🎯',
            type: 'goals',
            requirement: 10,
            isUnlocked: false,
        },
        {
            id: 'goals-50',
            title: 'Achievement Hunter',
            description: 'Complete 50 total goals',
            icon: '🌟',
            type: 'goals',
            requirement: 50,
            isUnlocked: false,
        },
        {
            id: 'time-100',
            title: 'Time Keeper',
            description: 'Log 100 hours of focused time',
            icon: '⏰',
            type: 'time',
            requirement: 6000, // 100 hours in minutes
            isUnlocked: false,
        },
    ];

    useEffect(() => {
        checkForNewAchievements();
    }, [userStats]);

    const checkForNewAchievements = () => {
        const currentAchievements = userStats.achievements.length > 0 ? userStats.achievements : defaultAchievements;
        const newlyUnlocked: Achievement[] = [];

        const updatedAchievements = currentAchievements.map(achievement => {
            if (!achievement.isUnlocked) {
                let shouldUnlock = false;

                switch (achievement.type) {
                    case 'streak':
                        shouldUnlock = userStats.currentStreak >= achievement.requirement;
                        break;
                    case 'goals':
                        shouldUnlock = userStats.totalGoalsCompleted >= achievement.requirement;
                        break;
                    case 'time':
                        shouldUnlock = userStats.totalTimeLogged >= achievement.requirement;
                        break;
                }

                if (shouldUnlock) {
                    const unlockedAchievement = {
                        ...achievement,
                        isUnlocked: true,
                        unlockedAt: new Date().toISOString(),
                    };
                    newlyUnlocked.push(unlockedAchievement);
                    return unlockedAchievement;
                }
            }
            return achievement;
        });

        if (newlyUnlocked.length > 0) {
            setNewAchievements(newlyUnlocked);
            setShowCelebration(true);
            onUpdateStats({ ...userStats, achievements: updatedAchievements });

            setTimeout(() => setShowCelebration(false), 5000);
        }
    };

    const handleCheckIn = () => {
        const today = new Date().toISOString().split('T')[0];
        const lastCheckIn = userStats.lastCheckIn?.split('T')[0];

        if (lastCheckIn === today) {
            return; // Already checked in today
        }

        let newStreak = 1;
        if (lastCheckIn) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastCheckIn === yesterdayStr) {
                newStreak = userStats.currentStreak + 1;
            }
        }

        const updatedStats: UserStats = {
            ...userStats,
            currentStreak: newStreak,
            longestStreak: Math.max(userStats.longestStreak, newStreak),
            totalCheckIns: userStats.totalCheckIns + 1,
            lastCheckIn: new Date().toISOString(),
        };

        onUpdateStats(updatedStats);
        onCheckIn();
        setShowCheckInMessage(true);
        setTimeout(() => setShowCheckInMessage(false), 4000);
    };

    const canCheckInToday = () => {
        const today = new Date().toISOString().split('T')[0];
        const lastCheckIn = userStats.lastCheckIn?.split('T')[0];
        return lastCheckIn !== today;
    };

    return (
        <div className="space-y-6">
            {/* Daily Check-In Section */}
            <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-2xl shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.primary} rounded-xl flex items-center justify-center`}>
                            <Flame className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${currentTheme.text}`}>Daily Check-In</h3>
                            <p className={`text-sm ${currentTheme.textSecondary}`}>
                                Current streak: {userStats.currentStreak} days
                            </p>
                        </div>
                    </div>

                    {canCheckInToday() ? (
                        <button
                            onClick={handleCheckIn}
                            className={`px-6 py-3 bg-gradient-to-r ${currentTheme.primary} text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Check In
                        </button>
                    ) : (
                        <div className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-semibold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Checked In ✓
                        </div>
                    )}
                </div>

                {userStats.currentStreak > 0 && (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className={`${currentTheme.surface} rounded-xl p-3 border ${currentTheme.border}`}>
                            <div className={`text-2xl font-bold ${currentTheme.text}`}>{userStats.currentStreak}</div>
                            <div className={`text-xs ${currentTheme.textSecondary}`}>Current Streak</div>
                        </div>
                        <div className={`${currentTheme.surface} rounded-xl p-3 border ${currentTheme.border}`}>
                            <div className={`text-2xl font-bold ${currentTheme.text}`}>{userStats.longestStreak}</div>
                            <div className={`text-xs ${currentTheme.textSecondary}`}>Best Streak</div>
                        </div>
                        <div className={`${currentTheme.surface} rounded-xl p-3 border ${currentTheme.border}`}>
                            <div className={`text-2xl font-bold ${currentTheme.text}`}>{userStats.totalCheckIns}</div>
                            <div className={`text-xs ${currentTheme.textSecondary}`}>Total Check-ins</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Achievements Section */}
            <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-2xl shadow-lg p-6`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.secondary} rounded-xl flex items-center justify-center`}>
                        <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold ${currentTheme.text}`}>Achievements</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(userStats.achievements.length > 0 ? userStats.achievements : defaultAchievements).map((achievement) => (
                        <div
                            key={achievement.id}
                            className={`p-4 rounded-xl border transition-all duration-300 ${achievement.isUnlocked
                                    ? `bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-md`
                                    : `bg-slate-50 border-slate-200 opacity-60`
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`text-2xl ${achievement.isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                                    {achievement.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-semibold ${achievement.isUnlocked ? 'text-amber-800' : 'text-slate-600'}`}>
                                        {achievement.title}
                                    </h4>
                                    <p className={`text-xs ${achievement.isUnlocked ? 'text-amber-600' : 'text-slate-500'}`}>
                                        {achievement.description}
                                    </p>
                                </div>
                                {achievement.isUnlocked && (
                                    <Star className="w-4 h-4 text-yellow-500" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Check-In Success Message */}
            <AnimatePresence>
                {showCheckInMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-2xl max-w-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Heart className="w-6 h-6" />
                                <h4 className="font-bold text-lg">Daily Check-In Complete!</h4>
                            </div>
                            <p className="text-emerald-100">
                                You are making yourself proud and that's amazing, Keep Going! 🌟
                            </p>
                            {userStats.currentStreak > 1 && (
                                <p className="text-emerald-200 text-sm mt-2">
                                    🔥 {userStats.currentStreak} day streak!
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Achievement Celebration */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.5, y: 50 }}
                            className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: 3 }}
                                className="text-6xl mb-4"
                            >
                                🏆
                            </motion.div>
                            <h2 className="text-2xl font-bold mb-2">Achievement Unlocked!</h2>
                            {newAchievements.map((achievement) => (
                                <div key={achievement.id} className="mb-4">
                                    <div className="text-3xl mb-2">{achievement.icon}</div>
                                    <h3 className="text-xl font-semibold">{achievement.title}</h3>
                                    <p className="text-yellow-100">{achievement.description}</p>
                                </div>
                            ))}
                            <div className="flex justify-center mt-6">
                                <Sparkles className="w-8 h-8 animate-pulse" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AchievementSystem; 