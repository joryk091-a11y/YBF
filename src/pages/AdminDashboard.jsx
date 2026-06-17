import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../utils/ThemeContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    LogOut, Users, Ticket, DollarSign, TrendingUp,
    Calendar, CheckCircle, Clock, XCircle, Plane, ArrowUpRight, Search, Activity, Layers, BarChart3, MapPin,
    Globe, Bell, Settings, User, MoreHorizontal, ArrowLeft, Filter,
    Moon, Sun, Shield, Wallet, BookOpen, Plus, Trash2, Check, X, CreditCard, ChevronRight, Info,
    UserCheck, Mail, Phone, Building2, Printer
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const adminEmail = localStorage.getItem('adminEmail') || 'admin@ybf.com';
    const adminInitials = adminEmail.split('@')[0].slice(0, 2).toUpperCase();
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('userRole');

    const [activeTab, setActiveTab] = useState(() => {
        if (location.state && location.state.activeTab) {
            return location.state.activeTab;
        }
        return 'dashboard';
    });
    const [loading, setLoading] = useState(true);
    const [salesChartPeriod, setSalesChartPeriod] = useState('monthly'); // 'daily' or 'monthly'
    const [statsPeriod, setStatsPeriod] = useState('current_month'); // 'current_month' or 'current_year'
    const [stats, setStats] = useState({
        totalTickets: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        totalUsers: 0,
        activePassengers: 0,
        recentBookings: [],
        destinationsStats: [],
        monthlySales: [],
        dailySales: [],
        airlineStats: [],
        cancellationRate: 0,
        statusStats: [],
        classStats: [],
        aircraftStats: []
    });

    // Lists for other tabs
    const [flights, setFlights] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [companiesList, setCompaniesList] = useState([]);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [companyForm, setCompanyForm] = useState({
        id_admin: null,
        email: '',
        password: '',
        airline_code: 'IY'
    });
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [userForm, setUserForm] = useState({
        id_users: null,
        full_name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFlightDate, setSelectedFlightDate] = useState('');
    const [loadingList, setLoadingList] = useState(false);
    const [reportsSubTab, setReportsSubTab] = useState('logs'); // 'logs' or 'pdf_report'



    // Settings State (backed by localStorage)
    const [markupRate, setMarkupRate] = useState(() => localStorage.getItem('adminMarkupRate') || '5');
    const [exchangeRate, setExchangeRate] = useState(() => localStorage.getItem('adminExchangeRate') || '530');
    const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('adminSupportEmail') || 'support@ybf.com');
    const [showSettingsAlert, setShowSettingsAlert] = useState(false);

    // Alert states
    const [notificationMsg, setNotificationMsg] = useState(null);

    // Check auth
    useEffect(() => {
        if (!token || role !== 'admin') {
            navigate('/admin/login');
        }
    }, [navigate, token, role]);

    // Fetch Dashboard Stats
    const fetchDashboardStats = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/dashboard-stats?period=${statsPeriod}`);
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    }, [token, role, statsPeriod]);

    // Fetch Flights
    const fetchFlights = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoadingList(true);
        try {
            const url = selectedFlightDate 
                ? `http://localhost:8080/api/flights?date=${selectedFlightDate}` 
                : 'http://localhost:8080/api/flights';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setFlights(data.flights);
            }
        } catch (error) {
            console.error('Error fetching flights:', error);
        } finally {
            setLoadingList(false);
        }
    }, [token, role, selectedFlightDate]);

    // Fetch Bookings
    const fetchBookings = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoadingList(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/bookings');
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoadingList(false);
        }
    }, [token, role]);

    // Fetch Users
    const fetchUsers = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoadingList(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setUsersList(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingList(false);
        }
    }, [token, role]);

    // Fetch Companies
    const fetchCompanies = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoadingList(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/companies');
            const data = await res.json();
            if (data.success) {
                setCompaniesList(data.companies);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoadingList(false);
        }
    }, [token, role]);

    // Create new company
    const handleCreateCompany = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/admin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: companyForm.email,
                    password: companyForm.password,
                    airline_code: companyForm.airline_code
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم إضافة الشركة بنجاح!');
                setIsCompanyModalOpen(false);
                setCompanyForm({
                    id_admin: null,
                    email: '',
                    password: '',
                    airline_code: 'IY'
                });
                fetchCompanies();
            } else {
                showToast(data.error || 'حدث خطأ أثناء إضافة الشركة.');
            }
        } catch (error) {
            console.error(error);
            showToast('فشل الاتصال بالخادم.');
        }
    };

    // Update company
    const handleUpdateCompany = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8080/api/admin/companies/${companyForm.id_admin}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: companyForm.email,
                    password: companyForm.password,
                    airline_code: companyForm.airline_code
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم تحديث بيانات الشركة بنجاح!');
                setIsCompanyModalOpen(false);
                setCompanyForm({
                    id_admin: null,
                    email: '',
                    password: '',
                    airline_code: 'IY'
                });
                fetchCompanies();
            } else {
                showToast(data.error || 'حدث خطأ أثناء تحديث بيانات الشركة.');
            }
        } catch (error) {
            console.error(error);
            showToast('فشل الاتصال بالخادم.');
        }
    };

    // Delete company
    const handleDeleteCompany = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف حساب هذه الشركة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        try {
            const res = await fetch(`http://localhost:8080/api/admin/companies/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم حذف حساب الشركة بنجاح.');
                fetchCompanies();
            } else {
                showToast('حدث خطأ أثناء حذف الشركة.');
            }
        } catch (error) {
            console.error(error);
            showToast('خطأ في الاتصال بالخادم.');
        }
    };

    // Trigger loads on tab change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'dashboard') {
                fetchDashboardStats();
            } else if (activeTab === 'flights') {
                fetchFlights();
            } else if (activeTab === 'reports') {
                fetchBookings();
                fetchDashboardStats();
                fetchFlights();
            } else if (activeTab === 'statistics') {
                fetchDashboardStats();
            } else if (activeTab === 'users') {
                fetchUsers();
            } else if (activeTab === 'companies') {
                fetchCompanies();
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [activeTab, fetchDashboardStats, fetchFlights, fetchBookings, fetchUsers, fetchCompanies]);

    // Initial load
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDashboardStats();
            fetchUsers();
            fetchCompanies();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchDashboardStats, fetchUsers, fetchCompanies]);

    // Auto-refresh database data every 20 seconds for real-time reporting
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTab === 'dashboard' || activeTab === 'statistics' || activeTab === 'reports') {
                fetchDashboardStats();
            }
            if (activeTab === 'reports') {
                fetchBookings();
            }
            if (activeTab === 'flights' || activeTab === 'reports') {
                fetchFlights();
            }
            if (activeTab === 'users') {
                fetchUsers();
            }
            if (activeTab === 'companies') {
                fetchCompanies();
            }
        }, 20000); // 20 seconds
        return () => clearInterval(interval);
    }, [activeTab, fetchDashboardStats, fetchBookings, fetchFlights, fetchUsers, fetchCompanies]);





    // Create new user
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: userForm.full_name,
                    email: userForm.email,
                    phone: userForm.phone,
                    password: userForm.password
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم إضافة المستخدم بنجاح!');
                setIsUserModalOpen(false);
                setUserForm({
                    id_users: null,
                    full_name: '',
                    email: '',
                    phone: '',
                    password: ''
                });
                fetchUsers();
                fetchDashboardStats();
            } else {
                showToast(data.error || 'حدث خطأ أثناء إضافة المستخدم.');
            }
        } catch (error) {
            console.error(error);
            showToast('فشل الاتصال بالخادم.');
        }
    };

    // Update user
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${userForm.id_users}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: userForm.full_name,
                    email: userForm.email,
                    phone: userForm.phone,
                    password: userForm.password
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم تحديث بيانات المستخدم بنجاح!');
                setIsUserModalOpen(false);
                setUserForm({
                    id_users: null,
                    full_name: '',
                    email: '',
                    phone: '',
                    password: ''
                });
                fetchUsers();
            } else {
                showToast(data.error || 'حدث خطأ أثناء تحديث بيانات المستخدم.');
            }
        } catch (error) {
            console.error(error);
            showToast('فشل الاتصال بالخادم.');
        }
    };

    // Delete User
    const handleDeleteUser = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم حذف حساب المستخدم بنجاح.');
                fetchUsers();
                fetchDashboardStats();
            } else {
                showToast('حدث خطأ أثناء حذف الحساب.');
            }
        } catch (error) {
            console.error(error);
            showToast('خطأ في الاتصال بالخادم.');
        }
    };



    // Save Settings
    const handleSaveSettings = (e) => {
        e.preventDefault();
        localStorage.setItem('adminMarkupRate', markupRate);
        localStorage.setItem('adminExchangeRate', exchangeRate);
        localStorage.setItem('adminSupportEmail', supportEmail);
        setShowSettingsAlert(true);
        setTimeout(() => setShowSettingsAlert(false), 3000);
    };

    // Helper for toasts
    const showToast = (msg) => {
        setNotificationMsg(msg);
        setTimeout(() => setNotificationMsg(null), 4000);
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('adminEmail');
        navigate('/');
    };

    // Get airline badge/name
    const getAirlineName = (code) => {
        const airlines = {
            'IY': 'اليمنية (IY)',
            'QA': 'القطرية (QA)',
            'EK': 'الإماراتية (EK)',
            'WY': 'العمانية (WY)',
            'GF': 'الخليج (GF)'
        };
        return airlines[code] || code || 'غير معروف';
    };

    // Get destination full name
    const getDestinationName = (code) => {
        const destinations = {
            'CAI': 'القاهرة (CAI)',
            'DXB': 'دبي (DXB)',
            'RUH': 'الرياض (RUH)',
            'JED': 'جدة (JED)',
            'SAH': 'صنعاء (SAH)',
            'ADE': 'عدن (ADE)',
            'AMM': 'عمان (AMM)',
            'KWI': 'الكويت (KWI)',
            'DOH': 'الدوحة (DOH)'
        };
        return destinations[code?.toUpperCase()] || code || 'وجهة غير معروفة';
    };

    // Filter logic
    const filteredFlights = flights.filter(f =>
        f.flight_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.airportOrigin_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.airportDestination_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredBookings = bookings.filter(b =>
        b.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.passengers?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.flight_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = usersList.filter(u =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredCompanies = companiesList.filter(c =>
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.airline_code && c.airline_code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const chartColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

    if (!token || role !== 'admin') {
        return null;
    }

    return (
        <div className={`h-screen overflow-hidden font-sans flex text-slate-800 dark:text-slate-100 transition-colors duration-300 ${isDarkMode ? 'dark bg-[#0b1120]' : 'bg-slate-50'}`} dir="rtl">
            
            {/* TOAST NOTIFICATION */}
            {notificationMsg && (
                <div className="fixed top-6 left-6 z-50 animate-bounce bg-blue-600 text-white py-3 px-6 rounded-2xl shadow-xl font-bold flex items-center gap-3">
                    <Info size={18} />
                    <span>{notificationMsg}</span>
                </div>
            )}

            {/* ===== 1. SIDEBAR ===== */}
            <aside className="w-80 bg-white text-slate-800 border-l border-slate-200/80 dark:bg-slate-900 dark:text-white dark:border-none flex flex-col justify-between shrink-0 z-30 select-none shadow-2xl relative">
                {/* Top Profile / Brand */}
                <div>
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                        <div className="relative">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md">
                                <div className="h-full w-full rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-xl font-black text-blue-500">
                                    {adminInitials}
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm tracking-wide text-slate-800 dark:text-white">مدير النظام</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{adminEmail}</p>
                        </div>
                    </div>

                    {/* Nav tabs */}
                    <nav className="p-6 space-y-2">
                        {[
                            { id: 'dashboard', label: 'لوحة التحكم', icon: Activity },
                            { id: 'flights', label: 'إدارة الرحلات', icon: Plane },
                            { id: 'users', label: 'إدارة المستخدمين', icon: Users },
                            { id: 'companies', label: 'إدارة الشركات', icon: Building2 },
                            { id: 'reports', label: 'التقارير المالية', icon: BookOpen },
                            { id: 'statistics', label: 'الإحصائيات المتقدمة', icon: BarChart3 },
                            { id: 'settings', label: 'إعدادات النظام', icon: Settings },
                        ].map((item) => {
                            const IconComp = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSearchQuery('');
                                    }}
                                    className={`w-full flex items-center gap-4 py-3.5 px-5 rounded-2xl text-sm font-black transition-all ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                                    }`}
                                >
                                    <IconComp size={20} className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Active Users & Map */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">المستخدمين النشطين</p>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex -space-x-2 space-x-reverse">
                            <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 flex items-center justify-center text-[10px] font-bold">أ</div>
                            <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-sky-500 flex items-center justify-center text-[10px] font-bold">س</div>
                            <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 flex items-center justify-center text-[10px] font-bold">م</div>
                            <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">+{usersList.length}</div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">من مستخدمي الموقع</span>
                    </div>

                    {/* Stylized Outline Map */}
                    <div className="opacity-15 relative">
                        <svg className="w-full h-16 text-blue-500" fill="currentColor" viewBox="0 0 200 100">
                            <path d="M20,40 Q40,10 80,30 T150,20 T190,50 L190,80 L20,80 Z" opacity="0.3" />
                            <circle cx="50" cy="30" r="2" />
                            <circle cx="90" cy="40" r="3" />
                            <circle cx="130" cy="25" r="2" />
                            <circle cx="160" cy="45" r="2" />
                            <path d="M50,30 L90,40 M90,40 L130,25 M130,25 L160,45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                        </svg>
                    </div>
                </div>
            </aside>

            {/* ===== 2. MAIN CONTENT AREA ===== */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                
                {/* Header navbar */}
                <header className="py-6 px-10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 select-none bg-white dark:bg-slate-900/40 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
                            <Activity size={20} />
                        </div>
                        <h2 className="text-xl font-black tracking-tight">
                            {activeTab === 'dashboard' && 'لوحة التحكم الرئيسية'}
                            {activeTab === 'flights' && 'إدارة وإضافة الرحلات'}
                            {activeTab === 'users' && 'إدارة مستخدمي النظام'}
                            {activeTab === 'companies' && 'إدارة شركات الطيران'}
                            {activeTab === 'reports' && 'تقارير حركة الطيران والمبيعات'}
                            {activeTab === 'statistics' && 'تحليلات الأداء المتقدمة'}
                            {activeTab === 'settings' && 'إعدادات النظام والعمولة'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Quick Search */}
                        <div className="relative hidden md:block">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="بحث سريع..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-xl py-2 pr-10 pl-4 text-xs font-bold outline-none transition-all"
                            />
                        </div>

                        {/* Control buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleDarkMode}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 transition-all"
                                title="تبديل الوضع الليلي"
                            >
                                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <button
                                onClick={() => showToast('لا توجد إشعارات جديدة')}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 transition-all relative"
                            >
                                <Bell size={18} />
                                <span className="absolute top-2 left-2.5 h-2.5 w-2.5 bg-blue-500 rounded-full border border-slate-100 dark:border-slate-800" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex h-10 items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 px-4 text-xs font-black text-rose-600 hover:bg-rose-600 hover:text-white transition-all border border-rose-100 dark:border-rose-950"
                            >
                                <LogOut size={16} />
                                <span>خروج</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* View Content container */}
                <div className="p-10 flex-1">
                    
                    {loading && activeTab === 'dashboard' ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center">
                            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mb-4" />
                            <p className="text-slate-400 font-bold text-sm">جاري تحميل لوحة التحكم من قاعدة البيانات...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && (
                                <div className="space-y-10">
                                    
                                    {/* Dashboard Subheader with Stats Period Toggle */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5 dark:border-slate-800/60">
                                        <div>
                                            <h3 className="text-lg font-black">مؤشرات الأداء</h3>
                                            <p className="text-xs text-slate-400 font-bold mt-1">
                                                {statsPeriod === 'current_month' ? 'عرض إحصائيات حركة الطيران والمبيعات للشهر الحالي' : 'عرض إحصائيات حركة الطيران والمبيعات للسنة الحالية'}
                                            </p>
                                        </div>
                                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start">
                                            <button
                                                onClick={() => setStatsPeriod('current_month')}
                                                className={`py-1.5 px-4 rounded-lg text-xs font-black transition-all ${
                                                    statsPeriod === 'current_month'
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                                }`}
                                            >
                                                الشهر الحالي
                                            </button>
                                            <button
                                                onClick={() => setStatsPeriod('current_year')}
                                                className={`py-1.5 px-4 rounded-lg text-xs font-black transition-all ${
                                                    statsPeriod === 'current_year'
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                                }`}
                                            >
                                                السنة
                                            </button>
                                        </div>
                                    </div>

                                    {/* 1. Summary Cards (المؤشرات الرئيسية) */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { 
                                                label: statsPeriod === 'current_month' ? 'تذاكر الشهر الحالي' : 'تذاكر السنة الحالية', 
                                                value: stats.totalTickets.toLocaleString(), 
                                                icon: Ticket, 
                                                color: 'text-blue-600 bg-blue-500/10' 
                                            },
                                            { 
                                                label: statsPeriod === 'current_month' ? 'إيرادات الشهر الحالي' : 'إيرادات السنة الحالية', 
                                                value: `$${stats.totalRevenue.toLocaleString()}`, 
                                                icon: DollarSign, 
                                                color: 'text-emerald-600 bg-emerald-500/10' 
                                            },
                                            { 
                                                label: statsPeriod === 'current_month' ? 'نسبة إلغاء حجوزات الشهر' : 'نسبة إلغاء حجوزات السنة', 
                                                value: `${stats.cancellationRate}%`, 
                                                icon: XCircle, 
                                                color: stats.cancellationRate > 15 ? 'text-rose-600 bg-rose-500/10' : 'text-amber-500 bg-amber-500/10' 
                                            },
                                            { 
                                                label: statsPeriod === 'current_month' ? 'الركاب النشطين بالفترة' : 'الركاب النشطين بالسنة', 
                                                value: stats.activePassengers.toLocaleString(), 
                                                icon: Users, 
                                                color: 'text-violet-600 bg-violet-500/10' 
                                            }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white dark:bg-[#0b1120] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                    <h4 className="text-2xl font-black mt-2 tracking-tight">{stat.value}</h4>
                                                </div>
                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                                    <stat.icon size={24} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 2. Sales Analysis Curves (تحليل المبيعات اليومية / الشهرية) */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                            <div>
                                                <h3 className="text-lg font-black">تحليل وحركة المبيعات</h3>
                                                <p className="text-xs text-slate-400 font-bold mt-1">تتبع نمو المبيعات وحجم التذاكر المباعة بناءً على قاعدة البيانات</p>
                                            </div>
                                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start">
                                                <button
                                                    onClick={() => setSalesChartPeriod('daily')}
                                                    className={`py-1.5 px-4 rounded-lg text-xs font-black transition-all ${
                                                        salesChartPeriod === 'daily'
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                                                    }`}
                                                >
                                                    تحليل يومي (آخر 14 يوم)
                                                </button>
                                                <button
                                                    onClick={() => setSalesChartPeriod('monthly')}
                                                    className={`py-1.5 px-4 rounded-lg text-xs font-black transition-all ${
                                                        salesChartPeriod === 'monthly'
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                                                    }`}
                                                >
                                                    تحليل شهري
                                                </button>
                                            </div>
                                        </div>

                                        <div className="h-72 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={salesChartPeriod === 'daily' ? stats.dailySales : stats.monthlySales}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                                                    <XAxis 
                                                        dataKey={salesChartPeriod === 'daily' ? 'day' : 'month'} 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fontSize: 10, fontWeight: 'bold' }} 
                                                    />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                    <Tooltip />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="sales" 
                                                        stroke="#2563eb" 
                                                        strokeWidth={3} 
                                                        fillOpacity={1} 
                                                        fill="url(#colorSales)" 
                                                        name="المبيعات ($)" 
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* 3 & 5. Classification & Monitoring Row */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        
                                        {/* Airline Share (تصنيف الحجوزات حسب شركة الطيران) */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                            <div className="mb-6">
                                                <h3 className="text-sm font-black">تصنيف الحجوزات حسب شركات الطيران</h3>
                                                <p className="text-xs text-slate-400 font-bold mt-1">توزيع إجمالي الحجوزات بناءً على شركة النقل</p>
                                            </div>

                                            <div className="h-56 w-full relative flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats.airlineStats.length > 0 ? stats.airlineStats : [{ name: 'لا توجد بيانات', value: 1 }]}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={65}
                                                            outerRadius={85}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {stats.airlineStats.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">إجمالي الحصص</span>
                                                    <span className="text-xl font-black text-slate-800 dark:text-white mt-1">
                                                        {stats.airlineStats.reduce((acc, curr) => acc + curr.value, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Labels list */}
                                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] font-black">
                                                {stats.airlineStats.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5">
                                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[idx % chartColors.length] }} />
                                                        <span>{getAirlineName(item.name)}:</span>
                                                        <span className="text-slate-450">{item.value} حجز</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Travel Class Share (تصنيف الحجوزات حسب درجة السفر) */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                            <div className="mb-6">
                                                <h3 className="text-sm font-black">تصنيف الحجوزات حسب درجة السفر</h3>
                                                <p className="text-xs text-slate-400 font-bold mt-1">توزيع الركاب والمقاعد حسب درجات الطيران</p>
                                            </div>

                                            <div className="h-56 w-full relative flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats.classStats.length > 0 ? stats.classStats.map(c => ({ ...c, name: c.name === 'economy' ? 'الدرجة الاقتصادية' : c.name === 'business' ? 'درجة الأعمال' : c.name === 'first' ? 'الدرجة الأولى' : c.name })) : [{ name: 'لا توجد بيانات', value: 1 }]}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={65}
                                                            outerRadius={85}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {stats.classStats.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={chartColors[(index + 2) % chartColors.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">إجمالي التذاكر</span>
                                                    <span className="text-xl font-black text-slate-800 dark:text-white mt-1">
                                                        {stats.classStats.reduce((acc, curr) => acc + curr.value, 0)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Labels list */}
                                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] font-black">
                                                {stats.classStats.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5">
                                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[(idx + 2) % chartColors.length] }} />
                                                        <span className="capitalize">
                                                            {item.name === 'economy' && 'الاقتصادية'}
                                                            {item.name === 'business' && 'الأعمال'}
                                                            {item.name === 'first' && 'الأولى'}
                                                            {item.name !== 'economy' && item.name !== 'business' && item.name !== 'first' && item.name}
                                                        </span>
                                                        <span className="text-slate-455">{item.value} تذكرة</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 5. Payments & Cancellations Monitoring (متابعة الدفع وحالة الحجوزات ونسب الإلغاء) */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-sm font-black">متابعة حالة الدفع والتحصيل</h3>
                                                <p className="text-xs text-slate-400 font-bold mt-1 mb-6">الحالة المالية الفورية وعمليات الدفع والتحصيل من الداتابيس</p>
                                                
                                                <div className="space-y-5">
                                                    {[
                                                        { 
                                                            label: 'مدفوعات مؤكدة ومثبتة', 
                                                            status: 'certain',
                                                            count: stats.statusStats.find(s => s.status === 'certain')?.count || 0,
                                                            amount: stats.statusStats.find(s => s.status === 'certain')?.amount || 0,
                                                            color: 'bg-emerald-500 text-emerald-600 bg-emerald-500/10'
                                                        },
                                                        { 
                                                            label: 'مدفوعات معلقة بانتظار التأكيد', 
                                                            status: 'temporary',
                                                            count: stats.statusStats.find(s => s.status === 'temporary')?.count || 0,
                                                            amount: stats.statusStats.find(s => s.status === 'temporary')?.amount || 0,
                                                            color: 'bg-amber-500 text-amber-600 bg-amber-500/10'
                                                        },
                                                        { 
                                                            label: 'حجوزات ملغية مستبعدة', 
                                                            status: 'canceled',
                                                            count: stats.statusStats.find(s => s.status === 'canceled')?.count || 0,
                                                            amount: stats.statusStats.find(s => s.status === 'canceled')?.amount || 0,
                                                            color: 'bg-rose-500 text-rose-600 bg-rose-500/10'
                                                        }
                                                    ].map((item, idx) => {
                                                        const total = stats.statusStats.reduce((acc, curr) => acc + curr.count, 0) || 1;
                                                        const pct = Math.round((item.count / total) * 100);
                                                        return (
                                                            <div key={idx} className="space-y-2">
                                                                <div className="flex items-center justify-between text-xs font-black">
                                                                    <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                                                                    <span className={item.color.split(' ')[1]}>{item.count} حجز ({pct}%)</span>
                                                                </div>
                                                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div className={`h-full rounded-full ${item.color.split(' ')[0]}`} style={{ width: `${pct}%` }} />
                                                                </div>
                                                                <div className="text-[10px] font-bold text-slate-400 text-left">
                                                                    الحجم المالي: ${Number(item.amount).toLocaleString()}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs font-black text-slate-500">
                                                <span>نسبة الإلغاء الكلية للموقع</span>
                                                <span className="text-rose-500 text-sm font-black">{stats.cancellationRate}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Top Destinations & Ticket Count (الوجهات الأكثر طلباً وعدد التذاكر لكل وجهة) */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        
                                        {/* Destination ticket count lists */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm lg:col-span-2">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h3 className="text-sm font-black">عدد التذاكر المحجوزة حسب الوجهة</h3>
                                                    <p className="text-xs text-slate-400 font-bold mt-1">ترتيب الوجهات الأكثر إقبالاً وعدد مقاعد الطيران المحجوزة لها</p>
                                                </div>
                                                <span className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-xl text-[10px] font-black">
                                                    تذاكر فعلية
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                {stats.destinationsStats.length > 0 ? (
                                                    stats.destinationsStats.map((dest, idx) => {
                                                        const maxVal = Math.max(...stats.destinationsStats.map(d => d.count)) || 1;
                                                        const percentage = Math.round((dest.count / maxVal) * 100);
                                                        return (
                                                            <div key={idx} className="flex items-center gap-4">
                                                                <span className="text-xs font-black text-slate-400 w-6">#{idx + 1}</span>
                                                                <div className="flex-1 space-y-1">
                                                                    <div className="flex items-center justify-between text-xs font-black">
                                                                        <span className="text-slate-800 dark:text-slate-100">{getDestinationName(dest.destination)}</span>
                                                                        <span className="text-blue-600 font-black">{dest.count} تذكرة محجوزة</span>
                                                                    </div>
                                                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-xs text-slate-400 font-bold py-4 text-center">لا توجد حجوزات مسجلة للوجهات حتى الآن</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Top Destinations Stats Highlights (الوجهات الأكثر طلباً) */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                                            <div className="absolute right-[-20px] bottom-[-20px] text-blue-600/5 group-hover:scale-110 transition-transform duration-700">
                                                <Globe size={160} />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-sm font-black mb-6">الوجهة المتصدرة للأسبوع</h3>
                                                
                                                {stats.destinationsStats.length > 0 ? (
                                                    <div className="space-y-4">
                                                        <div className="text-4xl font-black text-blue-600 tracking-tight">
                                                            {getDestinationName(stats.destinationsStats[0]?.destination).split(' ')[0]}
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-bold leading-relaxed">
                                                            تتصدر هذه الوجهة قائمة الحجوزات بعدد <strong className="text-slate-700 dark:text-white">{stats.destinationsStats[0]?.count} تذكرة محجوزة</strong> فعلياً، مما يمثل أعلى نسبة تشغيل لخطوط النقل الجوي حالياً.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 font-bold">لا تتوفر بيانات للوجهة المتصدرة</p>
                                                )}
                                            </div>
                                            
                                            <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-[10px] font-black text-slate-400">
                                                <span>نسبة الإشغال المتوقعة</span>
                                                <span className="text-emerald-500 font-black">+85% نشاط</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* ===== VIEW: FLIGHTS ===== */}
                            {activeTab === 'flights' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-black">جميع الرحلات الجوية</h3>
                                            <p className="text-xs text-slate-400 font-bold mt-1">تصفح واستعراض رحلات شركات الطيران المتوفرة</p>
                                        </div>
                                    </div>

                                    {/* Date Filter */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                                        <div className="flex items-center gap-4 flex-wrap w-full">
                                            <div className="flex flex-col gap-1.5 w-full md:w-auto">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصفية حسب تاريخ الرحلة</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="date"
                                                        value={selectedFlightDate}
                                                        onChange={(e) => setSelectedFlightDate(e.target.value)}
                                                        className="bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-xl py-2.5 px-4 text-xs font-bold outline-none transition-all dark:text-white"
                                                    />
                                                    {selectedFlightDate && (
                                                        <button
                                                            onClick={() => setSelectedFlightDate('')}
                                                            className="py-2.5 px-4 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all border border-slate-200/60 dark:border-slate-700/60"
                                                        >
                                                            عرض كل التواريخ
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Flights Table */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-8">
                                        {loadingList ? (
                                            <div className="py-20 text-center text-slate-400">جاري تحميل الرحلات...</div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-right text-xs">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black uppercase">
                                                            <th className="pb-4 px-4">رقم الرحلة</th>
                                                            <th className="pb-4 px-4">الشركة</th>
                                                            <th className="pb-4 px-4">الوجهة (من ➔ إلى)</th>
                                                            <th className="pb-4 px-4">تاريخ الإقلاع</th>
                                                            <th className="pb-4 px-4">الطائرة</th>
                                                            <th className="pb-4 px-4 text-center">المقاعد المتاحة</th>
                                                            <th className="pb-4 px-4">سعر التذكرة</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                        {filteredFlights.length > 0 ? (
                                                            filteredFlights.map((flight) => (
                                                                <tr key={flight.id_flights} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                                    <td className="py-5 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                                        <Plane size={14} className="text-blue-500" />
                                                                        {flight.flight_number}
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-500">{getAirlineName(flight.airline_code)}</td>
                                                                    <td className="py-5 px-4 font-bold text-slate-800 dark:text-slate-100">
                                                                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 text-[10px] font-black">{flight.airportOrigin_code}</span>
                                                                        <span className="mx-2 text-slate-300">➔</span>
                                                                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 text-[10px] font-black">{flight.airportDestination_code}</span>
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-500">
                                                                        {new Date(flight.departure_time).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-500">{flight.aircraft_type || 'غير محدد'}</td>
                                                                    <td className="py-5 px-4 text-center font-black text-slate-700 dark:text-slate-200">
                                                                        {flight.available_seats} / {flight.total_seats}
                                                                    </td>
                                                                    <td className="py-5 px-4 font-black text-blue-600 dark:text-blue-400">${Number(flight.price || 0).toLocaleString()}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">لا توجد رحلات مطابقة للبحث</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}



                            {/* ======================================================== */}
                            {/* ===== VIEW: REPORTS ===== */}
                            {activeTab === 'reports' && (
                                <div className="space-y-6">
                                    {/* Sub-tab selection */}
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit mb-6 no-print">
                                        <button
                                            onClick={() => setReportsSubTab('logs')}
                                            className={`py-2.5 px-6 rounded-xl text-xs font-black transition-all ${
                                                reportsSubTab === 'logs'
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                            }`}
                                        >
                                            سجلات الحجوزات (تصدير CSV)
                                        </button>
                                        <button
                                            onClick={() => setReportsSubTab('pdf_report')}
                                            className={`py-2.5 px-6 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                                                reportsSubTab === 'pdf_report'
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                            }`}
                                        >
                                            <BookOpen size={16} />
                                            <span>التقرير الشامل والطباعة (PDF)</span>
                                        </button>
                                    </div>

                                    {reportsSubTab === 'logs' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-black">التقارير وسجلات الحجوزات</h3>
                                                    <p className="text-xs text-slate-400 font-bold mt-1">مراقبة وفلترة كافة الحجوزات والمبيعات على الموقع</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const csvRows = [];
                                                        const headers = ['رقم الحجز', 'المسافرين', 'رقم الرحلة', 'سعر الحجز', 'الحالة', 'تاريخ الحجز'];
                                                        csvRows.push(headers.join(','));
                                                        bookings.forEach(b => {
                                                            csvRows.push([
                                                                b.booking_reference,
                                                                `"${b.passengers?.replace(/"/g, '""') || ''}"`,
                                                                b.flight_number,
                                                                b.final_price,
                                                                b.status,
                                                                new Date(b.booking_date).toISOString()
                                                            ].join(','));
                                                        });
                                                        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
                                                        const encodedUri = encodeURI(csvContent);
                                                        const link = document.createElement("a");
                                                        link.setAttribute("href", encodedUri);
                                                        link.setAttribute("download", `YBF-bookings-report-${new Date().toLocaleDateString()}.csv`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-6 rounded-2xl text-xs transition-all shadow-md shadow-blue-500/20"
                                                >
                                                    تصدير التقرير المالي (CSV)
                                                </button>
                                            </div>

                                            {/* Bookings Filter List */}
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-8">
                                                {loadingList ? (
                                                    <div className="py-20 text-center text-slate-400">جاري تحميل التقارير...</div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-right text-xs">
                                                            <thead>
                                                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black uppercase">
                                                                    <th className="pb-4 px-4">رقم المرجع</th>
                                                                    <th className="pb-4 px-4">المسافرين</th>
                                                                    <th className="pb-4 px-4">الرحلة</th>
                                                                    <th className="pb-4 px-4">السعر</th>
                                                                    <th className="pb-4 px-4">حالة الحجز</th>
                                                                    <th className="pb-4 px-4">حالة الدفع</th>
                                                                    <th className="pb-4 px-4">تاريخ المعاملة</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                                {filteredBookings.length > 0 ? (
                                                                    filteredBookings.map((booking) => (
                                                                        <tr key={booking.id_bookings} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                                            <td className="py-4 px-4 font-black">#{booking.booking_reference}</td>
                                                                            <td className="py-4 px-4 font-bold text-slate-800 dark:text-white max-w-xs truncate">{booking.passengers}</td>
                                                                            <td className="py-4 px-4 font-bold text-slate-500">{booking.flight_number}</td>
                                                                            <td className="py-4 px-4 font-black text-slate-900 dark:text-white">${Number(booking.final_price).toLocaleString()}</td>
                                                                            <td className="py-4 px-4">
                                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${
                                                                                    booking.status === 'certain'
                                                                                        ? 'bg-emerald-500/10 text-emerald-600'
                                                                                        : booking.status === 'temporary'
                                                                                        ? 'bg-amber-500/10 text-amber-600'
                                                                                        : 'bg-rose-500/10 text-rose-600'
                                                                                }`}>
                                                                                    {booking.status === 'certain' ? 'مؤكد' : booking.status === 'temporary' ? 'معلق' : 'ملغي'}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-4 px-4">
                                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${
                                                                                    booking.payment_status === 'success'
                                                                                        ? 'bg-emerald-500/10 text-emerald-600'
                                                                                        : booking.payment_status === 'pending' || !booking.payment_status
                                                                                        ? 'bg-amber-500/10 text-amber-600'
                                                                                        : 'bg-rose-500/10 text-rose-600'
                                                                                }`}>
                                                                                    {booking.payment_status === 'success' ? 'ناجح' : 'قيد الانتظار'}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-4 px-4 font-medium text-slate-400">
                                                                                {new Date(booking.booking_date).toLocaleString('ar-EG', { dateStyle: 'short' })}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">لا توجد سجلات مطابقة للبحث</td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {reportsSubTab === 'pdf_report' && (
                                        <div className="space-y-6">
                                            <style dangerouslySetInnerHTML={{__html: `
                                                @media print {
                                                    body, html {
                                                        background: #ffffff !important;
                                                        color: #0f172a !important;
                                                        font-family: 'Inter', 'Outfit', sans-serif !important;
                                                    }
                                                    aside, header, nav, .no-print, button, input {
                                                        display: none !important;
                                                    }
                                                    main {
                                                        padding: 0 !important;
                                                        margin: 0 !important;
                                                        background: transparent !important;
                                                        overflow: visible !important;
                                                        width: 100% !important;
                                                    }
                                                    .print-report-container {
                                                        display: block !important;
                                                        width: 100% !important;
                                                        margin: 0 !important;
                                                        padding: 0 !important;
                                                        background: #ffffff !important;
                                                        color: #0f172a !important;
                                                        direction: rtl !important;
                                                    }
                                                    .print-card {
                                                        border: 1px solid #e2e8f0 !important;
                                                        background: #ffffff !important;
                                                        box-shadow: none !important;
                                                    }
                                                    .page-break {
                                                        page-break-before: always;
                                                    }
                                                }
                                            `}} />
                                            
                                            {/* Controls (no-print) */}
                                            <div className="flex items-center justify-between no-print mb-6">
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">معاينة التقرير الشامل للطباعة (PDF)</h3>
                                                    <p className="text-xs text-slate-400 font-bold mt-1">توليد تقرير رسمي للأداء والأنشطة المالية والتشغيلية</p>
                                                </div>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-3 px-6 rounded-2xl text-xs transition-all shadow-md shadow-emerald-500/20"
                                                >
                                                    <Printer size={16} />
                                                    <span>طباعة وحفظ كـ PDF</span>
                                                </button>
                                            </div>

                                            {/* Report Printable Document */}
                                            <div className="print-report-container bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm space-y-10">
                                                {/* Report Header */}
                                                <div className="border-b border-slate-200 dark:border-slate-800 pb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                                                                YBF
                                                            </div>
                                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">تقرير أداء نظام حجز الرحلات اليمني (YBF)</h2>
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-bold">وثيقة رسمية تلخص أداء المنصة التشغيلي والمالي مأخوذة مباشرة من قاعدة البيانات</p>
                                                    </div>
                                                    <div className="text-right text-xs text-slate-500 dark:text-slate-400 font-bold space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                        <div>تاريخ التقرير: <span className="text-slate-900 dark:text-white font-black">{new Date().toLocaleString('ar-YE', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
                                                        <div>الفترة الزمنية للتقرير: <span className="text-blue-650 dark:text-blue-350 font-black">{statsPeriod === 'current_month' ? 'الشهر الحالي' : 'السنة الحالية'}</span></div>
                                                        <div>المسؤول المصدر: <span className="text-slate-900 dark:text-white font-black">{adminEmail}</span></div>
                                                        <div>حالة النظام: <span className="text-emerald-500 font-black">متصل بقاعدة البيانات</span></div>
                                                    </div>
                                                </div>

                                                {/* KPIs Cards */}
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {/* 1. Revenue */}
                                                    <div className="print-card bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{statsPeriod === 'current_month' ? 'إيرادات الشهر الحالي' : 'إيرادات السنة الحالية'}</p>
                                                        <h4 className="text-3xl font-black text-emerald-500">${stats.totalRevenue.toLocaleString()}</h4>
                                                        <p className="text-[11px] font-bold text-slate-500">
                                                            يعادل: <strong className="text-slate-700 dark:text-slate-350">{(stats.totalRevenue * Number(exchangeRate)).toLocaleString()} ريال يمني</strong>
                                                        </p>
                                                    </div>

                                                    {/* 2. Tickets */}
                                                    <div className="print-card bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{statsPeriod === 'current_month' ? 'تذاكر الشهر الحالي' : 'تذاكر السنة الحالية'}</p>
                                                        <h4 className="text-3xl font-black text-blue-500">{stats.totalTickets.toLocaleString()} تذكرة</h4>
                                                        <p className="text-[11px] font-bold text-slate-500">
                                                            {statsPeriod === 'current_month' ? 'الركاب النشطين بالفترة:' : 'الركاب النشطين بالسنة:'} <strong className="text-slate-700 dark:text-slate-350">{stats.activePassengers.toLocaleString()} مسافر</strong>
                                                        </p>
                                                    </div>

                                                    {/* 3. Estimated profit */}
                                                    <div className="print-card bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{statsPeriod === 'current_month' ? `أرباح الشهر الحالي (عمولة ${markupRate}%)` : `أرباح السنة الحالية (عمولة ${markupRate}%)`}</p>
                                                        <h4 className="text-3xl font-black text-indigo-500">${(stats.totalRevenue * (Number(markupRate) / 100)).toLocaleString()}</h4>
                                                        <p className="text-[11px] font-bold text-slate-500">
                                                            يعادل: <strong className="text-slate-700 dark:text-slate-350">{Math.round((stats.totalRevenue * (Number(markupRate) / 100)) * Number(exchangeRate)).toLocaleString()} ريال يمني</strong>
                                                        </p>
                                                    </div>

                                                    {/* 4. Exchange rate */}
                                                    <div className="print-card bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">سعر الصرف المعتمد</p>
                                                        <h4 className="text-2xl font-black text-slate-800 dark:text-white">{exchangeRate} ر.ي / $</h4>
                                                        <p className="text-[11px] font-bold text-slate-500">معدل التحويل النشط للمبيعات</p>
                                                    </div>

                                                    {/* 5. Cancellation rate */}
                                                    <div className="print-card bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{statsPeriod === 'current_month' ? 'نسبة إلغاء حجوزات الشهر' : 'نسبة إلغاء حجوزات السنة'}</p>
                                                        <h4 className="text-2xl font-black text-rose-500">{stats.cancellationRate}%</h4>
                                                        <p className="text-[11px] font-bold text-slate-500">تحديث فوري من قاعدة البيانات</p>
                                                    </div>

                                                    {/* 6. Active Companies */}
                                                    <div className="print-card bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">شركات الطيران النشطة</p>
                                                        <h4 className="text-2xl font-black text-violet-500">{companiesList.length} شركات طيران</h4>
                                                        <p className="text-[11px] font-bold text-slate-500">المستخدمين المسجلين: {usersList.length} مستخدم</p>
                                                    </div>
                                                </div>

                                                {/* Destinations & Airline share row */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    {/* 1. Top Destinations */}
                                                    <div className="print-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                                                        <h3 className="text-sm font-black border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-800 dark:text-white">
                                                            <MapPin size={16} className="text-blue-500" />
                                                            <span>الوجهات الأكثر طلباً وسفراً</span>
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {stats.destinationsStats.length > 0 ? (
                                                                stats.destinationsStats.slice(0, 5).map((dest, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between text-xs font-bold border-b border-slate-50 dark:border-slate-800/50 pb-2">
                                                                        <span className="text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                                            <span className="text-slate-400 text-[10px]">#{idx+1}</span>
                                                                            <span>{getDestinationName(dest.destination)}</span>
                                                                        </span>
                                                                        <span className="text-blue-600 font-black">{dest.count} تذكرة محجوزة</span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-xs text-slate-400 font-bold py-2">لا توجد إحصائيات كافية للوجهات.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* 2. Airline Share */}
                                                    <div className="print-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                                                        <h3 className="text-sm font-black border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-800 dark:text-white">
                                                            <Plane size={16} className="text-blue-500" />
                                                            <span>توزيع الحجوزات حسب شركات الطيران</span>
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {stats.airlineStats.length > 0 ? (
                                                                stats.airlineStats.map((item, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between text-xs font-bold border-b border-slate-50 dark:border-slate-800/50 pb-2">
                                                                        <span className="text-slate-700 dark:text-slate-200">
                                                                            {getAirlineName(item.name)}
                                                                        </span>
                                                                        <span className="text-slate-800 dark:text-white font-black">{item.value} حجز</span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-xs text-slate-400 font-bold py-2">لا تتوفر بيانات لشركات الطيران.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Recent Bookings Table */}
                                                <div className="print-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                                                    <h3 className="text-sm font-black border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-800 dark:text-white">
                                                        <Ticket size={16} className="text-blue-500" />
                                                        <span>سجل آخر الحجوزات المستلمة والمؤكدة في النظام</span>
                                                    </h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-right text-xs">
                                                            <thead>
                                                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black">
                                                                    <th className="pb-3 px-2">رقم المرجع</th>
                                                                    <th className="pb-3 px-2">الراكب الرئيسي</th>
                                                                    <th className="pb-3 px-2">الرحلة</th>
                                                                    <th className="pb-3 px-2">المبلغ الكلي</th>
                                                                    <th className="pb-3 px-2">تاريخ المعاملة</th>
                                                                    <th className="pb-3 px-2">الحالة</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                                {stats.recentBookings.slice(0, 5).map((booking) => (
                                                                    <tr key={booking.id_bookings} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                                        <td className="py-3 px-2 font-black text-blue-600">#{booking.booking_reference}</td>
                                                                        <td className="py-3 px-2 font-bold text-slate-700 dark:text-white">{booking.lead_passenger || 'غير محدد'}</td>
                                                                        <td className="py-3 px-2 font-bold text-slate-500">{booking.flight_number}</td>
                                                                        <td className="py-3 px-2 font-black text-slate-900 dark:text-white">${Number(booking.final_price).toLocaleString()}</td>
                                                                        <td className="py-3 px-2 font-bold text-slate-400">{new Date(booking.booking_date).toLocaleDateString('ar-YE')}</td>
                                                                        <td className="py-3 px-2 font-bold">
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                                                                                booking.status === 'certain'
                                                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                                                    : booking.status === 'temporary'
                                                                                    ? 'bg-amber-500/10 text-amber-600'
                                                                                    : 'bg-rose-500/10 text-rose-600'
                                                                            }`}>
                                                                                {booking.status === 'certain' ? 'مؤكد' : booking.status === 'temporary' ? 'معلق' : 'ملغي'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Recent Flights Table */}
                                                <div className="print-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 page-break-inside-avoid">
                                                    <h3 className="text-sm font-black border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-800 dark:text-white">
                                                        <Plane size={16} className="text-blue-500" />
                                                        <span>سجل آخر الرحلات الجوية النشطة والمضافة</span>
                                                    </h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-right text-xs">
                                                            <thead>
                                                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black">
                                                                    <th className="pb-3 px-2">رقم الرحلة</th>
                                                                    <th className="pb-3 px-2">الشركة</th>
                                                                    <th className="pb-3 px-2">الوجهة (من ➔ إلى)</th>
                                                                    <th className="pb-3 px-2">تاريخ الإقلاع</th>
                                                                    <th className="pb-3 px-2">السعر</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                                {flights.slice(0, 5).map((flight) => (
                                                                    <tr key={flight.id_flights} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                                        <td className="py-3 px-2 font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                            <Plane size={12} className="text-blue-500" />
                                                                            {flight.flight_number}
                                                                        </td>
                                                                        <td className="py-3 px-2 font-bold text-slate-500">{getAirlineName(flight.airline_code)}</td>
                                                                        <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-100">
                                                                            <span>{flight.airportOrigin_code}</span>
                                                                            <span className="mx-1.5 text-slate-300">➔</span>
                                                                            <span>{flight.airportDestination_code}</span>
                                                                        </td>
                                                                        <td className="py-3 px-2 font-bold text-slate-400">
                                                                            {new Date(flight.departure_time).toLocaleString('ar-YE', { dateStyle: 'short', timeStyle: 'short' })}
                                                                        </td>
                                                                        <td className="py-3 px-2 font-black text-blue-600 dark:text-blue-400">${Number(flight.price || 0).toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Footer Signatures */}
                                                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between text-[11px] font-bold text-slate-500">
                                                    <div>توقيع المسؤول المصدر: ___________________</div>
                                                    <div>ختم الإدارة المالية: ___________________</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* ===== VIEW: STATISTICS ===== */}
                            {activeTab === 'statistics' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-black">التحليلات والمبيعات المتقدمة</h3>
                                        <p className="text-xs text-slate-400 font-bold mt-1">تحليل مفصل للوجهات والدرجات وحصص المبيعات بناءً على قاعدة البيانات</p>
                                    </div>

                                    {/* Stats KPI Cards */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { label: statsPeriod === 'current_month' ? 'تذاكر الشهر الحالي' : 'تذاكر السنة الحالية', value: stats.totalTickets.toLocaleString(), icon: Ticket, color: 'text-blue-600 bg-blue-500/10' },
                                            { label: statsPeriod === 'current_month' ? 'إيرادات الشهر الحالي' : 'إيرادات السنة الحالية', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-500/10' },
                                            { label: statsPeriod === 'current_month' ? 'نسبة إلغاء حجوزات الشهر' : 'نسبة إلغاء حجوزات السنة', value: `${stats.cancellationRate}%`, icon: XCircle, color: stats.cancellationRate > 15 ? 'text-rose-600 bg-rose-500/10' : 'text-amber-500 bg-amber-500/10' },
                                            { label: statsPeriod === 'current_month' ? 'الركاب النشطين بالفترة' : 'الركاب النشطين بالسنة', value: stats.activePassengers.toLocaleString(), icon: Users, color: 'text-violet-600 bg-violet-500/10' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                    <h4 className="text-2xl font-black mt-2 tracking-tight">{stat.value}</h4>
                                                </div>
                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                                    <stat.icon size={24} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        
                                        {/* Chart 1: Destinations */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                            <h4 className="text-sm font-black mb-6">الوجهات الأكثر طلباً</h4>
                                            <div className="h-64 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={stats.destinationsStats.length > 0 ? stats.destinationsStats.map(item => ({ ...item, destination: getDestinationName(item.destination).split(' ')[0] })) : [
                                                        { destination: 'القاهرة', count: 45 },
                                                        { destination: 'دبي', count: 38 },
                                                        { destination: 'الرياض', count: 52 },
                                                        { destination: 'جدة', count: 30 },
                                                        { destination: 'عمان', count: 25 }
                                                    ]} layout="vertical">
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.3} />
                                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                        <YAxis type="category" dataKey="destination" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                        <Tooltip />
                                                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={20} name="عدد الحجوزات" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Chart 2: Seat Classes */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                                            <h4 className="text-sm font-black mb-6">توزيع فئات درجات السفر</h4>
                                            <div className="h-56 w-full relative flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats.classStats.length > 0 ? stats.classStats.map(c => ({
                                                                ...c,
                                                                name: c.name === 'economy' ? 'الدرجة الاقتصادية' : c.name === 'business' ? 'درجة الأعمال' : c.name === 'first' ? 'الدرجة الأولى' : c.name
                                                            })) : [
                                                                { name: 'الدرجة الاقتصادية', value: 70 },
                                                                { name: 'درجة الأعمال', value: 20 },
                                                                { name: 'الدرجة الأولى', value: 10 }
                                                            ]}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={65}
                                                            outerRadius={85}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {(stats.classStats.length > 0 ? stats.classStats : [1, 2, 3]).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">توزيع الحجوزات</span>
                                                    <span className="text-lg font-black mt-1">
                                                        {stats.classStats.reduce((acc, curr) => acc + curr.value, 0) || stats.totalTickets}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Labels list */}
                                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] font-black">
                                                {(stats.classStats.length > 0 ? stats.classStats : [
                                                    { name: 'economy', value: 70 },
                                                    { name: 'business', value: 20 },
                                                    { name: 'first', value: 10 }
                                                ]).map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5">
                                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[idx % chartColors.length] }} />
                                                        <span className="capitalize text-slate-700 dark:text-slate-200">
                                                            {item.name === 'economy' && 'الاقتصادية'}
                                                            {item.name === 'business' && 'الأعمال'}
                                                            {item.name === 'first' && 'الأولى'}
                                                            {item.name !== 'economy' && item.name !== 'business' && item.name !== 'first' && item.name}
                                                        </span>
                                                        <span className="text-slate-400">({item.value} حجز)</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Chart 3: Monthly Sales performance */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                            <h4 className="text-sm font-black mb-6">حركة المبيعات والإيرادات الشهرية</h4>
                                            <div className="h-64 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={stats.monthlySales.length > 0 ? stats.monthlySales : [
                                                        { month: '2026-01', sales: 12000 },
                                                        { month: '2026-02', sales: 19000 },
                                                        { month: '2026-03', sales: 15000 },
                                                        { month: '2026-04', sales: 27000 },
                                                        { month: '2026-05', sales: 22000 },
                                                        { month: '2026-06', sales: 34000 }
                                                    ]}>
                                                        <defs>
                                                            <linearGradient id="colorSalesStats" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSalesStats)" name="المبيعات ($)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Chart 4: Airline Share */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                                            <h4 className="text-sm font-black mb-6">مبيعات شركات الطيران وحصصها</h4>
                                            <div className="h-56 w-full relative flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats.airlineStats.length > 0 ? stats.airlineStats.map(item => ({ ...item, name: getAirlineName(item.name).split(' ')[0] })) : [
                                                                { name: 'الخطوط اليمنية', value: 4 },
                                                                { name: 'الخطوط القطرية', value: 2 },
                                                                { name: 'طيران الإمارات', value: 3 }
                                                            ]}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={65}
                                                            outerRadius={85}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {(stats.airlineStats.length > 0 ? stats.airlineStats : [1, 2, 3]).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={chartColors[(index + 1) % chartColors.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الحصص</span>
                                                    <span className="text-lg font-black mt-1">
                                                        {stats.airlineStats.reduce((acc, curr) => acc + curr.value, 0) || stats.totalTickets}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Labels list */}
                                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] font-black">
                                                {stats.airlineStats.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5">
                                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[(idx + 1) % chartColors.length] }} />
                                                        <span className="text-slate-700 dark:text-slate-200">{getAirlineName(item.name)}:</span>
                                                        <span className="text-slate-400">({item.value} حجز)</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>

                                    {/* Chart 5: Aircraft Price Averages */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                        <h4 className="text-sm font-black mb-6">متوسط أسعار التذاكر لكل طراز طائرة</h4>
                                        <div className="h-72 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.aircraftStats.length > 0 ? stats.aircraftStats : [
                                                    { name: 'Boeing 787', price: 548 },
                                                    { name: 'Airbus A350', price: 620 },
                                                    { name: 'Boeing 777', price: 480 }
                                                ]}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                    <Tooltip />
                                                    <Bar dataKey="price" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} name="متوسط السعر ($)" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* ===== VIEW: SETTINGS ===== */}
                            {activeTab === 'settings' && (
                                <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-10">
                                    <div className="mb-8">
                                        <h3 className="text-lg font-black">إعدادات لوحة التحكم</h3>
                                        <p className="text-xs text-slate-400 font-bold mt-1">تحديث المتغيرات المالية للموقع وتفاصيل التواصل</p>
                                    </div>

                                    {showSettingsAlert && (
                                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-600 py-3 px-6 rounded-2xl text-xs font-black mb-6">
                                            تم حفظ الإعدادات بنجاح وحفظها في التخزين المحلي للموقع!
                                        </div>
                                    )}

                                    <form onSubmit={handleSaveSettings} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400">قيمة عمولة الموقع (%)</label>
                                            <input
                                                type="number"
                                                value={markupRate}
                                                onChange={(e) => setMarkupRate(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400">سعر صرف الدولار (مقابل الريال اليمني)</label>
                                            <input
                                                type="number"
                                                value={exchangeRate}
                                                onChange={(e) => setExchangeRate(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400">بريد الدعم الفني العام للمسافرين</label>
                                            <input
                                                type="email"
                                                value={supportEmail}
                                                onChange={(e) => setSupportEmail(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl text-xs transition-all shadow-md shadow-blue-500/20"
                                            >
                                                حفظ جميع الإعدادات
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* ===== VIEW: USERS MANAGEMENT ===== */}
                            {activeTab === 'users' && (
                                <div className="space-y-6">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الحسابات المسجلة</p>
                                                <h4 className="text-3xl font-black mt-1">{usersList.length}</h4>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                <UserCheck size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحسابات النشطة حالياً</p>
                                                <h4 className="text-3xl font-black mt-1">{usersList.length}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Users List Table */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h4 className="text-sm font-black">جميع المستخدمين في النظام</h4>
                                                <p className="text-xs text-slate-400 mt-1">تصفح وتحديث الحسابات الخاصة بكل مستخدم مسجل</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setIsEditingUser(false);
                                                    setUserForm({
                                                        id_users: null,
                                                        full_name: '',
                                                        email: '',
                                                        phone: '',
                                                        password: ''
                                                    });
                                                    setIsUserModalOpen(true);
                                                }}
                                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-6 rounded-2xl text-xs transition-all shadow-md shadow-blue-500/20"
                                            >
                                                <Plus size={16} />
                                                <span>إضافة مستخدم جديد</span>
                                            </button>
                                        </div>

                                        {loadingList ? (
                                            <div className="py-20 text-center text-slate-400 font-bold">جاري تحميل قائمة المستخدمين...</div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-right text-xs">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black uppercase">
                                                            <th className="pb-4 px-4">المستخدم</th>
                                                            <th className="pb-4 px-4">التواصل والاتصال</th>
                                                            <th className="pb-4 px-4">تاريخ الانضمام</th>
                                                            <th className="pb-4 px-4">حالة الحساب</th>
                                                            <th className="pb-4 px-4 text-left">إجراءات</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                        {filteredUsers.length > 0 ? (
                                                            filteredUsers.map((user) => (
                                                                <tr key={user.id_users} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                                    <td className="py-5 px-4 font-black text-slate-900 dark:text-white">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                                                                                {user.full_name?.charAt(0) || 'م'}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-black text-slate-800 dark:text-white">{user.full_name}</p>
                                                                                <p className="text-[10px] text-slate-400">ID: #{user.id_users}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-5 px-4">
                                                                        <div className="space-y-1">
                                                                            <p className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                                                                                <Mail size={12} className="text-slate-400" />
                                                                                {user.email}
                                                                            </p>
                                                                            {user.phone && (
                                                                                <p className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
                                                                                    <Phone size={12} className="text-slate-400" />
                                                                                    {user.phone}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-500">
                                                                        {new Date(user.created_at).toLocaleDateString('ar-EG', { dateStyle: 'short' })}
                                                                    </td>
                                                                    <td className="py-5 px-4">
                                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500/10 text-emerald-600">
                                                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                            نشط
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-5 px-4 text-left">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setIsEditingUser(true);
                                                                                    setUserForm({
                                                                                        id_users: user.id_users,
                                                                                        full_name: user.full_name || '',
                                                                                        email: user.email || '',
                                                                                        phone: user.phone || '',
                                                                                        password: user.password || ''
                                                                                    });
                                                                                    setIsUserModalOpen(true);
                                                                                }}
                                                                                className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
                                                                                title="تعديل بيانات المستخدم"
                                                                            >
                                                                                <Settings size={14} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteUser(user.id_users)}
                                                                                className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center"
                                                                                title="حذف الحساب"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="5" className="py-12 text-center text-slate-400 font-bold">لا يوجد مستخدمين مطابقين للبحث حالياً</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ===== VIEW: COMPANIES MANAGEMENT ===== */}
                            {activeTab === 'companies' && (
                                <div className="space-y-6">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                                <Building2 size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي شركات الطيران</p>
                                                <h4 className="text-3xl font-black mt-1">{companiesList.length}</h4>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                                <Plane size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الشركات النشطة</p>
                                                <h4 className="text-3xl font-black mt-1">{companiesList.length}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Companies List Table */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h4 className="text-sm font-black">قائمة شركات الطيران</h4>
                                                <p className="text-xs text-slate-400 mt-1">تصفح وتحديث الحسابات الخاصة بكل شركة طيران مسجلة</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setIsEditingCompany(false);
                                                    setCompanyForm({
                                                        id_admin: null,
                                                        email: '',
                                                        password: '',
                                                        airline_code: 'IY'
                                                    });
                                                    setIsCompanyModalOpen(true);
                                                }}
                                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-6 rounded-2xl text-xs transition-all shadow-md shadow-blue-500/20"
                                            >
                                                <Plus size={16} />
                                                <span>إضافة شركة جديدة</span>
                                            </button>
                                        </div>

                                        {loadingList ? (
                                            <div className="py-20 text-center text-slate-400 font-bold">جاري تحميل قائمة الشركات...</div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-right text-xs">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black uppercase">
                                                            <th className="pb-4 px-4">الشركة والبريد الإلكتروني</th>
                                                            <th className="pb-4 px-4">رمز شركة الطيران</th>
                                                            <th className="pb-4 px-4">تاريخ التسجيل</th>
                                                            <th className="pb-4 px-4">آخر دخول</th>
                                                            <th className="pb-4 px-4 text-left">إجراءات</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                        {filteredCompanies.length > 0 ? (
                                                            filteredCompanies.map((company) => (
                                                                <tr key={company.id_admin} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                                    <td className="py-5 px-4 font-black text-slate-900 dark:text-white">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                                                                                {company.email?.charAt(0).toUpperCase() || 'C'}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-black text-slate-800 dark:text-white">{company.email}</p>
                                                                                <p className="text-[10px] text-slate-400">ID: #{company.id_admin}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-800 dark:text-slate-100">
                                                                        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg text-[10px] font-black border border-blue-100/50 dark:border-blue-950">
                                                                            {getAirlineName(company.airline_code)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-500">
                                                                        {company.created_at ? new Date(company.created_at).toLocaleDateString('ar-EG', { dateStyle: 'short' }) : 'غير متوفر'}
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-500">
                                                                        {company.last_login ? new Date(company.last_login).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : 'لم يسجل دخول بعد'}
                                                                    </td>
                                                                    <td className="py-5 px-4 text-left">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setIsEditingCompany(true);
                                                                                    setCompanyForm({
                                                                                        id_admin: company.id_admin,
                                                                                        email: company.email || '',
                                                                                        password: '',
                                                                                        airline_code: company.airline_code || 'IY'
                                                                                    });
                                                                                    setIsCompanyModalOpen(true);
                                                                                }}
                                                                                className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
                                                                                title="تعديل بيانات الشركة"
                                                                            >
                                                                                <Settings size={14} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteCompany(company.id_admin)}
                                                                                className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center"
                                                                                title="حذف الحساب"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="5" className="py-12 text-center text-slate-400 font-bold">لا يوجد شركات مطابقة للبحث حالياً</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>



            {/* ===== COMPANY MODAL (ADD/EDIT COMPANY FORM) ===== */}
            {isCompanyModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in select-none">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-base font-black">
                                {isEditingCompany ? 'تعديل بيانات شركة الطيران' : 'إضافة حساب شركة طيران جديدة'}
                            </h4>
                            <button
                                onClick={() => setIsCompanyModalOpen(false)}
                                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={isEditingCompany ? handleUpdateCompany : handleCreateCompany} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400">البريد الإلكتروني للشركة</label>
                                <input
                                    type="email"
                                    placeholder="example@airline.com"
                                    value={companyForm.email}
                                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400">كلمة المرور</label>
                                <input
                                    type="password"
                                    placeholder={isEditingCompany ? 'اتركها فارغة إذا لم تكن تريد تغييرها' : 'كلمة المرور'}
                                    value={companyForm.password}
                                    onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                    required={!isEditingCompany}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400">شركة الطيران المرتبطة</label>
                                <select
                                    value={companyForm.airline_code}
                                    onChange={(e) => setCompanyForm({ ...companyForm, airline_code: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                >
                                    <option value="IY">الخطوط اليمنية (IY)</option>
                                    <option value="QA">الخطوط القطرية (QA)</option>
                                    <option value="EK">طيران الإمارات (EK)</option>
                                    <option value="WY">الطيران العماني (WY)</option>
                                    <option value="GF">طيران الخليج (GF)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCompanyModalOpen(false)}
                                    className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="py-2.5 px-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-black shadow-md shadow-blue-500/10"
                                >
                                    {isEditingCompany ? 'تحديث البيانات' : 'حفظ وإدراج'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== USER MODAL (ADD/EDIT USER FORM) ===== */}
            {isUserModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in select-none">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-base font-black">
                                {isEditingUser ? 'تعديل بيانات المستخدم' : 'إضافة حساب مستخدم جديد'}
                            </h4>
                            <button
                                onClick={() => setIsUserModalOpen(false)}
                                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={isEditingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400">الاسم الكامل</label>
                                <input
                                    type="text"
                                    placeholder="أحمد محمد"
                                    value={userForm.full_name}
                                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    placeholder="example@domain.com"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400">رقم الهاتف</label>
                                <input
                                    type="text"
                                    placeholder="777777777"
                                    value={userForm.phone}
                                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400">كلمة المرور</label>
                                <input
                                    type="password"
                                    placeholder={isEditingUser ? 'اتركها فارغة إذا لم تكن تريد تغييرها' : 'كلمة المرور'}
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                    required={!isEditingUser}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                    className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="py-2.5 px-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-black shadow-md shadow-blue-500/10"
                                >
                                    {isEditingUser ? 'تحديث البيانات' : 'حفظ وإدراج'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
