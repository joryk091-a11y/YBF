import React from 'react';
import Sidebar from '../components/Sidebar';

export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0b1120] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden" dir="rtl">
      {}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      {}
      <Sidebar />

      {}
      <main className="flex-1 mr-72 p-10 flex items-center justify-center relative z-10 min-h-screen">
        <div className="text-center max-w-lg bg-gradient-to-b from-white to-slate-50/40 dark:from-slate-900/60 dark:to-slate-950/60 rounded-[45px] p-12 border border-slate-150/70 dark:border-slate-800/40 shadow-sm hover:shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 animate-in zoom-in-95 duration-500">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-8 border border-blue-500/20 shadow-lg shadow-blue-500/5">
            {Icon && <Icon size={44} />}
          </div>
          <h2 className="text-2xl font-black mb-4 tracking-tight">{title}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-7 max-w-sm mx-auto">{description}</p>

        </div>
      </main>
    </div>
  );
}
