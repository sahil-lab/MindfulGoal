import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Save, X, Plus, Check, Circle, CheckCircle2, Trash2, GripVertical } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { TodoItem } from '../types/Goal';
import { generateId } from '../utils/storage';

interface DailyTasksNotepadProps {
    todos: TodoItem[];
    onUpdateTodos: (todos: TodoItem[]) => void;
}

const DailyTasksNotepad: React.FC<DailyTasksNotepadProps> = ({ todos, onUpdateTodos }) => {
    const { currentTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [newTask, setNewTask] = useState('');
    const notepadRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const completedCount = todos.filter(todo => todo.completed).length;

    const addTask = () => {
        if (!newTask.trim()) return;

        const task: TodoItem = {
            id: generateId(),
            text: newTask.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            priority: 'medium',
        };

        onUpdateTodos([...todos, task]);
        setNewTask('');
    };

    const toggleTask = (id: string) => {
        const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        onUpdateTodos(updatedTodos);
    };

    const deleteTask = (id: string) => {
        const updatedTodos = todos.filter(todo => todo.id !== id);
        onUpdateTodos(updatedTodos);
    };

    useEffect(() => {
        // Removed click outside functionality - notepad only closes via close button
        return () => { };
    }, []);

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                ref={buttonRef}
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg ${isOpen
                    ? `bg-gradient-to-r ${currentTheme.accent} text-white`
                    : `bg-white/80 ${currentTheme.text} border border-slate-200/60 hover:bg-white`
                    }`}
            >
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium text-sm">
                    Daily Tasks {todos.length > 0 && `(${completedCount}/${todos.length})`}
                </span>
            </button>

            {/* Notepad Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={notepadRef}
                        drag
                        dragMomentum={false}
                        dragElastic={0.1}
                        dragConstraints={{
                            top: -200,
                            left: -400,
                            right: 400,
                            bottom: 200,
                        }}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 z-50 cursor-move"
                    >
                        {/* Notepad Header with Drag Handle */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200/60">
                            <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab active:cursor-grabbing" />
                                <FileText className="w-5 h-5 text-slate-600" />
                                <h4 className="font-bold text-slate-800">Daily Tasks</h4>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200 hover:scale-110"
                            >
                                <X className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>

                        {/* Add New Task */}
                        <div className="p-4 border-b border-slate-200/60">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                    placeholder="Add a daily task..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 transition-all duration-200 font-sans"
                                />
                                <button
                                    onClick={addTask}
                                    disabled={!newTask.trim()}
                                    className={`px-3 py-2 bg-gradient-to-r ${currentTheme.primary} text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Tasks List */}
                        <div className="max-h-64 overflow-y-auto">
                            {todos.length === 0 ? (
                                <div className="p-6 text-center">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <FileText className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-slate-600 text-sm">No tasks yet</p>
                                    <p className="text-slate-400 text-xs mt-1">Add your first daily task above</p>
                                </div>
                            ) : (
                                <div className="p-4 space-y-2">
                                    {todos
                                        .filter(todo => !todo.completed)
                                        .map((todo) => (
                                            <motion.div
                                                key={todo.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="group flex items-center gap-3 p-2 bg-slate-50/60 rounded-lg hover:bg-slate-50 transition-all duration-200"
                                            >
                                                <button
                                                    onClick={() => toggleTask(todo.id)}
                                                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-400 transition-colors duration-200 flex items-center justify-center"
                                                >
                                                    <Circle className="w-3 h-3 text-slate-400 group-hover:text-emerald-400" />
                                                </button>
                                                <span className="flex-1 text-sm text-slate-700 font-medium">{todo.text}</span>
                                                <button
                                                    onClick={() => deleteTask(todo.id)}
                                                    className="flex-shrink-0 w-6 h-6 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        ))}

                                    {/* Completed Tasks */}
                                    {todos.filter(todo => todo.completed).length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-slate-200/60">
                                            <h5 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                                                <Check className="w-3 h-3" />
                                                Completed ({todos.filter(todo => todo.completed).length})
                                            </h5>
                                            {todos
                                                .filter(todo => todo.completed)
                                                .map((todo) => (
                                                    <motion.div
                                                        key={todo.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        className="group flex items-center gap-3 p-2 bg-emerald-50/40 rounded-lg hover:bg-emerald-50/60 transition-all duration-200 mb-1"
                                                    >
                                                        <button
                                                            onClick={() => toggleTask(todo.id)}
                                                            className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white transition-all duration-200 flex items-center justify-center"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                        </button>
                                                        <span className="flex-1 text-sm text-emerald-700 font-medium line-through opacity-75">
                                                            {todo.text}
                                                        </span>
                                                        <button
                                                            onClick={() => deleteTask(todo.id)}
                                                            className="flex-shrink-0 w-6 h-6 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Progress Footer */}
                        {todos.length > 0 && (
                            <div className="p-4 border-t border-slate-200/60">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-600 font-medium">
                                        {completedCount} of {todos.length} completed
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5">
                                    <motion.div
                                        className={`h-1.5 rounded-full bg-gradient-to-r ${currentTheme.primary}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${todos.length > 0 ? (completedCount / todos.length) * 100 : 0}%` }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyTasksNotepad;

