import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Briefcase, TrendingUp, ChevronRight, LogOut, AlertCircle, X, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import api from '../api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useThemeLanguage } from '../ThemeLanguageContext';

const CountCard = ({ title, count, icon: Icon, color, delay, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        onClick={onClick}
        className="glass rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-white/50 relative overflow-hidden group cursor-pointer"
    >
        <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500 ${color}`} />
        <div className="flex items-center justify-between mb-6">
            <div className={`p-4 rounded-2xl ${color.replace('bg-', 'bg-opacity-10 text-')} shadow-sm`}>
                <Icon className="w-8 h-8" />
            </div>
            <span className="text-gray-400 font-medium flex items-center text-sm group-hover:text-primary transition-colors">
                View Details <ChevronRight className="w-4 h-4 ml-1" />
            </span>
        </div>
        <div className="space-y-1">
            <h3 className="text-4xl font-bold text-secondary tracking-tight">{count}</h3>
            <p className="text-gray-500 font-medium">{title}</p>
        </div>
        <div className="mt-6 flex items-center space-x-2 text-emerald-500 text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>+12% this month</span>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState({ 
        userCount: 0, 
        adminCount: 0, 
        projectCount: 0, 
        recentActivities: [], 
        activeProjects: [] 
    });
    const [users, setUsers] = useState([]);
    const [assignedRoles, setAssignedRoles] = useState([]);
    const [allTimesheets, setAllTimesheets] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [error, setError] = useState(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [projectForm, setProjectForm] = useState({
        name: '',
        projectCode: '',
        industry: '',
        description: '',
        estimatedHours: ''
    });
    const [projectStatus, setProjectStatus] = useState({ type: '', message: '' });
    const { logout, user } = useAuth();
    const { t } = useThemeLanguage();
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        setError(null);
        const [dashboardRes, usersRes, assignedRes, timesheetsRes, expensesRes] = await Promise.allSettled([
            api.get('/dashboard-counts'),
            api.get('/users-by-role/user'),
            api.get('/assigned-roles'),
            api.get('/timesheets/export?startDate=2000-01-01&endDate=2099-12-31'),
            api.get('/expenses/export?startDate=2000-01-01&endDate=2099-12-31')
        ]);

        const hasDashboardData = dashboardRes.status === 'fulfilled';
        if (hasDashboardData) {
            const updatedData = {
                userCount: dashboardRes.value?.data?.userCount || 0,
                adminCount: dashboardRes.value?.data?.adminCount || 0,
                projectCount: dashboardRes.value?.data?.projectCount || 0,
                recentActivities: dashboardRes.value?.data?.recentActivities || [],
                activeProjects: dashboardRes.value?.data?.activeProjects || []
            };
            setDashboardData(updatedData);
        }

        setUsers(usersRes.status === 'fulfilled' ? (usersRes.value?.data || []) : []);
        setAssignedRoles(assignedRes.status === 'fulfilled' ? (assignedRes.value?.data || []) : []);
        setAllTimesheets(timesheetsRes.status === 'fulfilled' ? (timesheetsRes.value?.data || []) : []);
        setAllExpenses(expensesRes.status === 'fulfilled' ? (expensesRes.value?.data || []) : []);

        if (!hasDashboardData) {
            const dashboardError = dashboardRes.reason;
            console.error('Error fetching dashboard counts:', dashboardError);
            setError(dashboardError?.response?.data?.message || 'Failed to load dashboard data. Please try again.');
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', { 
                ...projectForm, 
                estimatedHours: parseInt(projectForm.estimatedHours) || 100 
            });
            setProjectStatus({ type: 'success', message: 'Project added successfully!' });
            setProjectForm({
                name: '',
                projectCode: '',
                industry: '',
                description: '',
                estimatedHours: ''
            });
            // Refresh dashboard data to show new project
            fetchDashboardData();
            // Close modal after a short delay
            setTimeout(() => {
                setIsProjectModalOpen(false);
                setProjectStatus({ type: '', message: '' });
            }, 2000);
        } catch (err) {
            setProjectStatus({ 
                type: 'error', 
                message: err.response?.data?.message || 'Failed to add project' 
            });
        }
    };

    const downloadReport = async () => {
        const sections = [
            {
                properties: {},
                children: [
                    new Paragraph({
                        text: "Super Admin Dashboard Report",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `Date: ${new Date().toLocaleDateString()}`,
                        alignment: AlignmentType.RIGHT,
                    }),

                    // Dashboard Overview Section
                    new Paragraph({
                        text: "Dashboard Overview",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 400, after: 200 },
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "Metric", bold: true })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Value", bold: true })] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("User Count")] }),
                                    new TableCell({ children: [new Paragraph((dashboardData.userCount || 0).toString())] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Admins Count")] }),
                                    new TableCell({ children: [new Paragraph((dashboardData.adminCount || 0).toString())] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Total Projects")] }),
                                    new TableCell({ children: [new Paragraph((dashboardData.projectCount || 0).toString())] }),
                                ],
                            }),
                        ],
                    }),

                    // User Details Section
                    new Paragraph({
                        text: "User Details",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 400, after: 200 },
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "Name", bold: true })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Email", bold: true })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Mobile", bold: true })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Joined Date", bold: true })] }),
                                ],
                            }),
                            ...(users || []).map(user => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(user.name || "N/A")] }),
                                    new TableCell({ children: [new Paragraph(user.email || "N/A")] }),
                                    new TableCell({ children: [new Paragraph(user.mobile || "N/A")] }),
                                    new TableCell({ children: [new Paragraph(user.date_of_joining || "N/A")] }),
                                ],
                            })),
                        ],
                    }),
                ],
            }
        ];

        // Add user-specific details to Word report
        users.forEach(user => {
            const userTimesheets = allTimesheets.filter(t => t.user_id === user.id);
            const userExpenses = allExpenses.filter(e => e.user_id === user.id);

            sections[0].children.push(
                new Paragraph({
                    text: `User Detailed Report: ${user.name}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 600, after: 200 },
                }),
                new Paragraph({ text: "Timesheets", heading: HeadingLevel.HEADING_3 }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Date", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Project", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Hours", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Description", bold: true })] }),
                            ],
                        }),
                        ...userTimesheets.map(t => new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(new Date(t.date).toLocaleDateString())] }),
                                new TableCell({ children: [new Paragraph(t.project_name || "N/A")] }),
                                new TableCell({ children: [new Paragraph(t.hours.toString())] }),
                                new TableCell({ children: [new Paragraph(t.description || "N/A")] }),
                            ],
                        }))
                    ]
                }),
                new Paragraph({ text: "Expenses", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Date", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Amount", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Description", bold: true })] }),
                            ],
                        }),
                        ...userExpenses.map(e => new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(new Date(e.date).toLocaleDateString())] }),
                                new TableCell({ children: [new Paragraph(`$${e.amount}`)] }),
                                new TableCell({ children: [new Paragraph(e.description || "N/A")] }),
                            ],
                        }))
                    ]
                })
            );
        });

        const doc = new Document({ sections });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "Dashboard_Full_Detailed_Report.docx");
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            <AnimatePresence>
                {isProjectModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-2xl w-full max-w-2xl relative overflow-hidden"
                        >
                            <button 
                                onClick={() => { setIsProjectModalOpen(false); setProjectStatus({type:'', message:''}); }}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center space-x-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                                    <Briefcase className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Add New Project</h2>
                                    <p className="text-gray-500 font-medium">Quickly add a project to the system.</p>
                                </div>
                            </div>

                            <form onSubmit={handleProjectSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-secondary tracking-tight ml-1">Project Code <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={projectForm.projectCode}
                                            onChange={(e) => setProjectForm({...projectForm, projectCode: e.target.value})}
                                            placeholder="e.g. PRJ-001"
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-secondary tracking-tight ml-1">Estimated Hours <span className="text-red-500">*</span></label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Clock className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <input
                                                type="number"
                                                value={projectForm.estimatedHours}
                                                onChange={(e) => setProjectForm({...projectForm, estimatedHours: e.target.value})}
                                                placeholder="e.g. 100"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-secondary tracking-tight ml-1">Project Name <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Briefcase className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            value={projectForm.name}
                                            onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                                            placeholder="e.g. Project Apollo"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-secondary tracking-tight ml-1">Industry</label>
                                    <input
                                        type="text"
                                        value={projectForm.industry}
                                        onChange={(e) => setProjectForm({...projectForm, industry: e.target.value})}
                                        placeholder="e.g. Technology"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-secondary tracking-tight ml-1">Description</label>
                                    <div className="relative group">
                                        <div className="absolute top-4 left-4 pointer-events-none">
                                            <FileText className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <textarea
                                            value={projectForm.description}
                                            onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                                            placeholder="Brief project summary..."
                                            rows="3"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm resize-none"
                                        />
                                    </div>
                                </div>

                                {projectStatus.message && (
                                    <div className={`p-4 rounded-xl flex items-center space-x-2 ${projectStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {projectStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        <span className="font-bold text-sm">{projectStatus.message}</span>
                                    </div>
                                )}

                                <div className="flex space-x-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 gradient-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                    >
                                        Create Project
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsProjectModalOpen(false)}
                                        className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
                {selectedActivity && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-2xl w-full max-w-2xl relative border border-white/70 overflow-hidden"
                        >
                            <div className="absolute inset-x-0 top-0 h-2 gradient-primary" />
                            <button
                                onClick={() => setSelectedActivity(null)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-start justify-between gap-4 mb-6 mt-2">
                                <div>
                                    <h3 className="text-3xl font-bold text-secondary tracking-tight">Activity Details</h3>
                                    <p className="text-sm text-gray-500 mt-1">Detailed event information</p>
                                </div>
                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                                    selectedActivity.type === 'timesheet'
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                    {selectedActivity.type === 'timesheet' ? 'Timesheet' : 'Expense'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                    <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">User</p>
                                    <p className="text-secondary font-bold mt-1">{selectedActivity.user_name || 'Unknown User'}</p>
                                </div>
                                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                    <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Event Date</p>
                                    <p className="text-secondary font-bold mt-1">{selectedActivity.date ? new Date(selectedActivity.date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                    <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Created At</p>
                                    <p className="text-secondary font-bold mt-1">{selectedActivity.created_at ? new Date(selectedActivity.created_at).toLocaleString() : 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                    <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Project</p>
                                    <p className="text-secondary font-bold mt-1">{selectedActivity.project_name || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-4">
                                <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Description</p>
                                <p className="text-secondary font-medium mt-2">{selectedActivity.detail || 'No description provided'}</p>
                            </div>

                            <div className="mt-4 flex items-center justify-between rounded-2xl p-4 bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/10">
                                <p className="text-sm font-bold text-gray-500">
                                    {selectedActivity.type === 'timesheet' ? 'Hours Logged' : 'Amount'}
                                </p>
                                <p className="text-2xl font-black text-secondary">
                                    {selectedActivity.type === 'timesheet'
                                        ? `${Number(selectedActivity.amount || 0)}h`
                                        : `$${Number(selectedActivity.amount || 0).toFixed(2)}`}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-sm">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-bold">{error}</p>
                </div>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-secondary tracking-tight mb-2">
                        {t(user?.role === 'superadmin' ? 'adminDashboard.titleSuper' : 'adminDashboard.titleAdmin')}
                    </h1>
                    <p className="text-gray-500">{t('adminDashboard.welcome')}</p>
                </div>
                <div className="flex space-x-4">
                    <button 
                        onClick={downloadReport}
                        className="px-6 py-3 bg-white dark:bg-slate-800 text-secondary font-bold rounded-2xl shadow-sm border border-gray-100 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                    >
                        Download Report
                    </button>
                    <button 
                        onClick={() => setIsProjectModalOpen(true)}
                        className="px-6 py-3 gradient-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    >
                        + New Project
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <CountCard 
                    title="User Count!" 
                    count={dashboardData.userCount || 0} 
                    icon={Users} 
                    color="bg-primary" 
                    delay={0.1}
                    onClick={() => navigate('/users-list')}
                />
                <CountCard 
                    title="Admins Count!" 
                    count={dashboardData.adminCount || 0} 
                    icon={Shield} 
                    color="bg-emerald-500" 
                    delay={0.2}
                    onClick={() => navigate('/admins-list')}
                />
                <CountCard 
                    title="Total Projects Count!" 
                    count={dashboardData.projectCount || 0} 
                    icon={Briefcase} 
                    color="bg-amber-500" 
                    delay={0.3}
                    onClick={() => navigate('/projects-list')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass rounded-3xl p-8 border border-white/50 shadow-xl">
                    <h3 className="text-xl font-bold text-secondary mb-6">Recent Activities</h3>
                    <div className="space-y-6">
                        {(dashboardData.recentActivities || []).length > 0 ? (dashboardData.recentActivities || []).map((activity, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedActivity(activity)}
                                className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/50 transition-all cursor-pointer border border-transparent hover:border-gray-100"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {(activity.user_name || 'U').split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                     <p className="font-bold text-secondary text-sm">
                                         {activity.user_name || 'Unknown User'} added {activity.type === 'timesheet' ? 'Timesheet' : 'Expense'}
                                     </p>
                                     <p className="text-xs text-gray-400">
                                         {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'N/A'} • {activity.detail || 'No description provided'} • {activity.type === 'timesheet' ? `${Number(activity.amount || 0)}h` : `$${Number(activity.amount || 0).toFixed(2)}`}
                                     </p>
                                 </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                        )) : (
                            <p className="text-gray-400 text-center py-4">No recent activities found.</p>
                        )}
                    </div>
                </div>
                <div className="glass rounded-3xl p-8 border border-white/50 shadow-xl">
                    <h3 className="text-xl font-bold text-secondary mb-6">Active Projects</h3>
                    <div className="space-y-6">
                        {(dashboardData.activeProjects || []).length > 0 ? (dashboardData.activeProjects || []).map((project, idx) => {
                            const hoursSpent = Number(project.hours_spent || 0);
                            const estimatedHours = Number(project.estimated_hours || 100);
                            const remaining = estimatedHours - hoursSpent;
                            const isOverBudget = remaining < 0;
                            // Actual progress can exceed 100 for calculations, but the bar should be visual.
                            const actualProgress = estimatedHours > 0 ? Math.round((hoursSpent / estimatedHours) * 100) : 0;
                            const barProgress = Math.min(100, Math.max(0, actualProgress));

                            return (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="font-bold text-secondary">{project.name || 'N/A'}</span>
                                        <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${isOverBudget ? 'bg-red-50 text-red-600' : 'bg-primary/5 text-primary'}`}>
                                            {actualProgress}%
                                        </span>
                                    </div>
                                    <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                                        <div 
                                            style={{ width: `${barProgress}%` }}
                                            className={`h-full ${isOverBudget ? 'bg-red-500' : 'gradient-primary'} transition-all duration-500 rounded-full`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-medium">
                                        <div className="flex items-center space-x-1 text-gray-400">
                                            <span>Logged: <span className="text-secondary">{hoursSpent}h</span></span>
                                            <span>/</span>
                                            <span>Goal: <span className="text-secondary">{estimatedHours}h</span></span>
                                        </div>
                                        <span className={`${isOverBudget ? 'text-red-500' : 'text-emerald-500'} font-bold`}>
                                            {isOverBudget ? `${Math.abs(remaining)}h over budget` : `${remaining}h remaining`}
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-gray-400 text-center py-4">No active projects found.</p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
