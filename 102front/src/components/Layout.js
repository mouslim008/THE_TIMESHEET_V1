import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    UserPlus, 
    ShieldPlus, 
    UserCheck, 
    Users,
    Briefcase, 
    KeyRound, 
    FileSpreadsheet, 
    Bell, 
    LogOut,
    Clock,
    DollarSign,
    BarChart3,
    MessageSquare,
    Calendar,
    User,
    Paperclip,
    Moon,
    Sun,
    Languages
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useThemeLanguage } from '../ThemeLanguageContext';
import { motion } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, labelKey }) => {
    const { t } = useThemeLanguage();
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                    ? 'gradient-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white'
                }`
            }
        >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="font-medium">{t(labelKey)}</span>
        </NavLink>
    );
};

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();

    return (
        <div className="flex min-h-screen bg-background dark:bg-slate-950">
            <motion.aside 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-72 glass border-r border-gray-200/50 dark:border-slate-700/80 p-6 flex flex-col fixed h-full z-50"
            >
                <div className="flex items-center justify-between gap-2 mb-6 px-1">
                    <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shrink-0">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-secondary truncate">{t('layout.brand')}</h2>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? t('layout.themeLight') : t('layout.themeDark')}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/90 border border-gray-100 dark:border-slate-600 text-secondary dark:text-slate-100 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                        <span>{theme === 'dark' ? t('layout.themeLight') : t('layout.themeDark')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                        title={t('layout.language')}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/90 border border-gray-100 dark:border-slate-600 text-secondary dark:text-slate-100 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        <Languages className="w-4 h-4 text-primary" />
                        <span>{language === 'en' ? 'FR' : 'EN'}</span>
                    </button>
                </div>

                <nav className="sidebar-scroll flex-1 space-y-2 min-h-0 overflow-y-auto overflow-x-hidden pr-1 -mr-1">
                    <SidebarLink to={user?.role === 'user' ? '/user-dashboard' : '/dashboard'} icon={LayoutDashboard} labelKey="layout.nav.dashboard" />
                    {user?.role === 'user' && (
                        <>
                            <SidebarLink to="/user-notifications" icon={Bell} labelKey="layout.nav.notifications" />
                            <SidebarLink to="/user-reporting" icon={BarChart3} labelKey="layout.nav.reporting" />
                            <SidebarLink to="/user-timesheets" icon={Clock} labelKey="layout.nav.timesheets" />
                            <SidebarLink to="/user-expenses" icon={DollarSign} labelKey="layout.nav.expenses" />
                            <SidebarLink to="/work-attachments" icon={Paperclip} labelKey="layout.nav.workAttachments" />
                            <SidebarLink to="/user-collaboration" icon={MessageSquare} labelKey="layout.nav.collaboration" />
                            <SidebarLink to="/user-leave-requests" icon={Calendar} labelKey="layout.nav.absence" />
                            <SidebarLink to="/user-profile" icon={User} labelKey="layout.nav.profile" />
                        </>
                    )}
                    {user?.role === 'superadmin' && (
                        <>
                            <SidebarLink to="/create-user" icon={UserPlus} labelKey="layout.nav.createUser" />
                            <SidebarLink to="/create-admin" icon={ShieldPlus} labelKey="layout.nav.createAdmin" />
                            <SidebarLink to="/assign-roles" icon={UserCheck} labelKey="layout.nav.assignRoles" />
                            <SidebarLink to="/all-roles" icon={Users} labelKey="layout.nav.allRoles" />
                            <SidebarLink to="/add-project" icon={Briefcase} labelKey="layout.nav.addProject" />
                            <SidebarLink to="/team-chat" icon={MessageSquare} labelKey="layout.nav.teamChat" />
                            <SidebarLink to="/admin-leave-requests" icon={Calendar} labelKey="layout.nav.absenceLeave" />
                            <SidebarLink to="/work-attachments" icon={Paperclip} labelKey="layout.nav.workAttachments" />
                            <SidebarLink to="/notify" icon={Bell} labelKey="layout.nav.notify" />
                            <SidebarLink to="/reset-password" icon={KeyRound} labelKey="layout.nav.resetPassword" />
                            <SidebarLink to="/export-timesheets" icon={FileSpreadsheet} labelKey="layout.nav.exportTimesheets" />
                            <SidebarLink to="/export-expenses" icon={FileSpreadsheet} labelKey="layout.nav.exportExpenses" />
                        </>
                    )}
                    {user?.role === 'admin' && (
                        <>
                            <SidebarLink to="/add-project" icon={Briefcase} labelKey="layout.nav.addProject" />
                            <SidebarLink to="/team-chat" icon={MessageSquare} labelKey="layout.nav.teamChat" />
                            <SidebarLink to="/admin-leave-requests" icon={Calendar} labelKey="layout.nav.absenceLeave" />
                            <SidebarLink to="/work-attachments" icon={Paperclip} labelKey="layout.nav.workAttachments" />
                            <SidebarLink to="/notify" icon={Bell} labelKey="layout.nav.notify" />
                            <SidebarLink to="/reset-password" icon={KeyRound} labelKey="layout.nav.resetPassword" />
                            <SidebarLink to="/export-timesheets" icon={FileSpreadsheet} labelKey="layout.nav.exportTimesheets" />
                            <SidebarLink to="/export-expenses" icon={FileSpreadsheet} labelKey="layout.nav.exportExpenses" />
                        </>
                    )}
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-700 space-y-4">
                    <div className="px-4 py-3 bg-white/50 dark:bg-slate-800/70 rounded-2xl flex items-center space-x-3 border border-gray-100 dark:border-slate-600">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold">{user?.name?.charAt(0)}</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-secondary truncate">{t('layout.hi')} {user?.name}!</p>
                            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">{t('layout.logout')}</span>
                    </button>
                </div>
            </motion.aside>

            <main className="main-scroll flex-1 ml-72 p-10 overflow-auto bg-background dark:bg-slate-950 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default Layout;
