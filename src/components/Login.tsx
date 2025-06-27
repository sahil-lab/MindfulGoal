import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff, Target, TrendingUp, Sparkles, Heart, Flower2, Star } from 'lucide-react';
import AppLogo from './AppLogo';


const Login: React.FC = () => {
    const { currentTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err: any) {
            let errorMessage = 'Failed to login. Please try again.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password.';
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed login attempts. Please try again later.';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user document exists, if not create it
            const userDocRef = doc(db, 'goalTrackerUsers', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    displayName: user.displayName || 'Mindful Soul',
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: serverTimestamp(),
                    totalGoals: 0,
                    completedGoals: 0,
                });
            }

            navigate('/');
        } catch (err: any) {
            console.error('Failed to login with Google:', err);
            setError('Failed to login with Google: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br ${currentTheme.background}`}>
            {/* Enhanced Background with Zen Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Primary gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient}`}></div>

                {/* Floating zen elements */}
                <div className={`absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-radial ${currentTheme.gradient} rounded-full filter blur-3xl animate-gentle-float opacity-60`}></div>
                <div className={`absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-radial ${currentTheme.gradient} rounded-full filter blur-3xl animate-float-reverse opacity-50`}></div>
                <div className={`absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-radial ${currentTheme.gradient} rounded-full filter blur-3xl animate-breathe opacity-40`}></div>

                {/* Zen decorative elements */}
                <div className="absolute top-20 right-20 w-32 h-32 opacity-10">
                    <Flower2 className={`w-full h-full ${currentTheme.textSecondary} animate-lotus-bloom`} />
                </div>
                <div className="absolute bottom-20 left-20 w-24 h-24 opacity-15">
                    <Star className={`w-full h-full ${currentTheme.textSecondary} animate-zen-pulse`} />
                </div>
                <div className="absolute top-1/2 right-10 w-16 h-16 opacity-20">
                    <Heart className={`w-full h-full ${currentTheme.textSecondary} animate-peaceful-glow`} />
                </div>

                {/* Ambient particles */}
                <div className={`absolute top-1/3 left-1/3 w-2 h-2 bg-current rounded-full animate-zen-pulse ${currentTheme.textSecondary}`}></div>
                <div className={`absolute bottom-1/3 right-1/3 w-3 h-3 bg-current rounded-full animate-breathe ${currentTheme.textSecondary}`}></div>
                <div className={`absolute top-2/3 left-2/3 w-1.5 h-1.5 bg-current rounded-full animate-gentle-float ${currentTheme.textSecondary}`}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                    staggerChildren: 0.1
                }}
                className="w-full max-w-lg relative z-10"
            >
                <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-3xl p-10 shadow-zen-xl`}>
                    {/* Zen Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                duration: 1,
                                ease: [0.68, -0.55, 0.265, 1.55],
                                delay: 0.2
                            }}
                            className="flex items-center justify-center mb-6"
                        >
                            <div className="animate-peaceful-glow flex-shrink-0">
                                <AppLogo size={80} className="drop-shadow-xl" />
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`text-4xl font-bold bg-gradient-to-r ${currentTheme.gradientText} bg-clip-text text-transparent mb-3 font-handwriting`}
                        >
                            Welcome Home
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className={`${currentTheme.textSecondary} text-lg leading-relaxed`}
                        >
                            Return to your sanctuary of mindful intentions and peaceful progress
                        </motion.p>
                    </div>

                    {/* Error Message with Enhanced Design */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -30, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className="bg-red-50/80 backdrop-blur-sm border-2 border-red-200/60 rounded-2xl p-4 mb-8 shadow-zen"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                                    <span className="text-red-500 text-sm">⚠️</span>
                                </div>
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-8">
                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-3"
                        >
                            <label className={`block ${currentTheme.text} font-semibold text-sm tracking-wide`}>
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400/80 focus:ring-4 focus:ring-emerald-200/50 transition-zen group-hover:border-slate-300/80"
                                    placeholder="Enter your mindful email"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-40 group-focus-within:opacity-70 transition-zen">
                                    <Sparkles className="w-5 h-5 text-emerald-500" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="space-y-3"
                        >
                            <label className={`block ${currentTheme.text} font-semibold text-sm tracking-wide`}>
                                Sacred Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 rounded-2xl px-5 py-4 pr-16 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400/80 focus:ring-4 focus:ring-emerald-200/50 transition-zen group-hover:border-slate-300/80"
                                    placeholder="Enter your peaceful password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-xl hover:bg-slate-100/80 transition-zen group"
                                >
                                    {showPassword ?
                                        <EyeOff className="w-5 h-5 text-slate-500 group-hover:text-slate-700" /> :
                                        <Eye className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
                                    }
                                </button>
                            </div>
                        </motion.div>

                        {/* Login Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-gradient-to-r ${currentTheme.primary} hover:opacity-90 disabled:opacity-50 text-white font-bold py-5 px-8 rounded-2xl transition-zen-slow disabled:cursor-not-allowed shadow-zen-lg hover:shadow-zen-xl btn-zen group`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Finding your zen...</span>
                                    </>
                                ) : (
                                    <>
                                        <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                        <span>Enter Sacred Space</span>
                                        <Sparkles className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform duration-300" />
                                    </>
                                )}
                            </div>
                        </motion.button>
                    </form>

                    {/* Zen Divider */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="relative my-10"
                    >
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gradient-to-r from-transparent via-slate-300/60 to-transparent"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <div className="px-6 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-zen">
                                <span className="text-slate-500 font-medium tracking-wider text-sm">OR</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Google Login */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                    >
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-slate-700 font-bold py-5 px-8 rounded-2xl transition-zen-slow disabled:cursor-not-allowed flex items-center justify-center gap-4 border-2 border-slate-200/60 hover:border-slate-300/80 shadow-zen hover:shadow-zen-lg btn-zen group"
                        >
                            <div className="w-8 h-8 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-full h-full" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
                        </button>
                    </motion.div>

                    {/* Registration Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        className="text-center mt-10"
                    >
                        <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-2xl p-6 shadow-zen`}>
                            <p className={`${currentTheme.textSecondary} mb-3 font-medium`}>
                                New to this peaceful journey?
                            </p>
                            <Link
                                to="/register"
                                className={`inline-flex items-center gap-2 bg-gradient-to-r ${currentTheme.gradientText} bg-clip-text text-transparent font-bold transition-zen group hover:scale-105`}
                            >
                                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                <span>Begin Your Journey</span>
                                <Heart className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login; 