import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Calendar, Shield, Save, CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api';

const UserProfile = () => {
    const { user } = useAuth();
    const [editProfile, setEditProfile] = useState({ ...user });
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/user/profile', editProfile);
            setStatus({ type: 'success', message: 'Profile updated successfully! Please relogin to see changes.' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to update profile. Please try again.' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Profile Settings</h2>
                    <p className="text-gray-500 font-medium">Manage your personal information and account security.</p>
                </div>
            </div>

            <div className="glass rounded-[3rem] p-12 border border-white/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <User className="w-64 h-64 text-primary" />
                </div>
                
                <form onSubmit={handleProfileUpdate} className="space-y-10 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <ProfileInputField label="Full Name" icon={User} type="text" value={editProfile.name} onChange={(val) => setEditProfile({...editProfile, name: val})} />
                        <ProfileInputField label="Username" icon={User} type="text" value={editProfile.username} onChange={(val) => setEditProfile({...editProfile, username: val})} />
                        <ProfileInputField label="Email Address" icon={Mail} type="email" value={editProfile.email} onChange={(val) => setEditProfile({...editProfile, email: val})} />
                        <ProfileInputField label="Mobile Number" icon={Phone} type="text" value={editProfile.mobile || ''} onChange={(val) => setEditProfile({...editProfile, mobile: val})} />
                        
                        <div className="space-y-3">
                            <label className="text-sm font-black text-secondary uppercase tracking-widest ml-1">Gender</label>
                            <div className="relative group">
                                <select 
                                    className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-secondary appearance-none cursor-pointer"
                                    value={editProfile.gender || ''}
                                    onChange={(e) => setEditProfile({...editProfile, gender: e.target.value})}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <ProfileInputField label="Birth Date" icon={Calendar} type="date" value={editProfile.birthdate ? editProfile.birthdate.split('T')[0] : ''} onChange={(val) => setEditProfile({...editProfile, birthdate: val})} />
                    </div>

                    <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 flex items-start space-x-4">
                        <Info className="w-6 h-6 text-primary mt-1" />
                        <p className="text-sm text-primary font-bold leading-relaxed">
                            For security reasons, some fields like Role or Date of Joining cannot be modified by users. If you need to change these, please contact your administrator.
                        </p>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button 
                            type="submit" 
                            className="flex items-center space-x-3 px-10 py-5 gradient-primary text-white font-black rounded-3xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 text-lg"
                        >
                            <Save className="w-6 h-6" />
                            <span>Save Profile Changes</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Status Notifications */}
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

const ProfileInputField = ({ label, icon: Icon, type, value, onChange }) => (
    <div className="space-y-3">
        <label className="text-sm font-black text-secondary uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Icon className="w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-secondary shadow-sm"
                required
            />
        </div>
    </div>
);

export default UserProfile;
