import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // كائن حالة المستخدم الوهمي مع الحقول المطلوبة
  // كائن حالة المستخدم مع الحقول المطلوبة (الافتراضي هو مستخدم عادي)
  const [user, setUser] = useState(() => {
    // 1. التحقق من حالة تسجيل الدخول الفعلي الحقيقي أولاً لمنع مسح جلسة المسؤولين الحقيقيين عند التحديث
    const currentRole = localStorage.getItem('userRole');
    if (currentRole === 'admin') {
      return {
        role: 'super_admin',
        airline_name: 'Yemenia',
        airline_id: 1,
      };
    } else if (currentRole === 'company') {
      const companyName = localStorage.getItem('companyName') || 'Yemenia';
      const companyId = parseInt(localStorage.getItem('companyId') || '1', 10);
      const logoUrl = localStorage.getItem('companyLogo') || null;
      return {
        role: 'company_admin',
        airline_name: companyName,
        airline_id: companyId,
        logo_url: logoUrl,
      };
    }

    // 2. التحقق من حالة المطور المخزنة (فقط في حال تفعيل وضع debug)
    const debugActive = localStorage.getItem('ybf_debug') === 'true';
    if (debugActive) {
      const saved = localStorage.getItem('ybf_mock_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse mock user state:', e);
        }
      }
    }

    // 3. الوضع الافتراضي لزائر الموقع العادي (بدون صلاحيات)
    return {
      role: 'user',
      airline_name: null,
      airline_id: null,
    };
  });

  // حالة الحجوزات المشتركة (Shared Global Bookings State) لتخزين حجوزات المسافرين
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('ybf_mock_bookings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse mock bookings:', e);
      }
    }
    return [
      {
        id: 'YBF-A8B9CD',
        flightId: 1,
        flight_number: 'IY-601',
        origin: 'ADE',
        destination: 'CAI',
        departure_time: '2026-06-15T08:30',
        passengers: [
          { name: 'محمد أحمد صالح', passport_number: '0987112', seat: '4A', travel_class: 'Business', services: ['wheelchair'] },
          { name: 'منى أحمد صالح', passport_number: '0987113', seat: '4B', travel_class: 'Business', services: ['medmeal'] },
        ],
        totalPrice: 940,
        paymentMethod: 'card',
        status: 'certain',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'YBF-K9L8MN',
        flightId: 2,
        flight_number: 'IY-702',
        origin: 'ADE',
        destination: 'JED',
        departure_time: '2026-06-16T14:15',
        passengers: [
          { name: 'علي عبدالله حسن', passport_number: '0776512', seat: '12C', travel_class: 'Economy', services: ['oxygen', 'wheelchair'] }
        ],
        totalPrice: 395,
        paymentMethod: 'paypal',
        status: 'certain',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  });

  // مزامنة الحجوزات مع localStorage
  useEffect(() => {
    localStorage.setItem('ybf_mock_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // مزامنة حالة المستخدم مع الذاكرة المحلية (localStorage) لتأمين المسارات وحمايتها
  useEffect(() => {
    localStorage.setItem('ybf_mock_user', JSON.stringify(user));

    if (user.role === 'super_admin') {
      localStorage.setItem('userRole', 'admin');
      if (!localStorage.getItem('adminToken')) {
        localStorage.setItem('adminToken', 'mock-admin-token-value');
      }
      
      // مسح قيم الشركة لتجنب التداخل
      localStorage.removeItem('companyToken');
      localStorage.removeItem('companyId');
      localStorage.removeItem('companyName');
      localStorage.removeItem('airlineCode');
    } else if (user.role === 'company_admin') {
      localStorage.setItem('userRole', 'company');
      if (!localStorage.getItem('companyToken')) {
        localStorage.setItem('companyToken', 'mock-company-token-value');
      }
      localStorage.setItem('companyId', String(user.airline_id || 1));
      localStorage.setItem('companyName', user.airline_name || 'Yemenia');
if (user.logo_url) {
        localStorage.setItem('companyLogo', user.logo_url);
      }
      const storedCode = localStorage.getItem('airlineCode');
      if (!storedCode) {
        localStorage.setItem('airlineCode', user.airline_id === 1 ? 'IY' : user.airline_id === 2 ? 'BS' : user.airline_id === 5 ? 'DH' : user.airline_id === 7 ? 'QA' : 'QY');
      }
      
      // مسح قيم المدير لتجنب التداخل
      localStorage.removeItem('adminToken');
    } else {
      // للمستخدم العادي: مسح كافة قيم لوحة التحكم والإدارة لمنع الدخول غير المصرح به
      localStorage.removeItem('userRole');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('companyToken');
      localStorage.removeItem('companyId');
      localStorage.removeItem('companyName');
      localStorage.removeItem('airlineCode');
    }
  }, [user]);

  // إضافة حجز جديد
  const addBooking = (newBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  // تغيير الدور برمجياً
  const setRole = (newRole) => {
    if (newRole === 'super_admin' || newRole === 'company_admin') {
      setUser((prev) => ({ ...prev, role: newRole }));
    }
  };

  // تبديل الدور بشكل تبادلي
  const toggleRole = () => {
    setUser((prev) => ({
      ...prev,
      role: prev.role === 'super_admin' ? 'company_admin' : 'super_admin',
    }));
  };

  // تسجيل الخروج المركزي
  const logout = () => {
    localStorage.clear();
    setUser({
      role: 'user',
      airline_name: null,
      airline_id: null,
      logo_url: null,
    });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, setRole, toggleRole, bookings, setBookings, addBooking }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
