import React from 'react';
import {
  Tag,
  ShoppingBag,
  Zap,
  Calendar,
  Sparkles,
  Utensils,
  Coffee,
  Megaphone,
  Gift,
  Ticket,
  Flame,
  Star,
  Package,
  Scissors,
  Wrench,
  Car,
  Dumbbell,
  HeartPulse,
  Briefcase,
  Music,
  Clock,
  Dog,
  Home,
  Smile,
  BadgePercent,
  Layers,
  Store,
  Compass,
  Pizza,
  Smartphone,
  Heart,
  Wine,
  CheckSquare,
  Sun,
  Moon,
  Camera,
  Film,
  Bike,
} from 'lucide-react';

export const POST_TYPE_LUCIDE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Tag,
  ShoppingBag,
  Zap,
  Calendar,
  Sparkles,
  Utensils,
  Coffee,
  Megaphone,
  Gift,
  Ticket,
  Flame,
  Star,
  Package,
  Scissors,
  Wrench,
  Car,
  Dumbbell,
  HeartPulse,
  Briefcase,
  Music,
  Clock,
  Dog,
  Home,
  Smile,
  BadgePercent,
  Store,
  Compass,
  Layers,
  Pizza,
  Smartphone,
  Heart,
  Wine,
  CheckSquare,
  Sun,
  Moon,
  Camera,
  Film,
  Bike,
};

export const POST_TYPE_EMOJI_PRESETS = [
  '🏷️', '📦', '⚡', '🎉', '✨', '🍔', '☕', '📢', '🎁', '🎟️',
  '🔥', '⭐', '🚀', '✂️', '🛠️', '🚗', '🏋️', '🐾', '🎵', '💼',
  '🍷', '💖', '🐶', '🍕', '🍻', '🍰', '🌿', '⛺', '💆‍♂️', '🏖️',
];

export const isEmoji = (str?: string): boolean => {
  if (!str) return false;
  return /\p{Extended_Pictographic}/u.test(str);
};

export const getPostTypeIconComponent = (
  iconName?: string,
  fallbackId?: string
): React.FC<{ className?: string }> => {
  if (iconName && POST_TYPE_LUCIDE_ICONS[iconName]) {
    return POST_TYPE_LUCIDE_ICONS[iconName];
  }

  if (iconName && isEmoji(iconName)) {
    const EmojiIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
      <span className={`inline-flex items-center justify-center leading-none select-none ${className}`}>
        {iconName}
      </span>
    );
    return EmojiIcon;
  }

  // Fallbacks by ID
  switch (fallbackId) {
    case 'promotion':
      return Tag;
    case 'product':
      return ShoppingBag;
    case 'service':
      return Zap;
    case 'event':
      return Calendar;
    case 'other':
    default:
      return Sparkles;
  }
};

interface PostTypeIconProps {
  iconName?: string;
  fallbackId?: string;
  className?: string;
  emojiClassName?: string;
}

export const PostTypeIconDisplay: React.FC<PostTypeIconProps> = ({
  iconName,
  fallbackId,
  className = 'w-5 h-5',
  emojiClassName = 'text-xl',
}) => {
  if (iconName && POST_TYPE_LUCIDE_ICONS[iconName]) {
    const Icon = POST_TYPE_LUCIDE_ICONS[iconName];
    return <Icon className={className} />;
  }

  if (iconName && isEmoji(iconName)) {
    return (
      <span className={`inline-flex items-center justify-center leading-none select-none ${emojiClassName}`}>
        {iconName}
      </span>
    );
  }

  // Default emojis for base IDs if no lucide icon assigned
  if (fallbackId === 'promotion') return <Tag className={className} />;
  if (fallbackId === 'product') return <ShoppingBag className={className} />;
  if (fallbackId === 'service') return <Zap className={className} />;
  if (fallbackId === 'event') return <Calendar className={className} />;

  return <Sparkles className={className} />;
};

export interface PostTypeLabelConfig {
  id: string;
  label: string;
  slug?: string;
  badgeBg?: string;
}

export const getPostTypeLabel = (
  type?: string,
  postTypes?: PostTypeLabelConfig[]
): string => {
  if (!type) return 'Publicación';
  const norm = type.toLowerCase().trim();
  const found = postTypes?.find(
    (pt) => pt.id.toLowerCase() === norm || pt.slug?.toLowerCase() === norm
  );
  if (found?.label) return found.label;

  switch (norm) {
    case 'promotion':
    case 'promocion':
    case 'promociones':
      return 'Promoción & Oferta';
    case 'event':
    case 'evento':
    case 'eventos':
    case 'plan':
      return 'Plan o Evento';
    case 'product':
    case 'producto':
    case 'productos':
      return 'Producto Destacado';
    case 'service':
    case 'servicio':
    case 'servicios':
      return 'Servicios & Trámites';
    case 'other':
      return 'Novedad';
    default:
      return type;
  }
};

export const getPostTypeBadgeStyle = (
  type?: string,
  postTypes?: PostTypeLabelConfig[]
): string => {
  if (!type) return 'bg-slate-100 text-slate-800 border border-slate-200';
  const norm = type.toLowerCase().trim();
  const found = postTypes?.find(
    (pt) => pt.id.toLowerCase() === norm || pt.slug?.toLowerCase() === norm
  );
  if (found?.badgeBg) return found.badgeBg;

  switch (norm) {
    case 'promotion':
    case 'promocion':
    case 'promociones':
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    case 'event':
    case 'evento':
    case 'eventos':
    case 'plan':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'product':
    case 'producto':
    case 'productos':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'service':
    case 'servicio':
    case 'servicios':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

