import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, Calendar, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';

const ExportData = ({ type = 'timesheets' }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [data, setData] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSearch = async () => {
        if (!startDate || !endDate) {
            setStatus({ type: 'error', message: 'Please select a date range' });
            return;
        }

        try {
            const response = await api.get(`/${type}/export`, { params: { startDate, endDate } });
            setData(response.data);
            if (response.data.length === 0) {
                setStatus({ type: 'info', message: 'No records found for this period' });
            } else {
                setStatus({ type: 'success', message: `Found ${response.data.length} records` });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to fetch data' });
        }
    };

    const handleDownload = () => {
        if (data.length === 0) return;
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${type}_export_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <FileSpreadsheet className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-secondary tracking-tight capitalize">{type} Report</h2>
                    <p className="text-gray-500 font-medium">Generate and download {type} reports.</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-[2rem] p-10 border border-white/50 shadow-2xl"
            >
                <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-secondary tracking-tight ml-1 flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>*{type.charAt(0).toUpperCase() + type.slice(1, -1)} From Date</span>
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-6 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-secondary tracking-tight ml-1 flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>*{type.charAt(0).toUpperCase() + type.slice(1, -1)} To Date</span>
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-6 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-10">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSearch}
                        className="px-10 py-4 gradient-primary text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center space-x-2"
                    >
                        <Search className="w-5 h-5" />
                        <span>Search</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownload}
                        disabled={data.length === 0}
                        className={`px-10 py-4 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                            data.length > 0 
                            ? 'bg-blue-400 text-white shadow-xl shadow-blue-400/20 hover:bg-blue-500' 
                            : 'bg-blue-400/50 text-white/70 cursor-not-allowed'
                        }`}
                    >
                        <Download className="w-5 h-5" />
                        <span>Export to Excel</span>
                    </motion.button>
                </div>

                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl flex items-center space-x-3 mb-10 ${
                            status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            status.type === 'info' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            'bg-red-50 text-red-600 border border-red-100'
                        }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="font-bold">{status.message}</p>
                    </motion.div>
                )}

                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-secondary">ID</th>
                                <th className="px-6 py-4 text-sm font-bold text-secondary">User</th>
                                <th className="px-6 py-4 text-sm font-bold text-secondary">Date</th>
                                {type === 'timesheets' ? (
                                    <>
                                        <th className="px-6 py-4 text-sm font-bold text-secondary">Project</th>
                                        <th className="px-6 py-4 text-sm font-bold text-secondary">Hours</th>
                                    </>
                                ) : (
                                    <th className="px-6 py-4 text-sm font-bold text-secondary">Amount</th>
                                )}
                                <th className="px-6 py-4 text-sm font-bold text-secondary">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-white/50 transition-all">
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-secondary">{item.user_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                                    {type === 'timesheets' ? (
                                        <>
                                            <td className="px-6 py-4 text-sm text-primary font-medium">{item.project_name}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-secondary">{item.hours}h</td>
                                        </>
                                    ) : (
                                        <td className="px-6 py-4 text-sm font-bold text-emerald-500">${item.amount}</td>
                                    )}
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{item.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {data.length === 0 && (
                        <div className="text-center py-20 bg-white/30">
                            <FileSpreadsheet className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">No data to display. Please search for a date range.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ExportData;
