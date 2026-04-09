import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';

const AllRoles = () => {
    const [assignedRoles, setAssignedRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [entriesToShow, setEntriesToShow] = useState(10);

    const fetchData = async () => {
        try {
            const response = await api.get('/assigned-roles');
            setAssignedRoles(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRemoveRole = async (adminId, userId) => {
        try {
            await api.delete(`/remove-role/${adminId}/${userId}`);
            setStatus({ type: 'success', message: 'Role removed successfully!' });
            fetchData();
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to remove role' });
        }
    };

    const filteredRoles = assignedRoles.filter(role => 
        role.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.admin_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Roles</h2>
                    <p className="text-gray-500 font-medium">Manage all assigned user-admin relationships.</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-[2rem] p-8 border border-white/50 shadow-2xl"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-2 text-gray-500 font-medium">
                        <span>Show</span>
                        <select 
                            value={entriesToShow}
                            onChange={(e) => setEntriesToShow(Number(e.target.value))}
                            className="px-3 py-1 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl flex items-center space-x-3 mb-6 ${
                            status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="font-bold">{status.message}</p>
                    </motion.div>
                )}

                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-secondary">Name</th>
                                <th className="px-6 py-4 text-sm font-bold text-secondary">Assign To Admin</th>
                                <th className="px-6 py-4 text-sm font-bold text-secondary">Remove Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRoles.slice(0, entriesToShow).map((role) => (
                                <tr key={`${role.admin_id}-${role.user_id}`} className="hover:bg-white/50 transition-all group">
                                    <td className="px-6 py-4 text-sm font-bold text-secondary">{role.user_name}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-500">{role.admin_name.toUpperCase()}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleRemoveRole(role.admin_id, role.user_id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold shadow-md shadow-red-500/20 hover:bg-red-600 hover:shadow-red-500/40 transition-all flex items-center space-x-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Remove Role</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRoles.length === 0 && (
                        <div className="text-center py-20 bg-white/30">
                            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">No assigned roles found.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AllRoles;
