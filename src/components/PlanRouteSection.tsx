import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Navigation,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Crosshair,
  Compass,
  Clock,
  Calendar,
  Car,
  Route,
  Share2,
  Phone,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  RotateCcw,
  CheckCircle2,
  Flag,
  Store,
} from 'lucide-react';
import L from 'leaflet';
import { Post, LocationCoordinates } from '../types';
import { useApp } from '../context/AppContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { BusinessLocationMapModal } from './BusinessLocationMapModal';

interface PlanRouteSectionProps {
  posts: Post[];
  planTitle: string;
  currentCity?: string;
  scheduledTime?: string;
  onSelectPost?: (post: Post) => void;
  onOpenLocationMap?: (post: Post) => void;
}

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

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
  return R * c;
};

const formatDistance = (distKm: number): string => {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`;
  }
  return `${distKm.toFixed(1)} km`;
};

const estimateDriveTimeMin = (distKm: number): number => {
  // ~25 km/h urban average speed in Sabana Centro + 2 min buffer
  return Math.max(2, Math.round((distKm / 25) * 60));
};

export const PlanRouteSection: React.FC<PlanRouteSectionProps> = ({
  posts,
  planTitle,
  currentCity = 'Cajicá',
  scheduledTime,
  onSelectPost,
  onOpenLocationMap,
}) => {
  const {
    municipalities,
    userLocation: globalUserLocation,
    setUserLocation: setGlobalUserLocation,
  } = useApp();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineHaloRef = useRef<L.Polyline | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<LocationCoordinates | null>(() => globalUserLocation || null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(() => !!globalUserLocation);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);
  const [locationModalBusiness, setLocationModalBusiness] = useState<{
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
  } | null>(null);

  // Synchronize with global user location if available from context
  useEffect(() => {
    if (globalUserLocation && !userCoords) {
      setUserCoords(globalUserLocation);
      setIsGpsActive(true);
    }
  }, [globalUserLocation]);

  // Default starting point based on municipality center
  const defaultCenter = useMemo(() => {
    const cityKey = currentCity.toLowerCase().trim();
    const muni = municipalities.find((m) => m.name.toLowerCase() === cityKey);
    return muni?.coordinates || MUNICIPAL_CENTERS[cityKey] || { lat: 4.9184, lng: -74.0259 };
  }, [currentCity, municipalities]);

  // The active origin point (GPS if available, else municipal center)
  const originCoords: LocationCoordinates = userCoords || defaultCenter;

  // Resolve coordinates for each stop
  const stopsWithCoords = useMemo(() => {
    return posts.map((post, idx) => {
      let coords: LocationCoordinates;
      if (post.coordinates && post.coordinates.lat && post.coordinates.lng) {
        coords = post.coordinates;
      } else {
        const cityKey = (post.businessCity || currentCity).toLowerCase().trim();
        coords = MUNICIPAL_CENTERS[cityKey] || defaultCenter;
      }
      return {
        post,
        index: idx + 1,
        coords,
      };
    });
  }, [posts, currentCity, defaultCenter]);

  // Distances and drive times calculation along itinerary stops (including GPS origin if active)
  const routeSegments = useMemo(() => {
    let totalDistKm = 0;
    let totalTimeMin = 0;
    let distToFirstKm = 0;
    let timeToFirstMin = 0;

    // If GPS is active and we have stops, calculate distance from user to first stop
    if (isGpsActive && userCoords && stopsWithCoords.length > 0) {
      distToFirstKm = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        stopsWithCoords[0].coords.lat,
        stopsWithCoords[0].coords.lng
      );
      timeToFirstMin = estimateDriveTimeMin(distToFirstKm);
      totalDistKm += distToFirstKm;
      totalTimeMin += timeToFirstMin;
    }

    const segments = stopsWithCoords.map((stop, idx) => {
      if (idx === 0) {
        return {
          fromName: isGpsActive && userCoords ? 'Tu ubicación actual' : 'Inicio del itinerario',
          toStop: stop,
          distKm: distToFirstKm,
          distFormatted: isGpsActive && userCoords ? formatDistance(distToFirstKm) : 'Inicio',
          timeMin: timeToFirstMin,
        };
      }
      const prevStop = stopsWithCoords[idx - 1];
      const distKm = calculateDistanceKm(
        prevStop.coords.lat,
        prevStop.coords.lng,
        stop.coords.lat,
        stop.coords.lng
      );
      const timeMin = estimateDriveTimeMin(distKm);
      totalDistKm += distKm;
      totalTimeMin += timeMin;

      return {
        fromName: prevStop.post.businessName || `Parada ${idx}`,
        toStop: stop,
        distKm,
        distFormatted: formatDistance(distKm),
        timeMin,
      };
    });

    return {
      segments,
      distToFirstKm,
      distToFirstFormatted: distToFirstKm > 0 ? formatDistance(distToFirstKm) : null,
      timeToFirstMin,
      totalDistKm,
      totalDistFormatted: formatDistance(totalDistKm),
      totalTimeMin: Math.max(1, totalTimeMin),
    };
  }, [stopsWithCoords, isGpsActive, userCoords]);

  // Request GPS with robust two-phase fallback (High Accuracy -> Standard/Cellular/Wi-Fi fallback)
  const handleRequestGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('La geolocalización no es compatible con este dispositivo o navegador.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    // Phase 1: Try high accuracy (GPS hardware)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMountedRef.current) return;
        const coords: LocationCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);
        setIsGpsActive(true);
        setGpsLoading(false);
        setGpsError(null);
        setGlobalUserLocation(coords);
      },
      (err) => {
        // If permission was explicitly denied, show informative notice
        if (err.code === 1) {
          if (!isMountedRef.current) return;
          setGpsLoading(false);
          setGpsError(
            'Permiso de ubicación bloqueado. Para activarlo, haz clic en el ícono del candado 🔒 en la barra de tu navegador y permite el acceso a la ubicación.'
          );
          return;
        }

        // Phase 2: High accuracy timed out or failed; fallback to standard accuracy (Wi-Fi / IP)
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!isMountedRef.current) return;
            const coords: LocationCoordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserCoords(coords);
            setIsGpsActive(true);
            setGpsLoading(false);
            setGpsError(null);
            setGlobalUserLocation(coords);
          },
          (secondErr) => {
            if (!isMountedRef.current) return;
            console.warn('Geolocation fallback warning:', secondErr);
            setGpsLoading(false);
            if (secondErr.code === 1) {
              setGpsError(
                'Permiso de ubicación no concedido en el navegador. Por favor permite la ubicación en los ajustes del sitio.'
              );
            } else {
              setGpsError(
                'No se pudo obtener señal GPS en este momento. Se utilizará la ubicación de ' + currentCity + ' para la ruta.'
              );
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 }
    );
  };

  // Attempt auto-geolocation on mount if not yet active
  useEffect(() => {
    if (!userCoords && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMountedRef.current) return;
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserCoords(coords);
          setIsGpsActive(true);
          setGlobalUserLocation(coords);
        },
        () => {
          // Silent fallback to municipality center
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  // Fit bounds helper to focus on itinerary stops (including user GPS if active)
  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return;
    const planPoints: [number, number][] = [
      ...(isGpsActive && userCoords ? [[userCoords.lat, userCoords.lng] as [number, number]] : []),
      ...stopsWithCoords.map((s) => [s.coords.lat, s.coords.lng] as [number, number]),
    ];
    if (planPoints.length > 1) {
      const bounds = L.latLngBounds(planPoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 16, animate: true });
    } else if (planPoints.length === 1) {
      mapInstanceRef.current.setView(planPoints[0], 15, { animate: true });
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isEffectActive = true;

    // Helper to safely clean up any existing map instance and references
    const destroyMap = () => {
      // Clear markers
      markersRef.current.forEach((m) => {
        try {
          m.remove();
        } catch (_) {}
      });
      markersRef.current = [];

      // Clear polylines
      if (polylineHaloRef.current) {
        try {
          polylineHaloRef.current.remove();
        } catch (_) {}
        polylineHaloRef.current = null;
      }
      if (polylineRef.current) {
        try {
          polylineRef.current.remove();
        } catch (_) {}
        polylineRef.current = null;
      }

      // Remove map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }

      // Reset DOM container leaflet identification
      if (mapContainerRef.current) {
        try {
          // @ts-ignore
          delete mapContainerRef.current._leaflet_id;
        } catch (_) {}
      }
    };

    const timer = setTimeout(() => {
      if (!isEffectActive || !isMountedRef.current || !mapContainerRef.current) return;

      destroyMap();

      if (!mapContainerRef.current) return;

      try {
        const initialCenter: [number, number] = isGpsActive && userCoords
          ? [userCoords.lat, userCoords.lng]
          : stopsWithCoords[0]?.coords
            ? [stopsWithCoords[0].coords.lat, stopsWithCoords[0].coords.lng]
            : [originCoords.lat, originCoords.lng];

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 15,
          zoomControl: false,
          attributionControl: false, // Clean look without bulky attribution bar
          scrollWheelZoom: true,
          dragging: true,
          touchZoom: true,
        });

        if (!isEffectActive || !isMountedRef.current) {
          map.remove();
          return;
        }

        // OpenStreetMap tiles: Free, reliable, fast, no "KEY REQUIRED" watermark
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const newMarkers: L.Marker[] = [];

        // If GPS is active and userCoords are known, draw animated User Location marker
        if (isGpsActive && userCoords) {
          const userHtml = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; cursor: pointer;">
              <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(0, 122, 247, 0.3); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: #007af7; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0, 86, 214, 0.5); display: flex; align-items: center; justify-content: center;">
                <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
              </div>
            </div>
          `;
          const userDivIcon = L.divIcon({
            className: 'oleveci-user-pin',
            html: userHtml,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });
          const userMarker = L.marker([userCoords.lat, userCoords.lng], {
            icon: userDivIcon,
            zIndexOffset: 1000,
          }).addTo(map);

          userMarker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px 6px;">
              <strong style="color: #0056d6; font-size: 12px; display: block; margin-bottom: 2px;">📍 Tu ubicación actual</strong>
              <span style="font-size: 11px; color: #64748b;">Punto de inicio de tu ruta</span>
            </div>
          `, { offset: [0, -10] });
          newMarkers.push(userMarker);
        }

        const planPoints: [number, number][] = [
          ...(isGpsActive && userCoords ? [[userCoords.lat, userCoords.lng] as [number, number]] : []),
          ...stopsWithCoords.map((s) => [s.coords.lat, s.coords.lng] as [number, number]),
        ];

        // Draw Stop Markers with OleVeci Brand Styling
        stopsWithCoords.forEach((stop) => {
          // OleVeci Pin badge with stop number
          const stopHtml = `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 6px 12px rgba(4, 31, 94, 0.35)); transition: transform 0.2s;">
              <div style="width: 32px; height: 32px; border-radius: 12px; background: linear-gradient(135deg, #007af7 0%, #041f5e 100%); border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0, 86, 214, 0.3);">
                <span style="color: #ffffff; font-weight: 900; font-size: 13px; font-family: system-ui, sans-serif;">${stop.index}</span>
              </div>
              <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #041f5e; margin-top: -1px;"></div>
            </div>
          `;

          const stopDivIcon = L.divIcon({
            className: 'oleveci-stop-pin',
            html: stopHtml,
            iconSize: [34, 38],
            iconAnchor: [17, 38],
          });

          const stopMarker = L.marker([stop.coords.lat, stop.coords.lng], {
            icon: stopDivIcon,
          }).addTo(map);

          const popupContent = `
            <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; min-width: 180px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="background: #0056d6; color: white; width: 18px; height: 18px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900;">${stop.index}</span>
                <span style="font-size: 12px; font-weight: 800; color: #021b58; line-height: 1.2;">${stop.post.businessName}</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
                ${stop.post.businessAddress || stop.post.businessCity || currentCity}
              </div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=${stop.coords.lat},${stop.coords.lng}"
                target="_blank"
                rel="noopener noreferrer"
                style="display: inline-flex; align-items: center; justify-content: center; width: 100%; gap: 6px; background: #0056d6; color: #ffffff; font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 10px; text-decoration: none; box-shadow: 0 2px 6px rgba(0, 86, 214, 0.25);"
              >
                <span>🚗 Ir a parada ${stop.index} en Maps</span>
              </a>
            </div>
          `;
          stopMarker.bindPopup(popupContent, { offset: [0, -32] });
          newMarkers.push(stopMarker);
        });

        markersRef.current = newMarkers;

        // Draw Beautiful Polyline connecting the itinerary stops (and origin)
        if (planPoints.length > 1) {
          // Halo layer for crisp border
          polylineHaloRef.current = L.polyline(planPoints, {
            color: '#ffffff',
            weight: 7,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          // Vibrant primary path
          polylineRef.current = L.polyline(planPoints, {
            color: '#0056d6',
            weight: 4,
            opacity: 0.95,
            dashArray: '8, 8',
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          const bounds = L.latLngBounds(planPoints);
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 16, animate: false });
        } else if (planPoints.length === 1) {
          map.setView(planPoints[0], 15);
        }

        mapInstanceRef.current = map;

        // Ensure Leaflet calculates sizing correctly inside modals
        setTimeout(() => {
          try {
            map.invalidateSize();
          } catch (_) {}
        }, 150);
        setTimeout(() => {
          try {
            map.invalidateSize();
          } catch (_) {}
        }, 400);
      } catch (err) {
        console.warn('Leaflet map creation safely caught:', err);
      }
    }, 150);

    return () => {
      isEffectActive = false;
      clearTimeout(timer);
      destroyMap();
    };
  }, [stopsWithCoords, currentCity, userCoords, isGpsActive]);

  // Master Google Maps Route URL (All stops from user's origin)
  const masterGoogleMapsUrl = useMemo(() => {
    if (stopsWithCoords.length === 0) return '#';

    // If precise GPS coordinates are available, pass them as origin.
    // If not, omit the origin parameter so Google Maps naturally uses the user's real-time device GPS location without error.
    const originParam = isGpsActive && userCoords
      ? `&origin=${userCoords.lat},${userCoords.lng}`
      : '';

    if (stopsWithCoords.length === 1) {
      const stop = stopsWithCoords[0];
      return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${stop.coords.lat},${stop.coords.lng}`;
    }

    const lastStop = stopsWithCoords[stopsWithCoords.length - 1];
    const waypoints = stopsWithCoords
      .slice(0, stopsWithCoords.length - 1)
      .map((s) => `${s.coords.lat},${s.coords.lng}`)
      .join('|');

    return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${lastStop.coords.lat},${lastStop.coords.lng}&waypoints=${encodeURIComponent(waypoints)}`;
  }, [stopsWithCoords, isGpsActive, userCoords]);

  // First stop Waze URL
  const firstStopWazeUrl = useMemo(() => {
    if (stopsWithCoords.length === 0) return '#';
    const first = stopsWithCoords[0];
    return `https://waze.com/ul?ll=${first.coords.lat},${first.coords.lng}&navigate=yes`;
  }, [stopsWithCoords]);

  return (
    <div className="w-full space-y-3.5 text-slate-800">
      {gpsError && (
        <div className="text-[11px] text-amber-800 flex items-center gap-2 bg-amber-50 border border-amber-200/90 p-2.5 rounded-2xl shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* 2. Mapa Interactivo Rediseñado con Estilo Editorial Limpio */}
      <div className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Badge flotante de ruta */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200/90 text-[11px] text-[#041f5e] font-extrabold flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#007af7] animate-pulse" />
          <span>Ruta punto a punto</span>
        </div>

        {/* Controles flotantes modernos de mapa */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleFitBounds}
            title="Enfocar toda la ruta"
            aria-label="Enfocar ruta"
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-[#0056d6] backdrop-blur-md shadow-md border border-slate-200/90 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#0056d6]" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Acercar mapa"
            aria-label="Acercar mapa"
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-[#0056d6] backdrop-blur-md shadow-md border border-slate-200/90 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Alejar mapa"
            aria-label="Alejar mapa"
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-[#0056d6] backdrop-blur-md shadow-md border border-slate-200/90 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Barra de Acciones de Navegación Cohesiva */}
      <div className="space-y-2">
        {/* Botón Principal: Abrir Ruta Completa en Google Maps */}
        <a
          href={masterGoogleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="btn-route-master-maps"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0056d6] to-[#041f5e] hover:from-[#0047b3] hover:to-[#02184d] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] cursor-pointer group"
          title="Iniciar navegación con todas las paradas en Google Maps"
        >
          <Navigation className="w-4 h-4 text-white fill-white group-hover:rotate-12 transition-transform shrink-0" />
          <span>Abrir Ruta Completa en Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 text-blue-200 shrink-0" />
        </a>

        {/* Botones Secundarios: GPS y Waze con estilo coordinado */}
        <div className="grid grid-cols-2 gap-2">
          {/* Botón GPS */}
          <button
            type="button"
            id="btn-route-gps-toggle"
            onClick={handleRequestGps}
            disabled={gpsLoading}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-2xs border ${
              isGpsActive
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
            }`}
            title={isGpsActive ? 'GPS activo usando tu ubicación' : 'Calcular ruta desde mi ubicación GPS'}
          >
            {gpsLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0056d6] shrink-0" />
                <span className="truncate">Obteniendo GPS...</span>
              </>
            ) : isGpsActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">GPS Activo (Tu Ubicación)</span>
              </>
            ) : (
              <>
                <Crosshair className="w-3.5 h-3.5 text-[#0056d6] shrink-0" />
                <span className="truncate">Usar Mi GPS Actual</span>
              </>
            )}
          </button>

          {/* Botón Waze */}
          <a
            href={firstStopWazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-route-waze-first"
            className="py-2.5 px-3 rounded-2xl bg-[#EAF2FC] hover:bg-[#d6e7fc] border border-blue-200/80 text-[#0A62F4] text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Abrir primera parada en la app Waze"
          >
            <svg className="w-3.5 h-3.5 fill-[#0A62F4] shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.18 1.88 5.81L2.5 21.5l4.08-1.28C8.08 21.2 9.97 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-2.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-5.5 6c.55 1.48 1.94 2.5 3 2.5s2.45-1.02 3-2.5h-6z" />
            </svg>
            <span className="truncate">Navegar con Waze</span>
          </a>
        </div>
      </div>

      {/* 4. Timeline de Paradas del Plan */}
      <div className="pt-2">
        {/* Punto de Inicio en el Timeline */}
        <div className="relative pl-7 pb-3">
          {/* Línea vertical conectora */}
          <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-blue-200 border-dashed" />
          
          <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#007af7] shadow-xs flex items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full bg-[#007af7] ${isGpsActive && userCoords ? 'animate-ping' : ''}`} />
          </div>

          <div className="text-[11px] font-bold text-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Inicio:</span>
              <span className="text-[#0056d6] font-extrabold">
                {isGpsActive && userCoords ? '📍 Tu ubicación actual' : stopsWithCoords[0]?.post.businessName || `Centro de ${currentCity}`}
              </span>
              {isGpsActive && userCoords && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  GPS activo
                </span>
              )}
            </div>
            {isGpsActive && userCoords && routeSegments.distToFirstFormatted && (
              <span className="text-[10px] text-slate-500 font-medium">
                a ~{routeSegments.distToFirstFormatted} (~{routeSegments.timeToFirstMin} min) de la 1ª parada
              </span>
            )}
          </div>
        </div>

        {/* Lista secuencial de paradas con estilo Timeline */}
        <div className="space-y-3">
          {stopsWithCoords.map((stop, idx) => {
            const seg = routeSegments.segments[idx];
            const isLast = idx === stopsWithCoords.length - 1;
            const fullAddress = `${stop.post.businessAddress || 'Dirección registrada'}${
              stop.post.businessSector ? `, ${stop.post.businessSector}` : ''
            }, ${stop.post.businessCity || currentCity}`;

            return (
              <div key={stop.post.id || idx} className="relative pl-7">
                {/* Línea vertical conectora entre paradas */}
                {!isLast && (
                  <div className="absolute left-3 top-8 bottom-[-14px] w-0.5 bg-gradient-to-b from-blue-300 via-indigo-200 to-slate-200" />
                )}

                {/* Badge numérico del paso en el timeline */}
                <div className="absolute left-0 top-3 w-6 h-6 rounded-xl bg-gradient-to-br from-[#0056d6] to-[#041f5e] text-white flex items-center justify-center text-xs font-black shadow-sm ring-2 ring-white">
                  {stop.index}
                </div>

                {/* Tarjeta de la parada */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPost?.(stop.post);
                  }}
                  className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 p-3.5 space-y-2.5 cursor-pointer group active:scale-[0.99] select-none"
                  title={`Ver detalles de ${stop.post.businessName}`}
                >
                  {/* Encabezado: Comercio e Imagen */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {stop.post.businessLogo || stop.post.imageUrl ? (
                        <img
                          src={stop.post.businessLogo || stop.post.imageUrl}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:border-blue-300 transition-colors shadow-2xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0056d6] flex items-center justify-center font-black text-sm shrink-0 border border-blue-100">
                          <Store className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-[#007af7] uppercase tracking-wider">
                            {idx === 0 ? '1ª Parada' : isLast ? 'Destino Final' : `Parada ${stop.index}`}
                          </span>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0056d6] transition-colors truncate">
                          {stop.post.businessName}
                        </h5>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {stop.post.title || stop.post.businessSector || currentCity}
                        </p>
                      </div>
                    </div>

                    {/* Botones de acción rápida: WhatsApp y Cómo Llegar */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {stop.post.businessWhatsapp && (
                        <a
                          href={`https://wa.me/${stop.post.businessWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `¡Hola ${stop.post.businessName}! Vi su parada en un plan de OleVeci y me gustaría confirmar su atención.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition active:scale-95 border border-emerald-200/80 shadow-2xs"
                          title="Contactar por WhatsApp"
                          aria-label="WhatsApp"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenLocationMap) {
                            onOpenLocationMap(stop.post);
                          } else {
                            setLocationModalBusiness({
                              name: stop.post.businessName,
                              address: stop.post.businessAddress || '',
                              city: stop.post.businessCity || currentCity || 'Cajicá',
                              sector: stop.post.businessSector || '',
                              coordinates: stop.coords,
                              logo: stop.post.businessLogo || stop.post.imageUrl,
                              category: stop.post.category,
                              subCategory: stop.post.subCategory,
                              whatsapp: stop.post.businessWhatsapp,
                              phone: stop.post.businessPhone,
                              verified: stop.post.isVerified || stop.post.businessVerified,
                            });
                          }
                        }}
                        className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0056d6] flex items-center justify-center transition active:scale-95 border border-blue-200/80 shadow-2xs"
                        title="Ver mapa y cómo llegar"
                        aria-label="Ver mapa"
                      >
                        <Navigation className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Dirección y Distancia del Tramo */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#ff7700] shrink-0" />
                      <span className="truncate">{fullAddress}</span>
                    </div>

                    {seg && (
                      <span className="font-bold text-slate-700 shrink-0 text-[10px] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                        ~{seg.distFormatted} • ~{seg.timeMin}m
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {locationModalBusiness && (
        <BusinessLocationMapModal
          isOpen={true}
          onClose={() => setLocationModalBusiness(null)}
          business={locationModalBusiness}
        />
      )}
    </div>
  );
};
