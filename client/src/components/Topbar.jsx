import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bell, Sparkles, LogOut, ChevronRight, Activity } from 'lucide-react';

export default function Topbar({ title, subtitle, breadcrumb = 'Command Center' }) {
  const { user, alerts, logout, presentationMode, togglePresentationMode } = useApp();
  const navigate = useNavigate();
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;

  return (
    <header className="h-[60px] bg-white border-b border-slate-200/80 px-5 sm:px-6 flex items-center justify-between flex-shrink-0 z-20 shadow-sm">
      {/* Left: Breadcrumbs & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">
            <span>AEGIS</span>
            <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
            <span className="text-blue-600">{breadcrumb}</span>
          </div>
          <h1 className="text-[15px] font-black text-slate-900 tracking-tight leading-none truncate">
            {title}
          </h1>
        </div>
        {subtitle && (
          <span className="hidden xl:inline-block text-[12px] text-slate-500 pl-3 border-l border-slate-200 mt-1 truncate max-w-xs">
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Demo badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span className="hidden md:inline">Synthetic Demo Data</span>
          <span className="md:hidden">Demo</span>
        </div>

        {/* Presentation Mode Toggle */}
        <button
          type="button"
          onClick={togglePresentationMode}
          title={presentationMode ? 'Exit Presentation Mode' : 'Presentation Mode'}
          className={`p-2 rounded-lg transition-all border text-sm ${
            presentationMode
              ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-inner'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Sparkles className="w-[15px] h-[15px]" />
        </button>

        {/* Alert Bell */}
        <button
          type="button"
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all"
          title={`${activeAlerts} active alert${activeAlerts !== 1 ? 's' : ''}`}
        >
          <Bell className="w-[15px] h-[15px]" />
          {activeAlerts > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse shadow-sm">
              {activeAlerts}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-7 w-px bg-slate-200 hidden md:block" />

        {/* User chip */}
        <div className="hidden md:flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-black text-[12px] shadow-sm">
            {user?.avatar || 'RD'}
          </div>
          <div className="text-left">
            <p className="text-[12px] font-bold text-slate-900 leading-tight">{user?.role || 'District Officer'}</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Authorized Session
            </p>
          </div>
        </div>

        {/* Sign Out */}
        <button
          type="button"
          onClick={() => { logout(); navigate('/login'); }}
          title="Sign Out"
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-[15px] h-[15px]" />
        </button>
      </div>
    </header>
  );
}
