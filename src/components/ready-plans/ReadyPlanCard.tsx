import React from 'react';
import { Route, Calendar } from 'lucide-react';
import { SimulatedReadyPlan, resolvePlanPosts } from '../../data/readyPlansData';
import { Post } from '../../types';
import { PlanBackgroundImages } from '../InvitationCardPreview';

export interface ReadyPlanCardProps {
  plan: SimulatedReadyPlan;
  posts: Post[];
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ReadyPlanCard: React.FC<ReadyPlanCardProps> = ({
  plan,
  posts,
  onClick,
  className = '',
  style,
}) => {
  const planPosts = resolvePlanPosts(plan, posts);

  return (
    <div
      onClick={onClick}
      style={style}
      className={`relative rounded-3xl overflow-hidden shrink-0 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer bg-slate-900 border border-slate-200/80 select-none ${className}`}
      title={`Toca para ver el plan: ${plan.planTitle}`}
    >
      {/* Fotos de fondo según la composición del plan */}
      <div className="absolute inset-0 overflow-hidden">
        <PlanBackgroundImages
          posts={planPosts}
          bgLayout={plan.bgLayout}
          theme={plan.theme}
          imageClassName="group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Degradado para máxima legibilidad tipográfica */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-black/25 pointer-events-none" />

      {/* Badge superior */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/95 border border-white/20 text-[10px] font-bold flex items-center gap-1.5 shadow-md">
          <div className="relative w-4 h-4 rounded-md bg-gradient-to-br from-cyan-400/30 via-blue-500/25 to-blue-600/35 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            <Route
              className="w-2.5 h-2.5 text-cyan-300 drop-shadow-[0_1px_4px_rgba(0,180,216,0.8)]"
              strokeWidth={2.4}
            />
          </div>
          <span>Itinerario listo</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20">
          {planPosts.length} {planPosts.length === 1 ? 'parada' : 'paradas'}
        </span>
      </div>

      {/* Contenido inferior: Solo Título, Día y Hora */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 flex flex-col justify-end space-y-2 pointer-events-none z-10">
        {/* Día y Hora */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold w-fit">
            <Calendar className="w-3.5 h-3.5 text-blue-200 shrink-0" />
            <span>{plan.scheduledTime}</span>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-base sm:text-lg font-black text-white leading-tight tracking-tight line-clamp-2 drop-shadow-sm group-hover:text-blue-200 transition-colors">
          {plan.planTitle}
        </h3>
      </div>
    </div>
  );
};
