import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import {
    LogOut, Users, Ticket, DollarSign, TrendingUp,
    Calendar, CheckCircle, Clock, XCircle, Plane, ArrowUpRight, Search, Activity, Layers, BarChart3, MapPin,
    Globe, Bell, Settings, User, MoreHorizontal, ArrowLeft, Filter,
    Moon, Sun, Shield, Wallet, BookOpen, Plus, Trash2, Pencil, Check, X, CreditCard, ChevronRight, Info,
    UserCheck, Mail, Phone, Building2, Printer, RefreshCw
} from 'lucide-react';
import Messages from './Messages.jsx';
import logoImg from '../assets/logo.png';

const getApiUrl = (path) => {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isViteDevServer = isDev && window.location.port !== '8080';
    const base = isViteDevServer ? 'http://localhost:8080' : '';
    return `${base}${path}`;
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const adminUsername = localStorage.getItem('adminUsername') || 'admin';
    const adminInitials = adminUsername.slice(0, 2).toUpperCase();
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('userRole');

    const [activeTab, setActiveTab] = useState(() => {
        if (location.state && location.state.activeTab) {
            return location.state.activeTab;
        }
        return 'dashboard';
    });
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const isInitialMount = useRef(true);
    const [selectedDashboardYear, setSelectedDashboardYear] = useState(() => {
        const now = new Date();
        return String(now.getFullYear());
    });
    const [selectedDashboardMonth, setSelectedDashboardMonth] = useState(() => {
        const now = new Date();
        return String(now.getMonth() + 1).padStart(2, '0');
    });
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
        aircraftStats: [],
        companyBreakdown: []
    });

    // Lists for other tabs
    const [flights, setFlights] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [companiesList, setCompaniesList] = useState([]);
    const [bookingsList, setBookingsList] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [bookingSearchQuery, setBookingSearchQuery] = useState('');
    const [updatingBookingId, setUpdatingBookingId] = useState(null);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [companyForm, setCompanyForm] = useState({
        id_admin: null,
        company_name: '',
        airline_code: '',
        username: '',
        password: '',
        employee_id: '',
        department: ''
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ id: null, type: null, label: '' });
    const [isCancelBookingModalOpen, setIsCancelBookingModalOpen] = useState(false);
    const [cancelBookingTargetId, setCancelBookingTargetId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFlightDate, setSelectedFlightDate] = useState('');
    const [selectedFlightAirline, setSelectedFlightAirline] = useState('');

    const [selectedReportYear, setSelectedReportYear] = useState(() => {
        const now = new Date();
        return String(now.getFullYear());
    });
    const [selectedReportMonth, setSelectedReportMonth] = useState(() => {
        const now = new Date();
        return String(now.getMonth() + 1).padStart(2, '0');
    });
    const [loadingList, setLoadingList] = useState(false);



    // Settings State (backed by localStorage)
    const [markupRate, setMarkupRate] = useState(() => localStorage.getItem('adminMarkupRate') || '5');
    const [exchangeRate, setExchangeRate] = useState(() => localStorage.getItem('adminExchangeRate') || '530');
    const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('adminSupportEmail') || 'support@ybf.com');
    const [showSettingsAlert, setShowSettingsAlert] = useState(false);
    const [notificationMsg, setNotificationMsg] = useState(null);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            const response = await fetch(getApiUrl('/api/admin/settings'));
            const data = await response.json();
            if (data.success && data.settings) {
                const s = data.settings;
                if (s.markup_rate !== undefined && s.markup_rate !== null) {
                    setMarkupRate(s.markup_rate);
                    localStorage.setItem('adminMarkupRate', s.markup_rate);
                }
                if (s.exchange_rate !== undefined && s.exchange_rate !== null) {
                    setExchangeRate(s.exchange_rate);
                    localStorage.setItem('adminExchangeRate', s.exchange_rate);
                }
                if (s.support_email !== undefined && s.support_email !== null) {
                    setSupportEmail(s.support_email);
                    localStorage.setItem('adminSupportEmail', s.support_email);
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    }, []);

    useEffect(() => {
        if (token && role === 'admin') {
            fetchSettings();
        }
    }, [token, role, fetchSettings]);

    // Automatic logout when leaving the admin dashboard page or closing the tab
    useEffect(() => {
        const handleAutoLogout = () => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('adminUsername');
        };

        window.addEventListener('unload', handleAutoLogout);

        return () => {
            window.removeEventListener('unload', handleAutoLogout);
        };
    }, []);

    // Check for unread messages
    const checkUnreadMessages = useCallback(async () => {
        try {
            const res = await fetch(getApiUrl('/api/admin/chat/conversations'));
            const data = await res.json();
            if (data.success && data.conversations) {
                const anyUnread = data.conversations.some(c => c.unread_count > 0);
                setHasUnreadMessages(anyUnread);
            }
        } catch {
            // Silence error to prevent console clutter
        }
    }, []);

    // Polling for unread messages
    useEffect(() => {
        if (!token || role !== 'admin') return;
        
        const delayTimer = setTimeout(() => {
            checkUnreadMessages();
        }, 0);

        const intervalId = setInterval(checkUnreadMessages, 3000);
        
        return () => {
            clearTimeout(delayTimer);
            clearInterval(intervalId);
        };
    }, [token, role, checkUnreadMessages]);

    // Check auth
    useEffect(() => {
        if (!token || role !== 'admin') {
            navigate('/admin/login');
        }
    }, [navigate, token, role]);

    // Fetch Dashboard Stats
    const fetchDashboardStats = useCallback(async () => {
        if (!token || role !== 'admin') return;
        if (isInitialMount.current) {
            setLoading(true);
            isInitialMount.current = false;
        }
        try {
            let url = getApiUrl('/api/admin/dashboard-stats');
            const params = [];

            if (activeTab === 'reports') {
                if (selectedReportYear) {
                    params.push(`year=${selectedReportYear}`);
                }
                if (selectedReportMonth) {
                    params.push(`month=${selectedReportMonth}`);
                }
            } else {
                if (selectedDashboardYear) {
                    params.push(`year=${selectedDashboardYear}`);
                }
                if (selectedDashboardMonth) {
                    params.push(`month=${selectedDashboardMonth}`);
                }
            }

            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    }, [token, role, selectedDashboardYear, selectedDashboardMonth, selectedReportYear, selectedReportMonth, activeTab]);

    // Fetch Flights
    const fetchFlights = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoadingList(true);
        try {
            const params = [];
            if (selectedFlightDate) params.push(`date=${selectedFlightDate}`);
            if (selectedFlightAirline) params.push(`airlineCode=${selectedFlightAirline}`);
            const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
            
            const url = getApiUrl(`/api/flights${queryStr}`);
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
    }, [token, role, selectedFlightDate, selectedFlightAirline]);



    // Fetch Users
    const fetchUsers = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoadingList(true);
        try {
            const res = await fetch(getApiUrl('/api/admin/users'));
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
            const res = await fetch(getApiUrl('/api/admin/companies'));
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

    // Fetch Bookings
    const fetchBookings = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoadingBookings(true);
        try {
            const res = await fetch(getApiUrl('/api/admin/bookings'));
            const data = await res.json();
            if (data.success) {
                setBookingsList(data.bookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoadingBookings(false);
        }
    }, [token, role]);

    // Update Booking Status
    const handleUpdateBookingStatus = async (bookingId, status, paymentStatus) => {
        if (updatingBookingId) return;
        setUpdatingBookingId(bookingId);
        try {
            const res = await fetch(getApiUrl(`/api/admin/bookings/${bookingId}/status`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, payment_status: paymentStatus })
            });
            const data = await res.json();
            if (data.success) {
                showToast(status === 'certain' ? 'تم تأكيد الحجز والدفع بنجاح!' : 'تم إلغاء الحجز بنجاح.');
                fetchBookings();
                fetchDashboardStats();
            } else {
                showToast(data.error || 'حدث خطأ أثناء تحديث حالة الحجز.');
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
            showToast('خطأ في الاتصال بالخادم.');
        } finally {
            setUpdatingBookingId(null);
        }
    };

    // Create new company
    const handleCreateCompany = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(getApiUrl('/api/admin/companies'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: companyForm.username,
                    password: companyForm.password,
                    airline_code: companyForm.airline_code,
                    company_name: companyForm.company_name,
                    employee_id: companyForm.employee_id,
                    department: companyForm.department
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم إضافة الشركة بنجاح!');
                setIsCompanyModalOpen(false);
                setCompanyForm({
                    id_admin: null,
                    company_name: '',
                    airline_code: '',
                    username: '',
                    password: '',
                    employee_id: '',
                    department: ''
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
            const res = await fetch(getApiUrl(`/api/admin/companies/${companyForm.id_admin}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: companyForm.username,
                    password: companyForm.password,
                    airline_code: companyForm.airline_code,
                    company_name: companyForm.company_name,
                    employee_id: companyForm.employee_id,
                    department: companyForm.department
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم تحديث بيانات الشركة بنجاح!');
                setIsCompanyModalOpen(false);
                setCompanyForm({
                    id_admin: null,
                    company_name: '',
                    airline_code: '',
                    username: '',
                    password: '',
                    employee_id: '',
                    department: ''
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

    // Trigger delete company confirm
    const triggerDeleteCompany = (id, name) => {
        setDeleteTarget({ id, type: 'company', label: name });
        setIsDeleteModalOpen(true);
    };

    // Global execution function for custom delete modal confirmation
    const executeDelete = async () => {
        if (!deleteTarget.id || !deleteTarget.type) return;
        setIsDeleteModalOpen(false);
        const { id, type } = deleteTarget;
        
        try {
            if (type === 'company') {
                const res = await fetch(getApiUrl(`/api/admin/companies/${id}`), {
                    method: 'DELETE'
                });
                const data = await res.json();
                if (data.success) {
                    showToast('تم حذف حساب الشركة بنجاح.');
                    fetchCompanies();
                } else {
                    showToast('حدث خطأ أثناء حذف الشركة.');
                }
            } else if (type === 'user') {
                const res = await fetch(getApiUrl(`/api/admin/users/${id}`), {
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
            }
        } catch (error) {
            console.error(error);
            showToast('خطأ في الاتصال بالخادم.');
        } finally {
            setDeleteTarget({ id: null, type: null, label: '' });
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
                fetchDashboardStats();
                fetchFlights();
            } else if (activeTab === 'users') {
                fetchUsers();
            } else if (activeTab === 'companies') {
                fetchCompanies();
            } else if (activeTab === 'bookings') {
                fetchBookings();
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [activeTab, fetchDashboardStats, fetchFlights, fetchUsers, fetchCompanies, fetchBookings]);

    // Re-fetch stats when date filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'dashboard' || activeTab === 'reports') {
                fetchDashboardStats();
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [selectedReportYear, selectedReportMonth, selectedDashboardYear, selectedDashboardMonth, activeTab, fetchDashboardStats]);

    // Initial mount load of companies and users (dashboard stats are fetched by the tab change hook since activeTab defaults to 'dashboard')
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
            fetchCompanies();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchUsers, fetchCompanies]);

    // Manual refresh function to update data on user request
    const handleManualRefresh = () => {
        if (activeTab === 'dashboard' || activeTab === 'reports') {
            fetchDashboardStats();
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
        if (activeTab === 'bookings') {
            fetchBookings();
        }
        showToast('تم تحديث البيانات بنجاح!');
    };





    // Create new user
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(getApiUrl('/api/admin/users'), {
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
            const res = await fetch(getApiUrl(`/api/admin/users/${userForm.id_users}`), {
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

    // Trigger delete user confirm
    const triggerDeleteUser = (id, name) => {
        setDeleteTarget({ id, type: 'user', label: name });
        setIsDeleteModalOpen(true);
    };



    // Save Settings
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(getApiUrl('/api/admin/settings'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    markup_rate: markupRate,
                    exchange_rate: exchangeRate,
                    support_email: supportEmail
                })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('adminMarkupRate', markupRate);
                localStorage.setItem('adminExchangeRate', exchangeRate);
                localStorage.setItem('adminSupportEmail', supportEmail);
                setShowSettingsAlert(true);
                setTimeout(() => setShowSettingsAlert(false), 3000);
            } else {
                showToast('فشل حفظ الإعدادات في قاعدة البيانات: ' + data.error);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('خطأ في الاتصال بالخادم لحفظ الإعدادات.');
        }
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
        localStorage.removeItem('adminUsername');
        navigate('/');
    };

    // Get airline badge/name
    const getAirlineName = (code) => {
        if (!code) return 'غير معروف';
        // Check dynamic database companies list first
        const dbCompany = companiesList?.find(
            c => String(c.airline_code).toUpperCase() === String(code).toUpperCase()
        );
        if (dbCompany) {
            const name = dbCompany.company_name;
            if (name.includes(`(${code})`) || name.includes(code)) {
                return name;
            }
            return `${name} (${code})`;
        }

        const airlines = {
            'IY': 'اليمنية',
            'BS': 'بلقيس',
            'QA': 'القطرية',
            'EK': 'الإماراتية',
            'WY': 'العمانية',
            'GF': 'الخليج',
            'DH': 'القطيبي'
        };
        return airlines[code] ? `${airlines[code]} (${code})` : code;
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

    // Get Arabic month name
    const getArabicMonthName = (monthStr) => {
        const months = {
            '01': 'يناير',
            '02': 'فبراير',
            '03': 'مارس',
            '04': 'أبريل',
            '05': 'مايو',
            '06': 'يونيو',
            '07': 'يوليو',
            '08': 'أغسطس',
            '09': 'سبتمبر',
            '10': 'أكتوبر',
            '11': 'نوفمبر',
            '12': 'ديسمبر'
        };
        return months[monthStr] || monthStr;
    };

    // Filter logic
    const filteredFlights = flights.filter(f =>
        f.flight_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.airportOrigin_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.airportDestination_code.toLowerCase().includes(searchQuery.toLowerCase())
    );



    const filteredUsers = usersList.filter(u =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredCompanies = companiesList.filter(c =>
        (c.username && c.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.airline_code && c.airline_code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredBookings = bookingsList.filter(b => {
        const query = bookingSearchQuery.toLowerCase().trim();
        if (!query) return true;
        
        const refMatch = b.booking_reference?.toLowerCase().includes(query);
        const flightMatch = b.flight_number?.toLowerCase().includes(query);
        const passengerMatch = b.passengers?.toLowerCase().includes(query);
        
        return refMatch || flightMatch || passengerMatch;
    });

    const chartColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

    if (!token || role !== 'admin') {
        return null;
    }

    return (
        <div className="h-screen overflow-hidden font-sans lining-nums flex text-slate-850 dark:text-slate-100 transition-colors duration-300 bg-[#f8faff] dark:bg-[#080d19]" dir="rtl">
            
            {/* ─── Aesthetic Mesh Decor ────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] transition-all" />
                <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] transition-all" />
            </div>

            {/* TOAST NOTIFICATION */}
            {notificationMsg && (
                <div className="fixed top-6 left-6 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white py-3.5 px-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] font-bold flex items-center gap-3 animate-fade-in max-w-sm border-r-4 border-r-blue-600 dark:border-r-blue-500 select-none">
                    <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Check size={18} />
                    </div>
                    <div className="flex-1 text-right">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 leading-snug">{notificationMsg}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">تحديث فوري من قاعدة البيانات</p>
                    </div>
                </div>
            )}


            {/* ===== 1. SIDEBAR ===== */}
            <aside className={`${isSidebarCollapsed ? 'w-24' : 'w-80'} bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-l border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between shrink-0 z-30 select-none relative transition-all duration-300`}>
                {/* Top Section */}
                <div>
                    {/* Centered Profile */}
                    <div className={`${isSidebarCollapsed ? 'p-4' : 'p-8'} border-b border-slate-100 dark:border-slate-900 flex flex-col items-center text-center gap-3 transition-all`}>
                        <div className="relative">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md">
                                <div className="h-full w-full rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-blue-500">
                                    <User size={24} />
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </div>
                        {!isSidebarCollapsed && (
                            <div>
                                <h4 className="font-black text-sm tracking-wide text-slate-800 dark:text-white">مدير النظام</h4>
                            </div>
                        )}
                    </div>

                    {/* Nav tabs */}
                    <nav className={`${isSidebarCollapsed ? 'p-3' : 'p-6'} space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-thin transition-all`}>
                        {[
                            { id: 'dashboard', label: 'لوحة التحكم', icon: Activity },
                            { id: 'flights', label: 'إدارة الرحلات', icon: Plane },
                            { id: 'bookings', label: 'إدارة الحجوزات', icon: Ticket },
                            { id: 'users', label: 'إدارة المستخدمين', icon: Users },
                            { id: 'companies', label: 'إدارة الشركات', icon: Building2 },
                            { id: 'reports', label: 'التقارير المالية', icon: BookOpen },
                            { id: 'messages', label: 'الرسائل والشكاوى', icon: Mail },
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
                                    className={`group w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} rounded-xl px-4 py-3 text-xs font-bold transition-all duration-300 relative overflow-hidden ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-650/20'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                    title={isSidebarCollapsed ? item.label : ""}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <IconComp 
                                            size={16} 
                                            className={`transition-transform duration-500 group-hover:scale-105 ${
                                                isActive ? 'text-white' : 'text-slate-455 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                                            }`} 
                                        />
                                        {!isSidebarCollapsed && <span>{item.label}</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Toggle Button */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-900 flex justify-center no-print">
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center w-full shadow-sm hover:shadow-md"
                        title={isSidebarCollapsed ? "توسيع القائمة" : "طي القائمة"}
                    >
                        {isSidebarCollapsed ? <ChevronRight size={18} className="transform rotate-180" /> : <ChevronRight size={18} />}
                        {!isSidebarCollapsed && <span className="text-xs font-black mr-2">طي القائمة</span>}
                    </button>
                </div>
            </aside>

            {/* ===== 2. MAIN CONTENT AREA ===== */}
            <main className="flex-1 flex flex-col overflow-y-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                
                {/* Header navbar */}
                <header className="sticky top-4 z-20 mx-8 my-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl py-3 px-6 rounded-2xl shadow-xl shadow-slate-200/80 dark:shadow-black/50 flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-3">
                        <img
                            src={logoImg}
                            alt="YBF Logo"
                            className="h-10 w-10 object-contain brightness-0 dark:brightness-0 dark:invert"
                        />
                        <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {activeTab === 'dashboard' && 'لوحة التحكم الرئيسية'}
                            {activeTab === 'flights' && 'جدول واستعراض الرحلات الجوية'}
                            {activeTab === 'bookings' && 'إدارة وحالة حجوزات الطيران'}
                            {activeTab === 'users' && 'إدارة مستخدمي النظام'}
                            {activeTab === 'companies' && 'إدارة شركات الطيران'}
                            {activeTab === 'reports' && 'تقارير حركة الطيران والمبيعات'}
                            {activeTab === 'messages' && 'صندوق الوارد والرسائل'}
                            {activeTab === 'settings' && 'إعدادات النظام والعمولة'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Control buttons */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleManualRefresh}
                                className="text-slate-550 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors p-1.5 flex items-center justify-center"
                                title="تحديث البيانات"
                            >
                                <RefreshCw size={19} />
                            </button>
                            <button
                                onClick={() => setActiveTab('messages')}
                                className="text-slate-550 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors relative p-1.5"
                                title="المحادثات والرسائل الواردة"
                            >
                                <Bell size={20} />
                                {hasUnreadMessages && (
                                    <span className="absolute top-1 left-1.5 h-2 w-2 bg-blue-500 rounded-full border border-white dark:border-slate-950 animate-pulse" />
                                )}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors p-1.5"
                            >
                                <LogOut size={16} />
                                <span>خروج</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* View Content container */}
                <div className="relative z-10 px-8 py-6 flex-1">
                    
                    {loading && activeTab === 'dashboard' ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center">
                            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mb-4" />
                            <p className="text-slate-400 font-bold text-sm">جاري تحميل لوحة التحكم من قاعدة البيانات...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && (
                                <div className="space-y-10">
                                    
                                    {/* Dashboard Subheader with Custom Month/Year Selectors */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5 dark:border-slate-800/60">
                                        <div>
                                            <h3 className="text-lg font-black">مؤشرات الأداء</h3>
                                            <p className="text-xs text-slate-400 font-bold mt-1">
                                                {selectedDashboardMonth 
                                                    ? `عرض إحصائيات حركة الطيران والمبيعات لشهر ${getArabicMonthName(selectedDashboardMonth)} ${selectedDashboardYear}` 
                                                    : `عرض إحصائيات حركة الطيران والمبيعات لسنة ${selectedDashboardYear}`}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Year Selector */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">السنة:</span>
                                                <select
                                                    value={selectedDashboardYear}
                                                    onChange={(e) => setSelectedDashboardYear(e.target.value)}
                                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-1.5 px-3 text-xs font-bold outline-none transition-all dark:text-white min-w-[80px]"
                                                >
                                                    <option value="2024">2024</option>
                                                    <option value="2025">2025</option>
                                                    <option value="2026">2026</option>
                                                    <option value="2027">2027</option>
                                                    <option value="2028">2028</option>
                                                </select>
                                            </div>

                                            {/* Month Selector */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">الشهر:</span>
                                                <select
                                                    value={selectedDashboardMonth}
                                                    onChange={(e) => setSelectedDashboardMonth(e.target.value)}
                                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-1.5 px-3 text-xs font-bold outline-none transition-all dark:text-white min-w-[120px]"
                                                >
                                                    <option value="">كل أشهر السنة</option>
                                                    <option value="01">01 - يناير</option>
                                                    <option value="02">02 - فبراير</option>
                                                    <option value="03">03 - مارس</option>
                                                    <option value="04">04 - أبريل</option>
                                                    <option value="05">05 - مايو</option>
                                                    <option value="06">06 - يونيو</option>
                                                    <option value="07">07 - يوليو</option>
                                                    <option value="08">08 - أغسطس</option>
                                                    <option value="09">09 - سبتمبر</option>
                                                    <option value="10">10 - أكتوبر</option>
                                                    <option value="11">11 - نوفمبر</option>
                                                    <option value="12">12 - ديسمبر</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 1. Summary Cards (المؤشرات الرئيسية) */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { 
                                                label: selectedDashboardMonth ? `تذاكر شهر ${getArabicMonthName(selectedDashboardMonth)}` : `تذاكر سنة ${selectedDashboardYear}`, 
                                                value: stats.totalTickets.toLocaleString('en-US'), 
                                                icon: Ticket, 
                                                color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' 
                                            },
                                            { 
                                                label: selectedDashboardMonth ? `إيرادات شهر ${getArabicMonthName(selectedDashboardMonth)}` : `إيرادات سنة ${selectedDashboardYear}`, 
                                                value: `$${stats.totalRevenue.toLocaleString('en-US')}`, 
                                                icon: DollarSign, 
                                                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' 
                                            },
                                            { 
                                                label: selectedDashboardMonth ? `نسبة إلغاء الحجوزات للشهر` : `نسبة إلغاء الحجوزات للسنة`, 
                                                value: `${stats.cancellationRate}%`, 
                                                icon: XCircle, 
                                                color: stats.cancellationRate > 15 ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' : 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' 
                                            },
                                            { 
                                                label: selectedDashboardMonth ? `الركاب النشطين بالشهر` : `الركاب النشطين بالسنة`, 
                                                value: stats.activePassengers.toLocaleString('en-US'), 
                                                icon: Users, 
                                                color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' 
                                            }
                                        ].map((stat, i) => {
                                            const glowColors = [
                                                'from-blue-500 to-indigo-600',
                                                'from-emerald-500 to-teal-600',
                                                stats.cancellationRate > 15 ? 'from-rose-500 to-red-600' : 'from-amber-500 to-orange-600',
                                                'from-violet-500 to-purple-600'
                                            ];
                                            return (
                                                <div key={i} className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50/40 dark:from-slate-900/60 dark:to-slate-950/60 p-6 shadow-sm backdrop-blur-md transition-all duration-350 hover:shadow-xl hover:-translate-y-1">
                                                    {/* Decorative corner glow */}
                                                    <div className={`absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br ${glowColors[i]} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-lg transition-opacity duration-355`} />

                                                    <div className="flex items-center justify-between relative z-10">
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                                            <h4 className="text-2xl font-black mt-2 tracking-tight text-slate-900 dark:text-white transition-all duration-355 group-hover:text-blue-600 dark:group-hover:text-blue-400">{stat.value}</h4>
                                                        </div>
                                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color} transition-all duration-355 group-hover:scale-105`}>
                                                            <stat.icon size={22} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>



                                    {/* Company Sales & Bookings Composed Chart */}
                                    <div className="bg-white/80 dark:bg-slate-900/40 rounded-3xl p-8 shadow-sm backdrop-blur-md">
                                        <div className="mb-6">
                                            <h3 className="text-lg font-black">أداء الشركات (المبيعات والحجوزات)</h3>
                                            <p className="text-xs text-slate-400 font-bold mt-1">تتبع حجم الحجوزات وإجمالي الإيرادات المحققة لكل شركة طيران للفترة المحددة</p>
                                        </div>

                                        <div className="h-80 w-full">
                                            {stats.companyBreakdown && stats.companyBreakdown.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={stats.companyBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                                                        <XAxis 
                                                            dataKey="company_name" 
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{ fontSize: 11, fontWeight: 'bold' }} 
                                                        />
                                                        {/* Left Y Axis for Sales/Revenue */}
                                                        <YAxis 
                                                            yAxisId="left"
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{ fontSize: 10, fontWeight: 'bold' }} 
                                                            tickFormatter={(value) => `$${value}`}
                                                        />
                                                        {/* Right Y Axis for Bookings/Tickets */}
                                                        <YAxis 
                                                            yAxisId="right"
                                                            orientation="right"
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{ fontSize: 10, fontWeight: 'bold' }} 
                                                        />
                                                        <Tooltip 
                                                            formatter={(value, name) => {
                                                                if (name === 'revenue') return [`$${Number(value).toLocaleString('en-US')}`, 'إجمالي المبيعات'];
                                                                if (name === 'tickets') return [`${value} تذكرة`, 'إجمالي الحجوزات'];
                                                                return [value, name];
                                                            }}
                                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                        />
                                                        <Legend 
                                                            verticalAlign="top" 
                                                            height={36} 
                                                            formatter={(value) => {
                                                                if (value === 'revenue') return 'إجمالي المبيعات';
                                                                if (value === 'tickets') return 'إجمالي الحجوزات (تذكرة)';
                                                                return value;
                                                            }}
                                                        />
                                                        <Bar yAxisId="left" dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} name="revenue" />
                                                        <Bar yAxisId="right" dataKey="tickets" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={30} name="tickets" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center">
                                                    <p className="text-xs text-slate-400 font-bold">لا توجد بيانات شركات متاحة لهذه الفترة</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3 & 5. Classification & Monitoring Row */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        
                                        {/* Airline Share (تصنيف الحجوزات حسب شركة الطيران) */}
                                        <div className="bg-white/80 dark:bg-slate-900/40 rounded-3xl p-8 shadow-sm backdrop-blur-md">
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
                                        <div className="bg-white/80 dark:bg-slate-900/40 rounded-3xl p-8 shadow-sm backdrop-blur-md">
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
                                        <div className="bg-white/80 dark:bg-slate-900/40 rounded-3xl p-8 shadow-sm backdrop-blur-md flex flex-col justify-between">
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
                                                                    الحجم المالي: ${Number(item.amount).toLocaleString('en-US')}
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
                                        <div className="bg-white/80 dark:bg-slate-900/40 rounded-3xl p-8 shadow-sm backdrop-blur-md lg:col-span-2">
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
                                        <div className="bg-white/80 dark:bg-slate-900/40 rounded-3xl p-8 shadow-sm backdrop-blur-md flex flex-col justify-between relative overflow-hidden group">
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

                                    {/* Date and Airline Filters */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/40 rounded-3xl p-6 shadow-sm backdrop-blur-md">
                                        <div className="flex items-center gap-6 flex-wrap w-full">
                                            {/* Airline Filter */}
                                            <div className="flex flex-col gap-1.5 w-full md:w-auto">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصفية حسب شركة الطيران</label>
                                                <select
                                                    value={selectedFlightAirline}
                                                    onChange={(e) => setSelectedFlightAirline(e.target.value)}
                                                    className="bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-xl py-2.5 px-4 text-xs font-bold outline-none transition-all dark:text-white min-w-[200px]"
                                                >
                                                    <option value="">جميع الشركات</option>
                                                    {companiesList.map((company) => (
                                                        <option key={company.id_company || company.id_admin} value={company.airline_code}>
                                                            {company.company_name} ({company.airline_code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Date Filter */}
                                            <div className="flex flex-col gap-1.5 w-full md:w-auto">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصفية حسب تاريخ الرحلة</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type={selectedFlightDate ? "date" : "text"}
                                                        placeholder="اختر تاريخ الرحلة"
                                                        value={selectedFlightDate}
                                                        onFocus={(e) => {
                                                            e.target.type = 'date';
                                                            e.target.showPicker?.();
                                                        }}
                                                        onBlur={(e) => {
                                                            if (!e.target.value) {
                                                                e.target.type = 'text';
                                                            }
                                                        }}
                                                        onChange={(e) => setSelectedFlightDate(e.target.value)}
                                                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2.5 px-4 text-xs font-bold outline-none transition-all dark:text-white min-w-[160px]"
                                                    />
                                                    {(selectedFlightDate || selectedFlightAirline) && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedFlightDate('');
                                                                setSelectedFlightAirline('');
                                                            }}
                                                            className="py-2.5 px-4 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all border border-slate-200/60 dark:border-slate-700/60"
                                                        >
                                                            إعادة تعيين الفلاتر
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Flights Table */}
                                    <div className="bg-white/80 dark:bg-slate-900/40 rounded-3xl shadow-sm p-8 backdrop-blur-md">
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
                                                                    <td className="py-5 px-4 font-black text-slate-900 dark:text-white">
                                                                        {flight.flight_number}
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-500">{getAirlineName(flight.airline_code)}</td>
                                                                    <td className="py-5 px-4 font-bold text-slate-800 dark:text-slate-100">
                                                                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 text-[10px] font-black">{flight.airportOrigin_code}</span>
                                                                        <span className="mx-2 text-slate-300">➔</span>
                                                                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 text-[10px] font-black">{flight.airportDestination_code}</span>
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-500">
                                                                        {new Date(flight.departure_time).toLocaleString('ar-EG-u-nu-latn', { dateStyle: 'short', timeStyle: 'short' })}
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-500">{flight.aircraft_type || 'غير محدد'}</td>
                                                                    <td className="py-5 px-4 text-center font-black text-slate-700 dark:text-slate-200">
                                                                        {flight.available_seats} / {flight.total_seats}
                                                                    </td>
                                                                    <td className="py-5 px-4 font-black text-blue-600 dark:text-blue-400">${Number(flight.price || 0).toLocaleString('en-US')}</td>
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
                                        <div className="space-y-6">
                                            <style dangerouslySetInnerHTML={{__html: `
                                                @media print {
                                                    body, html, #root, div[class*="h-screen"], main, .relative.z-10.px-8.py-6.flex-1 {
                                                        height: auto !important;
                                                        overflow: visible !important;
                                                        position: static !important;
                                                    }
                                                    aside, header, nav, .no-print, button, input {
                                                        display: none !important;
                                                    }
                                                    main {
                                                        padding: 0 !important;
                                                        margin: 0 !important;
                                                        background: transparent !important;
                                                        width: 100% !important;
                                                    }
                                                    .print-report-container {
                                                        display: block !important;
                                                        width: 100% !important;
                                                        margin: 0 !important;
                                                        padding: 12px !important;
                                                        background: #ffffff !important;
                                                        color: #0f172a !important;
                                                        direction: rtl !important;
                                                        border: none !important;
                                                        box-shadow: none !important;
                                                    }
                                                    .print-report-container.space-y-10 > :not([hidden]) ~ :not([hidden]) {
                                                        margin-top: 16px !important;
                                                    }
                                                    .print-report-container th, .print-report-container td {
                                                        padding-top: 6px !important;
                                                        padding-bottom: 6px !important;
                                                        padding-left: 8px !important;
                                                        padding-right: 8px !important;
                                                    }
                                                    .print-card {
                                                        border: 1px solid #e2e8f0 !important;
                                                        background: #ffffff !important;
                                                        box-shadow: none !important;
                                                        padding: 12px !important;
                                                    }
                                                    .print-card, tr, .print-section {
                                                        page-break-inside: avoid !important;
                                                    }
                                                    .print-signatures {
                                                        page-break-inside: avoid !important;
                                                        margin-top: 24px !important;
                                                        padding-top: 16px !important;
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
                                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-6 rounded-2xl text-xs transition-all shadow-md shadow-blue-500/20 border-0"
                                                >
                                                    <Printer size={16} />
                                                    <span>طباعة وحفظ كـ PDF</span>
                                                </button>
                                            </div>

                                            {/* Date Filter (no-print) */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm no-print mb-6">
                                                <div className="flex items-center gap-6 flex-wrap w-full">
                                                    {/* Year Filter */}
                                                    <div className="flex flex-col gap-1.5 w-full md:w-auto">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصفية حسب السنة</label>
                                                        <select
                                                            value={selectedReportYear}
                                                            onChange={(e) => {
                                                                setSelectedReportYear(e.target.value);
                                                            }}
                                                            className="bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-xl py-2.5 px-4 text-xs font-bold outline-none transition-all dark:text-white min-w-[120px]"
                                                        >
                                                            <option value="2024">2024</option>
                                                            <option value="2025">2025</option>
                                                            <option value="2026">2026</option>
                                                            <option value="2027">2027</option>
                                                            <option value="2028">2028</option>
                                                        </select>
                                                    </div>

                                                    {/* Month Filter */}
                                                    <div className="flex flex-col gap-1.5 w-full md:w-auto">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصفية حسب الشهر</label>
                                                        <select
                                                            value={selectedReportMonth}
                                                            onChange={(e) => {
                                                                setSelectedReportMonth(e.target.value);
                                                            }}
                                                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2.5 px-4 text-xs font-bold outline-none transition-all dark:text-white min-w-[160px]"
                                                        >
                                                            <option value="">كل أشهر السنة</option>
                                                            <option value="01">01 - يناير</option>
                                                            <option value="02">02 - فبراير</option>
                                                            <option value="03">03 - مارس</option>
                                                            <option value="04">04 - أبريل</option>
                                                            <option value="05">05 - مايو</option>
                                                            <option value="06">06 - يونيو</option>
                                                            <option value="07">07 - يوليو</option>
                                                            <option value="08">08 - أغسطس</option>
                                                            <option value="09">09 - سبتمبر</option>
                                                            <option value="10">10 - أكتوبر</option>
                                                            <option value="11">11 - نوفمبر</option>
                                                            <option value="12">12 - ديسمبر</option>
                                                        </select>
                                                    </div>

                                                    {/* Reset Button */}
                                                    {(selectedReportMonth !== String(new Date().getMonth() + 1).padStart(2, '0') || selectedReportYear !== String(new Date().getFullYear())) && (
                                                        <div className="flex flex-col gap-1.5 w-full md:w-auto self-end">
                                                            <button
                                                                onClick={() => {
                                                                    const now = new Date();
                                                                    setSelectedReportYear(String(now.getFullYear()));
                                                                    setSelectedReportMonth(String(now.getMonth() + 1).padStart(2, '0'));
                                                                }}
                                                                className="py-2.5 px-4 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all border border-slate-200/60 dark:border-slate-700/60"
                                                            >
                                                                إعادة تعيين الفلاتر
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Report Printable Document */}
                                            <div className="print-report-container relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-10">
                                                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600" />
                                                
                                                {/* Report Header */}
                                                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-wider">YBF</span>
                                                            <h2 className="text-xl md:text-2xl font-black text-slate-850 dark:text-white">تقرير أداء نظام حجز الرحلات اليمني (YBF)</h2>
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-bold">وثيقة رسمية تلخص أداء المنصة التشغيلي والمالي مأخوذة مباشرة من قاعدة البيانات</p>
                                                    </div>
                                                    <div className="text-right text-xs text-slate-500 dark:text-slate-400 font-bold space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 min-w-[280px]">
                                                        <div className="flex justify-between items-center"><span className="text-slate-400">تاريخ التقرير:</span> <span className="text-slate-900 dark:text-white font-mono font-bold">{new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
                                                        <div className="flex justify-between items-center"><span className="text-slate-400">الفترة الزمنية:</span> <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedReportMonth ? `${getArabicMonthName(selectedReportMonth)} ${selectedReportYear}` : `سنة ${selectedReportYear}`}</span></div>
                                                        <div className="flex justify-between items-center"><span className="text-slate-400">المسؤول المصدر:</span> <span className="text-slate-950 dark:text-white font-bold">{adminUsername}</span></div>
                                                    </div>
                                                </div>

                                                {/* KPIs Cards */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {/* 1. Revenue */}
                                                    <div className="print-card bg-gradient-to-br from-emerald-500/[0.03] to-teal-500/[0.01] dark:from-emerald-500/[0.06] dark:to-teal-500/[0.02] border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
                                                        <div className="absolute top-4 left-4 h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                            <DollarSign size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-405 dark:text-slate-400 uppercase tracking-wider">{selectedReportMonth ? `إيرادات شهر ${getArabicMonthName(selectedReportMonth)}` : `إيرادات سنة ${selectedReportYear}`}</p>
                                                            <h4 className="text-3xl font-black text-emerald-500 mt-1">${stats.totalRevenue.toLocaleString('en-US')}</h4>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-slate-500 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                                                            يعادل: <strong className="text-slate-700 dark:text-slate-350">{(stats.totalRevenue * Number(exchangeRate)).toLocaleString('en-US')} ريال يمني</strong>
                                                        </p>
                                                        {stats.companyBreakdown && stats.companyBreakdown.length > 0 && (
                                                            <div className="space-y-2 pt-1">
                                                                <p className="text-[9px] font-black text-slate-405 dark:text-slate-550 tracking-wider uppercase mb-2">تفصيل إيرادات الشركات:</p>
                                                                {stats.companyBreakdown.map((comp) => {
                                                                    const compRevenue = Number(comp.revenue) || 0;
                                                                    const compRevenueYer = Math.round(compRevenue * Number(exchangeRate));
                                                                    return (
                                                                        <div key={comp.airline_code} className="flex justify-between items-center text-xs border-b border-dashed border-slate-200/30 dark:border-slate-800/30 pb-2 last:border-0 last:pb-0">
                                                                            <span className="font-bold text-slate-655 dark:text-slate-355">{comp.company_name || comp.airline_code}</span>
                                                                            <div className="text-left font-black text-slate-800 dark:text-slate-100">
                                                                                <span>${compRevenue.toLocaleString('en-US')}</span>
                                                                                <span className="text-[9px] font-bold text-slate-455 mr-1.5">({compRevenueYer.toLocaleString('en-US')} ر.ي)</span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 2. Tickets */}
                                                    <div className="print-card bg-gradient-to-br from-blue-500/[0.03] to-indigo-500/[0.01] dark:from-blue-500/[0.06] dark:to-indigo-500/[0.02] border border-blue-500/20 dark:border-blue-500/10 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
                                                        <div className="absolute top-4 left-4 h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                            <Ticket size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-405 dark:text-slate-400 uppercase tracking-wider">{selectedReportMonth ? `تذاكر شهر ${getArabicMonthName(selectedReportMonth)}` : `تذاكر سنة ${selectedReportYear}`}</p>
                                                            <h4 className="text-3xl font-black text-blue-600 dark:text-blue-450 mt-1">{stats.totalTickets.toLocaleString('en-US')} تذكرة</h4>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-slate-500 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                                                            الركاب النشطين بالفترة: <strong className="text-slate-700 dark:text-slate-350">{stats.activePassengers.toLocaleString('en-US')} مسافر</strong>
                                                        </p>
                                                        {stats.companyBreakdown && stats.companyBreakdown.length > 0 && (
                                                            <div className="space-y-2 pt-1">
                                                                <p className="text-[9px] font-black text-slate-405 dark:text-slate-550 tracking-wider uppercase mb-2">تفصيل تذاكر الشركات:</p>
                                                                {stats.companyBreakdown.map((comp) => {
                                                                    const compTickets = Number(comp.tickets) || 0;
                                                                    return (
                                                                        <div key={comp.airline_code} className="flex justify-between items-center text-xs border-b border-dashed border-slate-200/30 dark:border-slate-800/30 pb-2 last:border-0 last:pb-0">
                                                                            <span className="font-bold text-slate-655 dark:text-slate-355">{comp.company_name || comp.airline_code}</span>
                                                                            <span className="font-black text-slate-800 dark:text-slate-100">{compTickets.toLocaleString('en-US')} تذكرة</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 3. Estimated profit */}
                                                    <div className="print-card bg-gradient-to-br from-violet-500/[0.03] to-purple-500/[0.01] dark:from-violet-500/[0.06] dark:to-purple-500/[0.02] border border-violet-500/20 dark:border-violet-500/10 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
                                                        <div className="absolute top-4 left-4 h-8 w-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                                            <TrendingUp size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-405 dark:text-slate-400 uppercase tracking-wider">{selectedReportMonth ? `أرباح شهر ${getArabicMonthName(selectedReportMonth)}` : `أرباح سنة ${selectedReportYear}`} (عمولة {markupRate}%)</p>
                                                            <h4 className="text-3xl font-black text-violet-600 dark:text-violet-400 mt-1">${(stats.totalRevenue * (Number(markupRate) / 100)).toLocaleString('en-US')}</h4>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-slate-500 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                                                            يعادل: <strong className="text-slate-700 dark:text-slate-350">{Math.round((stats.totalRevenue * (Number(markupRate) / 100)) * Number(exchangeRate)).toLocaleString('en-US')} ريال يمني</strong>
                                                        </p>
                                                        {stats.companyBreakdown && stats.companyBreakdown.length > 0 && (
                                                            <div className="space-y-2 pt-1">
                                                                <p className="text-[9px] font-black text-slate-405 dark:text-slate-550 tracking-wider uppercase mb-2">تفصيل عمولة الشركات:</p>
                                                                {stats.companyBreakdown.map((comp) => {
                                                                    const compRevenue = Number(comp.revenue) || 0;
                                                                    const compProfit = compRevenue * (Number(markupRate) / 100);
                                                                    const compProfitYer = Math.round(compProfit * Number(exchangeRate));
                                                                    return (
                                                                        <div key={comp.airline_code} className="flex justify-between items-center text-xs border-b border-dashed border-slate-200/30 dark:border-slate-800/30 pb-2 last:border-0 last:pb-0">
                                                                            <span className="font-bold text-slate-650 dark:text-slate-350">{comp.company_name || comp.airline_code}</span>
                                                                            <div className="text-left font-black text-slate-800 dark:text-slate-100">
                                                                                <span>${compProfit.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                                                                                <span className="text-[9px] font-bold text-slate-455 mr-1.5">({compProfitYer.toLocaleString('en-US')} ر.ي)</span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 4. Exchange rate */}
                                                    <div className="print-card bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 space-y-3 relative overflow-hidden">
                                                        <div className="absolute top-4 left-4 h-8 w-8 rounded-xl bg-slate-200/30 dark:bg-slate-700/30 text-slate-500 dark:text-slate-450 flex items-center justify-center">
                                                            <Wallet size={16} />
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">سعر الصرف المعتمد</p>
                                                        <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{exchangeRate} ر.ي / $</h4>
                                                        <p className="text-[11px] font-bold text-slate-500">معدل التحويل النشط للمبيعات</p>
                                                    </div>

                                                    {/* 5. Cancellation rate */}
                                                    <div className="print-card bg-gradient-to-br from-rose-500/[0.03] to-red-500/[0.01] dark:from-rose-500/[0.06] dark:to-red-500/[0.02] border border-rose-500/20 dark:border-rose-500/10 rounded-2xl p-6 space-y-3 relative overflow-hidden">
                                                        <div className="absolute top-4 left-4 h-8 w-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                                            <XCircle size={16} />
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedReportMonth ? `نسبة إلغاء شهر ${getArabicMonthName(selectedReportMonth)}` : `نسبة إلغاء سنة ${selectedReportYear}`}</p>
                                                        <h4 className="text-2xl font-black text-rose-500 mt-1">{stats.cancellationRate}%</h4>
                                                        <p className="text-[11px] font-bold text-slate-500 border-b border-slate-200/40 dark:border-slate-800/40 pb-3">تحديث فوري من قاعدة البيانات</p>
                                                        {stats.companyBreakdown && stats.companyBreakdown.length > 0 && (
                                                            <div className="space-y-2 pt-1">
                                                                <p className="text-[9px] font-black text-slate-405 dark:text-slate-550 tracking-wider uppercase mb-2">الحجوزات الملغية للشركات:</p>
                                                                {stats.companyBreakdown.map((comp) => {
                                                                    const compCancelled = Number(comp.cancelled_bookings) || 0;
                                                                    return (
                                                                        <div key={comp.airline_code} className="flex justify-between items-center text-xs border-b border-dashed border-slate-200/30 dark:border-slate-800/30 pb-2 last:border-0 last:pb-0">
                                                                            <span className="font-bold text-slate-650 dark:text-slate-350">{comp.company_name || comp.airline_code}</span>
                                                                            <span className="font-black text-rose-600 dark:text-rose-450">{compCancelled} حجز ملغي</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 6. Active Companies */}
                                                    <div className="print-card bg-gradient-to-br from-violet-500/[0.03] to-indigo-500/[0.01] dark:from-violet-500/[0.06] dark:to-indigo-500/[0.02] border border-violet-500/20 dark:border-violet-500/10 rounded-2xl p-6 space-y-3 relative overflow-hidden">
                                                        <div className="absolute top-4 left-4 h-8 w-8 rounded-xl bg-violet-500/10 text-violet-650 dark:text-violet-400 flex items-center justify-center">
                                                            <Building2 size={16} />
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">شركات الطيران النشطة</p>
                                                        <h4 className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">{companiesList.length} شركات طيران</h4>
                                                        {companiesList && companiesList.length > 0 && (
                                                            <div className="space-y-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                                                                <p className="text-[9px] font-black text-slate-405 dark:text-slate-550 tracking-wider uppercase mb-2">أسماء الشركات المسجلة:</p>
                                                                {companiesList.map((comp) => (
                                                                    <div key={comp.airline_code} className="flex justify-between items-center text-xs border-b border-dashed border-slate-200/30 dark:border-slate-800/30 pb-2 last:border-0 last:pb-0">
                                                                        <span className="font-bold text-slate-655 dark:text-slate-350">{comp.company_name}</span>
                                                                        <span className="font-mono font-bold text-[9px] px-2 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">{comp.airline_code}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Destinations & Airline share row */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    {/* 1. Top Destinations */}
                                                    <div className="print-card bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl space-y-4">
                                                        <h3 className="text-sm font-black border-b border-slate-200/50 dark:border-slate-800/50 pb-3.5 flex items-center gap-2 text-slate-805 dark:text-white">
                                                            <MapPin size={16} className="text-blue-500" />
                                                            <span>الوجهات الأكثر طلباً وسفراً</span>
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {stats.destinationsStats.length > 0 ? (
                                                                stats.destinationsStats.slice(0, 5).map((dest, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between text-xs font-bold border-b border-slate-200/40 dark:border-slate-800/30 pb-2 last:border-0 last:pb-0">
                                                                        <span className="text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                                            <span className="h-5 w-5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black flex items-center justify-center">#{idx+1}</span>
                                                                            <span>{getDestinationName(dest.destination)}</span>
                                                                        </span>
                                                                        <span className="text-blue-600 dark:text-blue-400 font-mono font-black">{dest.count} تذكرة محجوزة</span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-xs text-slate-400 font-bold py-2">لا توجد إحصائيات كافية للوجهات.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* 2. Airline Share */}
                                                    <div className="print-card bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl space-y-4">
                                                        <h3 className="text-sm font-black border-b border-slate-200/50 dark:border-slate-800/50 pb-3.5 flex items-center gap-2 text-slate-805 dark:text-white">
                                                            <Plane size={16} className="text-indigo-500" />
                                                            <span>توزيع الحجوزات حسب شركات الطيران</span>
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {stats.airlineStats.length > 0 ? (
                                                                stats.airlineStats.map((item, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between text-xs font-bold border-b border-slate-200/40 dark:border-slate-800/30 pb-2 last:border-0 last:pb-0">
                                                                        <span className="text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                                            <span className="h-5 w-5 rounded-lg bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-[10px] font-black flex items-center justify-center">#{idx+1}</span>
                                                                            <span>{getAirlineName(item.name)}</span>
                                                                        </span>
                                                                        <span className="text-slate-800 dark:text-white font-mono font-black">{item.value} حجز</span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-xs text-slate-400 font-bold py-2">لا تتوفر بيانات لشركات الطيران.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Recent Bookings Table */}
                                                <div className="print-card bg-white dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                                                        <h3 className="text-sm font-black flex items-center gap-2 text-slate-805 dark:text-white">
                                                            <Ticket size={16} className="text-blue-500" />
                                                            <span>سجل آخر الحجوزات المستلمة والمؤكدة في النظام</span>
                                                        </h3>
                                                    </div>
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
                                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                                                                {stats.recentBookings.slice(0, 5).map((booking) => (
                                                                    <tr key={booking.id_bookings} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                                        <td className="py-3 px-2 font-mono font-black text-blue-600 dark:text-blue-400">#{booking.booking_reference}</td>
                                                                        <td className="py-3 px-2 font-bold text-slate-700 dark:text-white">{booking.lead_passenger || 'غير محدد'}</td>
                                                                        <td className="py-3 px-2 font-bold text-slate-500">{booking.flight_number}</td>
                                                                        <td className="py-3 px-2 font-mono font-black text-slate-855 dark:text-white">${Number(booking.final_price).toLocaleString('en-US')}</td>
                                                                        <td className="py-3 px-2 font-bold text-slate-400 font-mono">{new Date(booking.booking_date).toLocaleDateString('en-US')}</td>
                                                                        <td className="py-3 px-2 font-bold">
                                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black ${
                                                                                booking.status === 'certain'
                                                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                                    : booking.status === 'temporary'
                                                                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                            }`}>
                                                                                <div className={`h-1.5 w-1.5 rounded-full ${booking.status === 'certain' ? 'bg-emerald-500' : booking.status === 'temporary' ? 'bg-amber-500' : 'bg-rose-500'}`} />
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
                                                <div className="print-card bg-white dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl space-y-4 page-break-inside-avoid">
                                                    <h3 className="text-sm font-black border-b border-slate-100 dark:border-slate-800/60 pb-3 flex items-center gap-2 text-slate-805 dark:text-white">
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
                                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                                                                {flights.slice(0, 5).map((flight) => (
                                                                    <tr key={flight.id_flights} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                                        <td className="py-3 px-2 font-black text-slate-900 dark:text-white">
                                                                            {flight.flight_number}
                                                                        </td>
                                                                        <td className="py-3 px-2 font-bold text-slate-500">{getAirlineName(flight.airline_code)}</td>
                                                                        <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-100">
                                                                            <span>{flight.airportOrigin_code}</span>
                                                                            <span className="mx-1.5 text-slate-300">➔</span>
                                                                            <span>{flight.airportDestination_code}</span>
                                                                        </td>
                                                                        <td className="py-3 px-2 font-bold text-slate-400 font-mono">
                                                                            {new Date(flight.departure_time).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                                                                        </td>
                                                                        <td className="py-3 px-2 font-mono font-black text-blue-600 dark:text-blue-400">${Number(flight.price || 0).toLocaleString('en-US')}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Footer Signatures */}
                                                <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-between text-[11px] font-bold text-slate-500 print-signatures">
                                                    <div>توقيع المسؤول المصدر: ___________________</div>
                                                    <div>ختم الإدارة المالية: ___________________</div>
                                                </div>
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
                                                type="text"
                                                inputMode="decimal"
                                                lang="en"
                                                dir="ltr"
                                                value={markupRate}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                                        setMarkupRate(val);
                                                    }
                                                }}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none font-mono text-left"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400">سعر صرف الدولار (مقابل الريال اليمني)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                lang="en"
                                                dir="ltr"
                                                value={exchangeRate}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                                        setExchangeRate(val);
                                                    }
                                                }}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none font-mono text-left"
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
                                        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/40 rounded-3xl p-6 shadow-sm flex items-center gap-4 backdrop-blur-md transition-all duration-350 hover:-translate-y-1 hover:shadow-md">
                                            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-655 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-md transition-opacity duration-350" />
                                            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center relative z-10">
                                                <User size={22} />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الحسابات المسجلة</p>
                                                <h4 className="text-3xl font-black mt-1 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{usersList.length}</h4>
                                            </div>
                                        </div>
                                        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/40 rounded-3xl p-6 shadow-sm flex items-center gap-4 backdrop-blur-md transition-all duration-350 hover:-translate-y-1 hover:shadow-md">
                                            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-md transition-opacity duration-350" />
                                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center relative z-10">
                                                <UserCheck size={22} />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحسابات النشطة حالياً</p>
                                                <h4 className="text-3xl font-black mt-1 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{usersList.length}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Users List Table */}
                                    <div className="bg-white/80 dark:bg-slate-900/40 rounded-3xl shadow-sm p-8 backdrop-blur-md">
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
                                                                        {new Date(user.created_at).toLocaleDateString('ar-EG-u-nu-latn', { dateStyle: 'short' })}
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
                                                                                className="text-blue-650 hover:text-blue-700 dark:hover:text-blue-400 transition-all flex items-center justify-center p-1.5"
                                                                                title="تعديل بيانات المستخدم"
                                                                            >
                                                                                <Pencil size={15} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => triggerDeleteUser(user.id_users, user.full_name)}
                                                                                className="text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 transition-all flex items-center justify-center p-1.5"
                                                                                title="حذف الحساب"
                                                                            >
                                                                                <Trash2 size={15} />
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
                                        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/40 rounded-3xl p-6 shadow-sm flex items-center gap-4 backdrop-blur-md transition-all duration-350 hover:-translate-y-1 hover:shadow-md">
                                            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-650 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-md transition-opacity duration-350" />
                                            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center relative z-10">
                                                <Building2 size={22} />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي شركات الطيران</p>
                                                <h4 className="text-3xl font-black mt-1 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{companiesList.length}</h4>
                                            </div>
                                        </div>
                                        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/40 rounded-3xl p-6 shadow-sm flex items-center gap-4 backdrop-blur-md transition-all duration-350 hover:-translate-y-1 hover:shadow-md">
                                            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-650 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-md transition-opacity duration-350" />
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center relative z-10">
                                                <Plane size={22} />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الشركات النشطة</p>
                                                <h4 className="text-3xl font-black mt-1 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{companiesList.length}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Companies List Table */}
                                    <div className="bg-white/80 dark:bg-slate-900/40 rounded-3xl shadow-sm p-8 backdrop-blur-md">
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
                                                        company_name: '',
                                                        airline_code: '',
                                                        username: '',
                                                        password: '',
                                                        employee_id: '',
                                                        department: ''
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
                                                            <th className="pb-4 px-4">الشركة واسم المستخدم</th>
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
                                                                                {company.username?.charAt(0).toUpperCase() || 'C'}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-black text-slate-800 dark:text-white">{company.username}</p>
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
                                                                        {company.created_at ? new Date(company.created_at).toLocaleDateString('ar-EG-u-nu-latn', { dateStyle: 'short' }) : 'غير متوفر'}
                                                                    </td>
                                                                    <td className="py-5 px-4 font-bold text-slate-500">
                                                                        {company.last_login ? new Date(company.last_login).toLocaleString('ar-EG-u-nu-latn', { dateStyle: 'short', timeStyle: 'short' }) : 'لم يسجل دخول بعد'}
                                                                    </td>
                                                                    <td className="py-5 px-4 text-left">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setIsEditingCompany(true);
                                                                                    setCompanyForm({
                                                                                        id_admin: company.id_admin,
                                                                                        company_name: company.company_name || '',
                                                                                        airline_code: company.airline_code || '',
                                                                                        username: company.username || '',
                                                                                        password: '',
                                                                                        employee_id: company.employee_id || '',
                                                                                        department: company.department || ''
                                                                                    });
                                                                                    setIsCompanyModalOpen(true);
                                                                                }}
                                                                                className="text-blue-500 hover:text-blue-600 dark:text-blue-450 dark:hover:text-blue-350 transition-colors p-1.5 cursor-pointer"
                                                                                title="تعديل بيانات الشركة"
                                                                            >
                                                                                <Pencil size={16} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => triggerDeleteCompany(company.id_admin, company.company_name)}
                                                                                className="text-rose-500 hover:text-rose-600 dark:text-rose-450 dark:hover:text-rose-350 transition-colors p-1.5 cursor-pointer"
                                                                                title="حذف الحساب"
                                                                            >
                                                                                <Trash2 size={16} />
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

                            {/* ===== VIEW: BOOKINGS MANAGEMENT ===== */}
                            {activeTab === 'bookings' && (
                                <div className="space-y-6">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Total Bookings */}
                                        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/40 rounded-3xl p-6 shadow-sm flex items-center gap-4 backdrop-blur-md transition-all duration-350 hover:-translate-y-1 hover:shadow-md">
                                            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-650 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-md transition-opacity duration-350" />
                                            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center relative z-10">
                                                <Ticket size={22} />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الحجوزات</p>
                                                <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{bookingsList.length}</h4>
                                            </div>
                                        </div>

                                        {/* Certain Bookings */}
                                        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/40 rounded-3xl p-6 shadow-sm flex items-center gap-4 backdrop-blur-md transition-all duration-350 hover:-translate-y-1 hover:shadow-md">
                                            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-md transition-opacity duration-350" />
                                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center relative z-10">
                                                <CheckCircle size={22} />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحجوزات المؤكدة</p>
                                                <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                    {bookingsList.filter(b => b.status === 'certain').length}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Pending Bookings */}
                                        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/40 rounded-3xl p-6 shadow-sm flex items-center gap-4 backdrop-blur-md transition-all duration-350 hover:-translate-y-1 hover:shadow-md">
                                            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-650 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-md transition-opacity duration-350" />
                                            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center relative z-10">
                                                <Clock size={22} />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحجوزات المعلقة</p>
                                                <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                    {bookingsList.filter(b => b.status === 'pending').length}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Canceled Bookings */}
                                        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/40 rounded-3xl p-6 shadow-sm flex items-center gap-4 backdrop-blur-md transition-all duration-350 hover:-translate-y-1 hover:shadow-md">
                                            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-rose-500 to-red-650 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-md transition-opacity duration-350" />
                                            <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center relative z-10">
                                                <XCircle size={22} />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحجوزات الملغاة</p>
                                                <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                                    {bookingsList.filter(b => b.status === 'canceled').length}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bookings Table Container */}
                                    <div className="bg-white/80 dark:bg-slate-900/40 rounded-3xl shadow-sm p-8 backdrop-blur-md">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                            <div>
                                                <h4 className="text-sm font-black">جميع حجوزات النظام</h4>
                                                <p className="text-xs text-slate-400 mt-1">تصفح وتحديث وإلغاء حجوزات المسافرين وحالة الدفع بشكل فوري</p>
                                            </div>

                                            {/* Search Bar */}
                                            <div className="relative w-full md:w-96">
                                                <input
                                                    type="text"
                                                    placeholder="البحث باسم المسافر، رقم الرحلة، أو كود الحجز المرجعي..."
                                                    value={bookingSearchQuery}
                                                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                                                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-2xl py-3 pr-10 pl-4 text-xs font-bold outline-none transition-all dark:text-white"
                                                />
                                                <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                {bookingSearchQuery && (
                                                    <button
                                                        onClick={() => setBookingSearchQuery('')}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {loadingBookings ? (
                                            <div className="py-20 text-center text-slate-400 font-bold">جاري تحميل قائمة الحجوزات...</div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-right text-xs">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black uppercase">
                                                            <th className="pb-4 px-4">الرمز المرجعي</th>
                                                            <th className="pb-4 px-4">الرحلة والمسار</th>
                                                            <th className="pb-4 px-4">المسافرون</th>
                                                            <th className="pb-4 px-4 text-center">القيمة الإجمالية</th>
                                                            <th className="pb-4 px-4">تاريخ الحجز</th>
                                                            <th className="pb-4 px-4">حالة الحجز والدفع</th>
                                                            <th className="pb-4 px-4 text-left">إجراءات المسؤول</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                        {filteredBookings.length > 0 ? (
                                                            filteredBookings.map((booking) => (
                                                                <tr key={booking.id_bookings} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                                    {/* Booking Reference */}
                                                                    <td className="py-5 px-4 font-black text-slate-900 dark:text-white">
                                                                        <div>
                                                                            <p className="font-mono font-bold text-slate-800 dark:text-white tracking-wider">
                                                                                {booking.booking_reference}
                                                                            </p>
                                                                            <p className="text-[10px] text-slate-405 dark:text-slate-400">ID: #{booking.id_bookings}</p>
                                                                        </div>
                                                                    </td>

                                                                    {/* Flight & Route */}
                                                                    <td className="py-5 px-4">
                                                                        <div className="space-y-1">
                                                                            <p className="font-black text-slate-800 dark:text-white">
                                                                                {booking.flight_number}
                                                                            </p>
                                                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                                                {getDestinationName(booking.airportOrigin_code)} ➔ {getDestinationName(booking.airportDestination_code)}
                                                                            </p>
                                                                            <p className="text-[9px] text-slate-400 flex items-center gap-1">
                                                                                <Calendar size={10} />
                                                                                الإقلاع: {new Date(booking.departure_time).toLocaleString('ar-EG-u-nu-latn', { dateStyle: 'short', timeStyle: 'short' })}
                                                                            </p>
                                                                        </div>
                                                                    </td>

                                                                    {/* Passengers */}
                                                                    <td className="py-5 px-4 font-bold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-slate-800 dark:text-slate-200">
                                                                                {booking.passengers || 'لا يوجد مسافرين'}
                                                                            </span>
                                                                            <span className="text-[10px] text-slate-400">
                                                                                العدد: {booking.total_passengers}
                                                                            </span>
                                                                        </div>
                                                                    </td>

                                                                    {/* Total Price */}
                                                                    <td className="py-5 px-4 text-center font-black text-blue-600 dark:text-blue-400">
                                                                        ${parseFloat(booking.final_price || 0).toLocaleString('en-US')}
                                                                    </td>

                                                                    {/* Booking Date */}
                                                                    <td className="py-5 px-4 font-bold text-slate-500">
                                                                        {new Date(booking.booking_date).toLocaleDateString('ar-EG-u-nu-latn', { dateStyle: 'medium' })}
                                                                    </td>

                                                                    {/* Status Badges */}
                                                                    <td className="py-5 px-4">
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {/* Booking status badge */}
                                                                            {booking.status === 'certain' && (
                                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                                                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                                    حجز مؤكد
                                                                                </span>
                                                                            )}
                                                                            {booking.status === 'pending' && (
                                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10">
                                                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                                                    حجز معلق
                                                                                </span>
                                                                            )}
                                                                            {booking.status === 'canceled' && (
                                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10">
                                                                                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                                                    حجز ملغي
                                                                                </span>
                                                                            )}

                                                                            {/* Payment status badge */}
                                                                            {booking.payment_status === 'success' ? (
                                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">
                                                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                                                    مدفوع
                                                                                </span>
                                                                            ) : booking.payment_status === 'pending' ? (
                                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10">
                                                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                                                    قيد الدفع
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10">
                                                                                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                                                    غير مدفوع
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>

                                                                    {/* Action Buttons */}
                                                                    <td className="py-5 px-4 text-left">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            {updatingBookingId === booking.id_bookings ? (
                                                                                <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent animate-spin rounded-full mx-6" />
                                                                            ) : (
                                                                                <>
                                                                                    {booking.status === 'pending' && (
                                                                                        <button
                                                                                            onClick={() => handleUpdateBookingStatus(booking.id_bookings, 'certain', 'success')}
                                                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-[11px] font-black border border-emerald-500/20"
                                                                                            title="تأكيد الحجز والدفع"
                                                                                        >
                                                                                            <Check size={12} />
                                                                                            <span>تأكيد</span>
                                                                                        </button>
                                                                                    )}
                                                                                    {(booking.status === 'pending' || booking.status === 'certain') && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setCancelBookingTargetId(booking.id_bookings);
                                                                                                setIsCancelBookingModalOpen(true);
                                                                                            }}
                                                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all text-[11px] font-black border border-rose-500/20"
                                                                                            title="إلغاء الحجز وتغيير الدفع إلى فاشل"
                                                                                        >
                                                                                            <X size={12} />
                                                                                            <span>إلغاء</span>
                                                                                        </button>
                                                                                    )}
                                                                                    {booking.status === 'canceled' && (
                                                                                        <span className="text-[10px] text-slate-400 font-bold px-4">
                                                                                            لا توجد إجراءات
                                                                                        </span>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">لا يوجد حجوزات مطابقة للبحث حالياً</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ===== VIEW: MESSAGES & COMPLAINTS ===== */}
                            {activeTab === 'messages' && (
                                <Messages token={token} showToast={showToast} />
                            )}
                        </>
                    )}
                </div>
            </main>



            {/* ===== COMPANY MODAL (ADD/EDIT COMPANY FORM) ===== */}
            {isCompanyModalOpen && (
                <div className="fixed inset-0 bg-slate-950/10 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in select-none">
                    <div className="bg-white modal-solid-bg dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
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

                        <form onSubmit={isEditingCompany ? handleUpdateCompany : handleCreateCompany} className="space-y-4" autoComplete="off">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-700">اسم الشركة</label>
                                    <input
                                        type="text"
                                        placeholder=""
                                        value={companyForm.company_name}
                                        onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                                        required
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-700">رمز الطيران (airline_code)</label>
                                    <input
                                        type="text"
                                        placeholder=""
                                        value={companyForm.airline_code}
                                        onChange={(e) => setCompanyForm({ ...companyForm, airline_code: e.target.value.toUpperCase() })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-700">اسم المستخدم للشركة</label>
                                    <input
                                        type="text"
                                        placeholder=""
                                        value={companyForm.username}
                                        onChange={(e) => setCompanyForm({ ...companyForm, username: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                                        required
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-700">كلمة المرور</label>
                                    <input
                                        type="password"
                                        placeholder={isEditingCompany ? 'اتركها فارغة للمحافظة عليها' : ''}
                                        value={companyForm.password}
                                        onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                                        required={!isEditingCompany}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-700">رقم الموظف (employee_id)</label>
                                    <input
                                        type="text"
                                        placeholder=""
                                        value={companyForm.employee_id}
                                        onChange={(e) => setCompanyForm({ ...companyForm, employee_id: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                                        required
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-700">القسم (department)</label>
                                    <input
                                        type="text"
                                        placeholder=""
                                        value={companyForm.department}
                                        onChange={(e) => setCompanyForm({ ...companyForm, department: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                                        required
                                        autoComplete="off"
                                    />
                                </div>
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
                <div className="fixed inset-0 bg-slate-950/10 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in select-none">
                    <div className="bg-white modal-solid-bg dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
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

                        <form onSubmit={isEditingUser ? handleUpdateUser : handleCreateUser} className="space-y-4" autoComplete="off">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-700">الاسم الكامل</label>
                                <input
                                    type="text"
                                    placeholder=""
                                    value={userForm.full_name}
                                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-700">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    placeholder=""
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-700">رقم الهاتف</label>
                                <input
                                    type="text"
                                    placeholder=""
                                    value={userForm.phone}
                                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                    autoComplete="off"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-700">كلمة المرور</label>
                                <input
                                    type="password"
                                    placeholder={isEditingUser ? 'اتركها فارغة إذا لم تكن تريد تغييرها' : ''}
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                                    required={!isEditingUser}
                                    autoComplete="new-password"
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

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-slate-950/10 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in select-none">
                    <div className="bg-white modal-solid-bg rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <Trash2 size={24} />
                        </div>
                        <h4 className="text-base font-black text-slate-800 mb-2 font-brand">تأكيد حذف الحساب</h4>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            هل أنت متأكد من حذف الحساب الخاص بـ <span className="font-extrabold text-slate-850">"{deleteTarget.label}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteTarget({ id: null, type: null, label: '' });
                                }}
                                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold w-full transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-500/10 w-full transition-colors"
                            >
                                حذف نهائي
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CANCEL BOOKING CONFIRMATION MODAL ===== */}
            {isCancelBookingModalOpen && (
                <div className="fixed inset-0 bg-slate-950/10 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in select-none" dir="rtl">
                    <div className="bg-white modal-solid-bg rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center animate-zoom-in">
                        <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <X size={24} />
                        </div>
                        <h4 className="text-base font-black text-slate-800 mb-2 font-brand">تأكيد إلغاء الحجز</h4>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            هل أنت متأكد من إلغاء هذا الحجز وتغيير حالة الدفع إلى فاشل؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCancelBookingModalOpen(false);
                                    setCancelBookingTargetId(null);
                                }}
                                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold w-full transition-colors"
                            >
                                تراجع
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleUpdateBookingStatus(cancelBookingTargetId, 'canceled', 'failed');
                                    setIsCancelBookingModalOpen(false);
                                    setCancelBookingTargetId(null);
                                }}
                                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-500/10 w-full transition-colors"
                            >
                                تأكيد الإلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
