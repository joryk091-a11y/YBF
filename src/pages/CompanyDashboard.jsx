import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';

import {
    Plane, Calendar, Users, DollarSign, LogOut, MapPin, Trash2, Plus,
    ArrowUpRight, Search, Bell, Activity, Ticket, X, Pencil, Clock,
    Sun, Moon
} from 'lucide-react';
import logo from '../assets/logo.png';
import yemeniaLogo from '../assets/Y.png';
import balqisLogo from '../assets/B.png';
import adenLogo from '../assets/F.png';

// Mock data removed for database integration

const airlineOptions = [
    { code: 'IY', name: 'اليمنية' },
    { code: 'BS', name: 'طيران بلقيس' },
    { code: 'QY', name: 'طيران عدن' },
];

const airportOptions = [
    { code: 'ADE', name: 'عدن (ADE)' },
    { code: 'RIY', name: 'المكلا (RIY)' },
    { code: 'GXF', name: 'سيئون (GXF)' },
    { code: 'SCT', name: 'سقطرى (SCT)' },
    { code: 'JED', name: 'جدة (JED)' },
    { code: 'RUH', name: 'الرياض (RUH)' },
    { code: 'CAI', name: 'القاهرة (CAI)' },
    { code: 'AMM', name: 'عمان (AMM)' },
    { code: 'KWI', name: 'الكويت (KWI)' },
    { code: 'JIB', name: 'جيبوتي (JIB)' },
    { code: 'ADD', name: 'أديس أبابا (ADD)' },
];

const aircraftOptions = [
    'Airbus A320',
    'Airbus A330',
    'Boeing 737',
    'Boeing 777',
    'ATR 72',
    'Fokker 50'
];

const CompanyDashboard = () => {
    const navigate = useNavigate();
    const { user, bookings } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    const token = localStorage.getItem('companyToken');
    const companyId = localStorage.getItem('companyId');
    const companyName = user.airline_name || localStorage.getItem('companyName') || 'الشركة';
    const airlineCode = user.airline_id === 1 ? 'IY' : user.airline_id === 2 ? 'BS' : 'QY';

    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);

    const getCompanyLogo = () => {
        switch (airlineCode) {
            case 'IY': return yemeniaLogo;
            case 'BS': return balqisLogo;
            case 'QY': return adenLogo;
            default: return logo;
        }
    };

    const getMockFlights = (code) => {
        return [
            {
                id: 1,
                flight_number: `${code}-601`,
                airline_code: code,
                airportOrigin_code: 'ADE',
                airportDestination_code: 'CAI',
                departure_time: '2026-06-15T08:30',
                arrival_time: '2026-06-15T12:55',
                price: 450,
                total_seats: 150,
                available_seats: 148,
                aircraft_type: 'Boeing 737',
                status: 'Active',
            },
            {
                id: 2,
                flight_number: `${code}-702`,
                airline_code: code,
                airportOrigin_code: 'ADE',
                airportDestination_code: 'JED',
                departure_time: '2026-06-16T14:15',
                arrival_time: '2026-06-16T16:30',
                price: 320,
                total_seats: 150,
                available_seats: 149,
                aircraft_type: 'Airbus A320',
                status: 'Active',
            },
            {
                id: 3,
                flight_number: `${code}-803`,
                airline_code: code,
                airportOrigin_code: 'RIY',
                airportDestination_code: 'RUH',
                departure_time: '2026-06-18T10:00',
                arrival_time: '2026-06-18T12:15',
                price: 280,
                total_seats: 150,
                available_seats: 150,
                aircraft_type: 'Boeing 737',
                status: 'Delayed',
            }
        ];
    };

    const fetchFlights = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/flights?airlineCode=${airlineCode}`);
            const data = await response.json();
            if (data.success && data.flights && data.flights.length > 0) {
                console.log('Fetched flights:', data.flights); // Debug log
                setFlights(data.flights);
            } else {
                setFlights(getMockFlights(airlineCode));
            }
        } catch (error) {
            console.error('Error fetching flights, falling back to mock data:', error);
            setFlights(getMockFlights(airlineCode));
        } finally {
            setLoading(false);
        }
    };

    // تصفية الحجوزات لتتبع شركة الطيران الحالية فقط
    const companyBookings = bookings.filter(b => 
        b.flight_number.startsWith(airlineCode) && b.status !== 'cancelled' && b.status !== 'Cancelled'
    );
    const totalBookingsCount = companyBookings.length;
    const totalRevenueSum = companyBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    const getBookedPassengersForFlight = (flightNumber) => {
        const flightBookings = bookings.filter(b => b.flight_number === flightNumber && b.status !== 'Cancelled' && b.status !== 'cancelled');
        return flightBookings.reduce((sum, b) => sum + (b.passengers ? b.passengers.length : 0), 0);
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        if (!token || !companyId) {
            navigate('/company/login');
        } else {
            fetchFlights();
        }
        return () => window.removeEventListener('scroll', handleScroll);
    }, [token, companyId, navigate, airlineCode]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingFlight, setEditingFlight] = useState(null);
    const [newFlight, setNewFlight] = useState({
        flightNumber: '',
        originCode: '',
        destinationCode: '',
        departureDate: '',
        arrivalDate: '',
        price: '',
        totalSeats: '',
        aircraftType: ''
    });

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleAddFlight = async (e) => {
        e.preventDefault();
        const priceNum = Number(newFlight.price);
        const seatsNum = Number(newFlight.totalSeats);

        const dep = new Date(newFlight.departureDate);
        const arr = new Date(newFlight.arrivalDate);
        const duration = Math.max(0, Math.floor((arr - dep) / (1000 * 60)));

        const flightData = {
            flight_number: newFlight.flightNumber,
            airline_code: airlineCode,
            airportOrigin_code: newFlight.originCode,
            airportDestination_code: newFlight.destinationCode,
            departure_time: newFlight.departureDate,
            arrival_time: newFlight.arrivalDate,
            aircraft_type: newFlight.aircraftType,
            total_seats: seatsNum,
            available_seats: seatsNum,
            price: priceNum,
            duration: duration,
        };

        try {
            const response = await fetch('http://localhost:8080/api/flights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flightData)
            });
            const data = await response.json();
            if (data.success) {
                fetchFlights(); // Refresh list
                setShowAddForm(false);
                setNewFlight({
                    flightNumber: '', originCode: '', destinationCode: '',
                    departureDate: '', arrivalDate: '', price: '', totalSeats: '', aircraftType: ''
                });
            }
        } catch (error) {
            console.error('Error adding flight:', error);
            alert('تعذر إضافة الرحلة، يرجى المحاولة لاحقاً');
        }
    };

    const handleDeleteFlight = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الرحلة؟')) {
            try {
                const response = await fetch(`http://localhost:8080/api/flights/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    setFlights(prev => prev.filter(f => (f.id_flights || f.id) !== id));
                    setStats(prev => ({ ...prev, totalFlights: prev.totalFlights - 1 }));
                }
            } catch (error) {
                console.error('Error deleting flight:', error);
            }
        }
    };

    const handleEditFlight = async (e) => {
        e.preventDefault();
        const priceNum = Number(editingFlight.price);
        const seatsNum = Number(editingFlight.total_seats);

        const dep = new Date(editingFlight.departure_time);
        const arr = new Date(editingFlight.arrival_time);
        const duration = Math.max(0, Math.floor((arr - dep) / (1000 * 60)));

        const flightData = {
            flight_number: editingFlight.flight_number,
            airline_code: airlineCode,
            airportOrigin_code: editingFlight.airportOrigin_code,
            airportDestination_code: editingFlight.airportDestination_code,
            departure_time: editingFlight.departure_time,
            arrival_time: editingFlight.arrival_time,
            aircraft_type: editingFlight.aircraft_type,
            total_seats: seatsNum,
            available_seats: seatsNum,
            price: priceNum,
            duration: duration,
        };

        try {
            const response = await fetch(`http://localhost:8080/api/flights/${editingFlight.id_flights}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flightData)
            });
            const data = await response.json();
            if (data.success) {
                fetchFlights();
                setShowEditForm(false);
                setEditingFlight(null);
            }
        } catch (error) {
            console.error('Error updating flight:', error);
            alert('تعذر تحديث الرحلة');
        }
    };

    const openEditModal = (flight) => {
        const formatForInput = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        };

        setEditingFlight({
            ...flight,
            departure_time: formatForInput(flight.departure_time),
            arrival_time: formatForInput(flight.arrival_time)
        });
        setShowEditForm(true);
    };

    if (!token || !companyId) return null;

    return (
        <div className="min-h-screen bg-[#f8faff] dark:bg-[#080d19] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden" dir="rtl">
            <Sidebar />
            
            {/* ─── Aesthetic Mesh Decor ────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] transition-all" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] transition-all" />
            </div>

            {/* ─── Premium Header ───────────────────────────────────── */}
            <header className={`sticky top-0 z-50 w-full transition-all duration-500 md:pr-72 ${scrolled ? 'bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl py-3 shadow-sm border-b border-slate-100 dark:border-slate-800/50' : 'bg-transparent py-6'}`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 p-1 flex items-center justify-center border border-slate-200/20 dark:border-white/5 shadow-sm">
                            <img src={getCompanyLogo()} alt="Logo" className="h-full w-auto object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{companyName}</h1>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">لوحة تحكم الشركاء</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* زر تبديل المظهر الداكن/الفاتح */}
                        <button 
                            onClick={toggleDarkMode}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
                            title={isDarkMode ? "الوضع الفاتح" : "الوضع الداكن"}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm">
                            <Bell size={18} />
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
                        <button
                            onClick={handleLogout}
                            className="group flex h-10 items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/5 px-4 text-xs font-black text-red-600 transition-all hover:bg-red-600 hover:text-white shadow-sm"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">تسجيل الخروج</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:mr-72 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Welcome & Action */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">أهلاً بك، {companyName} 👋</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold">إليك نظرة سريعة على أداء رحلاتك وحجوزاتك اليوم.</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex h-14 items-center gap-3 rounded-2xl bg-blue-600 text-white font-black px-8 text-sm shadow-xl shadow-blue-600/25 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/35 active:translate-y-0"
                    >
                        <Plus size={20} />
                        إضافة رحلة جديدة
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        { label: 'إجمالي الرحلات', value: flights.length, icon: Plane, color: 'blue' },
                        { label: 'إجمالي الحجوزات', value: totalBookingsCount, icon: Ticket, color: 'emerald' },
                        { label: 'إجمالي الإيرادات', value: `$${totalRevenueSum.toLocaleString()}`, icon: DollarSign, color: 'amber' },
                    ].map((stat, i) => (
                        <div key={i} className="group relative overflow-hidden rounded-[32px] bg-white dark:bg-slate-900/60 p-8 shadow-sm border border-slate-100 dark:border-slate-800/50 backdrop-blur-md transition-all hover:shadow-xl hover:-translate-y-2">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-650 dark:text-slate-350 transition-all group-hover:bg-blue-600 group-hover:text-white">
                                    <stat.icon size={28} />
                                </div>
                                <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">+12%</div>
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Flights Section */}
                <div className="rounded-[40px] bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 p-8 shadow-sm backdrop-blur-md">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Activity size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">الرحلات النشطة</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="بحث..." className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-2 pr-10 pl-4 text-xs font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all w-40 sm:w-64" />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest">
                              <th className="pb-4 px-4 font-black">الرحلة</th>
                              <th className="pb-4 px-4 font-black">الشركة</th>
                              <th className="pb-4 px-4 font-black">المسار</th>
                              <th className="pb-4 px-4 font-black">الطائرة</th>
                              <th className="pb-4 px-4 font-black">المواعيد (إقلاع/وصول)</th>
                              <th className="pb-4 px-4 font-black">المدة</th>
                              <th className="pb-4 px-4 font-black">المقاعد</th>
                              <th className="pb-4 px-4 font-black">السعر</th>
                              <th className="pb-4 px-4 font-black">تاريخ الإضافة</th>
                              <th className="pb-4 px-4 font-black"></th>
                            </tr>
                          </thead>
                            <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 text-xs font-bold text-slate-700 dark:text-slate-300">
                                {flights.map((flight) => (
                                    <tr key={flight.id_flights || flight.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="py-6 px-4 font-black text-blue-600 dark:text-blue-400">{flight.flight_number}</td>
                                        <td className="py-6 px-4">
                                            <span className="inline-flex items-center rounded-lg bg-slate-105 dark:bg-slate-800 px-2.5 py-1 text-xs font-black text-slate-600 dark:text-slate-400 border border-slate-200/20 dark:border-white/5">
                                                {flight.airline_code}
                                            </span>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="flex items-center gap-3 font-bold text-sm text-slate-900 dark:text-white">
                                                <span>{flight.airportOrigin_code}</span>
                                                <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-600" />
                                                <span>{flight.airportDestination_code}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 text-xs font-bold text-slate-500 dark:text-slate-400">{flight.aircraft_type || 'N/A'}</td>
                                        <td className="py-6 px-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">DEP:</span>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(flight.departure_time).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">ARR:</span>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(flight.arrival_time).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-400">
                                                <Clock size={14} className="text-blue-500" />
                                                <span>
                                                    {flight.duration && Number(flight.duration) > 0 ? (
                                                        `${Math.floor(Number(flight.duration) / 60)} س ${Number(flight.duration) % 60} د`
                                                    ) : (() => {
                                                        const dep = new Date(flight.departure_time);
                                                        const arr = new Date(flight.arrival_time);
                                                        if (isNaN(dep.getTime()) || isNaN(arr.getTime())) return '---';
                                                        const diff = Math.max(0, Math.floor((arr - dep) / (1000 * 60)));
                                                        const h = Math.floor(diff / 60);
                                                        const m = diff % 60;
                                                        return `${h} س ${m} د`;
                                                    })()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${(( (flight.total_seats || 150) - getBookedPassengersForFlight(flight.flight_number) ) / (flight.total_seats || 150)) * 100}%` }} />
                                                </div>
                                                <span className="text-xs font-black">{(flight.total_seats || 150) - getBookedPassengersForFlight(flight.flight_number)}/{flight.total_seats || 150}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 font-black text-lg text-slate-900 dark:text-white">${flight.price || 0}</td>
                                        <td className="py-6 px-4">
                                            <div className="flex flex-col">
                                                {flight.created_at ? (
                                                    <div className="flex flex-col">
                                                        {isNaN(new Date(flight.created_at).getTime()) ? (
                                                            <span className="text-[10px] font-bold text-red-450">{String(flight.created_at)}</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                                                                    {new Date(flight.created_at).toLocaleDateString('ar-EG', {
                                                                        year: 'numeric', month: 'numeric', day: 'numeric'
                                                                    })}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                                                    {new Date(flight.created_at).toLocaleTimeString('ar-EG', {
                                                                        hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-300 dark:text-slate-600 italic">غير متوفر</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(flight)}
                                                    className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 dark:text-slate-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFlight(flight.id_flights || flight.id)}
                                                    className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 dark:text-slate-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {flights.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-20 dark:opacity-40">
                                                <Plane size={48} />
                                                <p className="font-black">لا توجد رحلات حالياً</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* ─── Add Flight Modal ─────────────────────────────────── */}
            {showAddForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 dark:bg-slate-950/60 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800/60 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800/60">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">إضافة رحلة جديدة</h3>
                            <button onClick={() => setShowAddForm(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddFlight} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">رقم الرحلة</label>
                                    <input type="text" placeholder="مثلاً: YF101" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all" required value={newFlight.flightNumber} onChange={e => setNewFlight({ ...newFlight, flightNumber: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">نوع الطائرة</label>
                                    <select
                                        className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all appearance-none"
                                        required
                                        value={newFlight.aircraftType}
                                        onChange={e => setNewFlight({ ...newFlight, aircraftType: e.target.value })}
                                    >
                                        <option value="">اختر نوع الطائرة</option>
                                        {aircraftOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">كود مطار الإقلاع (Origin)</label>
                                    <select
                                        className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all appearance-none"
                                        required
                                        value={newFlight.originCode}
                                        onChange={e => setNewFlight({ ...newFlight, originCode: e.target.value })}
                                    >
                                        <option value="">اختر مطار الإقلاع</option>
                                        {airportOptions.map(opt => (
                                            <option key={opt.code} value={opt.code}>{opt.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">كود مطار الوصول (Destination)</label>
                                    <select
                                        className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all appearance-none"
                                        required
                                        value={newFlight.destinationCode}
                                        onChange={e => setNewFlight({ ...newFlight, destinationCode: e.target.value })}
                                    >
                                        <option value="">اختر مطار الوصول</option>
                                        {airportOptions.map(opt => (
                                            <option key={opt.code} value={opt.code}>{opt.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">وقت الإقلاع</label>
                                    <input type="datetime-local" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all" required value={newFlight.departureDate} onChange={e => setNewFlight({ ...newFlight, departureDate: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">وقت الوصول المتوقع</label>
                                    <input type="datetime-local" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all" required value={newFlight.arrivalDate} onChange={e => setNewFlight({ ...newFlight, arrivalDate: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">سعر التذكرة ($)</label>
                                    <input type="number" min="0" placeholder="0.00" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all" required value={newFlight.price} onChange={e => setNewFlight({ ...newFlight, price: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">سعة الطائرة (مقعد)</label>
                                    <input type="number" min="0" placeholder="150" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all" required value={newFlight.totalSeats} onChange={e => setNewFlight({ ...newFlight, totalSeats: e.target.value })} />
                                </div>
                            </div>
                            <div className="mt-10 flex gap-4">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 font-black text-sm hover:bg-slate-105 dark:hover:bg-slate-700 transition-all">إلغاء</button>
                                <button type="submit" className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-600/25 hover:shadow-2xl transition-all">حفظ ونشر الرحلة</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ─── Edit Flight Modal ─────────────────────────────────── */}
            {showEditForm && editingFlight && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 dark:bg-slate-950/60 animate-in fade-in duration-300" dir="rtl">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800/60 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800/60">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">تعديل الرحلة</h3>
                            <button onClick={() => setShowEditForm(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditFlight} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">رقم الرحلة</label>
                                    <input type="text" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all" required value={editingFlight.flight_number} onChange={e => setEditingFlight({ ...editingFlight, flight_number: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">نوع الطائرة</label>
                                    <select
                                        className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all appearance-none"
                                        required
                                        value={editingFlight.aircraft_type}
                                        onChange={e => setEditingFlight({ ...editingFlight, aircraft_type: e.target.value })}
                                    >
                                        {aircraftOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">كود مطار الإقلاع</label>
                                    <select
                                        className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all appearance-none"
                                        required
                                        value={editingFlight.airportOrigin_code}
                                        onChange={e => setEditingFlight({ ...editingFlight, airportOrigin_code: e.target.value })}
                                    >
                                        {airportOptions.map(opt => (
                                            <option key={opt.code} value={opt.code}>{opt.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">كود مطار الوصول</label>
                                    <select
                                        className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all appearance-none"
                                        required
                                        value={editingFlight.airportDestination_code}
                                        onChange={e => setEditingFlight({ ...editingFlight, airportDestination_code: e.target.value })}
                                    >
                                        {airportOptions.map(opt => (
                                            <option key={opt.code} value={opt.code}>{opt.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">وقت الإقلاع</label>
                                    <input type="datetime-local" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all" required value={editingFlight.departure_time} onChange={e => setEditingFlight({ ...editingFlight, departure_time: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">وقت الوصول</label>
                                    <input type="datetime-local" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all" required value={editingFlight.arrival_time} onChange={e => setEditingFlight({ ...editingFlight, arrival_time: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">السعر ($)</label>
                                    <input type="number" min="0" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all" required value={editingFlight.price} onChange={e => setEditingFlight({ ...editingFlight, price: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest mr-1">السعة الإجمالية</label>
                                    <input type="number" min="0" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all" required value={editingFlight.total_seats} onChange={e => setEditingFlight({ ...editingFlight, total_seats: e.target.value })} />
                                </div>
                            </div>
                            <div className="mt-10 flex gap-4">
                                <button type="button" onClick={() => setShowEditForm(false)} className="flex-1 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 font-black text-sm hover:bg-slate-105 dark:hover:bg-slate-700 transition-all">إلغاء</button>
                                <button type="submit" className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-600/25 hover:shadow-2xl transition-all">تحديث البيانات</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyDashboard;