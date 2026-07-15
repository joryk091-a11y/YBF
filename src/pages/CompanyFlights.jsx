import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  Plane,
  Plus,
  Search,
  Activity,
  X,
  Pencil,
  Clock,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Loader2,
  Users,
  TrendingUp,
  Bell
} from 'lucide-react';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import yemeniaLogo from '../assets/Y.png';
import balqisLogo from '../assets/B.png';
import adenLogo from '../assets/F.png';

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

export default function CompanyFlights() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  
  const [isDragActive, setIsDragActive] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [flightToCancel, setFlightToCancel] = useState(null);

  
  const companyName = user?.airline_name || localStorage.getItem('companyName') || 'الشركة';
  const airlineCode = localStorage.getItem('airlineCode') || (user?.airline_id === 1 ? 'IY' : user?.airline_id === 2 ? 'BS' : 'FA');
  const airlineId = localStorage.getItem('companyId') || user?.airline_id || '';

  const getCompanyLogo = () => {
    if (user?.logo_url) return user.logo_url;
    switch (airlineCode) {
      case 'IY': return yemeniaLogo;
      case 'BS': return balqisLogo;
      case 'QA': return balqisLogo;
      case 'QY': return adenLogo;
      case 'DH': return adenLogo;
      case 'QTB': return adenLogo;
      default: return logo;
    }
  };

  useEffect(() => {
    if (airlineId) {
      fetch(`http://localhost:8080/api/bookings/pending?airline_id=${airlineId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPendingCount(data.bookings ? data.bookings.length : 0);
          }
        })
        .catch(err => console.error('Error fetching pending count:', err));
    }
  }, [airlineId]);

  
  const [flights, setFlights] = useState([]);

  
  const fetchFlights = useCallback(async () => {
    try {
      await Promise.resolve();
      setLoading(true);
      const code = airlineCode || 'IY';
      const res = await fetch(`http://localhost:8080/api/flights?airlineCode=${code}&airline_id=${airlineId || ''}`);
      const data = await res.json();
      if (data.success) {
        
        const mapped = data.flights.map(f => ({
          id: f.id_flights,
          flight_number: f.flight_number,
          origin: f.airportOrigin_code,
          destination: f.airportDestination_code,
          departure_time: f.departure_time,
          arrival_time: f.arrival_time,
          price: Number(f.price),
          status: f.status === 'active' ? 'Active' : f.status === 'cancelled' ? 'Cancelled' : f.status === 'delayed' ? 'Delayed' : f.status,
          aircraft_type: f.aircraft_type || 'Boeing 737',
          total_seats: f.total_seats || 150,
          available_seats: f.available_seats || 150,
          passenger_count: f.passenger_count || 0
        }));
        setFlights(mapped);
      } else {
        setToast({ type: 'error', message: 'فشل في تحميل الرحلات: ' + data.error });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
      setToast({ type: 'error', message: 'خطأ في الاتصال بالخادم!' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  }, [airlineCode, airlineId]);

  
  useEffect(() => {
    
    fetchFlights();
  }, [fetchFlights]);

  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);

  
  const [newFlight, setNewFlight] = useState({
    flight_number: '',
    origin: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    aircraft_type: 'Airbus A320',
    total_seats: '150',
    price: '',
    status: 'Active'
  });

  
  const totalFlights = flights.length;
  const cancelledFlights = flights.filter(f => f.status === 'Cancelled').length;
  const totalPassengers = flights.reduce((sum, f) => sum + (f.passenger_count || 0), 0);

  
  const handleFileImport = (file) => {
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'csv') {
      setToast({ type: 'error', message: 'عذراً، يجب اختيار ملف Excel (.xlsx) أو CSV (.csv)!' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json(sheet);

        if (jsonRows.length === 0) {
          setToast({ type: 'error', message: 'الملف فارغ أو لا يحتوي على صفوف صالحة!' });
          setIsImporting(false);
          return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const row of jsonRows) {
          const flightNum = row['رقم الرحلة'] || row['flight_number'] || row['Flight Number'];
          const origin = row['مطار الإقلاع'] || row['origin'] || row['Origin'] || row['airportOrigin_code'];
          const destination = row['مطار الوصول'] || row['destination'] || row['Destination'] || row['airportDestination_code'];
          const departure = row['وقت الإقلاع'] || row['departure_time'] || row['Departure Time'] || row['Departure'];
          const arrival = row['وقت الوصول'] || row['arrival_time'] || row['Arrival Time'] || row['Arrival'];
          const price = row['السعر'] || row['price'] || row['Price'] || 0;
          const aircraft = row['نوع الطائرة'] || row['aircraft_type'] || row['Aircraft'] || 'Airbus A320';
          const seats = row['عدد المقاعد'] || row['total_seats'] || row['Total Seats'] || 150;

          if (!flightNum || !origin || !destination || !departure || !arrival) {
            failCount++;
            continue;
          }

          const formatDateTime = (val) => {
            if (!val) return null;
            if (typeof val === 'number') {
              const date = XLSX.SSF.parse_date_code(val);
              return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}T${String(date.H).padStart(2, '0')}:${String(date.M).padStart(2, '0')}`;
            }
            const d = new Date(val);
            if (isNaN(d.getTime())) return val;
            return d.toISOString().slice(0, 16);
          };

          const formattedDeparture = formatDateTime(departure);
          const formattedArrival = formatDateTime(arrival);

          const flightPayload = {
            flight_number: flightNum,
            airline_code: airlineCode,
            airline_id: user?.airline_id || 1,
            airportOrigin_code: String(origin).toUpperCase(),
            airportDestination_code: String(destination).toUpperCase(),
            departure_time: formattedDeparture,
            arrival_time: formattedArrival,
            aircraft_type: aircraft,
            total_seats: parseInt(seats, 10),
            available_seats: parseInt(seats, 10),
            status: 'active',
            price: Number(price)
          };

          const res = await fetch('http://localhost:8080/api/flights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(flightPayload)
          });
          const resData = await res.json();
          if (resData.success) {
            successCount++;
          } else {
            console.error('Failed to import row:', row, resData.error);
            failCount++;
          }
        }

        if (successCount > 0) {
          setToast({
            type: 'success',
            message: `تم بنجاح استيراد ${successCount} رحلة إلى جدول الرحلات! ${failCount > 0 ? `(فشل استيراد ${failCount} رحلة)` : ''}`
          });
          fetchFlights();
        } else {
          setToast({ type: 'error', message: 'فشل استيراد الرحلات! تأكد من مطابقة أسماء الأعمدة وصيغة البيانات.' });
        }
      } catch (err) {
        console.error('Error parsing excel file:', err);
        setToast({ type: 'error', message: 'حدث خطأ أثناء قراءة ملف الإكسل!' });
      } finally {
        setIsImporting(false);
        setTimeout(() => setToast(null), 5000);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileImport(e.dataTransfer.files[0]);
    }
  };

  
  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileImport(e.target.files[0]);
    }
  };

  
  const handleAddFlight = async (e) => {
    e.preventDefault();
    try {
      const flightPayload = {
        flight_number: newFlight.flight_number,
        airline_code: airlineCode,
        airline_id: user?.airline_id || 1,
        airportOrigin_code: newFlight.origin,
        airportDestination_code: newFlight.destination,
        departure_time: newFlight.departure_time,
        arrival_time: newFlight.arrival_time || newFlight.departure_time, 
        aircraft_type: newFlight.aircraft_type,
        total_seats: parseInt(newFlight.total_seats, 10),
        available_seats: parseInt(newFlight.total_seats, 10),
        status: 'active',
        price: Number(newFlight.price)
      };

      const res = await fetch('http://localhost:8080/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightPayload)
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: 'success', message: 'تم إضافة الرحلة الجديدة بنجاح!' });
        setShowAddModal(false);
        setNewFlight({
          flight_number: '',
          origin: '',
          destination: '',
          departure_time: '',
          arrival_time: '',
          aircraft_type: 'Airbus A320',
          total_seats: '150',
          price: '',
          status: 'Active'
        });
        fetchFlights();
      } else {
        setToast({ type: 'error', message: 'فشل إضافة الرحلة: ' + data.error });
      }
    } catch (error) {
      console.error('Error adding flight:', error);
      setToast({ type: 'error', message: 'خطأ في الاتصال بالخادم!' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  
  const handleCancelFlight = (flight) => {
    setFlightToCancel(flight);
    setCancelConfirmOpen(true);
  };

  const confirmCancelFlight = async (flight) => {
    try {
      const flightPayload = {
        flight_number: flight.flight_number,
        airline_code: airlineCode,
        airline_id: user?.airline_id || 1,
        airportOrigin_code: flight.origin,
        airportDestination_code: flight.destination,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time || flight.departure_time,
        aircraft_type: flight.aircraft_type,
        total_seats: flight.total_seats,
        available_seats: flight.available_seats,
        status: 'cancelled',
        price: flight.price
      };

      const res = await fetch(`http://localhost:8080/api/flights/${flight.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightPayload)
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: 'success', message: 'تم إلغاء الرحلة بنجاح وتحديث إحصائيات هذا الشهر.' });
        fetchFlights();
      } else {
        setToast({ type: 'error', message: 'فشل إلغاء الرحلة: ' + data.error });
      }
    } catch (error) {
      console.error('Error cancelling flight:', error);
      setToast({ type: 'error', message: 'خطأ في الاتصال بالخادم!' });
    } finally {
      setCancelConfirmOpen(false);
      setFlightToCancel(null);
    }
    setTimeout(() => setToast(null), 3000);
  };

  
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  
  const openEditModal = (flight) => {
    setEditingFlight({
      ...flight,
      departure_time: formatDateForInput(flight.departure_time),
      arrival_time: formatDateForInput(flight.arrival_time),
    });
    setShowEditModal(true);
  };

  
  const handleEditFlight = async (e) => {
    e.preventDefault();
    try {
      const statusStr = (editingFlight.status || 'active').toLowerCase();
      const dbStatus = statusStr === 'active' ? 'active' :
        statusStr === 'cancelled' ? 'cancelled' :
          statusStr === 'delayed' ? 'delayed' : statusStr;

      const flightPayload = {
        flight_number: editingFlight.flight_number,
        airline_code: airlineCode,
        airline_id: user?.airline_id || 1,
        airportOrigin_code: editingFlight.origin,
        airportDestination_code: editingFlight.destination,
        departure_time: editingFlight.departure_time,
        arrival_time: editingFlight.arrival_time || editingFlight.departure_time,
        aircraft_type: editingFlight.aircraft_type,
        total_seats: parseInt(editingFlight.total_seats, 10),
        available_seats: parseInt(editingFlight.available_seats, 10),
        status: dbStatus,
        price: Number(editingFlight.price)
      };

      const res = await fetch(`http://localhost:8080/api/flights/${editingFlight.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightPayload)
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: 'success', message: 'تم تحديث بيانات الرحلة بنجاح!' });
        setShowEditModal(false);
        setEditingFlight(null);
        fetchFlights();
      } else {
        setToast({ type: 'error', message: 'فشل التعديل: ' + data.error });
      }
    } catch (error) {
      console.error('Error updating flight:', error);
      setToast({ type: 'error', message: 'خطأ في الاتصال بالخادم!' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  
  const filteredFlights = flights.filter(f =>
    (f.flight_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.origin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.destination || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-[#080d19] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      {}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] transition-all" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] transition-all" />
      </div>

      <Sidebar />

      {}
      <header
        className="sticky top-4 z-50 transition-all duration-500 mx-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl py-3 px-6 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-150/70 dark:border-slate-800/40"
        style={{ marginRight: 'calc(var(--sidebar-width, 288px) + 1.5rem)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={getCompanyLogo()} alt="Logo" className="h-9 w-auto object-contain" />
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">{companyName}</h1>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">لوحة تحكم الشركاء</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/company/notifications')}
              className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all relative"
              title="الإشعارات والحجوزات المعلقة"
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950 animate-ping"></span>
              )}
              {pendingCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950"></span>
              )}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-505 text-white font-black px-4 text-xs shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={16} />
              <span>إضافة رحلة جديدة</span>
            </button>
          </div>
        </div>
      </header>

      {}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:mr-72 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        {}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">إدارة الرحلات</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
            متابعة وجدولة وتعديل حالات رحلات الطيران واستيراد الجداول من ملفات Excel.
          </p>
        </div>

        {}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'رحلات الشركة هذا الشهر', value: totalFlights, icon: Plane, color: 'from-blue-500 to-indigo-650', iconBg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400', shadowGlow: 'hover:shadow-blue-500/10' },
            { label: 'إجمالي ركاب الرحلات', value: totalPassengers, icon: Users, color: 'from-purple-500 to-indigo-650', iconBg: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400', shadowGlow: 'hover:shadow-purple-500/10' },
            { label: 'الرحلات الملغاة', value: cancelledFlights, icon: XCircle, color: 'from-red-500 to-rose-650', iconBg: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400', shadowGlow: 'hover:shadow-red-500/10' },
          ].map((stat, i) => (
            <div key={i} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50/40 dark:from-slate-900/60 dark:to-slate-950/60 p-6 shadow-sm border border-slate-150/70 dark:border-slate-800/40 backdrop-blur-md transition-all duration-350 hover:shadow-xl ${stat.shadowGlow} hover:-translate-y-1`}>
              {}
              <div className={`absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-lg transition-opacity duration-355`} />

              <div className="flex items-center gap-4 relative z-10">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} transition-all duration-355 group-hover:scale-105`}>
                  <stat.icon size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{stat.label}</p>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-all duration-355 group-hover:text-blue-600 dark:group-hover:text-blue-400">{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="mb-10">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .csv"
            className="hidden"
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`relative overflow-hidden rounded-[36px] border-2 border-dashed p-10 text-center transition-all duration-300 ${isDragActive
                ? 'border-blue-500 bg-blue-500/5 shadow-2xl'
                : 'border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
          >
            {}
            {isImporting ? (
              <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-300">
                <Loader2 size={44} className="text-blue-600 dark:text-blue-400 animate-spin mb-4" />
                <h4 className="text-base font-black mb-1">جاري استيراد جدول الرحلات...</h4>
                <p className="text-[11px] text-slate-400 font-bold">يتم قراءة حقول ملف Excel ومطابقتها مع قاعدة البيانات</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center cursor-pointer">
                <FileSpreadsheet size={36} className="text-green-600 dark:text-green-400 mb-4" />
                <h4 className="text-base font-black text-slate-800 dark:text-slate-100 mb-2">
                  قم بسحب وإسقاط ملف إكسل لجدول الرحلات هنا (.xlsx, .csv)
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold mb-6">
                  أو اسحب ملفك مباشرة إلى هنا لبدء الجدولة الذكية
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileSelect();
                  }}
                  className="flex h-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 text-xs font-black text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  تصفح الملفات
                </button>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-150/70 dark:border-slate-800/40 p-6 shadow-sm backdrop-blur-md overflow-hidden">
          {}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">جدول الرحلات</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="البحث برقم الرحلة أو كود المطار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 rounded-xl py-2 pr-10 pl-4 text-xs font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="pb-3 px-4 font-black">الرحلة</th>
                  <th className="pb-3 px-4 font-black">مطار الإقلاع</th>
                  <th className="pb-3 px-4 font-black">مطار الوصول</th>
                  <th className="pb-3 px-4 font-black">التاريخ والوقت</th>
                  <th className="pb-3 px-4 font-black">عدد الركاب</th>
                  <th className="pb-3 px-4 font-black">الحالة</th>
                  <th className="pb-3 px-4 font-black text-left">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30 text-xs font-bold text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 size={36} className="text-blue-650 dark:text-blue-400 animate-spin" />
                        <span className="text-xs font-bold text-slate-400">جاري تحميل الرحلات من قاعدة البيانات...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredFlights.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center text-slate-400 font-bold">
                      لا توجد رحلات مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredFlights.map((flight) => (
                    <tr key={flight.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/10 transition-colors">
                      <td className="py-5 px-4">
                        <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/15 px-2.5 py-1 rounded-lg border border-blue-500/15 font-mono tracking-wide">{flight.flight_number}</span>
                      </td>
                      <td className="py-5 px-4">
                        <span className="font-black text-[11px] bg-blue-500/5 text-blue-650 dark:text-blue-400 px-2 py-1 rounded-lg border border-blue-500/10 font-mono">
                          {flight.origin}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <span className="font-black text-[11px] bg-emerald-500/5 text-emerald-650 dark:text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/10 font-mono">
                          {flight.destination}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-mono text-slate-800 dark:text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70 shrink-0" />
                          <span>
                            {new Date(flight.departure_time).toLocaleString('ar-EG-u-nu-latn', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <span className="inline-flex items-center rounded-lg bg-blue-500/5 dark:bg-blue-500/15 px-2.5 py-1 text-xs font-black text-blue-600 dark:text-blue-400 border border-blue-500/10">
                          {flight.passenger_count || 0} ركاب
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${flight.status === 'Active'
                            ? 'bg-green-500/5 text-green-600 border border-green-550/10'
                            : flight.status === 'Delayed'
                              ? 'bg-amber-500/5 text-amber-600 border border-amber-550/10'
                              : 'bg-red-500/5 text-red-650 border border-red-550/10'
                          }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${flight.status === 'Active'
                              ? 'bg-green-500'
                              : flight.status === 'Delayed'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`} />
                          {flight.status === 'Active' ? 'نشطة' : flight.status === 'Delayed' ? 'متأخرة' : 'ملغاة'}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-left">
                        <div className="flex items-center justify-end gap-1">
                          {}
                          <button
                            onClick={() => openEditModal(flight)}
                            className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-transparent hover:border-blue-500/20"
                            title="تعديل الرحلة"
                          >
                            <Pencil size={16} />
                          </button>
                          {}
                          {flight.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancelFlight(flight)}
                              className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:bg-red-500/10 hover:text-red-650 dark:hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                              title="إلغاء الرحلة"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-900/40 overflow-y-auto animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[40px] shadow-2xl border border-slate-150 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800/50">
                <h3 className="text-2xl font-black">إضافة رحلة جديدة</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddFlight} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">رقم الرحلة</label>
                    <input
                      type="text"
                      placeholder="مثال: IY-101"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
                      required
                      value={newFlight.flight_number}
                      onChange={e => setNewFlight({ ...newFlight, flight_number: e.target.value })}
                    />
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">السعر الأساسي ($)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
                      required
                      value={newFlight.price}
                      onChange={e => setNewFlight({ ...newFlight, price: e.target.value })}
                    />
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">مطار الإقلاع (Origin)</label>
                    <div className="relative">
                      <select
                        className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 pr-10 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none dark:text-white"
                        required
                        value={newFlight.origin}
                        onChange={e => setNewFlight({ ...newFlight, origin: e.target.value })}
                      >
                        <option value="">اختر مطار الإقلاع</option>
                        {airportOptions.map(opt => (
                          <option key={opt.code} value={opt.code}>{opt.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">مطار الوصول (Destination)</label>
                    <div className="relative">
                      <select
                        className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 pr-10 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none dark:text-white"
                        required
                        value={newFlight.destination}
                        onChange={e => setNewFlight({ ...newFlight, destination: e.target.value })}
                      >
                        <option value="">اختر مطار الوصول</option>
                        {airportOptions.filter(opt => opt.code !== newFlight.origin).map(opt => (
                          <option key={opt.code} value={opt.code}>{opt.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">وقت وتاريخ الإقلاع</label>
                    <input
                      type="datetime-local"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
                      required
                      value={newFlight.departure_time}
                      onChange={e => setNewFlight({ ...newFlight, departure_time: e.target.value })}
                    />
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">وقت وتاريخ الوصول</label>
                    <input
                      type="datetime-local"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
                      required
                      value={newFlight.arrival_time}
                      onChange={e => setNewFlight({ ...newFlight, arrival_time: e.target.value })}
                    />
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">نوع الطائرة (Aircraft)</label>
                    <div className="relative">
                      <select
                        className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 pr-10 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none dark:text-white"
                        required
                        value={newFlight.aircraft_type}
                        onChange={e => setNewFlight({ ...newFlight, aircraft_type: e.target.value })}
                      >
                        {aircraftOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">عدد المقاعد الإجمالي</label>
                    <input
                      type="number"
                      placeholder="150"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
                      required
                      value={newFlight.total_seats}
                      onChange={e => setNewFlight({ ...newFlight, total_seats: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-10 flex gap-4 border-t border-slate-50 dark:border-slate-850 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 h-14 rounded-2xl bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-black text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-xl shadow-blue-600/25 hover:shadow-2xl transition-all"
                  >
                    حفظ وجدولة الرحلة
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {}
        {showEditModal && editingFlight && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-900/40 overflow-y-auto animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[40px] shadow-2xl border border-slate-150 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800/50">
                <h3 className="text-2xl font-black">تعديل الرحلة</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditFlight} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">رقم الرحلة</label>
                    <input
                      type="text"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
                      required
                      value={editingFlight.flight_number}
                      onChange={e => setEditingFlight({ ...editingFlight, flight_number: e.target.value })}
                    />
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">السعر الأساسي ($)</label>
                    <input
                      type="number"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
                      required
                      value={editingFlight.price}
                      onChange={e => setEditingFlight({ ...editingFlight, price: e.target.value })}
                    />
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">مطار الإقلاع (Origin)</label>
                    <div className="relative">
                      <select
                        className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 pr-10 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none dark:text-white"
                        required
                        value={editingFlight.origin}
                        onChange={e => setEditingFlight({ ...editingFlight, origin: e.target.value })}
                      >
                        {airportOptions.map(opt => (
                          <option key={opt.code} value={opt.code}>{opt.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">مطار الوصول (Destination)</label>
                    <div className="relative">
                      <select
                        className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 pr-10 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none dark:text-white"
                        required
                        value={editingFlight.destination}
                        onChange={e => setEditingFlight({ ...editingFlight, destination: e.target.value })}
                      >
                        {airportOptions.filter(opt => opt.code !== editingFlight.origin).map(opt => (
                          <option key={opt.code} value={opt.code}>{opt.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">وقت وتاريخ الإقلاع</label>
                    <input
                      type="datetime-local"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
                      required
                      value={editingFlight.departure_time}
                      onChange={e => setEditingFlight({ ...editingFlight, departure_time: e.target.value })}
                    />
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">وقت وتاريخ الوصول</label>
                    <input
                      type="datetime-local"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
                      required
                      value={editingFlight.arrival_time || ''}
                      onChange={e => setEditingFlight({ ...editingFlight, arrival_time: e.target.value })}
                    />
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">نوع الطائرة (Aircraft)</label>
                    <div className="relative">
                      <select
                        className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 pr-10 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none dark:text-white"
                        required
                        value={editingFlight.aircraft_type || 'Airbus A320'}
                        onChange={e => setEditingFlight({ ...editingFlight, aircraft_type: e.target.value })}
                      >
                        {aircraftOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">عدد المقاعد الإجمالي</label>
                    <input
                      type="number"
                      placeholder="150"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
                      required
                      value={editingFlight.total_seats || '150'}
                      onChange={e => setEditingFlight({ ...editingFlight, total_seats: e.target.value })}
                    />
                  </div>

                  {}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">الحالة</label>
                    <div className="relative">
                      <select
                        className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 pr-10 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none dark:text-white"
                        required
                        value={editingFlight.status}
                        onChange={e => setEditingFlight({ ...editingFlight, status: e.target.value })}
                      >
                        <option value="Active">نشطة (Active)</option>
                        <option value="Delayed">متأخرة (Delayed)</option>
                        <option value="Cancelled">ملغاة (Cancelled)</option>
                      </select>
                      <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4 border-t border-slate-50 dark:border-slate-850 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 h-14 rounded-2xl bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-black text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-xl shadow-blue-600/25 hover:shadow-2xl transition-all"
                  >
                    تحديث بيانات الرحلة
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-[20px] px-6 py-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
              }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-black">{toast.message}</span>
          </div>
        )}

        {cancelConfirmOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 dark:bg-slate-950/60 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[30px] shadow-2xl border border-slate-150/70 dark:border-slate-800/60 overflow-hidden p-8 animate-in zoom-in-95 duration-300" dir="rtl">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-500/10 mb-6">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">تأكيد إلغاء الرحلة</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mb-8">
                  هل أنت متأكد من رغبتك في إلغاء هذه الرحلة؟ سيتم تغيير حالة الرحلة إلى "ملغاة" وسيتم إعلام الركاب المرتبطين بها بهذا التحديث.
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setCancelConfirmOpen(false);
                    setFlightToCancel(null);
                  }}
                  className="flex-1 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 font-black text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-150/70 dark:border-slate-750"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (flightToCancel) {
                      await confirmCancelFlight(flightToCancel);
                    }
                  }}
                  className="flex-1 h-14 rounded-2xl bg-red-650 hover:bg-red-750 text-white font-black text-xs shadow-lg shadow-red-600/20 transition-all"
                >
                  نعم، ألغِ الرحلة
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
