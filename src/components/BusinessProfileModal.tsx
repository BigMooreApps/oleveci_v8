import React, { useState } from 'react';
import { Post } from '../types';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { ScheduleReadOnlyTable } from './ScheduleReadOnlyTable';
import { formatColombianPhone } from '../utils/phoneUtils';
import { WhatsAppIcon } from './WhatsAppIcon';
import { OleVeciIcon } from './OleVeciLogo';
import { BusinessLocationMapModal } from './BusinessLocationMapModal';
import {
  X,
  MapPin,
  Clock,
  MessageCircle,
  Phone,
  Navigation,
  ShieldCheck,
  Share2,
  Sparkles,
  ExternalLink,
  Store,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react';

interface BusinessProfileModalProps {
  businessId: string | null;
  onClose: () => void;
  onSelectPost?: (post: Post) => void;
}

export const BusinessProfileModal: React.FC<BusinessProfileModalProps> = ({
  businessId,
  onClose,
  onSelectPost,
}) => {
  const { businesses, posts, isPostActive, categories, getDistanceKm, trackBusinessInteraction } = useApp();

  // Accordion state - matching the exact business configuration design (Image 2)
  const [isMainInfoOpen, setIsMainInfoOpen] = useState(false);
  const [isLocationContactOpen, setIsLocationContactOpen] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isViewMapModalOpen, setIsViewMapModalOpen] = useState(false);

  if (!businessId) return null;

  const business = businesses.find((b) => b.id === businessId);
  if (!business) return null;

  const categoryName = categories.find((c) => c.id === business.categoryId)?.name || 'General';

  const businessPosts = posts.filter(
    (p) => p.businessId === business.id && isPostActive(p)
  );

  const distance = getDistanceKm(business.coordinates);

  // Dynamic Contact Information Evaluation
  const hasWhatsApp = Boolean(business.whatsapp && business.whatsapp.trim());
  const rawWhatsapp = (business.whatsapp || '').replace(/\D/g, '');
  const cleanWhatsapp = rawWhatsapp.length === 10 && rawWhatsapp.startsWith('3') ? `57${rawWhatsapp}` : rawWhatsapp;

  const hasPhone = Boolean(
    business.phone && business.phone.trim() && business.phone !== 'No registrado'
  );
  const callablePhone = hasPhone
    ? business.phone
    : hasWhatsApp
    ? business.whatsapp
    : null;

  const hasLocation = Boolean(
    (business.address && business.address.trim()) ||
    (business.coordinates?.lat && business.coordinates?.lng)
  );

  const handleWhatsAppContact = () => {
    if (!hasWhatsApp) return;
    const origin = window.location.origin;
    const bizUrl = `${origin}/comercio/${business.id}`;
    const msg = `Hola, quisiera más información sobre sus productos y servicios:\n${bizUrl}`;
    window.open(`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    const origin = window.location.origin;
    const bizUrl = `${origin}/comercio/${business.id}`;
    const shareText = `Te comparto este comercio:\n${bizUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: 'Te comparto este comercio',
          url: bizUrl,
        });
        return;
      } catch {}
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="business-profile-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Banner Header (matching business configuration view) */}
        <div className="relative">
          {/* Cover image banner */}
          <div className="h-40 sm:h-48 w-full bg-slate-100 relative overflow-hidden group">
            {business.coverImage ? (
              <img
                src={business.coverImage}
                alt={business.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />

            {/* Top close & share buttons */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>{business.sector}, {business.city}</span>
                {distance !== null && <span>· {distance} km</span>}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
                  aria-label="Compartir"
                  title="Compartir"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom bar with logo, business name, category, and verified badge */}
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-contain border-2 border-white shadow-md bg-transparent shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-md shrink-0">
                    {business.name.slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold drop-shadow-xs truncate">
                    {business.name}
                  </h3>
                  <p className="text-xs text-blue-100 font-medium truncate">
                    <span className="font-bold text-white drop-shadow-2xs">{business.subCategory || categoryName}</span> · {business.sector}, {business.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {business.verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Verificado</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Information Readonly View structured in the exact same 3 visual accordion containers as business configuration */}
          <div className="space-y-3 text-xs">
            {/* Sección 1: Información Principal */}
            <div
              className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
                isMainInfoOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsMainInfoOpen(!isMainInfoOpen)}
                className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#041f5e] font-extrabold">
                    Información principal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                    {isMainInfoOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </button>

              {isMainInfoOpen && (
                <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                  <div>
                    <span className="block font-bold text-slate-700 text-xs mb-1">
                      Nombre del Comercio
                    </span>
                    <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 shadow-2xs">
                      {business.name}
                    </div>
                  </div>

                  {/* Especialidad / Subcategoría y Categoría */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="block font-bold text-slate-700 text-xs mb-1">
                        Especialidad / Subcategoría
                      </span>
                      <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 shadow-2xs">
                        {business.subCategory || 'General'}
                      </div>
                    </div>

                    <div>
                      <span className="block font-bold text-slate-700 text-xs mb-1">
                        Categoría Comercial
                      </span>
                      <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 shadow-2xs">
                        {categoryName}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="block font-bold text-slate-700 text-xs mb-1">
                      Descripción del Comercio
                    </span>
                    <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 leading-relaxed shadow-2xs">
                      {business.description || 'Sin descripción disponible.'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 2: Ubicación & Contacto */}
            <div
              className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
                isLocationContactOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsLocationContactOpen(!isLocationContactOpen)}
                className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#041f5e] font-extrabold">
                    Ubicación y contacto
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                    {isLocationContactOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </button>

              {isLocationContactOpen && (
                <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="block font-bold text-slate-700 text-xs mb-1">
                        Municipio
                      </span>
                      <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 shadow-2xs">
                        {business.city}
                      </div>
                    </div>

                    <div>
                      <span className="block font-bold text-slate-700 text-xs mb-1">
                        Barrio / Sector
                      </span>
                      <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 shadow-2xs">
                        {business.sector}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="block font-bold text-slate-700 text-xs">
                        Dirección Física
                      </span>
                      {hasLocation && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          Haz clic para ver ubicación en el mapa
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => hasLocation && setIsViewMapModalOpen(true)}
                        disabled={!hasLocation}
                        className={`flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-2xs text-left transition flex items-center justify-between group ${
                          hasLocation ? 'hover:bg-blue-50/40 cursor-pointer' : 'cursor-default'
                        }`}
                        title={hasLocation ? "Ver en mapa interactivo de OleVeci" : undefined}
                      >
                        <span className="truncate">{business.address || 'Dirección no registrada'}</span>
                        {hasLocation && (
                          <span className="text-[11px] text-[#007af7] font-bold opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                            Ver mapa →
                          </span>
                        )}
                      </button>
                      {hasLocation && (
                        <button
                          type="button"
                          onClick={() => setIsViewMapModalOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#007af7] to-[#041f5e] hover:brightness-110 active:scale-95 px-3.5 py-2.5 rounded-xl transition border border-blue-600/30 shrink-0 shadow-2xs cursor-pointer"
                          title="Ver ubicación en el mapa con el icono de OleVeci para poder llegar"
                        >
                          <OleVeciIcon size={16} />
                          <span>Ver en Mapa</span>
                        </button>
                      )}
                    </div>
                    {hasLocation && (
                      <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5 px-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>
                          Haz clic en <strong>Ver en Mapa</strong> para ver el local con el pin oficial de <strong>OleVeci</strong> y trazar ruta de llegada.
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="block font-bold text-slate-700 text-xs mb-1">
                        WhatsApp de Atención
                      </span>
                      {hasWhatsApp ? (
                        <button
                          type="button"
                          onClick={handleWhatsAppContact}
                          className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                          title="Chatear con el negocio por WhatsApp"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                            <span className="truncate">{formatColombianPhone(business.whatsapp)}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-normal text-slate-400">
                          <MessageCircle className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>No registrado</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block font-bold text-slate-700 text-xs mb-1">
                        Teléfono / Línea fija
                      </span>
                      <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/40 text-xs font-normal text-blue-950 shadow-2xs">
                        <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{business.phone || 'No registrado'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="block font-bold text-slate-700 text-xs mb-1">
                      Correo Electrónico
                    </span>
                    <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 shadow-2xs">
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                      {business.email || business.billingInfo?.email ? (
                        <a
                          href={`mailto:${business.email || business.billingInfo?.email}`}
                          className="text-[#007af7] hover:underline truncate"
                        >
                          {business.email || business.billingInfo?.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 font-normal">No registrado</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 3: Horarios de Atención */}
            <div
              className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
                isHoursOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsHoursOpen(!isHoursOpen)}
                className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#041f5e] font-extrabold">
                    Horario de atención
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                    {isHoursOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </button>

              {isHoursOpen && (
                <div className="pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                  <ScheduleReadOnlyTable schedule={business.hours} />
                </div>
              )}
            </div>
          </div>

          {/* Published items of this business */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#007af7]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Publicaciones del negocio
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#007af7] font-bold border border-blue-100">
                {businessPosts.length} activas
              </span>
            </div>

            {/* Post cards grid - Siempre en modo cuadrícula (2 columnas) */}
            {businessPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 mt-2.5">
                {businessPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    viewMode="grid"
                    compact={true}
                    onSelectPost={(p) => {
                      onClose();
                      if (onSelectPost) onSelectPost(p);
                    }}
                    onSelectBusiness={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 mt-2">
                <Sparkles className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">
                  Este negocio aún no tiene publicaciones activas hoy.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Location View Modal with OleVeci Pin */}
      {isViewMapModalOpen && (
        <BusinessLocationMapModal
          isOpen={isViewMapModalOpen}
          onClose={() => setIsViewMapModalOpen(false)}
          business={{
            name: business.name,
            address: business.address,
            city: business.city,
            sector: business.sector,
            coordinates: business.coordinates,
            logo: business.logo,
            category: business.categoryId,
            subCategory: business.subCategory,
            whatsapp: business.whatsapp,
            phone: business.phone,
            verified: business.verified,
          }}
        />
      )}
    </div>
  );
};
