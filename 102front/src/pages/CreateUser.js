import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';

const InputField = ({ label, icon: Icon, type, name, value, onChange, placeholder, required = true }) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-secondary tracking-tight ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                required={required}
            />
        </div>
    </div>
);

const CreateUser = ({ role = 'user' }) => {
    const [formData, setFormData] = useState({
        name: '', mobile: '', email: '', gender: 'Male',
        birthdate: '', date_of_joining: '', username: '',
        password: '', confirmPassword: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        try {
            await api.post('/users', { ...formData, role });
            setStatus({ type: 'success', message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!` });
            setFormData({
                name: '', mobile: '', email: '', gender: 'Male',
                birthdate: '', date_of_joining: '', username: '',
                password: '', confirmPassword: ''
            });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to create user' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-[2rem] p-10 border border-white/50 shadow-2xl"
            >
                <div className="flex items-center space-x-4 mb-10">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-secondary tracking-tight">Create {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
                        <p className="text-gray-500 font-medium">Fill in the details to add a new {role} to the system.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InputField label="Name" icon={User} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                        <InputField label="Mobile No" icon={Phone} type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="+1 234 567 890" />
                        <InputField label="Email ID" icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                        
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-secondary tracking-tight ml-1">Gender <span className="text-red-500">*</span></label>
                            <div className="flex items-center space-x-6 p-4 bg-white/50 border border-gray-200 rounded-2xl h-[60px] shadow-sm">
                                {['Male', 'Female'].map(g => (
                                    <label key={g} className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={g}
                                            checked={formData.gender === g}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-primary focus:ring-primary border-gray-300 transition-all"
                                        />
                                        <span className="text-gray-600 font-medium group-hover:text-primary transition-colors">{g}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <InputField label="Birthdate" icon={Calendar} type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />
                        <InputField label="Date of Joining" icon={Calendar} type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} />
                        <InputField label="Username" icon={User} type="text" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe123" />
                        <InputField label="Password" icon={Key} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
                        <InputField label="Confirm Password" icon={Key} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
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

                    <div className="flex items-center space-x-4 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="flex-1 py-4 gradient-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                        >
                            Create {role.charAt(0).toUpperCase() + role.slice(1)}
                        </motion.button>
                        <button
                            type="button"
                            onClick={() => setFormData({ name: '', mobile: '', email: '', gender: 'Male', birthdate: '', date_of_joining: '', username: '', password: '', confirmPassword: '' })}
                            className="px-10 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateUser;
