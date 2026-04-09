import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../api';

const AdminLeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });

    const fetchRequests = async () => {
        try {
            const response = await api.get('/admin/leave-requests');
            setRequests(response.data || []);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to load leave requests.' });
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateStatus = async (id, nextStatus) => {
        try {
            await api.put(`/leave-requests/${id}/status`, { status: nextStatus });
            setStatus({ type: 'success', message: `Request ${nextStatus}. User notified.` });
            fetchRequests();
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || `Failed to ${nextStatus} request.` });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Absence & Leave</h2>
                    <p className="text-gray-500">Review and decide user leave requests.</p>
                </div>
            </div>

            {status.message && (
                <div className={`${status.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'} border px-5 py-3 rounded-2xl flex items-center space-x-2`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold text-sm">{status.message}</span>
                </div>
            )}

            <div className="space-y-4">
                {requests.map((lr) => (
                    <div key={lr.id} className="glass p-6 rounded-3xl border border-white/50 shadow-xl">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-secondary">
                                    {lr.user_name} <span className="text-sm text-gray-400 font-medium">({lr.user_email})</span>
                                </p>
                                <p className="text-sm text-gray-500">
                                    {lr.type} • {new Date(lr.start_date).toLocaleDateString()} - {new Date(lr.end_date).toLocaleDateString()}
                                </p>
                                {lr.reason && <p className="text-sm text-gray-500 italic">"{lr.reason}"</p>}
                                <p className="text-xs text-gray-400">Requested: {new Date(lr.created_at).toLocaleString()}</p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest ${
                                    lr.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                    lr.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                }`}>
                                    {lr.status}
                                </span>

                                {lr.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(lr.id, 'approved')}
                                            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" /> Approve
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => updateStatus(lr.id, 'refused')}
                                            className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                <XCircle className="w-4 h-4" /> Refuse
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {requests.length === 0 && (
                    <div className="text-center py-20 glass rounded-[2.5rem]">
                        <Clock className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium text-lg">No leave requests found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLeaveRequests;
