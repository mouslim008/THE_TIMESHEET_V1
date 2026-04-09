import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Send, User, Users, Search, CheckCircle2, AlertCircle, X } from 'lucide-react';
import api from '../api';

const Notify = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isGlobal, setIsGlobal] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users-by-role/user');
                setUsers(response.data);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        if (!isGlobal && !selectedUser) {
            setStatus({ type: 'error', message: 'Please select a user or choose global notification.' });
            return;
        }

        try {
            await api.post('/notifications', {
                message: message,
                user_id: isGlobal ? null : selectedUser.id
            });
            setStatus({ type: 'success', message: 'Notification sent successfully!' });
            setMessage('');
            setSelectedUser(null);
            setIsGlobal(false);
            
            // Clear status after delay
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to send notification.' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Notify Users</h2>
                    <p className="text-gray-500 font-medium">Send alerts, reminders, and updates to your team.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Selection Section */}
                <div className="glass rounded-[2.5rem] p-8 border border-white/50 shadow-xl space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-secondary">Target Audience</h3>
                        </div>
                        <button 
                            onClick={() => {
                                setIsGlobal(!isGlobal);
                                setSelectedUser(null);
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                isGlobal ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                            {isGlobal ? 'Global Notification Active' : 'Make Global Notification'}
                        </button>
                    </div>

                    {!isGlobal && (
                        <>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredUsers.map(user => (
                                    <motion.div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center space-x-4 ${
                                            selectedUser?.id === user.id 
                                            ? 'bg-primary/5 border-primary shadow-md' 
                                            : 'bg-white/50 border-gray-100 hover:border-primary/30'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                                            selectedUser?.id === user.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-secondary">{user.name}</p>
                                            <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                                        </div>
                                        {selectedUser?.id === user.id && (
                                            <div className="p-2 bg-primary/20 rounded-full">
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}

                    {isGlobal && (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <Users className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-secondary">Broadcasting to Everyone</h4>
                                <p className="text-gray-400 font-medium">This notification will be visible to all users on the platform.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Message Composition Section */}
                <div className="glass rounded-[2.5rem] p-8 border border-white/50 shadow-xl space-y-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                            <Send className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-secondary">Compose Message</h3>
                    </div>

                    <form onSubmit={handleSendNotification} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-secondary tracking-tight ml-1">Notification Content</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your notification message here..."
                                rows="8"
                                className="w-full p-6 bg-white/50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none shadow-sm"
                                required
                            />
                        </div>

                        {selectedUser && !isGlobal && (
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-bold text-secondary">To: {selectedUser.name}</span>
                                </div>
                                <button type="button" onClick={() => setSelectedUser(null)}>
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                </button>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={!message.trim() || (!isGlobal && !selectedUser)}
                            className="w-full py-5 gradient-primary text-white font-black rounded-3xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-3 text-lg"
                        >
                            <Send className="w-6 h-6" />
                            <span>Dispatch Notification</span>
                        </button>
                    </form>

                    <AnimatePresence>
                        {status.message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`p-4 rounded-2xl flex items-center space-x-3 border-2 ${
                                    status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                                }`}
                            >
                                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <span className="font-bold text-sm">{status.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Notify;
