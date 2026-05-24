import React, { useState, useEffect } from 'react';
import { useTheme } from '../utils/ThemeContext';

import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    LogOut, Users, Ticket, DollarSign, TrendingUp,
    Calendar, CheckCircle, Clock, XCircle, Plane, ArrowUpRight, Search, Activity, Layers, BarChart3, MapPin,
    Globe, Bell, Settings, User, MoreHorizontal, ArrowLeft, Filter,
    Moon, Sun, Shield
} from 'lucide-react';


const AdminDashboard = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleDarkMode } = useTheme();

    const [loading, setLoading] = useState(true);
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [pendingPayments, setPendingPayments] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ─── Data Sections ───────────────────────────────────────
    const ticketsByDestination = [
        { destination: 'القاهرة', count: 45 },
        { destination: 'دبي', count: 38 },
        { destination: 'الرياض', count: 52 },
        { destination: 'جدة', count: 30 },
        { destination: 'إسطنبول', count: 25 },
    ];

    const salesByDay = [
        { day: 'الأحد', sales: 12500 },
        { day: 'الاثنين', sales: 14800 },
        { day: 'الثلاثاء', sales: 13200 },
        { day: 'الأربعاء', sales: 16700 },
        { day: 'الخميس', sales: 18900 },
        { day: 'الجمعة', sales: 15200 },
        { day: 'السبت', sales: 14300 },
    ];

    const salesByMonth = [
        { month: 'يناير', sales: 450000 },
        { month: 'فبراير', sales: 520000 },
        { month: 'مارس', sales: 610000 },
        { month: 'أبريل', sales: 580000 },
        { month: 'مايو', sales: 690000 },
        { month: 'يونيو', sales: 750000 },
    ];

    const bookingsByClass = [
        { name: 'درجة أولى', value: 120, color: '#f59e0b' },
        { name: 'درجة رجال الأعمال', value: 85, color: '#3b82f6' },
        { name: 'درجة اقتصادية', value: 320, color: '#10b981' },
    ];

    const bookingsByAirline = [
        { name: 'اليمنية', value: 210, color: '#ef4444' },
        { name: 'القطيبي', value: 155, color: '#8b5cf6' },
        { name: 'سبأ', value: 160, color: '#06b6d4' },
    ];

    const topDestinations = [
        { destination: 'الرياض', count: 52 },
        { destination: 'القاهرة', count: 45 },
        { destination: 'دبي', count: 38 },
        { destination: 'جدة', count: 30 },
        { destination: 'إسطنبول', count: 25 },
    ];

    const paymentStatus = [
        { status: 'مدفوع', count: 312, icon: CheckCircle, color: 'blue', grad: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600', bg: 'bg-blue-500/10' },
        { status: 'قيد الانتظار', count: 28, icon: Clock, color: 'yellow', grad: 'from-amber-500 to-orange-600', textColor: 'text-yellow-600', bg: 'bg-yellow-500/10' },
        { status: 'ملغي', count: 12, icon: XCircle, color: 'red', grad: 'from-red-500 to-rose-600', textColor: 'text-red-600', bg: 'bg-red-500/10' },
    ];

    const recentBookings = [
        { id: 'YB-9921', user: 'أحمد صالح', destination: 'القاهرة', airline: 'اليمنية', status: 'مدفوع', price: '$450' },
        { id: 'YB-8832', user: 'سارة خالد', destination: 'دبي', airline: 'القطيبي', status: 'قيد الانتظار', price: '$320' },
        { id: 'YB-7741', user: 'محمد علي', destination: 'الرياض', airline: 'سبأ', status: 'مدفوع', price: '$280' },
        { id: 'YB-6612', user: 'فاطمة حسن', destination: 'جدة', airline: 'اليمنية', status: 'ملغي', price: '$510' },
    ];

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const role = localStorage.getItem('userRole');
        if (!token || role !== 'admin') {
            navigate('/company/login');
            return;
        }

        const timer = setTimeout(() => {
            setTotalTickets(352);
            setTotalRevenue(1250000);
            setPendingPayments(28);
            setLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userRole');
        navigate('/company/login');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8f9fc] dark:bg-[#0b1120]">
                <div className="text-center">
                    <div className="h-16 w-16 animate-spin rounded-[24px] border-4 border-[#4974f9] border-t-transparent mx-auto shadow-xl shadow-blue-500/20"></div>
                    <p className="mt-6 text-sm font-black text-slate-400 animate-pulse tracking-widest uppercase">تجهيز المحرك التحليلي...</p>
                </div>
            </div>
        );
    }

    const successRate = totalTickets > 0 ? (paymentStatus[0].count / totalTickets) : 0;
    const circumference = 276.46; // لـ r=44
    const dashOffset = circumference * (1 - successRate);

    return (
        <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0b1120] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden" dir="rtl">

            {/* ─── Aesthetic Mesh Decor ────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-500/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* ─── Premium Header ───────────────────────────────────── */}
            <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${scrolled ? 'border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-[#0b1120]/70 backdrop-blur-2xl py-3' : 'bg-transparent py-6'}`}>
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 sm:px-10">
                    <div className="flex items-center gap-5">
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/20">
                            <Activity className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                نظام الإدارة <span className="text-blue-600 bg-blue-600/10 px-3 py-1 rounded-xl text-sm font-black uppercase">Admin</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center relative group">
                            <Search className="absolute right-4 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="بحث سريع..."
                                className="w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pr-12 pl-4 text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                             <button 
                                onClick={toggleDarkMode}
                                className="h-11 w-11 flex items-center justify-center rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 transition-all shadow-sm"
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button className="h-11 w-11 flex items-center justify-center rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 transition-all shadow-sm">
                                <Bell size={20} />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="group flex h-11 items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-5 text-xs font-black text-red-600 transition-all hover:bg-red-500 hover:text-white"
                            >
                                <LogOut size={20} />
                                <span className="hidden sm:inline">خروج</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* ─── Hero Welcome Section ─────────────────────────────── */}
                <div className="mb-14 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[45px] p-12 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 space-y-4 text-center md:text-right">
                        <h2 className="text-4xl font-black tracking-tight">أهلاً بك مجدداً! 👋</h2>
                        <p className="text-blue-100 font-bold text-lg max-w-xl">نظام إدارة الرحلات والبيانات المركزي - YBF. تحكم كامل في كافة العمليات والشركاء.</p>
                        <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                            <button className="px-6 py-3 bg-white text-blue-600 rounded-2xl text-xs font-black shadow-xl hover:scale-105 transition-all">تصدير التقارير</button>
                            <button
                                onClick={() => navigate('/admin/users')}
                                className="px-6 py-3 bg-blue-500/30 backdrop-blur-md border border-white/20 text-white rounded-2xl text-xs font-black hover:bg-blue-500/50 transition-all"
                            >
                                إدارة المستخدمين
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 h-48 w-48 bg-white/10 rounded-[40px] backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center animate-pulse">
                        <TrendingUp size={64} className="text-white mb-2" />
                        <span className="text-3xl font-black">+12.5%</span>
                        <span className="text-[10px] font-black uppercase opacity-60">معدل النمو</span>
                    </div>
                </div>

                {/* ─── Stats Banner ─────────────────────────────────────── */}
                <div className="mb-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'إجمالي التذاكر', value: totalTickets, icon: Ticket, grad: 'from-blue-500 to-indigo-600', trend: '+12.5%' },
                        { label: 'الإيرادات الكلية', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, grad: 'from-emerald-500 to-teal-600', trend: '+8.2%' },
                        { label: 'مدفوعات معلقة', value: pendingPayments, icon: Clock, grad: 'from-amber-500 to-orange-600', trend: '-2.1%' },
                        { label: 'إدارة المستخدمين', value: '1,248', icon: Users, grad: 'from-violet-500 to-purple-600', trend: '+18.5%', link: '/admin/users' },
                    ].map((stat, i) => (
                        <div 
                            key={i} 
                            onClick={() => stat.link && navigate(stat.link)}
                            className={`group relative overflow-hidden rounded-[45px] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-10 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-3 backdrop-blur-md ${stat.link ? 'cursor-pointer' : ''}`}
                        >
                            <div className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${stat.grad} opacity-5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-15`} />
                            <div className="relative z-10 flex items-center justify-between">
                                <div className={`flex h-18 w-18 items-center justify-center rounded-[24px] bg-slate-50 dark:bg-slate-800 text-slate-400 transition-all duration-700 group-hover:bg-gradient-to-br ${stat.grad} group-hover:text-white group-hover:rotate-12 group-hover:shadow-lg`}>
                                    <stat.icon className="h-9 w-9" />
                                </div>
                                <div className="text-left">
                                    <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black">{stat.trend}</div>
                                </div>
                            </div>
                            <div className="relative z-10 mt-8">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                                <h3 className="text-4xl font-black tracking-tight">{stat.value}</h3>
                            </div>
                            <div className={`absolute bottom-0 right-0 h-1.5 w-0 bg-gradient-to-l ${stat.grad} transition-all duration-700 group-hover:w-full`} />
                        </div>
                    ))}
                </div>

                {/* ─── Charts Grid ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* 1. الوجهات */}
                    <div className="group rounded-[50px] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-10 shadow-sm hover:shadow-xl transition-all backdrop-blur-xl">
                        <h2 className="flex items-center gap-4 text-xl font-black mb-10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                                <MapPin className="h-7 w-7" />
                            </div>
                            تحليل الوجهات الأكثر طلباً
                        </h2>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ticketsByDestination}>
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4974f9" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                                    <XAxis dataKey="destination" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 900, fill: '#94a3b8' }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="url(#barGrad)" radius={[15, 15, 0, 0]} barSize={45} name="عدد التذاكر" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. الدرجات */}
                    <div className="group rounded-[50px] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-10 shadow-sm hover:shadow-xl transition-all backdrop-blur-xl">
                        <h2 className="flex items-center gap-4 text-xl font-black mb-10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                                <Layers className="h-7 w-7" />
                            </div>
                            توزيع فئات درجات السفر
                        </h2>
                        <div className="h-[350px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={bookingsByClass} cx="50%" cy="50%" innerRadius={100} outerRadius={140} paddingAngle={10} dataKey="value" stroke="none">
                                        {bookingsByClass.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">إجمالي الحجوزات</span>
                                <span className="text-4xl font-black text-slate-900 dark:text-white mt-1">{bookingsByClass.reduce((a, b) => a + b.value, 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. المبيعات اليومية */}
                    <div className="group rounded-[50px] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-10 shadow-sm hover:shadow-xl transition-all backdrop-blur-xl">
                        <h2 className="flex items-center gap-4 text-xl font-black mb-10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                                <Calendar className="h-7 w-7" />
                            </div>
                            المبيعات اليومية (الأسبوع الحالي)
                        </h2>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesByDay}>
                                    <defs>
                                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 900, fill: '#94a3b8' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={5} fill="url(#areaGrad)" name="المبيعات" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 4. المبيعات الشهرية */}
                    <div className="group rounded-[50px] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-10 shadow-sm hover:shadow-xl transition-all backdrop-blur-xl">
                        <h2 className="flex items-center gap-4 text-xl font-black mb-10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                                <BarChart3 className="h-7 w-7" />
                            </div>
                            الأداء الشهري العام
                        </h2>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesByMonth}>
                                    <defs>
                                        <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 900, fill: '#94a3b8' }} />
                                    <Tooltip />
                                    <Bar dataKey="sales" fill="url(#monthGrad)" radius={[12, 12, 0, 0]} barSize={40} name="المبيعات" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 5. الوجهات الأكثر طلباً - جديد من التحديث */}
                    <div className="group rounded-[50px] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-10 shadow-sm hover:shadow-xl transition-all backdrop-blur-xl">
                        <h2 className="flex items-center gap-4 text-xl font-black mb-10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                                <TrendingUp className="h-7 w-7" />
                            </div>
                            أكثر الوجهات طلباً (تحليل تفصيلي)
                        </h2>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topDestinations} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" opacity={0.5} />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} />
                                    <YAxis type="category" dataKey="destination" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 900, fill: '#94a3b8' }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#ef4444" radius={[0, 10, 10, 0]} barSize={30} name="عدد الحجوزات" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 6. الشركات */}
                    <div className="group rounded-[50px] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-10 shadow-sm hover:shadow-xl transition-all backdrop-blur-xl">
                        <h2 className="flex items-center gap-4 text-xl font-black mb-10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                                <Plane className="h-7 w-7" />
                            </div>
                            توزيع حصص شركات الطيران
                        </h2>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={bookingsByAirline} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value" stroke="none">
                                        {bookingsByAirline.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>


                {/* ─── Cashflow Monitor ─────────────────────────────────── */}
                <div className="mt-14 rounded-[60px] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 p-14 shadow-sm relative overflow-hidden backdrop-blur-3xl">
                    <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />
                    <div className="mb-16 text-center sm:text-right relative z-10">
                        <h2 className="text-4xl font-black tracking-tight mb-3">متابعة الأرصدة والتحصيل</h2>
                        <p className="text-slate-400 font-bold text-lg max-w-2xl">نظام ذكي لمراقبة التدفقات المالية لحظة بلحظة لضمان استقرار العمليات.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-3 relative z-10">
                        {paymentStatus.map((item, i) => (
                            <div key={i} className="group flex flex-col items-center justify-center rounded-[45px] bg-slate-50/50 dark:bg-slate-800/40 p-12 text-center transition-all hover:scale-105 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-2xl">
                                <div className={`relative mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-white dark:bg-slate-900 shadow-xl ${item.textColor} group-hover:scale-110 transition-transform`}>
                                    <div className={`absolute inset-0 rounded-[32px] bg-gradient-to-br ${item.grad} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    <item.icon size={48} className="relative z-10 group-hover:text-white transition-colors" />
                                </div>
                                <p className="text-6xl font-black mb-3 tracking-tighter tabular-nums">{item.count}</p>
                                <p className="text-[11px] font-black uppercase tracking-[5px] text-slate-400 opacity-70">{item.status}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 flex flex-col items-center justify-between gap-16 border-t border-slate-100 dark:border-slate-800 pt-16 lg:flex-row relative z-10">
                        <div className="flex items-center gap-8 bg-white/50 dark:bg-slate-800/50 p-6 rounded-[35px] border border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                            <div className="h-20 w-20 flex items-center justify-center rounded-3xl bg-[#4974f9] text-white shadow-xl shadow-blue-500/30"><Ticket size={40} /></div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">إجمالي التذاكر المصدرة</p>
                                <h4 className="text-4xl font-black text-slate-900 dark:text-white mt-1">{totalTickets}</h4>
                            </div>
                        </div>

                        <div className="relative h-44 w-44 flex items-center justify-center group">
                            <svg className="h-44 w-44 -rotate-90 relative z-10" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="44" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-800" />
                                <circle cx="50" cy="50" r="44" fill="transparent" stroke="url(#gaugeGrad)" strokeWidth="8" strokeDasharray="276.46" strokeDashoffset={276.46 * (1 - successRate)} strokeLinecap="round" className="transition-all duration-1000 ease-out shadow-2xl" />
                                <defs><linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4974f9" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">{Math.round(successRate * 100)}%</span>
                                <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest mt-1">كفاءة</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 bg-white/50 dark:bg-slate-800/50 p-6 rounded-[35px] border border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                            <div className="text-left lg:text-right">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">معدل التحصيل السنوي</p>
                                <h4 className="text-4xl font-black text-green-500 mt-1">ممتاز</h4>
                            </div>
                            <div className="h-20 w-20 flex items-center justify-center rounded-3xl bg-green-500 text-white shadow-xl shadow-green-500/30"><TrendingUp size={40} /></div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="mx-auto max-w-[1400px] px-10 py-16 mt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
                <div className="flex items-center gap-4"><Activity size={24} className="text-blue-500" /><span className="text-xs font-black text-slate-400 uppercase tracking-widest">© 2026 Yemen Booking Flight</span></div>
                <div className="flex gap-8">{['الدعم الفني', 'سياسة الأمان', 'سجل النشاطات'].map(item => (<a key={item} href="#" className="text-xs font-black text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest">{item}</a>))}</div>
            </footer>
        </div>
    );
};

export default AdminDashboard;
