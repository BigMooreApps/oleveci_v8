import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Route,
  Clock,
  Share2,
  Check,
  Search,
  Store,
  Tag,
  Gift,
  Calendar,
  Compass,
  LayoutGrid,
  Zap,
  Columns2,
  Columns3,
  Rows2,
  Rows3,
  Grid2X2,
  Maximize2,
  LayoutPanelTop,
  CircleDot,
  Layers,
  Square,
  Ticket,
  Newspaper,
  Crown,
  Camera,
  ArrowRight,
  ArrowLeft,
  Sliders,
  SlidersHorizontal,
  Wand2,
  Pencil,
  Palette,
  Crop,
  Eye,
  EyeOff,
  CheckCircle2,
  CheckSquare,
  RotateCcw,
  MessageSquare,
  FileText,
  Dices,
  Loader2,
  Coffee,
  Heart,
  Music,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ChevronDown,
  Users,
  DollarSign,
  Wallet,
  Wine,
  Percent,
  Copy,
  Car,
  Utensils,
  Scissors,
  Wrench,
  Bike,
  PawPrint,
  Film,
  Sun,
  Moon,
  Dumbbell,
  ShoppingBag,
  Smile,
  Bookmark,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Post, PlanCategory } from '../types';
import { TagSlashIcon } from './icons/TagSlashIcon';
import { WhatsAppIcon } from './WhatsAppIcon';
import { computeValidityData } from '../utils/validityHelper';
import {
  InvitationCardPreview,
  CardTheme,
  CardTemplate,
  BgLayoutMode,
  ThemeConfig,
  THEMES,
} from './InvitationCardPreview';
import { PlanRouteSection } from './PlanRouteSection';
import { PostDetailModal } from './PostDetailModal';
import { PostDetailCard, PostCardColorTheme } from './PostDetailCard';
import { OleVeciLogo } from './OleVeciLogo';
import {
  READY_PLANS_SEED,
  SimulatedReadyPlan,
  READY_PLAN_CATEGORIES,
  resolvePlanPosts,
} from '../data/readyPlansData';
import { INITIAL_POSTS } from '../data/seedData';

export interface SurpriseTheme extends PostCardColorTheme {
  ambientGlow: string;
  outerBadge: string;
}

export const SURPRISE_COLOR_THEMES: SurpriseTheme[] = [
  {
    id: 'blue_brand',
    name: 'Azul OleVeci',
    isDark: true,
    cardBg: 'bg-[#00173d]',
    headerBg: 'bg-gradient-to-r from-[#00173d] via-[#003894] to-[#0066e0] border-b border-blue-400/30',
    bodyBg: 'bg-[#00173d]',
    footerBg: 'bg-[#00122e] border-t border-blue-500/25',
    borderColor: 'border-blue-500/40 shadow-2xl shadow-blue-950/60',
    headerTextColor: '#ffffff',
    headerSubtextColor: 'text-blue-100/85',
    titleColor: 'text-white',
    descColor: 'text-blue-100/90',
    accentText: 'text-cyan-300',
    badgeBg: 'bg-white/20 text-white border-white/25',
    profileButtonBg: 'bg-white/20 hover:bg-white/30 text-white border border-white/30',
    actionButtonBg: 'bg-white/15 hover:bg-white/25 text-cyan-200 border border-white/20',
    ambientGlow: 'from-[#003894]/40 via-[#0066e0]/20 to-transparent',
    outerBadge: 'bg-blue-600 text-white border-blue-400',
  },
  {
    id: 'dark_vip',
    name: 'Noche VIP Oro',
    isDark: true,
    cardBg: 'bg-[#0a0a0d]',
    headerBg: 'bg-gradient-to-r from-slate-950 via-[#18140e] to-[#251e0e] border-b border-amber-400/30',
    bodyBg: 'bg-[#0a0a0d]',
    footerBg: 'bg-[#08080a] border-t border-amber-400/25',
    borderColor: 'border-amber-400/40 shadow-2xl shadow-amber-950/60',
    headerTextColor: '#fef3c7',
    headerSubtextColor: 'text-amber-200/80',
    titleColor: 'text-amber-50',
    descColor: 'text-slate-300',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    profileButtonBg: 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30',
    actionButtonBg: 'bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/25',
    ambientGlow: 'from-amber-500/25 via-yellow-600/10 to-transparent',
    outerBadge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  },
  {
    id: 'sunset',
    name: 'Atardecer Cálido',
    isDark: true,
    cardBg: 'bg-[#25081a]',
    headerBg: 'bg-gradient-to-r from-[#3a0a25] via-[#75173f] to-[#b83818] border-b border-rose-400/30',
    bodyBg: 'bg-[#25081a]',
    footerBg: 'bg-[#1c0413] border-t border-rose-500/25',
    borderColor: 'border-rose-400/40 shadow-2xl shadow-rose-950/60',
    headerTextColor: '#ffffff',
    headerSubtextColor: 'text-amber-100/85',
    titleColor: 'text-white',
    descColor: 'text-rose-100/90',
    accentText: 'text-amber-300',
    badgeBg: 'bg-amber-300/20 text-amber-200 border-amber-300/30',
    profileButtonBg: 'bg-white/20 hover:bg-white/30 text-white border border-white/25',
    actionButtonBg: 'bg-white/15 hover:bg-white/25 text-amber-200 border border-white/20',
    ambientGlow: 'from-[#75173f]/35 via-[#b83818]/20 to-transparent',
    outerBadge: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
  },
  {
    id: 'emerald',
    name: 'Esmeralda Botánico',
    isDark: true,
    cardBg: 'bg-[#021812]',
    headerBg: 'bg-gradient-to-r from-[#022018] via-[#044332] to-[#075e47] border-b border-emerald-400/30',
    bodyBg: 'bg-[#021812]',
    footerBg: 'bg-[#01120d] border-t border-emerald-500/25',
    borderColor: 'border-emerald-400/40 shadow-2xl shadow-emerald-950/60',
    headerTextColor: '#ffffff',
    headerSubtextColor: 'text-emerald-100/85',
    titleColor: 'text-white',
    descColor: 'text-emerald-100/90',
    accentText: 'text-emerald-300',
    badgeBg: 'bg-emerald-300/20 text-emerald-200 border-emerald-300/30',
    profileButtonBg: 'bg-white/20 hover:bg-white/30 text-white border border-white/25',
    actionButtonBg: 'bg-white/15 hover:bg-white/25 text-emerald-200 border border-white/20',
    ambientGlow: 'from-[#044332]/35 via-[#075e47]/20 to-transparent',
    outerBadge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
  },
  {
    id: 'rose_gold',
    name: 'Oro Rosado Chic',
    isDark: true,
    cardBg: 'bg-[#1a0a14]',
    headerBg: 'bg-gradient-to-r from-[#1c0c16] via-[#381326] to-[#541b38] border-b border-rose-300/30',
    bodyBg: 'bg-[#1a0a14]',
    footerBg: 'bg-[#13060f] border-t border-rose-400/25',
    borderColor: 'border-rose-300/40 shadow-2xl shadow-pink-950/60',
    headerTextColor: '#ffffff',
    headerSubtextColor: 'text-rose-100/85',
    titleColor: 'text-white',
    descColor: 'text-rose-100/90',
    accentText: 'text-rose-300',
    badgeBg: 'bg-rose-300/20 text-rose-200 border-rose-300/30',
    profileButtonBg: 'bg-white/20 hover:bg-white/30 text-white border border-white/25',
    actionButtonBg: 'bg-white/15 hover:bg-white/25 text-rose-200 border border-white/20',
    ambientGlow: 'from-[#381326]/35 via-[#541b38]/20 to-transparent',
    outerBadge: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
  },
  {
    id: 'neon_night',
    name: 'Noche Neón & Bar',
    isDark: true,
    cardBg: 'bg-[#0c0522]',
    headerBg: 'bg-gradient-to-r from-[#070518] via-[#14083a] to-[#2a0c5c] border-b border-fuchsia-400/30',
    bodyBg: 'bg-[#0c0522]',
    footerBg: 'bg-[#080317] border-t border-fuchsia-500/25',
    borderColor: 'border-fuchsia-400/40 shadow-2xl shadow-purple-950/60',
    headerTextColor: '#ffffff',
    headerSubtextColor: 'text-fuchsia-100/85',
    titleColor: 'text-white',
    descColor: 'text-purple-100/90',
    accentText: 'text-fuchsia-300',
    badgeBg: 'bg-fuchsia-400/20 text-fuchsia-300 border-fuchsia-400/30',
    profileButtonBg: 'bg-fuchsia-500/25 hover:bg-fuchsia-500/35 text-fuchsia-200 border border-fuchsia-400/30',
    actionButtonBg: 'bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-400/25',
    ambientGlow: 'from-[#14083a]/40 via-[#2a0c5c]/25 to-transparent',
    outerBadge: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/40',
  },
  {
    id: 'terracotta',
    name: 'Terracota Cálido',
    isDark: true,
    cardBg: 'bg-[#1e0c06]',
    headerBg: 'bg-gradient-to-r from-[#28130a] via-[#4a2010] to-[#713017] border-b border-amber-500/30',
    bodyBg: 'bg-[#1e0c06]',
    footerBg: 'bg-[#140804] border-t border-amber-600/25',
    borderColor: 'border-amber-500/40 shadow-2xl shadow-orange-950/60',
    headerTextColor: '#ffffff',
    headerSubtextColor: 'text-amber-100/85',
    titleColor: 'text-white',
    descColor: 'text-amber-100/90',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-400/20 text-amber-200 border-amber-500/30',
    profileButtonBg: 'bg-white/20 hover:bg-white/30 text-white border border-white/25',
    actionButtonBg: 'bg-white/15 hover:bg-white/25 text-amber-200 border border-white/20',
    ambientGlow: 'from-[#4a2010]/35 via-[#713017]/20 to-transparent',
    outerBadge: 'bg-orange-500/20 text-orange-200 border-orange-400/40',
  },
  {
    id: 'bistro_espresso',
    name: 'Café & Bistró',
    isDark: true,
    cardBg: 'bg-[#140b07]',
    headerBg: 'bg-gradient-to-r from-[#170e09] via-[#2a190f] to-[#402517] border-b border-amber-300/30',
    bodyBg: 'bg-[#140b07]',
    footerBg: 'bg-[#0e0704] border-t border-amber-400/25',
    borderColor: 'border-amber-400/40 shadow-2xl shadow-stone-950/60',
    headerTextColor: '#ffffff',
    headerSubtextColor: 'text-amber-100/85',
    titleColor: 'text-white',
    descColor: 'text-amber-100/90',
    accentText: 'text-amber-300',
    badgeBg: 'bg-amber-200/20 text-amber-100 border-amber-300/30',
    profileButtonBg: 'bg-white/20 hover:bg-white/30 text-white border border-white/25',
    actionButtonBg: 'bg-white/15 hover:bg-white/25 text-amber-200 border border-white/20',
    ambientGlow: 'from-[#2a190f]/35 via-[#402517]/20 to-transparent',
    outerBadge: 'bg-amber-600/20 text-amber-200 border-amber-400/40',
  },
  {
    id: 'cyber_glow',
    name: 'Cian Profundo',
    isDark: true,
    cardBg: 'bg-[#04151e]',
    headerBg: 'bg-gradient-to-r from-[#031118] via-[#052633] to-[#0a3e52] border-b border-cyan-400/30',
    bodyBg: 'bg-[#04151e]',
    footerBg: 'bg-[#020d13] border-t border-cyan-500/25',
    borderColor: 'border-cyan-400/40 shadow-2xl shadow-cyan-950/60',
    headerTextColor: '#ffffff',
    headerSubtextColor: 'text-cyan-100/85',
    titleColor: 'text-white',
    descColor: 'text-cyan-100/90',
    accentText: 'text-cyan-300',
    badgeBg: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
    profileButtonBg: 'bg-cyan-500/25 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-400/30',
    actionButtonBg: 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/25',
    ambientGlow: 'from-[#052633]/40 via-[#0a3e52]/25 to-transparent',
    outerBadge: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
  },
  {
    id: 'nordic_light',
    name: 'Blanco Nórdico Suizo',
    isDark: false,
    cardBg: 'bg-white',
    headerBg: 'bg-white border-b border-slate-200',
    bodyBg: 'bg-white',
    footerBg: 'bg-white border-t border-slate-200',
    borderColor: 'border-slate-300 shadow-2xl shadow-slate-300/40',
    headerTextColor: 'rgb(8, 28, 68)',
    headerSubtextColor: 'text-slate-500',
    titleColor: 'text-[#0A1D3C]',
    descColor: 'text-slate-600',
    accentText: 'text-blue-600',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
    profileButtonBg: 'text-[#007af7] bg-blue-50 hover:bg-blue-100 border border-blue-200/60',
    actionButtonBg: 'bg-[#EAF2FC] hover:bg-[#d6e7fc] text-[#0A62F4]',
    ambientGlow: 'from-blue-200/25 via-slate-200/20 to-transparent',
    outerBadge: 'bg-slate-100 text-slate-700 border-slate-300',
  },
];

interface ItineraryBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBusiness?: (businessId: string) => void;
  onSelectPost?: (post: Post) => void;
  initialMode?: BuilderMode;
  onNavigateToDescubre?: () => void;
  isAdminCreation?: boolean;
  onSaveAsReadyPlan?: (plan: SimulatedReadyPlan) => void;
}

export type WizardStep = 1 | 2 | 3;
export type BuilderMode = 'mode_select' | 'automatic' | 'manual';

export type TemplateCategory = 'all' | 'oficial' | 'vip' | 'tickets' | 'editorial' | 'gastro' | 'social';

export interface TemplatePreset {
  id: string;
  name: string;
  subtitle: string;
  category: TemplateCategory;
  theme: CardTheme;
  cardTemplate: CardTemplate;
  bgLayout: BgLayoutMode;
  icon: React.ComponentType<{ className?: string }>;
  visualTag: string;
  fontFamilyTag: string;
  swatchColors: [string, string, string]; // [bg, accent, contrast]
  cardBgClass: string;
  textColorClass: string;
  borderColorClass: string;
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  // 0. Oficial OleVeci (Predeterminada por defecto)
  {
    id: 'oleveci_signature',
    name: 'Azul OleVeci Signature',
    subtitle: 'Diseño oficial con paleta y marca OleVeci (Predeterminado)',
    category: 'oficial',
    theme: 'blue_brand',
    cardTemplate: 'oleveci_brand',
    bgLayout: 'horizontal',
    icon: Compass,
    visualTag: 'Oficial OleVeci',
    fontFamilyTag: 'Modern Sans',
    swatchColors: ['#002257', '#007AF7', '#38BDF8'],
    cardBgClass: 'bg-[#002257]',
    textColorClass: 'text-sky-300',
    borderColorClass: 'border-sky-400/40',
  },

  // 1. VIP & Lujo
  {
    id: 'vip_gold',
    name: 'VIP Gold Obsidian',
    subtitle: 'Obsidiana profunda con destellos en oro champagne y números romanos',
    category: 'vip',
    theme: 'dark_vip',
    cardTemplate: 'luxury_vip',
    bgLayout: 'diagonal',
    icon: Crown,
    visualTag: 'Obsidiana & Oro',
    fontFamilyTag: 'Serif Clásico',
    swatchColors: ['#0A0A0D', '#D4AF37', '#FFFFFF'],
    cardBgClass: 'bg-[#0A0A0D]',
    textColorClass: 'text-[#D4AF37]',
    borderColorClass: 'border-[#D4AF37]/50',
  },
  {
    id: 'rose_gold_obsidian',
    name: 'Oro Rosado Chic',
    subtitle: 'Platino rosado, sobriedad y atmósfera de cóctel elegante',
    category: 'vip',
    theme: 'rose_gold',
    cardTemplate: 'rose_gold',
    bgLayout: 'vertical',
    icon: Sparkles,
    visualTag: 'Oro Rosado',
    fontFamilyTag: 'Serif Elegante',
    swatchColors: ['#2B1020', '#FB7185', '#FFF1F2'],
    cardBgClass: 'bg-[#2B1020]',
    textColorClass: 'text-rose-300',
    borderColorClass: 'border-rose-400/40',
  },
  {
    id: 'emerald_lounge',
    name: 'Esmeralda Imperial',
    subtitle: 'Verde botánico y relax premium para desconectar con estilo',
    category: 'vip',
    theme: 'emerald',
    cardTemplate: 'emerald',
    bgLayout: 'diagonal',
    icon: Crown,
    visualTag: 'Verde Esmeralda',
    fontFamilyTag: 'Serif Botánico',
    swatchColors: ['#033024', '#34D399', '#ECFDF5'],
    cardBgClass: 'bg-[#033024]',
    textColorClass: 'text-emerald-300',
    borderColorClass: 'border-emerald-400/40',
  },

  // 2. Editorial & Minimal
  {
    id: 'vogue_editorial',
    name: 'Vogue Marfil',
    subtitle: 'Fondo marfil cálido, tipografía de revista y alta gama',
    category: 'editorial',
    theme: 'nordic_light',
    cardTemplate: 'editorial_vogue',
    bgLayout: 'grid',
    icon: Newspaper,
    visualTag: 'Revista Marfil',
    fontFamilyTag: 'Vogue Serif Italic',
    swatchColors: ['#FAF7F2', '#1C1917', '#E7DFC6'],
    cardBgClass: 'bg-[#FAF7F2]',
    textColorClass: 'text-stone-900',
    borderColorClass: 'border-stone-300',
  },
  {
    id: 'nordic_clean',
    name: 'Blanco Nórdico Suizo',
    subtitle: 'Minimalismo puro, lienzo blanco, espacio generoso y simetría',
    category: 'editorial',
    theme: 'nordic_light',
    cardTemplate: 'minimal_nordic',
    bgLayout: 'horizontal',
    icon: Square,
    visualTag: 'Suizo Minimal',
    fontFamilyTag: 'Swiss Sans',
    swatchColors: ['#FFFFFF', '#0F172A', '#0056D6'],
    cardBgClass: 'bg-white',
    textColorClass: 'text-slate-900',
    borderColorClass: 'border-slate-200',
  },
  {
    id: 'vintage_gazette',
    name: 'Gaceta Urbana',
    subtitle: 'Estilo crónica y periódico vecinal en tonos papel antiguo',
    category: 'editorial',
    theme: 'terracotta',
    cardTemplate: 'vintage_press',
    bgLayout: 'cinematic',
    icon: Newspaper,
    visualTag: 'Papel Prensa',
    fontFamilyTag: 'Prensa Antigua',
    swatchColors: ['#F5EFE6', '#451A03', '#D97706'],
    cardBgClass: 'bg-[#F5EFE6]',
    textColorClass: 'text-amber-950',
    borderColorClass: 'border-stone-300',
  },

  // 3. Boletos & Eventos
  {
    id: 'golden_ticket',
    name: 'Boleto Retro Dorado',
    subtitle: 'Ticket de admisión vintage con cortes perforados y código de pase',
    category: 'tickets',
    theme: 'sunset',
    cardTemplate: 'retro_ticket',
    bgLayout: 'vertical',
    icon: Ticket,
    visualTag: 'Ticket Perforado',
    fontFamilyTag: 'Monospace Vintage',
    swatchColors: ['#140F0A', '#F59E0B', '#FDE68A'],
    cardBgClass: 'bg-[#140F0A]',
    textColorClass: 'text-amber-300',
    borderColorClass: 'border-amber-500/40',
  },
  {
    id: 'boarding_pass_vip',
    name: 'Pase de Embarque',
    subtitle: 'Tarjeta de ruta para salidas, paseos y excursiones vecinales',
    category: 'tickets',
    theme: 'blue_brand',
    cardTemplate: 'boarding_pass',
    bgLayout: 'horizontal',
    icon: Compass,
    visualTag: 'Pase de Ruta',
    fontFamilyTag: 'Ticket Sans',
    swatchColors: ['#002257', '#38BDF8', '#FFFFFF'],
    cardBgClass: 'bg-[#002257]',
    textColorClass: 'text-sky-300',
    borderColorClass: 'border-sky-400/40',
  },

  // 4. Gastronomía & Café
  {
    id: 'bistro_parisien',
    name: 'Café & Bistró Gourmet',
    subtitle: 'Madera cálida, café tostado y menú degustación para buen paladar',
    category: 'gastro',
    theme: 'bistro_espresso',
    cardTemplate: 'bistro_espresso',
    bgLayout: 'diagonal',
    icon: Coffee,
    visualTag: 'Espresso & Mesa',
    fontFamilyTag: 'Bistró Serif',
    swatchColors: ['#22140C', '#FDE68A', '#D97706'],
    cardBgClass: 'bg-[#22140C]',
    textColorClass: 'text-amber-200',
    borderColorClass: 'border-amber-700/40',
  },
  {
    id: 'terracotta_sunset',
    name: 'Terracota & Sobremesa',
    subtitle: 'Tonos arcilla cálida para almuerzos y largas charlas con amigos',
    category: 'gastro',
    theme: 'terracotta',
    cardTemplate: 'terracotta',
    bgLayout: 'cinematic',
    icon: Coffee,
    visualTag: 'Terracota Cálido',
    fontFamilyTag: 'Cálido Sans',
    swatchColors: ['#33170C', '#F97316', '#FEF3C7'],
    cardBgClass: 'bg-[#33170C]',
    textColorClass: 'text-amber-200',
    borderColorClass: 'border-amber-600/40',
  },

  // 5. Recuerdos & Social
  {
    id: 'polaroid_memories',
    name: 'Scrapbook Polaroids',
    subtitle: 'Fotos instantáneas con marco blanco y washi tape para recuerdos',
    category: 'social',
    theme: 'sunset',
    cardTemplate: 'polaroid_memories',
    bgLayout: 'polaroid',
    icon: Camera,
    visualTag: 'Fotos Polaroid',
    fontFamilyTag: 'Casual Amigos',
    swatchColors: ['#1E1611', '#FFFFFF', '#F59E0B'],
    cardBgClass: 'bg-[#1E1611]',
    textColorClass: 'text-amber-100',
    borderColorClass: 'border-amber-700/30',
  },
  {
    id: 'sunset_party',
    name: 'Atardecer & Fiesta',
    subtitle: 'Gradiente cálido, vibra social festiva y energía contagiosa',
    category: 'social',
    theme: 'sunset',
    cardTemplate: 'sunset_party',
    bgLayout: 'diagonal',
    icon: Sparkles,
    visualTag: 'Atardecer Social',
    fontFamilyTag: 'Modern Social',
    swatchColors: ['#250D3A', '#D946EF', '#FB923C'],
    cardBgClass: 'bg-[#250D3A]',
    textColorClass: 'text-fuchsia-300',
    borderColorClass: 'border-fuchsia-400/40',
  },
  {
    id: 'neon_night_club',
    name: 'Noche Neón & Bar',
    subtitle: 'Índigo y violeta con destellos cian para noche de copas y música',
    category: 'social',
    theme: 'neon_night',
    cardTemplate: 'neon_cyberpunk',
    bgLayout: 'portal',
    icon: Music,
    visualTag: 'Lounge Neón',
    fontFamilyTag: 'Nightlife Sans',
    swatchColors: ['#09071A', '#E879F9', '#22D3EE'],
    cardBgClass: 'bg-[#09071A]',
    textColorClass: 'text-cyan-300',
    borderColorClass: 'border-fuchsia-500/40',
  },
];

const PHOTO_LAYOUTS = [
  { id: 'cinematic' as BgLayoutMode, label: 'Foto Completa', icon: Maximize2 },
  { id: 'horizontal' as BgLayoutMode, label: 'Lado a Lado (2 Columnas)', icon: Columns2 },
  { id: 'vertical' as BgLayoutMode, label: 'Arriba y Abajo (2 Filas)', icon: Rows2 },
  { id: 'diagonal' as BgLayoutMode, label: 'Corte Diagonal', icon: Zap },
  { id: 'grid' as BgLayoutMode, label: 'Cuadrícula Bento', icon: Grid2X2 },
  { id: 'asymmetric' as BgLayoutMode, label: 'Mosaico Asimétrico', icon: LayoutPanelTop },
  { id: 'columns3' as BgLayoutMode, label: 'Tríptico (3 Columnas)', icon: Columns3 },
  { id: 'rows3' as BgLayoutMode, label: '3 Franjas Horizontales', icon: Rows3 },
  { id: 'polaroid' as BgLayoutMode, label: 'Polaroids Flotantes', icon: Camera },
  { id: 'portal' as BgLayoutMode, label: 'Arco Editorial', icon: Compass },
  { id: 'circle' as BgLayoutMode, label: 'Lente Circular', icon: CircleDot },
];

const TITLE_SUGGESTIONS = [
  'Cita Romántica Inolvidable',
  'De Parche con Amigos',
  'Ruta Cafetera & Postre',
  'Noche de Cócteles & Buena Mesa',
  'Almuerzo Especial Vecinal',
  'Tarde de Desconexión & Charla',
  'Celebración Especial',
  'Tour Gastronómico Local',
];

const TIME_SUGGESTIONS = [
  'Hoy 7:30 PM',
  'Hoy 5:00 PM',
  'Mañana 4:30 PM',
  'Este Viernes 8:00 PM',
  'Este Sábado 6:30 PM',
  'Domingo Brunch 11:30 AM',
];

const HOUR_OPTIONS = [
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
  '9:30 PM',
  '10:00 PM',
];

// Helper to extract start and end validity timestamps for an advertisement / post
function getPostDateRange(post: Post): { startMs: number; endMs: number | null } {
  let startMs = 0;
  if (post.validitySchedule?.validoDesde) {
    const p = new Date(post.validitySchedule.validoDesde + 'T00:00:00').getTime();
    if (!isNaN(p)) startMs = p;
  } else if (post.validitySchedule?.startDate) {
    const p = new Date(post.validitySchedule.startDate + 'T00:00:00').getTime();
    if (!isNaN(p)) startMs = p;
  } else if (post.startsAt) {
    const p = new Date(post.startsAt).getTime();
    if (!isNaN(p)) startMs = p;
  } else if (post.createdAt) {
    const p = new Date(post.createdAt).getTime();
    if (!isNaN(p)) startMs = p;
  }

  let endMs: number | null = null;
  if (post.expiresAt) {
    const p = new Date(post.expiresAt).getTime();
    if (!isNaN(p)) endMs = p;
  } else if (post.validitySchedule?.validoHasta) {
    const timePart = post.validitySchedule.validoHastaHora || '23:59:59';
    const p = new Date(`${post.validitySchedule.validoHasta}T${timePart}`).getTime();
    if (!isNaN(p)) endMs = p;
  } else if (post.validitySchedule?.endDate) {
    const p = new Date(`${post.validitySchedule.endDate}T23:59:59`).getTime();
    if (!isNaN(p)) endMs = p;
  } else if (post.validitySchedule?.specificDate) {
    const timePart = post.validitySchedule.exactTime || '23:59:59';
    const p = new Date(`${post.validitySchedule.specificDate}T${timePart}`).getTime();
    if (!isNaN(p)) endMs = p;
  } else if (post.validitySchedule) {
    const computed = computeValidityData(post.validitySchedule);
    if (computed.expiresAt) {
      const p = new Date(computed.expiresAt).getTime();
      if (!isNaN(p)) endMs = p;
    }
  }

  return { startMs, endMs };
}

// Check if a post/promotion is active and valid for a specific target date
function isPostValidForDate(post: Post, targetDate: Date): boolean {
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0).getTime();
  const targetEndOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999).getTime();
  const targetDayOfWeek = targetDate.getDay(); // 0 = Dom, 1 = Lun, etc.
  const targetIsoDate = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

  // 1. Overall date bounds from post
  const { startMs, endMs } = getPostDateRange(post);
  if (startMs > 0 && targetEndOfDay < startMs) {
    return false; // Promo has not started yet by target date
  }
  if (endMs !== null && targetMidnight > endMs) {
    return false; // Promo has already expired before target date
  }

  // 2. Schedule-specific constraints
  const schedule = post.validitySchedule;
  if (schedule) {
    // Range bounds in schedule
    if (schedule.validoDesde && targetIsoDate < schedule.validoDesde) {
      return false;
    }
    if (schedule.validoHasta && targetIsoDate > schedule.validoHasta) {
      return false;
    }
    if (schedule.startDate && targetIsoDate < schedule.startDate) {
      return false;
    }
    if (schedule.endDate && targetIsoDate > schedule.endDate) {
      return false;
    }

    // Specific date mode
    if (schedule.mode === 'specific_date' && schedule.specificDate) {
      if (schedule.specificDate !== targetIsoDate) {
        return false;
      }
    }

    // Quick presets
    if (schedule.mode === 'quick' && schedule.quickPreset) {
      const now = new Date();
      const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowIso = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

      if (schedule.quickPreset === 'today_10pm' || schedule.quickPreset === 'today_night') {
        if (targetIsoDate !== todayIso) return false;
      } else if (schedule.quickPreset === 'tomorrow') {
        if (targetIsoDate !== todayIso && targetIsoDate !== tomorrowIso) return false;
      } else if (schedule.quickPreset === 'weekend') {
        if (targetDayOfWeek !== 6 && targetDayOfWeek !== 0) return false;
      } else if (schedule.quickPreset === 'fri_sun') {
        if (targetDayOfWeek !== 5 && targetDayOfWeek !== 6 && targetDayOfWeek !== 0) return false;
      }
    }

    // Days of week mode or happy hour with days
    if (
      (schedule.mode === 'days_of_week' || schedule.mode === 'happy_hour') &&
      schedule.daysOfWeek &&
      schedule.daysOfWeek.length > 0 &&
      schedule.daysOfWeek.length < 7
    ) {
      if (!schedule.daysOfWeek.includes(targetDayOfWeek)) {
        return false;
      }
    }

    // Table schedule mode
    if (schedule.mode === 'table' && schedule.scheduleTable && schedule.scheduleTable.length > 0) {
      const row = schedule.scheduleTable.find((r) => r.dayIndex === targetDayOfWeek);
      if (!row || !row.active) {
        return false;
      }
      if (row.fechaInicio && targetIsoDate < row.fechaInicio) return false;
      if (row.fechaFin && targetIsoDate > row.fechaFin) return false;
    }
  }

  return true;
}

export type PlanTimeSlot = 'any' | 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'specific';
export type PlanVibe = 'all' | 'romantic' | 'friends' | 'family' | 'cafe' | 'party';
export type PlanBudget = 'all' | 'budget' | 'medium' | 'premium' | 'discount';

// Helper to convert time strings like "7:30 PM", "14:00", "2:30 pm" to minutes from midnight
function parseTimeStringToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const str = timeStr.trim().toUpperCase();
  const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3];
    if (meridiem) {
      if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  }
  return null;
}

// Check if a post/promotion is active and valid for a specific target hour/time
function isPostValidForTime(post: Post, targetMinutes: number | null, targetDate: Date | null): boolean {
  if (targetMinutes === null) return true; // No specific hour restriction

  const schedule = post.validitySchedule;
  if (!schedule) {
    if (post.expiryLabel && targetDate) {
      const now = new Date();
      const isTargetToday = targetDate.toDateString() === now.toDateString();
      if (isTargetToday) {
        const parsed = parseTimeStringToMinutes(post.expiryLabel);
        if (parsed !== null && targetMinutes > parsed) {
          return false;
        }
      }
    }
    return true;
  }

  // 1. Time range (e.g. Happy hour or active hourly window)
  if (schedule.hasTimeRange && schedule.startTime && schedule.endTime) {
    const sMin = parseTimeStringToMinutes(schedule.startTime);
    const eMin = parseTimeStringToMinutes(schedule.endTime);
    if (sMin !== null && eMin !== null) {
      if (sMin <= eMin) {
        if (targetMinutes < sMin || targetMinutes > eMin) {
          return false;
        }
      } else {
        // Overnight window
        if (targetMinutes < sMin && targetMinutes > eMin) {
          return false;
        }
      }
    }
  }

  // 2. Cut-off expiry hour (validoHastaHora)
  if (schedule.validoHastaHora && targetDate) {
    const targetIso = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    const isExpiryDay = schedule.validoHasta === targetIso || schedule.specificDate === targetIso;
    if (isExpiryDay) {
      const limitMin = parseTimeStringToMinutes(schedule.validoHastaHora);
      if (limitMin !== null && targetMinutes > limitMin) {
        return false;
      }
    }
  }

  // 3. Quick preset hour limits (e.g. today_10pm)
  if (schedule.quickPreset && targetDate) {
    const now = new Date();
    const isTargetToday = targetDate.toDateString() === now.toDateString();
    if (isTargetToday && schedule.quickPreset === 'today_10pm') {
      if (targetMinutes > 22 * 60) return false;
    }
  }

  // 4. Schedule table hours per day
  if (schedule.scheduleTable && schedule.scheduleTable.length > 0 && targetDate) {
    const dayOfWeek = targetDate.getDay();
    const row = schedule.scheduleTable.find((r) => r.dayIndex === dayOfWeek);
    if (row && row.active && row.horaInicio && row.horaFin) {
      const sMin = parseTimeStringToMinutes(row.horaInicio);
      const eMin = parseTimeStringToMinutes(row.horaFin);
      if (sMin !== null && eMin !== null) {
        if (sMin <= eMin) {
          if (targetMinutes < sMin || targetMinutes > eMin) return false;
        } else {
          if (targetMinutes < sMin && targetMinutes > eMin) return false;
        }
      }
    }
  }

  return true;
}

// Check if post matches a plan occasion / vibe
function matchesVibe(post: Post, vibe: PlanVibe): boolean {
  if (vibe === 'all') return true;
  const text = `${post.title} ${post.description} ${(post.tags || []).join(' ')} ${post.businessName} ${post.categoryId}`.toLowerCase();

  if (vibe === 'romantic') {
    return /rom[aá]ntic|cita|pareja|vino|cena|íntim|intim|velas|aniversario|gourmet/i.test(text);
  }
  if (vibe === 'friends') {
    return /amig|parche|cerveza|combo|alitas|burger|hamburguesa|pizza|bar|pub|picad|futbol|rumba/i.test(text);
  }
  if (vibe === 'family') {
    return /famil|niñ|nin|helad|postre|brunch|parque|almuerzo|kids|infantil|pizza/i.test(text);
  }
  if (vibe === 'cafe') {
    return /caf[eé]|postre|reposter|panader|t[eé]|convers|lectura|brunch|bakery|cafeter/i.test(text);
  }
  if (vibe === 'party') {
    return /rumba|fiesta|coctel|cóctel|licor|trago|discoteca|m[uú]sica en vivo|dj|noche|shots|bar/i.test(text);
  }
  return true;
}

// Check if post matches a plan budget
function matchesBudget(post: Post, budget: PlanBudget): boolean {
  if (budget === 'all') return true;
  const price = post.promotionalPrice || post.originalPrice || 0;

  if (budget === 'discount') {
    return Boolean(post.originalPrice && post.promotionalPrice && post.promotionalPrice < post.originalPrice);
  }
  if (!price) return true;

  if (budget === 'budget') {
    return price <= 35000;
  }
  if (budget === 'medium') {
    return price > 25000 && price <= 75000;
  }
  if (budget === 'premium') {
    return price > 70000;
  }
  return true;
}

// Detect if a post represents a heavy main dish (plato fuerte)
export function isMainDishPost(post: Post): boolean {
  if (post.categoryId === 'cat_comida_rapida' || post.categoryId === 'cat_restaurantes') {
    return true;
  }
  const text = `${post.title || ''} ${post.description || ''} ${(post.tags || []).join(' ')}`.toLowerCase();
  const mainDishKeywords = [
    'hamburguesa', 'burger', 'alitas', 'wings', 'pizza', 'picada', 'parrillada', 'costillas',
    'chuzo', 'perro caliente', 'hot dog', 'bandeja', 'sushi', 'tacos', 'carne', 'almuerzo',
    'plato fuerte', 'combo', 'sandwich', 'pasta', 'lasagna', 'arroz', 'menu del dia', 'pechuga'
  ];
  return mainDishKeywords.some((kw) => text.includes(kw));
}

// Check if post matches a PlanCategory's allowed categories or explicit planCategoryId
export function matchesPlanCategory(post: Post, planCat: PlanCategory | undefined): boolean {
  if (!planCat) return true;
  if (post.planCategoryId && post.planCategoryId === planCat.id) return true;
  if (
    post.planCategoryName &&
    planCat.name &&
    post.planCategoryName.toLowerCase() === planCat.name.toLowerCase()
  ) {
    return true;
  }
  if (!planCat.allowedCategoryIds || planCat.allowedCategoryIds.length === 0) return true;
  return planCat.allowedCategoryIds.includes(post.categoryId);
}

// Logical sequence priority for stops in real life
export function getPostSequenceOrder(post: Post): number {
  const cat = post.categoryId || '';
  const text = `${post.title || ''} ${post.description || ''}`.toLowerCase();

  // 1. First: services requiring drop-off / waiting (car wash, workshop, mechanics)
  if (cat === 'cat_autos' || cat === 'cat_servicios' || /lavad|taller|mantenimiento|aceite|revision/i.test(text)) {
    return 1;
  }
  // 2. Second: personal care & grooming while car or order is being attended (barber, salon)
  if (cat === 'cat_belleza' || /barber|corte|uñas|spa|cejas|facial/i.test(text)) {
    return 2;
  }
  // 3. Third: main dish (lunch, dinner, restaurant)
  if (isMainDishPost(post)) {
    return 3;
  }
  // 4. Fourth: coffee, bakery, dessert, pastry
  if (cat === 'cat_cafes' || /caf[eé]|postre|helad|panader|reposter/i.test(text)) {
    return 4;
  }
  // 5. Fifth: evening drinks, pub, cocktails, nightlife
  if (cat === 'cat_bares' || /cerveza|coctel|cóctel|bar|pub|trago|shots|discoteca/i.test(text)) {
    return 5;
  }
  return 3;
}

// Helper to render icon for a plan category
export const renderPlanCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
  switch (iconName) {
    case 'Car':
      return <Car className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Smile':
      return <Smile className={className} />;
    case 'Wine':
      return <Wine className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Dumbbell':
      return <Dumbbell className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Bike':
      return <Bike className={className} />;
    case 'PawPrint':
      return <PawPrint className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Film':
      return <Film className={className} />;
    case 'Sun':
      return <Sun className={className} />;
    case 'Moon':
      return <Moon className={className} />;
    default:
      return <Compass className={className} />;
  }
};

export const ItineraryBuilderModal: React.FC<ItineraryBuilderModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'manual',
  onNavigateToDescubre,
  onSelectBusiness,
  onSelectPost,
  isAdminCreation = false,
  onSaveAsReadyPlan,
}) => {
  const {
    posts,
    businesses,
    currentCity,
    currentSector,
    isPostActive,
    categories,
    planCategories,
    getDistanceKm,
    favorites,
    toggleFavorite,
    trackInteraction,
    addReadyPlan,
    municipalities,
  } = useApp();

  // Admin Publishing state for Ready Plans
  const [showAdminPublishModal, setShowAdminPublishModal] = useState(false);
  const [adminPublishCategory, setAdminPublishCategory] = useState<string>('plan_cita_romantica');
  const [adminPublishMunicipality, setAdminPublishMunicipality] = useState<string>(currentCity || 'Cajicá');
  const [adminPublishDayType, setAdminPublishDayType] = useState<'weekend' | 'weekday'>('weekend');
  const [adminPublishTimeOfDay, setAdminPublishTimeOfDay] = useState<'mañana' | 'tarde' | 'noche'>('tarde');
  const [adminPublishCustomTags, setAdminPublishCustomTags] = useState<string>('');

  // Selected Plan Category state (e.g. Diligencias & Autos, Cuidado Personal, etc.)
  const [selectedPlanCategoryId, setSelectedPlanCategoryId] = useState<string>('all');

  // Mode Selection: Siempre abre directamente en modo manual guiado en 3 pasos
  const [builderMode, setBuilderMode] = useState<BuilderMode>(() =>
    initialMode && initialMode !== 'mode_select' ? initialMode : 'manual'
  );
  const [regenerationCount, setRegenerationCount] = useState<number>(0);
  const [isAutoGenerating, setIsAutoGenerating] = useState<boolean>(false);
  const [currentSurprisePlan, setCurrentSurprisePlan] = useState<SimulatedReadyPlan | null>(null);
  const currentSurprisePlanRef = useRef<SimulatedReadyPlan | null>(null);
  const [currentSurprisePost, setCurrentSurprisePost] = useState<Post | null>(null);
  const currentSurprisePostRef = useRef<Post | null>(null);
  const [surpriseThemeIndex, setSurpriseThemeIndex] = useState<number>(0);
  const prevIsOpenRef = useRef(false);

  // 3-Step Wizard Navigation State (used when builderMode === 'manual')
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Selections & Configuration State (Siempre preseleccionar las 2 primeras opciones)
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>(() => {
    return posts.slice(0, 2).map((p) => p.id);
  });
  const [selectedPresetId, setSelectedPresetId] = useState<string>('oleveci_signature');
  const [planTitle, setPlanTitle] = useState('Nuestra salida especial');
  const [scheduledTime, setScheduledTime] = useState('Hoy 7:30 PM');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [selectedHour, setSelectedHour] = useState<string>('7:30 PM');
  const [personalNote, setPersonalNote] = useState('');
  const [hidePrices, setHidePricesState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('oleveci_hide_prices') === 'true';
    } catch {
      return false;
    }
  });

  const setHidePrices = (value: boolean | ((prev: boolean) => boolean)) => {
    setHidePricesState((prev) => {
      const nextVal = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem('oleveci_hide_prices', String(nextVal));
      } catch {
        // ignore storage errors
      }
      return nextVal;
    });
  };

  // Template, Theme & Image Layout Fine-Tuning (Default: Azul OleVeci Oficial)
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('blue_brand');
  const [cardTemplate, setCardTemplate] = useState<CardTemplate>('oleveci_brand');
  const [bgLayout, setBgLayout] = useState<BgLayoutMode>('horizontal');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  // Vistas de Anuncio vs Tarjeta vs Mapa
  const [autoViewMode, setAutoViewMode] = useState<'ad' | 'card' | 'map'>('ad');
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [manualStep1View, setManualStep1View] = useState<'catalog' | 'map'>('catalog');
  const [manualStep2View, setManualStep2View] = useState<'card' | 'map'>('card');

  // Asegurar que nunca se muestre la pantalla intermedia de selección ("Crear manual"), yendo directo al flujo
  useEffect(() => {
    if (builderMode === 'mode_select') {
      setBuilderMode('manual');
      setCurrentStep(1);
    }
  }, [builderMode]);

  // Metadatos calculados del anuncio sorpresa actual
  const surpriseBusiness = useMemo(() => {
    if (!currentSurprisePost) return null;
    return businesses.find((b) => b.id === currentSurprisePost.businessId) || null;
  }, [currentSurprisePost, businesses]);

  const surpriseDistance = useMemo(() => {
    if (!currentSurprisePost?.coordinates) return null;
    return getDistanceKm(currentSurprisePost.coordinates);
  }, [currentSurprisePost, getDistanceKm]);

  const surpriseDiscountPercent = useMemo(() => {
    if (!currentSurprisePost?.originalPrice || !currentSurprisePost?.promotionalPrice) return null;
    if (currentSurprisePost.originalPrice <= currentSurprisePost.promotionalPrice) return null;
    return Math.round(
      ((currentSurprisePost.originalPrice - currentSurprisePost.promotionalPrice) /
        currentSurprisePost.originalPrice) *
        100
    );
  }, [currentSurprisePost]);

  // Step 2: Dropdown de Plantillas
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const templateButtonRef = useRef<HTMLButtonElement>(null);

  const currentSelectedPreset = useMemo(() => {
    return TEMPLATE_PRESETS.find((p) => p.id === selectedPresetId) || TEMPLATE_PRESETS[0];
  }, [selectedPresetId]);

  const CurrentSelectedPresetIcon = currentSelectedPreset.icon;

  const currentLayoutMeta = useMemo(() => {
    return PHOTO_LAYOUTS.find((l) => l.id === bgLayout) || PHOTO_LAYOUTS[0];
  }, [bgLayout]);

  // Step 1: Fecha y Hora (solo fechas y horas activas según las publicaciones)
  const [selectedPlanHour, setSelectedPlanHour] = useState<string>('any');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewMonth, setCalendarViewMonth] = useState<Date>(() => new Date());
  const [isHourPickerOpen, setIsHourPickerOpen] = useState(false);

  // Step 1: Presupuesto (límite máximo dispuesto a gastar en el plan)
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [isBudgetPickerOpen, setIsBudgetPickerOpen] = useState(false);
  const [customBudgetInput, setCustomBudgetInput] = useState<string>('');
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null);

  // Modo Automático: Cantidad de paradas (hasta 4 paradas)
  const [autoStopsCount, setAutoStopsCount] = useState<number>(2);
  const [isStopsPickerOpen, setIsStopsPickerOpen] = useState(false);
  const autoStopsDropdownRef = useRef<HTMLDivElement>(null);
  const autoStopsButtonRef = useRef<HTMLButtonElement>(null);

  // Tipo de Plan Picker state and refs
  const [isPlanCategoryPickerOpen, setIsPlanCategoryPickerOpen] = useState(false);
  const planCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const planCategoryButtonRef = useRef<HTMLButtonElement>(null);
  const autoPlanCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const autoPlanCategoryButtonRef = useRef<HTMLButtonElement>(null);

  const calendarDropdownRef = useRef<HTMLDivElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);
  const hourDropdownRef = useRef<HTMLDivElement>(null);
  const hourButtonRef = useRef<HTMLButtonElement>(null);
  const budgetDropdownRef = useRef<HTMLDivElement>(null);
  const budgetButtonRef = useRef<HTMLButtonElement>(null);

  // Dropdown refs for automatic mode parameter bar
  const autoCalendarDropdownRef = useRef<HTMLDivElement>(null);
  const autoCalendarButtonRef = useRef<HTMLButtonElement>(null);
  const autoHourDropdownRef = useRef<HTMLDivElement>(null);
  const autoHourButtonRef = useRef<HTMLButtonElement>(null);
  const autoBudgetDropdownRef = useRef<HTMLDivElement>(null);
  const autoBudgetButtonRef = useRef<HTMLButtonElement>(null);

  const BUDGET_PRESETS = [
    { label: '$30.000', value: 30000 },
    { label: '$50.000', value: 50000 },
    { label: '$80.000', value: 80000 },
    { label: '$100.000', value: 100000 },
    { label: '$150.000', value: 150000 },
    { label: '$200.000', value: 200000 },
    { label: '$300.000', value: 300000 },
  ];

  // Lista de horas del plan
  const PLAN_HOURS_OPTIONS = [
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
    '7:30 PM',
    '8:00 PM',
    '8:30 PM',
    '9:00 PM',
    '10:00 PM',
    '11:00 PM',
  ];

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Publicaciones de la ciudad y sector actual activas para calcular disponibilidad
  const cityKey = (currentCity || '').toLowerCase().trim();
  const hasSpecificCity = Boolean(cityKey && cityKey !== 'all');
  const sectorKey = (currentSector || '').toLowerCase().trim();
  const hasSpecificSector = Boolean(sectorKey && sectorKey !== 'all');

  const activeCityPosts = useMemo(() => {
    return posts.filter((post) => {
      const postCity = (post.businessCity || '').toLowerCase().trim();
      if (hasSpecificCity && postCity && postCity !== cityKey) {
        return false;
      }
      if (hasSpecificSector) {
        const postSector = (post.businessSector || '').toLowerCase().trim();
        if (postSector && !postSector.includes(sectorKey) && !sectorKey.includes(postSector)) {
          return false;
        }
      }
      return isPostActive(post);
    });
  }, [posts, hasSpecificCity, cityKey, hasSpecificSector, sectorKey, isPostActive]);

  // Determinar si una fecha tiene publicaciones disponibles
  const isDateAvailable = useCallback(
    (date: Date): boolean => {
      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const targetMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      if (targetMidnight < todayMidnight) return false;

      return activeCityPosts.some((post) => isPostValidForDate(post, date));
    },
    [activeCityPosts]
  );

  // Determinar si una hora tiene publicaciones disponibles para la fecha seleccionada
  const isHourAvailable = useCallback(
    (hourStr: string, date: Date | null): boolean => {
      if (!date) return true;
      const minutes = parseTimeStringToMinutes(hourStr);
      if (minutes === null) return false;

      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (minutes < currentMinutes) return false;
      }

      return activeCityPosts.some(
        (post) => isPostValidForDate(post, date) && isPostValidForTime(post, minutes, date)
      );
    },
    [activeCityPosts]
  );

  // Inicializar selectedDateKey en la primera fecha disponible a partir de hoy
  useEffect(() => {
    if (!selectedDateKey) {
      const now = new Date();
      let foundKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      for (let i = 0; i < 45; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        if (isDateAvailable(d)) {
          foundKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          break;
        }
      }
      setSelectedDateKey(foundKey);
    }
  }, [isDateAvailable, selectedDateKey]);

  // Target Date object para filtrado de posts en Step 1
  const targetPlanDate = useMemo<Date | null>(() => {
    if (!selectedDateKey) return null;
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    if (y && m && d) {
      return new Date(y, m - 1, d);
    }
    return null;
  }, [selectedDateKey]);

  // Target Minutes para filtrado de posts en Step 1
  const effectiveTargetMinutes = useMemo<number | null>(() => {
    if (selectedPlanHour === 'any' || !selectedPlanHour) return null;
    return parseTimeStringToMinutes(selectedPlanHour);
  }, [selectedPlanHour]);

  // Texto formateado para el botón de Fecha
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateKey) return 'Seleccionar fecha';
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    if (!y || !m || !d) return 'Seleccionar fecha';
    const dateObj = new Date(y, m - 1, d);

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMidnight = dateObj.getTime();

    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    if (targetMidnight === todayMidnight) {
      return `Hoy, ${d} de ${months[m - 1]}`;
    }
    if (targetMidnight === todayMidnight + 86400000) {
      return `Mañana, ${d} de ${months[m - 1]}`;
    }
    return `${daysOfWeek[dateObj.getDay()]}, ${d} de ${months[m - 1]}`;
  }, [selectedDateKey]);

  // Texto formateado para el botón de Hora
  const formattedSelectedHour = useMemo(() => {
    if (selectedPlanHour === 'any') return 'Cualquier hora';
    return selectedPlanHour;
  }, [selectedPlanHour]);

  // Navegación de meses del calendario
  const canGoPrevMonth = useMemo(() => {
    const now = new Date();
    return (
      calendarViewMonth.getFullYear() > now.getFullYear() ||
      (calendarViewMonth.getFullYear() === now.getFullYear() &&
        calendarViewMonth.getMonth() > now.getMonth())
    );
  }, [calendarViewMonth]);

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    setCalendarViewMonth(new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarViewMonth(new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() + 1, 1));
  };

  // Cuadrícula de días del calendario
  const calendarDays = useMemo(() => {
    const year = calendarViewMonth.getFullYear();
    const month = calendarViewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Domingo
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateObj: Date;
      dateKey: string;
      isAvailable: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    const now = new Date();
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isAvail = isDateAvailable(dateObj);
      const isSel = selectedDateKey === dateKey;
      const isToday = dateKey === todayDateStr;

      days.push({
        dayNumber: d,
        dateObj,
        dateKey,
        isAvailable: isAvail,
        isSelected: isSel,
        isToday,
      });
    }

    return {
      year,
      month,
      firstDay,
      days,
    };
  }, [calendarViewMonth, isDateAvailable, selectedDateKey]);

  // Al seleccionar una fecha del calendario
  const handleSelectDateFromCalendar = (dateObj: Date, dateKey: string) => {
    setSelectedDateKey(dateKey);
    setIsCalendarOpen(false);

    // Si la hora actual ya no está disponible para esa fecha, volver a 'any'
    if (selectedPlanHour !== 'any' && !isHourAvailable(selectedPlanHour, dateObj)) {
      setSelectedPlanHour('any');
    }

    // Sincronizar scheduledTime
    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();
    const isTomorrow = dateObj.toDateString() === new Date(now.getTime() + 86400000).toDateString();
    const hourLabel = selectedPlanHour !== 'any' ? selectedPlanHour : selectedHour;
    if (isToday) {
      setScheduledTime(`Hoy ${hourLabel}`);
    } else if (isTomorrow) {
      setScheduledTime(`Mañana ${hourLabel}`);
    } else {
      const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      setScheduledTime(`${daysOfWeek[dateObj.getDay()]} ${dateObj.getDate()} • ${hourLabel}`);
    }
  };

  // Al seleccionar una hora del picker
  const handleSelectHourFromPicker = (hour: string) => {
    setSelectedPlanHour(hour);
    setIsHourPickerOpen(false);

    if (hour !== 'any') {
      setSelectedHour(hour);
    }

    // Sincronizar scheduledTime
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const dateObj = y && m && d ? new Date(y, m - 1, d) : new Date();
    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();
    const isTomorrow = dateObj.toDateString() === new Date(now.getTime() + 86400000).toDateString();
    const hourLabel = hour !== 'any' ? hour : selectedHour;
    if (isToday) {
      setScheduledTime(`Hoy ${hourLabel}`);
    } else if (isTomorrow) {
      setScheduledTime(`Mañana ${hourLabel}`);
    } else {
      const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      setScheduledTime(`${daysOfWeek[dateObj.getDay()]} ${dateObj.getDate()} • ${hourLabel}`);
    }
  };

  // Filter & Search in Step 1 (Matching Discover / Feed pattern)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Categories list for Step 1 filter
  const categoriesList = useMemo(() => {
    const list: { id: string; label: string }[] = [{ id: 'all', label: 'Todos los Comercios' }];
    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        list.push({ id: cat.id, label: cat.name });
      });
    } else {
      list.push(
        { id: 'cat_restaurantes', label: 'Restaurantes' },
        { id: 'cat_cafes', label: 'Cafés & Panadería' },
        { id: 'cat_comida_rapida', label: 'Comida Rápida' },
        { id: 'cat_planes_eventos', label: 'Planes & Eventos' },
        { id: 'cat_belleza', label: 'Belleza & Barbería' }
      );
    }
    return list;
  }, [categories]);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(target)
      ) {
        setIsCategoryFilterOpen(false);
      }
      if (
        calendarDropdownRef.current &&
        !calendarDropdownRef.current.contains(target) &&
        calendarButtonRef.current &&
        !calendarButtonRef.current.contains(target) &&
        (!autoCalendarDropdownRef.current || !autoCalendarDropdownRef.current.contains(target)) &&
        (!autoCalendarButtonRef.current || !autoCalendarButtonRef.current.contains(target))
      ) {
        setIsCalendarOpen(false);
      }
      if (
        hourDropdownRef.current &&
        !hourDropdownRef.current.contains(target) &&
        hourButtonRef.current &&
        !hourButtonRef.current.contains(target) &&
        (!autoHourDropdownRef.current || !autoHourDropdownRef.current.contains(target)) &&
        (!autoHourButtonRef.current || !autoHourButtonRef.current.contains(target))
      ) {
        setIsHourPickerOpen(false);
      }
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(target) &&
        templateButtonRef.current &&
        !templateButtonRef.current.contains(target)
      ) {
        setIsTemplateDropdownOpen(false);
      }
      if (
        budgetDropdownRef.current &&
        !budgetDropdownRef.current.contains(target) &&
        budgetButtonRef.current &&
        !budgetButtonRef.current.contains(target) &&
        (!autoBudgetDropdownRef.current || !autoBudgetDropdownRef.current.contains(target)) &&
        (!autoBudgetButtonRef.current || !autoBudgetButtonRef.current.contains(target))
      ) {
        setIsBudgetPickerOpen(false);
      }
      if (
        autoStopsDropdownRef.current &&
        !autoStopsDropdownRef.current.contains(target) &&
        autoStopsButtonRef.current &&
        !autoStopsButtonRef.current.contains(target)
      ) {
        setIsStopsPickerOpen(false);
      }
      if (
        planCategoryDropdownRef.current &&
        !planCategoryDropdownRef.current.contains(target) &&
        planCategoryButtonRef.current &&
        !planCategoryButtonRef.current.contains(target) &&
        (!autoPlanCategoryDropdownRef.current || !autoPlanCategoryDropdownRef.current.contains(target)) &&
        (!autoPlanCategoryButtonRef.current || !autoPlanCategoryButtonRef.current.contains(target))
      ) {
        setIsPlanCategoryPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-dismiss budget warnings after 5 seconds
  useEffect(() => {
    if (budgetWarning) {
      const timer = setTimeout(() => {
        setBudgetWarning(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [budgetWarning]);

  // Sharing State
  const [copied, setCopied] = useState(false);

  const invitationCardRef = useRef<HTMLDivElement>(null);

  // Active plan categories and currently selected plan category
  const activePlanCategories = useMemo(() => {
    return planCategories.filter((p) => p.isActive);
  }, [planCategories]);

  const activeTargetPlanCategory = useMemo(() => {
    if (selectedPlanCategoryId === 'all') return undefined;
    return planCategories.find((p) => p.id === selectedPlanCategoryId);
  }, [planCategories, selectedPlanCategoryId]);

  // Filter posts available in current city and active (and valid for chosen target date & hour)
  const availablePosts = useMemo(() => {
    return posts.filter((post) => {
      const postCity = (post.businessCity || '').toLowerCase().trim();
      if (hasSpecificCity && postCity && postCity !== cityKey) {
        return false;
      }
      if (hasSpecificSector) {
        const postSector = (post.businessSector || '').toLowerCase().trim();
        if (postSector && !postSector.includes(sectorKey) && !sectorKey.includes(postSector)) {
          return false;
        }
      }
      if (!isPostActive(post)) {
        return false;
      }
      // Timing / date filter in Step 1
      if (targetPlanDate && !isPostValidForDate(post, targetPlanDate)) {
        return false;
      }
      // Hour filter in Step 1 (validates promotions according to selected time)
      if (!isPostValidForTime(post, effectiveTargetMinutes, targetPlanDate)) {
        return false;
      }
      // Plan Category filter (Diligencias, Cuidado Personal, Parche, etc.)
      if (selectedPlanCategoryId !== 'all' && activeTargetPlanCategory) {
        if (!matchesPlanCategory(post, activeTargetPlanCategory)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesBiz = post.businessName.toLowerCase().includes(q);
        const matchesSector = (post.businessSector || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesBiz && !matchesSector) {
          return false;
        }
      }
      if (selectedCategoryFilter !== 'all') {
        const catFilter = selectedCategoryFilter.toLowerCase();
        const postCatId = (post.categoryId || '').toLowerCase();
        const postCat = ((post as any).category || '').toLowerCase();
        if (postCatId !== catFilter && postCat !== catFilter) {
          return false;
        }
      }
      // Budget limit filter: individual items cannot exceed total budget limit
      if (maxBudget !== null) {
        const itemPrice = post.promotionalPrice || post.originalPrice || 0;
        if (itemPrice > maxBudget) {
          return false;
        }
      }
      return true;
    });
  }, [posts, hasSpecificCity, cityKey, hasSpecificSector, sectorKey, isPostActive, targetPlanDate, effectiveTargetMinutes, searchQuery, selectedCategoryFilter, maxBudget, selectedPlanCategoryId, activeTargetPlanCategory]);

  // Selected posts objects
  const selectedPosts = useMemo(() => {
    if (builderMode === 'automatic' && currentSurprisePost) {
      return [currentSurprisePost];
    }
    if (builderMode === 'automatic' && currentSurprisePlan) {
      return resolvePlanPosts(currentSurprisePlan, posts);
    }
    return selectedPostIds
      .map(
        (id) =>
          posts.find((p) => p.id === id) ||
          INITIAL_POSTS.find((p) => p.id === id)
      )
      .filter((p): p is Post => Boolean(p));
  }, [selectedPostIds, posts, builderMode, currentSurprisePost, currentSurprisePlan]);

  // Siempre asegurar que las 2 primeras opciones del listado estén seleccionadas por defecto
  useEffect(() => {
    if (isOpen && selectedPostIds.length === 0 && availablePosts.length > 0) {
      setSelectedPostIds(availablePosts.slice(0, Math.min(2, availablePosts.length)).map((p) => p.id));
    }
  }, [isOpen, availablePosts, selectedPostIds.length]);

  // Keep selectedPostIds synced to availablePosts when timing mode changes
  useEffect(() => {
    if (selectedPostIds.length > 0 && availablePosts.length > 0) {
      const validSelectedIds = selectedPostIds.filter((id) =>
        availablePosts.some((p) => p.id === id)
      );
      if (validSelectedIds.length === 0) {
        setSelectedPostIds(availablePosts.slice(0, Math.min(2, availablePosts.length)).map((p) => p.id));
      } else if (validSelectedIds.length !== selectedPostIds.length) {
        setSelectedPostIds(validSelectedIds);
      }
    }
  }, [availablePosts]);

  // Total price calculations
  const { totalPrice, hasPricedItems } = useMemo(() => {
    let total = 0;
    let count = 0;
    selectedPosts.forEach((p) => {
      const price = p.promotionalPrice || p.originalPrice;
      if (price && price > 0) {
        total += price;
        count++;
      }
    });
    return {
      totalPrice: total,
      hasPricedItems: count > 0,
    };
  }, [selectedPosts]);

  // Handler for setting maximum budget limit
  const handleSetMaxBudget = (budget: number | null) => {
    setMaxBudget(budget);
    setIsBudgetPickerOpen(false);
    setBudgetWarning(null);

    if (budget !== null) {
      // Ajustar la selección actual para garantizar que el plan no sobrepase el valor fijado
      let runningSum = 0;
      const prunedIds: string[] = [];
      let removedCount = 0;

      for (const id of selectedPostIds) {
        const post = posts.find((p) => p.id === id);
        if (!post) continue;
        const price = post.promotionalPrice || post.originalPrice || 0;
        if (runningSum + price <= budget) {
          prunedIds.push(id);
          runningSum += price;
        } else {
          removedCount++;
        }
      }

      if (removedCount > 0) {
        setSelectedPostIds(prunedIds);
        setBudgetWarning(
          `Se ajustó la selección: se removieron ${removedCount} ${removedCount === 1 ? 'parada' : 'paradas'} para respetar tu presupuesto límite de $${budget.toLocaleString('es-CO')} COP.`
        );
      }
    }
  };

  const handleApplyCustomBudget = () => {
    const cleanNum = parseInt(customBudgetInput.replace(/\D/g, ''), 10);
    if (!isNaN(cleanNum) && cleanNum > 0) {
      handleSetMaxBudget(cleanNum);
      setCustomBudgetInput('');
    }
  };

  const hasActiveCustomFilters =
    selectedPlanHour !== 'any' ||
    searchQuery.trim() !== '' ||
    selectedCategoryFilter !== 'all' ||
    selectedPlanCategoryId !== 'all' ||
    maxBudget !== null;

  const handleResetStep1Filters = () => {
    setSelectedPlanHour('any');
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    setSelectedPlanCategoryId('all');
    setMaxBudget(null);
    setBudgetWarning(null);
    const now = new Date();
    let foundKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    for (let i = 0; i < 45; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      if (isDateAvailable(d)) {
        foundKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        break;
      }
    }
    setSelectedDateKey(foundKey);
  };

  // Toggle card selection in Step 1 with strict budget enforcement
  const handleTogglePost = (postId: string) => {
    if (selectedPostIds.includes(postId)) {
      setSelectedPostIds(selectedPostIds.filter((id) => id !== postId));
      setBudgetWarning(null);
    } else {
      if (selectedPostIds.length >= 4) {
        return; // Max 4 stops for ideal layout
      }

      const postToAdd = posts.find((p) => p.id === postId);
      const postPrice = postToAdd?.promotionalPrice || postToAdd?.originalPrice || 0;

      // VALIDACIÓN ESTRICTA: El plan no deberá sobrepasar el presupuesto fijado
      if (maxBudget !== null && postPrice > 0) {
        const newTotal = totalPrice + postPrice;
        if (newTotal > maxBudget) {
          const remaining = Math.max(0, maxBudget - totalPrice);
          setBudgetWarning(
            `No puedes agregar "${postToAdd?.title || 'esta parada'}" ($${postPrice.toLocaleString('es-CO')} COP) porque superaría tu presupuesto de $${maxBudget.toLocaleString('es-CO')} COP (saldo disponible: $${remaining.toLocaleString('es-CO')} COP).`
          );
          return;
        }
      }

      setBudgetWarning(null);
      setSelectedPostIds([...selectedPostIds, postId]);
    }
  };

  const handleRemovePost = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedPostIds(selectedPostIds.filter((id) => id !== postId));
    setBudgetWarning(null);
  };

  // Select a pre-configured template preset in Step 2
  const handleSelectPreset = (preset: TemplatePreset) => {
    setSelectedPresetId(preset.id);
    setSelectedTheme(preset.theme);
    setCardTemplate(preset.cardTemplate);
    setBgLayout(preset.bgLayout);
  };

  // Step 2: In-Card Direct Editing State & Handlers
  const [isCardEditing, setIsCardEditing] = useState(false);

  // Cycle directly through colors / presets without dropdown
  const handleCycleTheme = () => {
    const currentIndex = TEMPLATE_PRESETS.findIndex((p) => p.id === selectedPresetId);
    const nextIndex = (currentIndex + 1) % TEMPLATE_PRESETS.length;
    const nextPreset = TEMPLATE_PRESETS[nextIndex];
    handleSelectPreset(nextPreset);
  };

  // Cycle directly through photo cut layouts without dropdown
  const handleCyclePhotoLayout = () => {
    const currentIndex = PHOTO_LAYOUTS.findIndex((l) => l.id === bgLayout);
    const nextIndex = (currentIndex + 1) % PHOTO_LAYOUTS.length;
    setBgLayout(PHOTO_LAYOUTS[nextIndex].id);
  };

  // Step 1 Surprise Me: ONLY selects random activities/stops within budget
  const handleSurpriseMePlans = () => {
    const candidatePool = (availablePosts.length >= 2 ? availablePosts : posts).filter((p) => {
      const price = p.promotionalPrice || p.originalPrice || 0;
      return maxBudget === null || price <= maxBudget;
    });

    if (candidatePool.length === 0) {
      setBudgetWarning('No se encontraron actividades disponibles dentro de este presupuesto.');
      return;
    }

    const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
    const picked: string[] = [];
    let runningSum = 0;
    const targetCount = Math.min(Math.floor(Math.random() * 2) + 2, Math.min(4, candidatePool.length));

    for (const post of shuffled) {
      if (picked.length >= targetCount) break;
      const price = post.promotionalPrice || post.originalPrice || 0;
      if (maxBudget === null || runningSum + price <= maxBudget) {
        picked.push(post.id);
        runningSum += price;
      }
    }

    if (picked.length > 0) {
      setSelectedPostIds(picked);
      setBudgetWarning(null);
    }
  };

  // Step 2 Surprise Me: ONLY selects a random template without touching the plans from Step 1
  const handleSurpriseMeTemplate = () => {
    const randomPreset = TEMPLATE_PRESETS[Math.floor(Math.random() * TEMPLATE_PRESETS.length)];
    handleSelectPreset(randomPreset);
  };

  // Shuffle card design without changing stops in Automatic Mode
  const handleShuffleDesign = () => {
    const otherPresets = TEMPLATE_PRESETS.filter((p) => p.id !== selectedPresetId);
    const chosenPreset =
      otherPresets.length > 0
        ? otherPresets[Math.floor(Math.random() * otherPresets.length)]
        : TEMPLATE_PRESETS[0];
    handleSelectPreset(chosenPreset);
  };

  // Automatic Plan Generator: Combines date, time, budget, and Plan Category rules, or operates in 100% surprise mode
  const generateAutomaticPlan = useCallback(
    (overrideParams?: {
      isSurprise?: boolean;
      dateKey?: string;
      hour?: string;
      budget?: number | null;
      stopsCount?: number;
      planCategoryId?: string;
    }) => {
      setIsAutoGenerating(true);
      setRegenerationCount((prev) => prev + 1);

      const isSurprise = overrideParams?.isSurprise ?? (builderMode === 'automatic');

      if (isSurprise) {
        // MODO 100% SORPRESA: Presentar los anuncios de descubrir uno por uno
        const activePosts = posts.filter((p) => isPostActive(p));

        // Priorizar anuncios de la ciudad actual si existen coincidencias
        let pool = activePosts;
        if (currentCity) {
          const cityMatches = activePosts.filter(
            (p) => (p.businessCity || '').toLowerCase() === currentCity.toLowerCase()
          );
          if (cityMatches.length > 0) {
            pool = cityMatches;
          }
        }
        if (pool.length === 0) {
          pool = activePosts.length > 0 ? activePosts : posts;
        }

        // Aplicar filtros activos (Tipo de plan, Fecha, Hora, Presupuesto)
        const effectivePlanCatId =
          overrideParams?.planCategoryId !== undefined
            ? overrideParams.planCategoryId
            : selectedPlanCategoryId;
        const effectiveDateKey =
          overrideParams?.dateKey !== undefined ? overrideParams.dateKey : selectedDateKey;
        const effectiveHour =
          overrideParams?.hour !== undefined ? overrideParams.hour : selectedPlanHour;
        const effectiveBudget =
          overrideParams?.budget !== undefined ? overrideParams.budget : maxBudget;

        let filteredPool = pool;

        // 1. Filtro Tipo de Plan
        if (effectivePlanCatId !== 'all') {
          const targetCat = planCategories.find((p) => p.id === effectivePlanCatId && p.isActive);
          if (targetCat) {
            const matches = filteredPool.filter((p) => matchesPlanCategory(p, targetCat));
            if (matches.length > 0) filteredPool = matches;
          }
        }

        // 2. Filtro Fecha
        let dateObj: Date | null = null;
        if (effectiveDateKey) {
          const [y, m, d] = effectiveDateKey.split('-').map(Number);
          if (y && m && d) {
            dateObj = new Date(y, m - 1, d);
          }
        }
        if (dateObj) {
          const matches = filteredPool.filter((p) => isPostValidForDate(p, dateObj!));
          if (matches.length > 0) filteredPool = matches;
        }

        // 3. Filtro Hora
        if (effectiveHour && effectiveHour !== 'any') {
          const minutes = parseTimeStringToMinutes(effectiveHour);
          if (minutes !== null) {
            const matches = filteredPool.filter((p) => isPostValidForTime(p, minutes, dateObj));
            if (matches.length > 0) filteredPool = matches;
          }
        }

        // 4. Filtro Presupuesto
        if (effectiveBudget !== null && effectiveBudget > 0) {
          const matches = filteredPool.filter((p) => {
            const price = p.promotionalPrice || p.originalPrice || 0;
            return price <= effectiveBudget;
          });
          if (matches.length > 0) filteredPool = matches;
        }

        const poolToUse = filteredPool.length > 0 ? filteredPool : pool;

        // Evitar repetir inmediatamente el anuncio actual si hay más opciones
        const currentId = currentSurprisePostRef.current?.id;
        const candidates = poolToUse.filter((p) => p.id !== currentId);
        const finalPool = candidates.length > 0 ? candidates : poolToUse;

        if (finalPool.length > 0) {
          const chosenPost = finalPool[Math.floor(Math.random() * finalPool.length)];
          currentSurprisePostRef.current = chosenPost;
          setCurrentSurprisePost(chosenPost);
          setCurrentSurprisePlan(null);
          currentSurprisePlanRef.current = null;

          // Parada única correspondiente al anuncio
          setSelectedPostIds([chosenPost.id]);

          // Rotar a un color de fondo dinámico y diferente para evitar monotonía
          setSurpriseThemeIndex((prev) => {
            let next = Math.floor(Math.random() * SURPRISE_COLOR_THEMES.length);
            if (next === prev) {
              next = (prev + 1) % SURPRISE_COLOR_THEMES.length;
            }
            return next;
          });

          // Configurar datos para la tarjeta y presentación
          setPlanTitle(chosenPost.title);
          setScheduledTime(chosenPost.expiryLabel || 'Disponible hoy');
          setPersonalNote(chosenPost.description || '');

          setSelectedTheme('blue_brand');
          setCardTemplate('oleveci_brand');
          setBgLayout('horizontal');
        }

        // Siempre volver a la vista del anuncio al sorprender con uno nuevo
        setAutoViewMode('ad');

        setTimeout(() => {
          setIsAutoGenerating(false);
        }, 320);
        return;
      }

      const activeDateKey = isSurprise ? '' : (overrideParams?.dateKey !== undefined ? overrideParams.dateKey : selectedDateKey);
      const activeHour = isSurprise ? 'any' : (overrideParams?.hour !== undefined ? overrideParams.hour : selectedPlanHour);
      const activeBudget = isSurprise ? null : (overrideParams?.budget !== undefined ? overrideParams.budget : maxBudget);
      const activeStops = isSurprise ? (Math.floor(Math.random() * 2) + 2) : (overrideParams?.stopsCount !== undefined ? overrideParams.stopsCount : autoStopsCount);
      const activePlanCatId = isSurprise
        ? 'all'
        : (overrideParams?.planCategoryId !== undefined
            ? overrideParams.planCategoryId
            : selectedPlanCategoryId);

      const targetPlanCat =
        activePlanCatId !== 'all'
          ? planCategories.find((p) => p.id === activePlanCatId && p.isActive)
          : undefined;

      // Calculate target date
      let dateObj: Date | null = null;
      if (activeDateKey) {
        const [y, m, d] = activeDateKey.split('-').map(Number);
        if (y && m && d) {
          dateObj = new Date(y, m - 1, d);
        }
      } else {
        dateObj = new Date();
      }

      // Calculate target minutes
      const targetMins =
        activeHour !== 'any' && activeHour ? parseTimeStringToMinutes(activeHour) : null;

      // 1. Strict pool: matching city, sector, active, valid for date, valid for hour, price <= budget, and matching PlanCategory
      let candidatePool = posts.filter((post) => {
        const postCity = (post.businessCity || '').toLowerCase().trim();
        if (hasSpecificCity && postCity && postCity !== cityKey) return false;
        if (hasSpecificSector) {
          const postSector = (post.businessSector || '').toLowerCase().trim();
          if (postSector && !postSector.includes(sectorKey) && !sectorKey.includes(postSector)) return false;
        }
        if (!isPostActive(post)) return false;
        if (!isSurprise) {
          if (dateObj && !isPostValidForDate(post, dateObj)) return false;
          if (targetMins !== null && !isPostValidForTime(post, targetMins, dateObj)) return false;
          const price = post.promotionalPrice || post.originalPrice || 0;
          if (activeBudget !== null && price > activeBudget) return false;
          if (targetPlanCat && !matchesPlanCategory(post, targetPlanCat)) return false;
        }
        return true;
      });

      // Relax if surprise and only when no city is restricted
      if (candidatePool.length < 2 && !hasSpecificCity) {
        candidatePool = posts.filter((post) => isPostActive(post));
      }

      // 2. If strict pool is empty because of time, relax time constraint
      if (candidatePool.length === 0 && targetMins !== null) {
        candidatePool = posts.filter((post) => {
          const postCity = (post.businessCity || '').toLowerCase().trim();
          if (hasSpecificCity && postCity && postCity !== cityKey) return false;
          if (hasSpecificSector) {
            const postSector = (post.businessSector || '').toLowerCase().trim();
            if (postSector && !postSector.includes(sectorKey) && !sectorKey.includes(postSector)) return false;
          }
          if (!isPostActive(post)) return false;
          if (dateObj && !isPostValidForDate(post, dateObj)) return false;
          const price = post.promotionalPrice || post.originalPrice || 0;
          if (activeBudget !== null && price > activeBudget) return false;
          if (targetPlanCat && !matchesPlanCategory(post, targetPlanCat)) return false;
          return true;
        });
      }

      // 3. If still empty, relax date constraint
      if (candidatePool.length === 0) {
        candidatePool = posts.filter((post) => {
          const postCity = (post.businessCity || '').toLowerCase().trim();
          if (hasSpecificCity && postCity && postCity !== cityKey) return false;
          if (hasSpecificSector) {
            const postSector = (post.businessSector || '').toLowerCase().trim();
            if (postSector && !postSector.includes(sectorKey) && !sectorKey.includes(postSector)) return false;
          }
          if (!isPostActive(post)) return false;
          const price = post.promotionalPrice || post.originalPrice || 0;
          if (activeBudget !== null && price > activeBudget) return false;
          if (targetPlanCat && !matchesPlanCategory(post, targetPlanCat)) return false;
          return true;
        });
      }

      // 4. If pool is completely empty
      if (candidatePool.length === 0) {
        setIsAutoGenerating(false);
        setBudgetWarning(
          targetPlanCat
            ? `No encontramos suficientes opciones para "${targetPlanCat.name}" en ${currentCity || 'tu zona'}. Prueba ampliando el presupuesto o eligiendo otra opción.`
            : `No se encontraron planes para este presupuesto en ${currentCity || 'tu zona'}. Prueba ampliando el monto.`
        );
        return false;
      }

      setBudgetWarning(null);

      // Prioritize diversity on regenerations: try to exclude currently selected items if pool > 3
      let poolToSample = candidatePool;
      if (candidatePool.length > 3 && selectedPostIds.length > 0) {
        const nonSelected = candidatePool.filter((p) => !selectedPostIds.includes(p.id));
        if (nonSelected.length >= 2) {
          poolToSample = nonSelected;
        }
      }

      // Enforce coherence rules: maxMainDishes (avoid burger + wings) & preventDuplicateCategories
      const maxMainDishes = targetPlanCat?.maxMainDishes ?? 1;
      const preventDuplicateCategories = targetPlanCat?.preventDuplicateCategories ?? true;

      // Shuffle candidate pool
      const shuffled = [...poolToSample].sort(() => 0.5 - Math.random());
      const chosenIds: string[] = [];
      const chosenCategoryIds = new Set<string>();
      const chosenBusinessIds = new Set<string>();
      let mainDishCount = 0;
      let runningSum = 0;
      const desiredCount = Math.max(1, Math.min(4, activeStops));
      const targetCount = Math.min(desiredCount, candidatePool.length);

      for (const post of shuffled) {
        if (chosenIds.length >= targetCount) break;
        if (chosenBusinessIds.has(post.businessId)) continue;
        if (preventDuplicateCategories && chosenCategoryIds.has(post.categoryId)) continue;

        const isMain = isMainDishPost(post);
        if (isMain && mainDishCount >= maxMainDishes) {
          continue; // Prevent multiple heavy meals in a single plan
        }

        const price = post.promotionalPrice || post.originalPrice || 0;
        if (activeBudget === null || runningSum + price <= activeBudget) {
          chosenIds.push(post.id);
          chosenBusinessIds.add(post.businessId);
          chosenCategoryIds.add(post.categoryId);
          if (isMain) mainDishCount++;
          runningSum += price;
        }
      }

      // If budget or duplicate constraints resulted in fewer stops than targetCount, fill safely
      if (chosenIds.length < targetCount && activeBudget !== null) {
        for (const post of shuffled) {
          if (chosenIds.length >= targetCount) break;
          if (chosenIds.includes(post.id) || chosenBusinessIds.has(post.businessId)) continue;
          const isMain = isMainDishPost(post);
          if (isMain && mainDishCount >= maxMainDishes) continue;

          const price = post.promotionalPrice || post.originalPrice || 0;
          if (runningSum + price <= activeBudget) {
            chosenIds.push(post.id);
            chosenBusinessIds.add(post.businessId);
            chosenCategoryIds.add(post.categoryId);
            if (isMain) mainDishCount++;
            runningSum += price;
          }
        }
      }

      // Fallback if none picked
      if (chosenIds.length === 0 && candidatePool.length > 0) {
        chosenIds.push(shuffled[0].id);
      }

      // Sort chosen stops in logical real-life sequence (e.g. Car wash -> Barber -> Main dish -> Cafe -> Drinks)
      const chosenPostObjects = chosenIds
        .map((id) => posts.find((p) => p.id === id))
        .filter((p): p is Post => Boolean(p));

      chosenPostObjects.sort((a, b) => getPostSequenceOrder(a) - getPostSequenceOrder(b));
      const sortedChosenIds = chosenPostObjects.map((p) => p.id);

      setSelectedPostIds(sortedChosenIds);

      // Pick a random template preset
      const otherPresets = TEMPLATE_PRESETS.filter((p) => p.id !== selectedPresetId);
      const chosenPreset =
        otherPresets.length > 0
          ? otherPresets[Math.floor(Math.random() * otherPresets.length)]
          : TEMPLATE_PRESETS[0];

      setSelectedPresetId(chosenPreset.id);
      setSelectedTheme(chosenPreset.theme);
      setCardTemplate(chosenPreset.cardTemplate);
      setBgLayout(chosenPreset.bgLayout);

      // Dynamic title according to PlanCategory or 100% Surprise Mode
      if (isSurprise) {
        const SURPRISE_TITLES = [
          `¡Sorpresa en ${currentCity || 'tu zona'}! 🎲`,
          'Ruta Inesperada & Buena Vibra ✨',
          'Tardeo Secreto entre Amigos 🥂',
          'Aventura Espontánea & Sabores 🍕',
          'Plan Clandestino Imperdible 🔥',
          'Paseo Sorpresa del Vecindario 🛵',
          'Joyas Locales para Salir Hoy 🚀',
          'Noche Mágica & Buena Onda 🍸',
          'Ruta Gourmet & Brindis 🍷',
          'Paseo Espontáneo & Café ☕',
        ];
        setPlanTitle(SURPRISE_TITLES[Math.floor(Math.random() * SURPRISE_TITLES.length)]);
        setScheduledTime('Hoy • Salida Sorpresa 🎲');
      } else if (targetPlanCat?.defaultTitleSuggestions && targetPlanCat.defaultTitleSuggestions.length > 0) {
        const suggestions = targetPlanCat.defaultTitleSuggestions;
        setPlanTitle(suggestions[Math.floor(Math.random() * suggestions.length)]);
      } else if (targetPlanCat) {
        setPlanTitle(`Plan ${targetPlanCat.name}`);
      } else {
        const AUTO_TITLES = [
          'Nuestra Salida Especial',
          'Ruta de Sabores & Brindis',
          'Plan Imperdible',
          'Tardeo & Buena Onda',
          'Noche de Fiesta & Cócteles',
          'Plan Entre Amigos',
          'Salida de Fin de Semana',
          'Cita & Gastronomía',
        ];
        setPlanTitle(AUTO_TITLES[Math.floor(Math.random() * AUTO_TITLES.length)]);
      }

      // Synchronize scheduledTime if not surprise
      if (!isSurprise && dateObj) {
        const now = new Date();
        const isToday = dateObj.toDateString() === now.toDateString();
        const isTomorrow =
          dateObj.toDateString() === new Date(now.getTime() + 86400000).toDateString();
        const hourLabel =
          activeHour !== 'any' && activeHour ? activeHour : selectedHour;
        if (isToday) {
          setScheduledTime(`Hoy ${hourLabel}`);
        } else if (isTomorrow) {
          setScheduledTime(`Mañana ${hourLabel}`);
        } else {
          const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          setScheduledTime(`${daysOfWeek[dateObj.getDay()]} ${dateObj.getDate()} • ${hourLabel}`);
        }
      }

      setTimeout(() => {
        setIsAutoGenerating(false);
      }, 250);

      return true;
    },
    [
      posts,
      cityKey,
      isPostActive,
      selectedDateKey,
      selectedPlanHour,
      maxBudget,
      autoStopsCount,
      currentCity,
      selectedPostIds,
      selectedPresetId,
      selectedHour,
      selectedPlanCategoryId,
      planCategories,
      builderMode,
    ]
  );

  const handleStartAutomaticMode = () => {
    setBuilderMode('automatic');
    setAutoViewMode('ad');
    generateAutomaticPlan({ isSurprise: true });
  };

  const handleStartManualMode = () => {
    setBuilderMode('manual');
    setCurrentStep(1);
    setManualStep1View('catalog');
    setManualStep2View('map');
    setSelectedPresetId('oleveci_signature');
    setSelectedTheme('blue_brand');
    setCardTemplate('oleveci_brand');
    setBgLayout('horizontal');
  };

  const handleCustomizeAutoPlan = () => {
    if (currentSurprisePost) {
      setSelectedPostIds([currentSurprisePost.id]);
      setPlanTitle(currentSurprisePost.title);
    }
    setBuilderMode('manual');
    setCurrentStep(2);
    setManualStep2View('map');
  };

  const handleSurpriseWhatsApp = () => {
    const post = currentSurprisePost || selectedPosts[0];
    if (!post) return;
    const biz = businesses.find((b) => b.id === post.businessId);
    const rawWa = (post.businessWhatsapp || biz?.whatsapp || '').replace(/\D/g, '');
    const cleanWa = rawWa.length === 10 && rawWa.startsWith('3') ? `57${rawWa}` : rawWa;
    if (!cleanWa) return;
    trackInteraction(post.id, 'whatsapp');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oleveci.com';
    const postUrl = `${origin}/anuncio/${post.id}`;
    const msg = `¡Hola! Vi esta publicación en OléVeci y me gustaría más información:\n*${post.title}*\n${postUrl}`;
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const mode = initialMode && initialMode !== 'mode_select' ? initialMode : 'manual';
      setBuilderMode(mode);
      setBudgetWarning(null);
      setAutoViewMode('ad');
      setManualStep1View('catalog');
      setManualStep2View('map');
      if (mode === 'automatic') {
        generateAutomaticPlan({ isSurprise: true });
      } else if (mode === 'manual') {
        setCurrentStep(1);
        setSelectedPresetId('oleveci_signature');
        setSelectedTheme('blue_brand');
        setCardTemplate('oleveci_brand');
        setBgLayout('horizontal');
        const pool = availablePosts.length > 0 ? availablePosts : posts;
        if (pool.length > 0) {
          setSelectedPostIds(pool.slice(0, Math.min(2, pool.length)).map((p) => p.id));
        }
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialMode, generateAutomaticPlan, availablePosts, posts]);

  // Generate WhatsApp text for the itinerary
  const generateWhatsAppMessage = () => {
    let message = `🗺️ *ITINERARIO DEL PLAN - OLEVECI* 🚗\n\n`;
    message += `👉 *${planTitle}*\n`;
    message += `📅 *Cuándo:* ${scheduledTime}\n`;
    message += `📍 *Municipio:* ${currentCity || 'Nuestra zona'}\n`;
    if (personalNote && personalNote.trim()) {
      message += `💬 *Detalles:* "${personalNote.trim()}"\n`;
    }
    message += `\n📍 *Paradas y forma de llegar:*\n`;

    selectedPosts.forEach((post, index) => {
      const price = post.promotionalPrice || post.originalPrice;
      const priceStr =
        !hidePrices && price
          ? ` • ($${price.toLocaleString('es-CO')})`
          : '';
      const address = post.businessAddress ? ` (${post.businessAddress})` : '';
      message += `${index + 1}️⃣ *${post.businessName}*: ${post.title}${priceStr}\n   📌 ${post.businessSector || 'Sector comercial'}${address}\n`;
    });

    if (!hidePrices && hasPricedItems) {
      message += `\n💰 *Presupuesto total estimado:* $${totalPrice.toLocaleString('es-CO')} COP\n`;
      if (maxBudget !== null) {
        message += `🎯 *Límite dispuesto:* $${maxBudget.toLocaleString('es-CO')} COP\n`;
      }
    }

    if (selectedPosts.length > 0) {
      const stopsCoordinates = selectedPosts
        .filter((p) => p.coordinates && p.coordinates.lat && p.coordinates.lng)
        .map((p) => `${p.coordinates!.lat},${p.coordinates!.lng}`);

      if (stopsCoordinates.length > 0) {
        let mapsUrl = '';
        if (stopsCoordinates.length === 1) {
          mapsUrl = `https://www.google.com/maps/search/?api=1&query=${stopsCoordinates[0]}`;
        } else {
          const origin = stopsCoordinates[0];
          const destination = stopsCoordinates[stopsCoordinates.length - 1];
          const waypoints = stopsCoordinates.slice(1, -1).join('|');
          mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}&travelmode=driving`;
        }
        message += `\n🗺️ *Ver ruta completa en Google Maps:*\n${mapsUrl}\n`;
      }
    }

    message += `\n📲 Organizado con la app vecinal *OleVeci* 💙`;
    return encodeURIComponent(message);
  };

  const handleShareGeneral = async () => {
    const post = currentSurprisePost || selectedPosts[0];
    if (builderMode === 'automatic' && post) {
      trackInteraction(post.id, 'share');
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oleveci.com';
      const postUrl = `${origin}/anuncio/${post.id}`;
      const shareLead = `¡Te comparto este anuncio en OléVeci! 🎲`;
      const shareMessage = `${shareLead}\n\n*${post.title}* - ${post.businessName}\n${postUrl}`;

      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: post.title,
            text: shareMessage,
            url: postUrl,
          });
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }

      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oleveci.com';
    const planUrl = `${origin}/#plans`;
    let plainMsg = `🎉 ¡Te comparto este plan en OleVeci!: ${planTitle}\n`;
    plainMsg += `📅 Cuándo: ${scheduledTime}\n`;
    plainMsg += `📍 Municipio: ${currentCity || 'Cajicá'}\n`;
    if (personalNote && personalNote.trim()) {
      plainMsg += `💬 Nota: "${personalNote.trim()}"\n`;
    }
    if (selectedPosts.length > 0) {
      plainMsg += `🗺️ Paradas: ${selectedPosts.map((p) => p.businessName).join(' • ')}\n`;
    }
    plainMsg += `🔗 Ver plan: ${planUrl}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: planTitle,
          text: plainMsg,
          url: planUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    const waUrl = `https://wa.me/?text=${generateWhatsAppMessage()}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${generateWhatsAppMessage()}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    let text = `💌 ¡TIENES UNA INVITACIÓN ESPECIAL! ✨\n\n`;
    text += `👉 ${planTitle}\n`;
    text += `📅 Cuándo: ${scheduledTime}\n`;
    text += `📍 Lugar: ${currentCity || 'Nuestra zona'}\n`;
    if (personalNote && personalNote.trim()) {
      text += `💬 Nota: "${personalNote.trim()}"\n`;
    }
    text += `\nItinerario del plan:\n`;

    selectedPosts.forEach((post, index) => {
      const price = post.promotionalPrice || post.originalPrice;
      const priceStr =
        !hidePrices && price
          ? ` • ($${price.toLocaleString('es-CO')})`
          : '';
      text += `${index + 1}. ${post.businessName}: ${post.title}${priceStr}\n`;
    });

    if (!hidePrices && hasPricedItems) {
      text += `\nPresupuesto estimado total: $${totalPrice.toLocaleString('es-CO')} COP\n`;
      if (maxBudget !== null) {
        text += `Límite dispuesto: $${maxBudget.toLocaleString('es-CO')} COP\n`;
      }
    }

    text += `\nOrganizado en OleVeci`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentThemeConfig = THEMES[selectedTheme] || THEMES.nordic_light;

  const handleConfirmPublishPlan = () => {
    if (selectedPosts.length === 0) return;

    const tags = [
      adminPublishMunicipality.toLowerCase(),
      adminPublishCategory,
      ...selectedPosts.map((p) => p.category?.toLowerCase() || ''),
      ...adminPublishCustomTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    ].filter((v, i, a) => v && a.indexOf(v) === i);

    const newPlan: SimulatedReadyPlan = {
      id: `ready_plan_${Date.now()}`,
      planTitle: planTitle.trim() || 'Itinerario Oficial OleVeci',
      scheduledTime: scheduledTime || 'Este Fin de Semana',
      coverImage: selectedPosts[0]?.imageUrl || undefined,
      personalNote: personalNote.trim() || undefined,
      hidePrices: hidePrices,
      cardTemplate: cardTemplate,
      theme: currentThemeConfig,
      bgLayout: bgLayout,
      postIds: selectedPosts.map((p) => p.id),
      category: adminPublishCategory,
      estimatedBudget: totalPrice,
      municipality: adminPublishMunicipality || currentCity || 'Cajicá',
      timeOfDay: adminPublishTimeOfDay,
      dayType: adminPublishDayType,
      tags,
    };

    if (onSaveAsReadyPlan) {
      onSaveAsReadyPlan(newPlan);
    } else {
      addReadyPlan(newPlan);
    }

    setShowAdminPublishModal(false);
    onClose();
  };

  if (!isOpen) return null;

  const renderDatePicker = (isAuto = false) => (
    <div className={`relative ${isCalendarOpen ? 'z-50' : 'z-20'}`} ref={isAuto ? autoCalendarDropdownRef : calendarDropdownRef}>
      <button
        id={isAuto ? 'btn-auto-date-picker' : 'btn-itinerary-date-picker'}
        ref={isAuto ? autoCalendarButtonRef : calendarButtonRef}
        type="button"
        onClick={() => {
          setIsCalendarOpen(!isCalendarOpen);
          setIsHourPickerOpen(false);
          setIsBudgetPickerOpen(false);
          setIsStopsPickerOpen(false);
          setIsPlanCategoryPickerOpen(false);
        }}
        title={`Fecha: ${formattedSelectedDate}`}
        aria-label={`Fecha: ${formattedSelectedDate}`}
        className={
          isAuto
            ? `relative inline-flex items-center justify-center h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-full border transition cursor-pointer shrink-0 active:scale-95 shadow-2xs ${
                isCalendarOpen
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] shadow-xs ring-2 ring-blue-500/15'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
              }`
            : `inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-3.5 rounded-full text-xs font-semibold border transition cursor-pointer shrink-0 whitespace-nowrap active:scale-98 ${
                isCalendarOpen
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] shadow-xs ring-2 ring-blue-500/15'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
              }`
        }
      >
        <Calendar className="w-4 h-4 text-[#0056d6] shrink-0" />
        {isAuto && !formattedSelectedDate.toLowerCase().includes('hoy') && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#0056d6] ring-2 ring-white" />
        )}
        {!isAuto && <span>{formattedSelectedDate}</span>}
        {!isAuto && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isCalendarOpen ? 'rotate-180 text-[#0056d6]' : ''
            }`}
          />
        )}
      </button>

      {/* Popover del Calendario */}
      {isCalendarOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 sm:hidden"
            onClick={() => setIsCalendarOpen(false)}
          />
          <div
            className={`fixed inset-x-2 bottom-16 sm:absolute sm:inset-auto sm:left-0 ${
              isAuto
                ? 'sm:bottom-full sm:top-auto sm:mb-2'
                : 'sm:top-full sm:bottom-auto sm:mt-2'
            } w-auto sm:w-80 max-w-sm mx-auto sm:mx-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
          >
          {/* Encabezado Mes y Navegación */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoPrevMonth}
              className={`p-1 rounded-lg transition ${
                canGoPrevMonth
                  ? 'hover:bg-slate-100 text-slate-700 cursor-pointer'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-900">
              {MONTH_NAMES[calendarDays.month]} {calendarDays.year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Encabezado Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map((d) => (
              <span key={d} className="text-[11px] font-semibold text-slate-400 py-0.5">
                {d}
              </span>
            ))}
          </div>

          {/* Cuadrícula de Días */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espacios vacíos antes del primer día del mes */}
            {Array.from({ length: calendarDays.firstDay }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
            ))}

            {/* Días del mes */}
            {calendarDays.days.map((day) => {
              return (
                <button
                  key={day.dateKey}
                  type="button"
                  disabled={!day.isAvailable}
                  onClick={() => {
                    handleSelectDateFromCalendar(day.dateObj, day.dateKey);
                    if (isAuto) {
                      generateAutomaticPlan({ dateKey: day.dateKey });
                    }
                  }}
                  className={`h-8 rounded-lg text-xs flex flex-col items-center justify-center relative transition ${
                    day.isSelected
                      ? 'bg-[#0056d6] text-white font-bold shadow-xs'
                      : day.isAvailable
                      ? 'hover:bg-blue-50 text-slate-800 font-semibold cursor-pointer'
                      : 'text-slate-300 bg-transparent cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <span>{day.dayNumber}</span>
                  {day.isAvailable && !day.isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[#0056d6] absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        </>
      )}
    </div>
  );

  const renderHourPicker = (isAuto = false) => (
    <div className={`relative ${isHourPickerOpen ? 'z-50' : 'z-20'}`} ref={isAuto ? autoHourDropdownRef : hourDropdownRef}>
      <button
        id={isAuto ? 'btn-auto-hour-picker' : 'btn-itinerary-hour-picker'}
        ref={isAuto ? autoHourButtonRef : hourButtonRef}
        type="button"
        onClick={() => {
          setIsHourPickerOpen(!isHourPickerOpen);
          setIsCalendarOpen(false);
          setIsBudgetPickerOpen(false);
          setIsStopsPickerOpen(false);
          setIsPlanCategoryPickerOpen(false);
        }}
        title={`Hora: ${formattedSelectedHour}`}
        aria-label={`Hora: ${formattedSelectedHour}`}
        className={
          isAuto
            ? `relative inline-flex items-center justify-center h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-full border transition cursor-pointer shrink-0 active:scale-95 shadow-2xs ${
                selectedPlanHour !== 'any'
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] font-bold shadow-xs ring-2 ring-blue-500/15'
                  : isHourPickerOpen
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] shadow-xs ring-2 ring-blue-500/15'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
              }`
            : `inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-3.5 rounded-full text-xs font-semibold border transition cursor-pointer shrink-0 whitespace-nowrap active:scale-98 ${
                isHourPickerOpen
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] shadow-xs ring-2 ring-blue-500/15'
                  : selectedPlanHour !== 'any'
                  ? 'border-blue-400 bg-blue-50 text-[#0056d6] font-bold shadow-xs'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
              }`
        }
      >
        <Clock className="w-4 h-4 text-[#0056d6] shrink-0" />
        {isAuto && selectedPlanHour !== 'any' && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#0056d6] ring-2 ring-white" />
        )}
        {!isAuto && <span>{formattedSelectedHour}</span>}
        {!isAuto && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isHourPickerOpen ? 'rotate-180 text-[#0056d6]' : ''
            }`}
          />
        )}
      </button>

      {/* Popover de Hora */}
      {isHourPickerOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 sm:hidden"
            onClick={() => setIsHourPickerOpen(false)}
          />
          <div
            className={`fixed inset-x-2 bottom-16 sm:absolute sm:inset-auto sm:left-0 ${
              isAuto
                ? 'sm:bottom-full sm:top-auto sm:mb-2'
                : 'sm:top-full sm:bottom-auto sm:mt-2'
            } w-auto sm:w-72 max-w-sm mx-auto sm:mx-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150`}
          >
          {/* Opción Cualquier Hora */}
          <button
            type="button"
            onClick={() => {
              handleSelectHourFromPicker('any');
              if (isAuto) {
                generateAutomaticPlan({ hour: 'any' });
              }
            }}
            className={`w-full py-1.5 px-2.5 mb-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
              selectedPlanHour === 'any'
                ? 'bg-[#0056d6] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Cualquier hora</span>
            {selectedPlanHour === 'any' && <Check className="w-3.5 h-3.5" />}
          </button>

          {/* Cuadrícula de horas disponibles */}
          <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {PLAN_HOURS_OPTIONS.map((hr) => {
              const isAvail = isHourAvailable(hr, targetPlanDate);
              const isSel = selectedPlanHour === hr;
              return (
                <button
                  key={hr}
                  type="button"
                  disabled={!isAvail}
                  onClick={() => {
                    handleSelectHourFromPicker(hr);
                    if (isAuto) {
                      generateAutomaticPlan({ hour: hr });
                    }
                  }}
                  className={`py-1.5 px-1 rounded-lg text-xs text-center transition ${
                    isSel
                      ? 'bg-[#0056d6] text-white font-bold shadow-xs'
                      : isAvail
                      ? 'bg-slate-50 text-slate-800 hover:bg-blue-50 hover:text-[#0056d6] font-semibold cursor-pointer border border-slate-100'
                      : 'text-slate-300 bg-slate-50/40 cursor-not-allowed pointer-events-none line-through decoration-slate-200'
                  }`}
                >
                  {hr}
                </button>
              );
            })}
          </div>
        </div>
        </>
      )}
    </div>
  );

  const renderBudgetPicker = (isAuto = false) => (
    <div className={`relative ${isBudgetPickerOpen ? 'z-50' : 'z-20'}`} ref={isAuto ? autoBudgetDropdownRef : budgetDropdownRef}>
      <button
        id={isAuto ? 'btn-auto-budget-picker' : 'btn-itinerary-budget-picker'}
        ref={isAuto ? autoBudgetButtonRef : budgetButtonRef}
        type="button"
        onClick={() => {
          setIsBudgetPickerOpen(!isBudgetPickerOpen);
          setIsCalendarOpen(false);
          setIsHourPickerOpen(false);
          setIsStopsPickerOpen(false);
          setIsPlanCategoryPickerOpen(false);
        }}
        title={maxBudget !== null ? `Presupuesto: $${maxBudget.toLocaleString('es-CO')}` : 'Presupuesto'}
        aria-label={maxBudget !== null ? `Presupuesto: $${maxBudget.toLocaleString('es-CO')}` : 'Presupuesto'}
        className={
          isAuto
            ? `relative inline-flex items-center justify-center h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-full border transition cursor-pointer shrink-0 active:scale-95 shadow-2xs ${
                maxBudget !== null
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs ring-2 ring-emerald-500/20'
                  : isBudgetPickerOpen
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] shadow-xs ring-2 ring-blue-500/15'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
              }`
            : `inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-3.5 rounded-full text-xs font-semibold border transition cursor-pointer shrink-0 whitespace-nowrap active:scale-98 ${
                maxBudget !== null
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs ring-2 ring-emerald-500/20'
                  : isBudgetPickerOpen
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] shadow-xs ring-2 ring-blue-500/15'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
              }`
        }
      >
        <DollarSign className={`w-4 h-4 shrink-0 stroke-[2.25] ${maxBudget !== null ? 'text-emerald-600' : 'text-[#0056d6]'}`} />
        {isAuto && maxBudget !== null && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
        )}
        {!isAuto && (
          <span>
            {maxBudget !== null
              ? `Presupuesto: $${maxBudget.toLocaleString('es-CO')}`
              : 'Presupuesto'}
          </span>
        )}
        {!isAuto && maxBudget !== null && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleSetMaxBudget(null);
            }}
            className="p-0.5 rounded-full hover:bg-emerald-200/60 text-emerald-700 transition"
            title="Quitar límite de presupuesto"
          >
            <X className="w-3 h-3" />
          </span>
        )}
        {!isAuto && (
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${
              isBudgetPickerOpen ? 'rotate-180 text-[#0056d6]' : 'text-slate-400'
            }`}
          />
        )}
      </button>

      {/* Popover de Presupuesto */}
      {isBudgetPickerOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 sm:hidden"
            onClick={() => setIsBudgetPickerOpen(false)}
          />
          <div
            className={`fixed inset-x-2 bottom-16 sm:absolute sm:inset-auto sm:left-0 ${
              isAuto
                ? 'sm:bottom-full sm:top-auto sm:mb-2'
                : 'sm:top-full sm:bottom-auto sm:mt-2'
            } w-auto sm:w-80 max-w-sm mx-auto sm:mx-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
          >
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4 stroke-[2.25]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Presupuesto del Plan</div>
                <div className="text-[10px] text-slate-500">Límite máximo dispuesto a gastar</div>
              </div>
            </div>
            {maxBudget !== null && (
              <button
                type="button"
                onClick={() => {
                  handleSetMaxBudget(null);
                  if (isAuto) {
                    generateAutomaticPlan({ budget: null });
                  }
                }}
                className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
              >
                Sin límite
              </button>
            )}
          </div>

          {/* Presets sugeridos */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Montos sugeridos
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {BUDGET_PRESETS.map((preset) => {
                const isSelected = maxBudget === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      handleSetMaxBudget(preset.value);
                      if (isAuto) {
                        generateAutomaticPlan({ budget: preset.value });
                      }
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  handleSetMaxBudget(null);
                  if (isAuto) {
                    generateAutomaticPlan({ budget: null });
                  }
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer border col-span-2 ${
                  maxBudget === null
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                Sin límite dispuesto
              </button>
            </div>
          </div>

          {/* Monto personalizado */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              O escribe un valor en pesos
            </label>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customBudgetInput}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    if (!digitsOnly) {
                      setCustomBudgetInput('');
                    } else {
                      setCustomBudgetInput(parseInt(digitsOnly, 10).toLocaleString('es-CO'));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCustomBudget();
                      if (isAuto && customBudgetInput.trim()) {
                        const parsed = parseInt(customBudgetInput.replace(/\D/g, ''), 10);
                        if (!isNaN(parsed) && parsed > 0) {
                          generateAutomaticPlan({ budget: parsed });
                        }
                      }
                    }
                  }}
                  placeholder="Ej. 75.000"
                  className="w-full pl-6 pr-2 py-1.5 rounded-lg text-xs font-semibold text-slate-900 border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  handleApplyCustomBudget();
                  if (isAuto && customBudgetInput.trim()) {
                    const parsed = parseInt(customBudgetInput.replace(/\D/g, ''), 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      generateAutomaticPlan({ budget: parsed });
                    }
                  }
                }}
                disabled={!customBudgetInput.trim()}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                  customBudgetInput.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Aplicar
              </button>
            </div>
          </div>

          <p className="mt-2 text-[10px] text-slate-400 leading-tight">
            El plan respetará este tope y no permitirá sumar paradas que lo sobrepasen.
          </p>
        </div>
        </>
      )}
    </div>
  );

  const renderStopsPicker = (isAuto = false) => (
    <div className={`relative ${isStopsPickerOpen ? 'z-50' : 'z-20'}`} ref={autoStopsDropdownRef}>
      <button
        id={isAuto ? 'btn-auto-stops-picker' : 'btn-itinerary-stops-picker'}
        ref={autoStopsButtonRef}
        type="button"
        onClick={() => {
          setIsStopsPickerOpen(!isStopsPickerOpen);
          setIsCalendarOpen(false);
          setIsHourPickerOpen(false);
          setIsBudgetPickerOpen(false);
          setIsPlanCategoryPickerOpen(false);
        }}
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold border transition cursor-pointer shrink-0 whitespace-nowrap ${
          isStopsPickerOpen
            ? 'border-[#0056d6] bg-blue-50/50 text-[#0056d6] shadow-xs'
            : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
        }`}
      >
        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0056d6] shrink-0" />
        <span>
          {autoStopsCount} {autoStopsCount === 1 ? 'parada' : 'paradas'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${
            isStopsPickerOpen ? 'rotate-180 text-[#0056d6]' : 'text-slate-400'
          }`}
        />
      </button>

      {isStopsPickerOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 sm:hidden"
            onClick={() => setIsStopsPickerOpen(false)}
          />
          <div className="fixed inset-x-3 top-20 sm:absolute sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-full mt-2 w-auto sm:w-64 max-w-sm mx-auto sm:mx-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0056d6] flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Cantidad de paradas
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Hasta 4</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((count) => {
              const isSelected = autoStopsCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setAutoStopsCount(count);
                    setIsStopsPickerOpen(false);
                    if (isAuto) {
                      generateAutomaticPlan({ stopsCount: count });
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                    isSelected
                      ? 'bg-[#0056d6] text-white border-[#0056d6] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <span className="text-sm leading-none">{count}</span>
                  <span className="text-[9px] font-medium opacity-80">
                    {count === 1 ? 'parada' : 'paradas'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        </>
      )}
    </div>
  );

  const renderPlanCategoryPicker = (isAuto = false) => (
    <div className={`relative ${isPlanCategoryPickerOpen ? 'z-50' : 'z-20'}`} ref={isAuto ? autoPlanCategoryDropdownRef : planCategoryDropdownRef}>
      <button
        id={isAuto ? 'btn-auto-plan-category-picker' : 'btn-itinerary-plan-category-picker'}
        ref={isAuto ? autoPlanCategoryButtonRef : planCategoryButtonRef}
        type="button"
        onClick={() => {
          setIsPlanCategoryPickerOpen(!isPlanCategoryPickerOpen);
          setIsCalendarOpen(false);
          setIsHourPickerOpen(false);
          setIsBudgetPickerOpen(false);
          setIsStopsPickerOpen(false);
          setIsCategoryFilterOpen(false);
        }}
        title={selectedPlanCategoryId === 'all' ? 'Tipo de plan' : `Tipo de plan: ${activeTargetPlanCategory?.name || ''}`}
        aria-label={selectedPlanCategoryId === 'all' ? 'Tipo de plan' : `Tipo de plan: ${activeTargetPlanCategory?.name || ''}`}
        className={
          isAuto
            ? `relative inline-flex items-center justify-center h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-full border transition cursor-pointer shrink-0 active:scale-95 shadow-2xs ${
                selectedPlanCategoryId !== 'all'
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] font-bold shadow-xs ring-2 ring-blue-500/15'
                  : isPlanCategoryPickerOpen
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] shadow-xs ring-2 ring-blue-500/15'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
              }`
            : `inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-3.5 rounded-full text-xs font-semibold border transition cursor-pointer shrink-0 whitespace-nowrap active:scale-98 ${
                selectedPlanCategoryId !== 'all'
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] font-bold shadow-xs ring-2 ring-blue-500/15'
                  : isPlanCategoryPickerOpen
                  ? 'border-[#0056d6] bg-blue-50 text-[#0056d6] shadow-xs ring-2 ring-blue-500/15'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
              }`
        }
      >
        {selectedPlanCategoryId === 'all' ? (
          <Compass className="w-4 h-4 text-[#0056d6] shrink-0" />
        ) : (
          <span className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-50 text-[#0056d6] shrink-0 text-[10px]">
            {renderPlanCategoryIcon(activeTargetPlanCategory?.iconName || 'Compass', 'w-3 h-3')}
          </span>
        )}
        {isAuto && selectedPlanCategoryId !== 'all' && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#0056d6] ring-2 ring-white" />
        )}
        {!isAuto && (
          <span className="truncate max-w-[110px] sm:max-w-[170px]">
            {selectedPlanCategoryId === 'all'
              ? 'Tipo de plan'
              : activeTargetPlanCategory?.name || 'Tipo de plan'}
          </span>
        )}
        {!isAuto && selectedPlanCategoryId !== 'all' && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlanCategoryId('all');
              setIsPlanCategoryPickerOpen(false);
              if (isAuto) {
                generateAutomaticPlan({ planCategoryId: 'all' });
              }
            }}
            className="p-0.5 rounded-full hover:bg-blue-200/60 text-[#0056d6] transition cursor-pointer"
            title="Quitar filtro de tipo de plan"
          >
            <X className="w-3 h-3" />
          </span>
        )}
        {!isAuto && (
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${
              isPlanCategoryPickerOpen ? 'rotate-180 text-[#0056d6]' : 'text-slate-400'
            }`}
          />
        )}
      </button>

      {/* Popover de Tipo de Plan */}
      {isPlanCategoryPickerOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 sm:hidden"
            onClick={() => setIsPlanCategoryPickerOpen(false)}
          />
          <div
            className={`fixed inset-x-2 bottom-16 sm:absolute sm:inset-auto sm:left-0 ${
              isAuto
                ? 'sm:bottom-full sm:top-auto sm:mb-2'
                : 'sm:top-full sm:bottom-auto sm:mt-2'
            } w-auto sm:w-80 max-w-sm mx-auto sm:mx-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto`}
          >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0056d6] flex items-center justify-center">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Tipo de Plan
              </div>
            </div>
            {selectedPlanCategoryId !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanCategoryId('all');
                  setIsPlanCategoryPickerOpen(false);
                  if (isAuto) {
                    generateAutomaticPlan({ planCategoryId: 'all' });
                  }
                }}
                className="text-[10px] font-semibold text-[#0056d6] hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5">
            {/* Opción Variado / Todos */}
            <button
              type="button"
              onClick={() => {
                setSelectedPlanCategoryId('all');
                setIsPlanCategoryPickerOpen(false);
                if (isAuto) {
                  generateAutomaticPlan({ planCategoryId: 'all' });
                }
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                selectedPlanCategoryId === 'all'
                  ? 'bg-blue-50 text-[#0056d6] font-bold border border-blue-200/80'
                  : 'text-slate-700 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🎲</span>
                <div>
                  <div className="font-bold text-slate-900 leading-tight">
                    {isAuto ? 'Variado (Todas las opciones)' : 'Todos los tipos'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {isAuto ? 'Combina paradas de cualquier rubro o categoría' : 'Muestra actividades de todas las categorías'}
                  </div>
                </div>
              </div>
              {selectedPlanCategoryId === 'all' && (
                <Check className="w-4 h-4 text-[#0056d6] stroke-[2.5] shrink-0" />
              )}
            </button>

            {activePlanCategories.map((planCat) => {
              const isSelected = selectedPlanCategoryId === planCat.id;
              return (
                <button
                  key={planCat.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlanCategoryId(planCat.id);
                    setIsPlanCategoryPickerOpen(false);
                    if (isAuto) {
                      generateAutomaticPlan({ planCategoryId: planCat.id });
                    }
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50/70 border border-blue-200 text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-blue-50 text-[#007af7] shrink-0 shadow-2xs">
                      {renderPlanCategoryIcon(planCat.iconName, 'w-3.5 h-3.5')}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-xs truncate">
                        {planCat.name}
                      </div>
                      {planCat.description && (
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[200px]">
                          {planCat.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#0056d6] stroke-[2.5] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        </>
      )}
    </div>
  );

  const currentSurpriseTheme = SURPRISE_COLOR_THEMES[surpriseThemeIndex % SURPRISE_COLOR_THEMES.length];

  const stepMeta = [
    {
      step: 1 as WizardStep,
      name: 'Actividades',
      subtitle: 'Elige tus paradas',
      icon: MapPin,
    },
    {
      step: 2 as WizardStep,
      name: 'Invitación',
      subtitle: 'Diseña tu tarjeta',
      icon: Ticket,
    },
    {
      step: 3 as WizardStep,
      name: 'Ruta y Mapa',
      subtitle: 'Forma de llegar',
      icon: Route,
    },
  ];

  return (
    <>
      <div
        id="itinerary-builder-overlay"
        className="fixed inset-0 z-[2000] flex items-center justify-center p-1 sm:p-4 bg-[#040e28] sm:bg-gradient-to-r sm:from-[#03153d] sm:via-[#052264] sm:to-[#0a3899] backdrop-blur-md transition-opacity overflow-hidden select-none"
        onClick={onClose}
      >
        {/* Decorative ambient glow on desktop matching the Reels view */}
        <div className="hidden sm:block absolute -top-16 -left-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute -bottom-16 -right-16 w-96 h-96 bg-[#007af7]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central Expansive Brand Watermark behind the modal matching Reels */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center pointer-events-none select-none overflow-hidden z-0">
          <img
            src="/Icono_Oleveci_sin_fondo.png"
            alt=""
            aria-hidden="true"
            className="w-[740px] xl:w-[1000px] max-w-none h-auto object-contain opacity-[0.09] pointer-events-none"
          />
        </div>

        <div
          id="itinerary-builder-container"
          className="relative z-10 w-full h-[96vh] sm:h-auto max-w-5xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-white/20 sm:border-slate-100 flex flex-col sm:max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
        {/* TOP BAR: MODAL TITLE & 3-STEP WIZARD PROGRESS / MODE SWITCH */}
        <div className="border-b border-slate-200/90 bg-white shrink-0">
          <div className="p-2.5 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <OleVeciLogo size="md" showSlogan={false} showCom={false} />
              {isAdminCreation && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#007af7] border border-blue-200/60">
                  Modo Super Admin • Crear Plan
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* 2-STEP WIZARD STEPPER (ONLY IN MANUAL MODE) */}
          {builderMode === 'manual' && (
            <div className="px-2.5 sm:px-6 py-2 sm:py-2.5 bg-slate-50 border-t border-slate-100 overflow-x-auto no-scrollbar">
              <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 mx-auto">
                {stepMeta.map((s, idx) => {
                  const isCurrent = currentStep === s.step;
                  const isCompleted = currentStep > s.step;
                  const canNavigate = s.step === 1 || selectedPostIds.length > 0;

                  return (
                    <React.Fragment key={s.step}>
                      <button
                        type="button"
                        disabled={!canNavigate}
                        onClick={() => {
                          if (canNavigate) setCurrentStep(s.step);
                        }}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl transition cursor-pointer text-left shrink-0 ${
                          isCurrent
                            ? 'bg-[#0056d6] text-white shadow-md shadow-blue-500/20'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            : canNavigate
                            ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                            : 'bg-slate-100/70 text-slate-400 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.step}
                        </div>

                        <div className="min-w-0">
                          <div className="text-[10px] sm:text-[11px] font-semibold truncate leading-tight">
                            {s.name}
                          </div>
                          <div
                            className={`text-[9px] font-normal truncate hidden sm:block ${
                              isCurrent
                                ? 'text-blue-100'
                                : isCompleted
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {s.subtitle}
                          </div>
                        </div>
                      </button>

                      {idx < stepMeta.length - 1 && (
                        <div
                          className={`h-0.5 w-8 sm:w-14 rounded-full transition-colors ${
                            currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 1. SELECCIÓN DE MODO: AUTOMÁTICO Y MANUAL */}
        {builderMode === 'mode_select' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-50/70 flex flex-col items-center justify-center">
            <div className="w-full max-w-lg space-y-4 sm:space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-1">
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                  ¿Cómo deseas armar tu plan?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Genera una combinación sugerida al instante o elígela paso a paso.
                </p>
              </div>

              {/* Tarjetas de Selección: Automático y Manual */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5 pt-1">
                {/* OPCIÓN PLAN SORPRESA */}
                <button
                  type="button"
                  id="btn-select-automatic-mode"
                  onClick={handleStartAutomaticMode}
                  className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 hover:border-amber-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2.5 sm:gap-4 text-center group active:scale-95"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                    <Dices className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      Modo Sorpresa
                    </h4>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium hidden xs:block mt-0.5">
                      Itinerarios listos con 1 clic
                    </span>
                  </div>
                </button>

                {/* OPCIÓN MANUAL: TU ELIGES (A TU MEDIDA) */}
                <button
                  type="button"
                  id="btn-select-manual-mode"
                  onClick={handleStartManualMode}
                  className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 hover:border-[#00d8a5] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2.5 sm:gap-4 text-center group active:scale-95"
                >
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#00c9a7] via-[#00d8a5] to-[#00b4d8] text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                      <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#021b58] ring-2 ring-white flex items-center justify-center shadow-xs">
                      <MapPin className="w-2.5 h-2.5 text-[#00e5b8]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-lg font-bold text-slate-900 group-hover:text-[#007af7] transition-colors">
                      Tu eliges
                    </h4>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium hidden xs:block mt-0.5">
                      Tú decides cada parada a tu gusto
                    </span>
                  </div>
                </button>
              </div>

              {/* Opción rápida: Ir a Descubre para ver todas las promociones */}
              {onNavigateToDescubre && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    id="btn-itinerary-go-to-descubre"
                    onClick={() => {
                      onClose();
                      onNavigateToDescubre();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-[#6366f1] text-xs font-bold transition border border-indigo-200/80 cursor-pointer shadow-2xs group active:scale-95"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#6366f1]" />
                    <span>Descubre toda la oferta</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. MODO AUTOMÁTICO: 100% SORPRESA CON ANUNCIOS DE DESCUBRIR UNO POR UNO */}
        {builderMode === 'automatic' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 overflow-hidden relative">
            {/* Contenido Principal: Anuncio con color de fondo temático dinámico */}
            <div className="flex-1 p-2.5 sm:p-5 overflow-y-auto flex flex-col items-center justify-start relative z-10">
              {currentSurprisePost ? (
                <div
                  key={`${currentSurprisePost.id}-${currentSurpriseTheme.id}`}
                  className="w-full max-w-md flex flex-col items-center pb-2 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className={`w-full rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 border ${currentSurpriseTheme.borderColor} ${currentSurpriseTheme.cardBg}`}>
                    <PostDetailCard
                      post={currentSurprisePost}
                      colorTheme={currentSurpriseTheme}
                      onSelectBusiness={(bizId) => {
                        if (onSelectBusiness) {
                          onClose();
                          onSelectBusiness(bizId);
                        }
                      }}
                      onSelectPost={(post) => {
                        if (onSelectPost) {
                          onSelectPost(post);
                        } else {
                          setPreviewPost(post);
                        }
                      }}
                      showCloseButton={false}
                    />
                  </div>
                </div>
              ) : autoViewMode === 'card' ? (
                <div className="w-full max-w-[340px] xs:max-w-[360px] sm:max-w-[420px] flex flex-col items-center pb-2">
                  <InvitationCardPreview
                    cardRef={invitationCardRef}
                    posts={selectedPosts}
                    currentCity={currentCity}
                    planTitle={planTitle}
                    scheduledTime={scheduledTime}
                    personalNote={personalNote}
                    hidePrices={hidePrices}
                    cardTemplate={cardTemplate}
                    theme={currentThemeConfig}
                    bgLayout={bgLayout}
                    selectedPhotoIndex={selectedPhotoIndex}
                    totalPrice={totalPrice}
                    hasPricedItems={hasPricedItems}
                    onSelectPost={(p) => setPreviewPost(p)}
                  />
                </div>
              ) : (
                <div className="w-full max-w-[340px] xs:max-w-[360px] sm:max-w-[420px] flex flex-col items-center pb-4">
                  <PlanRouteSection
                    posts={selectedPosts}
                    planTitle={planTitle}
                    currentCity={currentCity}
                    scheduledTime={scheduledTime}
                    onSelectPost={(p) => setPreviewPost(p)}
                  />
                </div>
              )}
            </div>

            {/* BARRA DE ACCIONES INFERIOR DOCK: ICONOS DE FILTROS Y BOTÓN SORPRÉNDEME EN LA MISMA LÍNEA */}
            <div className="p-2 sm:p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg shrink-0 z-30 flex items-center gap-1.5 sm:gap-2.5 w-full">
              {/* Iconos de Filtros */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {renderPlanCategoryPicker(true)}
                {renderDatePicker(true)}
                {renderHourPicker(true)}
                {renderBudgetPicker(true)}
                {hasActiveCustomFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      handleResetStep1Filters();
                      generateAutomaticPlan({
                        isSurprise: true,
                        hour: 'any',
                        budget: null,
                        planCategoryId: 'all',
                      });
                    }}
                    className="inline-flex items-center justify-center h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-full text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                    title="Restablecer filtros"
                    aria-label="Restablecer filtros"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Botón Sorpréndeme en la misma línea ocupando el resto del espacio */}
              <button
                type="button"
                id="btn-auto-regenerate"
                onClick={() => {
                  generateAutomaticPlan({ isSurprise: true });
                }}
                disabled={isAutoGenerating}
                title="¡Sorpréndeme con otro anuncio!"
                aria-label="¡Sorpréndeme con otro anuncio!"
                className="flex-1 min-w-0 h-9 sm:h-9.5 px-3 sm:px-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:via-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-amber-200/60"
              >
                <Dices
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm shrink-0 ${
                    isAutoGenerating
                      ? 'animate-spin'
                      : 'hover:rotate-180 transition-transform duration-500'
                  }`}
                />
                <span className="truncate font-black tracking-wide">¡Sorpréndeme!</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. MODO MANUAL: FLUJO GUIADO EN 3 PASOS */}
        {builderMode === 'manual' && (
          <>
            {/* STEP 1: SELECCIONAR ACTIVIDADES */}
            {currentStep === 1 && (
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60 overflow-hidden">
                {/* Step 1 Date & Time Controls + Search */}
                <div className="p-2.5 sm:p-4 bg-white border-b border-slate-200/80 space-y-2.5 relative z-30 overflow-visible">
                  {/* Row: Date & Time Selectors + Filters Bar */}
                  <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible no-scrollbar py-0.5 relative z-40">
                    {renderDatePicker(false)}
                    {renderHourPicker(false)}
                    {renderBudgetPicker(false)}
                    {hasActiveCustomFilters && (
                      <button
                        type="button"
                        onClick={handleResetStep1Filters}
                        className="inline-flex items-center gap-1 h-8 sm:h-9 px-3 rounded-full text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 shadow-2xs"
                        title="Restablecer filtros"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restablecer</span>
                      </button>
                    )}
                  </div>

              {/* Integrated Search Bar with Filters inside (Matching Discover / Feed) */}
              <div className={`relative pt-0.5 ${isCategoryFilterOpen ? 'z-50' : 'z-20'}`}>
                <div
                  className={`flex items-center w-full rounded-2xl border bg-white px-3.5 py-1.5 shadow-xs transition-all duration-200 ${
                    isSearchFocused
                      ? 'border-[#0056d6] ring-3 ring-blue-500/15'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Buscar café, restaurante, bar, plan..."
                    className="w-full py-1.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition mr-1.5 cursor-pointer"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    ref={filterButtonRef}
                    id="btn-itinerary-filters-icon"
                    type="button"
                    onClick={() => setIsCategoryFilterOpen((prev) => !prev)}
                    className={`p-2 rounded-xl border transition cursor-pointer shrink-0 relative flex items-center gap-1.5 ${
                      selectedCategoryFilter !== 'all'
                        ? 'bg-[#0056d6] text-white border-[#0056d6]'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                    title="Filtros por categoría"
                    aria-label="Filtros"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {selectedCategoryFilter !== 'all' && (
                      <span className="text-[11px] font-medium max-w-[120px] truncate hidden sm:inline">
                        {categoriesList.find((c) => c.id === selectedCategoryFilter)?.label || 'Categoría'}
                      </span>
                    )}
                    {selectedCategoryFilter !== 'all' && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 border border-white" />
                    )}
                  </button>
                </div>

                {/* Dropdown Menu for Category Filters */}
                {isCategoryFilterOpen && (
                  <div
                    ref={filterDropdownRef}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-1">
                      <span className="text-xs font-semibold text-slate-800">Filtrar por categoría</span>
                      {selectedCategoryFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategoryFilter('all');
                            setIsCategoryFilterOpen(false);
                          }}
                          className="text-[10px] font-semibold text-[#0056d6] hover:underline cursor-pointer"
                        >
                          Ver todos
                        </button>
                      )}
                    </div>
                    <div className="space-y-0.5 max-h-64 overflow-y-auto">
                      {categoriesList.map((cat) => {
                        const isSelected = selectedCategoryFilter === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategoryFilter(cat.id);
                              setIsCategoryFilterOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 text-[#0056d6] font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="truncate">{cat.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#0056d6] stroke-[2.5] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Dedicated Budget Tracker Banner */}
              {maxBudget !== null && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/90 shadow-2xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Wallet className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-emerald-950">
                            Presupuesto: ${maxBudget.toLocaleString('es-CO')} COP
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            totalPrice >= maxBudget
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {Math.min(100, Math.round((totalPrice / maxBudget) * 100))}% utilizado
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                          Total actual: <strong className="font-bold">${totalPrice.toLocaleString('es-CO')} COP</strong>
                          {' • '}
                          Saldo disponible: <strong className="font-bold">${Math.max(0, maxBudget - totalPrice).toLocaleString('es-CO')} COP</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsBudgetPickerOpen(true)}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-white/90 hover:bg-white px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer shadow-2xs"
                      >
                        Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetMaxBudget(null)}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-white/90 hover:bg-white p-1 rounded-lg border border-rose-200 transition cursor-pointer shadow-2xs"
                        title="Quitar límite de presupuesto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-emerald-200/70 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        totalPrice >= maxBudget
                          ? 'bg-amber-500'
                          : totalPrice > maxBudget * 0.75
                          ? 'bg-amber-400'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, (totalPrice / maxBudget) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Warning Banner when user tries to exceed budget */}
              {budgetWarning && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start justify-between gap-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{budgetWarning}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBudgetWarning(null)}
                    className="text-amber-600 hover:text-amber-900 p-0.5 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Activities Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
              {availablePosts.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-3 max-w-md mx-auto">
                  <Compass className="w-10 h-10 mx-auto text-slate-300" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700">
                      No encontramos opciones vigentes para los filtros seleccionados.
                    </p>
                    <p className="text-xs text-slate-400">
                      {maxBudget !== null
                        ? `Prueba ampliando tu presupuesto (límite actual: $${maxBudget.toLocaleString('es-CO')} COP) o cambiando la fecha/hora.`
                        : selectedPlanHour !== 'any'
                        ? 'Algunas promociones o comercios operan en otros horarios o ya concluyeron para la hora elegida.'
                        : 'Prueba seleccionando otra fecha u hora disponible en el calendario.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetStep1Filters}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#0056d6] text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer filtros y ver todas las opciones</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availablePosts.map((post) => {
                    const isSelected = selectedPostIds.includes(post.id);
                    const selectedIndex = selectedPostIds.indexOf(post.id);
                    const price = post.promotionalPrice || post.originalPrice;
                    const itemPrice = price || 0;
                    const wouldExceedBudget =
                      !isSelected &&
                      maxBudget !== null &&
                      itemPrice > 0 &&
                      totalPrice + itemPrice > maxBudget;

                    return (
                      <div
                        key={post.id}
                        onClick={() => handleTogglePost(post.id)}
                        className={`relative rounded-2xl border p-3 flex gap-3 transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'border-[#0056d6] bg-blue-50/70 shadow-sm ring-1 ring-[#0056d6]/40'
                            : wouldExceedBudget
                            ? 'border-amber-200/70 bg-amber-50/20 hover:border-amber-300'
                            : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Image Thumbnail */}
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200/80">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Store className="w-5 h-5" />
                            </div>
                          )}

                          {/* Order Number Badge */}
                          <div
                            className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                              isSelected
                                ? 'bg-[#0056d6] text-white'
                                : 'bg-black/60 text-white/90 backdrop-blur-xs'
                            }`}
                          >
                            {isSelected ? selectedIndex + 1 : '+'}
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-[#0056d6] truncate">
                                {post.businessName}
                              </span>
                              {post.expiryLabel && (
                               <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 shrink-0">
                                 {post.expiryLabel}
                               </span>
                              )}
                            </div>

                            <h4 className="text-xs sm:text-sm font-medium text-slate-800 leading-snug line-clamp-2 mt-0.5">
                              {post.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1.5 mt-1 border-t border-slate-100">
                            {price ? (
                              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                <Tag className="w-3 h-3 text-emerald-600" />
                                ${price.toLocaleString('es-CO')}
                              </span>
                            ) : (
                              <span className="text-[11px] font-normal text-slate-400">
                                Sin costo fijo
                              </span>
                            )}

                            <span
                              className={`text-xs font-medium px-2.5 py-0.5 rounded-lg transition ${
                                isSelected
                                  ? 'bg-[#0056d6] text-white'
                                  : wouldExceedBudget
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected
                                ? '✓ Añadido'
                                : wouldExceedBudget
                                ? '+ Excede cupo'
                                : '+ Sumar'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 1 Bottom Floating Action Bar */}
            <div className="p-2.5 sm:p-4 bg-white border-t border-slate-200/90 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0 flex-1">
                {selectedPostIds.length > 0 ? (
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                      {selectedPostIds.length === 1 ? '1 actividad seleccionada' : `${selectedPostIds.length} actividades seleccionadas`}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 truncate">
                      {totalPrice > 0 ? (
                        <>
                          Total: <strong className="text-emerald-600 font-extrabold">${totalPrice.toLocaleString('es-CO')} COP</strong>
                        </>
                      ) : (
                        <span>Sin costo adicional</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                    <span className="truncate">Selecciona actividades para continuar</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                id="btn-step1-next"
                disabled={selectedPostIds.length === 0 || (maxBudget !== null && totalPrice > maxBudget)}
                onClick={() => {
                  setCurrentStep(2);
                }}
                className={`w-10 h-10 sm:w-auto px-0 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                  selectedPostIds.length > 0 && (maxBudget === null || totalPrice <= maxBudget)
                    ? 'bg-slate-100 hover:bg-[#0056d6] text-slate-700 hover:text-white border border-slate-200/90 hover:border-[#0056d6] hover:shadow-md hover:shadow-blue-500/25 active:bg-[#0047b3] focus:bg-[#0056d6] focus:text-white active:scale-95 cursor-pointer font-extrabold'
                    : 'bg-slate-100 text-slate-300 border border-slate-200/60 cursor-not-allowed shadow-none'
                }`}
                title={selectedPostIds.length === 0 ? 'Selecciona al menos 1 actividad' : 'Crear mi itinerario y diseñar invitación'}
                aria-label="Siguiente: Crear itinerario"
              >
                <CheckSquare className="hidden sm:inline w-4 h-4" />
                <span className="hidden sm:inline">Crear Itinerario</span>
                <ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CREAR INVITACIÓN, CORTE Y PERSONALIZACIÓN DIRECTA EN TARJETA */}
        {currentStep === 2 && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-100/60 overflow-hidden">
            {/* Main content: centered interactive card with in-card direct editing */}
            <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-6 flex flex-col items-center justify-start">
              <div className="w-full max-w-[430px] space-y-3 pb-3">
                {/* Previsualización de la Tarjeta con edición directa inline */}
                <div className="space-y-2">
                  <InvitationCardPreview
                    cardRef={invitationCardRef}
                    posts={selectedPosts}
                    currentCity={currentCity}
                    planTitle={planTitle}
                    scheduledTime={scheduledTime}
                    personalNote={personalNote}
                    hidePrices={hidePrices}
                    cardTemplate={cardTemplate}
                    theme={currentThemeConfig}
                    bgLayout={bgLayout}
                    selectedPhotoIndex={selectedPhotoIndex}
                    totalPrice={totalPrice}
                    hasPricedItems={hasPricedItems}
                    onSelectPost={(p) => setPreviewPost(p)}
                    isEditing={isCardEditing}
                    onTitleChange={(val) => setPlanTitle(val)}
                    onNoteChange={(val) => setPersonalNote(val)}
                  />
                </div>

                {/* Botón de Editar directamente debajo de la invitación (sin contenedor / sin caja de fondo) */}
                <div className="flex items-center justify-center gap-2.5 pt-1.5 pb-2 z-20">
                  {/* Botón Editar / Listo */}
                  <button
                    type="button"
                    id="btn-toggle-card-edit"
                    onClick={() => setIsCardEditing(!isCardEditing)}
                    className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                      isCardEditing
                        ? "bg-[#0056d6] text-white shadow-blue-500/25 hover:bg-[#0047b3]"
                        : "bg-white text-slate-700 hover:text-[#0056d6] border border-slate-200/90 hover:border-[#0056d6] hover:bg-blue-50/40 hover:shadow-md"
                    }`}
                    title={isCardEditing ? "Finalizar edición" : "Editar invitación"}
                  >
                    {isCardEditing ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Listo</span>
                      </>
                    ) : (
                      <>
                        <Pencil className="w-4 h-4 text-slate-500" />
                        <span>Editar</span>
                      </>
                    )}
                  </button>

                  {/* Opciones activadas por el botón editar: Iconos de acción independientes (sin contenedor) */}
                  {isCardEditing && (
                    <div className="flex items-center gap-2 animate-in fade-in-0 duration-200">
                      {/* Iconito para cambiar el color */}
                      <button
                        type="button"
                        id="btn-cycle-card-color"
                        onClick={handleCycleTheme}
                        className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-purple-600 border border-slate-200/90 shadow-sm hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 group"
                        title="Cambiar color de la tarjeta"
                        aria-label="Cambiar color de la tarjeta"
                      >
                        <Palette className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>

                      {/* Iconito para cambiar el corte de fotos */}
                      <button
                        type="button"
                        id="btn-cycle-card-layout"
                        onClick={handleCyclePhotoLayout}
                        className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-blue-600 border border-slate-200/90 shadow-sm hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 group"
                        title="Cambiar corte de fotos"
                        aria-label="Cambiar corte de fotos"
                      >
                        <Crop className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>

                      {/* Iconito para ocultar o mostrar precios (signo pesos) */}
                      <button
                        type="button"
                        id="btn-toggle-hide-prices"
                        onClick={() => setHidePrices(!hidePrices)}
                        className={`w-10 h-10 rounded-full border shadow-sm hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 group ${
                          hidePrices
                            ? "bg-rose-50/70 hover:bg-rose-100/70 border-rose-200/90 text-rose-500"
                            : "bg-white hover:bg-emerald-50/60 border-slate-200/90 hover:border-emerald-300 text-emerald-600"
                        }`}
                        title={hidePrices ? "Precios ocultos (clic para mostrar)" : "Precios visibles (clic para ocultar)"}
                        aria-label={hidePrices ? "Mostrar precios en la tarjeta" : "Ocultar precios en la tarjeta"}
                      >
                        {hidePrices ? (
                          <div className="relative flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform stroke-[2]" />
                            <span className="absolute w-5 h-[2px] bg-rose-500 -rotate-45 rounded-full pointer-events-none" />
                          </div>
                        ) : (
                          <DollarSign className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Navigation Footer: Volver/Modificar + Ver Ruta */}
            <div className="p-2.5 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/90 flex items-center justify-between gap-2 shrink-0 z-30">
              <button
                type="button"
                id="btn-step2-back"
                onClick={() => setCurrentStep(1)}
                className="w-10 h-10 sm:w-auto px-0 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-[#0056d6] hover:text-white border border-slate-200/80 hover:border-[#0056d6] hover:shadow-md hover:shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Modificar actividades del itinerario"
                aria-label="Atrás: Modificar actividades"
              >
                <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Modificar actividades</span>
              </button>

              {/* Barra de Iconos de Acción: Ver Ruta */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                {/* Botón Ver Ruta y Mapa para avanzar al paso 3 (Siguiente) */}
                <button
                  type="button"
                  id="btn-step2-to-route"
                  onClick={() => setCurrentStep(3)}
                  title="Ver mapa interactivo, paradas y cómo llegar"
                  aria-label="Siguiente: Ver ruta y mapa"
                  className="w-10 h-10 sm:h-11 sm:w-auto px-0 sm:px-4 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-[#0056d6] text-slate-700 hover:text-white border border-slate-200/90 hover:border-[#0056d6] hover:shadow-md hover:shadow-blue-500/25 active:bg-[#0047b3] focus:bg-[#0056d6] focus:text-white active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold text-xs sm:text-sm"
                >
                  <Route className="hidden sm:inline w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  <span className="hidden sm:inline">Ver Ruta y Mapa</span>
                  <ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: RUTA, MAPA Y FORMA DE LLEGAR */}
        {currentStep === 3 && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-100/50 overflow-hidden">
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="w-full flex-1 p-3 sm:p-6 flex flex-col items-center justify-start bg-slate-50/80 min-h-full">
                <div className="w-full max-w-3xl space-y-4">
                  {/* Componente de la Ruta y Forma de Llegar */}
                  <div className="w-full bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm space-y-3 pb-4">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>Forma de llegar y paradas del itinerario</span>
                      </h4>
                    </div>
                    <PlanRouteSection
                      posts={selectedPosts}
                      planTitle={planTitle}
                      currentCity={currentCity}
                      scheduledTime={scheduledTime}
                      onSelectPost={(p) => setPreviewPost(p)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation Footer Paso 3: Volver a Invitación + Compartir o Publicar */}
            <div className="p-2.5 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/90 flex items-center justify-between gap-2 shrink-0 z-30">
              <button
                type="button"
                id="btn-step3-back"
                onClick={() => setCurrentStep(2)}
                className="w-10 h-10 sm:w-auto px-0 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-[#0056d6] hover:text-white border border-slate-200/80 hover:border-[#0056d6] hover:shadow-md hover:shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Editar diseño de la invitación"
                aria-label="Atrás: Editar invitación"
              >
                <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Editar Invitación</span>
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                {/* Compartir Itinerario */}
                <button
                  type="button"
                  id="btn-step3-share"
                  onClick={handleShareGeneral}
                  title="Compartir itinerario y ruta"
                  aria-label="Compartir itinerario y ruta"
                  className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-[#0056d6] text-slate-700 hover:text-white border border-slate-200/90 hover:border-[#0056d6] hover:shadow-md hover:shadow-blue-500/25 active:bg-[#0047b3] focus:bg-[#0056d6] focus:text-white active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer font-bold text-xs sm:text-sm"
                >
                  <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  <span>Compartir Itinerario</span>
                </button>

                {/* Publicar en Itinerarios Listos (Admin Mode) */}
                {isAdminCreation && (
                  <button
                    type="button"
                    id="btn-admin-publish-plan-step3"
                    onClick={() => {
                      if (selectedPosts.length === 0) {
                        alert('Debes seleccionar al menos una parada para publicar el plan.');
                        return;
                      }
                      setShowAdminPublishModal(true);
                    }}
                    className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-[#007af7] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                    title="Publicar en Itinerarios Listos"
                  >
                    <CheckSquare className="w-4 h-4 text-white" />
                    <span className="hidden sm:inline">Publicar en</span>
                    <span>Itinerarios Listos</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>

    {/* Admin Publish Confirmation Modal */}
    {showAdminPublishModal && (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Publicar Itinerario Oficial"
        className="fixed inset-0 z-[2100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      >
        <div className="w-full max-w-lg rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007af7] flex items-center justify-center shadow-2xs">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Publicar en Itinerarios Listos
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Configura los detalles del itinerario oficial para la plataforma
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdminPublishModal(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Título */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Título del Plan
              </label>
              <input
                type="text"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="Ej. Cita Romántica Gourmet"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#007af7] transition bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Municipio y Categoría */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Municipio
                </label>
                <select
                  value={adminPublishMunicipality}
                  onChange={(e) => setAdminPublishMunicipality(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#007af7] transition bg-slate-50 focus:bg-white cursor-pointer"
                >
                  {municipalities.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Categoría del Plan
                </label>
                <select
                  value={adminPublishCategory}
                  onChange={(e) => setAdminPublishCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#007af7] transition bg-slate-50 focus:bg-white cursor-pointer"
                >
                  {planCategories.filter((c) => c.isActive !== false).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Momento del Día y Tipo de Día */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Momento del Día
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['mañana', 'tarde', 'noche'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAdminPublishTimeOfDay(m)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer border ${
                        adminPublishTimeOfDay === m
                          ? 'bg-[#007af7] text-white border-[#007af7] shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tipo de Día
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'weekend' as const, label: 'Fin de Semana' },
                    { id: 'weekday' as const, label: 'Entre Semana' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setAdminPublishDayType(d.id)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer border truncate ${
                        adminPublishDayType === d.id
                          ? 'bg-[#007af7] text-white border-[#007af7] shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fecha / Cuándo */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Cuándo / Horario Sugerido
              </label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="Ej. Este Sábado 7:00 PM o Cualquier Fin de Semana"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#007af7] transition bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Resumen del Plan */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5 text-slate-800">
              <span className="font-bold text-[11px] uppercase tracking-wider block text-slate-500">
                Resumen del Itinerario:
              </span>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Paradas seleccionadas:</span>
                <span className="font-bold text-slate-900">{selectedPosts.length} paradas</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Presupuesto estimado:</span>
                <span className="font-bold text-slate-900">
                  {totalPrice > 0 ? `$${totalPrice.toLocaleString('es-CO')} COP` : 'Variable'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Plantilla visual:</span>
                <span className="font-bold text-[#007af7]">
                  {TEMPLATE_PRESETS.find((p) => p.cardTemplate === cardTemplate)?.name || 'Azul OleVeci Signature'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdminPublishModal(false)}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              id="btn-admin-confirm-publish-plan"
              onClick={handleConfirmPublishPlan}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#007af7] hover:bg-blue-600 shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Publicar Ahora</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {previewPost && (
      <PostDetailModal
        post={previewPost}
        onClose={() => setPreviewPost(null)}
        onSelectPost={(nextPost) => setPreviewPost(nextPost)}
      />
    )}
  </>
);
};
