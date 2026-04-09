import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, History, Users, Clock, Tag, FileText, User, Mail, Shield, ChevronRight } from 'lucide-react';
import api from '../api';

const ProjectArchiveDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/projects/${id}/details`);
                setData(response.data);
            } catch (err) {
                console.error('Error fetching project details:', err);
                alert(`Error: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (!data) return (
        <div className="text-center py-20 glass rounded-[2rem]">
            <History className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium text-lg">Project not found or error loading data.</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 font-bold flex items-center justify-center space-x-2 mx-auto">
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
            </button>
        </div>
    );

    const { project, contributors } = data;

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-emerald-500"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg text-white">
                        <History className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-secondary tracking-tight">Project Legacy</h2>
                        <p className="text-gray-500 font-medium">Historical record of a completed mission.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Project Info */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 space-y-8"
                >
                    <div className="glass rounded-[2.5rem] p-10 border border-emerald-100/50 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-8 py-3 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-bl-3xl flex items-center space-x-2">
                            <History className="w-4 h-4" />
                            <span>Archived Status</span>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 text-emerald-600 font-bold uppercase tracking-widest text-xs">
                                <Tag className="w-4 h-4" />
                                <span>{project.projectCode || 'NO CODE'}</span>
                            </div>
                            
                            <h1 className="text-5xl font-black text-secondary leading-tight">{project.name}</h1>
                            
                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-100 flex items-center space-x-2">
                                    <Shield className="w-4 h-4" />
                                    <span>{project.industry || 'General Industry'}</span>
                                </div>
                                <div className="px-5 py-2 bg-gray-50 text-gray-600 rounded-2xl text-sm font-bold border border-gray-100 flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-gray-100">
                                <h4 className="text-lg font-bold text-secondary mb-4 flex items-center space-x-2">
                                    <FileText className="w-5 h-5 text-emerald-500" />
                                    <span>Project Narrative</span>
                                </h4>
                                <p className="text-gray-500 leading-relaxed text-lg font-medium">
                                    {project.description || 'No detailed description recorded for this mission.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="glass rounded-[2rem] p-8 border border-white/50 shadow-xl flex items-center space-x-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Team size</p>
                                <p className="text-3xl font-black text-secondary">{contributors.length} <span className="text-lg text-gray-300">members</span></p>
                            </div>
                        </div>
                        <div className="glass rounded-[2rem] p-8 border border-white/50 shadow-xl flex items-center space-x-6">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                <Clock className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Effort spent</p>
                                <p className="text-3xl font-black text-secondary">{contributors.reduce((acc, c) => acc + c.totalHours, 0)} <span className="text-lg text-gray-300">hours</span></p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Contributors */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <h3 className="text-2xl font-bold text-secondary flex items-center space-x-3 px-2">
                        <Users className="w-6 h-6 text-emerald-500" />
                        <span>Key Contributors</span>
                    </h3>
                    
                    <div className="space-y-4">
                        {contributors.length > 0 ? contributors.map((person, idx) => (
                            <motion.div 
                                key={person.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-xl hover:translate-x-2 transition-all group"
                            >
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        {person.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-secondary group-hover:text-emerald-600 transition-colors">{person.name}</h5>
                                        <p className="text-xs text-gray-400 font-bold flex items-center space-x-1">
                                            <Shield className="w-3 h-3" />
                                            <span className="uppercase tracking-tighter">{person.role}</span>
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-400">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">{person.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-sm font-black text-secondary">{person.totalHours} hrs</span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{person.entries} sessions</span>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <User className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm font-medium">No recorded time entries found.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProjectArchiveDetail;
