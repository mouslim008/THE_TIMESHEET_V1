import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, ArrowLeft, Mail, Phone, Calendar, Info, Trash2, Edit2, X, CheckCircle2, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users-by-role/user');
            setUsers(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(u => u.id !== id));
                setSelectedUser(null);
                alert('User deleted successfully');
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${selectedUser.id}`, editForm);
            setStatus({ type: 'success', message: 'User updated successfully!' });
            setIsEditing(false);
            fetchUsers();
            setSelectedUser({ ...selectedUser, ...editForm });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to update user' });
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Detail/Edit Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-2xl w-full max-w-2xl relative overflow-hidden"
                        >
                            <button 
                                onClick={() => { setSelectedUser(null); setIsEditing(false); setStatus({type:'', message:''}); }}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center space-x-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-secondary">{isEditing ? 'Edit User' : 'User Information'}</h3>
                                    <p className="text-gray-500 font-medium">@{selectedUser.username}</p>
                                </div>
                            </div>

                            {!isEditing ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                                            <p className="text-lg font-bold text-secondary">{selectedUser.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-lg font-bold text-secondary">{selectedUser.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mobile Number</p>
                                            <p className="text-lg font-bold text-secondary">{selectedUser.mobile || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gender</p>
                                            <p className="text-lg font-bold text-secondary capitalize">{selectedUser.gender || 'Not specified'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Birth Date</p>
                                            <p className="text-lg font-bold text-secondary">{selectedUser.birthdate ? new Date(selectedUser.birthdate).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date of Joining</p>
                                            <p className="text-lg font-bold text-secondary">{selectedUser.date_of_joining ? new Date(selectedUser.date_of_joining).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-gray-100 flex space-x-4">
                                        <button
                                            onClick={() => {
                                                setEditForm(selectedUser);
                                                setIsEditing(true);
                                            }}
                                            className="flex-1 py-4 bg-amber-50 text-amber-600 rounded-2xl font-bold hover:bg-amber-100 transition-all flex items-center justify-center space-x-2"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                            <span>Modify Profile</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedUser.id)}
                                            className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center space-x-2"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            <span>Delete User</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                className="w-full px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase ml-1">Username</label>
                                            <input
                                                type="text"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                                className="w-full px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase ml-1">Email</label>
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                className="w-full px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase ml-1">Mobile</label>
                                            <input
                                                type="text"
                                                value={editForm.mobile || ''}
                                                onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
                                                className="w-full px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase ml-1">Gender</label>
                                            <select
                                                value={editForm.gender || ''}
                                                onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                                                className="w-full px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase ml-1">Birth Date</label>
                                            <input
                                                type="date"
                                                value={editForm.birthdate ? editForm.birthdate.split('T')[0] : ''}
                                                onChange={(e) => setEditForm({...editForm, birthdate: e.target.value})}
                                                className="w-full px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase ml-1">Date of Joining</label>
                                            <input
                                                type="date"
                                                value={editForm.date_of_joining ? editForm.date_of_joining.split('T')[0] : ''}
                                                onChange={(e) => setEditForm({...editForm, date_of_joining: e.target.value})}
                                                className="w-full px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {status.message && (
                                        <div className={`p-4 rounded-xl flex items-center space-x-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-bold text-sm">{status.message}</span>
                                        </div>
                                    )}

                                    <div className="flex space-x-4">
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 gradient-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-primary"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg text-white">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-secondary tracking-tight">User Community</h2>
                        <p className="text-gray-500 font-medium">Manage and consult user profiles.</p>
                    </div>
                </div>
                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user, idx) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass rounded-[2rem] p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all group"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <button
                                onClick={() => setSelectedUser(user)}
                                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                                <Info className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-1 mb-6">
                            <h3 className="font-bold text-secondary text-xl">{user.name}</h3>
                            <p className="text-sm text-gray-400 font-medium flex items-center space-x-1">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>@{user.username}</span>
                            </p>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-gray-50">
                            <div className="flex items-center space-x-3 text-gray-500 text-sm">
                                <Mail className="w-4 h-4 text-primary/40" />
                                <span className="truncate font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-500 text-sm">
                                <Phone className="w-4 h-4 text-primary/40" />
                                <span className="font-medium">{user.mobile || 'N/A'}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            {filteredUsers.length === 0 && (
                <div className="text-center py-20 glass rounded-[2rem]">
                    <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium text-lg">No users found.</p>
                </div>
            )}
        </div>
    );
};

export default UserList;

