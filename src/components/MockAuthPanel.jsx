import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Shield, RefreshCw, Check, ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function MockAuthPanel() {
  const { user, toggleRole, setRole } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[9999] flex h-12 w-12 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600 text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
        title="فتح لوحة التحكم بالصلاحيات"
      >
        <Shield size={22} className="animate-pulse" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 left-6 z-[9999] w-80 rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-blue-500/5"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Shield size={16} />
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wide">
            مطور النظام (Mock Auth)
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          إخفاء
        </button>
      </div>

      {/* Info Cards */}
      <div className="space-y-3 mb-4">
        {/* Role card */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100/50 dark:border-slate-900/50">
          <div className="flex items-center gap-2">
            <User size={14} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-400">الدور الحالي:</span>
          </div>
          <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
            user.role === 'super_admin'
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
          }`}>
            {user.role === 'super_admin' ? 'مدير عام (Super Admin)' : 'مدير شركة (Company Admin)'}
          </span>
        </div>

        {/* Airline details card */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100/50 dark:border-slate-900/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>شركة الطيران:</span>
            <span className="text-slate-800 dark:text-slate-200 font-extrabold">{user.airline_name}</span>
          </div>
          <div className="flex justify-between">
            <span>معرف الشركة (ID):</span>
            <span className="text-slate-800 dark:text-slate-200 font-extrabold">{user.airline_id}</span>
          </div>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setRole('super_admin')}
          className={`flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-[11px] font-black transition-all ${
            user.role === 'super_admin'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {user.role === 'super_admin' && <Check size={12} />}
          Super Admin
        </button>
        <button
          onClick={() => setRole('company_admin')}
          className={`flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-[11px] font-black transition-all ${
            user.role === 'company_admin'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {user.role === 'company_admin' && <Check size={12} />}
          Company Admin
        </button>
      </div>

      {/* Helper text */}
      <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-3 font-medium">
        * يتم تبديل صلاحيات الوصول والمسارات تلقائياً عند تغيير الدور.
      </p>
    </div>
  );
}
