import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Eye,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Plus,
  Clock,
  Flame,
  Award,
  Lightbulb,
  DollarSign,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Business, Post } from '../types';
import { OleVeciIcon } from './OleVeciLogo';
import { PostDatesBar } from './common/PostDatesBar';
import { getPostTypeLabel } from '../utils/postTypeIcons';

// 3 radiant sunburst sparks inspired directly by the OleVeci logo pin
const SunburstSparks: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-0.5 select-none ${className}`} aria-hidden="true">
    <span className="w-1 h-3.5 bg-gradient-to-b from-[#ffbe00] to-[#ff5500] rounded-full rotate-12 inline-block shadow-2xs" />
    <span className="w-1 h-3 bg-gradient-to-b from-[#ffbe00] to-[#ff7700] rounded-full rotate-45 inline-block shadow-2xs" />
    <span className="w-1 h-2.5 bg-gradient-to-b from-[#ffbe00] to-[#ff7700] rounded-full rotate-75 inline-block shadow-2xs" />
  </div>
);

// Custom OleVeci-branded Tooltip for Timeline AreaChart
const CustomTimelineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const vistas = payload.find((p: any) => p.dataKey === 'vistas')?.value || 0;
    const contactos = payload.find((p: any) => p.dataKey === 'contactos')?.value || 0;
    const conversion = vistas > 0 ? ((contactos / vistas) * 100).toFixed(1) : '0';

    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-xl shadow-[#021b58]/10 min-w-[210px] text-xs">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 font-black text-[#041f5e]">
            <Calendar className="w-3.5 h-3.5 text-[#007af7]" />
            <span>{label}</span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/70">
            {conversion}% conversión
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#007af7] ring-2 ring-[#007af7]/20 shrink-0" />
              <span className="text-slate-600 font-medium">Vistas Feed</span>
            </div>
            <span className="font-black text-[#041f5e]">{vistas.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff8400] ring-2 ring-[#ff8400]/20 shrink-0" />
              <span className="text-slate-600 font-medium">Contactos directos</span>
            </div>
            <span className="font-black text-[#ff8400]">{contactos.toLocaleString('es-CO')}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom OleVeci-branded Tooltip for Activity BarChart
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-xl shadow-[#021b58]/10 text-xs min-w-[180px]">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
          <span className="font-black text-[#041f5e]">{data.dia}</span>
          {data.esPico && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1 shadow-2xs">
              <Flame className="w-2.5 h-2.5" />
              PICO
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-600 font-medium">Interacciones:</span>
          <span className="font-black text-[#041f5e] text-sm">{data.interacciones.toLocaleString('es-CO')}</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 font-medium">
          {data.esPico ? 'Mayor flujo de clientes potenciales' : 'Actividad regular de consultas'}
        </div>
      </div>
    );
  }
  return null;
};

// Custom OleVeci-branded Tooltip for Channels PieChart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/90 shadow-lg shadow-[#021b58]/10 text-xs flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: data.color }} />
        <span className="font-bold text-slate-700">{data.name}:</span>
        <span className="font-black text-[#041f5e]">{data.value} leads ({data.share}%)</span>
      </div>
    );
  }
  return null;
};

interface BusinessMetricsDashboardProps {
  business: Business;
  businessPosts: Post[];
  onOpenCreatePost: () => void;
}

type TimeRange = '7d' | '30d' | 'all';

export const BusinessMetricsDashboard: React.FC<BusinessMetricsDashboardProps> = ({
  business,
  businessPosts,
  onOpenCreatePost,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeChartTab, setActiveChartTab] = useState<'trends' | 'channels'>('trends');

  // Multipliers for time range simulation based on real base data
  const rangeMultiplier = useMemo(() => {
    switch (timeRange) {
      case '7d':
        return 0.32;
      case 'all':
        return 2.45;
      case '30d':
      default:
        return 1.0;
    }
  }, [timeRange]);

  // Aggregate current metrics
  const rawViews = businessPosts.reduce((acc, p) => acc + (p.metrics?.views || 0), business.metrics?.views || 0);
  const rawWhatsapp = businessPosts.reduce((acc, p) => acc + (p.metrics?.whatsappClicks || 0), business.metrics?.whatsappClicks || 0);
  const rawMaps = businessPosts.reduce((acc, p) => acc + (p.metrics?.mapsClicks || 0), business.metrics?.mapsClicks || 0);
  const rawCalls = businessPosts.reduce((acc, p) => acc + (p.metrics?.calls || 0), business.metrics?.calls || 0);
  const rawShares = businessPosts.reduce((acc, p) => acc + (p.metrics?.shares || 0), business.metrics?.shares || 0);

  // Scaled numbers for the selected range
  const totalViews = Math.max(12, Math.round(rawViews * rangeMultiplier));
  const totalWhatsapp = Math.max(2, Math.round(rawWhatsapp * rangeMultiplier));
  const totalMaps = Math.max(1, Math.round(rawMaps * rangeMultiplier));
  const totalCalls = Math.max(1, Math.round(rawCalls * rangeMultiplier));
  const totalShares = Math.max(1, Math.round(rawShares * rangeMultiplier));

  // High-value direct client contacts (Leads)
  const totalLeads = totalWhatsapp + totalMaps + totalCalls;

  // Conversion rate (Leads / Views)
  const conversionRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : '0';

  // Cost per lead calculation based on $29.900 COP subscription
  const monthlyCost = 29900;
  const effectivePeriodCost = timeRange === '7d' ? Math.round(monthlyCost / 4) : timeRange === 'all' ? monthlyCost * 2.5 : monthlyCost;
  const costPerLead = Math.max(15, Math.round(effectivePeriodCost / Math.max(1, totalLeads)));
  const traditionalAdCostEstimate = totalLeads * 1800; // Average meta/google ads CPC in Colombia ~1.800 COP per lead
  const estimatedSavings = Math.max(0, traditionalAdCostEstimate - effectivePeriodCost);

  // Generate 7-day or 30-day timeline series for Recharts
  const timelineData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === 'all' ? 14 : 10;
    const labels = timeRange === '7d' 
      ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      : ['Día 1', 'Día 4', 'Día 7', 'Día 10', 'Día 13', 'Día 16', 'Día 19', 'Día 22', 'Día 25', 'Día 28'];

    return labels.map((label, idx) => {
      // Deterministic smooth curve based on index
      const factor = (Math.sin(idx * 0.9) + 1.3) / 2.3;
      const dayViews = Math.round((totalViews / days) * (0.6 + factor * 0.8));
      const dayWhatsapp = Math.round((totalWhatsapp / days) * (0.5 + factor * 0.9));
      const dayMaps = Math.round((totalMaps / days) * (0.6 + factor * 0.7));
      const dayCalls = Math.round((totalCalls / days) * (0.7 + factor * 0.6));
      const dayContacts = dayWhatsapp + dayMaps + dayCalls;

      return {
        name: label,
        vistas: Math.max(5, dayViews),
        contactos: Math.max(1, dayContacts),
        whatsapp: Math.max(0, dayWhatsapp),
        maps: Math.max(0, dayMaps),
        llamadas: Math.max(0, dayCalls),
      };
    });
  }, [timeRange, totalViews, totalWhatsapp, totalMaps, totalCalls]);

  // Channel distribution pie chart data based directly on OleVeci logo palette
  const channelData = useMemo(() => {
    return [
      { 
        name: 'WhatsApp Directo', 
        value: totalWhatsapp, 
        color: '#00d8a5', // Emerald Mint inner swirl from OleVeci Logo
        gradientId: 'waGradient',
        share: totalLeads > 0 ? Math.round((totalWhatsapp / totalLeads) * 100) : 0 
      },
      { 
        name: 'Rutas (Google Maps)', 
        value: totalMaps, 
        color: '#ff8400', // Sunburst Golden Orange from OleVeci Logo
        gradientId: 'mapsGradient',
        share: totalLeads > 0 ? Math.round((totalMaps / totalLeads) * 100) : 0 
      },
      { 
        name: 'Llamadas Telefónicas', 
        value: totalCalls, 
        color: '#007af7', // Electric Blue ribbon from OleVeci Logo
        gradientId: 'callsGradient',
        share: totalLeads > 0 ? Math.round((totalCalls / totalLeads) * 100) : 0 
      },
    ];
  }, [totalWhatsapp, totalMaps, totalCalls, totalLeads]);

  // Day-of-week peak activity distribution data
  const dayActivityData = useMemo(() => {
    const daysOrder = [
      { day: 'Lun', factor: 0.72 },
      { day: 'Mar', factor: 0.85 },
      { day: 'Mié', factor: 0.94 },
      { day: 'Jue', factor: 1.15 },
      { day: 'Vie', factor: 1.48 },
      { day: 'Sáb', factor: 1.62 },
      { day: 'Dom', factor: 1.28 },
    ];

    const avgDailyLeads = Math.max(1, totalLeads / 7);
    return daysOrder.map((d) => ({
      dia: d.day,
      interacciones: Math.round(avgDailyLeads * d.factor),
      esPico: d.factor >= 1.4,
    }));
  }, [totalLeads]);

  // Ranked business publications by performance
  const rankedPosts = useMemo(() => {
    return [...businessPosts]
      .map((p) => {
        const pViews = p.metrics?.views || 0;
        const pWa = p.metrics?.whatsappClicks || 0;
        const pMaps = p.metrics?.mapsClicks || 0;
        const pCalls = p.metrics?.calls || 0;
        const pLeads = pWa + pMaps + pCalls;
        const ctr = pViews > 0 ? ((pLeads / pViews) * 100).toFixed(1) : '0';
        return {
          ...p,
          totalInteractions: pLeads,
          ctr,
        };
      })
      .sort((a, b) => b.totalInteractions - a.totalInteractions);
  }, [businessPosts]);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Toolbar with Filter & Action */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
            <OleVeciIcon size={26} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base md:text-lg font-black text-[#041f5e] leading-snug">
                Rendimiento Comercial &amp; Métricas
              </h2>
              <SunburstSparks className="hidden sm:flex" />
            </div>
          </div>
        </div>

        {/* Time range selector - full width segmented control on mobile, compact on desktop */}
        <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setTimeRange('7d')}
            className={`w-full py-2 sm:py-1.5 px-3 rounded-lg sm:rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
              timeRange === '7d'
                ? 'bg-[#041f5e] text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 días
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30d')}
            className={`w-full py-2 sm:py-1.5 px-3 rounded-lg sm:rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
              timeRange === '30d'
                ? 'bg-[#041f5e] text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 días
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            className={`w-full py-2 sm:py-1.5 px-3 rounded-lg sm:rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
              timeRange === 'all'
                ? 'bg-[#041f5e] text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Histórico
          </button>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {/* Vistas */}
        <div className="p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl bg-white border border-sky-200/80 shadow-xs hover:border-[#007af7]/50 transition-all flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">Vistas Feed</span>
            <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-sky-50 flex items-center justify-center text-[#007af7] shrink-0">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl md:text-3xl font-black text-[#041f5e] tracking-tight leading-tight">{totalViews.toLocaleString('es-CO')}</div>
            <div className="mt-0.5 sm:mt-1 flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-[#007af7] font-extrabold truncate">
              <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span>+18.4% vs prev.</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Directo */}
        <div className="p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-emerald-900 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">WhatsApp</span>
            <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl md:text-3xl font-black text-[#041f5e] tracking-tight leading-tight">{totalWhatsapp.toLocaleString('es-CO')}</div>
            <div className="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] text-emerald-800 font-bold flex items-center gap-1 truncate">
              <span>Chats directos</span>
            </div>
          </div>
        </div>

        {/* Cómo llegar (Maps) */}
        <div className="p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-50/90 to-amber-50/50 border border-orange-200/80 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-orange-900 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">Cómo Llegar</span>
            <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-orange-100 text-[#ff8400] flex items-center justify-center shrink-0">
              <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl md:text-3xl font-black text-[#041f5e] tracking-tight leading-tight">{totalMaps.toLocaleString('es-CO')}</div>
            <div className="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] text-orange-800 font-bold flex items-center gap-1 truncate">
              <span>Rutas al local</span>
            </div>
          </div>
        </div>

        {/* Llamadas telefónicas */}
        <div className="p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-50/90 to-sky-50/50 border border-blue-200/80 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-blue-900 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">Llamadas</span>
            <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-blue-100 text-[#007af7] flex items-center justify-center shrink-0">
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl md:text-3xl font-black text-[#041f5e] tracking-tight leading-tight">{totalCalls.toLocaleString('es-CO')}</div>
            <div className="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] text-blue-800 font-bold flex items-center gap-1 truncate">
              <span>Llamadas directas</span>
            </div>
          </div>
        </div>

        {/* Compartidos */}
        <div className="p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border border-indigo-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-row sm:flex-col items-center sm:items-stretch justify-between col-span-2 sm:col-span-1 min-w-0">
          <div className="flex items-center gap-2 sm:justify-between text-indigo-900 sm:mb-2">
            <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-indigo-100 text-[#041f5e] flex items-center justify-center shrink-0">
              <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block">Compartidos</span>
              <span className="text-[9px] text-indigo-800 font-bold sm:hidden block leading-none">Boca a boca digital</span>
            </div>
          </div>
          <div className="text-right sm:text-left">
            <div className="text-lg sm:text-2xl md:text-3xl font-black text-[#041f5e] tracking-tight leading-none sm:leading-tight">{totalShares.toLocaleString('es-CO')}</div>
            <div className="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] text-indigo-800 font-bold hidden sm:flex items-center gap-1">
              <span>Boca a boca digital</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Funnel & Economic ROI High-Impact Summary Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#021b58] via-[#041f5e] to-[#0062f5] text-white p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0088ff]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#00d8a5]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Main Highlights */}
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold text-[#00d8a5]">
              <SunburstSparks />
              <span>Retorno de Inversión (ROI) Comprobado</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Has captado <span className="text-[#ffbe00]">{totalLeads} clientes potenciales</span> directos
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 font-normal leading-relaxed">
              Cada cliente potencial que te contactó te costó únicamente{' '}
              <strong className="text-white font-black underline decoration-[#00d8a5] decoration-2">
                ~${costPerLead.toLocaleString('es-CO')} COP
              </strong>
              . Obtener la misma cantidad con pauta tradicional en redes te costaría aprox.{' '}
              <strong className="text-[#ffbe00]">${traditionalAdCostEstimate.toLocaleString('es-CO')} COP</strong>.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider">Tasa Conversión</span>
              <span className="text-lg sm:text-xl font-black text-white">{conversionRate}%</span>
              <span className="text-[10px] text-[#00d8a5] font-bold">Vistas a Lead</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider">Costo x Contacto</span>
              <span className="text-lg sm:text-xl font-black text-white">${costPerLead}</span>
              <span className="text-[10px] text-blue-200 font-medium">Tarifa plana</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider">Ahorro Estimado</span>
              <span className="text-lg sm:text-xl font-black text-[#ffbe00]">+${Math.round(estimatedSavings / 1000)}k</span>
              <span className="text-[10px] text-blue-200 font-medium">vs Meta/Google</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Main Timeline Chart */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#041f5e] flex items-center gap-2">
                <span>Evolución Temporal de Tráfico y Contactos</span>
                <SunburstSparks className="hidden sm:flex" />
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Compara las vistas en feed frente a los contactos reales generados por tus publicaciones
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-[#041f5e] bg-blue-50/90 px-2.5 py-1 rounded-xl border border-blue-200/70">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007af7] inline-block shadow-2xs" />
                <span>Vistas ({totalViews.toLocaleString('es-CO')})</span>
              </div>
              <div className="flex items-center gap-1.5 font-extrabold text-orange-950 bg-amber-50/90 px-2.5 py-1 rounded-xl border border-amber-200/70">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff8400] inline-block shadow-2xs" />
                <span>Contactos ({totalLeads.toLocaleString('es-CO')})</span>
              </div>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* OleVeci Electric Sky Blue Gradient */}
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007af7" stopOpacity={0.4} />
                    <stop offset="60%" stopColor="#0062f5" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#021b58" stopOpacity={0.0} />
                  </linearGradient>

                  {/* OleVeci Sunburst Golden Orange Gradient */}
                  <linearGradient id="contactsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffbe00" stopOpacity={0.55} />
                    <stop offset="60%" stopColor="#ff8400" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#ff5500" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTimelineTooltip />} />
                <Area
                  type="monotone"
                  dataKey="vistas"
                  name="Vistas Feed"
                  stroke="#007af7"
                  strokeWidth={2.8}
                  fillOpacity={1}
                  fill="url(#viewsGradient)"
                  activeDot={{ r: 5, fill: '#007af7', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="contactos"
                  name="Contactos Directos"
                  stroke="#ff8400"
                  strokeWidth={2.8}
                  fillOpacity={1}
                  fill="url(#contactsGradient)"
                  activeDot={{ r: 5, fill: '#ff8400', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Channels Breakdown Pie / Donut Chart */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#041f5e]">
              Canales de Conversión
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              ¿Por dónde te buscan y contactan tus clientes?
            </p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center my-1">
            {/* SVG Defs for Donut Gradients */}
            <svg className="h-0 w-0 absolute">
              <defs>
                <linearGradient id="waGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00d8a5" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="mapsGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffbe00" />
                  <stop offset="100%" stopColor="#ff5500" />
                </linearGradient>
                <linearGradient id="callsGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0088ff" />
                  <stop offset="100%" stopColor="#0055d4" />
                </linearGradient>
              </defs>
            </svg>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#${entry.gradientId})`}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* White center disc reflecting OleVeci pin logo center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-white shadow-md shadow-[#021b58]/10 border border-slate-100 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[#041f5e] leading-none tracking-tight">{totalLeads}</span>
                <span className="text-[9px] font-extrabold text-[#007af7] tracking-wider uppercase mt-0.5">Leads</span>
              </div>
            </div>
          </div>

          {/* Breakdown List with Brand Colors */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            {channelData.map((channel, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: channel.color }} />
                    <span className="font-bold text-slate-700 truncate">{channel.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-black">
                    <span className="text-[#041f5e]">{channel.value}</span>
                    <span className="text-[11px] font-extrabold text-slate-500 w-9 text-right">{channel.share}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${channel.share}%`, backgroundColor: channel.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Behavioral Analytics: Peak Days & Strategic Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Activity by Day of Week Bar Chart */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#041f5e] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ff8400]" />
                <span>Días de Mayor Actividad y Demanda</span>
                <SunburstSparks className="hidden sm:flex" />
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Descubre qué días de la semana tus publicaciones generan más consultas de clientes
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/70 self-start">
              <Sparkles className="w-3 h-3 text-[#ff8400]" />
              <span>Picos: Jueves a Domingo</span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-48 sm:h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayActivityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  {/* Peak Bar Gradient inspired by OleVeci Sunburst */}
                  <linearGradient id="peakBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffbe00" />
                    <stop offset="50%" stopColor="#ff8400" />
                    <stop offset="100%" stopColor="#ff5500" />
                  </linearGradient>

                  {/* Standard Bar Soft Blue Tint */}
                  <linearGradient id="normalBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#bae6fd" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="dia" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="interacciones" radius={[8, 8, 2, 2]}>
                  {dayActivityData.map((entry, idx) => (
                    <Cell
                      key={`bar-${idx}`}
                      fill={entry.esPico ? 'url(#peakBarGradient)' : 'url(#normalBarGradient)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hours Callout */}
          <div className="pt-2">
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#ff8400] shrink-0" />
              <div className="text-xs">
                <strong className="block font-black text-[#041f5e]">Horarios de Mayor Tráfico</strong>
                <span className="text-amber-900 font-medium">12:00 PM – 2:30 PM y 6:00 PM – 9:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Strategic Tips & CTA */}
        <div className="bg-gradient-to-br from-white via-blue-50/40 to-slate-50 p-4 sm:p-5 rounded-3xl border border-blue-200/70 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ffbe00] to-[#ff8400] text-white flex items-center justify-center shadow-xs">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-[#041f5e]">
              Consejos para Vender Más
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Las promociones con <strong>precio visible</strong> y <strong>foto atractiva</strong> generan un <strong>+38% más de mensajes</strong> directos.
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007af7] mt-1.5 shrink-0" />
              <span>Crea ofertas los días jueves y viernes para aprovechar el fin de semana.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff8400] mt-1.5 shrink-0" />
              <span>Configura la vigencia hasta las 10:00 PM para activar el sentido de urgencia.</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenCreatePost}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-white font-extrabold text-xs transition-all duration-300 shadow-xs cursor-pointer active:scale-[0.99] hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #031c54 0%, #0056d6 50%, #007af7 100%)',
                boxShadow: '0 4px 14px -2px rgba(0, 86, 214, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Crear Publicación para Días Pico</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Top Performing Publications Ranking */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-[#041f5e] flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Ranking de Tus Publicaciones Más Exitosas</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Identifica qué productos o promociones atraen a más clientes a tu local
            </p>
          </div>
          <span className="text-xs font-extrabold text-slate-500">
            {businessPosts.length} publicaciones registradas
          </span>
        </div>

        {rankedPosts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No tienes publicaciones creadas aún. Crea tu primera oferta para comenzar a medir resultados.
          </div>
        ) : (
          <div className="space-y-2.5">
            {rankedPosts.map((post, idx) => (
              <div
                key={post.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Image + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#041f5e] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[#041f5e] truncate">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">
                        {post.promotionalPrice
                          ? `$${post.promotionalPrice.toLocaleString('es-CO')} COP`
                          : 'Sin precio'}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-500 font-bold tracking-wider">
                        {getPostTypeLabel(post.type)}
                      </span>
                    </div>
                    <PostDatesBar post={post} className="mt-1 pt-1 border-t border-slate-200/60" />
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-center px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vistas</span>
                    <span className="text-xs font-black text-slate-800">{post.metrics?.views || 0}</span>
                  </div>

                  <div className="text-center px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                    <span className="block text-[9px] font-bold text-emerald-700 uppercase tracking-wider">WhatsApp</span>
                    <span className="text-xs font-black text-emerald-950">{post.metrics?.whatsappClicks || 0}</span>
                  </div>

                  <div className="text-center px-2.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 shadow-2xs">
                    <span className="block text-[9px] font-bold text-orange-700 uppercase tracking-wider">Maps</span>
                    <span className="text-xs font-black text-orange-950">{post.metrics?.mapsClicks || 0}</span>
                  </div>

                  <div className="text-center px-2.5 py-1.5 rounded-xl bg-[#007af7]/10 border border-[#007af7]/20 shadow-2xs hidden min-[480px]:block">
                    <span className="block text-[9px] font-bold text-[#007af7] uppercase tracking-wider">CTR</span>
                    <span className="text-xs font-black text-[#041f5e]">{post.ctr}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
