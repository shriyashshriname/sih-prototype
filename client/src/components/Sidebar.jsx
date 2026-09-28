import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Map,
  ShieldAlert,
  ListOrdered,
  GitMerge,
  CheckCircle2,
  Building2,
  Bell,
  Radio,
  BookOpen,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  Brain,
  Route,
  ChevronLeft,
  ChevronRight,
  Activity,
  Dot,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    allowedRoles: ['District Officer', 'Disaster Management Officer', 'Emergency Agency', 'Field Officer', 'Administrator', 'Fire Department', 'Police Department', 'Hospital / Medical'],
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { path: '/map', label: 'GIS Risk Map', icon: Map },
    ],
  },
  {
    title: 'INTELLIGENCE',
    allowedRoles: ['District Officer', 'Disaster Management Officer', 'Administrator'],
    items: [
      { path: '/red-zones', label: 'Red Zones', icon: ShieldAlert },
      { path: '/ai-risk-assessment', label: 'AI Risk Assessment', icon: Brain },
      { path: '/relocation-priority', label: 'Relocation Priority', icon: ListOrdered },
    ],
  },
  {
    title: 'RESPONSE',
    allowedRoles: ['District Officer', 'Disaster Management Officer', 'Emergency Agency', 'Administrator', 'Fire Department', 'Police Department', 'Hospital / Medical'],
    items: [
      { path: '/relocation-planner', label: 'Relocation Planner', icon: GitMerge, roles: ['District Officer', 'Disaster Management Officer', 'Administrator'] },
      { path: '/safe-sites', label: 'Safe Sites', icon: CheckCircle2 },
      { path: '/evacuation-routes', label: 'Evacuation Routes', icon: Route, roles: ['District Officer', 'Disaster Management Officer', 'Emergency Agency', 'Administrator', 'Fire Department', 'Police Department'] },
      { path: '/agency', label: 'Emergency Agency', icon: Radio },
    ],
  },
  {
    title: 'MANAGEMENT',
    allowedRoles: ['District Officer', 'Disaster Management Officer', 'Emergency Agency', 'Field Officer', 'Administrator', 'Fire Department', 'Police Department', 'Hospital / Medical'],
    items: [
      { path: '/alerts', label: 'Alert Center', icon: Bell, badgeKey: 'alerts' },
      { path: '/capacity', label: 'Capacity Dashboard', icon: Building2, roles: ['District Officer', 'Disaster Management Officer', 'Field Officer', 'Administrator', 'Hospital / Medical'] },
    ],
  },
  {
    title: 'SYSTEM',
    allowedRoles: ['District Officer', 'Disaster Management Officer', 'Administrator'],
    items: [
      { path: '/methodology', label: 'Methodology', icon: BookOpen },
    ],
  },
];

const ROLE_COLORS = {
  'District Officer': 'bg-sky-500/20 text-sky-400',
  'Emergency Agency': 'bg-amber-500/20 text-amber-400',
  'Administrator': 'bg-violet-500/20 text-violet-400',
  'Fire Department': 'bg-red-500/20 text-red-400',
  'Police Department': 'bg-blue-500/20 text-blue-400',
  'Hospital / Medical': 'bg-emerald-500/20 text-emerald-400',
  'Field Officer': 'bg-stone-500/20 text-stone-400',
};

const AVATAR_COLORS = {
  'District Officer': 'bg-sky-600',
  'Emergency Agency': 'bg-amber-600',
  'Administrator': 'bg-violet-600',
  'Fire Department': 'bg-red-600',
  'Police Department': 'bg-blue-600',
  'Hospital / Medical': 'bg-emerald-600',
  'Field Officer': 'bg-stone-600',
};

export default function Sidebar() {
  const { user, logout, switchRole, alerts, presentationMode, togglePresentationMode } = useApp();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  /* ── Collapsed icon rail ─────────────────────────────────────────── */
  if (presentationMode || collapsed) {
    return (
      <aside className="hidden sm:flex w-16 h-screen bg-slate-900 text-white flex-col items-center py-4 border-r border-slate-700/50 flex-shrink-0 z-30 select-none">
        {/* Logo */}
        <div
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center cursor-pointer mb-5 shadow-lg shadow-sky-500/20"
          title="Aegis"
        >
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>

        {/* Expand */}
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center mb-4 transition-colors"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Nav icons */}
        <div className="flex-1 overflow-y-auto space-y-1 w-full px-2">
          {NAV_SECTIONS.filter(s => !s.allowedRoles || s.allowedRoles.includes(user?.role || 'District Officer'))
            .flatMap((s) => s.items)
            .filter(item => !item.roles || item.roles.includes(user?.role || 'District Officer'))
            .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                title={item.label}
                className={({ isActive }) =>
                  `w-11 h-10 mx-auto rounded-xl flex items-center justify-center transition-all relative ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.badgeKey === 'alerts' && activeAlertsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>
      </aside>
    );
  }

  /* ── Full expanded sidebar ───────────────────────────────────────── */
  return (
    <>
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      
      <aside className={`fixed md:relative inset-y-0 left-0 w-[280px] h-screen bg-[#0b1121] text-slate-300 flex-col flex-shrink-0 border-r border-slate-700/50 select-none z-50 transition-transform transform ${collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
        
        {/* ── Brand Header ─────────────────────────────────────────── */}
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0">
          <div
            onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white tracking-tight">AEGIS</span>
              <span className="text-[9px] font-mono uppercase bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30">
                v2.0
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              Disaster Intelligence
            </p>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation Sections ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {NAV_SECTIONS.filter(s => !s.allowedRoles || s.allowedRoles.includes(user?.role || 'District Officer')).map((section) => {
          const visibleItems = section.items.filter(item => !item.roles || item.roles.includes(user?.role || 'District Officer'));
          if (visibleItems.length === 0) return null;
          return (
          <div key={section.title} className="space-y-1">
            <p className="px-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500/80 mb-2">
              {section.title}
            </p>
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badgeKey === 'alerts' && activeAlertsCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-1.5 rounded-full min-w-[18px] text-center">
                      {activeAlertsCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        );
      })}
      </nav>

      {/* ── Officer Profile ──────────────────────────────────────── */}
      <div className="p-4 border-t border-slate-700/50 relative flex-shrink-0">
        {/* Profile flyup popup */}
        {profileOpen && (
          <div className="absolute bottom-[80px] left-4 right-4 bg-slate-800 border border-slate-700/80 rounded-xl p-4 shadow-2xl space-y-3 z-50 text-xs">
            <div className="pb-2 border-b border-slate-700/50">
              <p className="font-bold text-white text-xs">{user?.name || 'Officer'}</p>
              <p className="text-[11px] text-slate-400">{user?.email || 'officer@maharashtra.gov.in'}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Switch Persona:</p>
              <div className="space-y-1">
                {['District Officer', 'Emergency Agency', 'Fire Department', 'Police Department', 'Hospital / Medical', 'Field Officer'].map((r) => (
                  <button
                    key={r}
                    onClick={() => { switchRole(r); setProfileOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      user?.role === r
                        ? 'bg-sky-500/20 text-sky-400 font-bold'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between">
              <button
                onClick={() => { togglePresentationMode(); setProfileOpen(false); }}
                className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Presentation Mode</span>
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Profile bar */}
        <div
          onClick={() => setProfileOpen(!profileOpen)}
          className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${AVATAR_COLORS[user?.role] || 'bg-sky-600'} text-white font-black text-xs flex items-center justify-center flex-shrink-0`}>
              {user?.avatar || (user?.name ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'OP')}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                {user?.name || 'Officer'}
              </p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${ROLE_COLORS[user?.role] || ROLE_COLORS['District Officer']}`}>
                {user?.role || 'District Officer'}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
        </div>

        {/* Footer */}
        <div className="mt-2 px-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-slate-600 font-mono">AEGIS v2.0 · Live</span>
        </div>
      </div>
      </aside>
    </>
  );
}
