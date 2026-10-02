import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Post } from '../types';
import { useApp } from '../context/AppContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { BusinessLocationMapModal } from './BusinessLocationMapModal';
import { parseVideoUrl } from '../utils/videoHelper';
import { normalizeToColombianWa } from '../utils/phoneUtils';
import { getAvatarUrl, getReelPosterUrl } from '../utils/imageOptimization';
import { PlanBackgroundImages } from './InvitationCardPreview';
import {
  Search,
  SlidersHorizontal,
  Heart,
  Share2,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Clock,
  Calendar,
  MapPin,
  Eye,
  CheckCircle2,
  Sparkles,
  Plus,
  Check,
  ChevronUp,
  ChevronDown,
  Info,
  Phone,
  Navigation,
  Route,
} from 'lucide-react';

interface ReelFeedViewProps {
  posts: Post[];
  onSelectPost: (post: Post, initialTab?: 'card' | 'map') => void;
  onSelectBusiness: (businessId: string) => void;
  onOpenFilterModal: () => void;
  activeFiltersCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentCity?: string;
  onClearFilters?: () => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

interface ReelItemVideoProps {
  src: string;
  poster?: string;
  isCurrentActive: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
}

const ReelItemVideo = React.memo<ReelItemVideoProps>(({
  src,
  poster,
  isCurrentActive,
  isPlaying,
  isMuted,
  onTogglePlay,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFeedback, setShowFeedback] = useState<'play' | 'pause' | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Synchronize playback state with active and isPlaying flags
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isCurrentActive && isPlaying) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoReady(true))
          .catch(() => {
            if (!video.muted) {
              video.muted = true;
              video.play().then(() => setIsVideoReady(true)).catch(() => {});
            }
          });
      }
    } else {
      video.pause();
    }
  }, [isCurrentActive, isPlaying, isMuted]);

  // Synchronize audio mute state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!isCurrentActive) {
      setIsVideoReady(false);
    }
  }, [isCurrentActive]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePlay();
    const nextState = isPlaying ? 'pause' : 'play';
    setShowFeedback(nextState);
    setTimeout(() => {
      setShowFeedback(null);
    }, 700);
  };

  return (
    <div
      className="relative w-full h-full bg-black cursor-pointer select-none"
      onClick={handleToggle}
    >
      {/* Solid background poster image - guarantees zero black frames or flickering while video starts */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
          loading="eager"
          decoding="async"
        />
      )}

      {/* HTML5 video element on top of poster - smoothly appears only when playing/ready */}
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        preload={isCurrentActive ? 'auto' : 'none'}
        onPlaying={() => setIsVideoReady(true)}
        className={`absolute inset-0 w-full h-full object-cover select-none z-10 transition-opacity duration-200 ${
          isVideoReady && isCurrentActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Center Play Button Overlay when explicitly Paused */}
      {!isPlaying && isCurrentActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all z-20">
          <button
            type="button"
            onClick={handleToggle}
            className="w-20 h-20 rounded-full bg-black/75 border-2 border-white/90 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="Reproducir video"
            aria-label="Reproducir video"
          >
            <Play className="w-10 h-10 ml-1.5 fill-white text-white" />
          </button>
        </div>
      )}

      {/* Animated Pause Feedback when tapped to pause */}
      {showFeedback === 'pause' && isCurrentActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-18 h-18 rounded-full bg-black/75 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white animate-out fade-out zoom-out-110 duration-700">
            <Pause className="w-8 h-8 fill-white text-white" />
          </div>
        </div>
      )}

      {/* Animated Play Feedback when resumed */}
      {showFeedback === 'play' && isCurrentActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-18 h-18 rounded-full bg-black/75 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white animate-out fade-out zoom-out-110 duration-700">
            <Play className="w-8 h-8 ml-1 fill-white text-white" />
          </div>
        </div>
      )}
    </div>
  );
});

ReelItemVideo.displayName = 'ReelItemVideo';

interface FeedPostItem extends Post {
  feedInstanceId: string;
}

function shuffleArray<T extends Post>(arr: T[]): T[] {
  if (arr.length <= 1) return [...arr];
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

// ==========================================
// MEMOIZED REEL ITEM COMPONENT
// ==========================================
interface ReelItemProps {
  post: FeedPostItem;
  index: number;
  isCurrentActive: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isFav: boolean;
  currentCity?: string;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleFavorite: (postId: string) => void;
  onSelectPost: (post: Post, initialTab?: 'card' | 'map') => void;
  onSelectBusiness: (businessId: string) => void;
  onWhatsApp: (post: Post, e: React.MouseEvent) => void;
  onCall: (post: Post, e: React.MouseEvent) => void;
  onHowToGetThere: (post: Post, e: React.MouseEvent) => void;
  onShare: (post: Post, e: React.MouseEvent) => void;
}

const ReelItem = React.memo<ReelItemProps>(({
  post,
  index,
  isCurrentActive,
  isPlaying,
  isMuted,
  isFav,
  currentCity,
  onTogglePlay,
  onToggleMute,
  onToggleFavorite,
  onSelectPost,
  onSelectBusiness,
  onWhatsApp,
  onCall,
  onHowToGetThere,
  onShare,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const lastTapRef = useRef<number>(0);

  const parsedVideo = parseVideoUrl(post.videoUrl);
  const hasVideo = Boolean(post.videoUrl);

  const discountPercent =
    post.originalPrice && post.promotionalPrice && post.originalPrice > post.promotionalPrice
      ? Math.round(((post.originalPrice - post.promotionalPrice) / post.originalPrice) * 100)
      : null;

  const handleMediaTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    if (timeDiff < 300) {
      // Double tap detected!
      const rect = e.currentTarget.getBoundingClientRect();
      let clientX = rect.width / 2;
      let clientY = rect.height / 2;

      if ('clientX' in e && e.clientX !== undefined) {
        clientX = e.clientX - rect.left;
        clientY = e.clientY - rect.top;
      }

      const heartId = Date.now();
      setFloatingHearts((prev) => [...prev, { id: heartId, x: clientX, y: clientY }]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
      }, 900);

      if (!isFav) {
        onToggleFavorite(post.id);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      if (hasVideo) {
        onTogglePlay();
      }
    }
  };

  return (
    <div
      data-reel-index={index}
      className="reel-item relative w-full h-full snap-start shrink-0 overflow-hidden bg-black flex flex-col justify-between"
    >
      {/* Media Layer (Image or Video) with ambient background */}
      <div
        className="absolute inset-0 z-0 overflow-hidden cursor-pointer"
        onClick={handleMediaTap}
      >
        {post.isPlan && post.planStops && post.planStops.length > 0 ? (
          <div className="relative w-full h-full bg-black overflow-hidden select-none">
            <PlanBackgroundImages
              posts={post.planStops}
              bgLayout={post.planData?.bgLayout || 'horizontal'}
              theme={post.planData?.theme}
            />
          </div>
        ) : hasVideo ? (
          parsedVideo.isIframe ? (
            isCurrentActive ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <iframe
                  src={parsedVideo.embedUrl}
                  title={post.title}
                  className="w-full h-full border-0 pointer-events-auto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <img
                  src={getReelPosterUrl(post.imageUrl)}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            )
          ) : (
            <ReelItemVideo
              src={parsedVideo.directUrl || post.videoUrl || ''}
              poster={getReelPosterUrl(post.imageUrl)}
              isCurrentActive={isCurrentActive}
              isPlaying={isPlaying}
              isMuted={isMuted}
              onTogglePlay={onTogglePlay}
            />
          )
        ) : (
          <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none">
            <img
              src={getReelPosterUrl(post.imageUrl)}
              alt={post.title}
              className="relative w-full h-full object-cover"
              style={{
                objectPosition: post.imagePosition
                  ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                  : 'center',
                transform: post.imageScale ? `scale(${post.imageScale})` : undefined,
                transformOrigin: post.imagePosition
                  ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                  : 'center',
              }}
              loading="eager"
              decoding="async"
            />
          </div>
        )}

        {/* Floating Double-Tap Hearts */}
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            style={{ left: heart.x, top: heart.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 animate-out fade-out zoom-out-150 duration-700"
          >
            <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
          </div>
        ))}

        {/* Top-Left: Itinerary Badge or Discount Badge */}
        {post.isPlan ? (
          <div className="absolute top-3.5 sm:top-4 left-3.5 z-20 pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#007af7] text-white font-extrabold text-[11px] shadow-lg shadow-black/40 border border-white/25">
              <Route className="w-3 h-3 text-cyan-200" />
              <span className="tracking-wide">Itinerario</span>
            </div>
          </div>
        ) : discountPercent ? (
          <div className="absolute top-3.5 sm:top-4 left-3.5 z-20 pointer-events-none">
            <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-xs shadow-xl shadow-black/50 border border-white/35 transform -rotate-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-sm font-black tracking-tight">-{discountPercent}%</span>
              <span className="text-[10px] uppercase font-bold tracking-tight text-white/95">OFF</span>
            </div>
          </div>
        ) : null}

        {/* Top-Right Badges: Video Controls and Location */}
        <div className="absolute top-3.5 sm:top-4 right-3.5 z-20 flex items-center gap-2 pointer-events-auto">
          {hasVideo && isCurrentActive && (
            <>
              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                className="w-7 h-7 rounded-full bg-black/80 border border-white/25 text-white flex items-center justify-center hover:bg-black active:scale-95 transition cursor-pointer shadow-lg"
                title={isPlaying ? 'Pausar video' : 'Reproducir video'}
                aria-label="Pausar o reproducir video"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-white text-white" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                )}
              </button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMute();
                }}
                className="w-7 h-7 rounded-full bg-black/80 border border-white/25 text-white flex items-center justify-center hover:bg-black active:scale-95 transition cursor-pointer shadow-lg"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
                aria-label="Alternar sonido"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/80" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-300" />}
              </button>
            </>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-white/20 text-white text-xs font-bold shadow-lg shadow-black/40 pointer-events-none">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate max-w-[170px]">
              {post.businessSector || 'Centro'} · {post.businessCity || currentCity || 'Cajicá'}
            </span>
          </div>
        </div>

        {/* Scrim Overlay Gradients for Perfect Legibility */}
        <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-10" />
      </div>

      {/* RIGHT-HAND ACTION RAIL (WhatsApp, Llamar, Cómo llegar, Compartir y Negocio) */}
      <div
        className="absolute right-2.5 sm:right-3.5 bottom-16 sm:bottom-18 z-30 flex flex-col items-center gap-2.5 sm:gap-3 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Icono del Negocio o Itinerario */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => {
              if (post.isPlan) {
                onSelectPost(post);
              } else {
                onSelectBusiness(post.businessId);
              }
            }}
            className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full border-2 border-white ring-2 ring-cyan-400/70 shadow-2xl overflow-hidden bg-neutral-900 cursor-pointer active:scale-90 transition group hover:ring-cyan-300"
            title={post.isPlan ? `Ver plan: ${post.title}` : `Ver perfil del comercio: ${post.businessName}`}
          >
            <img
              src={getAvatarUrl(post.businessLogo || post.imageUrl)}
              alt={post.businessName}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              loading="eager"
              decoding="async"
            />
          </div>
          <span className="text-[10px] font-extrabold text-white mt-1 drop-shadow-md text-center max-w-[60px] truncate leading-tight">
            {post.isPlan ? 'Itinerario' : 'Veci'}
          </span>
        </div>

        {/* 2. WhatsApp Direct Chat Button (Hidden for itineraries) */}
        {!post.isPlan && (
          <button
            type="button"
            onClick={(e) => onWhatsApp(post, e)}
            className="flex flex-col items-center group cursor-pointer active:scale-80 transition"
            title="Contactar al comercio por WhatsApp"
            aria-label="WhatsApp"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/40 border border-emerald-300/40 hover:bg-[#20ba5a] transition">
              <WhatsAppIcon className="w-5 h-5" size={20} />
            </div>
            <span className="text-[9px] font-bold text-white mt-0.5 drop-shadow-md">
              WhatsApp
            </span>
          </button>
        )}

        {/* 3. Llamar Button (Hidden for itineraries) */}
        {!post.isPlan && (
          <button
            type="button"
            onClick={(e) => onCall(post, e)}
            className="flex flex-col items-center group cursor-pointer active:scale-80 transition"
            title={`Llamar a ${post.businessName}`}
            aria-label="Llamar"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#007af7] text-white flex items-center justify-center border border-blue-300/40 shadow-lg shadow-blue-600/30 hover:bg-[#0066d6] transition">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[9px] font-bold text-white mt-0.5 drop-shadow-md">
              Llamar
            </span>
          </button>
        )}

        {/* 4. Cómo llegar (Ubicación en Mapa) */}
        <button
          type="button"
          onClick={(e) => onHowToGetThere(post, e)}
          className="flex flex-col items-center group cursor-pointer active:scale-80 transition"
          title="Cómo llegar y ver ubicación"
          aria-label="Cómo llegar"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0098b8] text-white flex items-center justify-center border border-cyan-300/40 shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 transition">
            <Navigation className="w-5 h-5 fill-current -rotate-45" />
          </div>
          <span className="text-[9px] font-bold text-white mt-0.5 drop-shadow-md text-center leading-none">
            Cómo llegar
          </span>
        </button>

        {/* 5. Compartir Button */}
        <button
          type="button"
          onClick={(e) => onShare(post, e)}
          className="flex flex-col items-center group cursor-pointer active:scale-80 transition"
          title="Compartir anuncio"
          aria-label="Compartir"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-900/90 text-white flex items-center justify-center border border-white/25 shadow-xl hover:bg-neutral-800 transition">
            <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[9px] font-bold text-white mt-0.5 drop-shadow-md">
            Compartir
          </span>
        </button>
      </div>

      {/* BOTTOM INFORMATION (Business, Title, Price, Validity, Description) */}
      <div
        className="absolute inset-x-0 bottom-16 sm:bottom-18 z-20 pb-2 pt-6 px-3.5 sm:px-4 pointer-events-auto flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pr-16 space-y-2">
          {/* Clean Business Name Header (Only for individual business posts, hidden for itineraries) */}
          {!post.isPlan && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectBusiness(post.businessId)}
                className="inline-flex items-center gap-1.5 transition cursor-pointer active:scale-98 group text-left"
                title={`Ver comercio: ${post.businessName}`}
              >
                <span className="text-white group-hover:text-cyan-300 font-extrabold text-sm sm:text-base tracking-tight truncate max-w-[240px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                  {post.businessName}
                </span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/25 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
              </button>
            </div>
          )}

          {/* Announcement Title (Filtered if it says 'publicidad' or starts with it) */}
          {(() => {
            const rawTitle = (post.title || '').trim();
            const cleanTitle = rawTitle.replace(/^publicidad\s*[-:–]?\s*/i, '').trim();
            if (!cleanTitle || cleanTitle.toLowerCase() === 'publicidad') return null;
            return (
              <h3
                onClick={() => onSelectPost(post)}
                className="text-sm sm:text-base font-extrabold text-white leading-snug drop-shadow-md hover:text-cyan-200 transition cursor-pointer line-clamp-2"
              >
                {cleanTitle}
              </h3>
            );
          })()}

          {/* Pricing and Schedule Row */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {post.isPlan && post.promotionalPrice ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-black shadow-sm">
                <span className="text-[10px] text-white/70 font-normal">Presupuesto estimado:</span>
                <span>${post.promotionalPrice.toLocaleString('es-CO')}</span>
              </div>
            ) : post.promotionalPrice ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-black shadow-sm">
                <span>${post.promotionalPrice.toLocaleString('es-CO')}</span>
                {post.originalPrice && (
                  <span className="text-[10px] text-white/60 line-through font-normal">
                    ${post.originalPrice.toLocaleString('es-CO')}
                  </span>
                )}
              </div>
            ) : post.originalPrice ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/15 border border-white/20 text-white text-xs font-bold">
                <span>${post.originalPrice.toLocaleString('es-CO')}</span>
              </div>
            ) : null}

            {/* Expiry / Schedule badge */}
            {post.expiryLabel && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/25 border border-blue-400/40 text-blue-200 text-[11px] font-bold">
                <Clock className="w-3 h-3 text-cyan-300" />
                <span className="truncate max-w-[180px]">{post.expiryLabel}</span>
              </div>
            )}
          </div>

          {/* Description with Expand toggle */}
          {post.description && (
            <div className="text-[11px] text-white/80 leading-relaxed font-normal">
              <p className={isExpanded ? '' : 'line-clamp-1'}>
                {post.description}
              </p>
              {post.description.length > 55 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded((prev) => !prev);
                  }}
                  className="text-[10px] font-bold text-cyan-300 hover:text-white mt-0.5 inline-block cursor-pointer"
                >
                  {isExpanded ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ReelItem.displayName = 'ReelItem';

export const ReelFeedView: React.FC<ReelFeedViewProps> = ({
  posts,
  onSelectPost,
  onSelectBusiness,
  onOpenFilterModal,
  activeFiltersCount,
  searchQuery,
  setSearchQuery,
  currentCity = 'Cajicá',
  onClearFilters,
}) => {
  const {
    favorites,
    toggleFavorite,
    trackInteraction,
    categories,
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);
  const [selectedMapPost, setSelectedMapPost] = useState<Post | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const viewedPostsRef = useRef<Set<string>>(new Set());
  const preloadedUrlsRef = useRef<Set<string>>(new Set());

  // Infinite randomized feed items (keeps looping randomly forever)
  const [feedItems, setFeedItems] = useState<FeedPostItem[]>([]);
  const batchCountRef = useRef(0);

  // Stable posts signature: Only re-initialize feed if the actual set of posts/filters changes,
  // NOT when a post's metric (views, clicks, etc.) updates!
  const postsSignature = useMemo(
    () => (posts || []).filter(Boolean).map((p) => p?.id || '').join(','),
    [posts]
  );

  const activeIndexRef = useRef(0);
  const feedItemsRef = useRef(feedItems);
  feedItemsRef.current = feedItems;
  const trackInteractionRef = useRef(trackInteraction);
  trackInteractionRef.current = trackInteraction;

  // Touch and Transition state for strict 1-by-1 TikTok / Instagram paging
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isTransitioningRef = useRef(false);

  // Initialize infinite randomized feed whenever source posts or filters change
  useEffect(() => {
    if (!posts || posts.length === 0) {
      setFeedItems([]);
      batchCountRef.current = 0;
      setActiveIndex(0);
      activeIndexRef.current = 0;
      return;
    }

    batchCountRef.current = 0;
    setActiveIndex(0);
    activeIndexRef.current = 0;

    // Initial sequence: First pass preserves current order (e.g. pinned welcome reel or natural sort)
    const initialItems: FeedPostItem[] = posts.map((p, idx) => ({
      ...p,
      feedInstanceId: `${p.id}__b0_${idx}`,
    }));

    // Preload randomized passes so the feed is instantly deep and seamless
    let currentBatch = 1;
    while (initialItems.length < Math.max(20, posts.length * 2) && posts.length > 0 && currentBatch <= 4) {
      const shuffled = shuffleArray(posts);
      shuffled.forEach((p, idx) => {
        initialItems.push({
          ...p,
          feedInstanceId: `${p.id}__b${currentBatch}_${idx}`,
        });
      });
      currentBatch++;
    }
    batchCountRef.current = currentBatch;
    setFeedItems(initialItems);
  }, [postsSignature]);

  // Dynamically append more randomized batches as the user approaches the end of the feed (never ends!)
  useEffect(() => {
    if (!posts || posts.length === 0 || feedItems.length === 0) return;

    if (activeIndex >= feedItems.length - 4) {
      const currentBatch = batchCountRef.current + 1;
      batchCountRef.current = currentBatch;

      const shuffled = shuffleArray(posts);
      const nextBatch: FeedPostItem[] = shuffled.map((p, idx) => ({
        ...p,
        feedInstanceId: `${p.id}__b${currentBatch}_${idx}`,
      }));

      setFeedItems((prev) => [...prev, ...nextBatch]);
    }
  }, [activeIndex, postsSignature, feedItems.length]);

  // Aggressively preload upcoming images in a sliding window with GPU decoding
  useEffect(() => {
    if (!feedItems || feedItems.length === 0) return;
    const startIndex = Math.max(0, activeIndex - 1);
    const endIndex = Math.min(feedItems.length - 1, activeIndex + 8);

    for (let i = startIndex; i <= endIndex; i++) {
      const p = feedItems[i];
      if (!p) continue;
      const urls: string[] = [];
      if (p.imageUrl) urls.push(getReelPosterUrl(p.imageUrl));
      if (p.businessLogo) urls.push(getAvatarUrl(p.businessLogo));
      if (p.isPlan && p.planStops) {
        p.planStops.forEach((stop) => {
          if (stop.imageUrl) urls.push(getReelPosterUrl(stop.imageUrl));
        });
      }
      urls.forEach((url) => {
        if (url && !preloadedUrlsRef.current.has(url)) {
          preloadedUrlsRef.current.add(url);
          const img = new Image();
          img.src = url;
          if ('decode' in img) {
            img.decode().catch(() => {});
          }
        }
      });
    }
  }, [activeIndex, feedItems]);

  // Navigate to specific index with strict 1-by-1 clamping
  const scrollToIndex = useCallback((index: number) => {
    if (isTransitioningRef.current) return;
    if (!feedItemsRef.current || feedItemsRef.current.length === 0) return;
    const clamped = Math.max(0, Math.min(feedItemsRef.current.length - 1, index));
    if (clamped !== activeIndexRef.current) {
      isTransitioningRef.current = true;
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
      setIsPlaying(true);

      const post = feedItemsRef.current[clamped];
      if (post && post.id && !viewedPostsRef.current.has(post.id)) {
        viewedPostsRef.current.add(post.id);
        if (!post.id.startsWith('itinerary_')) {
          trackInteractionRef.current(post.id, 'view');
        }
      }

      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 340);
    }
  }, []);

  const goToNext = useCallback(() => {
    scrollToIndex(activeIndexRef.current + 1);
  }, [scrollToIndex]);

  const goToPrev = useCallback(() => {
    scrollToIndex(activeIndexRef.current - 1);
  }, [scrollToIndex]);

  // Touch handlers for strict 1-by-1 swipe gesture (TikTok / Instagram)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (document.activeElement?.tagName === 'INPUT') return;
    if (isTransitioningRef.current) return;

    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartTimeRef.current = Date.now();
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isTransitioningRef.current) return;
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - touchStartYRef.current;
    const diffX = currentX - touchStartXRef.current;

    // Detect if this is vertical drag (not horizontal swipe or tap)
    if (!isDraggingRef.current) {
      if (Math.abs(diffY) > 8 && Math.abs(diffY) > Math.abs(diffX)) {
        isDraggingRef.current = true;
        setIsDragging(true);
      } else {
        return;
      }
    }

    if (e.cancelable) {
      e.preventDefault();
    }

    // Apply rubber band resistance if at boundaries
    let dampedDiffY = diffY;
    if (activeIndex === 0 && diffY > 0) {
      dampedDiffY = diffY * 0.25;
    } else if (activeIndex >= feedItems.length - 1 && diffY < 0) {
      dampedDiffY = diffY * 0.25;
    }

    setDragOffset(dampedDiffY);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      setDragOffset(0);
      return;
    }

    isDraggingRef.current = false;
    setIsDragging(false);
    const endY = e.changedTouches[0].clientY;
    const diffY = endY - touchStartYRef.current;
    const elapsed = Date.now() - touchStartTimeRef.current;
    const velocity = diffY / Math.max(1, elapsed);

    // Determine target index: strictly ONE reel step
    const threshold = 40;
    let targetIndex = activeIndex;

    if (diffY < -threshold || (velocity < -0.3 && diffY < -15)) {
      targetIndex = activeIndex + 1;
    } else if (diffY > threshold || (velocity > 0.3 && diffY > 15)) {
      targetIndex = activeIndex - 1;
    }

    setDragOffset(0);

    if (targetIndex !== activeIndex) {
      scrollToIndex(targetIndex);
    }
  };

  // Mouse wheel handler for desktop (advances strictly one reel per notch)
  const handleWheel = (e: React.WheelEvent) => {
    if (isTransitioningRef.current) return;
    if (Math.abs(e.deltaY) > 25) {
      if (e.deltaY > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  // Keyboard navigation (ArrowUp, ArrowDown, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Stable action callbacks
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleToggleFavorite = useCallback((postId: string) => {
    toggleFavorite(postId);
  }, [toggleFavorite]);

  const handleWhatsApp = useCallback((post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    trackInteraction(post.id, 'whatsapp');
    const waNumber = normalizeToColombianWa(post.businessWhatsapp || post.businessPhone);
    const postUrl = `${window.location.origin}/anuncio/${post.id}`;
    const text = `¡Hola ${post.businessName}! Vi su anuncio "${post.title}" en OleVeci y me gustaría más información:\n${postUrl}`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }, [trackInteraction]);

  const handleCall = useCallback((post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    trackInteraction(post.id, 'call');
    const phoneToCall = post.businessPhone || post.businessWhatsapp;
    if (!phoneToCall) return;
    const cleanCallable = phoneToCall.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanCallable}`;
  }, [trackInteraction]);

  const handleHowToGetThere = useCallback((post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    trackInteraction(post.id, 'maps');
    if (post.isPlan) {
      onSelectPost(post, 'map');
    } else {
      setSelectedMapPost(post);
    }
  }, [trackInteraction, onSelectPost]);

  const handleShare = useCallback(async (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    trackInteraction(post.id, 'share');
    const postUrl = `${window.location.origin}/anuncio/${post.id}`;
    const shareData = {
      title: `${post.businessName} - ${post.title}`,
      text: `¡Mira esta promo en OleVeci! ${post.title}`,
      url: postUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2200);
      } catch {
        // Fallback
      }
    }
  }, [trackInteraction]);

  const getCategoryName = (catId?: string) => {
    if (!catId) return 'Comercio Local';
    const match = categories.find((c) => c.id === catId);
    return match ? match.name : 'Comercio';
  };

  // If no posts match
  if (posts.length === 0) {
    return (
      <div className="reel-container-9-16 relative w-full sm:w-auto h-[calc(100dvh-60px)] sm:h-[calc(100dvh-76px)] sm:max-h-[860px] sm:aspect-[9/16] max-w-full mx-auto flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#021b58] to-[#040e28] text-white rounded-none sm:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-4 animate-pulse">
          <Search className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-white text-center">
          No hay anuncios con estos filtros
        </h3>
        <p className="text-xs text-blue-200/70 text-center max-w-xs mt-1 mb-5">
          Prueba buscando con otra palabra o restablece los filtros para ver todos los anuncios.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer"
            >
              Borrar búsqueda
            </button>
          )}
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 rounded-xl bg-[#007af7] hover:bg-[#0066d6] text-white text-xs font-bold transition shadow-lg cursor-pointer"
            >
              Restablecer todo
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="reel-container-9-16 relative w-full sm:w-auto h-[calc(100dvh-53px)] sm:h-[calc(100dvh-76px)] sm:max-h-[860px] sm:aspect-[9/16] max-w-full mx-auto bg-black rounded-none sm:rounded-3xl overflow-hidden shadow-2xl select-none ring-0 sm:ring-1 sm:ring-white/10">
      {/* Toast Notification when link is copied */}
      {copiedToast && (
        <div className="absolute top-16 inset-x-0 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top duration-200">
          <div className="bg-black/90 text-white px-4 py-2 rounded-full text-xs font-bold border border-white/20 shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>¡Enlace del anuncio copiado al portapapeles!</span>
          </div>
        </div>
      )}

      {/* Up / Down navigation arrows (hidden on touch, visible on desktop) */}
      <div className="hidden sm:flex flex-col gap-2 absolute left-3 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        <button
          type="button"
          disabled={activeIndex === 0}
          onClick={goToPrev}
          className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-lg"
          title="Anuncio anterior (Flecha Arriba)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={activeIndex >= feedItems.length - 1}
          onClick={goToNext}
          className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-lg"
          title="Siguiente anuncio (Flecha Abajo)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Vertical Pager Container (TikTok / Instagram 1-by-1 controlled touch transition) */}
      <div
        ref={containerRef}
        id="reel-feed-scroll-container"
        className="relative w-full h-full overflow-hidden select-none"
        style={{
          touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        tabIndex={0}
      >
        <div
          className="w-full h-full flex flex-col will-change-transform"
          style={{
            transform: `translate3d(0, calc(-${activeIndex * 100}% + ${dragOffset}px), 0)`,
            transition: isDragging
              ? 'none'
              : 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {feedItems.map((post, index) => {
            const isNear = Math.abs(index - activeIndex) <= 2;
            return (
              <div
                key={post.feedInstanceId || `${post.id}_${index}`}
                className="w-full h-full shrink-0 relative overflow-hidden"
                style={{
                  visibility: isNear ? 'visible' : 'hidden',
                }}
              >
                <ReelItem
                  post={post}
                  index={index}
                  isCurrentActive={index === activeIndex}
                  isPlaying={isPlaying}
                  isMuted={isMuted}
                  isFav={favorites.includes(post.id)}
                  currentCity={currentCity}
                  onTogglePlay={handleTogglePlay}
                  onToggleMute={handleToggleMute}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectPost={onSelectPost}
                  onSelectBusiness={onSelectBusiness}
                  onWhatsApp={handleWhatsApp}
                  onCall={handleCall}
                  onHowToGetThere={handleHowToGetThere}
                  onShare={handleShare}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* FIXED GLOBAL BOTTOM SEARCH BAR (Always mounted, zero lag, single DOM node outside scroll-snap) */}
      <div 
        className="absolute inset-x-0 bottom-0 z-30 pb-3 pt-3 px-3.5 sm:px-4 pointer-events-auto bg-gradient-to-t from-black via-black/85 to-transparent"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
      >
        <div className="relative flex items-center bg-black/85 border border-white/20 focus-within:border-cyan-400/80 rounded-2xl p-1.5 transition shadow-2xl ring-1 ring-white/10">
          <div className="pl-2.5 pr-1.5 flex items-center text-cyan-300 pointer-events-none">
            <Search className="w-4 h-4 drop-shadow-[0_1px_4px_rgba(0,180,216,0.6)]" />
          </div>

          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar en ${currentCity || 'Cajicá'} (promos, planes)...`}
            className="w-full bg-transparent text-xs text-white placeholder:text-blue-100/60 focus:outline-hidden py-1 px-1 font-medium"
            aria-label="Buscar planes o anuncios"
          />

          {/* Clear search or indicator */}
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
              className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/20 transition cursor-pointer mr-1 shrink-0"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] text-white/50 px-2 shrink-0 hidden xs:inline">
              {posts.length} {posts.length === 1 ? 'anuncio' : 'anuncios'}
            </span>
          )}

          {/* Filter shortcut icon next to search */}
          <button
            type="button"
            onClick={onOpenFilterModal}
            className={`p-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-[#007af7] text-white border-cyan-300'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
            title="Abrir filtros"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {activeFiltersCount > 0 && (
              <span className="text-[10px] font-black text-cyan-200">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Business Location Map Modal (Cómo llegar) */}
      {selectedMapPost && (
        <BusinessLocationMapModal
          isOpen={Boolean(selectedMapPost)}
          onClose={() => setSelectedMapPost(null)}
          business={{
            name: selectedMapPost.businessName,
            address: selectedMapPost.businessAddress || 'Ubicación local',
            city: selectedMapPost.businessCity || currentCity || 'Cajicá',
            sector: selectedMapPost.businessSector || 'Centro',
            coordinates: selectedMapPost.coordinates,
            logo: selectedMapPost.businessLogo || selectedMapPost.imageUrl,
            category: getCategoryName(selectedMapPost.categoryId),
            whatsapp: selectedMapPost.businessWhatsapp,
            phone: selectedMapPost.businessPhone,
            verified: true,
          }}
        />
      )}
    </div>
  );
};
