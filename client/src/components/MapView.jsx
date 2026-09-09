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

const PRIORITY_COLOR = { 'Immediate': '#dc2626', 'Short-Term': '#ea580c', 'Medium-Term': '#d97706', 'Monitor': '#16a34a' };
const HAZARD_COLOR   = { 'Very High': '#dc2626', 'High': '#ea580c', 'Moderate': '#d97706', 'Low': '#16a34a' };
const ZONE_COLOR     = { composite: '#dc2626', flood: '#3b82f6', landslide: '#7c3aed', coastal: '#06b6d4' };

const makeHabitationIcon = (color, score) => {
  const r = Math.max(12, Math.min(24, 8 + score / 6));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${r*2+6}" height="${r*2+6}">
      <circle cx="${r+3}" cy="${r+3}" r="${r}" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="1.5"/>
      <circle cx="${r+3}" cy="${r+3}" r="${r*0.55}" fill="${color}" stroke="white" stroke-width="1.5"/>
    </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [r*2+6, r*2+6], iconAnchor: [r+3, r+3], popupAnchor: [0, -(r+4)] });
};

const makeSiteIcon = () => L.divIcon({
  html: `<div style="width:20px;height:20px;background:#059669;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 4px rgba(0,0,0,0.2)">✓</div>`,
  className: '', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -12],
});

export default function MapView({ habitations = [], sites = [], polygons = [], height = '100%', onHabitationClick, showSites = true, showPolygons = true }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const layersRef   = useRef({ habitation: null, sites: null, polygons: null });
  const navigate    = useNavigate();

  useEffect(() => {
    if (mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: [17.5, 74.0],
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | Aegis Demo — Maharashtra Synthetic Data',
      maxZoom: 18,
    }).addTo(map);

    // Legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const d = L.DomUtil.create('div', '');
      d.style.cssText = 'background:white;padding:10px 14px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:12px;font-family:Inter,sans-serif;border:1px solid #e2e8f0;min-width:160px';
      d.innerHTML = `
        <p style="font-weight:700;margin-bottom:6px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#334155">Relocation Priority</p>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px"><span style="width:11px;height:11px;border-radius:50%;background:#dc2626;display:inline-block"></span><span style="color:#7f1d1d">Immediate</span></div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px"><span style="width:11px;height:11px;border-radius:50%;background:#ea580c;display:inline-block"></span><span style="color:#7c2d12">Short-Term</span></div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px"><span style="width:11px;height:11px;border-radius:50%;background:#d97706;display:inline-block"></span><span style="color:#78350f">Medium-Term</span></div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="width:11px;height:11px;border-radius:50%;background:#16a34a;display:inline-block"></span><span style="color:#14532d">Monitor</span></div>
        <div style="display:flex;align-items:center;gap:8px"><span style="width:11px;height:11px;border-radius:50%;background:#059669;display:inline-block"></span><span style="color:#065f46">Safe Site</span></div>
        <p style="margin-top:8px;font-size:10px;color:#94a3b8;font-style:italic">⚠ Synthetic demo data</p>
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
      const color = PRIORITY_COLOR[h.relocationTimeline] || '#16a34a';
      const icon  = makeHabitationIcon(color, h.hazardScore || h.risk_score || 0);
      const marker = L.marker([h.lat, h.lng], { icon });

      const timeline = h.relocationTimeline || h.risk_category || 'Monitor';
      const popHtml = `
        <div style="padding:14px;min-width:220px;font-family:Inter,sans-serif">
          <div style="margin-bottom:8px">
            <p style="font-weight:700;font-size:14px;color:#0f172a;margin:0">${h.displayName || h.name}</p>
            <p style="font-size:12px;color:#64748b;margin:0">${h.district}, Maharashtra</p>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
            <div style="background:#f8fafc;padding:6px;border-radius:6px">
              <p style="color:#64748b;font-size:11px;margin:0">Hazard Score</p>
              <p style="font-weight:700;color:${color};font-size:16px;margin:0">${h.hazardScore ?? h.risk_score ?? '?'}/100</p>
            </div>
            <div style="background:#f8fafc;padding:6px;border-radius:6px">
              <p style="color:#64748b;font-size:11px;margin:0">Population</p>
              <p style="font-weight:700;color:#0f172a;font-size:16px;margin:0">${h.population?.toLocaleString()}</p>
            </div>
          </div>
          <div style="padding:6px 10px;border-radius:20px;display:inline-block;font-size:12px;font-weight:700;margin-bottom:10px;background:${color}18;color:${color};border:1px solid ${color}40">
            ${timeline === 'Immediate' ? '🔴' : timeline === 'Short-Term' ? '🟠' : timeline === 'Medium-Term' ? '🟡' : '🟢'} ${timeline}
          </div>
          <br/>
          <button id="popup-btn-${h._id}" style="width:100%;padding:8px;background:#2563eb;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;margin-top:2px">
            View Intelligence →
          </button>
        </div>`;

      const popup = L.popup({ maxWidth: 260 }).setContent(popHtml);
      marker.bindPopup(popup);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${h._id}`);
        if (btn) btn.onclick = () => onHabitationClick ? onHabitationClick(h._id) : navigate(`/habitation/${h._id}`);
      });
      layersRef.current.habitation.addLayer(marker);
    });

    // Fit bounds
    if (habitations.length > 0) {
      const latlngs = habitations.map(h => [h.lat, h.lng]);
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
      const icon   = makeSiteIcon();
      const marker = L.marker([s.lat, s.lng], { icon });
      const popHtml = `
        <div style="padding:12px;min-width:200px;font-family:Inter,sans-serif">
          <p style="font-weight:700;font-size:13px;color:#0f172a;margin:0 0 4px 0">${s.displayName || s.name}</p>
          <p style="font-size:11px;color:#64748b;margin:0 0 8px 0">${s.district}, Maharashtra · Safe Site</p>
          <div style="font-size:12px;color:#0f172a">
            <p style="margin:0">Suitability: <strong>${s.suitabilityScore}/100</strong></p>
            <p style="margin:0">Available: <strong>${s.available?.toLocaleString()}</strong> persons</p>
          </div>
        </div>`;
      marker.bindPopup(L.popup({ maxWidth: 240 }).setContent(popHtml));
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
      const color = ZONE_COLOR[z.type] || '#dc2626';
      const poly  = L.polygon(z.polygon, {
        color, weight: 2, opacity: 0.7,
        fillColor: color, fillOpacity: 0.12,
        dashArray: '6 4',
      });
      poly.bindTooltip(`${z.name} — ${z.dominantHazards.join(' + ')} (${z.dataNote})`, { sticky: true });
      layersRef.current.polygons.addLayer(poly);
    });
  }, [polygons, showPolygons]);

  return (
    <div ref={mapRef} style={{ height, width: '100%', borderRadius: '8px', zIndex: 0 }} />
  );
}
