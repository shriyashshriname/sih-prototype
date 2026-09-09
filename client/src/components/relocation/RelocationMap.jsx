import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const makeSourceIcon = () =>
  L.divIcon({
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
        <span style="position:absolute;width:28px;height:28px;border-radius:50%;background:#ef4444;opacity:0.3;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
        <div style="width:20px;height:20px;background:#dc2626;border:2.5px solid white;border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:10px;">
          ●
        </div>
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

const makeSiteIcon = (isRecommended, isSelected) => {
  const bg = isRecommended ? '#059669' : '#2563eb';
  const ring = isSelected ? 'border:3px solid #f59e0b;transform:scale(1.2);' : 'border:2px solid white;';
  const size = isRecommended ? 26 : 22;

  return L.divIcon({
    html: `
      <div style="width:${size}px;height:${size}px;background:${bg};${ring}border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:${isRecommended ? 13 : 11}px;transition:transform 0.2s;">
        ${isRecommended ? '★' : '✓'}
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
};

export default function RelocationMap({
  sourceHabitation,
  candidates = [],
  selectedSite,
  onSelectSite,
  height = '480px',
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef({
    markers: null,
    circles: null,
    route: null,
  });

  // Init map once
  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;

    const centerLat = sourceHabitation?.lat || 18.5;
    const centerLng = sourceHabitation?.lng || 73.8;

    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 10,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | Aegis Relocation Planner',
      maxZoom: 18,
    }).addTo(map);

    layersRef.current.circles = L.layerGroup().addTo(map);
    layersRef.current.markers = L.layerGroup().addTo(map);
    layersRef.current.route = L.layerGroup().addTo(map);

    // Legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', '');
      div.style.cssText =
        'background:white;padding:10px 12px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.15);font-size:11px;font-family:Inter,sans-serif;border:1px solid #e2e8f0;line-height:1.4;';
      div.innerHTML = `
        <p style="font-weight:800;text-transform:uppercase;font-size:10px;color:#334155;margin-bottom:6px;">Planning Legend</p>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
          <span style="width:10px;height:10px;border-radius:50%;background:#dc2626;display:inline-block;"></span>
          <span>Source Habitation</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
          <span style="width:10px;height:10px;border-radius:50%;background:#059669;display:inline-block;"></span>
          <span>Recommended Site</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
          <span style="width:10px;height:10px;border-radius:50%;background:#2563eb;display:inline-block;"></span>
          <span>Candidate Safe Site</span>
        </div>
        <div style="border-top:1px solid #f1f5f9;padding-top:4px;margin-top:4px;color:#64748b;font-size:10px;">
          🟢 25 km Preferred Radius<br/>
          🔵 50 km Extended Radius
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    mapInstance.current = map;
  }, []);

  // Update markers, circles, and route when source/candidates/selection change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !sourceHabitation) return;

    // Clear previous layers
    layersRef.current.markers.clearLayers();
    layersRef.current.circles.clearLayers();
    layersRef.current.route.clearLayers();

    const sourceLatLng = [sourceHabitation.lat, sourceHabitation.lng];

    // 1. Draw 25 km Preferred Radius Circle
    const circle25 = L.circle(sourceLatLng, {
      radius: 25000,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: '4 4',
    });
    circle25.bindTooltip('25 km Preferred Relocation Radius', { sticky: true });
    layersRef.current.circles.addLayer(circle25);

    // 2. Draw 50 km Extended Radius Circle
    const circle50 = L.circle(sourceLatLng, {
      radius: 50000,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.02,
      weight: 1.2,
      dashArray: '6 6',
    });
    circle50.bindTooltip('50 km Maximum Planning Radius', { sticky: true });
    layersRef.current.circles.addLayer(circle50);

    // 3. Source Marker (RED)
    const sourceMarker = L.marker(sourceLatLng, { icon: makeSourceIcon() });
    sourceMarker.bindPopup(`
      <div style="padding:10px;min-width:180px;font-family:Inter,sans-serif;">
        <span style="background:#fee2e2;color:#991b1b;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;">SOURCE HABITATION</span>
        <h4 style="font-weight:800;font-size:13px;color:#0f172a;margin:4px 0 2px;">${sourceHabitation.name}</h4>
        <p style="font-size:11px;color:#64748b;margin:0 0 6px;">${sourceHabitation.district} District</p>
        <p style="font-size:11px;margin:0;">Population to relocate: <strong>${(sourceHabitation.population || 0).toLocaleString()}</strong></p>
      </div>
    `);
    layersRef.current.markers.addLayer(sourceMarker);

    const boundsPoints = [sourceLatLng];

    // 4. Candidate Sites Markers
    candidates.forEach((site) => {
      if (site.lat == null || site.lng == null) return;

      const isRecommended = site.isRecommended || site.status === 'RECOMMENDED';
      const isSelected = selectedSite?._id === site._id;
      const siteLatLng = [site.lat, site.lng];
      boundsPoints.push(siteLatLng);

      const icon = makeSiteIcon(isRecommended, isSelected);
      const marker = L.marker(siteLatLng, { icon });

      const popupContent = `
        <div style="padding:10px;min-width:200px;font-family:Inter,sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px;">
            <span style="font-size:10px;font-weight:700;color:${isRecommended ? '#059669' : '#2563eb'};background:${isRecommended ? '#ecfdf5' : '#eff6ff'};padding:2px 6px;border-radius:4px;">
              ${site.status || (isRecommended ? 'RECOMMENDED' : 'SUITABLE')}
            </span>
            <span style="font-size:11px;font-weight:700;color:#0f172a;">${site.suitabilityScore}/100</span>
          </div>
          <h4 style="font-weight:800;font-size:13px;color:#0f172a;margin:0 0 2px;">${site.displayName || site.name}</h4>
          <p style="font-size:11px;color:#64748b;margin:0 0 6px;">${site.district} District · <strong>${site.distanceKm} km</strong> from source</p>
          <div style="background:#f8fafc;padding:6px;border-radius:6px;font-size:11px;color:#334155;margin-bottom:8px;">
            <div>Available: <strong>${(site.availableCapacity || 0).toLocaleString()}</strong> persons</div>
            <div>Hazard Safety: <strong>${site.hazardSafety || 85}/100</strong></div>
            <div>Road Access: <strong>${site.roadAccessibility || 80}/100</strong></div>
          </div>
          <button id="map-select-btn-${site._id}" style="width:100%;padding:6px;background:#2563eb;color:white;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">
            Select This Site →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`map-select-btn-${site._id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectSite && onSelectSite(site);
          };
        }
      });

      marker.on('click', () => {
        onSelectSite && onSelectSite(site);
      });

      layersRef.current.markers.addLayer(marker);
    });

    // 5. Draw straight-line planning distance route to selected site
    if (selectedSite && selectedSite.lat != null && selectedSite.lng != null) {
      const targetLatLng = [selectedSite.lat, selectedSite.lng];
      const polyline = L.polyline([sourceLatLng, targetLatLng], {
        color: '#2563eb',
        weight: 2.5,
        opacity: 0.85,
        dashArray: '6 6',
      });
      polyline.bindTooltip(
        `Straight-line planning distance: ${selectedSite.distanceKm} km`,
        { sticky: true }
      );
      layersRef.current.route.addLayer(polyline);
    }

    // Fit bounds
    if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints).pad(0.18));
    } else {
      map.setView(sourceLatLng, 10);
    }
  }, [sourceHabitation, candidates, selectedSite]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <div ref={mapRef} style={{ height, width: '100%' }} />
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs text-[11px] text-slate-700 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
        <span>Straight-line planning distance active</span>
      </div>
    </div>
  );
}
