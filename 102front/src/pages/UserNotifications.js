import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Info, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';

const UserNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/user/notifications');
                setNotifications(response.data);
            } catch (err) {
                console.error('Error fetching notifications:', err);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Notifications</h2>
                    <p className="text-gray-500 font-medium">Stay updated with your latest alerts and reminders.</p>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.map((n, idx) => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-6 rounded-[2rem] border border-white/50 shadow-xl flex items-start space-x-4"
                    >
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Info className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-secondary font-bold text-lg">{n.message}</p>
                            <div className="flex items-center space-x-2 text-gray-400 mt-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {notifications.length === 0 && (
                    <div className="text-center py-20 glass rounded-[2.5rem]">
                        <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium text-lg">No notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserNotifications;
