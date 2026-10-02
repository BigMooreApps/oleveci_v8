import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { Post, Business, LocationCoordinates } from '../types';
import { createOleVeciPinIcon } from '../utils/mapIcons';
import { SimulatedReadyPlan, resolvePlanPosts } from '../data/readyPlansData';
import {
  Maximize2,
  Minimize2,
  Crosshair,
  Plus,
  Minus,
  MapPin,
  Store,
  X,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface InteractiveNeighborhoodMapProps {
  onSelectPost: (post: Post) => void;
  onSelectBusiness: (businessId: string) => void;
  onOpenMapModalForBusiness?: (businessId: string) => void;
  posts?: Post[];
  filteredPlans?: SimulatedReadyPlan[];
  onResetFilters?: () => void;
}

// Center fallbacks for municipalities
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

export const InteractiveNeighborhoodMap: React.FC<InteractiveNeighborhoodMapProps> = ({
  onSelectPost,
  onSelectBusiness,
  onOpenMapModalForBusiness,
  posts: postsProp,
  filteredPlans,
  onResetFilters,
}) => {
  const {
    posts: rawPosts,
    filteredPosts,
    businesses,
    currentCity,
    currentSector,
    selectedCategory,
    searchQuery,
    activeFeedFilter,
    selectedPlanType,
    maxPlanBudget,
    userLocation,
    requestUserLocation,
    municipalities,
    getDistanceKm,
    isPostActive,
    setSelectedCategory,
    setCurrentSector,
    setActiveFeedFilter,
    setSearchQuery,
    setSelectedPlanType,
    setMaxPlanBudget,
    favorites,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const isComponentMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Compute default center
  const cityKey = (currentCity || 'cajicá').toLowerCase().trim();
  const hasSpecificCity = Boolean(currentCity && currentCity !== 'all');
  const muniCoord = municipalities.find(
    (m) => m.name.toLowerCase() === cityKey
  )?.coordinates;

  const centerCoords: LocationCoordinates = useMemo(() => {
    if (userLocation?.lat && userLocation?.lng) {
      return userLocation;
    }
    if (hasSpecificCity) {
      return muniCoord || MUNICIPAL_FALLBACKS[cityKey] || { lat: 4.8614, lng: -74.0558 };
    }
    return muniCoord || MUNICIPAL_FALLBACKS['cajicá'] || { lat: 4.9184, lng: -74.0259 };
  }, [userLocation, muniCoord, cityKey, hasSpecificCity]);

  // Combine filteredPosts (or postsProp) + stops from filteredPlans, strictly honoring current city
  const effectivePosts = useMemo(() => {
    const baseList = postsProp || filteredPosts;
    const postMap = new Map<string, Post>();

    baseList.forEach((p) => {
      if (hasSpecificCity) {
        const postCity = (p.businessCity || '').toLowerCase().trim();
        if (postCity && postCity !== cityKey) {
          return;
        }
      }
      postMap.set(p.id, p);
    });

    if (filteredPlans && filteredPlans.length > 0) {
      filteredPlans.forEach((plan) => {
        if (hasSpecificCity) {
          if (plan.municipality.toLowerCase().trim() !== cityKey) {
            return;
          }
        }
        const pPosts = resolvePlanPosts(plan, rawPosts);
        pPosts.forEach((p) => {
          if (hasSpecificCity) {
            const postCity = (p.businessCity || '').toLowerCase().trim();
            if (postCity && postCity !== cityKey) {
              return;
            }
          }
          if (!postMap.has(p.id)) {
            postMap.set(p.id, p);
          }
        });
      });
    }

    return Array.from(postMap.values());
  }, [postsProp, filteredPosts, filteredPlans, rawPosts, hasSpecificCity, cityKey]);

  // Filter posts with valid business coordinates strictly honoring all applied filters dynamically
  const activeAnnouncements = useMemo(() => {
    const list: { post: Post; business: Business; coordinates: LocationCoordinates }[] = [];
    const usedOffsets: Record<string, number> = {};

    const sectorKey = (currentSector || '').toLowerCase().trim();
    const hasSpecificSector = Boolean(currentSector && currentSector !== 'all');

    effectivePosts.forEach((post) => {
      if (!isPostActive(post)) {
        return;
      }

      const biz = businesses.find((b) => b.id === post.businessId);
      if (!biz || !biz.coordinates?.lat || !biz.coordinates?.lng) {
        return;
      }

      // 1. Dynamic Municipality filter
      if (hasSpecificCity) {
        const postCity = (post.businessCity || biz.city || '').toLowerCase().trim();
        if (postCity !== cityKey) {
          return;
        }
      }

      // 2. Dynamic Sector filter
      if (hasSpecificSector) {
        const postSector = (post.businessSector || biz.sector || '').toLowerCase().trim();
        if (!postSector.includes(sectorKey) && !sectorKey.includes(postSector)) {
          return;
        }
      }

      // 3. Dynamic Category filter
      if (selectedCategory && selectedCategory !== 'all') {
        if (post.categoryId !== selectedCategory && biz.categoryId !== selectedCategory) {
          return;
        }
      }

      // 4. Dynamic Budget filter
      if (maxPlanBudget !== null && maxPlanBudget > 0) {
        const price = post.promotionalPrice || post.originalPrice;
        if (price && price > maxPlanBudget) {
          return;
        }
      }

      // 5. Dynamic Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = post.title?.toLowerCase().includes(q);
        const matchesDesc = post.description?.toLowerCase().includes(q);
        const matchesBiz = biz.name?.toLowerCase().includes(q);
        const matchesSector = (post.businessSector || biz.sector || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesBiz && !matchesSector) {
          return;
        }
      }

      // 6. Dynamic Feed filter
      if (activeFeedFilter === 'favorites') {
        if (!favorites.includes(post.id)) return;
      } else if (activeFeedFilter === 'plans') {
        const inPlan = filteredPlans?.some((pl) => pl.postIds.includes(post.id));
        const hasPlanTag = post.tags?.some((t) => t.toLowerCase().includes('plan') || t.toLowerCase().includes('ruta'));
        if (!inPlan && !hasPlanTag && post.type !== 'event') return;
      } else if (activeFeedFilter !== 'all' && activeFeedFilter !== 'today' && activeFeedFilter !== 'nearby' && activeFeedFilter !== 'near_me') {
        const normFilter = activeFeedFilter.endsWith('s') ? activeFeedFilter.slice(0, -1) : activeFeedFilter;
        const normPostType = post.type.endsWith('s') ? post.type.slice(0, -1) : post.type;
        if (post.type !== activeFeedFilter && normPostType !== normFilter && post.type !== normFilter) {
          return;
        }
      }

      // Avoid exact pin collisions by applying a microscopic radial offset if same location
      const coordKey = `${biz.coordinates.lat.toFixed(4)}_${biz.coordinates.lng.toFixed(4)}`;
      const count = usedOffsets[coordKey] || 0;
      usedOffsets[coordKey] = count + 1;

      let lat = biz.coordinates.lat;
      let lng = biz.coordinates.lng;

      if (count > 0) {
        const angle = (count * 60 * Math.PI) / 180;
        const radius = 0.00035 * Math.ceil(count / 6);
        lat += Math.sin(angle) * radius;
        lng += Math.cos(angle) * radius;
      }

      list.push({
        post,
        business: biz,
        coordinates: { lat, lng },
      });
    });

    return list;
  }, [
    effectivePosts,
    businesses,
    hasSpecificCity,
    cityKey,
    currentSector,
    selectedCategory,
    maxPlanBudget,
    searchQuery,
    activeFeedFilter,
    favorites,
    filteredPlans,
    isPostActive,
  ]);

  const isFiltered =
    hasSpecificCity ||
    (Boolean(currentSector) && currentSector !== 'all') ||
    selectedCategory !== 'all' ||
    activeFeedFilter !== 'today' ||
    searchQuery.trim() !== '' ||
    selectedPlanType !== 'all' ||
    maxPlanBudget !== null;

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      setSelectedCategory('all');
      setCurrentSector('all');
      setActiveFeedFilter('today');
      setSearchQuery('');
      setSelectedPlanType('all');
      setMaxPlanBudget(null);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isEffectActive = true;

    // Helper to safely tear down map
    const cleanupMap = () => {
      if (markersLayerRef.current) {
        try {
          markersLayerRef.current.clearLayers();
        } catch (_) {}
      }

      if (userMarkerRef.current) {
        try {
          userMarkerRef.current.remove();
        } catch (_) {}
        userMarkerRef.current = null;
      }

      if (userCircleRef.current) {
        try {
          userCircleRef.current.remove();
        } catch (_) {}
        userCircleRef.current = null;
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

    cleanupMap();

    if (!mapContainerRef.current) return;

    try {
      // Create fresh Leaflet map with full interactive support
      const map = L.map(mapContainerRef.current, {
        center: [centerCoords.lat, centerCoords.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
      });

      if (!isEffectActive || !isComponentMountedRef.current) {
        map.remove();
        return;
      }

      mapInstanceRef.current = map;

      // Clean OpenStreetMap tiles without API key watermark
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      // Layer group for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // Invalidate size after initial layout
      const timer = setTimeout(() => {
        if (!isEffectActive || !isComponentMountedRef.current || !mapInstanceRef.current) return;
        try {
          map.invalidateSize();
        } catch (_) {}
      }, 250);

      return () => {
        isEffectActive = false;
        clearTimeout(timer);
        cleanupMap();
      };
    } catch (err) {
      console.warn('Leaflet map init warning:', err);
      return () => {
        isEffectActive = false;
        cleanupMap();
      };
    }
  }, []);

  // Update User Marker & Radius Circle when location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (userCircleRef.current) {
      userCircleRef.current.remove();
      userCircleRef.current = null;
    }

    const loc = userLocation || centerCoords;

    // User location icon (pulsing glowing blue indicator)
    const userHtml = `
      <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(0, 122, 247, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 16px; height: 16px; border-radius: 9999px; background: #007af7; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.35); position: relative; z-index: 10;"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'oleveci-user-location-marker',
      html: userHtml,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const marker = L.marker([loc.lat, loc.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    marker.bindTooltip(
      userLocation ? '📍 Tu ubicación actual' : `📍 Centro de ${currentCity || 'Cajicá'}`,
      { direction: 'top', offset: [0, -10], className: 'font-bold text-xs' }
    );
    userMarkerRef.current = marker;

    // Exploration Radius circle (1.2 km)
    const circle = L.circle([loc.lat, loc.lng], {
      radius: 1200,
      color: '#0056d6',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#007af7',
      fillOpacity: 0.05,
      interactive: false,
    }).addTo(map);
    userCircleRef.current = circle;
  }, [userLocation, centerCoords, currentCity]);

  // Update Announcement Markers using the official OleVeci Pin Icon
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    activeAnnouncements.forEach(({ post, business, coordinates }) => {
      const priceText = post.promotionalPrice
        ? `$${post.promotionalPrice.toLocaleString('es-CO')}`
        : post.originalPrice
        ? `$${post.originalPrice.toLocaleString('es-CO')}`
        : undefined;

      // Create official OleVeci Pin Icon (clean pin without permanent overlay labels)
      const oleveciIcon = createOleVeciPinIcon({
        size: 42,
        pulse: true,
      });

      const marker = L.marker([coordinates.lat, coordinates.lng], {
        icon: oleveciIcon,
        riseOnHover: true,
      });

      // Hover Tooltip: Information appears clearly when hovering over the icon
      marker.bindTooltip(
        `<div class="p-1 space-y-0.5 min-w-[130px] max-w-[210px]">
          <div class="text-xs font-bold text-[#041f5e] leading-snug">${post.title}</div>
          <div class="text-[11px] font-medium text-slate-500">${business.name}</div>
          ${priceText ? `<div class="text-[11px] font-extrabold text-[#0056d6] mt-0.5">${priceText}</div>` : ''}
        </div>`,
        { direction: 'top', offset: [0, -42], className: 'rounded-xl shadow-lg border border-slate-100 bg-white' }
      );

      // Click Event: Center on pin & show floating preview card
      marker.on('click', () => {
        setSelectedPost(post);
        try {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([coordinates.lat, coordinates.lng], { animate: true, duration: 0.5 });
          }
        } catch (_) {}
      });

      marker.addTo(markersLayer);
    });

    // Dynamically adjust map viewport to show matching locations
    if (mapInstanceRef.current) {
      if (activeAnnouncements.length > 0) {
        try {
          const bounds = L.latLngBounds(
            activeAnnouncements.map((a) => [a.coordinates.lat, a.coordinates.lng])
          );
          if (activeAnnouncements.length === 1) {
            map.flyTo([activeAnnouncements[0].coordinates.lat, activeAnnouncements[0].coordinates.lng], 15, {
              animate: true,
              duration: 0.8,
            });
          } else {
            map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15, animate: true });
          }
        } catch (err) {
          console.warn('Could not fit bounds', err);
        }
      } else {
        map.flyTo([centerCoords.lat, centerCoords.lng], 14, { animate: true, duration: 0.8 });
      }
    }
  }, [activeAnnouncements, centerCoords]);

  // Re-invalidate map size when toggling expanded view
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  // Controls Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleCenterOnUser = async () => {
    setIsLocating(true);
    const ok = await requestUserLocation();
    setIsLocating(false);

    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        duration: 1.2,
      });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([centerCoords.lat, centerCoords.lng], 15, {
        duration: 1.0,
      });
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs space-y-3">
      {/* 1. Header Bar with title and quick controls */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-extrabold text-[#031c54] truncate tracking-tight">
            Descubre tu zona
          </h3>
        </div>

        {/* Header Quick Controls: +, -, Centrar, Ampliar (Only Icons) */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50/90 p-0.5 sm:p-1 rounded-2xl border border-slate-200/90 shadow-2xs shrink-0">
          {/* Zoom In (+) */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-700 hover:text-[#0056d6] hover:bg-white transition active:scale-95 cursor-pointer shadow-2xs"
            title="Acercar mapa (+)"
            aria-label="Acercar mapa"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Zoom Out (-) */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-700 hover:text-[#0056d6] hover:bg-white transition active:scale-95 cursor-pointer shadow-2xs"
            title="Alejar mapa (-)"
            aria-label="Alejar mapa"
          >
            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <div className="w-px h-3.5 sm:h-4 bg-slate-200 mx-0.5" />

          {/* Center GPS */}
          <button
            type="button"
            onClick={handleCenterOnUser}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-700 hover:text-[#0056d6] hover:bg-white transition active:scale-95 cursor-pointer shadow-2xs ${
              isLocating ? 'animate-pulse text-[#0056d6]' : ''
            }`}
            title="Centrar en mi ubicación GPS"
            aria-label="Centrar en mi ubicación"
          >
            <Crosshair className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLocating ? 'animate-spin text-[#0056d6]' : ''}`} />
          </button>

          <div className="w-px h-3.5 sm:h-4 bg-slate-200 mx-0.5" />

          {/* Expand / Minimize */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-700 hover:text-[#0056d6] hover:bg-white transition active:scale-95 cursor-pointer shadow-2xs"
            title={isExpanded ? 'Reducir tamaño del mapa' : 'Ampliar mapa'}
            aria-label={isExpanded ? 'Reducir tamaño del mapa' : 'Ampliar mapa'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Map Container */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 transition-all duration-300 shadow-inner ${
          isExpanded ? 'h-96 sm:h-[480px]' : 'h-64 sm:h-80'
        }`}
      >
        {/* Leaflet DOM Anchor */}
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

        {/* Empty state overlay when filters yield 0 map locations */}
        {activeAnnouncements.length === 0 && (
          <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto">
            <div className="bg-white rounded-2xl p-4 sm:p-5 text-center max-w-xs shadow-2xl border border-slate-200/90 space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-[#031c54]">
                  Sin ubicaciones para este filtro
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  No hay anuncios o comercios en {currentCity || 'tu municipio'} que coincidan con los filtros actuales.
                </p>
              </div>
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2 px-3 rounded-xl bg-[#007af7] hover:bg-[#0066cc] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer filtros</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Floating Exploration Radius Pill */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 z-30 pointer-events-none max-w-[calc(100%-20px)] sm:max-w-[calc(100%-24px)]">
          <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1.5 sm:gap-2 shadow-lg border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">
              {hasSpecificCity ? currentCity : 'Sabana Centro'} • {activeAnnouncements.length} {activeAnnouncements.length === 1 ? 'anuncio visible' : 'anuncios visibles'}
            </span>
          </div>
        </div>

        {/* Selected Post Bottom Preview Floating Card */}
        {selectedPost && (
          <div className="absolute bottom-3 inset-x-3 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-3 duration-200">
            <div className="bg-white rounded-2xl border border-blue-200/90 p-3 shadow-xl flex items-center gap-3 relative">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-xs transition cursor-pointer"
                aria-label="Cerrar vista previa"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Thumbnail with robust fallback & OleVeci watermark */}
              <div
                onClick={() => onSelectPost(selectedPost)}
                className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer group border border-slate-200/90"
              >
                {selectedPost.imageUrl ? (
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      if (selectedPost.businessLogo && e.currentTarget.src !== selectedPost.businessLogo) {
                        e.currentTarget.src = selectedPost.businessLogo;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : selectedPost.businessLogo ? (
                  <img
                    src={selectedPost.businessLogo}
                    alt={selectedPost.businessName}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center text-[#0056d6]">
                    <Store className="w-6 h-6" />
                  </div>
                )}
                <img
                  src="/Icono_Oleveci_sin_fondo.png"
                  alt="OleVeci"
                  className="absolute bottom-1 right-1 w-4 h-4 object-contain filter drop-shadow-md pointer-events-none"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#0056d6] truncate">
                    {selectedPost.businessName}
                  </span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5 shrink-0">
                    <MapPin className="w-2.5 h-2.5 text-[#0056d6]" />
                    {getDistanceKm() ? `${getDistanceKm()} km` : selectedPost.businessSector}
                  </span>
                </div>

                <h4
                  onClick={() => onSelectPost(selectedPost)}
                  className="text-xs sm:text-sm font-extrabold text-[#031c54] truncate hover:text-[#0056d6] transition cursor-pointer"
                >
                  {selectedPost.title}
                </h4>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="flex items-center gap-1.5">
                    {selectedPost.promotionalPrice ? (
                      <span className="text-xs font-black text-emerald-600">
                        ${selectedPost.promotionalPrice.toLocaleString('es-CO')}
                      </span>
                    ) : selectedPost.originalPrice ? (
                      <span className="text-xs font-bold text-slate-800">
                        ${selectedPost.originalPrice.toLocaleString('es-CO')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                        Disponible
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectPost(selectedPost)}
                    className="px-2.5 py-1 rounded-lg bg-[#0056d6] hover:bg-[#0047ba] text-white text-[11px] font-bold transition flex items-center gap-1 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <span>Ver anuncio</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
