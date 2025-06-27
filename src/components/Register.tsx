import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Target, TrendingUp, User } from 'lucide-react';


const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate inputs
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password should be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with display name
            await updateProfile(user, {
                displayName: name
            });

            // Try to store additional user data in Firestore (optional)
            try {
                await setDoc(doc(db, 'goalTrackerUsers', user.uid), {
                    uid: user.uid,
                    displayName: name,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: serverTimestamp(),
                    totalGoals: 0,
                    completedGoals: 0,
                    totalHoursLogged: 0,
                    joinedDate: new Date().toISOString(),
                });
                console.log('User data saved to Firestore successfully');
            } catch (firestoreError: any) {
                console.warn('Could not save user data to Firestore:', firestoreError);
                // Continue with registration even if Firestore save fails
            }

            navigate('/');
        } catch (err: any) {
            console.error('Registration error:', err);
            let errorMessage = 'Failed to register. Please try again.';

            switch (err.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                default:
                    errorMessage = `Registration failed: ${err.message || err.code || 'Unknown error'}`;
                    break;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Try to store user data in Firestore (optional)
            try {
                await setDoc(doc(db, 'goalTrackerUsers', user.uid), {
                    uid: user.uid,
                    displayName: user.displayName || 'Goal Achiever',
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: serverTimestamp(),
                    totalGoals: 0,
                    completedGoals: 0,
                    totalHoursLogged: 0,
                    joinedDate: new Date().toISOString(),
                });
                console.log('User data saved to Firestore successfully');
            } catch (firestoreError: any) {
                console.warn('Could not save user data to Firestore:', firestoreError);
                // Continue with registration even if Firestore save fails
            }

            navigate('/');
        } catch (err: any) {
            console.error('Failed to register with Google:', err);

            let errorMessage = 'Failed to register with Google. Please try again.';

            switch (err.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = 'Registration was cancelled.';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = 'Popup was blocked. Please allow popups and try again.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                default:
                    errorMessage = `Google registration failed: ${err.message || err.code || 'Unknown error'}`;
                    break;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/30 via-indigo-500/20 to-transparent rounded-full filter blur-3xl animate-float opacity-70"></div>
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-purple-500/30 via-pink-500/20 to-transparent rounded-full filter blur-3xl animate-float-reverse opacity-60"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-radial from-cyan-500/30 via-blue-500/20 to-transparent rounded-full filter blur-3xl animate-pulse-slow opacity-50"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center gap-2 mb-4"
                        >
                            <Target className="w-8 h-8 text-blue-400" />
                            <TrendingUp className="w-8 h-8 text-purple-400" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2">Start Your Journey</h1>
                        <p className="text-gray-200">Create your account to begin tracking goals</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6"
                        >
                            <p className="text-red-300 text-sm">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleEmailRegister} className="space-y-6">
                        <div>
                            <label className="block text-white font-medium mb-2">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                                    placeholder="Enter your full name"
                                    required
                                />
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white font-medium mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                                    placeholder="Create a password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white font-medium mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </motion.button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-transparent text-gray-200">OR</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={handleGoogleRegister}
                            disabled={loading}
                            className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-gray-300"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {loading ? 'Creating Account...' : 'Continue with Google'}
                        </motion.button>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-gray-200">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register; 