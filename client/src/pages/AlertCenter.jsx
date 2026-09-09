import React, { useState, useEffect } from 'react';
import { getAlerts } from '../api';
import AlertCard from '../components/AlertCard';
import Topbar from '../components/Topbar';
import { useApp } from '../context/AppContext';

const AGENCIES = [
  'All',
  'District Administration',
  'Police',
  'Fire Department',
  'Hospitals',
  'NDRF/SDRF',
  'Citizens',
  'Local Administration',
  'Emergency Response Team',
];

const STATUS_TABS = ['active', 'acknowledged', 'resolved'];

export default function AlertCenter() {
  const { refetch } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState('All');
  const [status, setStatus] = useState('active');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = { status };
      if (agency !== 'All') params.agency = agency;
      const r = await getAlerts(params);
      setAlerts(r.data.data);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [agency, status]);

  const handleUpdate = () => { fetchAlerts(); refetch(); };

  const statusColor = { active: 'text-red-600', acknowledged: 'text-yellow-600', resolved: 'text-green-600' };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar title="Alert Center" subtitle="Multi-agency alert simulation · PROTOTYPE — No real messages sent" />

      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-4">
        {/* Notice banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 flex-shrink-0">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Prototype Alert Simulation</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Alerts are generated and stored within this prototype only. <strong>No real SMS, WhatsApp, phone calls, or official notifications are sent.</strong> All alert workflow is internal to this demo system.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Status tabs */}
          <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                  status === s ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Agency filter */}
          <select
            className="input py-2 text-sm w-56"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
          >
            {AGENCIES.map((a) => <option key={a}>{a}</option>)}
          </select>

          <span className={`text-xs font-semibold ${statusColor[status]}`}>
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </span>

          <button className="btn btn-ghost text-xs py-1.5 ml-auto" onClick={handleUpdate}>
            ↻ Refresh
          </button>
        </div>

        {/* Alert grid */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
            </div>
          )}
          {!loading && alerts.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-slate-600 font-semibold">No {status} alerts</p>
                <p className="text-slate-400 text-sm mt-1">
                  Generate alerts by visiting a high-risk village and clicking "Simulate Alert"
                </p>
              </div>
            </div>
          )}
          {!loading && alerts.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {alerts.map((a) => (
                <AlertCard key={a._id} alert={a} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
