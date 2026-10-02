import React from 'react';
import { Calendar } from 'lucide-react';
import { Post } from '../../types';

/**
 * Formats date string strictly into "dd/mm/aaaa hh:mm"
 */
export const formatCompactDate = (dateStr?: string): string => {
  if (!dateStr) return 'No especificada';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Fecha inválida';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
};

interface PostDatesBarProps {
  post: Post;
  className?: string;
  isExpired?: boolean;
}

export const PostDatesBar: React.FC<PostDatesBarProps> = ({
  post,
  className = '',
  isExpired: customIsExpired,
}) => {
  const isExpired =
    customIsExpired !== undefined
      ? customIsExpired
      : Boolean(
          post.status !== 'suspended' &&
            !post.suspended &&
            post.status !== 'pending_review' &&
            post.reviewStatus !== 'pending' &&
            post.expiresAt &&
            new Date(post.expiresAt).getTime() <= Date.now()
        );

  return (
    <div
      className={`w-full min-w-0 flex items-center gap-x-2.5 sm:gap-x-3 mt-2 pt-2 border-t border-slate-100 text-[11px] sm:text-xs text-slate-600 whitespace-nowrap overflow-x-auto no-scrollbar py-0.5 flex-nowrap ${className}`}
    >
      {/* Creada */}
      <div
        className="inline-flex items-center gap-1.5 shrink-0"
        title="Fecha en que se creó la publicación"
      >
        <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span className="text-slate-400 font-normal">Creada:</span>
        <span className="font-normal text-slate-600">
          {formatCompactDate(post.createdAt || post.startsAt)}
        </span>
      </div>

      <span className="text-slate-200 shrink-0">•</span>

      {/* Inicia */}
      <div
        className="inline-flex items-center gap-1.5 shrink-0"
        title="Fecha en que inicia la publicación"
      >
        <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-slate-400 font-normal">Inicia:</span>
        <span className="font-normal text-slate-600">
          {formatCompactDate(post.startsAt)}
        </span>
      </div>

      <span className="text-slate-200 shrink-0">•</span>

      {/* Finaliza */}
      <div
        className="inline-flex items-center gap-1.5 shrink-0"
        title={
          post.expiryLabel
            ? `Finaliza: ${post.expiryLabel}`
            : 'Fecha de finalización o vigencia'
        }
      >
        <Calendar
          className={`w-3.5 h-3.5 shrink-0 ${
            isExpired ? 'text-red-500' : 'text-amber-500'
          }`}
        />
        <span className="text-slate-400 font-normal">Finaliza:</span>
        <span
          className={`font-normal shrink-0 ${
            isExpired ? 'text-red-600' : 'text-slate-600'
          }`}
        >
          {post.expiresAt ? formatCompactDate(post.expiresAt) : 'Sin límite'}
        </span>
      </div>
    </div>
  );
};
