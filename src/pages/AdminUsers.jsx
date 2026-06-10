import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../utils/ThemeContext';
import Sidebar from '../components/Sidebar';

import {
    ArrowLeft, Search, User, Mail, Phone,
    Shield, Trash2, Edit2, CheckCircle,
    Activity, Moon, Sun, LogOut, Filter, UserCheck
} from 'lucide-react';

const AdminUsers = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/users');
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        const token = localStorage.getItem('adminToken');
        const role = localStorage.getItem('userRole');
        if (!token || role !== 'admin') {
            navigate('/admin/login');
            return;
        }

        fetchUsers();

        // Polling users list every 20 seconds for live database updates
        const interval = setInterval(() => {
            fetchUsers();
        }, 20000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/admin/login');
    };

    const filteredUsers = users.filter(u => 
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8f9fc] dark:bg-[#0b1120]">
                <div className="h-12 w-12 animate-spin rounded-xl border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0b1120] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden" dir="rtl">
            <Sidebar />
            
            {/* Header */}
            <header className={`sticky top-0 z-50 w-full transition-all duration-500 md:pr-72 ${scrolled ? 'border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-[#0b1120]/70 backdrop-blur-2xl py-3' : 'bg-transparent py-6'}`}>
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 sm:px-10">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate('/admin')} className="h-11 w-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl">
                            <Activity className="h-7 w-7" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">إدارة المستخدمين</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleDarkMode} className="h-11 w-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button onClick={handleLogout} className="flex h-11 items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-5 text-xs font-black text-red-600 transition-all hover:bg-red-600 hover:text-white">
                            <LogOut size={20} />
                            <span className="hidden sm:inline">خروج</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10 md:mr-72">
                {/* Stats & Search */}
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 lg:w-96">
                            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="بحث عن مستخدم بالاسم أو البريد..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold outline-none focus:border-blue-500 shadow-sm"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 overflow-x-auto pb-2 sm:pb-0">
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-w-max">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><User size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">إجمالي المسجلين</p>
                                <p className="text-xl font-black">{users.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-w-max">
                            <div className="h-10 w-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center"><UserCheck size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">مستخدمين نشطين</p>
                                <p className="text-xl font-black">{users.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="rounded-[40px] border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 shadow-sm backdrop-blur-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">المستخدم</th>
                                    <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">التواصل</th>
                                    <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">تاريخ الانضمام</th>
                                    <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">الحالة</th>
                                    <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id_users} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-6 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
                                                    {user.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white">{user.full_name}</p>
                                                    <p className="text-[11px] font-bold text-slate-400">ID: #{user.id_users}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="space-y-1">
                                                <p className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                    <Mail size={14} className="text-slate-300" /> {user.email}
                                                </p>
                                                <p className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                    <Phone size={14} className="text-slate-300" /> {user.phone}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 font-bold text-sm text-slate-500">
                                            {new Date(user.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black bg-green-500/10 text-green-500">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                نشط
                                            </span>
                                        </td>
                                        <td className="py-6 px-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-slate-400 font-bold">لا يوجد مستخدمين مطابقين للبحث</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminUsers;
