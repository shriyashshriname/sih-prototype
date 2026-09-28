import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PRIORITY_COLOR = {
  Immediate: '#ef4444',
  'Short-Term': '#f97316',
  'Medium-Term': '#eab308',
  Monitor: '#22c55e',
};
const ZONE_COLOR = {
  composite: '#ef4444',
  flood: '#38bdf8',
  landslide: '#a855f7',
  coastal: '#06b6d4',
};

const makeHabitationIcon = (color, score) => {
  const r = Math.max(10, Math.min(22, 6 + score / 6));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${r * 2 + 8}" height="${r * 2 + 8}">
      <circle cx="${r + 4}" cy="${r + 4}" r="${r}" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="1.8"/>
      <circle cx="${r + 4}" cy="${r + 4}" r="${r * 0.52}" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [r * 2 + 8, r * 2 + 8],
    iconAnchor: [r + 4, r + 4],
    popupAnchor: [0, -(r + 6)],
  });
};

const makeSiteIcon = () =>
  L.divIcon({
    html: `<div style="width:20px;height:20px;background:#0284c7;border:2px solid #38bdf8;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;box-shadow:0 0 10px rgba(56,189,248,0.5);color:white">🏠</div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });

export default function MapView({
  habitations = [],
  sites = [],
  polygons = [],
  height = '100%',
  onHabitationClick,
  showSites = true,
  showPolygons = true,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef({ habitation: null, sites: null, polygons: null });
  const navigate = useNavigate();

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;
    const map = L.map(mapRef.current, {
      center: [17.5, 74.0],
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c', 'd'],
      attribution: '&copy; CARTO &copy; OpenStreetMap | Aegis AI',
      maxZoom: 18,
    }).addTo(map);

    // Dark Legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const d = L.DomUtil.create('div', '');
      d.style.cssText =
        'background:#0f172a;padding:10px 14px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.6);font-size:11px;font-family:Rajdhani,Inter,sans-serif;border:1px solid rgba(148,163,184,0.2);min-width:140px;color:#94a3b8';
      d.innerHTML = `
        <p style="font-weight:700;margin-bottom:6px;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#e2e8f0;font-family:'Orbitron',monospace">RELOCATION MATRIX</p>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="width:8px;height:8px;border-radius:50%;background:#ef4444;box-shadow:0 0 6px #ef4444"></span><span style="color:#f87171;font-weight:600">Immediate</span></div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="width:8px;height:8px;border-radius:50%;background:#f97316"></span><span style="color:#fb923c">Short-Term</span></div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="width:8px;height:8px;border-radius:50%;background:#eab308"></span><span style="color:#fde047">Medium-Term</span></div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px"><span style="width:8px;height:8px;border-radius:50%;background:#22c55e"></span><span style="color:#4ade80">Monitor</span></div>
        <div style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:2px;background:#38bdf8"></span><span style="color:#38bdf8">Safe Shelter</span></div>
      `;
      return d;
    };
    legend.addTo(map);

    mapInstance.current = map;
  }, []);

  // Update habitation markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || habitations.length === 0) return;

    if (layersRef.current.habitation) {
      layersRef.current.habitation.clearLayers();
    } else {
      layersRef.current.habitation = L.layerGroup().addTo(map);
    }

    habitations.forEach((h) => {
      const color = PRIORITY_COLOR[h.relocationTimeline] || '#22c55e';
      const icon = makeHabitationIcon(color, h.hazardScore || h.risk_score || 0);
      const marker = L.marker([h.lat, h.lng], { icon });

      const timeline = h.relocationTimeline || h.risk_category || 'Monitor';
      const score = h.hazardScore ?? h.risk_score ?? h.relocationPriorityScore ?? '?';
      const popHtml = `
        <div style="padding:12px;min-width:210px;font-family:Rajdhani,Inter,sans-serif;background:#0f172a;border-radius:10px;color:#e2e8f0;border:1px solid rgba(148,163,184,0.2)">
          <div style="margin-bottom:6px">
            <p style="font-weight:800;font-size:14px;color:#ffffff;margin:0">${h.displayName || h.name}</p>
            <p style="font-size:11px;color:#94a3b8;margin:0">${h.district}, Maharashtra</p>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
            <div style="background:#1e293b;padding:6px;border-radius:6px">
              <p style="color:#64748b;font-size:9px;margin:0;text-transform:uppercase">Risk Score</p>
              <p style="font-family:'Orbitron',monospace;font-weight:700;color:${color};font-size:15px;margin:0">${score}/100</p>
            </div>
            <div style="background:#1e293b;padding:6px;border-radius:6px">
              <p style="color:#64748b;font-size:9px;margin:0;text-transform:uppercase">Population</p>
              <p style="font-family:'Orbitron',monospace;font-weight:700;color:#f8fafc;font-size:15px;margin:0">${h.population?.toLocaleString()}</p>
            </div>
          </div>
          <div style="padding:4px 8px;border-radius:12px;display:inline-block;font-size:10px;font-family:'Orbitron',monospace;font-weight:700;margin-bottom:8px;background:${color}20;color:${color};border:1px solid ${color}40">
            ${timeline.toUpperCase()}
          </div>
          <br/>
          <button id="popup-btn-${h._id}" style="width:100%;padding:6px;background:#0284c7;color:white;border:none;border-radius:6px;font-family:'Orbitron',monospace;font-size:10px;font-weight:700;cursor:pointer">
            VIEW INTEL →
          </button>
        </div>`;

      const popup = L.popup({
        maxWidth: 260,
        className: 'aegis-dark-popup',
      }).setContent(popHtml);

      marker.bindPopup(popup);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${h._id}`);
        if (btn) {
          btn.onclick = () =>
            onHabitationClick ? onHabitationClick(h._id) : navigate(`/habitation/${h._id}`);
        }
      });
      layersRef.current.habitation.addLayer(marker);
    });

    // Fit bounds
    if (habitations.length > 0) {
      const latlngs = habitations.map((h) => [h.lat, h.lng]);
      map.fitBounds(L.latLngBounds(latlngs).pad(0.1));
    }
  }, [habitations]);

  // Safe site markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (layersRef.current.sites) {
      layersRef.current.sites.clearLayers();
    } else {
      layersRef.current.sites = L.layerGroup().addTo(map);
    }

    if (!showSites) return;

    sites.forEach((s) => {
      const icon = makeSiteIcon();
      const marker = L.marker([s.lat, s.lng], { icon });
      const popHtml = `
        <div style="padding:12px;min-width:200px;font-family:Rajdhani,Inter,sans-serif;background:#0f172a;border-radius:10px;color:#e2e8f0;border:1px solid rgba(56,189,248,0.3)">
          <p style="font-weight:800;font-size:13px;color:#ffffff;margin:0 0 2px 0">${s.displayName || s.name}</p>
          <p style="font-size:11px;color:#94a3b8;margin:0 0 8px 0">${s.district} · Safe Shelter</p>
          <div style="font-size:11px;color:#cbd5e1">
            <p style="margin:0">Suitability: <strong style="color:#38bdf8;font-family:'Orbitron',monospace">${s.suitabilityScore}/100</strong></p>
            <p style="margin:0">Available: <strong style="color:#4ade80;font-family:'Orbitron',monospace">${s.available?.toLocaleString()}</strong></p>
          </div>
        </div>`;
      marker.bindPopup(L.popup({ maxWidth: 240, className: 'aegis-dark-popup' }).setContent(popHtml));
      layersRef.current.sites.addLayer(marker);
    });
  }, [sites, showSites]);

  // Red zone polygons
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (layersRef.current.polygons) {
      layersRef.current.polygons.clearLayers();
    } else {
      layersRef.current.polygons = L.layerGroup().addTo(map);
    }

    if (!showPolygons || polygons.length === 0) return;

    polygons.forEach((z) => {
      const color = ZONE_COLOR[z.type] || '#ef4444';
      const poly = L.polygon(z.polygon, {
        color,
        weight: 2,
        opacity: 0.8,
        fillColor: color,
        fillOpacity: 0.14,
        dashArray: '6 4',
      });
      poly.bindTooltip(
        `<span style="font-family:'Orbitron',monospace;font-size:10px;color:#f87171">${z.name}</span><br/><span style="font-size:10px">${(z.dominantHazards || []).join(' + ')}</span>`,
        { sticky: true, className: 'aegis-cyber-tooltip' }
      );
      layersRef.current.polygons.addLayer(poly);
    });
  }, [polygons, showPolygons]);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: '100%',
        borderRadius: '12px',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  );
}
