import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanCategory } from '../../types';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  PostTypeIconDisplay,
  POST_TYPE_LUCIDE_ICONS,
  POST_TYPE_EMOJI_PRESETS,
  isEmoji,
} from '../../utils/postTypeIcons';

export const AdminPlanCategoriesTab: React.FC = () => {
  const {
    planCategories,
    categories,
    addPlanCategory,
    updatePlanCategory,
    deletePlanCategory,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<PlanCategory | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PlanCategory | null>(null);

  // Modal Form State (mirroring AdminPostTypesTab exactly)
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [iconName, setIconName] = useState('Compass');
  const [iconTab, setIconTab] = useState<'lucide' | 'emoji'>('lucide');

  // Sorted list of plans
  const sortedPlans = useMemo(() => {
    return [...planCategories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [planCategories]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setPlanToEdit(null);
    setName('');
    setSubtitle('');
    setIconName('Compass');
    setIconTab('lucide');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (plan: PlanCategory) => {
    setPlanToEdit(plan);
    setName(plan.name);
    setSubtitle(plan.subtitle || '');
    const currentIcon = plan.iconName || 'Compass';
    setIconName(currentIcon);
    setIconTab(isEmoji(currentIcon) ? 'emoji' : 'lucide');
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedSlug =
      planToEdit?.slug ||
      name
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const color = planToEdit?.color || '#007af7';
    const badgeBg = planToEdit?.badgeBg || '#eff6ff';
    const badgeText = planToEdit?.badgeText || '#007af7';

    const payload = {
      name: name.trim(),
      subtitle: subtitle.trim(),
      slug: generatedSlug,
      color,
      badgeBg,
      badgeText,
      iconName,
      allowedCategoryIds: planToEdit?.allowedCategoryIds || categories.map((c) => c.id),
      maxMainDishes: 1,
      preventDuplicateCategories: true,
      defaultTitleSuggestions: [name.trim()],
      isActive: planToEdit?.isActive ?? true,
      order: planToEdit?.order || planCategories.length + 1,
    };

    if (planToEdit) {
      updatePlanCategory(planToEdit.id, payload);
    } else {
      addPlanCategory(payload);
    }

    setIsModalOpen(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!planToDelete) return;
    if (planCategories.length <= 1) {
      alert('Debe existir al menos un tipo de plan disponible en el sistema.');
      setPlanToDelete(null);
      return;
    }
    deletePlanCategory(planToDelete.id);
    setPlanToDelete(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#007af7] shrink-0" />
              <span className="truncate">Tipos de Planes</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#007af7] border border-blue-200/60 shrink-0">
                {planCategories.length}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
              Temáticas y categorías de salida disponibles para vecinos, publicaciones e itinerarios.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#007af7] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Tipo de Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Categories List View */}
      {sortedPlans.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No hay tipos de planes registrados en el sistema.
        </div>
      ) : (
        <div className="space-y-1.5 sm:space-y-2">
          {sortedPlans.map((plan) => {
            const allowedCats = categories.filter((c) =>
              (plan.allowedCategoryIds || []).includes(c.id)
            );

            return (
              <div
                key={plan.id}
                className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 text-[#007af7] flex items-center justify-center shrink-0 shadow-2xs select-none">
                    <PostTypeIconDisplay
                      iconName={plan.iconName}
                      fallbackId="other"
                      className="w-4 h-4"
                      emojiClassName="text-base"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {plan.name}
                      </h4>
                      {allowedCats.length > 0 && (
                        <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 truncate max-w-[200px]">
                          {allowedCats.length === categories.length
                            ? 'Todas las categorías'
                            : `${allowedCats.length} categorías vinculadas`}
                        </span>
                      )}
                    </div>
                    {plan.subtitle && (
                      <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                        {plan.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#007af7] hover:bg-blue-50 active:scale-95 transition cursor-pointer"
                    title="Editar tipo de plan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanToDelete(plan)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition cursor-pointer"
                    title="Eliminar tipo de plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal (identical to AdminPostTypesTab) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007af7] flex items-center justify-center text-xl shadow-2xs select-none">
                  <PostTypeIconDisplay
                    iconName={iconName}
                    fallbackId="other"
                    className="w-5 h-5"
                    emojiClassName="text-xl"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {planToEdit ? 'Editar Tipo de Plan' : 'Nuevo Tipo de Plan'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {planToEdit ? 'Actualiza los datos del formato' : 'Configura un nuevo tipo de plan'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Nombre del Tipo de Plan *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cita Romántica / Pareja, Comer algo..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#007af7] font-semibold text-slate-800 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Breve descripción del tipo de plan..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#007af7] text-slate-800 text-sm focus:outline-none resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Representative Icon Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Icono Representativo</label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setIconTab('lucide')}
                      className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                        iconTab === 'lucide'
                          ? 'bg-[#007af7] text-white shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Iconos
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconTab('emoji')}
                      className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                        iconTab === 'emoji'
                          ? 'bg-[#007af7] text-white shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Emojis
                    </button>
                  </div>
                </div>

                {iconTab === 'lucide' ? (
                  <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                    {Object.entries(POST_TYPE_LUCIDE_ICONS).map(([key, IconComp]) => {
                      const isSelected = iconName === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setIconName(key)}
                          className={`p-2 rounded-xl flex items-center justify-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#007af7] text-white shadow-xs scale-105 ring-2 ring-blue-300'
                              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                          }`}
                          title={key}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                    {POST_TYPE_EMOJI_PRESETS.map((em) => {
                      const isSelected = iconName === em;
                      return (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setIconName(em)}
                          className={`h-8 rounded-lg flex items-center justify-center text-base transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-100 ring-2 ring-[#007af7] scale-110 shadow-2xs'
                              : 'hover:bg-slate-200/60'
                          }`}
                        >
                          {em}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Preview Card */}
              <div className="pt-1">
                <label className="block font-bold text-slate-500 text-[11px] mb-1">
                  Vista previa del formato:
                </label>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007af7] flex items-center justify-center text-xl shrink-0">
                    <PostTypeIconDisplay
                      iconName={iconName}
                      fallbackId="other"
                      className="w-5 h-5"
                      emojiClassName="text-xl"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-800 truncate">
                      {name || 'Nombre del Tipo de Plan'}
                    </p>
                    {subtitle && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{subtitle}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#007af7] hover:bg-blue-600 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{planToEdit ? 'Guardar Cambios' : 'Crear Tipo de Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">¿Eliminar este tipo de plan?</h3>
              <p className="text-xs text-slate-500">
                Se eliminará "{planToDelete.name}". Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
