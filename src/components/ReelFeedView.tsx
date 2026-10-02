import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  preload?: 'auto' | 'metadata' | 'none';
  onTogglePlay: () => void;
  isNearActive?: boolean;
}

const ReelItemVideo: React.FC<ReelItemVideoProps> = ({
  src,
  poster,
  isCurrentActive,
  isPlaying,
  isMuted,
  preload = 'metadata',
  onTogglePlay,
  isNearActive = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFeedback, setShowFeedback] = useState<'play' | 'pause' | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Synchronize playback state with active and isPlaying flags
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isCurrentActive && isPlaying) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser blocked unmuted autoplay, retry muted
          if (!video.muted) {
            video.muted = true;
            video.play().catch(() => {});
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

  // Stop video and mute audio immediately when this reel becomes inactive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!isCurrentActive) {
      video.pause();
      video.muted = true;
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
      {/* Fallback poster while video loads or buffers to prevent black flash */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          loading={isCurrentActive || isNearActive ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        playsInline
        preload={preload}
        onLoadedData={() => setIsVideoLoaded(true)}
        className="w-full h-full object-cover select-none"
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
};

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
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [copiedToast, setCopiedToast] = useState(false);
  const [selectedMapPost, setSelectedMapPost] = useState<Post | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const viewedPostsRef = useRef<Set<string>>(new Set());
  const preloadedUrlsRef = useRef<Set<string>>(new Set());

  // Aggressively preload upcoming images in a sliding window (current - 1 to current + 4)
  useEffect(() => {
    if (!posts || posts.length === 0) return;
    const startIndex = Math.max(0, activeIndex - 1);
    const endIndex = Math.min(posts.length - 1, activeIndex + 4);

    for (let i = startIndex; i <= endIndex; i++) {
      const p = posts[i];
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
        }
      });
    }
  }, [activeIndex, posts]);

  // Track active slide with IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute('data-reel-index');
            if (indexAttr !== null) {
              const idx = parseInt(indexAttr, 10);
              setActiveIndex(idx);
              setIsPlaying(true);

              // Pause and silence all other videos immediately
              const allVideos = container.querySelectorAll('video');
              allVideos.forEach((v, vIdx) => {
                if (vIdx !== idx) {
                  v.pause();
                  v.muted = true;
                }
              });

              const post = posts[idx];
              if (post && !viewedPostsRef.current.has(post.id)) {
                viewedPostsRef.current.add(post.id);
                if (!post.id.startsWith('itinerary_')) {
                  trackInteraction(post.id, 'view');
                }
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.65,
      }
    );

    const items = container.querySelectorAll('.reel-item');
    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [posts, trackInteraction]);

  // Pause any background video whenever activeIndex changes
  useEffect(() => {
    setIsPlaying(true);
    const container = containerRef.current;
    if (!container) return;
    const allVideos = container.querySelectorAll('video');
    allVideos.forEach((v, vIdx) => {
      if (vIdx !== activeIndex) {
        v.pause();
        v.muted = true;
      }
    });
  }, [activeIndex]);

  // Keyboard navigation (ArrowUp, ArrowDown, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in search
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(Math.min(posts.length - 1, activeIndex + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(Math.max(0, activeIndex - 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, posts.length]);

  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const targetElement = container.querySelector(`[data-reel-index="${index}"]`) as HTMLElement;
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Double tap to like (TikTok signature interaction)
  const lastTapRef = useRef<number>(0);
  const handleMediaTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, post: Post) => {
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

      if (!favorites.includes(post.id)) {
        toggleFavorite(post.id);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      // Single tap can toggle play/pause for video
      if (post.videoUrl) {
        setIsPlaying((prev) => !prev);
      }
    }
  };

  const handleWhatsApp = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    trackInteraction(post.id, 'whatsapp');
    const waNumber = normalizeToColombianWa(post.businessWhatsapp || post.businessPhone);
    const postUrl = `${window.location.origin}/anuncio/${post.id}`;
    const text = `¡Hola ${post.businessName}! Vi su anuncio "${post.title}" en OleVeci y me gustaría más información:\n${postUrl}`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCall = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    trackInteraction(post.id, 'call');
    const phoneToCall = post.businessPhone || post.businessWhatsapp;
    if (!phoneToCall) return;
    const cleanCallable = phoneToCall.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanCallable}`;
  };

  const handleHowToGetThere = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    trackInteraction(post.id, 'maps');
    if (post.isPlan) {
      onSelectPost(post, 'map');
    } else {
      setSelectedMapPost(post);
    }
  };

  const handleShare = async (post: Post, e: React.MouseEvent) => {
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
        // User cancelled or fallback
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
  };

  const toggleDescription = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDescriptions((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

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
    <div className="reel-container-9-16 relative w-full sm:w-auto h-[calc(100dvh-56px)] sm:h-[calc(100dvh-76px)] sm:max-h-[860px] sm:aspect-[9/16] max-w-full mx-auto bg-black rounded-none sm:rounded-3xl overflow-hidden shadow-2xl select-none ring-1 ring-white/10">
      {/* Toast Notification when link is copied */}
      {copiedToast && (
        <div className="absolute top-16 inset-x-0 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top duration-200">
          <div className="bg-black/90 text-white px-4 py-2 rounded-full text-xs font-bold border border-white/20 shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>¡Enlace del anuncio copiado al portapapeles!</span>
          </div>
        </div>
      )}

      {/* Up / Down navigation arrows (hidden on touch, visible on desktop hover) */}
      <div className="hidden sm:flex flex-col gap-2 absolute left-3 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        <button
          type="button"
          disabled={activeIndex === 0}
          onClick={() => scrollToIndex(activeIndex - 1)}
          className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-lg"
          title="Anuncio anterior (Flecha Arriba)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={activeIndex === posts.length - 1}
          onClick={() => scrollToIndex(activeIndex + 1)}
          className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-lg"
          title="Siguiente anuncio (Flecha Abajo)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Vertical Snap Reel Feed Container */}
      <div
        ref={containerRef}
        id="reel-feed-scroll-container"
        className="relative w-full h-full snap-y snap-mandatory overflow-y-scroll overflow-x-hidden no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        tabIndex={0}
      >
        {posts.map((post, index) => {
          const isCurrentActive = index === activeIndex;
          const isFav = favorites.includes(post.id);
          const parsedVideo = parseVideoUrl(post.videoUrl);
          const hasVideo = Boolean(post.videoUrl);
          const isExpanded = Boolean(expandedDescriptions[post.id]);

          // Discount calculations
          const discountPercent =
            post.originalPrice && post.promotionalPrice && post.originalPrice > post.promotionalPrice
              ? Math.round(((post.originalPrice - post.promotionalPrice) / post.originalPrice) * 100)
              : null;

          return (
            <div
              key={post.id}
              data-reel-index={index}
              className="reel-item relative w-full h-full snap-start snap-always shrink-0 overflow-hidden bg-black flex flex-col justify-between transform-gpu"
              style={{ contain: 'layout paint', WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
            >
              {/* Media Layer (Image or Video) with ambient background */}
              <div
                className="absolute inset-0 z-0 overflow-hidden cursor-pointer"
                onClick={(e) => handleMediaTap(e, post)}
              >
                {post.isPlan && post.planStops && post.planStops.length > 0 ? (
                  // Multi-stop background layout matching the invitation card presentation (2 or 3 images)
                  <div className="relative w-full h-full bg-black overflow-hidden select-none">
                    <PlanBackgroundImages
                      posts={post.planStops}
                      bgLayout={post.planData?.bgLayout || 'horizontal'}
                      theme={post.planData?.theme}
                    />
                  </div>
                ) : hasVideo ? (
                  parsedVideo.isIframe ? (
                    // Iframe video (Instagram / TikTok / YouTube embed) - only mounted if active
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
                          loading={Math.abs(index - activeIndex) <= 2 ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                      </div>
                    )
                  ) : (
                    // Direct HTML5 Video with smart active window (only active ± 1 mounted)
                    Math.abs(index - activeIndex) <= 1 ? (
                      <ReelItemVideo
                        src={parsedVideo.directUrl || post.videoUrl || ''}
                        poster={getReelPosterUrl(post.imageUrl)}
                        isCurrentActive={isCurrentActive}
                        isNearActive={Math.abs(index - activeIndex) <= 1}
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        preload={isCurrentActive ? 'auto' : 'metadata'}
                        onTogglePlay={() => setIsPlaying((prev) => !prev)}
                      />
                    ) : (
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <img
                          src={getReelPosterUrl(post.imageUrl)}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          loading={Math.abs(index - activeIndex) <= 2 ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                      </div>
                    )
                  )
                ) : (
                  // Crisp image media with instant preloading, custom framing, and zero-delay rendering
                  <div className="relative w-full h-full bg-[#0a0f1d] flex items-center justify-center overflow-hidden select-none">
                    {/* Dark placeholder gradient behind image */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0e1628] via-[#090d18] to-black pointer-events-none" />

                    {/* Crisp foreground image */}
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
                      loading={Math.abs(index - activeIndex) <= 2 ? 'eager' : 'lazy'}
                      decoding={Math.abs(index - activeIndex) <= 1 ? 'sync' : 'async'}
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

                {/* Location Badge on Top-Right */}
                <div className="absolute top-3.5 sm:top-4 right-3.5 z-20 flex items-center gap-2 pointer-events-auto">
                  {hasVideo && isCurrentActive && (
                    <>
                      {/* Play / Pause Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlaying((prev) => !prev);
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
                          setIsMuted((prev) => !prev);
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

              {/* RIGHT-HAND ACTION RAIL (WhatsApp, Llamar, Cómo llegar, Compartir y Negocio mejorado) */}
              <div
                className="absolute right-2.5 sm:right-3.5 bottom-16 sm:bottom-18 z-30 flex flex-col items-center gap-2.5 sm:gap-3 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Icono del Negocio o Itinerario Mejorado */}
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
                      loading={Math.abs(index - activeIndex) <= 2 ? 'eager' : 'lazy'}
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
                    onClick={(e) => handleWhatsApp(post, e)}
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
                    onClick={(e) => handleCall(post, e)}
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
                  onClick={(e) => handleHowToGetThere(post, e)}
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
                  onClick={(e) => handleShare(post, e)}
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
                {/* Text Info Section: Business, Title, Price, Validity */}
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
                          onClick={(e) => toggleDescription(post.id, e)}
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
        })}
      </div>

      {/* FIXED GLOBAL BOTTOM SEARCH BAR (Always mounted, zero lag, single DOM node outside scroll-snap) */}
      <div className="absolute inset-x-0 bottom-0 z-30 pb-3 pt-3 px-3.5 sm:px-4 pointer-events-auto bg-gradient-to-t from-black via-black/85 to-transparent">
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
