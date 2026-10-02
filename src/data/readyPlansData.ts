import { Post } from '../types';
import { INITIAL_POSTS } from './seedData';
import {
  CardTheme,
  CardTemplate,
  BgLayoutMode,
  THEMES,
} from '../components/InvitationCardPreview';

export interface ReadyPlanCategory {
  id: string;
  label: string;
  iconName?: string;
}

export const READY_PLAN_CATEGORIES: ReadyPlanCategory[] = [
  { id: 'all', label: 'Todos los planes' },
  { id: 'plan_cita_romantica', label: 'Cita Romántica / Pareja', iconName: 'Heart' },
  { id: 'plan_consentir_mascotas', label: 'Consentir mis Mascotas', iconName: 'PawPrint' },
  { id: 'plan_comer_algo', label: 'Comer Algo', iconName: 'Utensils' },
  { id: 'plan_tomar_algo', label: 'Tomar Algo', iconName: 'Coffee' },
  { id: 'plan_noche_rumba', label: 'Noche de Rumba', iconName: 'Wine' },
  { id: 'plan_con_amigos', label: 'Plan con Amigos', iconName: 'Smile' },
  { id: 'plan_cuidado_personal', label: 'Cuidado Personal', iconName: 'Sparkles' },
  { id: 'plan_dia_con_ninos', label: 'Día con Niños', iconName: 'Smile' },
  { id: 'plan_cuidar_la_nave', label: 'Cuidar la Nave (Autos/Motos)', iconName: 'Car' },
  { id: 'plan_comprar_algo', label: 'Comprar Algo', iconName: 'ShoppingBag' },
  { id: 'plan_relajarme_en_algun_lado', label: 'Relajarme en Algún Lado', iconName: 'Sun' },
  { id: 'plan_planes_eventos_cerca', label: 'Planes y Eventos Cerca', iconName: 'Calendar' },
  { id: 'plan_tramites', label: 'Trámites & Diligencias', iconName: 'CheckSquare' },
  { id: 'plan_otros', label: 'Otros Planes', iconName: 'Tag' },
  // Compatibilidad adicional
  { id: 'romance', label: 'Cita Romántica / Pareja', iconName: 'Heart' },
  { id: 'gastronomia', label: 'Comer algo', iconName: 'Utensils' },
  { id: 'cafe', label: 'Tomar algo', iconName: 'Coffee' },
  { id: 'parrilla', label: 'Comer algo', iconName: 'Utensils' },
  { id: 'amigos', label: 'Plan con amigos', iconName: 'Smile' },
  { id: 'wellness', label: 'Cuidado personal', iconName: 'Sparkles' },
  { id: 'naturaleza', label: 'Planes y Eventos Cerca', iconName: 'Calendar' },
  { id: 'rumba', label: 'Noche de Rumba', iconName: 'Wine' },
];

export interface SimulatedReadyPlan {
  id: string;
  planTitle: string;
  scheduledTime: string;
  coverImage?: string;
  personalNote?: string;
  hidePrices: boolean;
  cardTemplate: CardTemplate;
  theme: typeof THEMES[CardTheme];
  bgLayout: BgLayoutMode;
  postIds: string[];
  fallbackPosts?: Post[];
  category: string;
  estimatedBudget: number;
  municipality: string;
  timeOfDay: 'mañana' | 'tarde' | 'noche';
  dayType: 'weekend' | 'weekday';
  tags: string[];
}

export interface ReadyPlansFilterParams {
  selectedCategory?: string;
  selectedPlanType?: string;
  selectedCity?: string;
  selectedSector?: string;
  searchQuery?: string;
  maxPlanBudget?: number | null;
  sortOrder?: 'recent' | 'distance' | 'price_low';
  userLocation?: { lat: number; lng: number } | null;
  posts?: Post[];
}

export const filterReadyPlans = (
  plans: SimulatedReadyPlan[],
  params: ReadyPlansFilterParams
): SimulatedReadyPlan[] => {
  const {
    selectedCategory = 'all',
    selectedPlanType = 'all',
    selectedCity = 'all',
    selectedSector = 'all',
    searchQuery = '',
    maxPlanBudget = null,
    sortOrder = 'recent',
    userLocation = null,
    posts = [],
  } = params;

  const filtered = plans.filter((plan) => {
    // 1. Category match
    if (selectedCategory && selectedCategory !== 'all') {
      const catLower = selectedCategory.toLowerCase();
      const planCatLower = (plan.category || '').toLowerCase();
      
      const planPosts = resolvePlanPosts(plan, posts);
      const postMatch = planPosts.some(
        (p) =>
          p.categoryId?.toLowerCase() === catLower ||
          p.planCategoryId?.toLowerCase() === catLower ||
          p.type?.toLowerCase() === catLower
      );

      const directMatch =
        planCatLower === catLower ||
        (catLower === 'plan_cita_romantica' && (planCatLower === 'romance' || planCatLower === 'plan_cita_romantica')) ||
        (catLower === 'plan_comer_algo' && (planCatLower === 'gastronomia' || planCatLower === 'parrilla' || planCatLower === 'plan_comer_algo')) ||
        (catLower === 'plan_tomar_algo' && (planCatLower === 'cafe' || planCatLower === 'plan_tomar_algo')) ||
        (catLower === 'plan_noche_rumba' && (planCatLower === 'rumba' || planCatLower === 'plan_noche_rumba')) ||
        (catLower === 'plan_con_amigos' && (planCatLower === 'amigos' || planCatLower === 'plan_con_amigos')) ||
        (catLower === 'plan_cuidado_personal' && (planCatLower === 'wellness' || planCatLower === 'plan_cuidado_personal')) ||
        (catLower === 'plan_dia_con_ninos' && (planCatLower === 'naturaleza' || planCatLower === 'plan_dia_con_ninos')) ||
        (catLower === 'plan_consentir_mascotas' && (planCatLower === 'mascotas' || planCatLower === 'plan_consentir_mascotas')) ||
        (catLower === 'plan_cuidar_la_nave' && (planCatLower === 'autos' || planCatLower === 'plan_cuidar_la_nave')) ||
        (catLower === 'romance' && (planCatLower === 'romance' || planCatLower === 'plan_cita_romantica')) ||
        (catLower === 'gastronomia' && (planCatLower === 'gastronomia' || planCatLower === 'parrilla' || planCatLower === 'plan_comer_algo')) ||
        (catLower === 'cafe' && (planCatLower === 'cafe' || planCatLower === 'plan_tomar_algo')) ||
        (catLower === 'amigos' && (planCatLower === 'amigos' || planCatLower === 'plan_con_amigos')) ||
        (catLower === 'wellness' && (planCatLower === 'wellness' || planCatLower === 'plan_cuidado_personal')) ||
        (catLower === 'naturaleza' && (planCatLower === 'naturaleza' || planCatLower === 'plan_dia_con_ninos')) ||
        (catLower === 'rumba' && (planCatLower === 'rumba' || planCatLower === 'plan_noche_rumba')) ||
        plan.tags.some((t) => t.toLowerCase().includes(catLower));

      if (!directMatch && !postMatch) {
        return false;
      }
    }

    // 2. Plan Type / Momento match
    if (selectedPlanType && selectedPlanType !== 'all') {
      const typeLower = selectedPlanType.toLowerCase();
      if (typeLower === 'weekend' && plan.dayType !== 'weekend') return false;
      if (typeLower === 'weekday' && plan.dayType !== 'weekday') return false;
      if (typeLower === 'romance' && plan.category !== 'plan_cita_romantica' && plan.category !== 'romance' && !plan.tags.includes('romance') && !plan.tags.includes('pareja')) return false;
      if (typeLower === 'night' && plan.timeOfDay !== 'noche' && plan.category !== 'plan_noche_rumba' && plan.category !== 'rumba' && !plan.tags.includes('noche')) return false;
      if (typeLower === 'amigos' && plan.category !== 'plan_con_amigos' && plan.category !== 'amigos' && !plan.tags.includes('amigos')) return false;
      if (typeLower === 'gastronomia' && plan.category !== 'plan_comer_algo' && plan.category !== 'gastronomia' && plan.category !== 'parrilla' && !plan.tags.includes('gourmet')) return false;
      if (typeLower === 'cafe' && plan.category !== 'plan_tomar_algo' && plan.category !== 'cafe' && !plan.tags.includes('cafe')) return false;
      if (typeLower === 'wellness' && plan.category !== 'plan_cuidado_personal' && plan.category !== 'wellness' && !plan.tags.includes('wellness') && !plan.tags.includes('spa')) return false;
      if (typeLower === 'naturaleza' && plan.category !== 'plan_dia_con_ninos' && plan.category !== 'naturaleza' && !plan.tags.includes('naturaleza') && !plan.tags.includes('pasadia')) return false;
    }

    // 3. Municipality / City match
    if (selectedCity && selectedCity !== 'all') {
      const cityLower = selectedCity.toLowerCase().trim();
      const planMuniLower = (plan.municipality || '').toLowerCase().trim();

      if (planMuniLower !== cityLower) {
        return false;
      }
    }

    // 4. Sector match
    if (selectedSector && selectedSector !== 'all') {
      const qSector = selectedSector.toLowerCase().trim();
      const inTags = plan.tags.some((t) => t.toLowerCase().includes(qSector));
      const planPosts = resolvePlanPosts(plan, posts);
      const inBizSector = planPosts.some(
        (p) =>
          p.businessSector?.toLowerCase().includes(qSector) ||
          p.businessAddress?.toLowerCase().includes(qSector)
      );
      if (!inTags && !inBizSector) return false;
    }

    // 5. Budget filter
    if (maxPlanBudget !== null && maxPlanBudget > 0) {
      if (plan.estimatedBudget > maxPlanBudget) {
        return false;
      }
    }

    // 6. Free text Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const planPosts = resolvePlanPosts(plan, posts);
      const stopsNames = planPosts.map((p) => (p.businessName || p.title).toLowerCase()).join(' ');

      const titleMatch = plan.planTitle.toLowerCase().includes(q);
      const noteMatch = (plan.personalNote || '').toLowerCase().includes(q);
      const catMatch = plan.category.toLowerCase().includes(q);
      const tagsMatch = plan.tags.some((t) => t.toLowerCase().includes(q));
      const stopsMatch = stopsNames.includes(q);

      if (!titleMatch && !noteMatch && !catMatch && !tagsMatch && !stopsMatch) {
        return false;
      }
    }

    return true;
  });

  // Sort logic
  if (sortOrder === 'price_low') {
    return [...filtered].sort((a, b) => a.estimatedBudget - b.estimatedBudget);
  }

  return filtered;
};

export const resolvePlanPosts = (plan: SimulatedReadyPlan, currentPosts: Post[]): Post[] => {
  return plan.postIds
    .map((pid, idx) => {
      const fromPosts = currentPosts.find((p) => p.id === pid && Boolean(p.imageUrl));
      if (fromPosts) return fromPosts;
      const fromInitial = INITIAL_POSTS.find((p) => p.id === pid && Boolean(p.imageUrl));
      if (fromInitial) return fromInitial;
      if (plan.fallbackPosts && plan.fallbackPosts[idx]) return plan.fallbackPosts[idx];
      return currentPosts.find((p) => p.id === pid) || INITIAL_POSTS.find((p) => p.id === pid);
    })
    .filter(Boolean) as Post[];
};

export const READY_PLANS_SEED: SimulatedReadyPlan[] = [
  {
    id: 'plan_romantico_fogata',
    planTitle: 'Cita Romántica & Fogatas',
    scheduledTime: 'Este Sábado • 7:00 PM',
    coverImage: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Noche bajo las estrellas en domo con hidromasaje y fogata ✨',
    hidePrices: false,
    cardTemplate: 'luxury_vip',
    theme: THEMES.dark_vip,
    bgLayout: 'horizontal',
    postIds: ['post_promo_glamping_pareja', 'post_event_cata_vino'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_promo_glamping_pareja')!,
      INITIAL_POSTS.find((p) => p.id === 'post_event_cata_vino')!,
    ].filter(Boolean),
    category: 'plan_cita_romantica',
    estimatedBudget: 340000,
    municipality: 'Cajicá',
    timeOfDay: 'noche',
    dayType: 'weekend',
    tags: ['pareja', 'glamping', 'vino', 'fogata', 'romance', 'velada', 'cita romantica'],
  },
  {
    id: 'plan_burger_cocteles',
    planTitle: 'Ruta Smash Burger & Cócteles',
    scheduledTime: 'Este Viernes • 7:30 PM',
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    personalNote: '¡Doble carne angus y 2x1 en cócteles de autor! 🍔🍹',
    hidePrices: false,
    cardTemplate: 'oleveci_brand',
    theme: THEMES.blue_brand,
    bgLayout: 'horizontal',
    postIds: ['post_promo_smash_combo', 'post_promo_cocteles_2x1'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_promo_smash_combo')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_cocteles_2x1')!,
    ].filter(Boolean),
    category: 'plan_comer_algo',
    estimatedBudget: 68000,
    municipality: 'Cajicá',
    timeOfDay: 'noche',
    dayType: 'weekend',
    tags: ['hamburguesa', 'cocteles', 'comida', 'amigos', 'smash burger', 'comer algo', '2x1'],
  },
  {
    id: 'plan_cafe_mercado',
    planTitle: 'Tarde Bohemia & Café de Origen',
    scheduledTime: 'Este Sábado • 4:00 PM',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Café especial filtrado y panadería artesanal sabanera ☕🌿',
    hidePrices: false,
    cardTemplate: 'bistro_espresso',
    theme: THEMES.bistro_espresso,
    bgLayout: 'grid',
    postIds: ['post_promo_cafe_origen', 'post_product_bread_box'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_promo_cafe_origen')!,
      INITIAL_POSTS.find((p) => p.id === 'post_product_bread_box')!,
    ].filter(Boolean),
    category: 'plan_tomar_algo',
    estimatedBudget: 42000,
    municipality: 'Cajicá',
    timeOfDay: 'tarde',
    dayType: 'weekend',
    tags: ['cafe', 'panaderia', 'tarde', 'bohemio', 'artesanal', 'tomar algo'],
  },
  {
    id: 'plan_spa_colonial',
    planTitle: 'Día de Consentirse & Spa Colonial',
    scheduledTime: 'Este Domingo • 11:00 AM',
    coverImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Escapada colonial de desconexión y tarde de té artesanal en La Balsa 🧖‍♂️✨',
    hidePrices: false,
    cardTemplate: 'rose_gold',
    theme: THEMES.rose_gold,
    bgLayout: 'diagonal',
    postIds: ['post_promo_hotel_chia_colonial', 'post_promo_tarde_te_postre'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_promo_hotel_chia_colonial')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_tarde_te_postre')!,
    ].filter(Boolean),
    category: 'plan_cuidado_personal',
    estimatedBudget: 195500,
    municipality: 'Chía',
    timeOfDay: 'mañana',
    dayType: 'weekend',
    tags: ['spa', 'relax', 'colonial', 'te', 'cuidado personal', 'hotel'],
  },
  {
    id: 'plan_asado_parrillero',
    planTitle: 'Asado Parrillero Sabanero',
    scheduledTime: 'Este Domingo • 1:30 PM',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Picada familiar al carbón y corte matrimonio a la brasa 🥩🔥',
    hidePrices: false,
    cardTemplate: 'terracotta',
    theme: THEMES.terracotta,
    bgLayout: 'horizontal',
    postIds: ['post_chia_promo_parrilla', 'post_promo_matrimonio_parrilla'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_chia_promo_parrilla')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_matrimonio_parrilla')!,
    ].filter(Boolean),
    category: 'plan_comer_algo',
    estimatedBudget: 82900,
    municipality: 'Chía',
    timeOfDay: 'tarde',
    dayType: 'weekend',
    tags: ['parrilla', 'carne', 'asado', 'fogon', 'familia', 'comer algo'],
  },
  {
    id: 'plan_brunch_huerto',
    planTitle: 'Brunch Sabanero & Tardeo Dulce',
    scheduledTime: 'Este Domingo • 10:00 AM',
    coverImage: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Brunch de finca artesanal y tarde de té con torta de zanahoria 🥐☕',
    hidePrices: false,
    cardTemplate: 'minimal_nordic',
    theme: THEMES.nordic_light,
    bgLayout: 'diagonal',
    postIds: ['post_chia_promo_brunch', 'post_promo_tarde_te_postre'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_chia_promo_brunch')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_tarde_te_postre')!,
    ].filter(Boolean),
    category: 'plan_tomar_algo',
    estimatedBudget: 44500,
    municipality: 'Chía',
    timeOfDay: 'mañana',
    dayType: 'weekend',
    tags: ['brunch', 'desayuno', 'reposteria', 'domingo', 'cafe', 'tomar algo'],
  },
  {
    id: 'plan_pasadia_ecologico',
    planTitle: 'Pasadía Campestre & Diversión Familiar',
    scheduledTime: 'Este Sábado • 10:30 AM',
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Senderos ecológicos, zonas verdes y almuerzo a la leña en familia 🌿☀️',
    hidePrices: false,
    cardTemplate: 'emerald',
    theme: THEMES.emerald,
    bgLayout: 'horizontal',
    postIds: ['post_service_pasadia_hotel', 'post_promo_combo_asado_res'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_service_pasadia_hotel')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_combo_asado_res')!,
    ].filter(Boolean),
    category: 'plan_dia_con_ninos',
    estimatedBudget: 125000,
    municipality: 'Cajicá',
    timeOfDay: 'mañana',
    dayType: 'weekend',
    tags: ['naturaleza', 'pasadia', 'campestre', 'senderos', 'aire libre', 'dia con niños'],
  },
  {
    id: 'plan_alitas_amigos',
    planTitle: 'Tarde de Alitas BBQ & Cerveza con Amigos',
    scheduledTime: 'Este Jueves • 6:30 PM',
    coverImage: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Alitas BBQ 2x1 y cócteles para cerrar la tarde laboral 🍗🍺',
    hidePrices: false,
    cardTemplate: 'sunset_party',
    theme: THEMES.sunset,
    bgLayout: 'horizontal',
    postIds: ['post_expired_promo_sample', 'post_promo_cocteles_2x1'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_expired_promo_sample')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_cocteles_2x1')!,
    ].filter(Boolean),
    category: 'plan_con_amigos',
    estimatedBudget: 58000,
    municipality: 'Cajicá',
    timeOfDay: 'tarde',
    dayType: 'weekday',
    tags: ['alitas', 'cerveza', 'after office', 'amigos', 'jueves', 'plan con amigos'],
  },
  {
    id: 'plan_rumba_estanco',
    planTitle: 'Noche de Rumba & Botella de Ron',
    scheduledTime: 'Este Viernes • 9:00 PM',
    coverImage: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Botella de Ron 8 Años, hielera y música para disfrutar entre amigos 🥃🎉',
    hidePrices: false,
    cardTemplate: 'luxury_vip',
    theme: THEMES.dark_vip,
    bgLayout: 'horizontal',
    postIds: ['post_product_ron_caldas', 'post_event_cata_vino'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_product_ron_caldas')!,
      INITIAL_POSTS.find((p) => p.id === 'post_event_cata_vino')!,
    ].filter(Boolean),
    category: 'plan_noche_rumba',
    estimatedBudget: 95000,
    municipality: 'Cajicá',
    timeOfDay: 'noche',
    dayType: 'weekend',
    tags: ['rumba', 'fiesta', 'licores', 'ron', 'viernes', 'noche de rumba'],
  },
  {
    id: 'plan_postres_sabana',
    planTitle: 'Tarde Dulce: Postres & Café de Especialidad',
    scheduledTime: 'Este Sábado • 3:30 PM',
    coverImage: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Cheesecake de frutos rojos, milhoja artesanal y capuchino caliente 🍰☕',
    hidePrices: false,
    cardTemplate: 'rose_gold',
    theme: THEMES.rose_gold,
    bgLayout: 'horizontal',
    postIds: ['post_product_bread_box', 'post_promo_cafe_origen'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_product_bread_box')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_cafe_origen')!,
    ].filter(Boolean),
    category: 'plan_tomar_algo',
    estimatedBudget: 38000,
    municipality: 'Cajicá',
    timeOfDay: 'tarde',
    dayType: 'weekend',
    tags: ['postre', 'dulce', 'cafe', 'tarde', 'familia', 'tomar algo'],
  },
  {
    id: 'plan_cata_vinos_gourmet',
    planTitle: 'Cata de Vinos & Glamping Romántico',
    scheduledTime: 'Este Viernes • 7:00 PM',
    coverImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Experiencia guiada por sommelier con maridaje de quesos y noche en glamping 🍷🏕️',
    hidePrices: false,
    cardTemplate: 'editorial_vogue',
    theme: THEMES.dark_vip,
    bgLayout: 'cinematic',
    postIds: ['post_event_cata_vino', 'post_promo_glamping_pareja'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_event_cata_vino')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_glamping_pareja')!,
    ].filter(Boolean),
    category: 'plan_cita_romantica',
    estimatedBudget: 240000,
    municipality: 'Cajicá',
    timeOfDay: 'noche',
    dayType: 'weekend',
    tags: ['vino', 'cata', 'gourmet', 'glamping', 'pareja', 'cita romantica'],
  },
  {
    id: 'plan_wellness_barber',
    planTitle: 'Ritual de Cuidado & Relax Masculino',
    scheduledTime: 'Este Sábado • 11:30 AM',
    coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Corte estilizado, perfilado de barba al vapor y espresso de cortesía ✂️💈',
    hidePrices: false,
    cardTemplate: 'bistro_espresso',
    theme: THEMES.bistro_espresso,
    bgLayout: 'horizontal',
    postIds: ['post_service_barber', 'post_promo_cafe_origen'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_service_barber')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_cafe_origen')!,
    ].filter(Boolean),
    category: 'plan_cuidado_personal',
    estimatedBudget: 45000,
    municipality: 'Cajicá',
    timeOfDay: 'mañana',
    dayType: 'weekend',
    tags: ['barberia', 'grooming', 'cuidado', 'cafe', 'cuidado personal'],
  },
  {
    id: 'plan_consentir_mascota_spa',
    planTitle: 'Día de Spa & Consentir a mi Mascota',
    scheduledTime: 'Este Sábado • 10:00 AM',
    coverImage: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Baño relajante con ozonoterapia, corte de uñas y consulta veterinaria preventiva 🐾🛁',
    hidePrices: false,
    cardTemplate: 'emerald',
    theme: THEMES.emerald,
    bgLayout: 'horizontal',
    postIds: ['post_service_pet_spa', 'post_promo_vet_consulta_promo'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_service_pet_spa')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_vet_consulta_promo')!,
    ].filter(Boolean),
    category: 'plan_consentir_mascotas',
    estimatedBudget: 70000,
    municipality: 'Cajicá',
    timeOfDay: 'mañana',
    dayType: 'weekend',
    tags: ['mascotas', 'perros', 'spa', 'veterinaria', 'consentir mis mascotas'],
  },
  {
    id: 'plan_cuidar_nave_detailing',
    planTitle: 'Puesta a Punto & Cuidado de la Nave',
    scheduledTime: 'Este Sábado • 9:00 AM',
    coverImage: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format&fit=crop&q=80',
    personalNote: 'Lavado a vapor con cera sintética y desinfección profunda con ozono 🚗✨',
    hidePrices: false,
    cardTemplate: 'bistro_espresso',
    theme: THEMES.bistro_espresso,
    bgLayout: 'horizontal',
    postIds: ['post_service_lavado_vapor', 'post_promo_cojineria_ozono'],
    fallbackPosts: [
      INITIAL_POSTS.find((p) => p.id === 'post_service_lavado_vapor')!,
      INITIAL_POSTS.find((p) => p.id === 'post_promo_cojineria_ozono')!,
    ].filter(Boolean),
    category: 'plan_cuidar_la_nave',
    estimatedBudget: 158900,
    municipality: 'Cajicá',
    timeOfDay: 'mañana',
    dayType: 'weekend',
    tags: ['autos', 'lavado', 'detailing', 'vapor', 'cuidar la nave', 'cajica'],
  },
];
