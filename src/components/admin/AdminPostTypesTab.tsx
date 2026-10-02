import React, { useState, useMemo } from 'react';
import { useApp, sortPostTypes } from '../../context/AppContext';
import { PostTypeConfig } from '../../types';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Search,
} from 'lucide-react';
import {
  PostTypeIconDisplay,
  POST_TYPE_LUCIDE_ICONS,
  POST_TYPE_EMOJI_PRESETS,
  isEmoji,
} from '../../utils/postTypeIcons';

const getPostTypeDefaultColor = (id: string) => {
  switch (id) {
    case 'promotion':
      return '#F97316';
    case 'product':
      return '#3B82F6';
    case 'service':
      return '#10B981';
    case 'event':
      return '#8B5CF6';
    case 'other':
    default:
      return '#64748B';
  }
};

export const AdminPostTypesTab: React.FC = () => {
  const { postTypes, addPostType, updatePostType, deletePostType } = useApp();

  const sortedPostTypes = useMemo(() => {
    return sortPostTypes(postTypes);
  }, [postTypes]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<PostTypeConfig | null>(null);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Tag');
  const [iconTab, setIconTab] = useState<'lucide' | 'emoji'>('lucide');
  const [color, setColor] = useState('#F97316');
  const [typeToDelete, setTypeToDelete] = useState<PostTypeConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPostTypes = useMemo(() => {
    if (!searchQuery.trim()) return sortedPostTypes;
    const q = searchQuery.toLowerCase().trim();
    return sortedPostTypes.filter(
      (pt) =>
        pt.label.toLowerCase().includes(q) ||
        (pt.description && pt.description.toLowerCase().includes(q))
    );
  }, [sortedPostTypes, searchQuery]);

  const handleOpenCreate = () => {
    setTypeToEdit(null);
    setLabel('');
    setDescription('');
    setIconName('Tag');
    setIconTab('lucide');
    setColor('#F97316');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pt: PostTypeConfig) => {
    setTypeToEdit(pt);
    setLabel(pt.label);
    setDescription(pt.description || '');
    const currentIcon =
      pt.iconName ||
      (pt.id === 'promotion'
        ? 'Tag'
        : pt.id === 'product'
        ? 'ShoppingBag'
        : pt.id === 'service'
        ? 'Zap'
        : pt.id === 'event'
        ? 'Calendar'
        : 'Sparkles');
    setIconName(currentIcon);
    setIconTab(isEmoji(currentIcon) ? 'emoji' : 'lucide');
    setColor(pt.color || getPostTypeDefaultColor(pt.id));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    if (typeToEdit) {
      updatePostType(typeToEdit.id, {
        label: label.trim(),
        description: description.trim(),
        iconName,
      });
    } else {
      const generatedSlug = label
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

      addPostType({
        label: label.trim(),
        description: description.trim(),
        iconName,
        color: color || '#F97316',
        slug: generatedSlug || `tipo_${Date.now()}`,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!typeToDelete) return;
    if (postTypes.length <= 1) {
      alert('Debe haber al menos un tipo de publicación disponible en el sistema.');
      setTypeToDelete(null);
      return;
    }
    deletePostType(typeToDelete.id);
    setTypeToDelete(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#007af7] shrink-0" />
              <span className="truncate">Tipos de Publicación / Feed</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#007af7] border border-blue-200/60 shrink-0">
                {postTypes.length}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
              Formatos disponibles para ofertas de comercios y filtros activos del feed.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#007af7] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nuevo Tipo</span>
            </button>
          </div>
        </div>

        {/* Search Filter Bar */}
        {postTypes.length > 4 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar entre ${postTypes.length} tipos de publicación...`}
              className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Types List View */}
      {filteredPostTypes.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No se encontraron tipos de publicación que coincidan con "{searchQuery}".
          {searchQuery && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#007af7] font-bold hover:underline cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5 sm:space-y-2">
          {filteredPostTypes.map((pt) => (
            <div
              key={pt.id}
              className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 text-[#007af7] flex items-center justify-center shrink-0 shadow-2xs select-none">
                  <PostTypeIconDisplay
                    iconName={pt.iconName}
                    fallbackId={pt.id}
                    className="w-4 h-4"
                    emojiClassName="text-base"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{pt.label}</h4>
                  {pt.description && (
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">{pt.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(pt)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#007af7] hover:bg-blue-50 active:scale-95 transition cursor-pointer"
                  title="Editar tipo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTypeToDelete(pt)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition cursor-pointer"
                  title="Eliminar tipo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007af7] flex items-center justify-center text-xl shadow-2xs select-none">
                  <PostTypeIconDisplay
                    iconName={iconName}
                    fallbackId={typeToEdit?.id}
                    className="w-5 h-5"
                    emojiClassName="text-xl"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {typeToEdit ? 'Editar Tipo de Publicación' : 'Nuevo Tipo de Publicación'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {typeToEdit ? 'Actualiza los datos del formato' : 'Configura un nuevo formato para el feed'}
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
                <label className="block font-bold text-slate-700">Nombre del Tipo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Menú & Especiales, Evento Deportivo..."
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#007af7] font-semibold text-slate-800 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Breve descripción del tipo de publicación..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                          ? 'bg-[#007af7] text-white shadow-2xs'
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
                          ? 'bg-[#007af7] text-white shadow-2xs'
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
                <label className="block font-bold text-slate-500 text-[11px] mb-1">Vista previa del formato:</label>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007af7] flex items-center justify-center text-xl shrink-0">
                    <PostTypeIconDisplay
                      iconName={iconName}
                      fallbackId={typeToEdit?.id}
                      className="w-5 h-5"
                      emojiClassName="text-xl"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-800 truncate">{label || 'Nombre del Tipo'}</p>
                    {description && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{description}</p>
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
                  <span>{typeToEdit ? 'Guardar Cambios' : 'Crear Tipo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {typeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-base text-slate-900">¿Eliminar tipo de publicación?</h3>
              <p className="text-xs text-slate-500">
                Estás a punto de eliminar <span className="font-bold text-slate-800">"{typeToDelete.label}"</span>. Las publicaciones existentes de este tipo se mantendrán asignadas a un formato general.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTypeToDelete(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
