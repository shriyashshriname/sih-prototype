import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { acknowledgeAlert, resolveAlert } from '../api';
import toast from 'react-hot-toast';
import {
  Bell,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  Shield,
  ShieldAlert,
  Building2,
  Users,
  Radio,
  ArrowRight,
  Check,
  Activity,
} from 'lucide-react';

const agencyIcons = {
  'District Administration': Building2,
  'Police': Shield,
  'Fire Department': Flame,
  'Hospitals': Activity,
  'NDRF/SDRF': ShieldAlert,
  'Citizens': Users,
  'Local Administration': Building2,
  'Emergency Response Team': Radio,
};

const priorityConfig = {
  critical: {
    label: 'CRITICAL',
    badge: 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    borderLeft: 'border-l-red-500',
    glow: 'from-red-500/10 via-red-500/5 to-transparent',
    iconColor: 'text-red-400',
  },
  high: {
    label: 'HIGH',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    borderLeft: 'border-l-amber-500',
    glow: 'from-amber-500/10 via-amber-500/5 to-transparent',
    iconColor: 'text-amber-400',
  },
  warning: {
    label: 'WARNING',
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.25)]',
    dot: 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]',
    borderLeft: 'border-l-yellow-500',
    glow: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
    iconColor: 'text-yellow-400',
  },
  info: {
    label: 'INFO',
    badge: 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.25)]',
    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.8)]',
    borderLeft: 'border-l-sky-500',
    glow: 'from-sky-500/10 via-sky-500/5 to-transparent',
    iconColor: 'text-sky-400',
  },
};

export default function AlertCard({ alert, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const cfg = priorityConfig[alert.priority?.toLowerCase()] || priorityConfig.info;
  const AgencyIcon = agencyIcons[alert.target_agency] || Bell;

  const handleAcknowledge = async () => {
    try {
      setLoading(true);
      await acknowledgeAlert(alert._id, 'Command Duty Officer');
      toast.success('Incident alert acknowledged by Command Center');
      onUpdate?.();
    } catch {
      toast.error('Failed to acknowledge alert');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setLoading(true);
      await resolveAlert(alert._id);
      toast.success('Incident resolved and archived');
      onUpdate?.();
    } catch {
      toast.error('Failed to resolve alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-5 shadow-xl hover:border-slate-500 hover:bg-slate-800/95 transition-all duration-200 relative overflow-hidden group border-l-4 ${cfg.borderLeft} flex flex-col justify-between`}
    >
      {/* Subtle background ambient gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${cfg.glow} pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

      <div className="relative z-10">
        {/* Header: Agency, Habitation & Severity Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-center justify-center flex-shrink-0 text-slate-300 group-hover:text-white transition-colors">
              <AgencyIcon className={`w-4 h-4 ${cfg.iconColor}`} />
            </div>
            <div>
              <p className="font-tech font-bold text-white text-sm tracking-wider uppercase flex items-center gap-1.5">
                {alert.target_agency}
              </p>
              <div className="flex items-center gap-1 text-sky-400 text-xs mt-0.5 font-semibold">
                <MapPin className="w-3 h-3 text-sky-400 flex-shrink-0" />
                <span className="truncate max-w-[200px]">{alert.village_name || 'Maharashtra Sector'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-cyber font-bold tracking-widest uppercase ${cfg.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Message body */}
        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-4 font-normal bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
          {alert.message}
        </p>

        {/* Telemetry and metadata strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 mb-4 pb-3 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500 font-tech uppercase text-[10px] font-bold">Risk:</span>
              <strong className="text-slate-200 font-cyber font-bold">{alert.risk_category || 'N/A'}</strong>
              {alert.risk_score !== undefined && (
                <span className="font-cyber text-[10px] px-1.5 py-0.2 rounded bg-slate-700/80 text-sky-300 border border-slate-600/40">
                  {alert.risk_score}/100
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>
              {alert.createdAt
                ? new Date(alert.createdAt).toLocaleString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now'}
            </span>
          </div>
        </div>

        {/* Status notice */}
        {alert.status === 'acknowledged' && (
          <div className="mb-3.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>
              Acknowledged by <strong className="text-white font-medium">{alert.acknowledged_by || 'Officer'}</strong>
            </span>
          </div>
        )}

        {/* Simulation note */}
        {alert.simulation_note && (
          <p className="text-[11px] text-slate-500 italic mb-3.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            {alert.simulation_note}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 pt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {alert.village_id && (
            <button
              onClick={() => navigate(`/map?search=${encodeURIComponent(alert.village_name || '')}`)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-600/40 transition-colors flex items-center gap-1.5"
              title="Inspect village on GIS map"
            >
              <MapPin className="w-3 h-3 text-sky-400" />
              <span>GIS Pin</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {alert.status === 'active' && (
            <>
              <button
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                onClick={handleAcknowledge}
                disabled={loading}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{loading ? 'Updating...' : 'Acknowledge'}</span>
              </button>
              <button
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                onClick={handleResolve}
                disabled={loading}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Resolve</span>
              </button>
            </>
          )}

          {alert.status === 'acknowledged' && (
            <button
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              onClick={handleResolve}
              disabled={loading}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{loading ? 'Resolving...' : 'Mark Resolved'}</span>
            </button>
          )}

          {alert.status === 'resolved' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-tech font-bold uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5" />
              Archived Resolved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
