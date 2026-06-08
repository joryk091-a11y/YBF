import React from 'react';
import Sidebar from '../components/Sidebar';

export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0b1120] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden" dir="rtl">
      {/* ─── Aesthetic Mesh Decor ────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      {/* القائمة الجانبية */}
      <Sidebar />

      {/* المحتوى الرئيسي */}
      <main className="flex-1 mr-72 p-10 flex items-center justify-center relative z-10 min-h-screen">
        <div className="text-center max-w-lg bg-white/80 dark:bg-slate-900/80 rounded-[45px] p-12 border border-slate-200/60 dark:border-slate-800/60 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-500">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-8 border border-blue-500/20 shadow-lg shadow-blue-500/5">
            {Icon && <Icon size={44} />}
          </div>
          <h2 className="text-2xl font-black mb-4 tracking-tight">{title}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-7 max-w-sm mx-auto">{description}</p>
          <div className="mt-10 flex justify-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/50 px-3.5 py-2 rounded-xl uppercase tracking-widest border border-slate-200/20 dark:border-slate-800/20">
              واجهة اختبار تجريبية • Prototype View
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
