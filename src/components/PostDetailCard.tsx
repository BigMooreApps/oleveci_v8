import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../types';
import { useApp } from '../context/AppContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import {
  X,
  Clock,
  Calendar,
  Store,
  Play,
  ExternalLink,
  Film,
} from 'lucide-react';
import { BusinessLocationMapModal } from './BusinessLocationMapModal';
import { parseVideoUrl } from '../utils/videoHelper';

export interface PostCardColorTheme {
  id?: string;
  name?: string;
  isDark?: boolean;
  cardBg?: string;
  headerBg?: string;
  bodyBg?: string;
  footerBg?: string;
  borderColor?: string;
  accentText?: string;
  badgeBg?: string;
  headerTextColor?: string;
  headerSubtextColor?: string;
  titleColor?: string;
  descColor?: string;
  profileButtonBg?: string;
  actionButtonBg?: string;
}

export interface PostDetailCardProps {
  post: Post;
  onClose?: () => void;
  onSelectBusiness?: (businessId: string) => void;
  isBusinessSection?: boolean;
  onEditPost?: (post: Post) => void;
  fromBusinessProfile?: boolean;
  onSelectPost?: (post: Post) => void;
  onBackToProfile?: (businessId: string) => void;
  showCloseButton?: boolean;
  className?: string;
  colorTheme?: PostCardColorTheme;
}

export const PostDetailCard: React.FC<PostDetailCardProps> = ({
  post,
  onClose,
  onSelectBusiness,
  isBusinessSection,
  fromBusinessProfile = false,
  onSelectPost,
  onBackToProfile,
  showCloseButton = false,
  className = '',
  colorTheme,
}) => {
  const {
    businesses,
    posts,
    getDistanceKm,
    trackInteraction,
    isPostActive,
    currentRole,
  } = useApp();

  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false);

  const isBusinessMode = isBusinessSection !== undefined
    ? isBusinessSection
    : currentRole === 'business';

  const business = businesses.find((b) => b.id === post.businessId);
  const distance = getDistanceKm(post.coordinates);

  // Other active posts by this business
  const otherPosts = posts.filter(
    (p) => p.businessId === post.businessId && p.id !== post.id && isPostActive(p)
  );

  const formatCOPDisplay = (num?: number) => {
    if (num === undefined || num === null) return null;
    return `$ ${num.toLocaleString('es-CO')}`;
  };

  const discountPercent =
    post.originalPrice && post.promotionalPrice && post.originalPrice > post.promotionalPrice
      ? Math.round(((post.originalPrice - post.promotionalPrice) / post.originalPrice) * 100)
      : null;

  const isCapacityBadge =
    post.expiryLabel &&
    (post.expiryLabel.toLowerCase().includes('cupo') ||
      post.expiryLabel.toLowerCase().includes('persona') ||
      post.expiryLabel.toLowerCase().includes('disponible') ||
      post.expiryLabel.toLowerCase().includes('abierto'));

  const isCalendarBadge =
    post.validitySchedule?.mode === 'days_of_week' ||
    post.validitySchedule?.mode === 'specific_date' ||
    Boolean(
      post.expiryLabel &&
      (post.expiryLabel.toLowerCase().includes('lunes') ||
        post.expiryLabel.toLowerCase().includes('martes') ||
        post.expiryLabel.toLowerCase().includes('miércoles') ||
        post.expiryLabel.toLowerCase().includes('jueves') ||
        post.expiryLabel.toLowerCase().includes('viernes') ||
        post.expiryLabel.toLowerCase().includes('sábado') ||
        post.expiryLabel.toLowerCase().includes('domingo') ||
        post.expiryLabel.toLowerCase().includes('semana') ||
        post.expiryLabel.toLowerCase().includes('hasta el'))
    );

  const businessLogo = business?.logo || post.businessLogo;
  const parsedVideo = parseVideoUrl(post.videoUrl);
  const isVerticalVideo = Boolean(parsedVideo.isVertical);

  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 380, height: 238 });

  useEffect(() => {
    if (!mediaContainerRef.current) return;
    const updateDims = () => {
      if (mediaContainerRef.current) {
        const rect = mediaContainerRef.current.getBoundingClientRect();
        if (rect.height > 50) {
          setContainerDimensions({ width: rect.width, height: rect.height });
        }
      }
    };
    updateDims();
    const observer = new ResizeObserver(updateDims);
    observer.observe(mediaContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const isTikTok = parsedVideo.platform === 'tiktok';
  const isInstagram = parsedVideo.platform === 'instagram';
  const isShorts = parsedVideo.platform === 'youtube' && parsedVideo.isVertical;
  const isFacebookReel = parsedVideo.platform === 'facebook' && parsedVideo.isVertical;
  const isVerticalEmbed = isTikTok || isInstagram || isShorts || isFacebookReel;

  const nativeW = isTikTok ? 325 : isInstagram ? 328 : isShorts ? 315 : 320;
  const nativeH = isTikTok ? 575 : isInstagram ? 520 : isShorts ? 560 : 540;

  const fitScale = containerDimensions.height / nativeH;
  const coverScale = containerDimensions.width / nativeW;
  const baseScale = post.imageFit === 'cover' ? coverScale : fitScale;
  const finalScale = baseScale * (post.imageScale || 1);

  const hasWhatsApp = Boolean(post.businessWhatsapp && post.businessWhatsapp.trim());
  const rawWhatsapp = (post.businessWhatsapp || '').replace(/\D/g, '');
  const cleanWhatsapp = rawWhatsapp.length === 10 && rawWhatsapp.startsWith('3') ? `57${rawWhatsapp}` : rawWhatsapp;

  const hasPhone = Boolean(
    post.businessPhone && post.businessPhone.trim() && post.businessPhone !== 'No registrado'
  );
  const callablePhone = hasPhone ? post.businessPhone : (hasWhatsApp ? post.businessWhatsapp : null);

  const hasLocation = Boolean(
    (post.businessAddress && post.businessAddress.trim()) ||
    (post.coordinates?.lat && post.coordinates?.lng)
  );

  const handleWhatsApp = () => {
    if (!hasWhatsApp) return;
    trackInteraction(post.id, 'whatsapp');
    const origin = window.location.origin;
    const postUrl = `${origin}/anuncio/${post.id}`;
    const msg = `Hola, quisiera más información sobre esta publicación:\n${postUrl}`;
    window.open(`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleMaps = () => {
    if (!hasLocation) return;
    trackInteraction(post.id, 'maps');
    setIsLocationMapOpen(true);
  };

  const handleCall = () => {
    if (!callablePhone) return;
    trackInteraction(post.id, 'call');
    const cleanCallable = callablePhone.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanCallable}`;
  };

  const handleShare = async () => {
    trackInteraction(post.id, 'share');
    const origin = window.location.origin;
    const postUrl = `${origin}/anuncio/${post.id}`;
    const priceText = post.promotionalPrice
      ? `\n💰 Precio: $${post.promotionalPrice.toLocaleString('es-CO')} COP`
      : post.originalPrice
      ? `\n💰 Precio: $${post.originalPrice.toLocaleString('es-CO')} COP`
      : '';
    const descText = post.description ? `\n📝 ${post.description}` : '';
    const shareLead = `¡Mira esta publicación en OleVeci! ✨\n📍 ${post.businessName} - ${post.title}${priceText}${descText}`;
    const shareMessage = `${shareLead}\n\n👉 Míralo aquí: ${postUrl}`;

    if (navigator.share) {
      try {
        let filesToShare: File[] | undefined;
        try {
          const res = await fetch(`/api/og/card/${post.id}.png`);
          if (res.ok) {
            const blob = await res.blob();
            const file = new File([blob], `anuncio-${post.id}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              filesToShare = [file];
            }
          }
        } catch {}

        if (filesToShare && filesToShare.length > 0) {
          await navigator.share({
            files: filesToShare,
            title: post.title,
            text: shareMessage,
          });
          return;
        }

        await navigator.share({
          title: post.title,
          text: shareLead,
          url: postUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const renderBusinessAvatar = () => {
    if (post.businessId === 'biz_powerfit') {
      return (
        <div className="flex flex-col items-center justify-center text-white text-center">
          <svg
            className="w-7 h-7 text-sky-400"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="7" r="3" />
            <path d="M5.5 10c0-1 1-2 2.5-2h8c1.5 0 2.5 1 2.5 2v1.5c0 2-2 3.5-6 3.5s-6-1.5-6-3.5V10z" />
            <path d="M12 15v6M9 21h6" />
          </svg>
          <span className="text-[10px] font-black tracking-tighter leading-none mt-0.5 text-white">
            PowerFit
          </span>
        </div>
      );
    }

    if (businessLogo) {
      return (
        <img
          src={businessLogo}
          alt={post.businessName}
          referrerPolicy="no-referrer"
          className="w-full h-full rounded-full object-cover"
        />
      );
    }

    return (
      <div className="flex items-center justify-center w-full h-full text-white font-black text-xs uppercase">
        {post.businessName.slice(0, 2)}
      </div>
    );
  };

  return (
    <>
      <div className={`w-full flex flex-col ${colorTheme?.cardBg || 'bg-white'} ${className}`}>
        {/* 1. Header: Merchant Logo, Name, Location Pin, Bookmark & Close matching Explorar */}
        <header className={`px-4 py-3 sm:py-3.5 flex items-center justify-between border-b ${colorTheme?.headerBg || 'border-slate-100 bg-white'} relative z-20 shrink-0`}>
          <div
            onClick={() => {
              if (!isBusinessMode && onSelectBusiness) {
                if (onClose) onClose();
                onSelectBusiness(post.businessId);
              }
            }}
            className={`flex items-center gap-2.5 min-w-0 ${!isBusinessMode && onSelectBusiness ? 'hover:opacity-90 transition cursor-pointer' : ''}`}
          >
            {/* Circular Badge with white ring & deep dark navy background */}
            <div className="relative rounded-full bg-[#081B38] p-[2.5px] shadow-md shrink-0 flex items-center justify-center ring-4 ring-white z-30 w-12 h-12 sm:w-14 sm:h-14">
              {renderBusinessAvatar()}
            </div>

            <div className="flex flex-col min-w-0">
              <h1
                className={`text-[15px] sm:text-[17px] font-extrabold tracking-tight leading-tight truncate ${
                  colorTheme?.headerTextColor ? '' : 'text-[#0C1D37]'
                }`}
                style={{ color: colorTheme?.headerTextColor || 'rgb(8, 28, 68)' }}
              >
                {post.businessName}
              </h1>
              <div
                onClick={(e) => {
                  if (hasLocation) {
                    e.stopPropagation();
                    handleMaps();
                  }
                }}
                className={`flex items-center gap-1 text-xs font-medium mt-0.5 truncate ${
                  colorTheme?.headerSubtextColor || 'text-slate-500'
                } ${hasLocation ? 'hover:underline cursor-pointer' : ''}`}
                title={hasLocation ? 'Cómo llegar y ver ubicación' : undefined}
              >
                <svg
                  className={`w-3.5 h-3.5 shrink-0 ${colorTheme?.accentText || 'text-blue-600'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    fillRule="evenodd"
                  />
                </svg>
                <span className="truncate">
                  {post.businessSector || 'Cajicá'} <span className="mx-0.5">·</span>{' '}
                  {distance !== null ? `${distance} km` : '0.9 km'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!isBusinessMode && (fromBusinessProfile && onBackToProfile ? (
              <button
                id="modal-btn-back-to-business"
                onClick={() => {
                  if (onClose) onClose();
                  onBackToProfile(post.businessId);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition cursor-pointer shadow-2xs ${
                  colorTheme?.profileButtonBg ||
                  'text-[#007af7] bg-blue-50 hover:bg-blue-100 border border-blue-200/60'
                }`}
                title="Volver al perfil del negocio"
                aria-label="Volver al perfil del negocio"
                type="button"
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Volver al perfil</span>
              </button>
            ) : onSelectBusiness ? (
              <button
                id="modal-btn-view-business"
                onClick={() => {
                  if (onClose) onClose();
                  onSelectBusiness(post.businessId);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition cursor-pointer shadow-2xs ${
                  colorTheme?.profileButtonBg ||
                  'text-[#007af7] bg-blue-50 hover:bg-blue-100 border border-blue-200/60'
                }`}
                title="Ver perfil del negocio"
                aria-label="Ver perfil del negocio"
                type="button"
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Ver perfil</span>
              </button>
            ) : null)}
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 transition-all duration-200 p-2 rounded-full hover:bg-slate-100 active:scale-90 cursor-pointer"
                aria-label="Cerrar"
                title="Cerrar"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
          {/* 2. Main Media Container with Explorar Swoosh, 3D Discount Badge & Expiry Pill */}
          <div
            ref={mediaContainerRef}
            className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-inner select-none flex items-center justify-center"
            style={{ aspectRatio: '16 / 10' }}
          >
            {post.videoUrl ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {parsedVideo.isIframe ? (
                  isVerticalEmbed ? (
                    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
                      {/* Ambient backdrop */}
                      {post.imageUrl && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
                          <img
                            src={post.imageUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover blur-2xl scale-120 opacity-40"
                          />
                          <div className="absolute inset-0 bg-black/50" />
                        </div>
                      )}
                      {/* Scaled vertical embed container fitting 100% into height */}
                      <div
                        className="relative flex items-center justify-center select-none shadow-2xl rounded-xl overflow-hidden z-10"
                        style={{
                          width: `${nativeW}px`,
                          height: `${nativeH}px`,
                          transform: `scale(${finalScale})`,
                          transformOrigin: 'center center',
                        }}
                      >
                        <iframe
                          src={parsedVideo.embedUrl}
                          scrolling="no"
                          className="w-full h-full border-0 select-none"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          title={post.title}
                        />
                      </div>
                      {/* Floating platform link button */}
                      <a
                        href={post.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2.5 right-2.5 z-20 px-3 py-1.5 rounded-xl bg-black/85 hover:bg-black text-white text-[11px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg transition active:scale-95"
                      >
                        <span>Ver en {parsedVideo.platformName}</span>
                        <ExternalLink className="w-3 h-3 text-sky-400" />
                      </a>
                    </div>
                  ) : (
                    <>
                      <iframe
                        src={parsedVideo.embedUrl}
                        scrolling="no"
                        className="w-full h-full border-0 relative z-1"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={post.title}
                      />
                    </>
                  )
                ) : (
                  <>
                    {post.imageFit === 'contain' && post.imageUrl && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
                        <img
                          src={post.imageUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover blur-2xl scale-120 opacity-40"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                      </div>
                    )}
                    <video
                      src={post.videoUrl}
                      poster={post.imageUrl}
                      controls
                      playsInline
                      autoPlay
                      loop
                      className={`w-full h-full relative z-1 ${
                        post.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                      }`}
                      style={{
                        objectPosition: post.imagePosition
                          ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                          : '50% 50%',
                        transform: post.imageScale && post.imageScale !== 1 ? `scale(${post.imageScale})` : undefined,
                      }}
                    />
                  </>
                )}
              </div>
            ) : post.imageUrl ? (
              <>
                {/* Ambient backdrop when contained or scaled down to fill predefined space */}
                {(post.imageFit === 'contain' || (post.imageScale && post.imageScale < 1)) && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
                    <img
                      src={post.imageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover blur-2xl scale-120 opacity-40"
                      style={{
                        objectPosition: post.imagePosition
                          ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                          : '50% 50%',
                        filter: post.imageFilter && post.imageFilter !== 'none' ? `${post.imageFilter} blur(24px)` : 'blur(24px)',
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </div>
                )}
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full relative z-1 ${
                    post.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                  }`}
                  style={{
                    objectPosition: post.imagePosition
                      ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                      : '50% 50%',
                    transform: post.imageScale && post.imageScale !== 1 ? `scale(${post.imageScale})` : undefined,
                    transformOrigin: post.imagePosition
                      ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                      : '50% 50%',
                    filter: post.imageFilter && post.imageFilter !== 'none' ? post.imageFilter : undefined,
                  }}
                />
              </>
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-sm">
                Sin foto disponible
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />

            {/* Top-Right Decorative Curve / Swoosh Gradient matching Explorar (hidden on videos for a clean player view) */}
            {!post.videoUrl && (
              <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none select-none z-10 overflow-hidden rounded-tr-2xl">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id={`modalTopCornerGrad-${post.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0060E6" />
                      <stop offset="40%" stopColor="#0099FF" />
                      <stop offset="75%" stopColor="#00CFFF" />
                      <stop offset="100%" stopColor="#1BE0F8" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 0 C 45 0, 80 18, 100 68 L 100 0 Z" fill={`url(#modalTopCornerGrad-${post.id})`} />
                </svg>
              </div>
            )}

            {/* 3D Diagonal Discount Badge with Radiant Sunburst Spark Rays */}
            {discountPercent ? (
              <div
                className="absolute left-3 top-6 sm:top-6.5 select-none z-20"
                style={{
                  display: 'inline-flex',
                  transform: 'rotate(-12deg) scale(0.80)',
                  transformOrigin: 'top left',
                }}
              >
                <div className="relative flex items-center">
                  <div
                    className="relative z-10 text-white font-black text-base sm:text-lg px-3 py-1.5 tracking-tight rounded-full flex items-center justify-center leading-none"
                    style={{
                      background: 'linear-gradient(rgb(255, 179, 0) 0%, rgb(255, 145, 0) 35%, rgb(240, 80, 0) 70%, rgb(230, 57, 0) 100%)',
                      boxShadow: 'rgba(230, 60, 0, 0.52) 0px 4px 16px, rgba(0, 0, 0, 0.22) 0px 2px 6px, rgba(255, 255, 255, 0.65) 0px 1.5px 1.5px inset, rgba(180, 30, 0, 0.4) 0px -1.5px 2px inset',
                      textShadow: 'rgba(150, 20, 0, 0.45) 0px 1px 2px',
                    }}
                  >
                    -{discountPercent}%
                  </div>
                  <div className="absolute -top-1.5 -right-1 pointer-events-none w-5 h-5 flex items-center justify-center z-0">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 32 32" fill="none" stroke="#FFB300" strokeLinecap="round">
                      <line x1="15" y1="16" x2="24" y2="6" strokeWidth="2.8" />
                      <line x1="18" y1="20" x2="30" y2="18" strokeWidth="2.8" />
                      <line x1="11" y1="14" x2="13" y2="3" strokeWidth="2.8" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Expiry / Availability / Schedule Pill */}
            {post.expiryLabel ? (
              post.videoUrl ? (
                /* Sleek, professional glassmorphism HUD badge for videos (non-invasive, discreet top-right) */
                <div className="absolute top-2.5 right-2.5 z-20 bg-black/60 backdrop-blur-md text-white/95 border border-white/20 shadow-md text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 max-w-[70%] select-none transition-all">
                  {isCapacityBadge ? (
                    <svg className="w-3 h-3 text-teal-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  ) : isCalendarBadge ? (
                    <Calendar className="w-3 h-3 text-teal-300 shrink-0" />
                  ) : (
                    <Clock className="w-3 h-3 text-teal-300 shrink-0" />
                  )}
                  <span className="truncate">{post.expiryLabel}</span>
                </div>
              ) : (
                /* Classic Bottom-Left Pill for static images */
                <div className="absolute bottom-3 left-3 z-20 bg-gradient-to-r from-teal-500 to-cyan-500/95 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md backdrop-blur-sm border border-white/25 max-w-[85%]">
                  {isCapacityBadge ? (
                    <svg className="w-4 h-4 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  ) : isCalendarBadge ? (
                    <Calendar className="w-3.5 h-3.5 text-white shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-white shrink-0" />
                  )}
                  <span className="truncate">{post.expiryLabel}</span>
                </div>
              )
            ) : null}
          </div>

          {/* 3. Title, Description & Explorar Pricing Pill */}
          <div>
            <h2
              className={`text-xl sm:text-2xl font-extrabold leading-tight tracking-tight ${
                colorTheme?.titleColor || 'text-[#0A1D3C]'
              }`}
              style={{ color: colorTheme?.titleColor ? undefined : 'rgb(8, 28, 68)' }}
            >
              {post.title}
            </h2>

            <p
              className={`text-sm sm:text-base leading-relaxed mt-2 whitespace-pre-line ${
                colorTheme?.descColor || 'text-slate-600'
              }`}
            >
              {post.description}
            </p>

            {/* Pricing Pill Row aligned to the right */}
            <div className="relative flex items-center justify-end flex-wrap gap-2.5 sm:gap-3 mt-2.5 pt-0.5 pb-1">
              {post.promotionalPrice ? (
                <>
                  {post.originalPrice && (
                    <div
                      className={`relative z-10 text-sm sm:text-base font-bold line-through decoration-2 ${
                        colorTheme?.isDark ? 'text-white/40 decoration-white/40' : 'text-slate-400 decoration-slate-400/80'
                      }`}
                    >
                      {formatCOPDisplay(post.originalPrice)}
                    </div>
                  )}
                  <div
                    className="relative z-10 text-white font-extrabold text-lg sm:text-xl px-4.5 py-1.5 rounded-full flex items-center justify-center tracking-tight select-none shadow-md"
                    style={{
                      background: 'linear-gradient(rgb(1, 117, 234) 0%, rgb(0, 87, 220) 60%, rgb(0, 68, 184) 100%)',
                      boxShadow: 'rgba(255, 255, 255, 0.4) 0px 1px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px 2px inset, rgba(0, 87, 220, 0.35) 0px 4px 12px',
                      textShadow: 'rgba(0, 20, 80, 0.2) 0px 1px 1px',
                    }}
                  >
                    {formatCOPDisplay(post.promotionalPrice)}
                  </div>
                </>
              ) : post.originalPrice ? (
                <div
                  className="relative z-10 text-white font-extrabold text-lg sm:text-xl px-4.5 py-1.5 rounded-full flex items-center justify-center tracking-tight select-none shadow-md"
                  style={{
                    background: 'linear-gradient(rgb(1, 117, 234) 0%, rgb(0, 87, 220) 60%, rgb(0, 68, 184) 100%)',
                    boxShadow: 'rgba(255, 255, 255, 0.4) 0px 1px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px 2px inset, rgba(0, 87, 220, 0.35) 0px 4px 12px',
                    textShadow: 'rgba(0, 20, 80, 0.2) 0px 1px 1px',
                  }}
                >
                  {formatCOPDisplay(post.originalPrice)}
                </div>
              ) : (
                <div className="relative z-10 text-emerald-800 bg-emerald-50 border border-emerald-200 text-xs sm:text-sm px-3.5 py-1.5 font-bold rounded-full">
                  Consultar precio
                </div>
              )}
            </div>
          </div>

          {/* More offers from this merchant (Only shown when entering via the business profile, NOT when exploring) */}
          {!isBusinessMode && fromBusinessProfile && otherPosts.length > 0 && (
            <div className="pt-2">
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${colorTheme?.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                Otras publicaciones de {post.businessName}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {otherPosts.map((op) => (
                  <div
                    key={op.id}
                    onClick={() => {
                      if (onSelectPost) {
                        onSelectPost(op);
                      } else if (onClose) {
                        onClose();
                      }
                      setTimeout(() => trackInteraction(op.id, 'view'), 50);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition text-left ${
                      colorTheme?.isDark
                        ? 'border-white/15 bg-white/[0.08] hover:border-white/30'
                        : 'border-slate-200 bg-white hover:border-[#007af7]/50'
                    }`}
                  >
                    {op.imageUrl ? (
                      <img
                        src={op.imageUrl}
                        alt={op.title}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-16/10 rounded-lg object-cover mb-1.5"
                      />
                    ) : (
                      <div className="w-full aspect-16/10 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 mb-1.5">
                        Sin foto
                      </div>
                    )}
                    <h5 className={`text-xs font-bold line-clamp-1 ${colorTheme?.isDark ? 'text-white' : 'text-[#041f5e]'}`}>{op.title}</h5>
                    <span className={`text-xs font-bold ${colorTheme?.accentText || 'text-[#007af7]'}`}>
                      {formatCOPDisplay(op.promotionalPrice || op.originalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Contact Action Buttons Fixed at the Bottom (WhatsApp, Phone Call, Location Map, Share) */}
        <div className={`p-3 sm:p-3.5 border-t ${colorTheme?.footerBg || 'border-slate-100 bg-white'} shrink-0`}>
          <div className="grid grid-cols-4 gap-2">
            <button
              id={`modal-btn-wa-${post.id}`}
              aria-label="Contactar por WhatsApp"
              onClick={handleWhatsApp}
              disabled={!hasWhatsApp}
              className={`h-12 rounded-2xl flex items-center justify-center text-white transition-all duration-200 ${
                hasWhatsApp
                  ? 'bg-[#25D366] hover:bg-[#20bd5a] hover:scale-105 active:scale-95 shadow-sm shadow-emerald-500/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              type="button"
              title={hasWhatsApp ? 'Contactar por WhatsApp' : 'Sin WhatsApp'}
            >
              <WhatsAppIcon className="w-6 h-6 fill-white" />
            </button>

            <button
              id={`modal-btn-call-${post.id}`}
              aria-label="Llamar al comercio"
              onClick={handleCall}
              disabled={!callablePhone}
              className={`h-12 rounded-2xl flex items-center justify-center transition-all duration-200 action-btn-shadow ${
                callablePhone
                  ? colorTheme?.actionButtonBg || 'bg-[#EAF2FC] hover:bg-[#d6e7fc] hover:scale-105 active:scale-95 text-[#0A62F4] cursor-pointer'
                  : colorTheme?.isDark ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              type="button"
              title={callablePhone ? `Llamar a ${post.businessName}` : 'Sin teléfono'}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58.11.34.03.73-.25 1.01l-2.2 2.2z" />
              </svg>
            </button>

            <button
              id={`modal-btn-maps-${post.id}`}
              aria-label="Cómo llegar y ver ubicación"
              onClick={handleMaps}
              disabled={!hasLocation}
              className={`h-12 rounded-2xl flex items-center justify-center transition-all duration-200 action-btn-shadow ${
                hasLocation
                  ? colorTheme?.actionButtonBg || 'bg-[#EAF2FC] hover:bg-[#d6e7fc] hover:scale-105 active:scale-95 text-[#0A62F4] cursor-pointer'
                  : colorTheme?.isDark ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              type="button"
              title={hasLocation ? 'Cómo llegar y ver ubicación' : 'Sin ubicación'}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </button>

            <button
              id={`modal-btn-share-${post.id}`}
              aria-label="Compartir oferta"
              onClick={handleShare}
              className={`h-12 rounded-2xl transition-all duration-200 flex items-center justify-center action-btn-shadow cursor-pointer ${
                colorTheme?.actionButtonBg ||
                'bg-[#EAF2FC] hover:bg-[#d6e7fc] hover:scale-105 active:scale-95 text-[#0A62F4]'
              }`}
              type="button"
              title="Compartir oferta"
            >
              <svg
                className="w-5 h-5 fill-none stroke-current"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.3"
                viewBox="0 0 24 24"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isLocationMapOpen && (
        <BusinessLocationMapModal
          isOpen={true}
          onClose={() => setIsLocationMapOpen(false)}
          business={{
            name: post.businessName || business?.name || '',
            address: post.businessAddress || business?.address || '',
            city: post.businessCity || business?.city || 'Cajicá',
            sector: post.businessSector || business?.sector || 'Centro',
            coordinates: post.coordinates || business?.coordinates,
            logo: businessLogo || business?.logo,
            category: post.category || business?.category,
            subCategory: post.subCategory || business?.subCategory,
            whatsapp: post.businessWhatsapp || business?.whatsapp,
            phone: post.businessPhone || business?.phone,
            verified: business?.verified ?? true,
          }}
        />
      )}
    </>
  );
};
