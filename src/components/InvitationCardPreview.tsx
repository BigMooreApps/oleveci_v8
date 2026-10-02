import React from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Gift,
  Ticket,
  Compass,
  Crown,
  Coffee,
  Star,
  Clock,
  Flame,
  Wine,
  Camera,
  Music,
  Heart,
  Store,
  Tag,
  Plane,
  Utensils,
  Award,
  Pencil,
} from 'lucide-react';
import { Post } from '../types';
import { optimizeImageUrl, getBlurBackdropUrl } from '../utils/imageOptimization';

export type CardTheme =
  | 'dark_vip'
  | 'blue_brand'
  | 'sunset'
  | 'emerald'
  | 'rose_gold'
  | 'neon_night'
  | 'nordic_light'
  | 'terracotta'
  | 'bistro_espresso'
  | 'cyber_glow'
  | 'rustic_pub';

export type CardTemplate =
  | 'vip_club'
  | 'luxury_vip'
  | 'rose_gold'
  | 'emerald'
  | 'ticket'
  | 'retro_ticket'
  | 'boarding_pass'
  | 'editorial'
  | 'editorial_vogue'
  | 'vintage_press'
  | 'story'
  | 'sunset_party'
  | 'cyber'
  | 'neon_cyberpunk'
  | 'minimal_clean'
  | 'minimal_nordic'
  | 'festival_badge'
  | 'polaroid_memories'
  | 'bistro_espresso'
  | 'terracotta'
  | 'oleveci_brand';

export type BgLayoutMode =
  | 'cinematic'
  | 'horizontal'
  | 'vertical'
  | 'diagonal'
  | 'grid'
  | 'polaroid'
  | 'asymmetric'
  | 'columns3'
  | 'rows3'
  | 'portal'
  | 'circle'
  | 'in_ads'
  | 'solid';

export interface ThemeConfig {
  id: CardTheme;
  name: string;
  bgGradient: string;
  overlayGradient: string;
  cardBg: string;
  badgeBg: string;
  badgeText: string;
  accentText: string;
  stopItemBg: string;
  stopItemBorder: string;
  dividerBorder: string;
  dotColor: string;
  strokeHex: string;
}

export const THEMES: Record<CardTheme, ThemeConfig> = {
  dark_vip: {
    id: 'dark_vip',
    name: 'Noche VIP Oro',
    bgGradient: 'from-slate-950 via-[#0a0a0f] to-[#121008]',
    overlayGradient: 'from-black/40 via-transparent to-black/60',
    cardBg: 'bg-[#0a0a0d]',
    badgeBg: 'bg-amber-400/20',
    badgeText: 'text-amber-300',
    accentText: 'text-amber-400',
    stopItemBg: 'bg-white/[0.04] hover:bg-white/[0.07]',
    stopItemBorder: 'border-amber-400/25',
    dividerBorder: 'border-amber-400/20',
    dotColor: 'bg-amber-400',
    strokeHex: '#fbbf24',
  },
  blue_brand: {
    id: 'blue_brand',
    name: 'Azul OleVeci',
    bgGradient: 'from-[#00173d] via-[#003894] to-[#0066e0]',
    overlayGradient: 'from-[#001230]/40 via-transparent to-[#002870]/50',
    cardBg: 'bg-[#002257]/90',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    accentText: 'text-cyan-300',
    stopItemBg: 'bg-white/[0.06] hover:bg-white/[0.1]',
    stopItemBorder: 'border-white/20',
    dividerBorder: 'border-white/20',
    dotColor: 'bg-cyan-300',
    strokeHex: '#38bdf8',
  },
  sunset: {
    id: 'sunset',
    name: 'Atardecer Cálido',
    bgGradient: 'from-[#3a0a25] via-[#75173f] to-[#b83818]',
    overlayGradient: 'from-[#290519]/40 via-transparent to-[#57102e]/50',
    cardBg: 'bg-[#5c1332]/85',
    badgeBg: 'bg-amber-300/20',
    badgeText: 'text-amber-200',
    accentText: 'text-amber-300',
    stopItemBg: 'bg-white/[0.06] hover:bg-white/[0.1]',
    stopItemBorder: 'border-amber-300/25',
    dividerBorder: 'border-amber-300/20',
    dotColor: 'bg-amber-300',
    strokeHex: '#fb923c',
  },
  emerald: {
    id: 'emerald',
    name: 'Esmeralda Botánico',
    bgGradient: 'from-[#022018] via-[#044332] to-[#075e47]',
    overlayGradient: 'from-[#01140f]/40 via-transparent to-[#033024]/50',
    cardBg: 'bg-[#033024]/85',
    badgeBg: 'bg-emerald-300/20',
    badgeText: 'text-emerald-200',
    accentText: 'text-emerald-300',
    stopItemBg: 'bg-white/[0.05] hover:bg-white/[0.08]',
    stopItemBorder: 'border-emerald-300/25',
    dividerBorder: 'border-emerald-300/20',
    dotColor: 'bg-emerald-300',
    strokeHex: '#34d399',
  },
  rose_gold: {
    id: 'rose_gold',
    name: 'Oro Rosado Chic',
    bgGradient: 'from-[#1c0c16] via-[#381326] to-[#541b38]',
    overlayGradient: 'from-black/40 via-transparent to-black/60',
    cardBg: 'bg-[#2b1020]/90',
    badgeBg: 'bg-rose-300/20',
    badgeText: 'text-rose-200',
    accentText: 'text-rose-300',
    stopItemBg: 'bg-white/[0.05] hover:bg-white/[0.08]',
    stopItemBorder: 'border-rose-300/25',
    dividerBorder: 'border-rose-300/20',
    dotColor: 'bg-rose-300',
    strokeHex: '#fb7185',
  },
  neon_night: {
    id: 'neon_night',
    name: 'Noche Neón & Bar',
    bgGradient: 'from-[#070518] via-[#14083a] to-[#2a0c5c]',
    overlayGradient: 'from-black/50 via-transparent to-black/70',
    cardBg: 'bg-[#120732]/90',
    badgeBg: 'bg-fuchsia-400/20',
    badgeText: 'text-fuchsia-300',
    accentText: 'text-fuchsia-300',
    stopItemBg: 'bg-white/[0.05] hover:bg-white/[0.08]',
    stopItemBorder: 'border-fuchsia-400/30',
    dividerBorder: 'border-fuchsia-400/25',
    dotColor: 'bg-fuchsia-400',
    strokeHex: '#e879f9',
  },
  nordic_light: {
    id: 'nordic_light',
    name: 'Blanco Nórdico Suizo',
    bgGradient: 'from-[#ffffff] via-[#f8fafc] to-[#f1f5f9]',
    overlayGradient: 'from-black/5 via-transparent to-black/20',
    cardBg: 'bg-white',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    accentText: 'text-[#0056d6]',
    stopItemBg: 'bg-slate-50 hover:bg-slate-100/80',
    stopItemBorder: 'border-slate-200',
    dividerBorder: 'border-slate-200',
    dotColor: 'bg-[#0056d6]',
    strokeHex: '#0f172a',
  },
  terracotta: {
    id: 'terracotta',
    name: 'Terracota Cálido',
    bgGradient: 'from-[#28130a] via-[#4a2010] to-[#713017]',
    overlayGradient: 'from-black/40 via-transparent to-black/60',
    cardBg: 'bg-[#33170c]/90',
    badgeBg: 'bg-amber-400/20',
    badgeText: 'text-amber-200',
    accentText: 'text-amber-300',
    stopItemBg: 'bg-white/[0.05] hover:bg-white/[0.08]',
    stopItemBorder: 'border-amber-500/25',
    dividerBorder: 'border-amber-500/20',
    dotColor: 'bg-amber-400',
    strokeHex: '#f97316',
  },
  bistro_espresso: {
    id: 'bistro_espresso',
    name: 'Café & Bistró',
    bgGradient: 'from-[#170e09] via-[#2a190f] to-[#402517]',
    overlayGradient: 'from-black/40 via-transparent to-black/60',
    cardBg: 'bg-[#22140c]/90',
    badgeBg: 'bg-amber-200/20',
    badgeText: 'text-amber-100',
    accentText: 'text-amber-200',
    stopItemBg: 'bg-white/[0.04] hover:bg-white/[0.07]',
    stopItemBorder: 'border-amber-300/20',
    dividerBorder: 'border-amber-300/15',
    dotColor: 'bg-amber-200',
    strokeHex: '#fde68a',
  },
  cyber_glow: {
    id: 'cyber_glow',
    name: 'Cian Profundo',
    bgGradient: 'from-[#031118] via-[#052633] to-[#0a3e52]',
    overlayGradient: 'from-black/50 via-transparent to-black/70',
    cardBg: 'bg-[#051c27]/90',
    badgeBg: 'bg-cyan-400/20',
    badgeText: 'text-cyan-300',
    accentText: 'text-cyan-300',
    stopItemBg: 'bg-white/[0.05] hover:bg-white/[0.08]',
    stopItemBorder: 'border-cyan-400/30',
    dividerBorder: 'border-cyan-400/20',
    dotColor: 'bg-cyan-400',
    strokeHex: '#22d3ee',
  },
  rustic_pub: {
    id: 'rustic_pub',
    name: 'Taberna & Cervecería',
    bgGradient: 'from-[#160d07] via-[#2f1c0f] to-[#482b17]',
    overlayGradient: 'from-black/40 via-transparent to-black/60',
    cardBg: 'bg-[#1f120a]/90',
    badgeBg: 'bg-amber-400/20',
    badgeText: 'text-amber-300',
    accentText: 'text-amber-400',
    stopItemBg: 'bg-white/[0.05] hover:bg-white/[0.08]',
    stopItemBorder: 'border-amber-500/25',
    dividerBorder: 'border-amber-500/20',
    dotColor: 'bg-amber-400',
    strokeHex: '#f59e0b',
  },
};

interface InvitationCardPreviewProps {
  cardRef?: React.Ref<HTMLDivElement>;
  posts: Post[];
  currentCity?: string;
  planTitle: string;
  scheduledTime: string;
  personalNote?: string;
  hidePrices: boolean;
  cardTemplate: CardTemplate;
  theme: ThemeConfig;
  bgLayout: BgLayoutMode;
  selectedPhotoIndex?: number;
  totalPrice: number;
  hasPricedItems: boolean;
  className?: string;
  onSelectPost?: (post: Post) => void;
  isEditing?: boolean;
  onTitleChange?: (val: string) => void;
  onNoteChange?: (val: string) => void;
}

export interface PlanBackgroundImagesProps {
  posts: Post[];
  bgLayout?: BgLayoutMode;
  theme?: ThemeConfig;
  isPolaroid?: boolean;
  selectedPhotoIndex?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  targetWidth?: number;
}

export const PlanBackgroundImages: React.FC<PlanBackgroundImagesProps> = ({
  posts,
  bgLayout = 'horizontal',
  theme,
  isPolaroid = false,
  selectedPhotoIndex = 0,
  className = '',
  imageClassName = '',
  priority = false,
  targetWidth,
}) => {
  const targetW = targetWidth || 380;
  const loadingAttr: 'eager' | 'lazy' = priority ? 'eager' : 'lazy';
  const fetchPriorityAttr: 'high' | 'auto' = priority ? 'high' : 'auto';

  const getOptImg = (url?: string | null, customW?: number) =>
    optimizeImageUrl(url, customW || targetW, 70);

  const p1 = getOptImg(posts[0]?.imageUrl);
  const p2 = getOptImg(posts[1]?.imageUrl || posts[0]?.imageUrl);
  const p3 = getOptImg(posts[2]?.imageUrl || posts[0]?.imageUrl);

  if (posts.length === 0) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${theme?.bgGradient || 'from-slate-900 to-slate-950'} flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-white/50 animate-pulse" />
          <span className="text-xs font-medium text-white/70">
            Selecciona paradas en el Paso 1
          </span>
        </div>
      </div>
    );
  }

  // Polaroid Header
  if (isPolaroid || bgLayout === 'polaroid') {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br from-[#241913] via-[#1a110d] to-[#100a07] p-3 flex items-center justify-center overflow-hidden ${className}`}>
        <div className="relative w-full h-full flex items-center justify-center">
          {posts.slice(0, 3).map((post, idx) => {
            const tilts = ['-rotate-6 -translate-x-14', 'rotate-1 translate-y-1 z-20', 'rotate-6 translate-x-14 z-10'];
            return (
              <div
                key={post.id || idx}
                className={`absolute w-28 sm:w-32 h-34 sm:h-38 bg-white p-2 pb-5 rounded-xs shadow-xl transition-transform border border-amber-100/40 ${tilts[idx % tilts.length]}`}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-amber-200/80 backdrop-blur-xs rounded-xs shadow-xs border border-amber-300/50 rotate-1" />
                <div className="w-full h-24 sm:h-28 overflow-hidden rounded-xs bg-slate-900">
                  <img
                    src={getOptImg(post.imageUrl, 220)}
                    alt=""
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    loading={loadingAttr}
                    decoding="async"
                    fetchPriority={fetchPriorityAttr}
                    className={`w-full h-full object-cover ${imageClassName}`}
                  />
                </div>
                <div className="mt-1 text-center">
                  <span className="text-[8px] font-medium text-slate-700 truncate block">
                    {post.businessName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 1. Corte Diagonal (Angled Geometric Split)
  if (bgLayout === 'diagonal') {
    const diagW = Math.round(targetW * 0.65);
    return (
      <div className={`absolute inset-0 bg-black overflow-hidden select-none ${className}`}>
        <div
          className="absolute inset-0 z-0"
          style={{ clipPath: 'polygon(0 0, 62% 0, 38% 100%, 0 100%)' }}
        >
          <img
            src={getOptImg(posts[0]?.imageUrl, diagW)}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 scale-105 ${imageClassName}`}
          />
        </div>
        <div
          className="absolute inset-0 z-0"
          style={{ clipPath: 'polygon(62% 0, 100% 0, 100% 100%, 38% 100%)' }}
        >
          <img
            src={getOptImg(posts[1]?.imageUrl || posts[0]?.imageUrl, diagW)}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 scale-105 ${imageClassName}`}
          />
        </div>
        {/* Diagonal Hairline Accent */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-70"
          style={{
            background: 'linear-gradient(108deg, transparent 49.2%, rgba(255,255,255,0.7) 49.7%, rgba(255,255,255,0.7) 50.3%, transparent 50.8%)',
          }}
        />
      </div>
    );
  }

  // 2. Horizontal: Lado a Lado (Columns Split)
  if (bgLayout === 'horizontal') {
    const displayPosts = posts.slice(0, Math.min(posts.length, 3));
    const sliceW = Math.round(targetW / Math.max(1, displayPosts.length));
    return (
      <div className={`absolute inset-0 bg-black flex overflow-hidden ${className}`}>
        {displayPosts.map((post, idx) => (
          <div
            key={post.id || idx}
            className="h-full flex-1 overflow-hidden relative border-r border-white/25 last:border-r-0"
          >
            <img
              src={getOptImg(post.imageUrl, sliceW)}
              alt=""
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading={loadingAttr}
              decoding="async"
              fetchPriority={fetchPriorityAttr}
              className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
            />
          </div>
        ))}
      </div>
    );
  }

  // 3. Vertical: Arriba y Abajo (Horizontal Rows Split)
  if (bgLayout === 'vertical') {
    return (
      <div className={`absolute inset-0 bg-black flex flex-col overflow-hidden ${className}`}>
        <div className="w-full flex-1 overflow-hidden border-b border-white/25">
          <img
            src={p1}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
          />
        </div>
        <div className="w-full flex-1 overflow-hidden">
          <img
            src={p2}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
          />
        </div>
      </div>
    );
  }

  // 4. Tríptico: 3 Columnas Verticales (Columns3)
  if (bgLayout === 'columns3') {
    const colW = Math.max(130, Math.round(targetW / 3));
    return (
      <div className={`absolute inset-0 bg-black flex overflow-hidden ${className}`}>
        <div className="h-full flex-1 overflow-hidden border-r border-white/25">
          <img
            src={getOptImg(posts[0]?.imageUrl, colW)}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
          />
        </div>
        <div className="h-full flex-1 overflow-hidden border-r border-white/25">
          <img
            src={getOptImg(posts[1]?.imageUrl || posts[0]?.imageUrl, colW)}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
          />
        </div>
        <div className="h-full flex-1 overflow-hidden">
          <img
            src={getOptImg(posts[2]?.imageUrl || posts[0]?.imageUrl, colW)}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
          />
        </div>
      </div>
    );
  }

  // 5. 3 Franjas Horizontales (Rows3)
  if (bgLayout === 'rows3') {
    return (
      <div className={`absolute inset-0 bg-black flex flex-col overflow-hidden ${className}`}>
        <div className="w-full flex-1 overflow-hidden border-b border-white/25">
          <img
            src={p1}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
          />
        </div>
        <div className="w-full flex-1 overflow-hidden border-b border-white/25">
          <img
            src={p2}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
          />
        </div>
        <div className="w-full flex-1 overflow-hidden">
          <img
            src={p3}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
          />
        </div>
      </div>
    );
  }

  // 6. Mosaico Asimétrico (Asymmetric 70/30)
  if (bgLayout === 'asymmetric') {
    const heroPhoto = p1;
    const subPhotos = posts.slice(1, 3);
    return (
      <div className={`absolute inset-0 bg-black overflow-hidden ${className}`}>
        <img
          src={heroPhoto}
          alt=""
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading={loadingAttr}
          decoding="async"
          fetchPriority={fetchPriorityAttr}
          className={`w-full h-full object-cover filter brightness-90 contrast-105 ${imageClassName}`}
        />
        {subPhotos.length > 0 && (
          <div className="absolute bottom-3.5 right-3.5 flex items-center gap-2 z-10">
            {subPhotos.map((sp, sIdx) => (
              <div
                key={sp.id || sIdx}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-white shadow-xl bg-black"
              >
                <img
                  src={getOptImg(sp.imageUrl, 140)}
                  alt=""
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  loading={loadingAttr}
                  decoding="async"
                  fetchPriority={fetchPriorityAttr}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 7. Arco Editorial (Portal Window)
  if (bgLayout === 'portal') {
    return (
      <div className={`absolute inset-0 bg-[#0c0a09] flex items-center justify-center p-3 overflow-hidden ${className}`}>
        {/* Ambient blurred backdrop (Ultra-light 48px) */}
        <img
          src={getBlurBackdropUrl(posts[0]?.imageUrl)}
          alt=""
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110"
        />
        <div className="relative w-full h-full rounded-t-[70px] rounded-b-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black">
          <img
            src={p1}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
          />
          {p2 && (
            <div className="absolute -bottom-2 -right-2 w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-white/90 overflow-hidden shadow-2xl z-10">
              <img
                src={getOptImg(posts[1]?.imageUrl, 160)}
                alt=""
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                loading={loadingAttr}
                decoding="async"
                fetchPriority={fetchPriorityAttr}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 8. Lente Circular Central (Circle Medallion)
  if (bgLayout === 'circle') {
    return (
      <div className={`absolute inset-0 bg-[#09090b] flex items-center justify-center overflow-hidden ${className}`}>
        {/* Ambient blurred backdrop (Ultra-light 48px) */}
        <img
          src={getBlurBackdropUrl(posts[0]?.imageUrl)}
          alt=""
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-115"
        />
        <div className="relative w-34 h-34 sm:w-40 sm:h-40 rounded-full border-4 border-white/90 shadow-2xl overflow-hidden z-10 bg-black">
          <img
            src={p1}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading={loadingAttr}
            decoding="async"
            fetchPriority={fetchPriorityAttr}
            className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
          />
        </div>
        {p2 && (
          <div className="absolute bottom-3 right-5 w-14 h-14 rounded-full border-2 border-white shadow-xl overflow-hidden z-20 bg-black">
            <img
              src={getOptImg(posts[1]?.imageUrl, 140)}
              alt=""
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading={loadingAttr}
              decoding="async"
              fetchPriority={fetchPriorityAttr}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    );
  }

  // 9. Grid / Bento Cuadrícula
  if (bgLayout === 'grid') {
    const halfW = Math.round(targetW / 2);
    if (posts.length === 2) {
      return (
        <div className={`absolute inset-0 bg-black flex overflow-hidden ${className}`}>
          <div className="h-full flex-1 overflow-hidden border-r border-white/25">
            <img
              src={getOptImg(posts[0]?.imageUrl, halfW)}
              alt=""
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading={loadingAttr}
              decoding="async"
              fetchPriority={fetchPriorityAttr}
              className={`w-full h-full object-cover ${imageClassName}`}
            />
          </div>
          <div className="h-full flex-1 overflow-hidden">
            <img
              src={getOptImg(posts[1]?.imageUrl, halfW)}
              alt=""
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading={loadingAttr}
              decoding="async"
              fetchPriority={fetchPriorityAttr}
              className={`w-full h-full object-cover ${imageClassName}`}
            />
          </div>
        </div>
      );
    }

    if (posts.length === 3) {
      return (
        <div className={`absolute inset-0 bg-black flex overflow-hidden ${className}`}>
          <div className="w-1/2 h-full border-r border-white/25 overflow-hidden">
            <img
              src={getOptImg(posts[0]?.imageUrl, halfW)}
              alt=""
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading={loadingAttr}
              decoding="async"
              fetchPriority={fetchPriorityAttr}
              className={`w-full h-full object-cover ${imageClassName}`}
            />
          </div>
          <div className="w-1/2 h-full flex flex-col overflow-hidden">
            <div className="w-full h-1/2 border-b border-white/25 overflow-hidden">
              <img
                src={getOptImg(posts[1]?.imageUrl, halfW)}
                alt=""
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                loading={loadingAttr}
                decoding="async"
                fetchPriority={fetchPriorityAttr}
                className={`w-full h-full object-cover ${imageClassName}`}
              />
            </div>
            <div className="w-full h-1/2 overflow-hidden">
              <img
                src={getOptImg(posts[2]?.imageUrl, halfW)}
                alt=""
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                loading={loadingAttr}
                decoding="async"
                fetchPriority={fetchPriorityAttr}
                className={`w-full h-full object-cover ${imageClassName}`}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`absolute inset-0 bg-black grid grid-cols-2 grid-rows-2 overflow-hidden ${className}`}>
        {posts.slice(0, 4).map((post, idx) => (
          <div key={post.id || idx} className="overflow-hidden border border-white/20">
            <img
              src={getOptImg(post.imageUrl, halfW)}
              alt=""
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading={loadingAttr}
              decoding="async"
              fetchPriority={fetchPriorityAttr}
              className={`w-full h-full object-cover ${imageClassName}`}
            />
          </div>
        ))}
      </div>
    );
  }

  // 10. Default / 1 Photo / Cinematic
  const activePhoto = getOptImg(posts[selectedPhotoIndex % posts.length]?.imageUrl || posts[0]?.imageUrl);
  return (
    <div className={`absolute inset-0 bg-black overflow-hidden ${className}`}>
      <img
        src={activePhoto}
        alt=""
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        loading={loadingAttr}
        decoding="async"
        fetchPriority={fetchPriorityAttr}
        className={`w-full h-full object-cover filter brightness-95 contrast-105 ${imageClassName}`}
      />
    </div>
  );
};

export const StopHoverTooltip: React.FC<{ post: Post }> = () => null;

interface InlineEditableTitleProps {
  title: string;
  isEditing?: boolean;
  onChange?: (val: string) => void;
  fontClass?: string;
  isDarkTheme?: boolean;
}

export const InlineEditableTitle: React.FC<InlineEditableTitleProps> = ({
  title,
  isEditing,
  onChange,
  fontClass = 'text-xl font-bold tracking-tight text-white',
  isDarkTheme = true,
}) => {
  // If fontClass has an explicit text color class, extract or respect it.
  // By default, card header titles are placed over photo gradients and are pure white.
  const isWhite = fontClass.includes('text-white') || isDarkTheme;

  if (isEditing && onChange) {
    return (
      <div className="relative w-full z-30 group/inline-title" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Título del plan..."
          className={`w-full py-1.5 pl-3 pr-8 rounded-xl font-bold text-base sm:text-lg transition focus:outline-hidden shadow-md ${
            isWhite
              ? 'bg-black/60 hover:bg-black/70 focus:bg-black/85 !text-white placeholder:text-white/60 border border-white/40 focus:border-white focus:ring-2 focus:ring-blue-400'
              : 'bg-white/90 hover:bg-white focus:bg-white !text-stone-900 placeholder:text-stone-400 border border-stone-400/80 focus:border-stone-900 focus:ring-2 focus:ring-blue-500'
          }`}
          style={{ color: isWhite ? '#ffffff' : '#021b58' }}
        />
        <Pencil className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70 text-blue-400" />
      </div>
    );
  }

  const effectiveFontClass = fontClass.includes('text-') ? fontClass : `${fontClass} text-white`;

  return (
    <h3
      className={`${effectiveFontClass} leading-tight drop-shadow-md select-none`}
      style={effectiveFontClass.includes('text-white') ? { color: '#ffffff' } : undefined}
    >
      {title || 'Nuestra salida especial'}
    </h3>
  );
};

interface InlineEditableNoteProps {
  note: string;
  isEditing?: boolean;
  onChange?: (val: string) => void;
  isDarkTheme?: boolean;
  wrapperClass?: string;
  textClass?: string;
}

export const InlineEditableNote: React.FC<InlineEditableNoteProps> = ({
  note,
  isEditing,
  onChange,
  isDarkTheme = true,
  wrapperClass = '',
  textClass = '',
}) => {
  if (isEditing && onChange) {
    return (
      <div className="space-y-1 z-30 relative" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <textarea
            value={note}
            onChange={(e) => onChange(e.target.value.slice(0, 140))}
            rows={2}
            maxLength={140}
            placeholder="Añade una descripción o dedicatoria aquí... ✍️"
            className={`w-full p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm transition resize-none focus:outline-hidden leading-relaxed shadow-md border ${
              isDarkTheme
                ? 'bg-black/60 hover:bg-black/70 focus:bg-black/85 !text-white placeholder:text-white/60 border border-white/40 focus:border-white focus:ring-2 focus:ring-blue-400'
                : 'bg-white/90 hover:bg-white focus:bg-white !text-stone-900 placeholder:text-stone-400 border border-stone-300 focus:border-stone-800 focus:ring-2 focus:ring-blue-500'
            }`}
            style={{ color: isDarkTheme ? '#ffffff' : '#021b58' }}
          />
          <span className={`absolute right-2.5 bottom-2 text-[10px] font-medium pointer-events-none ${isDarkTheme ? '!text-white/60' : 'text-stone-400'}`}>
            {note.length}/140
          </span>
        </div>
      </div>
    );
  }

  if (!note || !note.trim()) return null;

  return (
    <div className={`p-2.5 sm:p-3 rounded-xl text-xs italic leading-relaxed ${wrapperClass} ${textClass}`}>
      "{note}"
    </div>
  );
};

export const InvitationCardPreview: React.FC<InvitationCardPreviewProps> = ({
  cardRef,
  posts,
  currentCity,
  planTitle,
  scheduledTime,
  personalNote,
  hidePrices,
  cardTemplate,
  theme,
  bgLayout,
  selectedPhotoIndex = 0,
  totalPrice,
  hasPricedItems,
  className = '',
  onSelectPost,
  isEditing = false,
  onTitleChange,
  onNoteChange,
}) => {
  const isRoseGold = cardTemplate === 'rose_gold' || theme.id === 'rose_gold';
  const isEmerald = cardTemplate === 'emerald' || theme.id === 'emerald';
  const isVipGold = (cardTemplate === 'vip_club' || cardTemplate === 'luxury_vip') && !isRoseGold && !isEmerald;
  const isVintagePress = cardTemplate === 'vintage_press';
  const isEditorialVogue = (cardTemplate === 'editorial' || cardTemplate === 'editorial_vogue') && !isVintagePress;
  const isBoardingPass = cardTemplate === 'boarding_pass';
  const isRetroTicket = (cardTemplate === 'ticket' || cardTemplate === 'retro_ticket') && !isBoardingPass;
  const isTerracotta = cardTemplate === 'terracotta';
  const isBistroEspresso = (cardTemplate === 'bistro_espresso' || theme.id === 'bistro_espresso') && !isTerracotta;
  const isPolaroid = cardTemplate === 'polaroid_memories' || bgLayout === 'polaroid';
  const isNeonCyber = cardTemplate === 'cyber' || cardTemplate === 'neon_cyberpunk' || cardTemplate === 'festival_badge' || theme.id === 'neon_night';
  const isOleveciBrand = cardTemplate === 'oleveci_brand' || theme.id === 'blue_brand';
  const isMinimalNordic = cardTemplate === 'minimal_clean' || cardTemplate === 'minimal_nordic';

  const defaultTitle = planTitle?.trim() || 'Nuestra salida especial';
  const defaultTime = scheduledTime?.trim() || 'Este fin de semana';
  const defaultCity = currentCity?.trim() || 'Tu Vecindario';

  // Render photo gallery inside the header
  const renderHeaderImages = () => {
    return (
      <PlanBackgroundImages
        posts={posts}
        bgLayout={bgLayout}
        theme={theme}
        isPolaroid={isPolaroid}
        selectedPhotoIndex={selectedPhotoIndex}
      />
    );
  };

  // ======================================================================
  // 1. PLANTILLA: VOGUE EDITORIAL (Marfil, tipografía de revista y alta gama)
  // ======================================================================
  if (isEditorialVogue) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#FAF7F2] text-stone-900 border border-[#E7DFC6] shadow-xl overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Masthead Header */}
        <div className="px-5 pt-4 pb-3 border-b border-stone-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-stone-500">
              AGENDA URBANA
            </span>
            <h2 className="text-base font-serif italic text-stone-900 font-bold leading-tight">
              Invitación Especial
            </h2>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 bg-stone-200/70 px-3 py-1 rounded-full border border-stone-300/80">
            <MapPin className="w-3.5 h-3.5 text-stone-500" />
            <span>{defaultCity}</span>
          </div>
        </div>

        {/* Hero Photo Window */}
        <div className="relative w-full h-56 bg-stone-200 overflow-hidden">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-3.5 left-4 right-4 text-white">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-serif italic font-bold text-white"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* Schedule & Notes */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2.5">
            <div className="flex items-center gap-1.5 text-stone-800 font-medium">
              <Calendar className="w-3.5 h-3.5 text-stone-600" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {posts.length} {posts.length === 1 ? 'parada' : 'paradas'}
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={false}
            wrapperClass="bg-stone-100/90 border border-stone-200"
            textClass="text-stone-800"
          />

          {/* Stops List */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/80 hover:bg-white border border-stone-200 shadow-2xs transition"
                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-serif font-bold text-stone-400 w-5 shrink-0">
                      0{idx + 1}.
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-stone-600 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-semibold text-stone-900 shrink-0">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Editorial Footer */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] font-medium text-stone-500 block uppercase">
                    Presupuesto total estimado
                  </span>
                  <span className="text-sm font-bold text-stone-900">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-serif italic text-stone-500">
                OleVeci
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 1B. PLANTILLA: GACETA URBANA (Prensa vecinal, papel artesanal & crónica)
  // ======================================================================
  if (isVintagePress) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#F5EFE6] text-amber-950 border-2 border-[#D6C8B4] shadow-xl overflow-hidden select-none relative transition-all duration-300 font-serif ${className}`}
      >
        {/* Newspaper Masthead */}
        <div className="p-4 border-b-2 border-amber-950/20 bg-[#EFE6DA] text-center space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-amber-900/70 border-b border-amber-950/20 pb-1">
            <span>EDICIÓN VECINAL</span>
            <span>{defaultCity}</span>
            <span>CRÓNICA LOCAL</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-amber-950 uppercase pt-1">
            Gaceta Urbana
          </h2>
          <div className="flex items-center justify-center gap-2 text-[10px] font-sans font-semibold text-amber-800 tracking-wider">
            <span>INVITACIÓN ESPECIAL DE SALIDA</span>
          </div>
        </div>

        {/* Hero Photo Window with warm sepia touch */}
        <div className="relative w-full h-52 bg-stone-900 overflow-hidden border-b border-amber-950/20">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A170A]/90 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-black tracking-tight text-white"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* Gazette Body */}
        <div className="p-4 sm:p-5 space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-900/5 p-2.5 rounded-xl border border-amber-950/15">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-bold text-amber-900">
              {posts.length} {posts.length === 1 ? 'parada' : 'paradas'}
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={false}
            wrapperClass="bg-white/60 border border-amber-950/15 font-serif"
            textClass="text-amber-950"
          />

          {/* Stops styled like local report */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/80 hover:bg-white border border-amber-950/15 shadow-2xs transition"
                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-amber-950/10 text-amber-950 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-amber-950 truncate font-serif">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-amber-900/70 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-bold text-amber-950 shrink-0 font-mono">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Gazette Footer */}
          <div className="pt-3 border-t border-amber-950/20 flex items-center justify-between text-xs">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] font-medium text-amber-900/70 block uppercase font-mono">
                    Presupuesto estimado
                  </span>
                  <span className="text-sm font-bold text-amber-950 font-serif">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <span className="text-xs font-serif italic text-amber-900/80 font-bold">
              OleVeci Crónicas
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 2. PLANTILLA: BOLETO RETRO / GOLDEN TICKET (Admisión perforada vintage)
  // ======================================================================
  if (isRetroTicket) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#140F0A] text-amber-100 border-2 border-amber-500/40 shadow-2xl overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Ticket Header */}
        <div className="p-3.5 bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-[#140F0A] border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold tracking-widest text-amber-300 uppercase">
              PASE DE ADMISIÓN
            </span>
          </div>
          <span className="text-xs font-medium text-amber-400/90">
            {defaultCity}
          </span>
        </div>

        {/* Photo Gallery Window */}
        <div className="relative w-full h-52 bg-stone-950 overflow-hidden">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-[#140F0A] via-transparent to-black/40 pointer-events-none" />
          <div className="absolute bottom-3 left-4 right-4">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-lg font-bold text-white tracking-tight leading-snug drop-shadow-md"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* Realistic Ticket Perforations with cutouts */}
        <div className="relative my-1">
          <div className="border-t-2 border-dashed border-amber-500/40" />
          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-slate-900 shadow-inner border border-amber-500/30" />
          <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-slate-900 shadow-inner border border-amber-500/30" />
        </div>

        {/* Ticket Body Content */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-200 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/20">
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-semibold text-amber-400">
              {posts.length} {posts.length === 1 ? 'parada' : 'paradas'}
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={true}
            wrapperClass="bg-black/40 border border-amber-500/20"
            textClass="text-amber-200"
          />

          {/* Stops */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-amber-500/20 hover:bg-black/60 transition"
                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-100 truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-amber-300/70 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs text-amber-400 shrink-0 font-bold">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Ticket Footer */}
          <div className="pt-3 border-t border-amber-500/30 flex items-center justify-between">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] font-medium text-amber-400/80 block uppercase">
                    Presupuesto Total
                  </span>
                  <span className="text-sm font-bold text-amber-300">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-amber-400 tracking-wider">
                OLEVECI PASS
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 2B. PLANTILLA: PASE DE EMBARQUE / BOARDING PASS (Aeronáutico, viaje & aventura)
  // ======================================================================
  if (isBoardingPass) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#00173D] text-white border-2 border-sky-400/40 shadow-2xl overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Boarding Pass Header */}
        <div className="p-3.5 bg-gradient-to-r from-blue-950 via-sky-950 to-[#00173D] border-b border-sky-400/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-sky-400 rotate-45" />
            <span className="text-xs font-bold tracking-widest text-sky-300 uppercase font-mono">
              BOARDING PASS • RUTA URBANA
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-sky-200 bg-sky-900/60 px-2.5 py-0.5 rounded-sm border border-sky-400/30">
            DEST: {defaultCity.toUpperCase().slice(0, 10)}
          </span>
        </div>

        {/* Hero Photo Window */}
        <div className="relative w-full h-52 bg-slate-950 overflow-hidden border-b border-sky-500/20">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-[#00173D] via-transparent to-black/30 pointer-events-none" />
          <div className="absolute bottom-3 left-4 right-4">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-lg font-bold text-white tracking-tight leading-snug drop-shadow-md"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* Flight Route Details */}
        <div className="p-4 sm:p-5 space-y-3 relative">
          {/* Perforation Cutouts */}
          <div className="absolute -left-3 top-0 w-6 h-6 bg-slate-950 rounded-full border border-sky-400/30 -translate-y-1/2" />
          <div className="absolute -right-3 top-0 w-6 h-6 bg-slate-950 rounded-full border border-sky-400/30 -translate-y-1/2" />

          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-sky-950/40 p-2.5 rounded-xl border border-sky-400/20 font-mono">
            <div>
              <span className="text-[9px] text-sky-300/70 block uppercase">SALIDA</span>
              <span className="text-xs font-bold text-white truncate block">{defaultTime}</span>
            </div>
            <div className="border-x border-sky-400/20">
              <span className="text-[9px] text-sky-300/70 block uppercase">ESCALAS</span>
              <span className="text-xs font-bold text-sky-300 block">{posts.length} Checkpoints</span>
            </div>
            <div>
              <span className="text-[9px] text-sky-300/70 block uppercase">CLASE</span>
              <span className="text-xs font-bold text-sky-300 block">VIP LOCAL</span>
            </div>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={true}
            wrapperClass="bg-sky-950/40 border border-sky-400/20"
            textClass="text-sky-100"
          />

          {/* Stops styled like Flight Waypoints */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-2.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/40 border border-sky-400/25 transition"
                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-sm bg-sky-500/20 text-sky-300 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-sky-300/70 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-bold text-sky-300 shrink-0 font-mono">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Boarding Pass Tear Line & Barcode */}
          <div className="pt-3 border-t border-dashed border-sky-400/30 flex items-center justify-between text-xs">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400/70 block">
                    PRESUPUESTO RUTA
                  </span>
                  <span className="text-sm font-bold text-sky-300 font-mono">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <div className="flex gap-0.5 items-end h-6 opacity-60">
                {[2, 4, 1, 3, 5, 2, 4, 1, 3, 2, 5, 1, 4, 2].map((h, i) => (
                  <span key={i} className="w-0.5 bg-sky-300 inline-block" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 3. PLANTILLA: BLANCO NÓRDICO SUIZO (Puro, limpio, espacio y tipografía)
  // ======================================================================
  if (isMinimalNordic) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-xl overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Clean Header */}
        <div className="p-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0056d6]" />
            <span className="text-xs font-semibold text-slate-900">
              Invitación de Salida
            </span>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {defaultCity}
          </span>
        </div>

        {/* Inset Photo Window with generous whitespace */}
        <div className="px-5">
          <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-xs border border-slate-100 bg-slate-900">
            {renderHeaderImages()}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3.5 left-4 right-4 text-white">
              <InlineEditableTitle
                title={planTitle !== undefined ? planTitle : defaultTitle}
                isEditing={isEditing}
                onChange={onTitleChange}
                fontClass="text-lg font-bold tracking-tight text-white"
                isDarkTheme={true}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-[#0056d6]" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {posts.length} {posts.length === 1 ? 'actividad' : 'actividades'}
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={false}
            wrapperClass="bg-slate-50 border border-slate-200/80"
            textClass="text-slate-700"
          />

          {/* Clean minimal stops */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 py-2 px-1.5 rounded-xl hover:bg-slate-50 border-b border-slate-100 last:border-0 transition"
                >
                                    <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-semibold text-slate-800 shrink-0">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Minimalist Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] font-medium text-slate-500 block uppercase">
                    Presupuesto total
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">
                OleVeci
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 4. PLANTILLA: LUXURY VIP (Obsidiana negra & Oro champagne)
  // ======================================================================
  if (isVipGold) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#090A0D] text-[#F5F2E9] border border-[#D4AF37]/50 shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(212,175,55,0.12)] overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Luxury Gold Border Accent */}
        <div className="px-5 pt-4 pb-2.5 border-b border-[#D4AF37]/25 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Crown className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-bold">
              INVITACIÓN VIP
            </span>
          </div>
          <span className="text-xs font-medium text-[#D4AF37]/90">
            {defaultCity}
          </span>
        </div>

        {/* Hero Photo Window */}
        <div className="relative w-full h-56 sm:h-64 md:h-72 bg-stone-950 overflow-hidden">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-transparent to-black/50 pointer-events-none" />
          <div className="absolute bottom-3.5 left-5 right-5">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-serif italic font-bold tracking-tight text-white"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#D4AF37]/90 border-b border-[#D4AF37]/20 pb-2.5">
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-semibold text-[#D4AF37]/80">
              {posts.length} {posts.length === 1 ? 'parada' : 'paradas'}
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={true}
            wrapperClass="bg-white/[0.03] border border-[#D4AF37]/25 font-serif"
            textClass="text-[#F5F2E9]/90"
          />

          {/* Stops in Roman Numerals */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              const romans = ['I', 'II', 'III', 'IV'];
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-[#D4AF37]/20 hover:bg-white/[0.08] transition"
                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-serif font-bold text-[#D4AF37] w-5 shrink-0">
                      {romans[idx % romans.length]}.
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-white/60 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-semibold text-[#D4AF37] shrink-0">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Luxury Footer */}
          <div className="pt-3 border-t border-[#D4AF37]/25 flex items-center justify-between">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] uppercase font-medium text-[#D4AF37]/70 block">
                    Presupuesto estimado
                  </span>
                  <span className="text-sm font-bold text-white">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-semibold">
              <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
              <span>Pase Exclusivo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 4B. PLANTILLA: ORO ROSADO CHIC (Atmósfera de cóctel elegante & blush)
  // ======================================================================
  if (isRoseGold) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#1F0818] text-[#FFF1F2] border border-rose-400/50 shadow-[0_12px_40px_rgba(31,8,24,0.7),0_0_20px_rgba(251,113,133,0.18)] overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Rose Gold Header */}
        <div className="px-5 pt-4 pb-2.5 border-b border-rose-400/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-300">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-xs uppercase tracking-wider font-bold">
              ORO ROSADO CHIC
            </span>
          </div>
          <span className="text-xs font-medium text-rose-200 bg-rose-950/60 px-3 py-0.5 rounded-full border border-rose-400/30">
            {defaultCity}
          </span>
        </div>

        {/* Hero Photo Window */}
        <div className="relative w-full h-56 bg-stone-950 overflow-hidden">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F0818] via-transparent to-rose-950/30 pointer-events-none" />
          <div className="absolute bottom-3.5 left-5 right-5">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-serif italic font-bold tracking-tight text-white"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-rose-300 border-b border-rose-400/25 pb-2.5">
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-semibold text-rose-200/80">
              {posts.length} {posts.length === 1 ? 'parada' : 'paradas'}
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={true}
            wrapperClass="bg-white/[0.04] border border-rose-400/25 font-serif"
            textClass="text-rose-100"
          />

          {/* Stops in Rose Gold Roman Numerals */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const romanNums = ['I', 'II', 'III', 'IV', 'V', 'VI'];
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-rose-400/20 transition"
                >
                                    <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-serif font-bold text-rose-300 w-5 shrink-0">
                      {romanNums[idx] || `${idx + 1}`}.
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-rose-200/70 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-bold text-rose-300 shrink-0 font-serif">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Rose Gold Footer */}
          <div className="pt-3 border-t border-rose-400/25 flex items-center justify-between text-xs">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-rose-300/70 block">
                    Presupuesto cóctel
                  </span>
                  <span className="text-sm font-bold text-rose-300 font-serif">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-rose-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Noche Chic</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 4C. PLANTILLA: ESMERALDA IMPERIAL (Botánico, serenidad & lujo natural)
  // ======================================================================
  if (isEmerald) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#02241A] text-[#ECFDF5] border border-emerald-400/50 shadow-[0_12px_40px_rgba(2,36,26,0.7),0_0_20px_rgba(52,211,153,0.18)] overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Emerald Header */}
        <div className="px-5 pt-4 pb-2.5 border-b border-emerald-400/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-300">
            <Crown className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-bold">
              ESMERALDA IMPERIAL
            </span>
          </div>
          <span className="text-xs font-medium text-emerald-200 bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-400/30">
            {defaultCity}
          </span>
        </div>

        {/* Hero Photo Window */}
        <div className="relative w-full h-56 bg-stone-950 overflow-hidden">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-[#02241A] via-transparent to-emerald-950/30 pointer-events-none" />
          <div className="absolute bottom-3.5 left-5 right-5">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-serif italic font-bold tracking-tight text-white"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-emerald-300 border-b border-emerald-400/25 pb-2.5">
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-semibold text-emerald-200/80">
              {posts.length} {posts.length === 1 ? 'parada' : 'paradas'}
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={true}
            wrapperClass="bg-white/[0.04] border border-emerald-400/25 font-serif"
            textClass="text-emerald-100"
          />

          {/* Stops in Emerald Roman Numerals */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const romanNums = ['I', 'II', 'III', 'IV', 'V', 'VI'];
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-emerald-400/20 transition"
                >
                                    <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-serif font-bold text-emerald-300 w-5 shrink-0">
                      {romanNums[idx] || `${idx + 1}`}.
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-emerald-200/70 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-bold text-emerald-300 shrink-0 font-serif">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Emerald Footer */}
          <div className="pt-3 border-t border-emerald-400/25 flex items-center justify-between text-xs">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-300/70 block">
                    Presupuesto estimado
                  </span>
                  <span className="text-sm font-bold text-emerald-300 font-serif">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
              <Crown className="w-3.5 h-3.5" />
              <span>Relax Premium</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 5. PLANTILLA: SCRAPBOOK POLAROID (Recuerdos, calidez, amistad)
  // ======================================================================
  if (isPolaroid) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#1E1611] text-amber-50 border border-amber-700/30 shadow-2xl overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Header */}
        <div className="p-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Camera className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide">
              Álbum de Salida
            </span>
          </div>
          <span className="text-xs font-medium text-amber-200/80 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            {defaultCity}
          </span>
        </div>

        {/* Polaroids Floating Showcase */}
        <div className="relative w-full h-52 overflow-hidden">
          {renderHeaderImages()}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="text-center space-y-1">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-bold text-white tracking-tight"
              isDarkTheme={true}
            />
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{defaultTime}</span>
            </div>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={true}
            wrapperClass="bg-black/40 border border-amber-500/20 text-center"
            textClass="text-amber-200"
          />

          {/* Stops */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/5 border border-amber-500/20 hover:bg-white/10 transition"
                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-amber-200/70 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-semibold text-amber-300 shrink-0">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] uppercase font-medium text-amber-300/70 block">
                    Presupuesto estimado
                  </span>
                  <span className="text-sm font-bold text-amber-200">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <span className="text-xs font-medium text-amber-400/90">
              ¡A disfrutar! ✨
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 6. PLANTILLA: CAFÉ & BISTRÓ GOURMET (Espresso, gastronomía, sobremesa)
  // ======================================================================
  if (isBistroEspresso) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#1A120C] text-amber-50 border border-amber-700/40 shadow-2xl overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Café Header */}
        <div className="p-4 border-b border-amber-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-300">
            <Coffee className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-bold">
              Bistró & Buena Mesa
            </span>
          </div>
          <span className="text-xs text-amber-200/80 font-medium">
            {defaultCity}
          </span>
        </div>

        {/* Hero Photo Window */}
        <div className="relative w-full h-54 bg-stone-900 overflow-hidden">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A120C] via-transparent to-black/40 pointer-events-none" />
          <div className="absolute bottom-3.5 left-5 right-5">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-serif italic font-bold tracking-tight text-white"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* Bistro Content */}
        <div className="p-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-amber-200 border-b border-amber-800/30 pb-2.5">
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-semibold text-amber-300/80">
              {posts.length} {posts.length === 1 ? 'parada' : 'paradas'}
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={true}
            wrapperClass="bg-black/40 border border-amber-800/30"
            textClass="text-amber-200"
          />

          {/* Stops */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/30 border border-amber-800/30 hover:bg-black/50 transition"
                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-amber-400 text-xs font-serif font-bold w-4 shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-100 truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-amber-200/70 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-semibold text-amber-300 shrink-0">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Bistro Footer */}
          <div className="pt-3 border-t border-amber-800/30 flex items-center justify-between">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] uppercase font-medium text-amber-400/70 block">
                    Consumo estimado
                  </span>
                  <span className="text-sm font-bold text-amber-200">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right text-xs text-amber-300/80 font-serif italic">
              Bon Appétit!
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 6B. PLANTILLA: TERRACOTA & SOBREMESA (Artisanal, calidez de tierra, sobremesa)
  // ======================================================================
  if (isTerracotta) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#2A1006] text-amber-100 border border-orange-700/40 shadow-2xl overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Terracotta Header */}
        <div className="p-4 border-b border-orange-600/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-400">
            <Coffee className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-bold">
              TERRACOTA & SOBREMESA
            </span>
          </div>
          <span className="text-xs text-amber-200/90 font-medium bg-white/5 px-3 py-0.5 rounded-full border border-orange-500/30">
            {defaultCity}
          </span>
        </div>

        {/* Hero Photo Window with warm clay tones */}
        <div className="relative w-full h-54 bg-stone-900 overflow-hidden">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A1006] via-transparent to-black/30 pointer-events-none" />
          <div className="absolute bottom-3.5 left-5 right-5">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-serif italic font-bold text-white tracking-tight"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* Terracotta Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-amber-200/90 border-b border-orange-700/30 pb-2">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-serif italic text-orange-300">
              {posts.length} {posts.length === 1 ? 'parada' : 'paradas'} para compartir
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={true}
            wrapperClass="bg-orange-950/40 border border-orange-700/30 font-serif"
            textClass="text-amber-100"
          />

          {/* Stops */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-2.5 rounded-xl bg-orange-950/30 hover:bg-orange-900/30 border border-orange-600/20 transition"
                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-orange-500/25 text-orange-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-amber-200/70 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-bold text-orange-300 shrink-0 font-mono">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Terracotta Footer */}
          <div className="pt-3 border-t border-orange-700/30 flex items-center justify-between text-xs">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-orange-300/70 block">
                    Presupuesto estimado
                  </span>
                  <span className="text-sm font-bold text-orange-200 font-mono">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right text-xs text-orange-300/80 font-serif italic">
              Tarde entre amigos ☕
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 7. PLANTILLA: NOCHE NEÓN & BAR (Coctelería, fiesta, noche chic)
  // ======================================================================
  if (isNeonCyber) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#09071A] text-cyan-50 border border-fuchsia-500/40 shadow-[0_0_35px_rgba(217,70,239,0.18)] overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* Lounge Header */}
        <div className="px-4 py-3 bg-black/50 border-b border-fuchsia-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-fuchsia-300">
            <Music className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">
              PLAN NOCHE & CÓCTELES
            </span>
          </div>
          <span className="text-xs text-cyan-300 font-medium">
            {defaultCity}
          </span>
        </div>

        {/* Hero Photo Window */}
        <div className="relative w-full h-54 bg-slate-950 overflow-hidden">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09071A] via-transparent to-black/40 pointer-events-none" />
          <div className="absolute bottom-3.5 left-4 right-4">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-bold text-white tracking-tight leading-snug"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* Stops & Details */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-cyan-200 bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-500/25">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-semibold text-fuchsia-300">
              {posts.length} {posts.length === 1 ? 'parada' : 'paradas'}
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={true}
            wrapperClass="bg-black/60 border border-fuchsia-500/25"
            textClass="text-cyan-200"
          />

          {/* Stops */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-cyan-500/25 hover:bg-white/[0.07] transition"
                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-lg bg-fuchsia-500/20 text-fuchsia-300 text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-cyan-200/70 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-bold text-cyan-300 shrink-0">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-fuchsia-500/30 flex items-center justify-between">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] uppercase font-medium text-cyan-400/70 block">
                    Presupuesto estimado
                  </span>
                  <span className="text-sm font-bold text-cyan-300">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-fuchsia-400">
                ¡Buena vibra! 🍹
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 7B. PLANTILLA: BRAND OLEVECI (Azul institucional eléctrico & estilo app oficial)
  // ======================================================================
  if (isOleveciBrand) {
    return (
      <div
        ref={cardRef}
        id="invitation-card-element"
        className={`w-full max-w-[430px] rounded-3xl bg-[#001D4A] text-white border-2 border-blue-400/40 shadow-[0_12px_36px_rgba(0,86,214,0.3)] overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
      >
        {/* OleVeci Header */}
        <div className="p-4 bg-gradient-to-r from-[#003B99] via-[#0056D6] to-[#0066FF] border-b border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xs text-white">
              V
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-white uppercase block leading-none">
                OLEVECI RUTA
              </span>
              <span className="text-[10px] text-blue-200 block">Comunidad Cajicá</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-white bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            {defaultCity}
          </span>
        </div>

        {/* Hero Photo Window */}
        <div className="relative w-full h-54 bg-blue-950 overflow-hidden">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-[#001D4A] via-transparent to-black/30 pointer-events-none" />
          <div className="absolute bottom-3.5 left-5 right-5">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-bold text-white tracking-tight leading-tight"
              isDarkTheme={true}
            />
          </div>
        </div>

        {/* OleVeci Card Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-blue-200 border-b border-blue-400/20 pb-2">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              <span>{defaultTime}</span>
            </div>
            <span className="text-xs font-medium text-blue-200">
              {posts.length} {posts.length === 1 ? 'parada confirmada' : 'paradas confirmadas'}
            </span>
          </div>

          <InlineEditableNote
            note={personalNote || ''}
            isEditing={isEditing}
            onChange={onNoteChange}
            isDarkTheme={true}
            wrapperClass="bg-blue-950/60 border border-blue-400/25"
            textClass="text-blue-50"
          />

          {/* Stops */}
          <div className="space-y-2">
            {posts.map((post, idx) => {
              const price = post.promotionalPrice || post.originalPrice;
              return (
                <div
                  key={post.id}
                  onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                  className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-400/20 transition"
                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#0056D6] text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {post.businessName}
                      </p>
                      <p className="text-[11px] text-blue-200/80 truncate">
                        {post.title}
                      </p>
                    </div>
                  </div>

                  {!hidePrices && price ? (
                    <span className="text-xs font-bold text-blue-200 shrink-0">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* OleVeci Footer */}
          <div className="pt-3 border-t border-blue-400/20 flex items-center justify-between text-xs">
            <div>
              {hidePrices ? null : (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-blue-300/80 block">
                    Presupuesto estimado
                  </span>
                  <span className="text-sm font-bold text-white">
                    {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right text-xs font-bold text-blue-300">
              #ViveTuPueblo ✨
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================================
  // 8. PLANTILLA: ATARDECER SOCIAL & FIESTA (Por defecto / Vibrant Sunset)
  // ======================================================================
  return (
    <div
      ref={cardRef}
      id="invitation-card-element"
      className={`w-full max-w-[430px] rounded-3xl bg-gradient-to-b from-[#250d3a] via-[#1a0c2e] to-[#0d0517] text-white border border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.18)] overflow-hidden select-none relative transition-all duration-300 font-sans ${className}`}
    >
      {/* Top Banner */}
      <div className="p-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold tracking-wide border border-fuchsia-500/30">
          <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>¡Salida & Planazo!</span>
        </div>
        <span className="text-xs font-medium text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
          {defaultCity}
        </span>
      </div>

      {/* Hero Photo Window */}
      <div className="px-4">
        <div className="relative w-full h-54 rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-slate-900">
          {renderHeaderImages()}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3.5 left-4 right-4">
            <InlineEditableTitle
              title={planTitle !== undefined ? planTitle : defaultTitle}
              isEditing={isEditing}
              onChange={onTitleChange}
              fontClass="text-xl font-bold tracking-tight text-white"
              isDarkTheme={true}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between text-xs text-white/90 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 font-medium">
            <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>{defaultTime}</span>
          </div>
          <span className="text-xs font-semibold text-fuchsia-300">
            {posts.length} {posts.length === 1 ? 'parada' : 'paradas'}
          </span>
        </div>

        <InlineEditableNote
          note={personalNote || ''}
          isEditing={isEditing}
          onChange={onNoteChange}
          isDarkTheme={true}
          wrapperClass="bg-fuchsia-950/40 border border-fuchsia-500/25"
          textClass="text-fuchsia-200"
        />

        {/* Stops */}
        <div className="space-y-2">
          {posts.map((post, idx) => {
            const price = post.promotionalPrice || post.originalPrice;
            return (
              <div
                key={post.id}
                onClick={(e) => { e.stopPropagation(); onSelectPost?.(post); }}
                  title={onSelectPost ? `Consultar publicación de ${post.businessName}` : undefined}
                className="relative group/stop cursor-pointer flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-fuchsia-500/25 text-fuchsia-300 text-xs flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {post.businessName}
                    </p>
                    <p className="text-[11px] text-white/70 truncate">
                      {post.title}
                    </p>
                  </div>
                </div>

                {!hidePrices && price ? (
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 shrink-0">
                    ${price.toLocaleString('es-CO')}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            {hidePrices ? null : (
              <div>
                <span className="text-[10px] uppercase font-medium text-white/60 block">
                  Presupuesto total
                </span>
                <span className="text-sm font-bold text-white">
                  {hasPricedItems ? `$${totalPrice.toLocaleString('es-CO')} ` : 'A convenir'}
                </span>
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-fuchsia-400">
              ¡Nos vemos! 🎉
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
