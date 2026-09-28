import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getRelocationSites } from '../api';
import Topbar from '../components/Topbar';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Milestone, 
  Route as RouteIcon, 
  Building2, 
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const makeOriginIcon = () => L.divIcon({
  html: `<div style="width:24px;height:24px;background:#ef4444;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;box-shadow:0 3px 8px rgba(0,0,0,0.5)">📍</div>`,
  className: '', iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -14],
});

const makeDestIcon = () => L.divIcon({
  html: `<div style="width:26px;height:26px;background:#10b981;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;color:white;box-shadow:0 3px 8px rgba(0,0,0,0.5)">🏥</div>`,
  className: '', iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -15],
});

export default function EvacuationRoutes() {
  const { habitations, loading } = useApp();
  const [sites, setSites] = useState([]);
  const [selectedHabitationId, setSelectedHabitationId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeLayerRef = useRef(null);

  useEffect(() => {
    getRelocationSites()
      .then((res) => {
        if (res.data?.data) {
          setSites(res.data.data);
          if (res.data.data.length > 0 && !selectedSiteId) {
            setSelectedSiteId(res.data.data[0]._id);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (habitations && habitations.length > 0 && !selectedHabitationId) {
      setSelectedHabitationId(habitations[0]._id);
    }
  }, [habitations]);

  const selectedHabitation = habitations?.find(h => h._id === selectedHabitationId) || habitations?.[0];
  const selectedSite = sites?.find(s => s._id === selectedSiteId) || sites?.[0];

  const calculateRoute = async () => {
    if (!selectedHabitation || !selectedSite) return;
    setCalculating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/evacuation/route', {
        from: { lat: selectedHabitation.lat, lon: selectedHabitation.lng },
        to: { lat: selectedSite.lat, lon: selectedSite.lng },
        options: { vehicleType: 'bus', priority: 'high' }
      });
      if (res.data?.success) {
        setRouteData(res.data.data);
      }
    } catch (err) {
      console.error('Route calculation error', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (selectedHabitation && selectedSite) {
      calculateRoute();
    }
  }, [selectedHabitationId, selectedSiteId]);

  // Leaflet map initialization
  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;
    const map = L.map(mapRef.current, {
      center: [18.2, 73.8],
      zoom: 8,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | Maharashtra Emergency Route Matrix',
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;
  }, []);

  // Update Polyline & Markers on Map
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !routeData || !selectedHabitation || !selectedSite) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    } else {
      routeLayerRef.current = L.layerGroup().addTo(map);
    }

    const coords = routeData.coordinates || [
      [selectedHabitation.lat, selectedHabitation.lng],
      [selectedSite.lat, selectedSite.lng]
    ];

    // Draw Polyline
    const polyline = L.polyline(coords, {
      color: '#0ea5e9',
      weight: 5,
      opacity: 0.85,
      dashArray: '8 6',
      lineJoin: 'round'
    });
    routeLayerRef.current.addLayer(polyline);

    // Origin Marker
    const originMarker = L.marker([selectedHabitation.lat, selectedHabitation.lng], { icon: makeOriginIcon() });
    originMarker.bindPopup(`<b>Origin:</b> ${selectedHabitation.name}<br/><b>Risk:</b> ${selectedHabitation.hazardScore}/100`);
    routeLayerRef.current.addLayer(originMarker);

    // Destination Marker
    const destMarker = L.marker([selectedSite.lat, selectedSite.lng], { icon: makeDestIcon() });
    destMarker.bindPopup(`<b>Relief Center:</b> ${selectedSite.name}<br/><b>Available:</b> ${selectedSite.available?.toLocaleString()} beds`);
    routeLayerRef.current.addLayer(destMarker);

    map.fitBounds(polyline.getBounds().pad(0.2));
  }, [routeData, selectedHabitation, selectedSite]);

  if (loading || !selectedHabitation) {
    return (
      <div className="flex flex-col h-screen bg-slate-900 text-white p-8 items-center justify-center">
        <Navigation className="w-12 h-12 text-sky-400 animate-spin mb-4" />
        <p className="text-slate-400">Loading Geospatial Evacuation Router...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Topbar 
        title="A* Evacuation Route Intelligence" 
        subtitle="Geospatial Hazard Avoidance & Dynamic Safe Transport Routing"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Selection Bar */}
        <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" /> Origin Habitation (Hazard Sector)
            </label>
            <select
              value={selectedHabitationId}
              onChange={(e) => setSelectedHabitationId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {habitations.map(h => (
                <option key={h._id} value={h._id}>
                  {h.name} ({h.district}) — Risk: {h.hazardScore || h.risk_score}/100
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5 space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Destination Rehabilitation Hub
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {sites.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.district}) — Capacity: {s.available?.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end justify-end">
            <button
              onClick={calculateRoute}
              disabled={calculating}
              className="w-full py-2 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              {calculating ? 'Optimizing...' : 'Calculate Path'}
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Metrics & Waypoints */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                Real-World Route Analytics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">Road Distance</span>
                  <span className="text-3xl font-extrabold text-sky-400">{routeData?.totalDistKm || '—'}</span>
                  <span className="text-xs text-slate-400 font-medium"> km</span>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">Estimated Time</span>
                  <span className="text-3xl font-extrabold text-amber-400">{routeData?.estimatedTimeMin || '—'}</span>
                  <span className="text-xs text-slate-400 font-medium"> mins</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Shelter:</span>
                  <span className="font-semibold text-emerald-400 truncate max-w-[170px]">{selectedSite?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Available Beds:</span>
                  <span className="font-semibold text-white">{selectedSite?.available?.toLocaleString()} Persons</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hazard Avoidance:</span>
                  <span className="font-semibold text-sky-400">Verified Red Zone Clearance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Transit Priority:</span>
                  <span className="font-semibold text-amber-400">Emergency Convoy Priority</span>
                </div>
              </div>
            </div>

            {/* Waypoint Checkpoints */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Milestone className="w-4 h-4 text-emerald-400" />
                Highway Route Checkpoints
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-700">
                {routeData?.waypoints?.map((wp, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 pl-8">
                    <div className={`absolute left-1.5 top-1.5 w-4 h-4 rounded-full border-2 ${
                      wp.type === 'origin' ? 'bg-red-500 border-red-300' :
                      wp.type === 'destination' ? 'bg-emerald-500 border-emerald-300' :
                      'bg-sky-500 border-sky-300'
                    }`} />
                    <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700/60 w-full text-xs">
                      <p className="font-bold text-white leading-tight">{wp.name}</p>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{wp.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right GIS Leaflet Map Display */}
          <div className="lg:col-span-8">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 h-full flex flex-col min-h-[550px]">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-sky-400" />
                  Live GIS Evacuation Corridor
                </h3>
                <span className="text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                  OpenStreetMap Cartography
                </span>
              </div>

              <div className="flex-1 rounded-xl overflow-hidden border border-slate-700 relative min-h-[480px]">
                <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '480px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
