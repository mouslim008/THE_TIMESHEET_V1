import React, { useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const UserCollaboration = () => {
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
            console.error('Failed to send message', err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Collaboration</h2>
                    <p className="text-gray-500 font-medium">
                        Chat locally with admins and super admin. Attachments are managed in Work Attachments.
                    </p>
                </div>
            </div>

            <div className="glass rounded-[2.5rem] p-10 border border-white/50 shadow-xl space-y-8 flex flex-col h-full">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-secondary tracking-tight">Team Chat</h2>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-4 max-h-[460px]">
                    {messages.map((msg) => {
                        const mine = msg.sender_id === user?.id;
                        return (
                            <div key={msg.id} className={`flex items-start ${mine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`${mine ? 'gradient-primary text-white rounded-tr-none' : 'bg-gray-50 text-secondary rounded-tl-none border border-gray-100'} p-4 rounded-2xl max-w-[80%]`}>
                                    <p className="text-sm font-medium">{msg.message}</p>
                                    <span className={`text-[10px] mt-2 block font-bold uppercase ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                                        {mine ? 'You' : `${msg.sender_name} (${msg.sender_role})`} • {new Date(msg.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {messages.length === 0 && (
                        <p className="text-gray-400 text-sm">No messages yet.</p>
                    )}
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center space-x-4">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    />
                    <button onClick={sendMessage} className="p-4 gradient-primary text-white rounded-2xl shadow-lg hover:shadow-primary/40 transition-all active:scale-95">
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserCollaboration;
