import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ShieldCheck, RefreshCcw } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(result);
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (captchaInput.toUpperCase() !== captcha) {
            setError('Invalid Captcha');
            return;
        }

        try {
            const response = await api.post('/login', { username, password });
            login(response.data.user, response.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-3xl p-8 shadow-2xl space-y-8">
                    <div className="text-center">
                        <motion.div 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 gradient-primary rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg"
                        >
                            <ShieldCheck className="w-12 h-12 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-secondary tracking-tight">Time Manager</h1>
                        <p className="text-gray-500 mt-2">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                        placeholder="Enter Captcha"
                                        className="w-full px-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="bg-secondary/5 px-6 py-4 rounded-2xl font-mono text-2xl tracking-widest text-secondary font-bold select-none italic border border-white">
                                        {captcha}
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={generateCaptcha}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <RefreshCcw className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.p 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="text-red-500 text-sm font-medium text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-4 gradient-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center space-x-2"
                        >
                            <span>Sign in To Account</span>
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
