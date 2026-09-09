import React, { useState } from 'react';
import { acknowledgeAlert, resolveAlert } from '../api';
import toast from 'react-hot-toast';

const agencyIcons = {
  'District Administration': '🏛️',
  Police:                    '👮',
  'Fire Department':         '🚒',
  Hospitals:                 '🏥',
  'NDRF/SDRF':               '⛑️',
  Citizens:                  '👥',
  'Local Administration':    '🏢',
  'Emergency Response Team': '🚨',
};

const priorityConfig = {
  info:     { cls: 'alert-info',     label: 'INFO',     textColor: '#1d4ed8' },
  warning:  { cls: 'alert-warning',  label: 'WARNING',  textColor: '#92400e' },
  high:     { cls: 'alert-high',     label: 'HIGH',     textColor: '#9a3412' },
  critical: { cls: 'alert-critical', label: 'CRITICAL', textColor: '#991b1b' },
};

export default function AlertCard({ alert, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const cfg = priorityConfig[alert.priority] || priorityConfig.info;

  const handleAcknowledge = async () => {
    try {
      setLoading(true);
      await acknowledgeAlert(alert._id, 'Duty Officer');
      toast.success('Alert acknowledged');
      onUpdate?.();
    } catch {
      toast.error('Failed to acknowledge');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setLoading(true);
      await resolveAlert(alert._id);
      toast.success('Alert resolved');
      onUpdate?.();
    } catch {
      toast.error('Failed to resolve');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card rounded-lg p-4 animate-fadeInUp ${cfg.cls}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{agencyIcons[alert.target_agency] || '📢'}</span>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{alert.target_agency}</p>
            <p className="text-xs text-slate-500">{alert.village_name}</p>
          </div>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full border"
          style={{ color: cfg.textColor, borderColor: cfg.textColor, background: 'rgba(255,255,255,0.6)' }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Message */}
      <p className="text-sm text-slate-700 mb-3 leading-relaxed">{alert.message}</p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
        <span>Risk: <strong className="text-slate-700">{alert.risk_category}</strong> ({alert.risk_score})</span>
        <span>{new Date(alert.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
        {alert.status === 'acknowledged' && (
          <span className="text-green-600 font-medium">✓ Acknowledged by {alert.acknowledged_by}</span>
        )}
      </div>

      {/* Simulation notice */}
      <p className="text-xs text-slate-400 italic mb-3">{alert.simulation_note}</p>

      {/* Actions */}
      {alert.status === 'active' && (
        <div className="flex gap-2">
          <button className="btn btn-ghost text-xs py-1.5" onClick={handleAcknowledge} disabled={loading}>
            ✓ Acknowledge
          </button>
          <button className="btn btn-success text-xs py-1.5" onClick={handleResolve} disabled={loading}>
            ✓ Resolve
          </button>
        </div>
      )}
      {alert.status === 'acknowledged' && (
        <button className="btn btn-success text-xs py-1.5" onClick={handleResolve} disabled={loading}>
          ✓ Mark Resolved
        </button>
      )}
      {alert.status === 'resolved' && (
        <span className="text-xs font-medium text-green-600">✓ Resolved</span>
      )}
    </div>
  );
}
