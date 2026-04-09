import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import api from '../api';

const AddProject = () => {
    const [name, setName] = useState('');
    const [projectCode, setProjectCode] = useState('');
    const [industry, setIndustry] = useState('');
    const [description, setDescription] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', { 
                name, 
                description, 
                projectCode, 
                industry, 
                estimatedHours: parseInt(estimatedHours) || 100 
            });
            setStatus({ type: 'success', message: 'Project added successfully!' });
            setName('');
            setProjectCode('');
            setIndustry('');
            setDescription('');
            setEstimatedHours('');
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.response?.data?.message || 'Failed to add project' 
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-[2rem] p-10 border border-white/50 shadow-2xl"
            >
                <div className="flex items-center space-x-4 mb-10">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-secondary tracking-tight">Add New Project</h2>
                        <p className="text-gray-500 font-medium">Create a new project for users to track their time.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-secondary tracking-tight ml-1">Project Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={projectCode}
                                    onChange={(e) => setProjectCode(e.target.value)}
                                    placeholder="e.g. PRJ-001"
                                    className="w-full px-6 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
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
                                        value={estimatedHours}
                                        onChange={(e) => setEstimatedHours(e.target.value)}
                                        placeholder="e.g. 100"
                                        className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
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
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Project Apollo"
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-secondary tracking-tight ml-1">Nature of Industry <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                placeholder="e.g. IT, Construction, Finance"
                                className="w-full px-6 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-secondary tracking-tight ml-1">Description</label>
                            <div className="relative group">
                                <div className="absolute top-4 left-4 flex items-center pointer-events-none">
                                    <FileText className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter project details..."
                                    rows="5"
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                />
                            </div>
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
                            className="flex-1 py-4 gradient-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                        >
                            Add Project
                        </motion.button>
                        <button
                            type="button"
                            onClick={() => { setName(''); setDescription(''); }}
                            className="px-10 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddProject;
