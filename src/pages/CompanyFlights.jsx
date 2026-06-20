import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  TrendingUp
} from 'lucide-react';
import * as XLSX from 'xlsx';

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
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  // حالات السحب والإفلات والتحميل والإشعارات
  const [isDragActive, setIsDragActive] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // الحصول على كود واسم الشركة بشكل آمن
  const companyName = user?.airline_name || localStorage.getItem('companyName') || 'الشركة';
  const airlineCode = localStorage.getItem('airlineCode') || (user?.airline_id === 1 ? 'IY' : user?.airline_id === 2 ? 'BS' : 'FA');
  const airlineId = localStorage.getItem('companyId') || user?.airline_id || '';

  // رحلات شركة الطيران النشطة من قاعدة البيانات
  const [flights, setFlights] = useState([]);

  // دالة جلب الرحلات الحقيقية من قاعدة البيانات مغلفة بـ useCallback لتجنب التحذيرات
  const fetchFlights = useCallback(async () => {
    try {
      await Promise.resolve();
      setLoading(true);
      const code = airlineCode || 'IY';
      const res = await fetch(`http://localhost:8080/api/flights?airlineCode=${code}&airline_id=${airlineId || ''}`);
      const data = await res.json();
      if (data.success) {
        // مطابقة الحقول القادمة من قاعدة البيانات مع هيكلية الواجهة الأمامية
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

  // إعادة تحميل الرحلات عند تغير شركة الطيران أو الكود
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFlights();
  }, [fetchFlights]);

  // إدارة النوافذ المنبثقة
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);

  // حقول نموذج الإضافة
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

  // حساب الإحصائيات ديناميكياً
  const totalFlights = flights.length;
  const cancelledFlights = flights.filter(f => f.status === 'Cancelled').length;
  const totalPassengers = flights.reduce((sum, f) => sum + (f.passenger_count || 0), 0);

  // معالجة اختيار الملف وقراءته وحفظه في قاعدة البيانات حقيقياً
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

  // معالجات أحداث السحب والإفلات
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

  // فتح مستكشف الملفات
  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileImport(e.target.files[0]);
    }
  };

  // إضافة رحلة جديدة يدوياً لقاعدة البيانات
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
        arrival_time: newFlight.arrival_time || newFlight.departure_time, // fallback to departure time if empty
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

  // إلغاء رحلة في قاعدة البيانات (تغيير الحالة لـ Cancelled)
  const handleCancelFlight = async (flight) => {
    if (window.confirm('هل أنت متأكد من إلغاء هذه الرحلة؟')) {
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
      }
      setTimeout(() => setToast(null), 3000);
    }
  };

  // مساعد تنسيق وقت datetime-local
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

  // فتح نافذة التعديل مع تعبئة الحقول المناسبة
  const openEditModal = (flight) => {
    setEditingFlight({
      ...flight,
      departure_time: formatDateForInput(flight.departure_time),
      arrival_time: formatDateForInput(flight.arrival_time),
    });
    setShowEditModal(true);
  };

  // حفظ التعديلات في قاعدة البيانات حقيقياً
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

  // تصفية الرحلات بالبحث
  const filteredFlights = flights.filter(f =>
    (f.flight_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.origin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.destination || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0b1120] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden" dir="rtl">
      {/* ─── Aesthetic Mesh Decor ────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      {/* القائمة الجانبية */}
      <Sidebar />

      {/* المحتوى الرئيسي للمدير */}
      <main className="flex-1 mr-72 p-10 relative z-10 min-h-screen">
        
        {/* العناوين والترحيب */}
        <div className="mb-10">
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
            إدارة العمليات اليومية
          </span>
          <h1 className="text-3xl font-black tracking-tight">إدارة رحلات {companyName}</h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">
            متابعة وجدولة وتعديل حالات رحلات الطيران واستيراد الجداول من ملفات Excel.
          </p>
        </div>

        {/* 1. بطاقات الأداء (KPI Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* بطاقة إجمالي الرحلات */}
          <div className="group relative overflow-hidden rounded-[36px] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xl transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Plane size={24} />
              </div>
              <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black">
                <TrendingUp size={12} />
                <span>+12.5%</span>
              </div>
            </div>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              رحلات الشركة هذا الشهر
            </p>
            <h3 className="text-3xl font-black tracking-tight">{totalFlights} رحلة</h3>
          </div>

          {/* بطاقة إجمالي ركاب الرحلات */}
          <div className="group relative overflow-hidden rounded-[36px] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xl transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Users size={24} />
              </div>
              <div className="flex items-center gap-1 bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full text-[10px] font-black">
                <span>نشط حالياً</span>
              </div>
            </div>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              إجمالي ركاب الرحلات
            </p>
            <h3 className="text-3xl font-black tracking-tight text-purple-600 dark:text-purple-400">{totalPassengers} مسافر</h3>
          </div>

          {/* بطاقة الرحلات الملغاة */}
          <div className="group relative overflow-hidden rounded-[36px] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xl transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                <XCircle size={24} />
              </div>
              <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black">
                <span>-50.0%</span>
              </div>
            </div>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              الرحلات الملغاة
            </p>
            <h3 className="text-3xl font-black tracking-tight text-red-500">{cancelledFlights} رحلة</h3>
          </div>
        </div>

        {/* 2. منطقة رفع واستيراد ملفات الإكسل (Excel Dropzone) */}
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
            className={`relative overflow-hidden rounded-[36px] border-2 border-dashed p-10 text-center transition-all duration-300 ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/5 shadow-2xl'
                : 'border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* واجهة التحميل الوهمية */}
            {isImporting ? (
              <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-300">
                <Loader2 size={44} className="text-blue-600 dark:text-blue-400 animate-spin mb-4" />
                <h4 className="text-base font-black mb-1">جاري استيراد جدول الرحلات...</h4>
                <p className="text-[11px] text-slate-400 font-bold">يتم قراءة حقول ملف Excel ومطابقتها مع قاعدة البيانات</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center cursor-pointer">
                <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 border border-green-500/20 mb-5 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <FileSpreadsheet size={36} />
                </div>
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

        {/* 3. شريط الأدوات (Toolbar) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* البحث */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث برقم الرحلة أو كود المطار..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pr-12 pl-4 text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm shadow-blue-500/2"
            />
          </div>

          {/* إضافة رحلة */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex h-13 items-center gap-2 rounded-2xl bg-blue-600 px-6 text-xs font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus size={16} />
            إضافة رحلة جديدة
          </button>
        </div>

        {/* 4. الجدول المتجاوب */}
        <div className="rounded-[40px] border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 shadow-sm backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">رقم الرحلة</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">مطار الإقلاع</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">مطار الوصول</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">التاريخ والوقت</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">عدد الركاب</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">الحالة</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4 text-left">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 size={36} className="text-blue-600 dark:text-blue-400 animate-spin" />
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
                    <tr key={flight.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-6 px-4 font-black text-blue-600">{flight.flight_number}</td>
                      <td className="py-6 px-4">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-black text-slate-600 dark:text-slate-300">
                          {flight.origin}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-black text-slate-600 dark:text-slate-300">
                          {flight.destination}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <Clock size={14} className="text-slate-400" />
                          <span>
                            {new Date(flight.departure_time).toLocaleString('ar-EG', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <span className="inline-flex items-center rounded-lg bg-blue-500/10 dark:bg-blue-900/20 px-2.5 py-1 text-xs font-black text-blue-600 dark:text-blue-400">
                          {flight.passenger_count || 0} ركاب
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black ${
                          flight.status === 'Active'
                            ? 'bg-green-500/10 text-green-500'
                            : flight.status === 'Delayed'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${
                            flight.status === 'Active'
                              ? 'bg-green-500'
                              : flight.status === 'Delayed'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`} />
                          {flight.status === 'Active' ? 'نشطة' : flight.status === 'Delayed' ? 'متأخرة' : 'ملغاة'}
                        </span>
                      </td>
                      <td className="py-6 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          {/* تعديل */}
                          <button
                            onClick={() => openEditModal(flight)}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                            title="تعديل الرحلة"
                          >
                            <Pencil size={15} />
                          </button>
                          {/* إلغاء */}
                          {flight.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancelFlight(flight)}
                              className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="إلغاء الرحلة"
                            >
                              <X size={15} />
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

        {/* ─── 5. النافذة المنبثقة لإضافة رحلة (Add Flight Modal) ─── */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
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
                  {/* رقم الرحلة */}
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
                  
                  {/* السعر */}
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

                  {/* مطار الإقلاع */}
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

                  {/* مطار الوصول */}
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

                  {/* وقت الإقلاع */}
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

                  {/* وقت الوصول */}
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

                  {/* نوع الطائرة */}
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

                  {/* السعة الإجمالية */}
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

        {/* ─── 6. النافذة المنبثقة لتعديل رحلة (Edit Flight Modal) ─── */}
        {showEditModal && editingFlight && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
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
                  {/* رقم الرحلة */}
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

                  {/* السعر */}
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

                  {/* مطار الإقلاع */}
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

                  {/* مطار الوصول */}
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

                  {/* وقت الإقلاع */}
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

                  {/* وقت الوصول */}
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

                  {/* نوع الطائرة */}
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

                  {/* السعة الإجمالية */}
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

                  {/* الحالة */}
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

        {/* ─── 7. إشعارات الـ Toast العائمة ─── */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-[20px] px-6 py-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-black">{toast.message}</span>
          </div>
        )}

      </main>
    </div>
  );
}
