import React from 'react';
import { motion } from 'motion/react';
import { Post } from '../types';
import { useApp } from '../context/AppContext';
import { Clock, Calendar, Play, Film } from 'lucide-react';
import { parseVideoUrl } from '../utils/videoHelper';
import { getFeedCardImageUrl, getMobileCardImageUrl, getBlurBackdropUrl } from '../utils/imageOptimization';

interface PostCardProps {
  post: Post;
  onSelectPost: (post: Post) => void;
  onSelectBusiness?: (businessId: string) => void;
  compact?: boolean;
  viewMode?: 'grid' | 'list';
  isFav?: boolean;
  onToggleFavorite?: (postId: string) => void;
  className?: string;
  cardVariant?: 'default' | 'hero' | 'tall';
  priority?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelectPost,
  onSelectBusiness,
  compact,
  viewMode,
  isFav: propIsFav,
  onToggleFavorite: propToggleFavorite,
  className = '',
  cardVariant = 'default',
  priority = false,
}) => {
  const {
    trackInteraction,
  } = useApp();

  const isGrid = viewMode === 'grid' || compact;
  const isCompact = Boolean(compact);

  // Discount percentage calculation
  const discountPercent =
    post.originalPrice && post.promotionalPrice && post.originalPrice > post.promotionalPrice
      ? Math.round(((post.originalPrice - post.promotionalPrice) / post.originalPrice) * 100)
      : null;

  // Check if badge is people/capacity related or time related
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

  const parsedVideo = parseVideoUrl(post.videoUrl);

  const handleCardClick = () => {
    trackInteraction(post.id, 'view');
    onSelectPost(post);
  };

  // Dedicated layout for Business Profile Modal (compact=true)
  // Reorganized to prevent visual crowding ("amontonamiento"):
  // - Removes redundant business header (since user is already inside that business profile)
  // - Gives the image generous breathing room with full-bleed top media
  // - Places discount and bookmark neatly in top corners
  // - Clean schedule/expiry pill at bottom of image
  // - Clear title, description, price badge and proportional CTA button
  if (isCompact) {
    return (
      <motion.article
        id={`post-card-compact-${post.id}`}
        onClick={handleCardClick}
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 380, damping: 25 }}
        className="group w-full bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md flex flex-col overflow-hidden transition-all duration-300 cursor-pointer select-none"
      >
        {/* Top Media Container */}
        <div className="relative w-full h-32 sm:h-36 bg-slate-100 overflow-hidden select-none">
          {post.videoUrl ? (
            <div className="relative w-full h-full bg-black">
              {parsedVideo.isIframe ? (
                (post.imageUrl || parsedVideo.defaultThumbnail) ? (
                  <img
                    src={getFeedCardImageUrl(post.imageUrl || parsedVideo.defaultThumbnail)}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <iframe
                    src={parsedVideo.embedUrl}
                    className="w-full h-full border-0 pointer-events-none"
                    title={post.title}
                  />
                )
              ) : (
                <video
                  src={post.videoUrl}
                  poster={getFeedCardImageUrl(post.imageUrl)}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold border border-white/20 flex items-center gap-1">
                <Play className="w-2 h-2 fill-white text-white" />
                <span>{parsedVideo.platformName !== 'Directo' ? parsedVideo.platformName : 'Video'}</span>
              </div>
            </div>
          ) : post.imageUrl ? (
            <>
              {/* Ambient backdrop when contain */}
              {(post.imageFit === 'contain' || (post.imageScale && post.imageScale < 1)) && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
                  <img
                    alt=""
                    className="w-full h-full object-cover blur-xl scale-125 opacity-40"
                    style={{
                      objectPosition: post.imagePosition
                        ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                        : '50% 50%',
                    }}
                    src={getBlurBackdropUrl(post.imageUrl)}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>
              )}
              <img
                alt={post.title}
                className={`w-full h-full transform group-hover:scale-105 transition-transform duration-500 ease-out relative z-1 ${
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
                src={getMobileCardImageUrl(post.imageUrl, 380, 70)}
                referrerPolicy="no-referrer"
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={priority ? 'high' : 'auto'}
              />
            </>
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
              Sin foto
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Top-Left Discount Badge */}
          {discountPercent ? (
            <div className="absolute top-2 left-2 z-20">
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-black text-white flex items-center justify-center tracking-tight shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #ff9100 0%, #f05000 100%)',
                }}
              >
                -{discountPercent}%
              </span>
            </div>
          ) : null}

          {/* Bottom-Left Expiry / Availability Pill */}
          {post.expiryLabel ? (
            <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center gap-1 text-[9.5px] font-bold text-white bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-full w-fit max-w-[92%] border border-white/20">
              {isCapacityBadge ? (
                <svg className="w-3 h-3 text-teal-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              ) : isCalendarBadge ? (
                <Calendar className="w-3 h-3 text-sky-300 shrink-0" />
              ) : (
                <Clock className="w-3 h-3 text-amber-300 shrink-0" />
              )}
              <span className="truncate">{post.expiryLabel}</span>
            </div>
          ) : null}
        </div>

        {/* Content Body: Title and Description */}
        <div className="p-2.5 sm:p-3 flex flex-col flex-grow justify-start">
          <h3 className="text-xs sm:text-[13px] font-extrabold text-[#0C1D37] group-hover:text-[#007af7] leading-snug line-clamp-2 transition-colors">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-2 mt-1 leading-tight">
              {post.description}
            </p>
          )}
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      id={`post-card-${post.id}`}
      onClick={handleCardClick}
      data-purpose="gym-promotion-card"
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 380, damping: 25 }}
      className={`group w-full ${className ? className : isCompact ? 'max-w-none' : 'max-w-[420px]'} bg-white ${
        isCompact
          ? 'rounded-[16px] sm:rounded-[20px] p-2 sm:p-2.5 pb-2.5 sm:pb-3'
          : isGrid
          ? 'rounded-[18px] sm:rounded-[28px] p-2 sm:p-3 pb-3 sm:pb-4'
          : 'rounded-[28px] sm:rounded-[32px] p-3 sm:p-4 pb-4 sm:pb-5'
      } card-elevation border border-slate-100 hover:border-blue-200/90 flex flex-col relative overflow-hidden transition-colors duration-300 cursor-pointer select-none`}
    >
      {/* 1. Main Media Container */}
      <div
        className={`relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-inner bg-slate-100 mb-2 sm:mb-2.5 select-none ${
          cardVariant === 'hero'
            ? 'h-48 sm:h-64'
            : cardVariant === 'tall'
            ? 'h-52 sm:h-72 flex-grow min-h-[160px]'
            : isCompact
            ? 'h-24 sm:h-28'
            : 'aspect-16/10'
        }`}
      >
        {post.videoUrl ? (
          <div className="relative w-full h-full bg-black">
            {parsedVideo.isIframe ? (
              (post.imageUrl || parsedVideo.defaultThumbnail) ? (
                <img
                  src={getFeedCardImageUrl(post.imageUrl || parsedVideo.defaultThumbnail)}
                  alt=""
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <iframe
                  src={parsedVideo.embedUrl}
                  className="w-full h-full border-0 pointer-events-none"
                  title={post.title}
                />
              )
            ) : (
              <video
                src={post.videoUrl}
                poster={getFeedCardImageUrl(post.imageUrl)}
                preload="metadata"
                muted
                playsInline
                className={`w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out relative z-1 ${
                  post.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                }`}
                style={{
                  objectPosition: post.imagePosition
                    ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                    : '50% 50%',
                }}
              />
            )}
            {/* Top-Right Video badge */}
            <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 shadow-sm">
              <Play className="w-2.5 h-2.5 fill-white text-white" />
              <span>{parsedVideo.platformName !== 'Directo' ? parsedVideo.platformName : 'Video'}</span>
            </div>
          </div>
        ) : post.imageUrl ? (
          <>
            {/* Ambient backdrop when contained or scaled down to fill predefined space (Ultra-light 48px) */}
            {(post.imageFit === 'contain' || (post.imageScale && post.imageScale < 1)) && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
                <img
                  alt=""
                  className="w-full h-full object-cover blur-2xl scale-120 opacity-40"
                  style={{
                    objectPosition: post.imagePosition
                      ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                      : '50% 50%',
                    filter: post.imageFilter && post.imageFilter !== 'none' ? `${post.imageFilter} blur(24px)` : 'blur(24px)',
                  }}
                  src={getBlurBackdropUrl(post.imageUrl)}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
            )}
            <img
              alt={post.title}
              className={`w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out relative z-1 ${
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
              src={isGrid ? getMobileCardImageUrl(post.imageUrl, 380, 70) : getFeedCardImageUrl(post.imageUrl)}
              referrerPolicy="no-referrer"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={priority ? 'high' : 'auto'}
            />
          </>
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
            Sin foto
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none group-hover:opacity-85 transition-opacity duration-300" />

        {/* Top-Right Decorative Curve / Swoosh Gradient */}
        <div
          className={`absolute top-0 right-0 ${
            isCompact ? 'w-10 h-10' : isGrid ? 'w-10 h-10 sm:w-20 sm:h-20' : 'w-20 h-20'
          } pointer-events-none select-none z-10 overflow-hidden rounded-tr-xl sm:rounded-tr-2xl transition-transform duration-500 group-hover:scale-110 group-hover:opacity-95`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`topCornerGrad-${post.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0060E6" />
                <stop offset="40%" stopColor="#0099FF" />
                <stop offset="75%" stopColor="#00CFFF" />
                <stop offset="100%" stopColor="#1BE0F8" />
              </linearGradient>
            </defs>
            <path d="M 0 0 C 45 0, 80 18, 100 68 L 100 0 Z" fill={`url(#topCornerGrad-${post.id})`} />
          </svg>
        </div>

        {/* 3D Diagonal Discount Badge with Sunburst Spark Rays */}
        {discountPercent ? (
          <div
            className={`absolute select-none z-10 transition-transform duration-300 ease-out ${
              isCompact ? 'left-1 top-1.5' : isGrid ? 'left-1 top-1.5 sm:left-3 sm:top-6' : 'left-3 top-6'
            }`}
            style={{
              display: 'inline-flex',
              zIndex: 20,
              transform: isCompact ? 'rotate(-10deg) scale(0.65)' : isGrid ? 'rotate(-10deg) scale(0.65) sm:scale(0.80)' : 'rotate(-12deg) scale(0.80)',
              transformOrigin: 'top left',
            }}
          >
            <div className="relative flex items-center group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300">
              <div
                className={`relative z-10 text-white font-black ${
                  isCompact ? 'text-xs px-2 py-1' : isGrid ? 'text-xs sm:text-lg px-2 py-1 sm:px-3 sm:py-1.5' : 'text-lg px-3 py-1.5'
                } tracking-tight rounded-full flex items-center justify-center leading-none transition-shadow duration-300 group-hover:shadow-[0_6px_22px_rgba(230,60,0,0.65)]`}
                style={{
                  background: 'linear-gradient(rgb(255, 179, 0) 0%, rgb(255, 145, 0) 35%, rgb(240, 80, 0) 70%, rgb(230, 57, 0) 100%)',
                  boxShadow: 'rgba(230, 60, 0, 0.52) 0px 4px 16px, rgba(0, 0, 0, 0.22) 0px 2px 6px, rgba(255, 255, 255, 0.65) 0px 1.5px 1.5px inset, rgba(180, 30, 0, 0.4) 0px -1.5px 2px inset',
                  textShadow: 'rgba(150, 20, 0, 0.45) 0px 1px 2px',
                }}
              >
                -{discountPercent}%
              </div>
              <div className={`absolute -top-1.5 -right-1 pointer-events-none ${isCompact ? 'w-4 h-4' : isGrid ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5'} flex items-center justify-center z-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12`}>
                <svg className="w-full h-full overflow-visible" viewBox="0 0 32 32" fill="none" stroke="#FFB300" strokeLinecap="round">
                  <line x1="15" y1="16" x2="24" y2="6" strokeWidth="2.8" />
                  <line x1="18" y1="20" x2="30" y2="18" strokeWidth="2.8" />
                  <line x1="11" y1="14" x2="13" y2="3" strokeWidth="2.8" />
                </svg>
              </div>
            </div>
          </div>
        ) : null}

        {/* Bottom-Left Pill: Expiry / Availability / Schedule */}
        {post.expiryLabel ? (
          <div
            className={`absolute bottom-1.5 left-1.5 ${isCompact ? '' : 'sm:bottom-3 sm:left-3'} z-20 bg-gradient-to-r from-teal-500 to-cyan-500/95 text-white ${
              isCompact ? 'text-[7.5px] px-1.5 py-0.5' : isGrid ? 'text-[7.5px] sm:text-xs px-1.5 py-0.5 sm:px-3 sm:py-1.5' : 'text-xs px-3 py-1.5'
            } font-bold rounded-full flex items-center gap-1 sm:gap-2 shadow-md backdrop-blur-sm border border-white/25 max-w-[85%] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg`}
          >
            {isCapacityBadge ? (
              <svg className={`${isCompact ? 'w-2.5 h-2.5' : isGrid ? 'w-2.5 h-2.5 sm:w-4 sm:h-4' : 'w-4 h-4'} text-white shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            ) : isCalendarBadge ? (
              <Calendar className={`${isCompact ? 'w-2.5 h-2.5' : isGrid ? 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5'} text-white shrink-0`} />
            ) : (
              <Clock className={`${isCompact ? 'w-2.5 h-2.5' : isGrid ? 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5'} text-white shrink-0`} />
            )}
            <span className="truncate">{post.expiryLabel}</span>
          </div>
        ) : null}
      </div>

      {/* 2. Title and Description */}
      <div className="relative flex-grow flex flex-col justify-start pt-1 pb-1">
        <div className="relative z-10 pr-1 sm:pr-2">
          <h2
            className={`${
              isCompact ? 'text-[11px] sm:text-[12px]' : isGrid ? 'text-[12px] sm:text-[19px]' : 'text-[19px]'
            } font-extrabold text-[#0A1D3C] group-hover:text-[#004dc9] leading-tight sm:leading-snug tracking-tight line-clamp-2 transition-colors duration-200`}
            style={{ color: 'rgb(8, 28, 68)' }}
          >
            {post.title}
          </h2>
          <p
            className={`text-slate-500 ${
              isCompact ? 'text-[9px] line-clamp-1' : isGrid ? 'text-[9.5px] sm:text-xs line-clamp-2' : 'text-xs line-clamp-2'
            } font-normal leading-tight sm:leading-snug mt-1`}
          >
            {post.description}
          </p>
        </div>
      </div>
    </motion.article>
  );
};
