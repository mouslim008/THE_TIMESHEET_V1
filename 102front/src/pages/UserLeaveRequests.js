import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, X, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import api from '../api';

const UserLeaveRequests = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [leaveRequest, setLeaveRequest] = useState({ start_date: '', end_date: '', type: 'Vacation', reason: '' });
    const [status, setStatus] = useState({ type: '', message: '' });

    const fetchLeaveRequests = async () => {
        try {
            const response = await api.get('/leave-requests');
            setLeaveRequests(response.data);
        } catch (err) {
            console.error('Error fetching leave requests:', err);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leave-requests', leaveRequest);
            setStatus({ type: 'success', message: 'Leave request submitted!' });
            setIsLeaveModalOpen(false);
            setLeaveRequest({ start_date: '', end_date: '', type: 'Vacation', reason: '' });
            fetchLeaveRequests();
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to submit leave request' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-secondary tracking-tight">Absence & Leave</h2>
                        <p className="text-gray-500 font-medium">Manage your time off and track request status.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="flex items-center space-x-2 px-8 py-4 gradient-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                >
                    <Plus className="w-6 h-6" />
                    <span>New Request</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {leaveRequests.map((lr, idx) => (
                    <motion.div
                        key={lr.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-xl space-y-6 group hover:shadow-2xl transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest ${
                                lr.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                                lr.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                            }`}>
                                {lr.status}
                            </span>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-secondary tracking-tight">{lr.type}</h3>
                            <p className="text-gray-400 font-medium flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(lr.start_date).toLocaleDateString()} - {new Date(lr.end_date).toLocaleDateString()}</span>
                            </p>
                        </div>

                        {lr.reason && (
                            <div className="pt-6 border-t border-gray-100/50">
                                <p className="text-sm text-gray-500 font-medium leading-relaxed italic">"{lr.reason}"</p>
                            </div>
                        )}
                        
                        <div className="pt-6 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Requested on</span>
                            <span>{new Date(lr.created_at).toLocaleDateString()}</span>
                        </div>
                    </motion.div>
                ))}
                {leaveRequests.length === 0 && (
                    <div className="col-span-full text-center py-20 glass rounded-[3rem]">
                        <Calendar className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                        <p className="text-gray-400 font-medium text-xl tracking-tight">No absence requests recorded.</p>
                    </div>
                )}
            </div>

            {/* Leave Request Modal */}
            <AnimatePresence>
                {isLeaveModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-lg relative overflow-hidden"
                        >
                            <button 
                                onClick={() => setIsLeaveModalOpen(false)}
                                className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            <div className="flex items-center space-x-4 mb-10">
                                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                                    <Calendar className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Request Leave</h2>
                                    <p className="text-gray-500 font-medium">Submit your time-off application.</p>
                                </div>
                            </div>

                            <form onSubmit={handleLeaveSubmit} className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-secondary tracking-tight ml-1">Start Date</label>
                                        <input 
                                            type="date" 
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                            value={leaveRequest.start_date}
                                            onChange={(e) => setLeaveRequest({...leaveRequest, start_date: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-secondary tracking-tight ml-1">End Date</label>
                                        <input 
                                            type="date" 
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                            value={leaveRequest.end_date}
                                            onChange={(e) => setLeaveRequest({...leaveRequest, end_date: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-secondary tracking-tight ml-1">Leave Type</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                        value={leaveRequest.type}
                                        onChange={(e) => setLeaveRequest({...leaveRequest, type: e.target.value})}
                                    >
                                        <option>Vacation</option>
                                        <option>Sick Leave</option>
                                        <option>Personal Leave</option>
                                        <option>Unpaid Leave</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-secondary tracking-tight ml-1">Reason (Optional)</label>
                                    <textarea 
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium h-32 resize-none"
                                        value={leaveRequest.reason}
                                        onChange={(e) => setLeaveRequest({...leaveRequest, reason: e.target.value})}
                                        placeholder="Briefly explain your request..."
                                    />
                                </div>
                                <button type="submit" className="w-full py-5 gradient-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-lg">
                                    Submit Request
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Status Notification */}
            <AnimatePresence>
                {status.message && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-10 right-10 p-6 rounded-3xl shadow-2xl z-[100] flex items-center space-x-4 border-2 ${
                            status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                        }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        <span className="font-bold">{status.message}</span>
                        <button onClick={() => setStatus({type:'', message:''})} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserLeaveRequests;
