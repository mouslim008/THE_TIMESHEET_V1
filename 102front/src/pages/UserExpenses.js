import React, { useState } from 'react';
import { DollarSign, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const UserExpenses = () => {
    const [expense, setExpense] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', expense);
            setStatus({ type: 'success', message: 'Expense submitted successfully!' });
            setExpense((prev) => ({ ...prev, amount: '', description: '' }));
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to submit expense.' });
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Expenses</h2>
                    <p className="text-gray-500">Submit your expense entries here.</p>
                </div>
            </div>

            <div className="glass rounded-[2.5rem] p-8 border border-white/50 shadow-xl space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            className="px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                            value={expense.date}
                            onChange={(e) => setExpense({ ...expense, date: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Amount ($)"
                            className="px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                            value={expense.amount}
                            onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
                            required
                        />
                    </div>

                    <textarea
                        placeholder="Description of expense..."
                        className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium h-24 resize-none"
                        value={expense.description}
                        onChange={(e) => setExpense({ ...expense, description: e.target.value })}
                    />

                    <button type="submit" className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
                        Submit Expense
                    </button>
                </form>
            </div>

            <AnimatePresence>
                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className={`fixed bottom-10 right-10 p-6 rounded-3xl shadow-2xl z-[100] flex items-center space-x-4 border-2 ${
                            status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                        }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        <span className="font-bold">{status.message}</span>
                        <button onClick={() => setStatus({ type: '', message: '' })} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserExpenses;
