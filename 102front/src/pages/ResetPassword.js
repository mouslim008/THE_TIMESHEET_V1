import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Search, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../api';

const ResetPassword = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsers();
    }, []);

    const handleReset = async (e) => {
        e.preventDefault();
        if (!selectedUser || !newPassword) {
            setStatus({ type: 'error', message: 'Please select a user and enter a new password' });
            return;
        }

        try {
            await api.put(`/users/${selectedUser}/reset-password`, { password: newPassword });
            setStatus({ type: 'success', message: 'Password reset successfully!' });
            setNewPassword('');
            setSelectedUser('');
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to reset password' });
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <KeyRound className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Reset Password</h2>
                    <p className="text-gray-500 font-medium">Manage and reset user passwords.</p>
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
                        <select className="px-3 py-1 bg-white border border-gray-200 rounded-lg outline-none">
                            <option>10</option>
                            <option>25</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-8">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-secondary">Username</th>
                                <th className="px-6 py-4 text-sm font-bold text-secondary">Name</th>
                                <th className="px-6 py-4 text-sm font-bold text-secondary">Email ID</th>
                                <th className="px-6 py-4 text-sm font-bold text-secondary">ResetPassword</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={`hover:bg-white/50 transition-all ${selectedUser === user.id ? 'bg-primary/5' : ''}`}>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-secondary">{user.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUser(user.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                                selectedUser === user.id 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                                : 'bg-red-500 text-white hover:bg-red-600'
                                            }`}
                                        >
                                            {selectedUser === user.id ? 'Selected' : 'Reset Password'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedUser && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 bg-primary/5 rounded-3xl border border-primary/10 space-y-6"
                    >
                        <h3 className="text-xl font-bold text-secondary">Set New Password for {users.find(u => u.id === selectedUser)?.name}</h3>
                        <form onSubmit={handleReset} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-bold text-secondary ml-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="px-10 py-3 gradient-primary text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                            >
                                Update Password
                            </button>
                        </form>
                    </motion.div>
                )}

                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 p-4 rounded-2xl flex items-center space-x-3 ${
                            status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="font-bold">{status.message}</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
