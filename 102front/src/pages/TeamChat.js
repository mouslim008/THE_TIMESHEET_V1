import React, { useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const TeamChat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');

    const loadMessages = async () => {
        try {
            const res = await api.get('/chat/messages');
            setMessages(res.data || []);
        } catch (err) {
            console.error('Failed to load chat messages', err);
        }
    };

    useEffect(() => {
        loadMessages();
        const intervalId = setInterval(loadMessages, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const sendMessage = async () => {
        const payload = text.trim();
        if (!payload) return;
        try {
            await api.post('/chat/messages', { message: payload });
            setText('');
            await loadMessages();
        } catch (err) {
            console.error('Failed to send chat message', err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Team Chat</h2>
                    <p className="text-gray-500">Local chat for users, admins, and super admin.</p>
                </div>
            </div>

            <div className="glass rounded-[2.5rem] p-8 border border-white/50 shadow-xl space-y-6">
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                    {messages.map((msg) => {
                        const mine = msg.sender_id === user?.id;
                        return (
                            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`${mine ? 'gradient-primary text-white rounded-tr-none' : 'bg-gray-50 border border-gray-100 text-secondary rounded-tl-none'} p-4 rounded-2xl max-w-[85%]`}>
                                    <p className="text-sm font-medium">{msg.message}</p>
                                    <span className={`text-[10px] mt-2 block font-bold uppercase ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                                        {mine ? 'You' : `${msg.sender_name} (${msg.sender_role})`} • {new Date(msg.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {messages.length === 0 && <p className="text-gray-400 text-sm">No messages yet.</p>}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center space-x-3">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        className="p-3 gradient-primary text-white rounded-2xl shadow-lg hover:shadow-primary/40 transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamChat;
