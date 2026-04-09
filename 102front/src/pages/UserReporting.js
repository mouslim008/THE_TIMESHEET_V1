import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Download, Briefcase, CheckCircle2 } from 'lucide-react';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../AuthContext';

const UserReporting = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total_hours: 0, pending_approvals: 0, active_projects: 0 });
    const productivityData = [4, 6, 8, 5, 9, 7, 3]; // Mock data
    const maxVal = Math.max(...productivityData);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/user/stats');
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching reporting stats:', err);
            }
        };
        fetchStats();
    }, []);

    const downloadPDFReport = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Personal Activity Report', 20, 20);
        doc.setFontSize(12);
        doc.text(`User: ${user.name}`, 20, 30);
        doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 37);
        
        autoTable(doc, {
            startY: 45,
            head: [['Statistic', 'Value']],
            body: [
                ['Total Hours Worked', stats.total_hours],
                ['Pending Approvals', stats.pending_approvals],
                ['Active Projects', stats.active_projects],
            ],
        });
        
        doc.save(`${user.name}_report.pdf`);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-secondary tracking-tight">Reporting & Insights</h2>
                        <p className="text-gray-500 font-medium">Detailed breakdown of your performance and activity.</p>
                    </div>
                </div>
                <button 
                    onClick={downloadPDFReport}
                    className="flex items-center space-x-2 px-6 py-3 gradient-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                >
                    <Download className="w-5 h-5" />
                    <span>Download PDF</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Clock} label="Total Hours" value={stats.total_hours} color="primary" />
                <StatCard icon={CheckCircle2} label="Pending Approvals" value={stats.pending_approvals} color="amber" />
                <StatCard icon={Briefcase} label="Active Projects" value={stats.active_projects} color="indigo" />
            </div>

            <div className="glass rounded-[2.5rem] p-10 border border-white/50 shadow-xl">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-secondary tracking-tight">Weekly Performance</h2>
                    </div>
                    <select className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-500 outline-none cursor-pointer">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
                <div className="h-80 flex items-end justify-between px-4">
                    {productivityData.map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center space-y-6 group w-full">
                            <div className="relative w-full flex justify-center">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(val / maxVal) * 240}px` }}
                                    className="w-16 gradient-primary rounded-2xl shadow-lg shadow-primary/10 group-hover:shadow-primary/30 transition-all cursor-pointer relative"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {val} Hours
                                    </div>
                                </motion.div>
                            </div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    };
    
    return (
        <div className={`glass rounded-[2rem] p-8 border ${colors[color]} shadow-xl flex items-center space-x-6`}>
            <div className={`p-4 rounded-2xl ${colors[color].split(' ')[0]} bg-white shadow-sm`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
                <p className="text-3xl font-black">{value}</p>
            </div>
        </div>
    );
};

export default UserReporting;
