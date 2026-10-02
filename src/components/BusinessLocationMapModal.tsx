import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  X,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Crosshair,
  MessageCircle,
  Share2,
  Compass,
} from 'lucide-react';
import L from 'leaflet';
import { LocationCoordinates } from '../types';
import { useApp } from '../context/AppContext';
import { createOleVeciPinIcon } from '../utils/mapIcons';
import { OleVeciIcon } from './OleVeciLogo';
import { WhatsAppIcon } from './WhatsAppIcon';
import { formatColombianPhone } from '../utils/phoneUtils';

export interface BusinessLocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: {
    name: string;
    address: string;
    city: string;
    sector: string;
    coordinates?: LocationCoordinates;
    logo?: string;
    category?: string;
    subCategory?: string;
    whatsapp?: string;
    phone?: string;
    verified?: boolean;
  };
}

// Municipal centers fallback
const MUNICIPAL_CENTERS: Record<string, LocationCoordinates> = {
  'cajicá': { lat: 4.9184, lng: -74.0259 },
  'chía': { lat: 4.8614, lng: -74.0558 },
  'zipaquirá': { lat: 5.0261, lng: -74.0044 },
  'tabio': { lat: 4.9194, lng: -74.0984 },
  'sopó': { lat: 4.9073, lng: -73.9405 },
  'cota': { lat: 4.8105, lng: -74.1030 },
  'tenjo': { lat: 4.8722, lng: -74.1436 },
  'sesquilé': { lat: 5.0503, lng: -73.7972 },
  'gachancipá': { lat: 4.9908, lng: -73.8731 },
  'tocancipá': { lat: 4.9664, lng: -73.9142 },
  'cogua': { lat: 5.0642, lng: -73.9786 },
  'bogotá': { lat: 4.7110, lng: -74.0721 },
};

export const BusinessLocationMapModal: React.FC<BusinessLocationMapModalProps> = ({
  isOpen,
  onClose,
  business,
}) => {
  const { municipalities } = useApp();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  const [copied, setCopied] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState<string | null>(null);

  // Determine target coordinates
  const cityKey = (business.city || '').toLowerCase().trim();
  const muniCoord = municipalities.find(
    (m) => m.name.toLowerCase() === cityKey
  )?.coordinates;

  const targetCoords: LocationCoordinates =
    business.coordinates?.lat && business.coordinates?.lng
      ? business.coordinates
      : muniCoord || MUNICIPAL_CENTERS[cityKey] || { lat: 4.9184, lng: -74.0259 };

  // Calculate distance in meters/km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    if (d < 1) {
      return `${Math.round(d * 1000)} m`;
    }
    return `${d.toFixed(1)} km`;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [targetCoords.lat, targetCoords.lng],
        zoom: 17,
        zoomControl: false,
      });

      // Clean OpenStreetMap tiles without API key watermark
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add OleVeci Icon Pin Marker (sin la etiqueta de texto arriba porque al dar clic sobre el ícono sale el nombre)
      const oleVeciPin = createOleVeciPinIcon({
        isDraggable: false,
        size: 58,
        pulse: true,
      });

      const marker = L.marker([targetCoords.lat, targetCoords.lng], {
        icon: oleVeciPin,
      }).addTo(map);

      // Custom Leaflet Popup
      const popupContent = `
        <div style="font-family: inherit; padding: 4px; min-width: 170px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            ${
              business.logo
                ? `<img src="${business.logo}" style="width: 28px; height: 28px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0;" />`
                : `<div style="width: 28px; height: 28px; border-radius: 8px; background: #007af7; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800;">${business.name.slice(0, 2).toUpperCase()}</div>`
            }
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 800; font-size: 13px; color: #021b58; line-height: 1.2; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                ${business.name}
              </div>
              <div style="font-size: 11px; color: #007af7; font-weight: 600;">
                ${business.subCategory || business.category || 'Comercio Local'}
              </div>
            </div>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.3;">
            📍 ${business.address || 'Ubicación registrada'}<br/>
            <strong>${business.sector}, ${business.city}</strong>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent, { offset: [0, 4] });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }, 60);

    return () => {
      clearTimeout(timer);
      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch (_) {}
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        try {
          // @ts-ignore
          delete mapContainerRef.current._leaflet_id;
        } catch (_) {}
      }
    };
  }, [isOpen, targetCoords.lat, targetCoords.lng]);

  // Center on business
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([targetCoords.lat, targetCoords.lng], 17, {
        duration: 0.8,
      });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  // Get user GPS and display on map
  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) return;
    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(uCoords);
        setGpsLoading(false);

        const dist = calculateDistance(
          uCoords.lat,
          uCoords.lng,
          targetCoords.lat,
          targetCoords.lng
        );
        setDistanceKm(dist);

        if (mapInstanceRef.current) {
          // Remove previous user marker if any
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Blue dot for user
          const uMarker = L.circleMarker([uCoords.lat, uCoords.lng], {
            radius: 8,
            fillColor: '#007af7',
            color: '#ffffff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
          }).addTo(mapInstanceRef.current);
          uMarker.bindPopup('<div style="font-size: 11px; font-weight: 700;">Tu ubicación actual</div>');
          userMarkerRef.current = uMarker;

          // Fit bounds to show both user and business
          const bounds = L.latLngBounds(
            [uCoords.lat, uCoords.lng],
            [targetCoords.lat, targetCoords.lng]
          );
          mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        }
      },
      (err) => {
        console.warn('GPS location error:', err);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Copy address to clipboard
  const handleCopyAddress = () => {
    const fullText = `${business.address}, ${business.sector}, ${business.city}, Colombia`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Direct turn-by-turn navigation URLs
  const destinationQuery =
    business.coordinates?.lat && business.coordinates?.lng
      ? `${business.coordinates.lat},${business.coordinates.lng}`
      : encodeURIComponent(`${business.address}, ${business.sector}, ${business.city}`);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;
  const wazeDirectionsUrl =
    business.coordinates?.lat && business.coordinates?.lng
      ? `https://waze.com/ul?ll=${business.coordinates.lat},${business.coordinates.lng}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(`${business.address}, ${business.city}`)}&navigate=yes`;

  // WhatsApp location inquiry
  const handleWhatsApp = () => {
    if (!business.whatsapp) return;
    const cleanNumber = business.whatsapp.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('57') ? cleanNumber : `57${cleanNumber}`;
    const text = encodeURIComponent(
      `¡Hola ${business.name}! Los encontré en OleVeci y quiero visitarlos. ¿Me podrían confirmar cómo llegar a su sede en ${business.address}? Muchas gracias.`
    );
    window.open(`https://wa.me/${fullNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div
      id="business-location-map-modal"
      className="fixed inset-0 z-[3100] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with OleVeci Branding */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0">
              <OleVeciIcon size={26} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate">
                  {business.name}
                </h3>
                {business.verified && (
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1">
                <span>{business.sector}, {business.city}</span>
                {distanceKm && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md text-[10px]">
                      A {distanceKm} de ti
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container Area */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '320px' }} />

          {/* Floating Map Controls */}
          <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
            <button
              type="button"
              onClick={handleRecenter}
              className="bg-white/95 hover:bg-white text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border border-slate-200/90 flex items-center gap-1.5 transition cursor-pointer backdrop-blur-xs active:scale-95"
              title="Centrar en el local"
            >
              <Compass className="w-3.5 h-3.5 text-[#007af7]" />
              <span>Centrar negocio</span>
            </button>

            <button
              type="button"
              onClick={handleLocateMe}
              disabled={gpsLoading}
              className="bg-white/95 hover:bg-white text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border border-slate-200/90 flex items-center gap-1.5 transition cursor-pointer backdrop-blur-xs active:scale-95"
              title="Calcular distancia desde mi ubicación GPS"
            >
              <Crosshair className={`w-3.5 h-3.5 text-emerald-600 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Detectando GPS...' : 'Mi ubicación GPS'}</span>
            </button>
          </div>

          {/* Floating OleVeci Pin Tag Indicator */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-2 text-xs font-semibold text-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] text-slate-600">
              Punto oficial en mapa <strong className="text-[#041f5e]">OleVeci</strong>
            </span>
          </div>
        </div>

        {/* Address & Navigation Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3 shrink-0">
          {/* Physical Address Line */}
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#007af7] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                  Dirección exacta
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {business.address || 'Sin dirección registrada'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition cursor-pointer shrink-0"
              title="Copiar dirección al portapapeles"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">¡Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Google Maps Route Button */}
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-emerald-700/20 transition cursor-pointer active:scale-98"
              title="Abrir indicaciones paso a paso en Google Maps"
            >
              <Navigation className="w-4 h-4 text-white shrink-0" />
              <span>Cómo llegar con Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Waze Route Button */}
            <a
              href={wazeDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-slate-900 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 shadow-2xs transition cursor-pointer active:scale-98"
              title="Abrir navegación en Waze"
            >
              <svg className="w-4 h-4 fill-[#05c8f7] shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.18 1.88 5.81L2.5 21.5l4.08-1.28C8.08 21.2 9.97 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-2.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-5.5 6c.55 1.48 1.94 2.5 3 2.5s2.45-1.02 3-2.5h-6z" />
              </svg>
              <span>Cómo llegar con Waze</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* Secondary contact option if available */}
          {business.whatsapp && (
            <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">¿Tienes dudas sobre cómo llegar?</span>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600" />
                <span>Preguntar al comercio por WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
