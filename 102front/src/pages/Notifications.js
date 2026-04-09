import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import api from '../api';

const Notifications = () => {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message) return;

        try {
            await api.post('/notifications', { message });
            setStatus({ type: 'success', message: 'Notification sent successfully!' });
            setMessage('');
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to send notification' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <Bell className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-secondary tracking-tight">Push Notification</h2>
                        <p className="text-gray-500 font-medium">Send notifications to all users in the system.</p>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-[2rem] p-10 border border-white/50 shadow-2xl"
            >
                <form onSubmit={handleSend} className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-lg font-bold text-secondary flex items-center space-x-2">
                            <Bell className="w-5 h-5 text-primary" />
                            <span>Notification Message</span>
                        </label>
                        <div className="relative group">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter notification message here..."
                                rows="8"
                                className="w-full px-8 py-6 bg-white/50 border border-gray-200 rounded-[2rem] focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm font-medium text-lg leading-relaxed"
                                required
                            />
                        </div>
                    </div>

                    {status.message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl flex items-center space-x-3 ${
                                status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                            }`}
                        >
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p className="font-bold">{status.message}</p>
                        </motion.div>
                    )}

                    <div className="flex items-center space-x-4 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="flex-1 py-5 gradient-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center space-x-3"
                        >
                            <Send className="w-6 h-6" />
                            <span className="text-lg">Send Notification</span>
                        </motion.button>
                        <button
                            type="button"
                            onClick={() => { setMessage(''); }}
                            className="px-12 py-5 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center space-x-3"
                        >
                            <Trash2 className="w-6 h-6" />
                            <span className="text-lg">Clear</span>
                        </button>
                    </div>
                </form>
            </motion.div>

            <div className="glass rounded-[2rem] p-10 border border-white/50 shadow-xl mt-10">
                <h3 className="text-2xl font-bold text-secondary mb-8">Recent Notifications</h3>
                <div className="space-y-6">
                    {[1, 2].map(i => (
                        <div key={i} className="p-6 bg-white/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-lg transition-all flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shrink-0">
                                <Bell className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <p className="font-bold text-secondary">System Update</p>
                                    <span className="text-xs text-gray-400 font-medium">2 hours ago</span>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">Please update your timesheets for the current month by Friday. All entries must be approved by your respective administrators.</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
