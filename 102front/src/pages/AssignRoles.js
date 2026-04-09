import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Shield, Users, CheckCircle2, AlertCircle, Trash2, Search } from 'lucide-react';
import api from '../api';

const AssignRoles = () => {
    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignedRoles, setAssignedRoles] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });

    const fetchData = async () => {
        try {
            const [adminsRes, usersRes, assignedRes] = await Promise.all([
                api.get('/admins'),
                api.get('/users-without-admin'),
                api.get('/assigned-roles')
            ]);
            setAdmins(adminsRes.data);
            setUsers(usersRes.data);
            setAssignedRoles(assignedRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUserToggle = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleAssign = async () => {
        if (!selectedAdmin || selectedUsers.length === 0) {
            setStatus({ type: 'error', message: 'Please select an admin and at least one user' });
            return;
        }

        try {
            await api.post('/assign-role', { admin_id: selectedAdmin, user_ids: selectedUsers });
            setStatus({ type: 'success', message: 'Role assigned successfully!' });
            setSelectedAdmin('');
            setSelectedUsers([]);
            fetchData();
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to assign role' });
        }
    };

    const handleRemoveRole = async (adminId, userId) => {
        try {
            await api.delete(`/remove-role/${adminId}/${userId}`);
            setStatus({ type: 'success', message: 'Role removed successfully!' });
            fetchData();
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to remove role' });
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-secondary tracking-tight">Assign Admin to Users</h2>
                        <p className="text-gray-500 font-medium">Link administrators to users for management.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Assignment Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-[2rem] p-10 border border-white/50 shadow-2xl space-y-8"
                >
                    <div className="space-y-4">
                        <label className="text-lg font-bold text-secondary flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <span>Choose Admin</span>
                        </label>
                        <select
                            value={selectedAdmin}
                            onChange={(e) => setSelectedAdmin(e.target.value)}
                            className="w-full px-6 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm font-medium"
                        >
                            <option value="">---Select Admin---</option>
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.id}>{admin.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-lg font-bold text-secondary flex items-center space-x-2">
                                <Users className="w-5 h-5 text-primary" />
                                <span>Choose Users</span>
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white/50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-4 bg-white/30 rounded-2xl border border-gray-100 scrollbar-hide">
                            {filteredUsers.map(user => (
                                <label key={user.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-50 group">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleUserToggle(user.id)}
                                        className="w-5 h-5 text-primary rounded-lg focus:ring-primary transition-all"
                                    />
                                    <span className="text-gray-700 font-medium group-hover:text-primary">{user.name}</span>
                                </label>
                            ))}
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

                    <div className="flex space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAssign}
                            className="flex-1 py-4 gradient-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                        >
                            Assign Role
                        </motion.button>
                        <button
                            onClick={() => { setSelectedAdmin(''); setSelectedUsers([]); }}
                            className="px-10 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>

                {/* Assigned Roles List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-[2rem] p-10 border border-white/50 shadow-2xl space-y-8"
                >
                    <h3 className="text-2xl font-bold text-secondary mb-6">Roles Assigned to Users</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                        {assignedRoles.map((role, idx) => (
                            <motion.div
                                key={`${role.admin_id}-${role.user_id}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between p-5 bg-white/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-primary/5 transition-all group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {role.user_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-secondary">{role.user_name}</p>
                                        <p className="text-sm text-gray-400 font-medium">Managed by: <span className="text-primary">{role.admin_name}</span></p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveRole(role.admin_id, role.user_id)}
                                    className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                        {assignedRoles.length === 0 && (
                            <div className="text-center py-20">
                                <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">No roles assigned yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AssignRoles;
