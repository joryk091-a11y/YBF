import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import logoY from '../assets/Y.png';
import logoB from '../assets/B.png';
import logoF from '../assets/F.png';
import {
    Plane, Ticket, CheckCircle, XCircle, Clock,
    ChevronDown, Search, PackageX, LogIn, Users,
    Hash, CalendarDays, Banknote, CreditCard, BadgeCheck, Calendar, Download, MapPin, Trash2,
    Bell, CheckCheck, Printer
} from 'lucide-react';

const typeConfig = {
    booking: { color: 'bg-blue-500', label: 'حجز', icon: Plane },
    reminder: { color: 'bg-amber-500', label: 'تذكير', icon: Clock },
    payment: { color: 'bg-emerald-500', label: 'دفع', icon: CreditCard },
    cancellation: { color: 'bg-red-500', label: 'إلغاء', icon: XCircle },
    general: { color: 'bg-slate-400', label: 'عام', icon: Bell },
};

const formatRelativeTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
    return d.toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};


const statusConfig = {
    certain: { label: 'مؤكد', bg: 'bg-blue-500/10', text: 'text-blue-700', dot: 'bg-blue-500', icon: CheckCircle },
    temporary: { label: 'مؤقت', bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-500', icon: Clock },
    cancelled: { label: 'ملغي', bg: 'bg-red-500/10', text: 'text-red-700', dot: 'bg-red-500', icon: XCircle },
};
const paymentStatusConfig = {
    success: { label: 'مدفوع', color: 'text-blue-600' },
    pending: { label: 'قيد الانتظار', color: 'text-amber-600' },
    failed: { label: 'فاشل', color: 'text-red-600' },
};
const airlineConfig = {
    IY: { name: 'اليمنية للطيران', color: 'from-blue-800 to-indigo-950', logo: logoY },
    BS: { name: 'طيران بلقيس', color: 'from-blue-600 to-blue-900', logo: logoB },
    QY: { name: 'فلاي عدن', color: 'from-sky-500 to-sky-700', logo: logoF },
    DH: { name: 'فلاي عدن', color: 'from-sky-500 to-sky-700', logo: logoF },
    QTB: { name: 'فلاي عدن', color: 'from-sky-500 to-sky-700', logo: logoF },
};
const airportNamesConfig = {
    ADE: { city: 'عدن', airport: 'مطار عدن الدولي' },
    CAI: { city: 'القاهرة', airport: 'مطار القاهرة الدولي' },
    RUH: { city: 'الرياض', airport: 'مطار الملك خالد الدولي' },
    JED: { city: 'جدة', airport: 'مطار الملك عبد العزيز الدولي' },
    RIY: { city: 'المكلا', airport: 'مطار الريان الدولي' },
    GXF: { city: 'سيئون', airport: 'مطار سيئون الدولي' },
    SCT: { city: 'سقطرى', airport: 'مطار سقطرى الدولي' },
    AMM: { city: 'عمان', airport: 'مطار الملكة علياء الدولي' },
    KWI: { city: 'الكويت', airport: 'مطار الكويت الدولي' },
    JIB: { city: 'جيبوتي', airport: 'مطار جيبوتي الدولي' },
    ADD: { city: 'أديس أبابا', airport: 'مطار أديس أبابا بول الدولي' },
};
const paymentMethodLabel = {
    credit_card: 'بطاقة ائتمانية', card: 'بطاقة ائتمانية',
    paypal: 'PayPal', bank_transfer: 'تحويل بنكي', office: 'فروعنا',
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' }) : '—';
const formatDuration = (m) => m ? `${Math.floor(m / 60)}س ${m % 60}د` : '—';

/* ── Individual Boarding Pass for one passenger ── */
/* ── Individual Boarding Pass for one passenger ── */
function BoardingPass({ passenger, booking, index }) {
    const [showQrModal, setShowQrModal] = useState(false);
    const [downloadingItinerary, setDownloadingItinerary] = useState(false);
    const airline = airlineConfig[booking.airline_code] || { name: booking.airline_code, color: 'from-slate-600 to-slate-800' };
    const status = statusConfig[booking.status] || statusConfig.certain;
    const StatusIcon = status.icon;

    const ticketPrice = Number(booking.final_price) / (Number(booking.total_passengers) || 1);

    const originInfo = airportNamesConfig[booking.airportOrigin_code] || { city: booking.airportOrigin_code, airport: `مطار ${booking.airportOrigin_code}` };
    const destinationInfo = airportNamesConfig[booking.airportDestination_code] || { city: booking.airportDestination_code, airport: `مطار ${booking.airportDestination_code}` };

    const qrData = `BOARDING PASS\nPassenger Name: ${passenger.name}\nPassport Number: ${passenger.passport_number}\nBooking Reference: ${booking.booking_reference}\nFlight Number: ${booking.airline_code} ${booking.flight_number}\nRoute: ${originInfo.city} (${originInfo.airport}) -> ${destinationInfo.city} (${destinationInfo.airport})\nDeparture: ${formatDate(booking.departure_time)} ${formatTime(booking.departure_time)}`;

    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        let isMounted = true;
        const fetchQr = async () => {
            try {
                const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=4974f9&bgcolor=ffffff`;
                const response = await fetch(url);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (isMounted) setQrCodeUrl(reader.result);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error('Error fetching QR code:', error);
                if (isMounted) {
                    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=4974f9&bgcolor=ffffff`);
                }
            }
        };
        fetchQr();
        return () => { isMounted = false; };
    }, [qrData]);

    const handleDownloadPdf = () => {
        const dateObj = new Date(booking.departure_time);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
        const year = dateObj.getFullYear();
        const formattedDate = `${day}.${month}.${year}`;

        const depTimeStr = new Date(booking.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const arrTimeStr = new Date(booking.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        const engAirports = {
            ADE: { city: 'ADEN', airport: 'Aden Intl Airport' },
            CAI: { city: 'CAIRO', airport: 'Cairo Intl Airport' },
            RUH: { city: 'RIYADH', airport: 'King Khalid Intl Airport' },
            JED: { city: 'JEDDAH', airport: 'King Abdulaziz Intl Airport' },
            RIY: { city: 'RIYAN', airport: 'Riyan Intl Airport' },
            GXF: { city: 'SEIYUN', airport: 'Seiyun Intl Airport' },
            SCT: { city: 'SOCOTRA', airport: 'Socotra Intl Airport' },
            AMM: { city: 'AMMAN', airport: 'Queen Alia Intl Airport' },
            KWI: { city: 'KUWAIT', airport: 'Kuwait Intl Airport' },
            JIB: { city: 'DJIBOUTI', airport: 'Djibouti Intl Airport' },
            ADD: { city: 'ADDIS ABABA', airport: 'Bole Intl Airport' }
        };

        const orgEng = engAirports[booking.airportOrigin_code] || { city: booking.airportOrigin_code, airport: booking.airportOrigin_code };
        const destEng = engAirports[booking.airportDestination_code] || { city: booking.airportDestination_code, airport: booking.airportDestination_code };

        const ticketNo = `635 2412${String(booking.id_bookings || index).padStart(6, '0')}`;
        const bookingRef = booking.booking_reference.toUpperCase();
        
        const fareUSD = ticketPrice.toFixed(2);
        const taxUSD = (ticketPrice * 0.1).toFixed(2);
        const totalUSD = (ticketPrice * 1.1).toFixed(2);

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.zIndex = '-1000';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;

        doc.write(`
            <html>
                <head>
                    <title>Itinerary Receipt - ${bookingRef}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #000;
                            background-color: #fff;
                            font-size: 11px;
                            line-height: 1.4;
                            margin: 20px;
                            direction: ltr !important;
                            text-align: left !important;
                        }
                        * {
                            box-sizing: border-box;
                        }
                        .header-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 15px;
                        }
                        .logo-img {
                            height: 55px;
                            object-contain: fit;
                        }
                        .title-bar {
                            text-align: center;
                            font-weight: bold;
                            font-size: 13px;
                            margin: 15px 0;
                            border-top: 1px solid #ccc;
                            border-bottom: 1px solid #ccc;
                            padding: 6px 0;
                            letter-spacing: 1px;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        .info-table td {
                            padding: 3px 0;
                            vertical-align: top;
                        }
                        .info-label {
                            font-weight: bold;
                            width: 200px;
                            color: #333;
                        }
                        .info-value {
                            color: #000;
                        }
                        .coupon-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        .coupon-table th {
                            border-top: 1px solid #000;
                            border-bottom: 1px solid #000;
                            padding: 6px 4px;
                            text-align: left;
                            font-weight: bold;
                            font-size: 10px;
                            color: #333;
                        }
                        .coupon-table td {
                            padding: 8px 4px;
                            border-bottom: 1px solid #eee;
                            font-size: 10px;
                        }
                        .financial-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 15px;
                            border-top: 1px solid #ccc;
                            padding-top: 10px;
                        }
                        .financial-table td {
                            padding: 3px 0;
                        }
                        .disclaimer {
                            margin-top: 30px;
                            border-top: 1px solid #000;
                            padding-top: 8px;
                            font-size: 9px;
                            color: #555;
                            text-align: center;
                        }
                        @page {
                            size: portrait;
                            margin: 15mm;
                        }
                    </style>
                </head>
                <body>
                    <!-- Header -->
                    <table class="header-table">
                        <tr>
                            <td style="width: 50%;">
                                <img src="${airline.logo}" class="logo-img" alt="${airline.name}" />
                                <div style="font-size: 12px; font-weight: bold; margin-top: 5px;">${airline.name}</div>
                            </td>
                            <td style="text-align: right; width: 50%; vertical-align: top;">
                                <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${bookingRef}&scale=2&rotate=N&includetext=false" style="height: 35px;" />
                                <div style="font-weight: bold; font-size: 11px; margin-top: 4px; letter-spacing: 1px;">${bookingRef}</div>
                            </td>
                        </tr>
                    </table>

                    <div class="title-bar">PASSENGER ITINERARY RECEIPT</div>

                    <!-- Passenger & Ticket details -->
                    <table class="info-table">
                        <tr>
                            <td class="info-label">PASSENGER NAME</td>
                            <td class="info-value">: ${passenger.name.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td class="info-label">PASSENGER PASSPORT NO</td>
                            <td class="info-value">: ${passenger.passport_number.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td class="info-label">BOOKING REF.</td>
                            <td class="info-value" style="font-weight: bold;">: ${bookingRef}</td>
                        </tr>
                        <tr>
                            <td class="info-label">TICKET NUMBER</td>
                            <td class="info-value">: ${ticketNo}</td>
                        </tr>
                        <tr>
                            <td class="info-label">ISSUED BY</td>
                            <td class="info-value">: ${airline.name.toUpperCase()}</td>
                        </tr>
                    </table>

                    <!-- Coupons Table -->
                    <table class="coupon-table">
                        <thead>
                            <tr>
                                <th>COUPON NO</th>
                                <th>ROUTE</th>
                                <th>AIRLINE</th>
                                <th>FLIGHT</th>
                                <th>CLASS</th>
                                <th>DATE</th>
                                <th>DEP. TIME</th>
                                <th>ARR. TIME</th>
                                <th>STATUS</th>
                                <th>BAGGAGE</th>
                                <th>SEAT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>${orgEng.city} / ${destEng.city}</td>
                                <td>${booking.airline_code}</td>
                                <td>${booking.flight_number}</td>
                                <td>${booking.class_name || 'Q'}</td>
                                <td>${formattedDate}</td>
                                <td>${depTimeStr}</td>
                                <td>${arrTimeStr}</td>
                                <td>OK</td>
                                <td>30 KG</td>
                                <td>—</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Financial Details -->
                    <table class="info-table" style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px;">
                        <tr>
                            <td class="info-label">ENDORSEMENT/RESTRICTION</td>
                            <td class="info-value">: ST</td>
                        </tr>
                        <tr>
                            <td class="info-label">TICKET BASE FARE</td>
                            <td class="info-value">: USD ${fareUSD}</td>
                        </tr>
                        <tr>
                            <td class="info-label">TAX</td>
                            <td class="info-value">: USD ${taxUSD}</td>
                        </tr>
                        <tr>
                            <td class="info-label">TOTAL FARE PAID</td>
                            <td class="info-value" style="font-weight: bold;">: USD ${totalUSD}</td>
                        </tr>
                        <tr>
                            <td class="info-label">PAYMENT METHOD</td>
                            <td class="info-value">: ${(paymentMethodLabel[booking.payment_method] || booking.payment_method || 'CASH').toUpperCase()}</td>
                        </tr>
                    </table>

                    <!-- Inflight Services Table -->
                    <div style="font-weight: bold; margin-top: 25px; margin-bottom: 6px; font-size: 10px; border-bottom: 1px solid #000; padding-bottom: 3px;">INFLIGHT SERVICES & BAG ALLOWANCE</div>
                    <table class="coupon-table">
                        <thead>
                            <tr>
                                <th>COUPON NO</th>
                                <th>FLIGHT NOTES</th>
                                <th>BAG ALLOWANCE</th>
                                <th>SERVICES</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>SECURE FLIGHT INFO - T</td>
                                <td>${airline.name.toUpperCase()} 30 KG</td>
                                <td>STANDARD MEAL / SECURE FLIGHT</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Disclaimer -->
                    <div class="disclaimer">
                        In case passenger intended to Rebook or Refund the Ticket there is a Penalty. For more information, please visit ${airline.name} point of Sales.
                    </div>

                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                                setTimeout(() => {
                                    window.frameElement.remove();
                                }, 1000);
                            }, 800);
                        };
                    </script>
                </body>
            </html>
        `);
        doc.close();
    };

    const handleDownloadItinerary = async () => {
        if (downloadingItinerary) return;
        setDownloadingItinerary(true);
        try {
            const response = await fetch(`http://localhost:8080/api/bookings/${booking.id_bookings}/ticket`);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'فشل تحميل التذكرة الإلكترونية');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ticket-${booking.booking_reference}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading ticket:', error);
            alert('حدث خطأ أثناء تحميل التذكرة الإلكترونية: ' + error.message);
        } finally {
            setDownloadingItinerary(false);
        }
    };

    return (
        <div 
            id={`ticket-${passenger.id_passengers || index}`}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-all duration-300 relative"
        >
            {/* Header strip */}
            <div className={`bg-gradient-to-r ${airline.color} px-6 py-4 flex items-center justify-between text-white`} dir="rtl">
                <div className="flex items-center gap-3">
                    {airline.logo ? (
                        <div className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm p-1.5 flex items-center justify-center shrink-0 border border-white/20">
                            <img src={airline.logo} alt={airline.name} className="h-full w-full object-contain filter brightness-0 invert" />
                        </div>
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                            <Plane size={16} className="rotate-45" />
                        </div>
                    )}
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-black tracking-wider leading-none">{booking.airline_code} {booking.flight_number}</span>
                        <span className="text-[10px] font-medium text-white/85 mt-0.5">{airline.name}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black tracking-widest text-white/60 uppercase">بطاقة صعود الطائرة</span>
                    <span className="text-xs font-black tracking-widest mt-0.5">BOARDING PASS</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row relative">
                {/* Main section (Consistent RTL) */}
                <div className="flex-1 p-6 flex flex-col justify-between gap-5" dir="rtl">
                    {/* Top Row: Passenger & PNR */}
                    <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-right">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">اسم المسافر / Passenger</p>
                            <p className="text-sm font-black text-slate-800 uppercase">{passenger.name}</p>
                            <p className="text-[9px] font-bold text-slate-500">{passenger.passport_number}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">رقم الرحلة / Flight</p>
                            <p className="text-sm font-black text-brand-blue">{booking.airline_code} {booking.flight_number}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">رمز الحجز / PNR</p>
                            <p className="text-sm font-black text-slate-800 tracking-wider">{booking.booking_reference}</p>
                        </div>
                    </div>

                    {/* Middle Section: Route (Consistent RTL layout) */}
                    <div className="flex items-center justify-between gap-1.5 pt-3.5 pb-1 border-t border-slate-100">
                        {/* Origin (Departure) - Aligned Right */}
                        <div className="text-right shrink-0 w-fit max-w-[110px] sm:max-w-[160px]">
                            <span className="text-4xl font-black text-slate-900 tracking-tight">{booking.airportOrigin_code}</span>
                            <h4 className="text-xs font-black text-slate-700 mt-0.5 truncate">{originInfo.city}</h4>
                            <p className="text-[9px] font-bold text-slate-400 truncate" title={originInfo.airport}>{originInfo.airport}</p>
                            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-black text-brand-blue">
                                <Clock size={12} className="shrink-0" />
                                <span className="truncate">الإقلاع: {formatTime(booking.departure_time)}</span>
                            </div>
                        </div>

                        {/* Center Path - Stretches to maximum */}
                        <div className="flex-1 flex flex-col items-center gap-1.5 mx-2 text-center select-none">
                            <span className="text-xs font-black text-slate-500 tracking-wide">{formatDuration(booking.duration)}</span>
                            <div className="relative flex w-full items-center justify-center">
                                <div className="h-[2px] w-full border-t-2 border-dashed border-slate-200" />
                                <div className="absolute left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm flex items-center justify-center">
                                    <Plane size={14} className="text-brand-blue rotate-180" />
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3 py-0.5 rounded-full mt-0.5">مباشر / Direct</span>
                        </div>

                        {/* Destination (Arrival) - Aligned Left */}
                        <div className="text-left shrink-0 w-fit max-w-[110px] sm:max-w-[160px]" dir="ltr">
                            <span className="text-4xl font-black text-slate-900 tracking-tight">{booking.airportDestination_code}</span>
                            <h4 className="text-xs font-black text-slate-700 mt-0.5 truncate">{destinationInfo.city}</h4>
                            <p className="text-[9px] font-bold text-slate-400 truncate" title={destinationInfo.airport}>{destinationInfo.airport}</p>
                            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-black text-slate-500 justify-end shrink-0" dir="rtl">
                                <Clock size={12} className="shrink-0" />
                                <span className="truncate">الوصول: {formatTime(booking.arrival_time)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stub (Consistent & balanced) */}
                <div className="w-full md:w-56 p-6 flex flex-col items-center justify-between gap-4 bg-slate-50/30 border-t md:border-t-0 md:border-r border-slate-200/50 border-dashed relative" dir="rtl">
                    {/* Top and Bottom punch holes for stub separation */}
                    <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-[#f4f7fc] print:bg-white border border-slate-200/60 z-10 hidden md:block" />
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-[#f4f7fc] print:bg-white border border-slate-200/60 z-10 hidden md:block" />

                    {/* Top Seat and Status Info */}
                    <div className="w-full grid grid-cols-2 gap-2 text-center pb-3 border-b border-slate-200/40">
                        <div>
                            <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">المسافر / Pax</p>
                            <p className="text-xs font-black text-slate-700">{index + 1} / {booking.total_passengers}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">الحالة / Status</p>
                            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-black ${status.bg} ${status.text}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                            </span>
                        </div>
                    </div>

                    {/* QR Code Container (Interactive & Beautiful) */}
                    <div className="flex flex-col items-center gap-2 py-1">
                        <div
                            onClick={() => setShowQrModal(true)}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 p-2 bg-white hover:border-brand-blue hover:shadow-lg transition-all duration-300 w-28 h-28 flex items-center justify-center shadow-sm"
                            title="اضغط لتكبير رمز QR"
                        >
                            {qrCodeUrl ? (
                                <img
                                    src={qrCodeUrl}
                                    alt="QR Code"
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
                            )}
                            <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-[9px] font-black text-brand-blue bg-white px-2 py-1 rounded-xl shadow-md border border-slate-100">تكبير الرمز</span>
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 tracking-wider">رمز الصعود QR</span>
                    </div>

                    {/* Stub Footer */}
                    <div className="w-full text-center pt-2 border-t border-slate-200/40">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">تذكرة صعود إلكترونية</p>
                    </div>
                </div>
            </div>

            {/* Footer meta strip */}
            <div className="grid grid-cols-3 gap-px bg-slate-100 border-t border-slate-150">
                {[
                    { label: 'تاريخ السفر / Date', value: formatDate(booking.departure_time) },
                    { label: 'طريقة الدفع / Payment', value: paymentMethodLabel[booking.payment_method] || booking.payment_method || '—' },
                    { label: 'سعر التذكرة / Fare', value: `$${ticketPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50/50 px-3 py-2.5 text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                        <p className="text-xs font-black text-slate-700 mt-0.5">{value}</p>
                    </div>
                ))}
            </div>

            {/* Print button bar */}
            <div className="bg-slate-50 px-5 py-3.5 flex justify-between items-center border-t border-slate-150 download-bar-pdf" data-html2canvas-ignore="true">
                <span className="text-[10px] font-bold text-slate-400">تذكرة صعود جاهزة للطباعة أو الحفظ</span>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-1.5 px-4.5 py-2 bg-[#4974f9] hover:bg-[#3a5fd4] text-white rounded-xl text-xs font-black shadow-md shadow-[#4974f9]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                        <Printer size={14} />
                        <span>طباعة التذكرة</span>
                    </button>
                </div>
            </div>

            {/* QR Zoom Modal */}
            {showQrModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setShowQrModal(false)}
                >
                    <div
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100" dir="rtl">
                            <h3 className="text-base font-black text-slate-900">رمز صعود الطائرة (QR)</h3>
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" stroke="#94a3b8" />
                                </svg>
                            </button>
                        </div>

                        {/* Large QR Image */}
                        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-2xl bg-white shadow-inner">
                            {qrCodeUrl ? (
                                <img
                                    src={qrCodeUrl}
                                    alt="QR Boarding Pass"
                                    className="w-64 h-64 object-contain"
                                />
                            ) : (
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
                            )}
                            <p className="text-[10px] font-black text-slate-400 mt-3 text-center leading-relaxed">
                                يرجى تقديم الرمز للمسح عند بوابة الصعود
                            </p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setShowQrModal(false)}
                            className="mt-5 w-full py-3 bg-brand-blue text-white font-black text-sm rounded-2xl shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-hover hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Booking Group (one booking → multiple passes) ── */
function BookingGroup({ booking }) {
    const [expanded, setExpanded] = useState(false);
    const [passengers, setPassengers] = useState([]);
    const [loadingPax, setLoadingPax] = useState(false);
    const status = statusConfig[booking.status] || statusConfig.certain;
    const airline = airlineConfig[booking.airline_code] || { name: booking.airline_code, color: 'from-slate-600 to-slate-800' };
    const StatusIcon = status.icon;

    // Retrieve offline payment proof and branch details
    const localProof = localStorage.getItem(`payment_proof_${booking.booking_reference}`);
    const localBranch = (() => {
        try {
            const val = localStorage.getItem(`payment_branch_${booking.booking_reference}`);
            return val ? JSON.parse(val) : null;
        } catch (e) {
            return null;
        }
    })();
    const [showProofModal, setShowProofModal] = useState(false);
    const localCancelRequest = localStorage.getItem(`cancel_request_${booking.booking_reference}`) === 'pending';

    const handleCancelBooking = (e) => {
        e.stopPropagation();
        const confirmCancel = window.confirm("هل أنت متأكد من رغبتك في إرسال طلب إلغاء هذا الحجز؟");
        if (!confirmCancel) return;

        localStorage.setItem(`cancel_request_${booking.booking_reference}`, 'pending');
        alert("تم إرسال طلب إلغاء الرحلة بنجاح. وهو قيد المراجعة الآن.");
        window.location.reload();
    };

    const loadPassengers = async () => {
        if (passengers.length > 0) { setExpanded(v => !v); return; }
        setLoadingPax(true);
        try {
            const r = await fetch(`http://localhost:8080/api/booking-passengers/${booking.id_bookings}`);
            const d = await r.json();
            if (d.success) setPassengers(d.passengers);
        } catch (e) { console.error(e); }
        finally { setLoadingPax(false); setExpanded(true); }
    };

    return (
        <div className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 ${expanded ? 'border-brand-blue/30 shadow-lg' : 'border-slate-200/60 hover:shadow-md'}`}>
            {/* Summary row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer select-none" onClick={loadPassengers}>
                <div className="flex items-center gap-4">
                    {airline.logo ? (
                        <div className="h-14 w-14 shrink-0 rounded-2xl bg-white p-2.5 flex items-center justify-center border border-slate-200/50 shadow-md">
                            <img src={airline.logo} alt={airline.name} className="h-full w-full object-contain" />
                        </div>
                    ) : (
                        <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${airline.color} text-white shadow-lg`}>
                            <span className="text-[9px] font-black tracking-widest opacity-70">{booking.airline_code}</span>
                            <Plane size={18} className="mt-0.5" />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 mb-1" dir="ltr">
                            <span className="text-2xl font-black text-slate-900">{booking.airportOrigin_code}</span>
                            <div className="flex items-center gap-1 px-1">
                                <div className="h-[1px] w-6 bg-slate-300" />
                                <Plane size={10} className="text-brand-blue" />
                                <div className="h-[1px] w-6 bg-slate-300" />
                            </div>
                            <span className="text-2xl font-black text-slate-900">{booking.airportDestination_code}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400">{airline.name} · {booking.flight_number}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">المغادرة</p>
                        <p className="text-xs font-black text-slate-700">{formatDate(booking.departure_time)}</p>
                    </div>
                    <div className="text-right border-r border-slate-100 pr-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">المسافرون</p>
                        <p className="text-xs font-black text-slate-700">{booking.total_passengers} مسافر</p>
                    </div>
                    <div className="text-right border-r border-slate-100 pr-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">السعر</p>
                        <p className="text-xs font-black text-slate-700">${Number(booking.final_price).toLocaleString('en-US')}</p>
                    </div>

                    {localCancelRequest ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black bg-orange-500/10 text-orange-700 border border-orange-200/50">
                            <Clock size={12} />
                            <span>بانتظار الإلغاء</span>
                        </span>
                    ) : (
                        booking.status !== 'cancelled' && (
                            <button
                                onClick={handleCancelBooking}
                                title="طلب إلغاء الحجز"
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200 cursor-pointer"
                            >
                                <Trash2 size={15} />
                            </button>
                        )
                    )}

                    <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black ${status.bg} ${status.text}`}>
                        <StatusIcon size={12} />
                        {status.label}
                    </span>

                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${expanded ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {loadingPax
                            ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            : <ChevronDown size={15} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                        }
                    </div>
                </div>
            </div>

            {/* Individual boarding passes */}
            {expanded && passengers.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                        <Users size={12} />
                        تذاكر الصعود — {passengers.length} مسافر
                    </p>
                    {passengers.map((pax, idx) => (
                        <BoardingPass key={pax.id_passengers} passenger={pax} booking={booking} index={idx} />
                    ))}
                </div>
            )}

            {/* Offline payment details and proof */}
            {(localBranch || localProof) && (
                <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs" dir="rtl">
                    {localBranch && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin size={13} className="text-brand-blue" />
                            <span className="font-bold">مكتب الدفع المختار:</span>
                            <span className="font-black text-slate-800">{localBranch.name} ({localBranch.city})</span>
                        </div>
                    )}
                    {localProof && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowProofModal(true); }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-black border border-emerald-200 transition-all cursor-pointer mr-auto"
                        >
                            <CheckCircle size={12} />
                            <span>عرض إثبات الدفع المرفق</span>
                        </button>
                    )}

                    {showProofModal && (
                        <div
                            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                            onClick={(e) => { e.stopPropagation(); setShowProofModal(false); }}
                        >
                            <div
                                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-150" dir="rtl">
                                    <h3 className="text-sm font-black text-slate-900 font-sans">إثبات الدفع المرفق</h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowProofModal(false); }}
                                        className="text-slate-400 hover:text-slate-600 cursor-pointer font-black text-sm"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                                <div className="flex items-center justify-center p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                                    <img
                                        src={localProof}
                                        alt="إثبات الدفع"
                                        className="max-h-[350px] w-auto object-contain rounded-xl"
                                    />
                                </div>
                                <div className="mt-4 text-center text-[10px] font-bold text-slate-400">
                                    رمز الحجز المرجعي: {booking.booking_reference}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Main Page ── */
export default function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    
    const [activeSection, setActiveSection] = useState('bookings'); // 'bookings' or 'notifications'
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const fetchBookings = useCallback(() => {
        if (!user?.id) { setLoading(false); return; }
        fetch(`http://localhost:8080/api/my-bookings/${user.id}`)
            .then(r => r.json())
            .then(d => { if (d.success) setBookings(d.bookings); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user?.id]);

    const fetchNotifications = useCallback(() => {
        if (!user?.id) { setNotifLoading(false); return; }
        setNotifLoading(true);
        fetch(`http://localhost:8080/api/notifications/${user.id}`)
            .then(r => r.json())
            .then(d => { if (d.success) setNotifications(d.notifications); })
            .catch(console.error)
            .finally(() => setNotifLoading(false));
    }, [user?.id]);

    useEffect(() => {
        fetchBookings();
        fetchNotifications();
    }, [fetchBookings, fetchNotifications]);

    const markNotificationAsRead = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/notifications/${id}/read`, { method: 'PATCH' });
            setNotifications(prev => prev.map(n => n.id_notifications === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        const confirmDelete = window.confirm("هل أنت متأكد من رغبتك في حذف هذا الإشعار؟");
        if (!confirmDelete) return;
        try {
            await fetch(`http://localhost:8080/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id_notifications !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const markAllNotificationsAsRead = async () => {
        if (!user?.id) return;
        try {
            await fetch(`http://localhost:8080/api/notifications/read-all/${user.id}`, { method: 'PATCH' });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const filtered = bookings.filter(b => {
        const q = search.toLowerCase();
        const matchSearch =
            b.booking_reference?.toLowerCase().includes(q) ||
            b.airportOrigin_code?.toLowerCase().includes(q) ||
            b.airportDestination_code?.toLowerCase().includes(q) ||
            b.flight_number?.toLowerCase().includes(q);
        if (activeFilter === 'all') return matchSearch;
        return matchSearch && b.status === activeFilter;
    });

    const filteredNotifs = notifications.filter(n => {
        const q = search.toLowerCase();
        return n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q);
    });

    const filters = [
        { id: 'all', label: 'الكل', count: bookings.length, icon: Ticket },
        { id: 'certain', label: 'مؤكدة', count: bookings.filter(b => b.status === 'certain').length, icon: CheckCircle },
        { id: 'temporary', label: 'مؤقتة', count: bookings.filter(b => b.status === 'temporary').length, icon: Clock },
        { id: 'cancelled', label: 'ملغية', count: bookings.filter(b => b.status === 'cancelled').length, icon: XCircle },
    ];


    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f4f7fc] via-[#f8fafc] to-[#f4f7fc]" dir="rtl">
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-brand-blue/6 blur-[130px]" />
                <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-400/5 blur-[130px]" />
            </div>

            <main className="relative z-10 mx-auto max-w-4xl px-4 py-16 pt-32 sm:px-6">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-hover text-white shadow-xl shadow-brand-blue/30">
                        <Ticket size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">حجوزاتي</h1>
                        <p className="text-slate-500 font-bold text-sm mt-0.5">تذكرة خاصة لكل مسافر مع كامل التفاصيل</p>
                    </div>
                </div>

                {/* Filter tabs */}
                {activeSection === 'bookings' && bookings.length > 0 && (
                    <div className="flex gap-2 mb-6 flex-wrap animate-in fade-in slide-in-from-top-1 duration-200">
                        {filters.map(({ id, label, count, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveFilter(id)}
                                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all duration-200 border cursor-pointer ${activeFilter === id
                                    ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <Icon size={14} />
                                {label}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeFilter === id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {count}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Not logged in */}
                {!user && (
                    <div className="flex flex-col items-center text-center py-28 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-blue/8 mb-6">
                            <LogIn size={40} className="text-brand-blue" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3">تسجيل الدخول مطلوب</h2>
                        <p className="text-slate-500 font-bold mb-8 max-w-xs">سجّل دخولك لتتمكن من عرض تذاكر الصعود الخاصة بك ومسافريك</p>
                        <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-brand-blue/30 hover:scale-105 transition-all">
                            <LogIn size={18} /> تسجيل الدخول
                        </button>
                    </div>
                )}

                {/* Logged-in content */}
                {user && (
                    <>
                        {/* Section Selection Tabs */}
                        <div className="flex border-b border-slate-200/80 mb-6 gap-6 relative" dir="rtl">
                            <button
                                onClick={() => { setActiveSection('bookings'); setSearch(''); }}
                                className={`pb-3 text-base font-black relative transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                                    activeSection === 'bookings' ? 'text-brand-blue' : 'text-slate-450 hover:text-slate-800'
                                }`}
                            >
                                <Ticket size={18} />
                                <span>حجوزاتي</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                                    activeSection === 'bookings' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {bookings.length}
                                </span>
                                {activeSection === 'bookings' && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-blue rounded-t-full" />
                                )}
                            </button>
                            <button
                                onClick={() => { setActiveSection('notifications'); setSearch(''); }}
                                className={`pb-3 text-base font-black relative transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                                    activeSection === 'notifications' ? 'text-brand-blue' : 'text-slate-450 hover:text-slate-800'
                                }`}
                            >
                                <Bell size={18} />
                                <span>الإشعارات</span>
                                {unreadCount > 0 ? (
                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                                        {unreadCount}
                                    </span>
                                ) : (
                                    <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                                        {notifications.length}
                                    </span>
                                )}
                                {activeSection === 'notifications' && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-blue rounded-t-full" />
                                )}
                            </button>
                        </div>

                        {activeSection === 'bookings' ? (
                            <>
                                {bookings.length > 0 && (
                                    <div className="relative mb-6">
                                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text" value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder="بحث برقم الحجز، رمز المطار، أو رقم الرحلة..."
                                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all shadow-sm"
                                        />
                                    </div>
                                )}

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-28 gap-5">
                                        <div className="relative">
                                            <div className="h-16 w-16 animate-spin rounded-2xl border-4 border-brand-blue border-t-transparent" />
                                            <Plane size={20} className="absolute inset-0 m-auto text-brand-blue" />
                                        </div>
                                        <p className="text-slate-500 font-black">جاري تحميل تذاكرك...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filtered.length > 0 ? (
                                            filtered.map(b => <BookingGroup key={b.id_bookings} booking={b} />)
                                        ) : (
                                            <div className="flex flex-col items-center text-center py-28 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
                                                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-50 mb-6">
                                                    <PackageX size={40} className="text-slate-300" />
                                                </div>
                                                <h2 className="text-xl font-black text-slate-900 mb-2">
                                                    {search || activeFilter !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا يوجد حجوزات بعد'}
                                                </h2>
                                                <p className="text-slate-400 font-bold mb-8">
                                                    {search || activeFilter !== 'all' ? 'جرّب تغيير كلمة البحث أو التصنيف' : 'ابدأ رحلتك الأولى معنا الآن'}
                                                </p>
                                                {!search && activeFilter === 'all' && (
                                                    <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-brand-blue/30 hover:scale-105 transition-all">
                                                        <Plane size={18} /> احجز رحلتك الأولى
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {notifications.length > 0 && (
                                    <div className="relative mb-6">
                                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text" value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder="بحث في الإشعارات..."
                                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all shadow-sm"
                                        />
                                    </div>
                                )}

                                {notifLoading ? (
                                    <div className="flex flex-col items-center justify-center py-28 gap-5">
                                        <div className="relative">
                                            <div className="h-16 w-16 animate-spin rounded-2xl border-4 border-brand-blue border-t-transparent" />
                                            <Bell size={20} className="absolute inset-0 m-auto text-brand-blue animate-pulse" />
                                        </div>
                                        <p className="text-slate-500 font-black">جاري تحميل إشعاراتك...</p>
                                    </div>
                                ) : (
                                    <>
                                        {notifications.length > 0 && (
                                            <div className="flex justify-between items-center mb-4 px-2">
                                                <span className="text-xs font-bold text-slate-500">
                                                    لديك {unreadCount} إشعار غير مقروء من أصل {notifications.length}
                                                </span>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllNotificationsAsRead}
                                                        className="flex items-center gap-1.5 text-xs font-black text-brand-blue hover:underline cursor-pointer"
                                                    >
                                                        <CheckCheck size={14} />
                                                        تحديد الكل كمقروء
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {filteredNotifs.length > 0 ? (
                                                filteredNotifs.map(n => {
                                                    const tc = typeConfig[n.type] || typeConfig.general;
                                                    const IconComp = tc.icon;
                                                    return (
                                                        <div
                                                            key={n.id_notifications}
                                                            onClick={() => !n.is_read && markNotificationAsRead(n.id_notifications)}
                                                            className={`group relative border rounded-[2rem] p-6 transition-all duration-300 bg-white shadow-sm border-slate-200/60 hover:shadow-md hover:border-slate-350 cursor-pointer ${
                                                                !n.is_read ? 'bg-blue-500/[0.015] border-blue-500/10' : ''
                                                            }`}
                                                        >
                                                            {/* Left indicator for unread */}
                                                            {!n.is_read && (
                                                                <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-brand-blue" />
                                                            )}

                                                            <div className="flex gap-4 items-start">
                                                                {/* Notification Icon */}
                                                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tc.color} text-white shadow-md`}>
                                                                    <IconComp size={20} />
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 text-right">
                                                                        <h3 className={`text-base leading-snug ${!n.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                                                            {n.title}
                                                                        </h3>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                                                <Clock size={12} />
                                                                                {formatRelativeTime(n.created_at)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-slate-500 text-xs font-bold leading-relaxed whitespace-pre-line text-right">
                                                                        {n.message}
                                                                    </p>
                                                                    
                                                                    {/* Actions row inside notification */}
                                                                    <div className="mt-3 flex justify-between items-center" dir="rtl">
                                                                        {!n.is_read ? (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    markNotificationAsRead(n.id_notifications);
                                                                                }}
                                                                                className="text-[10px] font-black text-brand-blue hover:underline bg-brand-blue/5 px-2.5 py-1 rounded-lg border border-brand-blue/10 cursor-pointer"
                                                                            >
                                                                                تحديد كمقروء
                                                                            </button>
                                                                        ) : (
                                                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                                                مقروء
                                                                            </span>
                                                                        )}

                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                deleteNotification(n.id_notifications);
                                                                            }}
                                                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-650 transition-colors cursor-pointer border border-red-100/50"
                                                                            title="حذف الإشعار"
                                                                        >
                                                                            <Trash2 size={13} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex flex-col items-center text-center py-24 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
                                                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 mb-6">
                                                        <PackageX size={36} className="text-slate-300" />
                                                    </div>
                                                    <h2 className="text-lg font-black text-slate-900 mb-2">
                                                        {search ? 'لا توجد نتائج مطابقة' : 'لا توجد إشعارات'}
                                                    </h2>
                                                    <p className="text-slate-400 font-bold max-w-xs leading-relaxed">
                                                        {search ? 'جرّب كتابة كلمة بحث أخرى للبحث في الإشعارات' : 'سنقوم بإخطارك فور تلقي تحديثات جديدة بخصوص حجوزاتك'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

            </main>
        </div>
    );
}
