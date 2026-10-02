import React, { useState } from 'react';
import { Business, Post, SuspensionHistoryEntry } from '../../types';
import { getBusinessSuspensionGuide } from '../../utils/businessSuspensionGuide';
import {
  Ban,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Store,
  History,
  ArrowUpDown,
  FileCheck2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SuspensionTimelineProps {
  business?: Business;
  post?: Post;
  customHistory?: SuspensionHistoryEntry[];
  compact?: boolean;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  title?: string;
  cleanMessage?: string;
}

export function formatTimelineTimestamp(timestampStr?: string): string {
  if (!timestampStr) return 'Fecha no registrada';
  try {
    const d = new Date(timestampStr);
    if (isNaN(d.getTime())) return timestampStr;
    return d.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return timestampStr;
  }
}

export function buildFallbackSuspensionTimeline(business: Business): SuspensionHistoryEntry[] {
  if (Array.isArray(business.suspensionHistory) && business.suspensionHistory.length > 0) {
    return [...business.suspensionHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  const entries: SuspensionHistoryEntry[] = [];
  const baseTime = business.suspendedAt
    ? new Date(business.suspendedAt).getTime()
    : Date.now() - 3600000 * 4;

  // 1. Initial suspension by admin
  if (business.suspensionReason || business.status === 'suspended' || business.status === 'pending_review') {
    entries.push({
      id: `hist_syn_susp_${business.id}`,
      type: 'suspension',
      title: 'Suspensión del Comercio',
      note: business.suspensionReason || 'Incumplimiento de términos y políticas del servicio.',
      timestamp: business.suspendedAt || new Date(baseTime).toISOString(),
      authorRole: 'admin',
      authorName: 'Administración OleVeci',
      badge: '1ª Suspensión',
      incidentNumber: 1,
    });
  }

  // 2. Client correction / review request
  if (business.correctionNote || business.status === 'pending_review' || business.reviewRequestedAt) {
    const reviewTime = business.reviewRequestedAt
      ? new Date(business.reviewRequestedAt).getTime()
      : baseTime + 3600000 * 2;
    entries.push({
      id: `hist_syn_req_${business.id}`,
      type: 'review_request',
      title: 'Solicitud de Revisión y Corrección',
      note: business.correctionNote || 'Corrección y justificación enviada para evaluación.',
      timestamp: business.reviewRequestedAt || new Date(reviewTime).toISOString(),
      authorRole: 'business',
      authorName: business.name || 'Comercio',
      badge: 'Respuesta del Cliente',
      incidentNumber: 1,
    });
  }

  // 3. Admin rejection if any
  if (business.reviewStatus === 'rejected' && business.rejectionReason) {
    const rejectTime = business.lastReviewedAt
      ? new Date(business.lastReviewedAt).getTime()
      : baseTime + 3600000 * 3;
    entries.push({
      id: `hist_syn_rej_${business.id}`,
      type: 'review_rejection',
      title: 'Observación de Rechazo del Administrador',
      note: business.rejectionReason,
      timestamp: business.lastReviewedAt || new Date(rejectTime).toISOString(),
      authorRole: 'admin',
      authorName: 'Administración OleVeci',
      badge: 'Observación del Admin',
      incidentNumber: 1,
    });
  }

  return entries;
}

export function buildFallbackPostSuspensionTimeline(post: Post): SuspensionHistoryEntry[] {
  if (Array.isArray(post.suspensionHistory) && post.suspensionHistory.length > 0) {
    return [...post.suspensionHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  const entries: SuspensionHistoryEntry[] = [];
  const baseTime = post.suspendedAt
    ? new Date(post.suspendedAt).getTime()
    : Date.now() - 3600000 * 4;

  if (post.suspensionReason || post.status === 'suspended' || post.suspended || post.status === 'pending_review') {
    entries.push({
      id: `hist_syn_susp_post_${post.id}`,
      type: 'suspension',
      title: 'Suspensión de la Publicación',
      note: post.suspensionReason || 'No cumple con las políticas de contenido de la plataforma.',
      timestamp: post.suspendedAt || new Date(baseTime).toISOString(),
      authorRole: 'admin',
      authorName: 'Administración OleVeci',
      badge: '1ª Suspensión',
      incidentNumber: 1,
    });
  }

  if (post.correctionNote || post.status === 'pending_review' || post.reviewRequestedAt) {
    const reviewTime = post.reviewRequestedAt
      ? new Date(post.reviewRequestedAt).getTime()
      : baseTime + 3600000 * 2;
    entries.push({
      id: `hist_syn_req_post_${post.id}`,
      type: 'review_request',
      title: 'Solicitud de Revisión tras Corrección',
      note: post.correctionNote || 'Correcciones realizadas en la publicación enviadas para reevaluación.',
      timestamp: post.reviewRequestedAt || new Date(reviewTime).toISOString(),
      authorRole: 'business',
      authorName: post.businessName || 'Comercio',
      badge: 'Corrección del Comercio',
      incidentNumber: 1,
    });
  }

  if (post.reviewStatus === 'rejected' && post.rejectionReason) {
    const rejectTime = post.lastReviewedAt
      ? new Date(post.lastReviewedAt).getTime()
      : baseTime + 3600000 * 3;
    entries.push({
      id: `hist_syn_rej_post_${post.id}`,
      type: 'review_rejection',
      title: 'Observación de Rechazo del Administrador',
      note: post.rejectionReason,
      timestamp: post.lastReviewedAt || new Date(rejectTime).toISOString(),
      authorRole: 'admin',
      authorName: 'Administración OleVeci',
      badge: 'Observación del Admin',
      incidentNumber: 1,
    });
  }

  return entries;
}

export const SuspensionTimeline: React.FC<SuspensionTimelineProps> = ({
  business,
  post,
  customHistory,
  compact = false,
  className = '',
  collapsible = false,
  defaultExpanded = true,
  isExpanded: controlledIsExpanded,
  onToggleExpand,
  title,
  cleanMessage,
}) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [internalIsExpanded, setInternalIsExpanded] = useState<boolean>(defaultExpanded ?? true);

  const isControlled = typeof controlledIsExpanded === 'boolean';
  const isExpanded = isControlled ? controlledIsExpanded : internalIsExpanded;

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    }
    if (!isControlled) {
      setInternalIsExpanded((prev) => !prev);
    }
  };

  const baseTimeline =
    customHistory ||
    (business
      ? buildFallbackSuspensionTimeline(business)
      : post
      ? buildFallbackPostSuspensionTimeline(post)
      : []);

  const sortedTimeline = [...baseTimeline].sort((a, b) => {
    const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    return sortOrder === 'asc' ? diff : -diff;
  });

  if (baseTimeline.length === 0) {
    return (
      <div className={`p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs space-y-1 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <p className="font-bold text-slate-800">
          {post ? 'Publicación sin sanciones' : 'Historial de moderación limpio'}
        </p>
        <p className="text-[11px] text-slate-500">
          {cleanMessage ||
            (post
              ? 'Esta publicación no registra antecedentes de suspensión, faltas o reportes en OleVeci.'
              : 'Este comercio no registra antecedentes de suspensión, faltas o reportes en OleVeci.')}
        </p>
      </div>
    );
  }

  return (
    <div className={`${isExpanded ? 'space-y-3' : ''} ${className}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <History className="w-4 h-4 text-slate-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words">
              {title || (post ? 'Histórico de Moderación de la Publicación' : 'Histórico Cronológico de Moderación')}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
          {collapsible && (
            <button
              type="button"
              onClick={handleToggle}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0"
              title={isExpanded ? 'Reducir' : 'Ampliar'}
              aria-label={isExpanded ? 'Reducir' : 'Ampliar'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" />
              )}
            </button>
          )}

          {(!collapsible || isExpanded) && (
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0"
              title={sortOrder === 'asc' ? 'Orden cronológico (clic para ver más recientes)' : 'Más recientes (clic para ver orden cronológico)'}
              aria-label={sortOrder === 'asc' ? 'Cronológico' : 'Recientes'}
            >
              <ArrowUpDown className="w-4 h-4 text-slate-600 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Timeline Steps */}
      {(!collapsible || isExpanded) && (
        <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200 animate-in fade-in duration-150">
        {sortedTimeline.map((item, index) => {
          const stepNumber = index + 1;
          const isClient = item.authorRole === 'business';
          const isSuspension = item.type === 'suspension';
          const isRejection = item.type === 'review_rejection';
          const isReactivation = item.type === 'reactivation';

          // Visual styles by type
          const nodeColor = isSuspension
            ? 'bg-rose-500 text-white ring-4 ring-rose-50'
            : isClient
            ? 'bg-amber-500 text-white ring-4 ring-amber-50'
            : isRejection
            ? 'bg-red-600 text-white ring-4 ring-red-50'
            : 'bg-emerald-600 text-white ring-4 ring-emerald-50';

          const cardBorder = isSuspension
            ? 'border-rose-200 bg-rose-50/40'
            : isClient
            ? 'border-amber-200 bg-amber-50/50'
            : isRejection
            ? 'border-red-200 bg-red-50/40'
            : 'border-emerald-200 bg-emerald-50/50';

          return (
            <div key={item.id || index} className="relative group">
              {/* Step indicator circle on vertical line */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xs ${nodeColor}`}
                title={`Paso ${stepNumber}`}
              >
                {stepNumber}
              </div>

              {/* Event Card */}
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all shadow-xs ${cardBorder}`}>
                {/* Header: Step title, Role & Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="font-bold text-slate-900 break-words">
                      {item.title}
                    </span>
                    {item.incidentNumber && item.incidentNumber > 1 && isSuspension && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-red-600 text-white shadow-2xs shrink-0">
                        FALTA REITERADA #{item.incidentNumber}
                      </span>
                    )}
                  </div>

                  {/* Exact Timestamp */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium shrink-0">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{formatTimelineTimestamp(item.timestamp)}</span>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                  {isClient ? (
                    <>
                      <Store className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="break-words">
                        Comentado por: <strong className="text-slate-800">{item.authorName || business?.name || post?.businessName || 'Comercio'}</strong> (Cliente / Comercio)
                      </span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3 text-[#041f5e] shrink-0" />
                      <span className="break-words">
                        Emitido por: <strong className="text-slate-800">{item.authorName || 'Administrador OleVeci'}</strong>
                      </span>
                    </>
                  )}
                </div>

                {/* Content Body */}
                {isSuspension && (
                  <div className="p-2 rounded-lg bg-white/90 border border-rose-200 text-slate-800 leading-relaxed font-medium">
                    {item.note}
                  </div>
                )}

                {isClient && (
                  <div className="p-2.5 rounded-lg bg-white/95 border border-amber-300 text-amber-950 leading-relaxed font-medium italic shadow-2xs">
                    "{item.note}"
                  </div>
                )}

                {isRejection && (
                  <div className="p-2 rounded-lg bg-white/90 border border-red-200 text-red-950 leading-relaxed font-medium">
                    "{item.note}"
                  </div>
                )}

                {isReactivation && (
                  <div className="p-2 rounded-lg bg-white/90 border border-emerald-200 text-emerald-950 leading-relaxed font-medium">
                    {item.note}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

