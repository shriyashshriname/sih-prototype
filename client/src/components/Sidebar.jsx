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
  Users,
  BookOpen,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { path: '/map', label: 'GIS Risk Map', icon: Map },
      { path: '/red-zones', label: 'Red Zones', icon: ShieldAlert },
    ],
  },
  {
    title: 'RELOCATION',
    items: [
      { path: '/relocation-priority', label: 'Priority', icon: ListOrdered },
      { path: '/relocation-planner', label: 'Planner', icon: GitMerge },
      { path: '/safe-sites', label: 'Safe Sites', icon: CheckCircle2 },
      { path: '/capacity', label: 'Capacity', icon: Building2 },
    ],
  },
  {
    title: 'RESPONSE',
    items: [
      { path: '/alerts', label: 'Alerts', icon: Bell, badgeKey: 'alerts' },
      { path: '/agency', label: 'Agency Coordination', icon: Radio },
    ],
  },
  {
    title: 'COMMUNITY',
    items: [
      { path: '/citizen', label: 'Citizen Portal', icon: Users },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { path: '/methodology', label: 'Methodology', icon: BookOpen },
    ],
  },
];

export default function Sidebar() {
  const { user, logout, switchRole, alerts, presentationMode, togglePresentationMode } = useApp();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  if (presentationMode || collapsed) {
    // Slim collapsed icon sidebar
    return (
      <aside className="hidden sm:flex w-16 h-screen bg-slate-950 text-white flex-col items-center py-4 border-r border-slate-800/80 flex-shrink-0 transition-all duration-300 z-30 select-none">
        <div
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center cursor-pointer mb-5 shadow-md shadow-blue-500/20"
          title="Aegis Command Center"
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
        
        {/* Toggle Expand */}
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 flex items-center justify-center mb-4 transition-colors"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 w-full px-2">
          {NAV_SECTIONS.flatMap((s) => s.items).map((item) => {
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
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
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

        <button
          onClick={togglePresentationMode}
          className="w-9 h-9 rounded-lg bg-blue-600/30 text-blue-300 flex items-center justify-center hover:bg-blue-600/50 mt-2"
          title="Presentation Mode"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex w-64 h-screen bg-slate-950 text-slate-300 flex-col flex-shrink-0 border-r border-slate-800/80 select-none transition-all duration-300 z-30">
      {/* ── Brand Header ────────────────────────────────────── */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white tracking-tight">AEGIS</span>
              <span className="text-[9px] font-mono uppercase bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded">
                v2.0
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {user?.role || 'District Officer'}
            </p>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation Sections ─────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <p className="px-3 text-[9.5px] font-black uppercase tracking-widest text-slate-400 mb-1">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-bold pl-3.5 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-blue-300 before:rounded-r'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  {item.badgeKey === 'alerts' && activeAlertsCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                      {activeAlertsCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>


      {/* ── Officer Profile & Role Menu ─────────────────────── */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 relative">
        {profileOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-2xl space-y-3 z-50 text-xs">
            <div className="pb-2 border-b border-white/10">
              <p className="font-bold text-white text-xs">{user?.name || 'Officer'}</p>
              <p className="text-[11px] text-slate-400">{user?.email || 'officer@maharashtra.gov.in'}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Switch Persona:</p>
              <div className="space-y-1">
                {['District Officer', 'Emergency Agency', 'Administrator'].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setProfileOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                      user?.role === r
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  togglePresentationMode();
                  setProfileOpen(false);
                }}
                className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Presentation Mode</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
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
          className="p-2 rounded-xl hover:bg-slate-900 cursor-pointer flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-black text-xs flex items-center justify-center">
              {user?.avatar || 'RD'}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                {user?.name || 'Dr. Rajesh Deshmukh'}
              </p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Authorized Session</span>
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
