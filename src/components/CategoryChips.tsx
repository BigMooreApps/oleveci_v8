import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Utensils,
  Coffee,
  Pizza,
  Sparkles,
  HeartPulse,
  Dumbbell,
  Calendar,
  Dog,
  ShoppingBag,
  Home,
  Wrench,
  Smartphone,
  Smile,
  Car,
  Compass,
  Tag,
  LayoutGrid,
  Zap,
  Megaphone,
  Gift,
  Ticket,
  Flame,
  Star,
  Package,
  Scissors,
  Briefcase,
  Music,
  Clock,
  BadgePercent,
  Store,
  Layers,
} from 'lucide-react';
import { isEmoji } from '../utils/postTypeIcons';

export const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Utensils,
  Coffee,
  Pizza,
  Sparkles,
  HeartPulse,
  Dumbbell,
  Calendar,
  Dog,
  ShoppingBag,
  Home,
  Wrench,
  Smartphone,
  Smile,
  Car,
  Compass,
  Tag,
  Zap,
  Megaphone,
  Gift,
  Ticket,
  Flame,
  Star,
  Package,
  Scissors,
  Briefcase,
  Music,
  Clock,
  BadgePercent,
  Store,
  Layers,
};

export const CategoryChips: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, posts, isPostActive } = useApp();

  // Active posts count per category
  const activePosts = posts.filter(isPostActive);

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2 px-4 -mx-4 sm:mx-0 sm:px-0 flex items-center gap-2 select-none">
      {/* "Todos" Chip */}
      <button
        id="cat-chip-all"
        onClick={() => setSelectedCategory('all')}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
          selectedCategory === 'all'
            ? 'bg-[#041f5e] text-white shadow-sm shadow-[#041f5e]/20'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Todos</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedCategory === 'all' ? 'bg-[#072a78] text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {activePosts.length}
        </span>
      </button>

      {/* Categories List */}
      {categories.map((cat) => {
        const IconComponent = ICON_MAP[cat.iconName] || Tag;
        const isSelected = selectedCategory === cat.id;
        const categoryCount = activePosts.filter((p) => p.categoryId === cat.id).length;

        return (
          <button
            key={cat.id}
            id={`cat-chip-${cat.slug}`}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              isSelected
                ? 'bg-[#007af7] text-white shadow-sm shadow-[#007af7]/25 font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 hover:border-blue-200 border border-slate-200/80 shadow-2xs'
            }`}
          >
            {isEmoji(cat.iconName) ? (
              <span className="text-sm leading-none shrink-0">{cat.iconName}</span>
            ) : (
              <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#007af7]'}`} />
            )}
            <span>{cat.name}</span>
            {categoryCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-blue-800/60 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {categoryCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
