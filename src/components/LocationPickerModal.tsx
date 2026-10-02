import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Check, Search, Crosshair, AlertCircle, Loader2 } from 'lucide-react';
import L from 'leaflet';
import { LocationCoordinates } from '../types';
import { useApp } from '../context/AppContext';
import { createOleVeciPinIcon } from '../utils/mapIcons';
import { OleVeciIcon } from './OleVeciLogo';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (address: string, coordinates: LocationCoordinates) => void;
  initialAddress?: string;
  initialCoordinates?: LocationCoordinates;
  cityName?: string;
  sectorName?: string;
  businessName?: string;
}

// Pre-configured municipal center fallbacks in Cundinamarca/Sabana
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

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialAddress = '',
  initialCoordinates,
  cityName = 'Cajicá',
  sectorName = 'Centro',
  businessName,
}) => {
  const { municipalities } = useApp();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Dynamic municipal coords fallback
  const muniCoord = municipalities.find(
    (m) => m.name.toLowerCase() === (cityName || '').toLowerCase()
  )?.coordinates;

  const defaultCoord: LocationCoordinates =
    initialCoordinates?.lat && initialCoordinates?.lng
      ? initialCoordinates
      : muniCoord || (cityName ? MUNICIPAL_CENTERS[cityName.toLowerCase()] : null) || { lat: 4.9184, lng: -74.0259 };

  const [currentCoords, setCurrentCoords] = useState<LocationCoordinates>(defaultCoord);
  const [addressInput, setAddressInput] = useState<string>(initialAddress || '');
  const [isLoadingReverse, setIsLoadingReverse] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Fast reverse geocoding with debounce or direct call
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoadingReverse(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'OleVeciApp/1.0',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const road = data.address.road || data.address.pedestrian || data.address.footway || data.address.street || '';
          const houseNumber = data.address.house_number ? ` # ${data.address.house_number}` : '';
          const suburb = data.address.suburb || data.address.neighbourhood || sectorName;

          let cleanAddr = '';
          if (road) {
            cleanAddr = `${road}${houseNumber}`;
            if (suburb && !cleanAddr.toLowerCase().includes(suburb.toLowerCase())) {
              cleanAddr += `, ${suburb}`;
            }
          } else if (data.display_name) {
            cleanAddr = data.display_name.split(',').slice(0, 3).join(',').trim();
          }

          if (cleanAddr) {
            setAddressInput(cleanAddr);
            setFeedbackMsg('Dirección detectada del punto seleccionado');
            setTimeout(() => setFeedbackMsg(null), 3000);
          }
        }
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err);
    } finally {
      setIsLoadingReverse(false);
    }
  };

  // Initialize and tear down Leaflet Map cleanly
  useEffect(() => {
    if (!isOpen) return;

    setCurrentCoords(defaultCoord);
    setAddressInput(initialAddress || '');
    setSearchQuery('');
    setFeedbackMsg(null);

    // Timeout to ensure DOM element is mounted and sized
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [defaultCoord.lat, defaultCoord.lng],
        zoom: 16,
        zoomControl: true,
      });

      // Clean OpenStreetMap tiles without API key watermark
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Create Draggable Pin with OleVeci Branding
      const pinIcon = createOleVeciPinIcon({
        label: businessName || 'Tu Negocio OleVeci',
        isDraggable: true,
        size: 58,
        pulse: true,
      });
      const marker = L.marker([defaultCoord.lat, defaultCoord.lng], {
        icon: pinIcon,
        draggable: true,
        autoPan: true,
      }).addTo(map);

      // Marker drag event
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        const updated = { lat: Number(position.lat.toFixed(6)), lng: Number(position.lng.toFixed(6)) };
        setCurrentCoords(updated);
        reverseGeocode(updated.lat, updated.lng);
      });

      // Map click event: moves marker instantly to clicked point
      map.on('click', (e: L.LeafletMouseEvent) => {
        const clickedPos = e.latlng;
        marker.setLatLng(clickedPos);
        const updated = { lat: Number(clickedPos.lat.toFixed(6)), lng: Number(clickedPos.lng.toFixed(6)) };
        setCurrentCoords(updated);
        reverseGeocode(updated.lat, updated.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size in case modal layout transition occurs
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }, 50);

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
  }, [isOpen]);

  // Update map and marker position programmatically
  const updateMapPosition = (coords: LocationCoordinates, zoom = 17, shouldReverseGeocode = true) => {
    setCurrentCoords(coords);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], zoom, {
        duration: 0.8,
      });
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    }
    if (shouldReverseGeocode) {
      reverseGeocode(coords.lat, coords.lng);
    }
  };

  // Search by text
  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setFeedbackMsg(null);

    try {
      const fullQuery = `${searchQuery}, ${cityName}, Cundinamarca, Colombia`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`,
        {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'OleVeciApp/1.0',
          },
        }
      );

      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          const newCoords = {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
          updateMapPosition(newCoords, 17, true);
          setFeedbackMsg(`Ubicado en: ${item.display_name.split(',').slice(0, 2).join(',')}`);
          setTimeout(() => setFeedbackMsg(null), 3500);
        } else {
          setFeedbackMsg('No se encontró esa dirección exacta. Puedes hacer clic en el mapa.');
        }
      }
    } catch (err) {
      console.warn('Geocoding search error:', err);
      setFeedbackMsg('Error en la búsqueda. Haz clic directamente en el mapa.');
    } finally {
      setIsSearching(false);
    }
  };

  // GPS current location
  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setFeedbackMsg('Tu navegador no soporta geolocalización GPS');
      return;
    }

    setGpsLoading(true);
    setFeedbackMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setGpsLoading(false);
        updateMapPosition(coords, 18, true);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setGpsLoading(false);
        setFeedbackMsg('No se pudo acceder a tu ubicación GPS actual. Verifica los permisos.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Confirm and save
  const handleConfirm = () => {
    if (typeof onSelectLocation === 'function') {
      onSelectLocation(addressInput.trim() || initialAddress || '', currentCoords);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0">
              <OleVeciIcon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                Ubicar Negocio en el Mapa
              </h3>
              <p className="text-[11px] text-slate-500">
                Arrastra el pin de OleVeci o haz clic para fijar la ubicación exacta donde llegarán tus clientes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-4 flex-1 overflow-y-auto space-y-3">
          {/* Quick Search & GPS Bar */}
          <div className="space-y-1.5">
            <form onSubmit={handleSearchLocation} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Escribe calle, carrera o lugar en ${cityName}...`}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Buscar</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-xs px-0.5">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={gpsLoading}
                className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold text-[11px] cursor-pointer"
              >
                <Crosshair className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Detectando GPS...' : 'Usar mi GPS actual'}</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* REAL Interactive Leaflet Map Container */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner h-80 sm:h-96">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Reverse geocoding loading badge */}
            {isLoadingReverse && (
              <div className="absolute top-2.5 right-2.5 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-md text-[11px] font-semibold text-slate-700 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                <span>Actualizando ubicación...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Ubicación</span>
          </button>
        </div>
      </div>
    </div>
  );
};
