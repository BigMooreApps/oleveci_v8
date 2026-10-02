import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { Business, LocationCoordinates } from '../types';
import { createOleVeciPinIcon } from '../utils/mapIcons';
import { WhatsAppIcon } from './WhatsAppIcon';
import { normalizeToColombianWa } from '../utils/phoneUtils';
import {
  Search,
  MapPin,
  Store,
  Navigation,
  Phone,
  Crosshair,
  Plus,
  Minus,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Filter,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface VeciInMapsViewProps {
  onSelectBusiness: (businessId: string) => void;
  onSelectPost?: (post: any) => void;
}

// Fallback centers for municipalities
const MUNICIPAL_FALLBACKS: Record<string, LocationCoordinates> = {
  cajicá: { lat: 4.9184, lng: -74.0259 },
  chía: { lat: 4.8614, lng: -74.0558 },
  zipaquirá: { lat: 5.0261, lng: -74.0044 },
  tabio: { lat: 4.9194, lng: -74.0984 },
  sopó: { lat: 4.9073, lng: -73.9405 },
  cota: { lat: 4.8105, lng: -74.103 },
  tenjo: { lat: 4.8722, lng: -74.1436 },
  sesquilé: { lat: 5.0503, lng: -73.7972 },
  gachancipá: { lat: 4.9908, lng: -73.8731 },
  tocancipá: { lat: 4.9664, lng: -73.9142 },
  cogua: { lat: 5.0642, lng: -73.9786 },
  bogotá: { lat: 4.711, lng: -74.0721 },
};

export const VeciInMapsView: React.FC<VeciInMapsViewProps> = ({
  onSelectBusiness,
}) => {
  const {
    businesses,
    categories,
    currentCity,
    setCurrentCity,
    municipalities,
    userLocation,
    requestUserLocation,
    trackBusinessInteraction,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showBusinessList, setShowBusinessList] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const businessesScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollBusinesses = (direction: 'left' | 'right') => {
    if (businessesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      businessesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Target municipality center
  const centerCoords = useMemo<LocationCoordinates>(() => {
    if (userLocation) return userLocation;
    const key = (currentCity || 'cajicá').toLowerCase();
    return MUNICIPAL_FALLBACKS[key] || MUNICIPAL_FALLBACKS.cajicá;
  }, [userLocation, currentCity]);

  // Filtered businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      // 1. City match
      if (currentCity && currentCity !== 'all') {
        const cityLower = currentCity.toLowerCase();
        const bCityLower = (b.city || '').toLowerCase();
        if (!bCityLower.includes(cityLower) && !cityLower.includes(bCityLower)) {
          return false;
        }
      }

      // 2. Category match
      if (selectedCat && selectedCat !== 'all') {
        if (b.categoryId !== selectedCat) {
          return false;
        }
      }

      // 3. Search text
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const nameMatch = b.name.toLowerCase().includes(q);
        const descMatch = (b.description || '').toLowerCase().includes(q);
        const addressMatch = (b.address || '').toLowerCase().includes(q);
        const sectorMatch = (b.sector || '').toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !addressMatch && !sectorMatch) {
          return false;
        }
      }

      return true;
    });
  }, [businesses, currentCity, selectedCat, searchTerm]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerCoords.lat, centerCoords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap tiles (fast, crisp, no watermark)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center when city changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerCoords.lat, centerCoords.lng], 14, {
        animate: true,
      });
    }
  }, [centerCoords]);

  // Keep Leaflet canvas perfectly sized on container layout & window resize
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Render Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    filteredBusinesses.forEach((b) => {
      if (!b.coordinates || !b.coordinates.lat || !b.coordinates.lng) return;

      const isSelected = selectedBusiness?.id === b.id;

      // Clean icon using official OleVeci pin without permanent text labels ("solo el icono")
      const icon = createOleVeciPinIcon({
        size: isSelected ? 48 : 38,
        pulse: isSelected,
      });

      const marker = L.marker([b.coordinates.lat, b.coordinates.lng], { icon, riseOnHover: true });

      // Subtle hover tooltip with business name
      marker.bindTooltip(b.name, {
        direction: 'top',
        offset: [0, -36],
        className: 'font-bold text-xs rounded-xl shadow-lg border border-slate-100 bg-white text-[#041f5e] px-2.5 py-1',
      });

      marker.on('click', () => {
        setSelectedBusiness(b);
        trackBusinessInteraction(b.id, 'view');
        map.setView([b.coordinates.lat, b.coordinates.lng], 16, { animate: true });
      });

      marker.addTo(layer);
    });

    // Render current user location marker if available
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      const userDivIcon = L.divIcon({
        className: 'user-geo-pin',
        html: `
          <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:#007af7;opacity:0.35;animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:relative;width:16px;height:16px;border-radius:50%;background:#007af7;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,122,247,0.5);"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userDivIcon,
        zIndexOffset: 1000,
      });

      userMarker.bindTooltip('Tu ubicación actual', {
        direction: 'top',
        offset: [0, -18],
        className: 'font-bold text-xs rounded-xl shadow-lg border border-blue-200 bg-[#007af7] text-white px-2.5 py-1',
      });

      userMarker.addTo(layer);
    }
  }, [filteredBusinesses, selectedBusiness, trackBusinessInteraction, userLocation]);

  const handleSelectCard = (b: Business) => {
    setSelectedBusiness(b);
    trackBusinessInteraction(b.id, 'view');
    if (mapInstanceRef.current && b.coordinates) {
      mapInstanceRef.current.setView([b.coordinates.lat, b.coordinates.lng], 16, {
        animate: true,
      });
    }
  };

  const handleWhatsApp = (b: Business, e: React.MouseEvent) => {
    e.stopPropagation();
    trackBusinessInteraction(b.id, 'whatsapp');
    const wa = normalizeToColombianWa(b.whatsapp || b.phone);
    const msg = `¡Hola ${b.name}! Los encontré en OleVeci Maps y quisiera más información.`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCall = (b: Business, e: React.MouseEvent) => {
    e.stopPropagation();
    trackBusinessInteraction(b.id, 'call');
    const tel = (b.phone || b.whatsapp || '').replace(/[^\d+]/g, '');
    if (tel) {
      window.location.href = `tel:${tel}`;
    }
  };

  const handleHowToGetThere = (b: Business, e: React.MouseEvent) => {
    e.stopPropagation();
    trackBusinessInteraction(b.id, 'maps');
    if (b.coordinates) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${b.coordinates.lat},${b.coordinates.lng}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-0 sm:px-4 py-0 sm:py-3 h-[calc(100dvh-54px)] sm:h-[calc(100vh-76px)]">
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-100 rounded-none sm:rounded-3xl border-0 sm:border sm:border-slate-200/90 shadow-none sm:shadow-xl">
        {/* Top Floating Control Bar */}
        <div className="absolute top-2 inset-x-2 sm:inset-x-3 z-20 flex flex-col gap-2 pointer-events-none">
        {/* Main Search & Municipality Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-2 sm:p-2.5 flex items-center gap-2 pointer-events-auto">
          {/* Search Input (Expands to fill available space) */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar negocio, servicio o comida..."
              className="w-full pl-9 pr-7 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm font-medium text-slate-800 border border-slate-200 focus:outline-hidden focus:border-[#007af7] focus:ring-2 focus:ring-[#007af7]/20 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Municipality Selector (Properly contained without overflow) */}
          <div className="relative shrink-0 max-w-[130px] sm:max-w-[170px]">
            <select
              value={currentCity || 'all'}
              onChange={(e) => setCurrentCity(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-bold text-[#041f5e] bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#007af7] cursor-pointer truncate shadow-2xs transition"
            >
              <option value="all">Todos los municipios</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Category Pills Bar with Left/Right Scroll Buttons */}
        <div className="relative flex items-center pointer-events-auto">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 text-slate-700 hover:text-[#007af7] hover:bg-white flex items-center justify-center shrink-0 mr-1.5 active:scale-90 transition cursor-pointer"
            title="Desplazar filtros a la izquierda"
            aria-label="Filtros anteriores"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Pills Container */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth flex-1"
          >
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-xs shrink-0 cursor-pointer ${
                selectedCat === 'all'
                  ? 'bg-[#007af7] text-white'
                  : 'bg-white/95 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-xs shrink-0 cursor-pointer whitespace-nowrap ${
                  selectedCat === cat.id
                    ? 'bg-[#007af7] text-white'
                    : 'bg-white/95 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 text-slate-700 hover:text-[#007af7] hover:bg-white flex items-center justify-center shrink-0 ml-1.5 active:scale-90 transition cursor-pointer"
            title="Desplazar filtros a la derecha"
            aria-label="Siguientes filtros"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Full Viewport */}
      <div ref={mapContainerRef} className="w-full h-full z-0 select-none" />

      {/* Map Control Buttons (Zoom, Recenter, Location) */}
      <div className="absolute right-3 top-28 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
          }}
          className="w-9 h-9 rounded-xl bg-white shadow-lg border border-slate-200/90 text-slate-700 hover:text-[#007af7] flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Acercar mapa"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
          }}
          className="w-9 h-9 rounded-xl bg-white shadow-lg border border-slate-200/90 text-slate-700 hover:text-[#007af7] flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Alejar mapa"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={async () => {
            const ok = await requestUserLocation();
            if (ok && userLocation && mapInstanceRef.current) {
              mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
            }
          }}
          className="w-9 h-9 rounded-xl bg-white shadow-lg border border-slate-200/90 text-slate-700 hover:text-emerald-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Mi ubicación GPS"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Business Card Modal / Bottom Popover */}
      {selectedBusiness && (
        <div className="absolute bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 z-30 animate-in slide-in-from-bottom duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-4 sm:p-5 relative overflow-hidden flex flex-col gap-3">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBusiness(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              title="Cerrar ficha"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Business Info Header */}
            <div className="flex items-start gap-3 pr-6">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-200 shrink-0 bg-slate-100 shadow-md">
                <img
                  src={selectedBusiness.logo || selectedBusiness.coverImage}
                  alt={selectedBusiness.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-black text-[#041f5e] truncate">
                    {selectedBusiness.name}
                  </h3>
                  {selectedBusiness.verified && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 fill-cyan-500/20 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
                  📍 {selectedBusiness.address || selectedBusiness.sector || selectedBusiness.city}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#007af7] border border-blue-200/60">
                    {selectedBusiness.subCategory || selectedBusiness.categoryId}
                  </span>
                  {selectedBusiness.hours && (
                    <span className="text-[10px] text-slate-500 font-medium truncate">
                      🕒 {selectedBusiness.hours}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: WhatsApp, Call, How to Get There, View Profile */}
            <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={(e) => handleWhatsApp(selectedBusiness, e)}
                className="py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex flex-col items-center justify-center shadow-md shadow-[#25D366]/30 transition active:scale-95 cursor-pointer"
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" size={18} />
                <span className="text-[9px] font-bold mt-0.5">WhatsApp</span>
              </button>

              {/* Call */}
              <button
                type="button"
                onClick={(e) => handleCall(selectedBusiness, e)}
                className="py-2 rounded-xl bg-[#007af7] hover:bg-[#0066d6] text-white flex flex-col items-center justify-center shadow-md shadow-blue-500/20 transition active:scale-95 cursor-pointer"
                title="Llamar"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span className="text-[9px] font-bold mt-0.5">Llamar</span>
              </button>

              {/* Cómo llegar */}
              <button
                type="button"
                onClick={(e) => handleHowToGetThere(selectedBusiness, e)}
                className="py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex flex-col items-center justify-center shadow-md shadow-cyan-600/20 transition active:scale-95 cursor-pointer"
                title="Cómo llegar"
              >
                <Navigation className="w-4 h-4 fill-current -rotate-45" />
                <span className="text-[9px] font-bold mt-0.5">Cómo llegar</span>
              </button>

              {/* Ver Perfil */}
              <button
                type="button"
                onClick={() => onSelectBusiness(selectedBusiness.id)}
                className="py-2 rounded-xl bg-[#041f5e] hover:bg-[#03153d] text-white flex flex-col items-center justify-center shadow-md transition active:scale-95 cursor-pointer"
                title="Ver perfil completo"
              >
                <Store className="w-4 h-4" />
                <span className="text-[9px] font-bold mt-0.5">Ver Perfil</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Horizontal Card Drawer (when no business is individually selected) */}
      {!selectedBusiness && showBusinessList && filteredBusinesses.length > 0 && (
        <div className="absolute bottom-3 inset-x-2 sm:inset-x-4 z-20 pointer-events-auto">
          <div className="relative flex items-center">
            {/* Scroll Left Button for Businesses */}
            <button
              type="button"
              onClick={() => scrollBusinesses('left')}
              className="absolute -left-1 sm:-left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/90 text-slate-700 hover:text-[#007af7] flex items-center justify-center active:scale-90 transition cursor-pointer hover:bg-slate-50"
              title="Ver comercios anteriores"
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Cards Container */}
            <div
              ref={businessesScrollRef}
              className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth w-full px-5 sm:px-6"
            >
              {filteredBusinesses.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectCard(b)}
                  className="w-64 sm:w-72 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 hover:border-[#007af7] shadow-xl shrink-0 cursor-pointer transition active:scale-98 flex items-center gap-2.5 group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img
                      src={b.logo || b.coverImage}
                      alt={b.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-black text-[#041f5e] truncate group-hover:text-[#007af7] transition">
                        {b.name}
                      </h4>
                      {b.verified && (
                        <CheckCircle2 className="w-3 h-3 text-cyan-500 fill-cyan-500/20 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                      📍 {b.sector || b.city}
                    </p>
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-[#007af7] border border-blue-200/60 mt-1">
                      {b.subCategory || b.categoryId}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#007af7] transition shrink-0" />
                </div>
              ))}
            </div>

            {/* Scroll Right Button for Businesses */}
            <button
              type="button"
              onClick={() => scrollBusinesses('right')}
              className="absolute -right-1 sm:-right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/90 text-slate-700 hover:text-[#007af7] flex items-center justify-center active:scale-90 transition cursor-pointer hover:bg-slate-50"
              title="Ver siguientes comercios"
              aria-label="Desplazar a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
