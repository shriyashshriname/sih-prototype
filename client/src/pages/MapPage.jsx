import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getRedZones, getRelocationSites, simulateAlerts } from '../api';
import Topbar from '../components/Topbar';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import toast from 'react-hot-toast';
import {
  Layers,
  MapPin,
  ShieldAlert,
  Building2,
  Activity,
  Search,
  X,
  Eye,
  EyeOff,
  Navigation,
  Compass,
  Radio,
  Users,
  Route,
  Zap,
  ChevronRight,
  Maximize2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Flame,
  Info,
} from 'lucide-react';

/* ── Leaflet icon fix ────────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ── CartoDB DarkMatter Tiles ───────────────────────────────── */
const DARK_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DARK_ATTR  = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Aegis AI';

/* ── Risk color map ──────────────────────────────────────────── */
const RISK_COLOR = {
  Critical: '#ef4444',
  High: '#f97316',
  Moderate: '#eab308',
  Low: '#22c55e',
};

function getRiskCategory(score) {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Moderate';
  return 'Low';
}

function getRiskColor(score) {
  return RISK_COLOR[getRiskCategory(score)] || '#22c55e';
}

/* ── Custom Habitation SVG Icon with Neon Glow ───────────────── */
const makeHabitationCircle = (color, score, isCritical) => {
  const r = Math.max(12, Math.min(24, 8 + score / 5));
  const pulseClass = isCritical ? 'aegis-ping-circle' : '';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${r * 2 + 16}" height="${r * 2 + 16}" viewBox="0 0 ${r * 2 + 16} ${r * 2 + 16}">
      ${
        isCritical
          ? `<circle cx="${r + 8}" cy="${r + 8}" r="${r + 4}" fill="none" stroke="${color}" stroke-width="1.5" stroke-opacity="0.6" class="${pulseClass}"/>`
          : ''
      }
      <circle cx="${r + 8}" cy="${r + 8}" r="${r}" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="2"/>
      <circle cx="${r + 8}" cy="${r + 8}" r="${r * 0.52}" fill="${color}" stroke="#ffffff" stroke-width="1.8"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: 'aegis-map-marker',
    iconSize: [r * 2 + 16, r * 2 + 16],
    iconAnchor: [r + 8, r + 8],
    popupAnchor: [0, -(r + 8)],
  });
};

/* ── Custom Shelter Icon ─────────────────────────────────────── */
const makeShelterIcon = () =>
  L.divIcon({
    html: `
      <div style="width:24px;height:24px;background:#0284c7;border:2px solid #38bdf8;border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(56,189,248,0.6);font-size:12px;color:white">
        🏠
      </div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });

const DISTRICTS = ['All', 'Pune', 'Satara', 'Kolhapur', 'Raigad', 'Ratnagiri', 'Sindhudurg'];

const PRESETS = [
  { label: 'Maharashtra Sector', coords: [18.8, 74.5], zoom: 7 },
  { label: 'Western Ghats Corridor', coords: [18.2, 73.5], zoom: 9 },
  { label: 'Konkan Coastline', coords: [17.3, 73.3], zoom: 8 },
  { label: 'Pune & Satara Cluster', coords: [17.8, 73.9], zoom: 9 },
];

/* ── Layer Toggle Component ─────────────────────────────────── */
function LayerToggle({ icon: Icon, label, count, active, color, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
        active
          ? 'bg-slate-700/80 text-white border border-slate-600/70 shadow-sm'
          : 'bg-slate-800/60 text-slate-400 border border-slate-700/30 hover:border-slate-600/50 hover:text-slate-300'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-2.5 h-2.5 rounded-full ${active ? 'shadow-[0_0_8px_currentColor]' : 'opacity-30'}`}
          style={{ background: color, color }}
        />
        <Icon className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-tech uppercase tracking-wide text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {count !== undefined && (
          <span
            className={`font-cyber text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              active ? 'bg-slate-600 text-sky-300' : 'bg-slate-700 text-slate-500'
            }`}
          >
            {count}
          </span>
        )}
        {active ? <Eye className="w-3.5 h-3.5 text-sky-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
      </div>
    </button>
  );
}

export default function MapPage() {
  const { habitations, loading } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [polygons, setPolygons] = useState([]);
  const [sites, setSites] = useState([]);

  // Layer toggles
  const [showHabitations, setShowHabitations] = useState(true);
  const [showRedZones, setShowRedZones]         = useState(true);
  const [showShelters, setShowShelters]         = useState(true);
  const [showHeatmap, setShowHeatmap]           = useState(true);
  const [showRoutes, setShowRoutes]             = useState(true);
  const [showPopulation, setShowPopulation]     = useState(false);

  // Inspector and search
  const [selectedH, setSelectedH] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Leaflet refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef({
    cluster: null,
    sites: null,
    polygons: null,
    routes: null,
    heatmap: null,
    population: null,
  });

  /* ── Fetch red zones + shelters ─────────────────────────── */
  useEffect(() => {
    getRedZones()
      .then((r) => {
        if (r.data?.data?.polygons) setPolygons(r.data.data.polygons);
      })
      .catch(() => {});
    getRelocationSites()
      .then((r) => {
        if (r.data?.data) setSites(r.data.data);
      })
      .catch(() => {});
  }, []);

  /* ── Initialize Leaflet Map with CartoDB DarkMatter ──────── */
  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [18.5204, 74.2],
      zoom: 7,
      zoomControl: false,
    });

    L.tileLayer(DARK_TILES, {
      subdomains: ['a', 'b', 'c', 'd'],
      attribution: DARK_ATTR,
      maxZoom: 19,
      className: 'map-tiles-dark',
    }).addTo(map);

    // Zoom control on top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstance.current = map;
  }, []);

  /* ── Filtered Habitations ───────────────────────────────── */
  const filteredHabitations = useMemo(() => {
    return habitations.filter((h) => {
      if (selectedDistrict !== 'All' && h.district?.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = h.name?.toLowerCase().includes(q) || h.displayName?.toLowerCase().includes(q);
        const matchesDistrict = h.district?.toLowerCase().includes(q);
        if (!matchesName && !matchesDistrict) return false;
      }
      return true;
    });
  }, [habitations, selectedDistrict, searchQuery]);

  /* ── Select habitation and fly camera ───────────────────── */
  const handleSelectHabitation = (h) => {
    setSelectedH(h);
    if (mapInstance.current && h.lat && h.lng) {
      mapInstance.current.flyTo([h.lat, h.lng], 12, { duration: 1.2 });
    }
  };

  /* ── Handle Alert Simulation Trigger ─────────────────────── */
  const handleTriggerAlert = async (h) => {
    try {
      await simulateAlerts(h._id);
      toast.success(`Disaster alert drill simulated for ${h.name}`, {
        icon: '🚨',
        style: {
          borderRadius: '10px',
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid rgba(239, 68, 68, 0.4)',
        },
      });
    } catch {
      toast.error('Simulation trigger failed');
    }
  };

  /* ── Habitations Layer (with Cyber Cluster) ──────────────── */
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (layersRef.current.cluster) {
      layersRef.current.cluster.clearLayers();
    } else {
      layersRef.current.cluster = L.markerClusterGroup({
        maxClusterRadius: 45,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function (cluster) {
          const count = cluster.getChildCount();
          let colorClass = 'bg-sky-500/80 border-sky-400 text-white shadow-[0_0_14px_rgba(14,165,233,0.6)]';
          if (count > 15) {
            colorClass = 'bg-red-500/80 border-red-400 text-white shadow-[0_0_14px_rgba(239,68,68,0.6)]';
          } else if (count > 6) {
            colorClass = 'bg-amber-500/80 border-amber-400 text-white shadow-[0_0_14px_rgba(245,158,11,0.6)]';
          }
          return L.divIcon({
            html: `<div style="width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-weight:700;font-size:12px;backdrop-filter:blur(8px);" class="${colorClass} border-2">${count}</div>`,
            className: 'custom-cyber-cluster',
            iconSize: L.point(38, 38),
          });
        },
      }).addTo(map);
    }

    if (!showHabitations) return;

    filteredHabitations.forEach((h) => {
      const score = h.relocationPriorityScore || h.compositeRiskScore || h.hazardScore || 0;
      const color = getRiskColor(score);
      const cat   = getRiskCategory(score);
      const isCritical = score >= 75;
      const icon  = makeHabitationCircle(color, score, isCritical);

      const marker = L.marker([h.lat, h.lng], { icon });

      const popHtml = `
        <div style="padding:14px;min-width:250px;font-family:Rajdhani,Inter,sans-serif;background:#0f172a;border-radius:12px;color:#e2e8f0;border:1px solid rgba(148,163,184,0.2);box-shadow:0 12px 36px rgba(0,0,0,0.8)">
          <div style="margin-bottom:10px;border-bottom:1px solid rgba(148,163,184,0.15);padding-bottom:8px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:9px;font-family:'Orbitron',monospace;font-weight:700;letter-spacing:0.1em;color:#38bdf8;text-transform:uppercase">HABITATION INTEL</span>
              <span style="font-size:9px;font-family:'Orbitron',monospace;font-weight:700;padding:2px 8px;border-radius:12px;background:${color}20;color:${color};border:1px solid ${color}40">${cat.toUpperCase()}</span>
            </div>
            <p style="font-weight:800;font-size:16px;color:#ffffff;margin:4px 0 2px 0;letter-spacing:0.02em">${h.displayName || h.name}</p>
            <p style="font-size:11px;color:#94a3b8;margin:0">${h.district}, Maharashtra Sector</p>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
            <div style="background:#1e293b;padding:8px 10px;border-radius:8px;border:1px solid rgba(148,163,184,0.1)">
              <p style="color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;margin:0 0 2px 0">Risk Score</p>
              <p style="font-family:'Orbitron',monospace;font-weight:800;color:${color};font-size:18px;margin:0">${score}<span style="font-size:10px;color:#64748b">/100</span></p>
            </div>
            <div style="background:#1e293b;padding:8px 10px;border-radius:8px;border:1px solid rgba(148,163,184,0.1)">
              <p style="color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;margin:0 0 2px 0">Population</p>
              <p style="font-family:'Orbitron',monospace;font-weight:800;color:#f8fafc;font-size:18px;margin:0">${(h.population || 0).toLocaleString()}</p>
            </div>
          </div>

          <div style="display:flex;gap:6px">
            <button id="inspect-h-${h._id}" style="flex:1;padding:8px;background:#0284c7;color:#ffffff;border:none;border-radius:8px;font-family:'Orbitron',monospace;font-size:10px;font-weight:700;cursor:pointer;letter-spacing:0.04em">
              TACTICAL INTEL →
            </button>
          </div>
        </div>`;

      const popup = L.popup({
        maxWidth: 280,
        className: 'aegis-dark-popup',
      }).setContent(popHtml);

      marker.bindPopup(popup);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-h-${h._id}`);
        if (btn) {
          btn.onclick = () => {
            handleSelectHabitation(h);
            marker.closePopup();
          };
        }
      });
      marker.on('click', () => handleSelectHabitation(h));
      layersRef.current.cluster.addLayer(marker);
    });
  }, [filteredHabitations, showHabitations]);

  /* ── Shelter Markers Layer ───────────────────────────────── */
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (layersRef.current.sites) {
      layersRef.current.sites.clearLayers();
    } else {
      layersRef.current.sites = L.layerGroup().addTo(map);
    }

    if (!showShelters) return;

    sites.forEach((s) => {
      const marker = L.marker([s.lat, s.lng], { icon: makeShelterIcon() });
      const popHtml = `
        <div style="padding:12px 14px;min-width:220px;font-family:Rajdhani,Inter,sans-serif;background:#0f172a;border-radius:12px;color:#e2e8f0;border:1px solid rgba(56,189,248,0.3);box-shadow:0 12px 36px rgba(0,0,0,0.8)">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="font-size:9px;font-family:'Orbitron',monospace;font-weight:700;padding:2px 6px;border-radius:6px;background:#0284c725;color:#38bdf8;border:1px solid #38bdf850">SAFE SHELTER</span>
          </div>
          <p style="font-weight:800;font-size:15px;color:#ffffff;margin:0 0 2px 0">${s.displayName || s.name}</p>
          <p style="font-size:11px;color:#94a3b8;margin:0 0 10px 0">${s.district} · Designated Safe Facility</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#1e293b;padding:8px;border-radius:8px">
            <div>
              <p style="font-size:9px;color:#64748b;text-transform:uppercase;margin:0">Suitability</p>
              <p style="font-family:'Orbitron',monospace;font-weight:700;color:#38bdf8;font-size:14px;margin:0">${s.suitabilityScore}/100</p>
            </div>
            <div>
              <p style="font-size:9px;color:#64748b;text-transform:uppercase;margin:0">Capacity</p>
              <p style="font-family:'Orbitron',monospace;font-weight:700;color:#4ade80;font-size:14px;margin:0">${(s.available || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>`;
      marker.bindPopup(L.popup({ maxWidth: 260, className: 'aegis-dark-popup' }).setContent(popHtml));
      layersRef.current.sites.addLayer(marker);
    });
  }, [sites, showShelters]);

  /* ── Red Zone Polygons Layer ─────────────────────────────── */
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (layersRef.current.polygons) {
      layersRef.current.polygons.clearLayers();
    } else {
      layersRef.current.polygons = L.layerGroup().addTo(map);
    }

    if (!showRedZones || polygons.length === 0) return;

    polygons.forEach((z) => {
      const poly = L.polygon(z.polygon, {
        color: '#ef4444',
        weight: 2,
        opacity: 0.85,
        fillColor: '#ef4444',
        fillOpacity: 0.16,
        dashArray: '6, 6',
      });
      poly.bindTooltip(
        `<div style="font-family:'Orbitron',monospace;font-size:10px;font-weight:700;color:#f87171">${z.name}</div><div style="font-size:10px;color:#cbd5e1">${(z.dominantHazards || []).join(' + ')}</div>`,
        { sticky: true, className: 'aegis-cyber-tooltip' }
      );
      layersRef.current.polygons.addLayer(poly);
    });
  }, [polygons, showRedZones]);

  /* ── Evacuation Transit Corridors (Routes) Layer ─────────── */
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (layersRef.current.routes) {
      layersRef.current.routes.clearLayers();
    } else {
      layersRef.current.routes = L.layerGroup().addTo(map);
    }

    if (!showRoutes || sites.length === 0) return;

    // Connect high-risk habitations to nearest shelter site
    habitations
      .filter((h) => (h.relocationPriorityScore || h.compositeRiskScore || 0) >= 45)
      .forEach((h) => {
        let nearestSite = null;
        let minDist = Infinity;
        sites.forEach((s) => {
          const d = Math.hypot(s.lat - h.lat, s.lng - h.lng);
          if (d < minDist) {
            minDist = d;
            nearestSite = s;
          }
        });

        if (nearestSite) {
          const approxKm = Math.round(minDist * 111);
          const line = L.polyline(
            [
              [h.lat, h.lng],
              [nearestSite.lat, nearestSite.lng],
            ],
            {
              color: '#06b6d4',
              weight: 2.2,
              opacity: 0.75,
              dashArray: '8, 8',
            }
          );
          line.bindTooltip(
            `<span style="font-family:'Orbitron',monospace;font-size:10px;color:#22d3ee">TRANSIT CORRIDOR</span><br/>${h.name} → ${nearestSite.name} (~${approxKm} km)`,
            { sticky: true, className: 'aegis-cyber-tooltip' }
          );
          layersRef.current.routes.addLayer(line);
        }
      });
  }, [habitations, sites, showRoutes]);

  /* ── Multi-Hazard Heatmap Intensity Layer ────────────────── */
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (layersRef.current.heatmap) {
      layersRef.current.heatmap.clearLayers();
    } else {
      layersRef.current.heatmap = L.layerGroup().addTo(map);
    }

    if (!showHeatmap) return;

    habitations.forEach((h) => {
      const score = h.relocationPriorityScore || h.compositeRiskScore || 0;
      if (score < 40) return;

      const baseRadius = Math.max(5000, (score / 100) * 16000);
      const isCritical = score >= 75;

      // Outer thermal perimeter
      const outerCircle = L.circle([h.lat, h.lng], {
        radius: baseRadius,
        color: isCritical ? '#ef4444' : '#f97316',
        weight: 0,
        fillColor: isCritical ? '#ef4444' : '#f97316',
        fillOpacity: 0.10,
        interactive: false,
      });

      // Core thermal perimeter
      const coreCircle = L.circle([h.lat, h.lng], {
        radius: baseRadius * 0.45,
        color: isCritical ? '#dc2626' : '#ea580c',
        weight: 0,
        fillColor: isCritical ? '#dc2626' : '#ea580c',
        fillOpacity: 0.22,
        interactive: false,
      });

      layersRef.current.heatmap.addLayer(outerCircle);
      layersRef.current.heatmap.addLayer(coreCircle);
    });
  }, [habitations, showHeatmap]);

  /* ── Population Exposure Layer ───────────────────────────── */
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (layersRef.current.population) {
      layersRef.current.population.clearLayers();
    } else {
      layersRef.current.population = L.layerGroup().addTo(map);
    }

    if (!showPopulation) return;

    habitations.forEach((h) => {
      const pop = h.population || 800;
      const popRadius = Math.max(4000, Math.min(24000, Math.sqrt(pop) * 220));

      const popCircle = L.circle([h.lat, h.lng], {
        radius: popRadius,
        color: '#a855f7',
        weight: 1.2,
        dashArray: '4, 4',
        fillColor: '#8b5cf6',
        fillOpacity: 0.12,
      });

      popCircle.bindTooltip(
        `<span style="font-family:'Orbitron',monospace;font-size:10px;color:#c084fc">POPULATION EXPOSURE</span><br/>${h.name}: <strong>${pop.toLocaleString()}</strong> residents`,
        { sticky: true, className: 'aegis-cyber-tooltip' }
      );

      layersRef.current.population.addLayer(popCircle);
    });
  }, [habitations, showPopulation]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 text-slate-100">
      <Topbar
        title="Multi-Hazard GIS Intelligence Engine"
        subtitle={`${habitations.length} Monitored Habitations · ${sites.length} Safe Shelters · CartoDB DarkMatter`}
        breadcrumb="GIS Intelligence"
      />

      <div className="flex-1 relative overflow-hidden">
        {/* ── Leaflet Container ─────────────────────────────── */}
        <div ref={mapRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

        {/* ── Dark Popup and Tooltip Styles ─────────────────── */}
        <style>{`
          .aegis-dark-popup .leaflet-popup-content-wrapper {
            background: #0f172a !important;
            border: 1px solid rgba(148,163,184,0.2) !important;
            border-radius: 12px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,0.8) !important;
            padding: 0 !important;
          }
          .aegis-dark-popup .leaflet-popup-content { margin: 0 !important; }
          .aegis-dark-popup .leaflet-popup-tip { background: #0f172a !important; }
          .leaflet-control-zoom a {
            background: #0f172a !important;
            color: #94a3b8 !important;
            border: 1px solid rgba(148,163,184,0.2) !important;
            backdrop-filter: blur(8px) !important;
          }
          .leaflet-control-zoom a:hover {
            background: #1e293b !important;
            color: #38bdf8 !important;
          }
          .aegis-cyber-tooltip {
            background: #0f172a !important;
            color: #f8fafc !important;
            border: 1px solid rgba(56,189,248,0.4) !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.6) !important;
            padding: 6px 10px !important;
            font-size: 11px !important;
          }
          .aegis-cyber-tooltip:before { border-top-color: #0f172a !important; }
          @keyframes pingSlow {
            0% { transform: scale(0.9); opacity: 0.9; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          .aegis-ping-circle {
            animation: pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            transform-origin: center;
          }
        `}</style>

        {/* ── Search & District Filter Bar (Top Center) ─────── */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[92%] sm:w-[480px]">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl p-2 shadow-2xl space-y-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-sky-400" />
              <input
                type="text"
                placeholder="Search habitation, district, or hazard zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs font-tech font-bold tracking-wide text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick District Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <span className="text-[10px] font-tech font-bold uppercase text-slate-500 flex items-center gap-1 pl-1 flex-shrink-0">
                <MapPin className="w-2.5 h-2.5 text-sky-400" /> Sector:
              </span>
              {DISTRICTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDistrict(d)}
                  className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    selectedDistrict === d
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
              <span className="font-cyber text-[10px] text-slate-400 ml-auto flex-shrink-0 pr-1">
                {filteredHabitations.length} Habitations
              </span>
            </div>
          </div>
        </div>

        {/* ── Layer Controls Floating Panel (Top Left) ──────── */}
        <div className="absolute top-4 left-4 z-10 w-60">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden transition-all">
            <div
              onClick={() => setIsLayersOpen(!isLayersOpen)}
              className="px-3.5 py-2.5 border-b border-slate-700/60 flex items-center justify-between cursor-pointer hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span className="font-tech font-bold uppercase tracking-wider text-xs text-white">
                  GIS Layer Matrix
                </span>
              </div>
              {isLayersOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {isLayersOpen && (
              <div className="p-2 space-y-1.5 bg-slate-900/60">
                <LayerToggle
                  icon={MapPin}
                  label="Habitations"
                  count={filteredHabitations.length}
                  active={showHabitations}
                  color="#38bdf8"
                  onToggle={() => setShowHabitations((v) => !v)}
                />
                <LayerToggle
                  icon={ShieldAlert}
                  label="Red Zones"
                  count={polygons.length}
                  active={showRedZones}
                  color="#ef4444"
                  onToggle={() => setShowRedZones((v) => !v)}
                />
                <LayerToggle
                  icon={Building2}
                  label="Safe Shelters"
                  count={sites.length}
                  active={showShelters}
                  color="#0284c7"
                  onToggle={() => setShowShelters((v) => !v)}
                />
                <LayerToggle
                  icon={Route}
                  label="Transit Corridors"
                  active={showRoutes}
                  color="#06b6d4"
                  onToggle={() => setShowRoutes((v) => !v)}
                />
                <LayerToggle
                  icon={Flame}
                  label="Thermal Heatmap"
                  active={showHeatmap}
                  color="#f97316"
                  onToggle={() => setShowHeatmap((v) => !v)}
                />
                <LayerToggle
                  icon={Users}
                  label="Population Footprint"
                  active={showPopulation}
                  color="#a855f7"
                  onToggle={() => setShowPopulation((v) => !v)}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Sector Quick Jumps (Bottom Center) ────────────── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 px-3 py-1.5 rounded-full shadow-2xl">
          <Navigation className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          <span className="text-[10px] font-tech font-bold uppercase text-slate-400 mr-1">Sector Jump:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                if (mapInstance.current) {
                  mapInstance.current.flyTo(p.coords, p.zoom, { duration: 1.5 });
                }
              }}
              className="px-2.5 py-1 rounded-full text-[10px] font-tech font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Legend Panel (Bottom Right) ───────────────────── */}
        <div className="absolute bottom-6 right-4 z-10 w-52">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden">
            <div
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className="px-3 py-2 border-b border-slate-700/60 flex items-center justify-between cursor-pointer hover:bg-slate-800/50"
            >
              <span className="font-tech font-bold uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" /> Legend
              </span>
              {isLegendOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>

            {isLegendOpen && (
              <div className="p-2.5 space-y-1.5 text-[11px] font-medium text-slate-300 bg-slate-900/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse flex-shrink-0" />
                  <span className="font-tech font-bold uppercase">Critical Risk (&gt;75)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="font-tech font-bold uppercase">High Risk (50–74)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex-shrink-0" />
                  <span className="font-tech font-bold uppercase">Moderate (25–49)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="font-tech font-bold uppercase">Low Risk (&lt;25)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-sky-500 flex-shrink-0" />
                  <span className="font-tech font-bold uppercase">Designated Shelter</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 border-t border-cyan-400 border-dashed flex-shrink-0" />
                  <span className="font-tech font-bold uppercase text-cyan-300">Evacuation Corridor</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Selected Habitation Dossier Slide-Over (Right Side) */}
        {selectedH && (
          <div className="absolute top-4 right-4 z-20 w-80 sm:w-96 max-h-[calc(100vh-140px)] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-left">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-start justify-between flex-shrink-0">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-cyber text-[9px] font-bold uppercase tracking-widest text-sky-400">
                    TACTICAL INTEL DOSSIER
                  </span>
                  {selectedH.redZoneStatus && (
                    <span className="font-cyber text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                      RED ZONE
                    </span>
                  )}
                </div>
                <h3 className="font-cyber font-bold text-lg text-white truncate tracking-tight">
                  {selectedH.displayName || selectedH.name}
                </h3>
                <p className="text-xs text-slate-400 font-tech uppercase tracking-wide">
                  {selectedH.district} · {selectedH.subDistrict || 'Sector A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedH(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dossier Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Coordinates Pill */}
              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-400">
                <span>GEO-LOC:</span>
                <span className="text-sky-300">
                  {Number(selectedH.lat).toFixed(4)}°N, {Number(selectedH.lng).toFixed(4)}°E
                </span>
              </div>

              {/* Composite Score Gauge */}
              <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-tech font-bold uppercase tracking-wider text-xs text-slate-400">
                    Composite Risk Score
                  </span>
                  <span
                    className={`font-cyber text-xs font-black px-2 py-0.5 rounded-full border ${
                      (selectedH.relocationPriorityScore || 0) >= 75
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : (selectedH.relocationPriorityScore || 0) >= 50
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {getRiskCategory(selectedH.relocationPriorityScore || 0).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-cyber font-bold text-3xl text-white">
                    {selectedH.relocationPriorityScore || selectedH.compositeRiskScore || 0}
                  </span>
                  <span className="text-slate-500 text-sm font-cyber">/ 100</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedH.relocationPriorityScore || selectedH.compositeRiskScore || 0}%`,
                      background: getRiskColor(selectedH.relocationPriorityScore || 0),
                    }}
                  />
                </div>
              </div>

              {/* 4 Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3">
                  <span className="text-[10px] font-tech uppercase font-bold text-slate-400 block mb-1">
                    Population Exposed
                  </span>
                  <p className="font-cyber font-bold text-base text-white">
                    {(selectedH.population || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3">
                  <span className="text-[10px] font-tech uppercase font-bold text-slate-400 block mb-1">
                    Action Timeline
                  </span>
                  <p className="font-cyber font-bold text-sm text-amber-400">
                    {selectedH.relocationTimeline || 'Immediate'}
                  </p>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3">
                  <span className="text-[10px] font-tech uppercase font-bold text-slate-400 block mb-1">
                    Terrain Elevation
                  </span>
                  <p className="font-cyber font-bold text-sm text-slate-200">
                    {selectedH.elevation ? `${selectedH.elevation}m ASL` : '620m ASL'}
                  </p>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3">
                  <span className="text-[10px] font-tech uppercase font-bold text-slate-400 block mb-1">
                    Evacuation Window
                  </span>
                  <p className="font-cyber font-bold text-sm text-red-400">
                    {selectedH.relocationTimeline === 'Immediate' ? '0–7 Days' : '15–30 Days'}
                  </p>
                </div>
              </div>

              {/* Hazard Breakdown Bars */}
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3.5 space-y-2.5">
                <p className="font-tech font-bold uppercase tracking-wider text-xs text-slate-300">
                  Hazard Factor Breakdown
                </p>
                {Object.entries(selectedH.hazardScores || {
                  landslide: 84,
                  flood: 68,
                  rainfallAnomaly: 79,
                  slopeInstability: 72,
                })
                  .slice(0, 4)
                  .map(([hazard, val]) => (
                    <div key={hazard}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 capitalize font-tech font-semibold">
                          {hazard.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="font-cyber text-[11px] font-bold text-slate-200">{val}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${val}%`,
                            background: val >= 75 ? '#ef4444' : val >= 50 ? '#f97316' : '#22c55e',
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              {/* Tactical Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => navigate(`/relocation-planner?habitationId=${selectedH._id}`)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-xs font-cyber font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                >
                  <Route className="w-4 h-4" />
                  <span>Plan Relocation Corridor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTriggerAlert(selectedH)}
                    className="flex-1 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-cyber font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Drill Alert</span>
                  </button>

                  <button
                    onClick={() => navigate(`/habitation/${selectedH._id}`)}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-tech font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5 text-sky-400" />
                    <span>Full Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Loading Overlay ───────────────────────────────── */}
        {loading && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="text-center p-6 bg-slate-800/90 border border-slate-700 rounded-2xl shadow-2xl">
              <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-cyber font-bold text-sm text-white">INITIALIZING GIS INTELLIGENCE</p>
              <p className="text-xs text-slate-400 font-tech mt-1">Loading CartoDB DarkMatter Tiles & GeoJSON Layers</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
