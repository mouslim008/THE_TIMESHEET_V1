import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const UserTimesheets = () => {
    const [projects, setProjects] = useState([]);
    const [timesheet, setTimesheet] = useState({
        project_id: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        task_category: 'Development'
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/projects');
                setProjects(res.data || []);
            } catch (err) {
                console.error('Error loading projects:', err);
            }
        };
        fetchProjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/timesheets', timesheet);
            setStatus({ type: 'success', message: 'Timesheet submitted successfully!' });
            setTimesheet((prev) => ({ ...prev, hours: '', description: '' }));
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to submit timesheet.' });
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Timesheets</h2>
                    <p className="text-gray-500">Submit your working hours here.</p>
                </div>
            </div>

            <div className="glass rounded-[2.5rem] p-8 border border-white/50 shadow-xl space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                        className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        value={timesheet.project_id}
                        onChange={(e) => setTimesheet({ ...timesheet, project_id: e.target.value })}
                        required
                    >
                        <option value="">Select Project</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            className="px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                            value={timesheet.date}
                            onChange={(e) => setTimesheet({ ...timesheet, date: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Hours"
                            className="px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                            value={timesheet.hours}
                            onChange={(e) => setTimesheet({ ...timesheet, hours: e.target.value })}
                            required
                        />
                    </div>

                    <select
                        className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        value={timesheet.task_category}
                        onChange={(e) => setTimesheet({ ...timesheet, task_category: e.target.value })}
                    >
                        <option>Development</option>
                        <option>Meeting</option>
                        <option>Research</option>
                        <option>Planning</option>
                        <option>Bug Fix</option>
                    </select>

                    <textarea
                        placeholder="What did you work on?"
                        className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium h-24 resize-none"
                        value={timesheet.description}
                        onChange={(e) => setTimesheet({ ...timesheet, description: e.target.value })}
                    />

                    <button type="submit" className="w-full py-4 gradient-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                        Submit Entry
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

export default UserTimesheets;
