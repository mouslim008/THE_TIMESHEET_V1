import React, { useEffect, useState } from 'react';
import { Paperclip, Upload, Download, Trash2, AlertCircle } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIdx = 0;
    while (value >= 1024 && unitIdx < units.length - 1) {
        value /= 1024;
        unitIdx += 1;
    }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIdx]}`;
};

const WorkAttachments = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const canDeleteAny = user?.role === 'admin' || user?.role === 'superadmin';

    const loadAttachments = async () => {
        try {
            const res = await api.get('/work-attachments');
            setAttachments(res.data || []);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to load attachments.' });
        }
    };

    useEffect(() => {
        loadAttachments();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a file first.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await api.post('/work-attachments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFile(null);
            const input = document.getElementById('work-attachment-file');
            if (input) input.value = '';
            setStatus({ type: 'success', message: 'Attachment uploaded successfully.' });
            await loadAttachments();
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Upload failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            const res = await api.get(`/work-attachments/${id}/download`, { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', fileName || `attachment-${id}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Download failed.' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/work-attachments/${id}`);
            setStatus({ type: 'success', message: 'Attachment deleted.' });
            await loadAttachments();
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Delete failed.' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Paperclip className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight">Work Attachments</h2>
                    <p className="text-gray-500">
                        {user?.role === 'user'
                            ? 'Upload proof of work for admin review.'
                            : 'Review, download, and manage user work attachments.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleUpload} className="glass rounded-3xl p-6 border border-white/50 shadow-xl space-y-4">
                <label className="text-sm font-bold text-secondary">Attach file</label>
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        id="work-attachment-file"
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 gradient-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 disabled:opacity-60"
                    >
                        <span className="inline-flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            {loading ? 'Uploading...' : 'Upload'}
                        </span>
                    </button>
                </div>
            </form>

            {status.message && (
                <div className={`${status.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'} border px-5 py-3 rounded-2xl flex items-center space-x-2`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold text-sm">{status.message}</span>
                </div>
            )}

            <div className="glass rounded-3xl p-6 border border-white/50 shadow-xl">
                <h3 className="text-xl font-bold text-secondary mb-4">Uploaded Files</h3>
                <div className="space-y-3">
                    {attachments.length === 0 && (
                        <p className="text-gray-400 text-sm">No attachments found.</p>
                    )}
                    {attachments.map((item) => {
                        const canDelete = canDeleteAny || item.user_id === user?.id;
                        return (
                            <div key={item.id} className="bg-white/70 border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <p className="font-bold text-secondary">{item.original_name}</p>
                                    <p className="text-xs text-gray-500">
                                        By {item.uploaded_by} ({item.uploader_role}) • {formatBytes(item.file_size)} • {new Date(item.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownload(item.id, item.original_name)}
                                        className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-all"
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            <Download className="w-4 h-4" />
                                            Download
                                        </span>
                                    </button>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all"
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WorkAttachments;
