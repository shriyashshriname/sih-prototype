import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bell, Sparkles, LogOut, ChevronRight, Activity } from 'lucide-react';

export default function Topbar({ title, subtitle, breadcrumb = 'Command Center' }) {
  const { user, alerts, logout, presentationMode, togglePresentationMode } = useApp();
  const navigate = useNavigate();
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;

  return (
    <header className="h-[64px] bg-slate-900 border-b border-slate-700/60 px-5 sm:px-6 flex items-center justify-between flex-shrink-0 z-20 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-full bg-gradient-to-r from-transparent via-sky-500/5 to-transparent pointer-events-none" />

      {/* Left: Breadcrumbs & Title */}
      <div className="flex items-center gap-4 min-w-0 relative z-10">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10.5px] font-cyber font-bold text-slate-500 mb-0.5 uppercase tracking-widest">
            <span className="text-sky-400">AEGIS</span>
            <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
            <span className="text-slate-300">{breadcrumb}</span>
          </div>
          <h1 className="text-base font-tech font-bold text-white tracking-wide uppercase leading-none truncate flex items-center gap-2">
            {title}
          </h1>
        </div>
        {subtitle && (
          <span className="hidden xl:inline-block text-[11px] text-slate-500 pl-4 border-l border-slate-700 mt-1 truncate max-w-sm font-medium">
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
        {/* Real Data badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-cyber font-bold uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Live OSRM/Meteo Data</span>
          <span className="md:hidden">Live Data</span>
        </div>

        {/* Presentation Mode Toggle */}
        <button
          type="button"
          onClick={togglePresentationMode}
          title={presentationMode ? 'Exit Presentation Mode' : 'Presentation Mode'}
          className={`p-2 rounded-lg transition-all border text-sm ${
            presentationMode
              ? 'bg-sky-500/10 border-sky-500/50 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
              : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-600'
          }`}
        >
          <Sparkles className="w-[15px] h-[15px]" />
        </button>

        {/* Alert Bell */}
        <button
          type="button"
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all"
          title={`${activeAlerts} active alert${activeAlerts !== 1 ? 's' : ''}`}
        >
          <Bell className="w-[15px] h-[15px]" />
          {activeAlerts > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-cyber font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]">
              {activeAlerts}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-7 w-px bg-slate-700/80 hidden md:block" />

        {/* User chip */}
        <div className="hidden md:flex items-center gap-3 pl-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 text-white flex items-center justify-center font-cyber font-bold text-[11px] shadow-md border border-sky-400/30">
            {user?.avatar || 'DM'}
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-slate-200 leading-tight uppercase font-tech tracking-wider">{user?.role || 'District Officer'}</p>
            <p className="text-[10px] text-emerald-400 font-cyber font-bold flex items-center gap-1 uppercase tracking-widest mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
              SECURE
            </p>
          </div>
        </div>

        {/* Sign Out */}
        <button
          type="button"
          onClick={() => { logout(); navigate('/login'); }}
          title="Sign Out"
          className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all ml-1"
        >
          <LogOut className="w-[15px] h-[15px]" />
        </button>
      </div>
    </header>
  );
}
