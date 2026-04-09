import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, CheckCircle2, Bell, TrendingUp, X, Briefcase
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { useThemeLanguage } from '../ThemeLanguageContext';

const UserDashboard = () => {
    const { user } = useAuth();
    const { t } = useThemeLanguage();
    const [stats, setStats] = useState({ total_hours: 0, pending_approvals: 0, active_projects: 0 });
    const [weeklyHours, setWeeklyHours] = useState([]);
    const [notificationPopup, setNotificationPopup] = useState(null);

    const fetchData = async () => {
        try {
            const [statsRes, weeklyRes, notificationsRes] = await Promise.all([
                api.get('/user/stats'),
                api.get('/user/weekly-hours'),
                api.get('/user/notifications')
            ]);
            setStats(statsRes.data || { total_hours: 0, pending_approvals: 0, active_projects: 0 });
            setWeeklyHours(weeklyRes.data || []);
            const fetchedNotifications = notificationsRes.data || [];

            if (fetchedNotifications.length > 0 && user?.id) {
                const latest = fetchedNotifications[0];
                const storageKey = `last_seen_notification_${user.id}`;
                const lastSeenId = localStorage.getItem(storageKey);
                if (!lastSeenId || Number(lastSeenId) !== latest.id) {
                    setNotificationPopup(latest);
                    localStorage.setItem(storageKey, String(latest.id));
                }
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 15000);
        return () => clearInterval(intervalId);
    }, []);

    const productivityData = weeklyHours.map((item) => Number(item.total_hours || 0));
    const maxVal = Math.max(1, ...productivityData);
    const dayLabels = weeklyHours.map((item) =>
        new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
    );
    const dateLabels = weeklyHours.map((item) =>
        new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
    );
    const mostActiveIndex = productivityData.length
        ? productivityData.indexOf(Math.max(...productivityData))
        : -1;
    const mostActiveDay = mostActiveIndex >= 0 && weeklyHours[mostActiveIndex]
        ? new Date(weeklyHours[mostActiveIndex].date).toLocaleDateString('en-US', { weekday: 'long' })
        : 'N/A';
    const totalWeekHours = productivityData.reduce((sum, v) => sum + v, 0);
    const avgHoursPerDay = productivityData.length ? (totalWeekHours / productivityData.length).toFixed(1) : '0.0';

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-secondary tracking-tight mb-2">{t('userDashboard.title')}</h1>
                    <p className="text-gray-500 font-medium">{t('userDashboard.welcome', { name: user?.name || '' })}</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Clock} label={t('userDashboard.totalHours')} value={stats.total_hours} color="primary" />
                <StatCard icon={CheckCircle2} label={t('userDashboard.pendingAbsence')} value={stats.pending_approvals} color="amber" />
                <StatCard icon={Briefcase} label={t('userDashboard.activeProjects')} value={stats.active_projects} color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="glass rounded-[2.5rem] p-8 border border-white/50 shadow-xl lg:col-span-3">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-secondary">{t('userDashboard.weeklyOverview')}</h2>
                    </div>
                    <div className="h-64 flex items-end justify-between px-2">
                        {productivityData.map((val, idx) => (
                            <div key={idx} className="flex flex-col items-center space-y-4 group flex-1">
                                <div className="relative w-full flex justify-center">
                                    <span className="absolute -top-6 text-[10px] font-bold text-gray-400">
                                        {val}h
                                    </span>
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(val / maxVal) * 160}px` }}
                                        className="w-8 gradient-primary rounded-xl shadow-lg shadow-primary/10 group-hover:shadow-primary/30 transition-all cursor-pointer relative"
                                    >
                                    </motion.div>
                                </div>
                                <div className="text-center leading-tight">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase">
                                        {dayLabels[idx] || '-'}
                                    </span>
                                    <span className="block text-[10px] text-gray-300">
                                        {dateLabels[idx] || ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                        <p className="text-sm font-medium text-gray-500 flex items-center justify-between">
                            <span>{t('userDashboard.mostActiveDay')}</span>
                            <span className="font-bold text-secondary">{mostActiveDay}</span>
                        </p>
                        <p className="text-sm font-medium text-gray-500 flex items-center justify-between">
                            <span>{t('userDashboard.avgHoursDay')}</span>
                            <span className="font-bold text-secondary">{avgHoursPerDay}h</span>
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {notificationPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 30 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 30 }}
                        className="fixed top-8 right-8 p-5 rounded-2xl shadow-2xl z-[110] bg-white dark:bg-slate-800 border border-primary/20 dark:border-slate-600 flex items-start space-x-3 max-w-md"
                    >
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-secondary">{t('userDashboard.newNotification')}</p>
                            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{notificationPopup.message}</p>
                        </div>
                        <button onClick={() => setNotificationPopup(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
    };
    
    return (
        <div className={`glass rounded-[2rem] p-8 border ${colors[color]} shadow-xl flex items-center space-x-6`}>
            <div className={`p-4 rounded-2xl ${colors[color].split(' ')[0]} bg-white dark:bg-slate-800/80 shadow-sm`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
                <p className="text-3xl font-black">{value}</p>
            </div>
        </div>
    );
};

export default UserDashboard;
