import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, ArrowLeft, Clock, Tag, FileText, CheckCircle2, History, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);
    const [lastValidatedName, setLastValidatedName] = useState('');
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleValidate = async (projectId, projectName) => {
        try {
            await api.post(`/projects/${projectId}/validate`);
            setLastValidatedName(projectName);
            setShowCelebration(true);
            fetchProjects();
            // Auto hide celebration after 5 seconds
            setTimeout(() => setShowCelebration(false), 5000);
        } catch (err) {
            console.error('Validation failed:', err);
            alert(`Validation failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const filteredProjects = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.project_code && project.project_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 relative">
            {/* Celebration Popup */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-amber-100 flex flex-col items-center text-center max-w-md pointer-events-auto relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600" />
                            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 relative">
                                <Sparkles className="w-12 h-12 text-amber-500 animate-pulse" />
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-2 border-dashed border-amber-200 rounded-full"
                                />
                            </div>
                            <h3 className="text-3xl font-black text-secondary mb-2 tracking-tight">Project Accomplished!</h3>
                            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                                Mission Complete! <span className="text-amber-600 font-bold">{lastValidatedName}</span> has been successfully archived. 
                                Its legacy is now part of our history. ✨
                            </p>
                            <button
                                onClick={() => setShowCelebration(false)}
                                className="px-10 py-4 gradient-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center space-x-2"
                            >
                                <span>Onward to Success!</span>
                            </button>
                            <button 
                                onClick={() => setShowCelebration(false)}
                                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-amber-500"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg text-white">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-secondary tracking-tight">Project Explorer</h2>
                        <p className="text-gray-500 font-medium">Manage and review your project ecosystem.</p>
                    </div>
                </div>
                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-sm font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project, idx) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`glass rounded-3xl p-8 border shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden ${
                            project.status === 'completed' ? 'border-emerald-100 bg-emerald-50/10' : 'border-white/50'
                        }`}
                    >
                        {project.status === 'completed' && (
                            <div className="absolute top-0 right-0 px-6 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl flex items-center space-x-1 shadow-lg">
                                <History className="w-3 h-3" />
                                <span>Archived</span>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <Tag className={`w-4 h-4 ${project.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`} />
                                    <span className={`text-xs font-bold uppercase tracking-wider ${
                                        project.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                                    }`}>
                                        {project.project_code || 'No Code'}
                                    </span>
                                </div>
                                <h3 className={`text-2xl font-bold transition-colors ${
                                    project.status === 'completed' ? 'text-emerald-900' : 'text-secondary group-hover:text-amber-600'
                                }`}>
                                    {project.name}
                                </h3>
                            </div>
                            <div className={`p-3 rounded-2xl ${
                                project.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-gray-500">
                                <FileText className={`w-5 h-5 shrink-0 ${project.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`} />
                                <p className="text-sm leading-relaxed line-clamp-2">{project.description || 'No description provided for this project.'}</p>
                            </div>
                            <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                                <div className="flex items-center space-x-2 text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs">Created: {new Date(project.created_at).toLocaleDateString()}</span>
                                </div>
                                
                                {project.status !== 'completed' ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleValidate(project.id, project.name)}
                                        className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-200 transition-all"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>VALID</span>
                                    </motion.button>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate(`/project-archive/${project.id}`)}
                                            className="flex items-center space-x-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-black shadow-lg shadow-amber-200 transition-all"
                                        >
                                            <History className="w-4 h-4" />
                                            <span>ARCHIVE</span>
                                        </motion.button>
                                        <div className="flex items-center space-x-2 px-6 py-2.5 bg-gray-100 text-gray-400 rounded-xl text-sm font-bold">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>VALIDATED</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            {filteredProjects.length === 0 && (
                <div className="text-center py-20 glass rounded-[2rem]">
                    <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium text-lg">No projects found.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectList;

