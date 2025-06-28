import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, AlertCircle, Circle, CheckCircle2, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { TodoItem } from '../types/Goal';
import { generateId } from '../utils/storage';

interface TodoListProps {
    todos: TodoItem[];
    onUpdateTodos: (todos: TodoItem[]) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onUpdateTodos }) => {
    const { currentTheme } = useTheme();
    const [newTodo, setNewTodo] = useState('');
    const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');

    const priorityConfig = {
        low: {
            color: 'text-green-600',
            bg: 'bg-green-100',
            border: 'border-green-200',
            icon: '🟢',
            label: 'Low'
        },
        medium: {
            color: 'text-yellow-600',
            bg: 'bg-yellow-100',
            border: 'border-yellow-200',
            icon: '🟡',
            label: 'Medium'
        },
        high: {
            color: 'text-red-600',
            bg: 'bg-red-100',
            border: 'border-red-200',
            icon: '🔴',
            label: 'High'
        }
    };

    const addTodo = () => {
        if (!newTodo.trim()) return;

        const todo: TodoItem = {
            id: generateId(),
            text: newTodo.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            priority: newTodoPriority,
        };

        onUpdateTodos([...todos, todo]);
        setNewTodo('');
        setNewTodoPriority('medium');
    };

    const toggleTodo = (id: string) => {
        const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        onUpdateTodos(updatedTodos);
    };

    const deleteTodo = (id: string) => {
        const updatedTodos = todos.filter(todo => todo.id !== id);
        onUpdateTodos(updatedTodos);
    };

    const completedCount = todos.filter(todo => todo.completed).length;
    const pendingTodos = todos.filter(todo => !todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);

    return (
        <div className={`${currentTheme.surface} ${currentTheme.border} border rounded-2xl shadow-lg p-6`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.accent} rounded-xl flex items-center justify-center`}>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${currentTheme.text}`}>Daily Tasks</h3>
                        <p className={`text-sm ${currentTheme.textSecondary}`}>
                            {completedCount} of {todos.length} completed
                        </p>
                    </div>
                </div>

                {todos.length > 0 && (
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${currentTheme.text}`}>
                            {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
                        </div>
                        <div className={`text-xs ${currentTheme.textSecondary}`}>Complete</div>
                    </div>
                )}
            </div>

            {/* Add New Todo */}
            <div className="mb-6">
                <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                            placeholder="Add a daily task..."
                            className="w-full bg-white/80 border-2 border-slate-200/60 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400/80 focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 font-sans"
                        />
                    </div>
                    <select
                        value={newTodoPriority}
                        onChange={(e) => setNewTodoPriority(e.target.value as 'low' | 'medium' | 'high')}
                        className="bg-white/80 border-2 border-slate-200/60 rounded-xl px-3 py-3 text-slate-800 focus:outline-none focus:border-blue-400/80 focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 font-sans"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button
                        onClick={addTodo}
                        disabled={!newTodo.trim()}
                        className={`px-4 py-3 bg-gradient-to-r ${currentTheme.primary} text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            {todos.length > 0 && (
                <div className="mb-6">
                    <div className="relative w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className={`h-2 rounded-full bg-gradient-to-r ${currentTheme.primary}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedCount / todos.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>
            )}

            {/* Todo Items */}
            <div className="space-y-3">
                {/* Pending Todos */}
                <AnimatePresence>
                    {pendingTodos.map((todo) => (
                        <motion.div
                            key={todo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="group flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-slate-200/60 hover:bg-white/80 transition-all duration-300"
                        >
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-slate-300 hover:border-emerald-400 transition-colors duration-300 flex items-center justify-center group-hover:scale-110"
                            >
                                <Circle className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                            </button>

                            <div className="flex-1">
                                <p className={`${currentTheme.text} font-medium`}>{todo.text}</p>
                            </div>

                            <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${priorityConfig[todo.priority].bg} ${priorityConfig[todo.priority].color} ${priorityConfig[todo.priority].border} border`}>
                                <span className="mr-1">{priorityConfig[todo.priority].icon}</span>
                                {priorityConfig[todo.priority].label}
                            </div>

                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Completed Todos */}
                {completedTodos.length > 0 && (
                    <div className="mt-6">
                        <h4 className={`text-sm font-semibold ${currentTheme.textSecondary} mb-3 flex items-center gap-2`}>
                            <Check className="w-4 h-4" />
                            Completed ({completedTodos.length})
                        </h4>
                        <AnimatePresence>
                            {completedTodos.map((todo) => (
                                <motion.div
                                    key={todo.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="group flex items-center gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 hover:bg-emerald-50/80 transition-all duration-300 mb-2"
                                >
                                    <button
                                        onClick={() => toggleTodo(todo.id)}
                                        className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white transition-all duration-300 flex items-center justify-center group-hover:scale-110"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>

                                    <div className="flex-1">
                                        <p className="text-emerald-700 font-medium line-through opacity-75">{todo.text}</p>
                                    </div>

                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Empty State */}
                {todos.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className={`text-lg font-semibold ${currentTheme.text} mb-2`}>No tasks yet</h4>
                        <p className={`${currentTheme.textSecondary} text-sm`}>
                            Add your first daily task to get started
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodoList; 