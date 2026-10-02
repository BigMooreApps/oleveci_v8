import React, { useState, useRef, useEffect } from 'react';
import { Post, PostType, ValiditySchedule } from '../types';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config/brand';
import { INITIAL_SCHEDULE_TABLE } from '../utils/validityHelper';
import {
  X,
  Image as ImageIcon,
  Tag,
  Clock,
  Sparkles,
  AlertCircle,
  Lock,
  Camera,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Upload,
  Eye,
  Loader2,
  Wand2,
  Sliders,
  SlidersHorizontal,
  RotateCcw,
  Ban,
  Move,
  Crosshair,
  Crop,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Store,
  Compass,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { PostDetailModal } from './PostDetailModal';
import { ImageCropModal } from './ImageCropModal';
import { parseVideoUrl } from '../utils/videoHelper';
import { ValidityEngineControl } from './ValidityEngineControl';
import { PostTypeIconDisplay, isEmoji } from '../utils/postTypeIcons';
import { ICON_MAP } from './CategoryChips';
import { generateCommercialAiImage } from '../utils/aiImageGenerator';
import {
  enhanceImageQuality,
  readUploadedImageFile,
  readUploadedMediaFile,
  EnhancementMode,
  ENHANCE_STEPS,
} from '../utils/imageEnhancer';
import {
  PHOTO_FILTERS,
  buildFilterCss,
  ManualAdjustments,
  DEFAULT_MANUAL_ADJUSTMENTS,
} from '../utils/imageFilters';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPost?: Post | null;
  onPostCreated?: (post: Post) => void;
  initialBusinessId?: string;
}

const SUGGESTED_TAGS = [
  'cajicá',
  'oferta',
  'hamburguesas',
  'almuerzo',
  'domicilio',
  'artesanal',
  'combo',
  'hoy',
  'amigos',
  'familia',
  'descuento',
];

// Helper to capitalize the first letter of each word (Title Case)
const capitalizeTitleWords = (str: string): string => {
  return str.replace(/(^|[\s\-_.,;:/()"'¿¡«»]+)(\p{L})/gu, (_, prefix, char) => `${prefix}${char.toUpperCase()}`);
};

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  editingPost,
  onPostCreated,
  initialBusinessId,
}) => {
  const {
    businesses,
    currentBusinessId,
    currentRole,
    categories,
    postTypes,
    planCategories,
    createPost,
    updatePost,
    submitPostCorrection,
    simulatePushNotification,
  } = useApp();

  const [selectedAdminBusinessId, setSelectedAdminBusinessId] = useState<string>(
    editingPost ? editingPost.businessId : initialBusinessId || currentBusinessId || businesses[0]?.id || ''
  );

  useEffect(() => {
    if (editingPost) {
      setSelectedAdminBusinessId(editingPost.businessId);
    } else if (initialBusinessId) {
      setSelectedAdminBusinessId(initialBusinessId);
    } else if (currentBusinessId && currentRole !== 'admin') {
      setSelectedAdminBusinessId(currentBusinessId);
    }
  }, [editingPost, initialBusinessId, currentBusinessId, currentRole]);

  const currentBiz =
    businesses.find(
      (b) => b.id === (editingPost ? editingPost.businessId : (currentRole === 'admin' ? selectedAdminBusinessId : currentBusinessId))
    ) || businesses[0];

  // Post fields state (all editable directly in this view!)
  const [type, setType] = useState<PostType>(
    editingPost ? editingPost.type : 'promotion'
  );

  const activePostTypeConfig = postTypes.find((pt) => pt.id === type) || postTypes[0] || {
    id: 'promotion',
    label: 'Promoción & Oferta',
    description: 'Descuento, 2x1 o precio especial',
    iconName: 'Tag',
    color: '#f97316',
  };
  const [title, setTitle] = useState(editingPost ? capitalizeTitleWords(editingPost.title) : '');
  const [description, setDescription] = useState(editingPost ? editingPost.description : '');
  const [correctionNote, setCorrectionNote] = useState(editingPost?.correctionNote || '');
  const [imageUrl, setImageUrl] = useState(
    editingPost ? editingPost.imageUrl : currentBiz?.banner || ''
  );
  const [videoUrl, setVideoUrl] = useState<string>(editingPost?.videoUrl || '');
  const [mediaType, setMediaType] = useState<'image' | 'video'>(editingPost?.videoUrl ? 'video' : 'image');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 380, height: 238 });

  useEffect(() => {
    if (!imageContainerRef.current) return;
    const updateDims = () => {
      if (imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect();
        if (rect.height > 50) {
          setContainerDimensions({ width: rect.width, height: rect.height });
        }
      }
    };
    updateDims();
    const observer = new ResizeObserver(updateDims);
    observer.observe(imageContainerRef.current);
    return () => observer.disconnect();
  }, []);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(
    editingPost ? editingPost.imageUrl : currentBiz?.banner || null
  );
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancingStep, setEnhancingStep] = useState('');
  const [enhancementMode, setEnhancementMode] = useState<EnhancementMode>('sharpness');
  const [activeToolbarTool, setActiveToolbarTool] = useState<'resize' | 'enhance' | 'createAi' | 'filters' | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string>(
    editingPost?.imageFilter && editingPost.imageFilter !== 'none' ? 'custom' : 'none'
  );
  const [filterIntensity, setFilterIntensity] = useState<number>(100);
  const [filterAdjustments, setFilterAdjustments] = useState<ManualAdjustments>(DEFAULT_MANUAL_ADJUSTMENTS);
  const [imageFilterCss, setImageFilterCss] = useState<string>(
    editingPost?.imageFilter || 'none'
  );
  const [showAdvancedAdjustments, setShowAdvancedAdjustments] = useState<boolean>(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [resizeScale, setResizeScale] = useState<number>(editingPost?.imageScale || 1);
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>(editingPost?.imageFit || 'cover');
  const [aiCreatePrompt, setAiCreatePrompt] = useState<string>('');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState<boolean>(false);
  const [aiVariationIndex, setAiVariationIndex] = useState<number>(0);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<string>('');
  const [aiGeneratedCategory, setAiGeneratedCategory] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [showVideoUrlModal, setShowVideoUrlModal] = useState<boolean>(false);
  const [showThumbnailModal, setShowThumbnailModal] = useState<boolean>(false);
  const [videoUrlInputText, setVideoUrlInputText] = useState<string>('');
  const [videoPreviewMode, setVideoPreviewMode] = useState<'thumbnail' | 'player'>('thumbnail');

  // Custom modern dropdowns state & refs
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [isPlanCategoryDropdownOpen, setIsPlanCategoryDropdownOpen] = useState(false);
  const [planCategorySearchQuery, setPlanCategorySearchQuery] = useState('');
  const planCategoryDropdownRef = useRef<HTMLDivElement>(null);

  // Submodule accordion state for "Configuración adicional" (starts reduced/collapsed by default)
  const [isConfigAdicionalOpen, setIsConfigAdicionalOpen] = useState<boolean>(false);

  // Close custom dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (planCategoryDropdownRef.current && !planCategoryDropdownRef.current.contains(e.target as Node)) {
        setIsPlanCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Image re-framing & repositioning state (mouse drag & mobile touch)
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>(
    editingPost?.imagePosition || { x: 50, y: 50 }
  );
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [autoAdjustToast, setAutoAdjustToast] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    containerWidth: number;
    containerHeight: number;
  } | null>(null);

  // High-performance miniature thumbnail cache for filter presets
  // Generating a small 96px thumbnail prevents rendering 11 multi-megabyte images in DOM simultaneously, eliminating browser freezes
  const [filterThumbnailUrl, setFilterThumbnailUrl] = useState<string | null>(null);
  const filterCarouselRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafFilterRef = useRef<number | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setFilterThumbnailUrl(null);
      return;
    }

    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      if (isCancelled) return;
      try {
        const canvas = document.createElement('canvas');
        const maxThumb = 96;
        let w = img.naturalWidth || 96;
        let h = img.naturalHeight || 96;
        if (w > h) {
          h = Math.max(1, Math.round((h * maxThumb) / w));
          w = maxThumb;
        } else {
          w = Math.max(1, Math.round((w * maxThumb) / h));
          h = maxThumb;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const thumb = canvas.toDataURL('image/jpeg', 0.75);
          if (!isCancelled) {
            setFilterThumbnailUrl(thumb);
          }
        }
      } catch {
        if (!isCancelled) setFilterThumbnailUrl(imageUrl);
      }
    };

    img.onerror = () => {
      if (!isCancelled) setFilterThumbnailUrl(imageUrl);
    };

    img.src = imageUrl;

    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);

  const showFilterToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setAutoAdjustToast(message);
    toastTimeoutRef.current = setTimeout(() => {
      setAutoAdjustToast(null);
      toastTimeoutRef.current = null;
    }, 1800);
  };

  const scrollFilterCarousel = (direction: 'left' | 'right') => {
    if (filterCarouselRef.current) {
      const offset = direction === 'left' ? -160 : 160;
      filterCarouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const [promotionalPrice, setPromotionalPrice] = useState<string>(
    editingPost?.promotionalPrice ? String(editingPost.promotionalPrice) : ''
  );
  const [originalPrice, setOriginalPrice] = useState<string>(
    editingPost?.originalPrice ? String(editingPost.originalPrice) : ''
  );
  const [categoryId, setCategoryId] = useState<string>(
    editingPost ? editingPost.categoryId : currentBiz?.categoryId || categories[0]?.id || ''
  );
  const [planCategoryId, setPlanCategoryId] = useState<string>(
    editingPost?.planCategoryId || ''
  );
  const [validitySchedule, setValiditySchedule] = useState<ValiditySchedule>(
    editingPost?.validitySchedule || {
      mode: 'table',
      scheduleTable: INITIAL_SCHEDULE_TABLE,
    }
  );
  const [customExpiryLabel, setCustomExpiryLabel] = useState<string>(
    editingPost?.expiryLabel || '¡Hoy hasta las 10:00 PM!'
  );
  const [computedExpiresAt, setComputedExpiresAt] = useState<string | undefined>(
    editingPost?.expiresAt
  );

  const handleValidityChange = (
    schedule: ValiditySchedule,
    expiryLabel: string,
    expiresAt?: string
  ) => {
    setValiditySchedule(schedule);
    setCustomExpiryLabel(expiryLabel);
    setComputedExpiresAt(expiresAt);
  };

  // Tags chip state: only preconfigured tags for this post, or empty if none
  const [tagChips, setTagChips] = useState<string[]>(
    editingPost && editingPost.tags && Array.isArray(editingPost.tags)
      ? editingPost.tags
      : []
  );
  const [tagInputValue, setTagInputValue] = useState('');

  // Keep modal fields cleanly synchronized whenever editingPost or isOpen changes
  const lastLoadedPostIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      lastLoadedPostIdRef.current = undefined;
      return;
    }
    const currentId = editingPost ? editingPost.id : '__new__';
    if (lastLoadedPostIdRef.current !== currentId) {
      lastLoadedPostIdRef.current = currentId;
      if (editingPost) {
        setType(editingPost.type);
        setTitle(capitalizeTitleWords(editingPost.title));
        setDescription(editingPost.description);
        setImageUrl(editingPost.imageUrl);
        setVideoUrl(editingPost.videoUrl || '');
        setMediaType(editingPost.videoUrl ? 'video' : 'image');
        setIsVideoPlaying(true);
        setIsVideoMuted(true);
        setOriginalImageUrl(editingPost.imageUrl);
        setImagePosition(editingPost.imagePosition || { x: 50, y: 50 });
        setResizeScale(editingPost.imageScale || 1);
        setImageFit(editingPost.imageFit || 'cover');
        setImageFilterCss(editingPost.imageFilter || 'none');
        setActiveFilterId(editingPost.imageFilter && editingPost.imageFilter !== 'none' ? 'custom' : 'none');
        setPromotionalPrice(editingPost.promotionalPrice ? String(editingPost.promotionalPrice) : '');
        setOriginalPrice(editingPost.originalPrice ? String(editingPost.originalPrice) : '');
        setCategoryId(editingPost.categoryId);
        setPlanCategoryId(editingPost.planCategoryId || '');
        setValiditySchedule(editingPost.validitySchedule || { mode: 'table', scheduleTable: INITIAL_SCHEDULE_TABLE });
        setCustomExpiryLabel(editingPost.expiryLabel || '¡Hoy hasta las 10:00 PM!');
        setComputedExpiresAt(editingPost.expiresAt);
        setTagChips(editingPost.tags && Array.isArray(editingPost.tags) ? [...editingPost.tags] : []);
        setTagInputValue('');
      } else {
        setType('promotion');
        setTitle('');
        setDescription('');
        setImageUrl(currentBiz?.banner || '');
        setVideoUrl('');
        setMediaType('image');
        setIsVideoPlaying(true);
        setIsVideoMuted(true);
        setOriginalImageUrl(currentBiz?.banner || null);
        setImagePosition({ x: 50, y: 50 });
        setResizeScale(1);
        setImageFit('cover');
        setImageFilterCss('none');
        setActiveFilterId('none');
        setPromotionalPrice('');
        setOriginalPrice('');
        setCategoryId(currentBiz?.categoryId || categories[0]?.id || '');
        setPlanCategoryId('');
        setValiditySchedule({ mode: 'table', scheduleTable: INITIAL_SCHEDULE_TABLE });
        setCustomExpiryLabel('¡Hoy hasta las 10:00 PM!');
        setComputedExpiresAt(undefined);
        setTagChips([]);
        setTagInputValue('');
      }
    }
  }, [isOpen, editingPost, currentBiz, categories]);

  if (!isOpen) return null;

  // Calculate discount percent dynamically
  const promoNum = promotionalPrice ? Number(promotionalPrice) : undefined;
  const origNum = originalPrice ? Number(originalPrice) : undefined;
  const discountPercent =
    origNum && promoNum && origNum > promoNum
      ? Math.round(((origNum - promoNum) / origNum) * 100)
      : null;

  // Compute expiry timestamp and effective label
  const computeExpiry = () => {
    return {
      expiresAt: computedExpiresAt,
      label: customExpiryLabel,
      schedule: validitySchedule,
    };
  };

  // Add tag cleanly without leading '#'
  const handleAddTag = (tagToAdd: string) => {
    const parts = tagToAdd
      .split(/[\s,]+/)
      .map((t) => t.trim().toLowerCase().replace(/^#+/, ''))
      .filter(Boolean);
    if (parts.length === 0) return;
    setTagChips((prev) => {
      const next = [...prev];
      for (const part of parts) {
        if (!next.includes(part)) {
          next.push(part);
        }
      }
      return next;
    });
    setTagInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagChips(tagChips.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInputValue);
    }
  };

  // Process selected media file (image or video) with validation and thumbnail extraction
  const processMediaFile = async (file: File) => {
    setErrorMsg(null);
    const { dataUrl, mediaType: detectedType, thumbnailUrl, error } = await readUploadedMediaFile(file);
    if (error) {
      setErrorMsg(error);
      return;
    }

    if (detectedType === 'video') {
      setMediaType('video');
      setVideoUrl(dataUrl);
      setIsVideoPlaying(true);
      setIsVideoMuted(true);
      if (thumbnailUrl) {
        setImageUrl(thumbnailUrl);
        setOriginalImageUrl(thumbnailUrl);
      } else {
        setImageUrl(dataUrl);
      }
      setIsEnhanced(false);
      setImageFilterCss('none');
      setActiveFilterId('none');
      setFilterIntensity(100);
      setFilterAdjustments(DEFAULT_MANUAL_ADJUSTMENTS);
      setAutoAdjustToast('¡Video cargado con éxito!');
      setTimeout(() => setAutoAdjustToast(null), 2500);
    } else {
      setMediaType('image');
      setVideoUrl('');
      setImageUrl(dataUrl);
      setOriginalImageUrl(dataUrl);
      setIsEnhanced(false);
      setImageFilterCss('none');
      setActiveFilterId('none');
      setFilterIntensity(100);
      setFilterAdjustments(DEFAULT_MANUAL_ADJUSTMENTS);

      // Automatically inspect image aspect ratio and optimize framing
      const img = new Image();
      img.onload = () => {
        if (img.naturalHeight > img.naturalWidth * 1.05) {
          setImagePosition({ x: 50, y: 18 });
        } else {
          setImagePosition({ x: 50, y: 50 });
        }
      };
      img.src = dataUrl;
      setAutoAdjustToast('¡Foto cargada con éxito!');
      setTimeout(() => setAutoAdjustToast(null), 2000);
    }
  };

  // Optimized filter manipulation handlers
  const handleSelectFilterPreset = (presetId: string) => {
    setActiveFilterId(presetId);
    const newCss = buildFilterCss(presetId, filterIntensity, filterAdjustments);
    setImageFilterCss(newCss);
    const preset = PHOTO_FILTERS.find((f) => f.id === presetId);
    if (preset && preset.id !== 'none') {
      showFilterToast(`Filtro "${preset.name}" aplicado`);
    } else if (presetId === 'none') {
      showFilterToast('Filtro desactivado (Original)');
    }
  };

  const handleIntensityChange = (newIntensity: number) => {
    setFilterIntensity(newIntensity);
    if (rafFilterRef.current) cancelAnimationFrame(rafFilterRef.current);
    rafFilterRef.current = requestAnimationFrame(() => {
      const newCss = buildFilterCss(activeFilterId, newIntensity, filterAdjustments);
      setImageFilterCss(newCss);
    });
  };

  const handleAdjustmentChange = (key: keyof ManualAdjustments, value: number) => {
    const updated = { ...filterAdjustments, [key]: value };
    setFilterAdjustments(updated);
    if (rafFilterRef.current) cancelAnimationFrame(rafFilterRef.current);
    rafFilterRef.current = requestAnimationFrame(() => {
      const newCss = buildFilterCss(activeFilterId, filterIntensity, updated);
      setImageFilterCss(newCss);
    });
  };

  const handleResetFilters = () => {
    if (rafFilterRef.current) cancelAnimationFrame(rafFilterRef.current);
    setActiveFilterId('none');
    setFilterIntensity(100);
    setFilterAdjustments(DEFAULT_MANUAL_ADJUSTMENTS);
    setImageFilterCss('none');
    showFilterToast('Filtros restablecidos');
  };

  // Pointer drag & touch re-framing handlers (supports desktop mouse and mobile finger touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageUrl) return;
    if ((e.target as HTMLElement).closest('button')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: imagePosition.x,
      initialY: imagePosition.y,
      containerWidth: rect.width,
      containerHeight: rect.height,
    };
    setIsDraggingImage(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingImage || !dragStartRef.current) return;

    const { startX, startY, initialX, initialY, containerWidth, containerHeight } = dragStartRef.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Direct manipulation panning: dragging in a direction moves the image in that exact direction
    const percentDeltaX = (deltaX / Math.max(containerWidth, 1)) * 100;
    const percentDeltaY = (deltaY / Math.max(containerHeight, 1)) * 100;

    const nextX = Math.round(Math.max(0, Math.min(100, initialX + percentDeltaX)));
    const nextY = Math.round(Math.max(0, Math.min(100, initialY + percentDeltaY)));

    setImagePosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingImage) {
      setIsDraggingImage(false);
      dragStartRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Smart Auto-Adjust Framing function: adjusts image size to fit the space
  const handleAutoAdjustFraming = async () => {
    if (!imageUrl) return;
    try {
      if (imageFit === 'cover') {
        setImageFit('contain');
        setResizeScale(1);
        setImagePosition({ x: 50, y: 50 });
        setAutoAdjustToast('¡Imagen ajustada al espacio (ver completa sin cortes)!');
      } else {
        setImageFit('cover');
        setResizeScale(1);
        setImagePosition({ x: 50, y: 50 });
        setAutoAdjustToast('¡Imagen expandida para llenar todo el espacio!');
      }
      setTimeout(() => setAutoAdjustToast(null), 2400);
    } catch {
      setImageFit('contain');
      setResizeScale(1);
      setImagePosition({ x: 50, y: 50 });
      setAutoAdjustToast('¡Imagen ajustada al espacio!');
      setTimeout(() => setAutoAdjustToast(null), 2400);
    }
  };

  // Handle local media (image or video) file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processMediaFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  // Handle video thumbnail / poster image file upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Por favor selecciona un archivo de imagen válido para la miniatura (JPG, PNG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setOriginalImageUrl(result);
        setVideoPreviewMode('thumbnail');
        setShowThumbnailModal(false);
        setAutoAdjustToast('¡Miniatura de portada actualizada con éxito!');
        setTimeout(() => setAutoAdjustToast(null), 2500);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSaveVideoUrl = () => {
    const trimmed = videoUrlInputText.trim();
    if (!trimmed) {
      setErrorMsg('Por favor ingresa una URL de video válida (ej: TikTok, YouTube, Vimeo o MP4).');
      return;
    }
    const parsed = parseVideoUrl(trimmed);
    setVideoUrl(trimmed);
    setMediaType('video');
    setIsVideoPlaying(true);
    setIsVideoMuted(false);
    setVideoPreviewMode('thumbnail');
    if (!imageUrl && parsed.defaultThumbnail) {
      setImageUrl(parsed.defaultThumbnail);
      setOriginalImageUrl(parsed.defaultThumbnail);
    }
    setShowVideoUrlModal(false);
    setAutoAdjustToast(`¡Video (${parsed.platformName}) cargado correctamente!`);
    setTimeout(() => setAutoAdjustToast(null), 2500);
  };

  const handleRemoveCustomThumbnail = () => {
    setImageUrl('');
    setOriginalImageUrl(null);
    setShowThumbnailModal(false);
    setAutoAdjustToast('Miniatura personalizada quitada');
    setTimeout(() => setAutoAdjustToast(null), 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processMediaFile(file);
    }
  };

  // Enhance image quality with AI (Super-Resolution, unsharp masking, contrast, vibrant colors)
  const handleEnhanceWithAi = async () => {
    if (!imageUrl) {
      setErrorMsg('Primero debes subir una imagen para poder mejorarla con IA.');
      return;
    }
    setErrorMsg(null);
    setIsEnhancing(true);

    if (!originalImageUrl) {
      setOriginalImageUrl(imageUrl);
    }

    try {
      for (const step of ENHANCE_STEPS) {
        setEnhancingStep(step.label);
        await new Promise((r) => setTimeout(r, step.durationMs));
      }
      const enhanced = await enhanceImageQuality(imageUrl, enhancementMode);
      setImageUrl(enhanced);
      setIsEnhanced(true);
    } catch {
      setErrorMsg('No se pudo procesar la mejora automática de la imagen.');
    } finally {
      setIsEnhancing(false);
      setEnhancingStep('');
    }
  };

  const handleRevertToOriginal = () => {
    if (originalImageUrl) {
      setImageUrl(originalImageUrl);
      setIsEnhanced(false);
    }
  };

  // 4. Crop Callback
  const handleApplyCrop = (croppedDataUrl: string) => {
    setImageUrl(croppedDataUrl);
    setOriginalImageUrl(croppedDataUrl);
    setImagePosition({ x: 50, y: 50 });
    setResizeScale(1);
    setAutoAdjustToast('¡Recorte aplicado!');
    setTimeout(() => setAutoAdjustToast(null), 2500);
  };

  // 6. Generate Image with AI from user prompt
  const handleGenerateAiImage = async (isRegeneration = false) => {
    const prompt = aiCreatePrompt.trim();
    if (!prompt) {
      setErrorMsg('Por favor escribe brevemente qué imagen deseas que la IA cree.');
      return;
    }
    setErrorMsg(null);
    setIsGeneratingAiImage(true);

    const isSamePrompt = lastGeneratedPrompt.trim().toLowerCase() === prompt.toLowerCase();
    const nextIndex = isRegeneration || isSamePrompt ? aiVariationIndex + 1 : 0;

    try {
      const result = await generateCommercialAiImage(prompt, {
        variationIndex: nextIndex,
        isBanner: true,
      });

      setAiVariationIndex(nextIndex);
      setLastGeneratedPrompt(prompt);
      setAiGeneratedCategory(result.categoryLabel);
      setImageUrl(result.url);
      setOriginalImageUrl(result.url);
      setImagePosition({ x: 50, y: 50 });
      setIsEnhanced(false);
      setImageFilterCss('none');
      setActiveFilterId('none');
      setFilterIntensity(100);
      setFilterAdjustments(DEFAULT_MANUAL_ADJUSTMENTS);
      setResizeScale(1);
      setImageFit('cover');
      setAutoAdjustToast(`¡Versión ${result.variationNumber} de ${result.totalVariations} lista!`);
      setTimeout(() => setAutoAdjustToast(null), 2500);
    } catch {
      setErrorMsg('Ocurrió un inconveniente al generar la imagen con IA.');
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  // 7. Delete Photo / Video Handler (confirmed)
  const handleConfirmDeletePhoto = () => {
    setImageUrl('');
    setVideoUrl('');
    setMediaType('image');
    setOriginalImageUrl(null);
    setIsEnhanced(false);
    setImageFilterCss('none');
    setActiveFilterId('none');
    setFilterIntensity(100);
    setFilterAdjustments(DEFAULT_MANUAL_ADJUSTMENTS);
    setActiveToolbarTool(null);
    setShowDeleteConfirm(false);
    setImagePosition({ x: 50, y: 50 });
    setResizeScale(1);
    setImageFit('cover');
    setAutoAdjustToast('Elemento multimedia eliminado');
    setTimeout(() => setAutoAdjustToast(null), 2500);
  };

  // Submit handler
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Por favor escribe un título para la publicación.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Por favor incluye una breve descripción de tu publicación.');
      return;
    }
    if (!imageUrl.trim() && !videoUrl.trim()) {
      setErrorMsg('Por favor asigna una imagen o video a la publicación.');
      return;
    }
    if (!categoryId) {
      setIsConfigAdicionalOpen(true);
      setErrorMsg('Por favor selecciona la categoría en explorar para la publicación (Campo obligatorio).');
      return;
    }
    if (!planCategoryId) {
      setIsConfigAdicionalOpen(true);
      setErrorMsg('Por favor selecciona el tipo de plan para la publicación (Campo obligatorio).');
      return;
    }

    const selectedPlanCategoryObj = planCategories.find((p) => p.id === planCategoryId);
    const planCategoryName = selectedPlanCategoryObj ? selectedPlanCategoryObj.name : undefined;

    const { expiresAt, label, schedule } = computeExpiry();
    const cleanTags = tagChips.map((t) => t.trim().toLowerCase().replace(/^#+/, '')).filter(Boolean);

    if (editingPost) {
      if (editingPost.status === 'pending_review' || editingPost.reviewStatus === 'pending') {
        setErrorMsg('Esta publicación ya tiene una corrección en revisión enviada al administrador. Solo se permite una corrección por publicación y no se pueden realizar cambios hasta su evaluación.');
        return;
      }

      const wasSuspended = Boolean(
        editingPost.suspended ||
        editingPost.status === 'suspended'
      );

      const postPayload: Partial<Post> = {
        type,
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || videoUrl.trim(),
        videoUrl: videoUrl ? videoUrl.trim() : undefined,
        mediaType: videoUrl ? 'video' : 'image',
        imagePosition,
        imageScale: resizeScale,
        imageFit,
        imageFilter: imageFilterCss !== 'none' ? imageFilterCss : undefined,
        promotionalPrice: promoNum,
        originalPrice: origNum,
        categoryId,
        planCategoryId,
        planCategoryName,
        expiresAt,
        expiryLabel: label,
        validitySchedule: schedule,
        tags: cleanTags,
      };

      if (wasSuspended) {
        submitPostCorrection(editingPost.id, postPayload, correctionNote);

        const updatedPost: Post = {
          ...editingPost,
          ...postPayload,
          status: 'pending_review',
          suspended: false,
          reviewStatus: 'pending',
          reviewRequestedAt: new Date().toISOString(),
          correctionNote: correctionNote.trim() || undefined,
        };

        if (onPostCreated) {
          onPostCreated(updatedPost);
        }
      } else {
        updatePost(editingPost.id, postPayload);

        const updatedPost: Post = {
          ...editingPost,
          ...postPayload,
        };

        if (onPostCreated) {
          onPostCreated(updatedPost);
        }
      }

      onClose();
    } else {
      const res = createPost({
        businessId: currentBiz.id,
        businessName: currentBiz.name,
        businessLogo: currentBiz.logo,
        businessCity: currentBiz.city,
        businessSector: currentBiz.sector,
        businessWhatsapp: currentBiz.whatsapp,
        businessPhone: currentBiz.phone,
        businessAddress: currentBiz.address,
        coordinates: currentBiz.coordinates,
        type,
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || videoUrl.trim(),
        videoUrl: videoUrl ? videoUrl.trim() : undefined,
        mediaType: videoUrl ? 'video' : 'image',
        imagePosition,
        imageScale: resizeScale,
        imageFit,
        imageFilter: imageFilterCss !== 'none' ? imageFilterCss : undefined,
        promotionalPrice: promoNum,
        originalPrice: origNum,
        startsAt: new Date().toISOString(),
        expiresAt,
        expiryLabel: label,
        validitySchedule: schedule,
        categoryId,
        planCategoryId,
        planCategoryName,
        featured: false,
        tags: cleanTags,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'No se pudo publicar.');
        return;
      }

      if (res.post && onPostCreated) {
        onPostCreated(res.post);
      }

      onClose();
    }
  };

  const currentBusinessLogo = currentBiz.logo;

  const getPreviewPost = (): Post => {
    const { expiresAt, label, schedule } = computeExpiry();
    const cleanTags = tagChips.map((t) => t.trim().toLowerCase().replace(/^#+/, '')).filter(Boolean);
    return {
      id: editingPost?.id || 'temp_preview_post',
      businessId: currentBiz.id,
      businessName: currentBiz.name,
      businessLogo: currentBiz.logo,
      businessCity: currentBiz.city,
      businessSector: currentBiz.sector,
      businessWhatsapp: currentBiz.whatsapp,
      businessPhone: currentBiz.phone,
      businessAddress: currentBiz.address,
      coordinates: currentBiz.coordinates,
      type,
      title: title.trim() || 'Título de la publicación',
      description: description.trim() || 'Descripción detallada de la publicación...',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      videoUrl: videoUrl ? videoUrl.trim() : undefined,
      mediaType: videoUrl ? 'video' : 'image',
      imagePosition,
      imageScale: resizeScale,
      imageFilter: imageFilterCss !== 'none' ? imageFilterCss : undefined,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      promotionalPrice: promotionalPrice ? Number(promotionalPrice) : undefined,
      startsAt: new Date().toISOString(),
      expiresAt,
      expiryLabel: label?.trim() || undefined,
      validitySchedule: schedule,
      categoryId,
      featured: false,
      tags: cleanTags,
      createdAt: editingPost?.createdAt || new Date().toISOString(),
      metrics: editingPost?.metrics || {
        views: 0,
        whatsappClicks: 0,
        mapsClicks: 0,
        calls: 0,
        shares: 0,
      },
    };
  };

  return (
    <div
      id="create-post-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl rounded-t-[28px] sm:rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden max-h-[96vh] sm:max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              {editingPost ? 'Editar Publicación' : 'Crear Publicación'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Editor Body */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-4 sm:space-y-5 bg-slate-100/60">
          {editingPost && (editingPost.status === 'pending_review' || editingPost.reviewStatus === 'pending') && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs flex flex-col gap-2 shadow-xs animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-950 text-xs">
                    Publicación en cola de revisión del administrador
                  </p>
                  <p className="text-amber-900 mt-0.5">
                    Ya has enviado una corrección para esta publicación. Para garantizar un proceso ordenado de moderación, solo se puede enviar <strong>una corrección por publicación</strong> y no se admiten modificaciones adicionales hasta recibir la decisión del administrador.
                  </p>
                  {editingPost.correctionNote && (
                    <div className="mt-2 p-2 rounded-xl bg-white border border-amber-200 text-[11px] text-amber-900">
                      <strong>Tu aclaración enviada:</strong> "{editingPost.correctionNote}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {editingPost && (editingPost.status === 'suspended' || Boolean(editingPost.suspended)) && editingPost.status !== 'pending_review' && editingPost.reviewStatus !== 'pending' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs flex flex-col gap-2.5 shadow-xs animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-950 text-xs">
                    Corrigiendo publicación suspendida por políticas
                  </p>
                  <p className="text-amber-900 mt-0.5">
                    <strong>Motivo de moderación:</strong> "{editingPost.suspensionReason || 'No cumple con las normas de publicación de la plataforma.'}"
                  </p>
                  <p className="text-amber-800 font-medium mt-1">
                    Corrige los datos señalados (texto, foto, precio o términos). <strong>Al enviar, la solicitud llegará al administrador para su revisión y aprobación</strong> antes de quedar activa en el feed. Solo se puede enviar una corrección por publicación.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200">
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  Nota o aclaración para el administrador (opcional):
                </label>
                <input
                  type="text"
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  placeholder="Ej: He actualizado la foto sin marcas de agua y verificado el precio..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-slate-800 focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Selector de Comercio para Administrador */}
          {currentRole === 'admin' && !editingPost && (
            <div className="max-w-[420px] mx-auto w-full p-3 bg-blue-50/90 border border-blue-200 rounded-2xl flex flex-col gap-1.5 shadow-2xs">
              <label htmlFor="select-admin-post-business" className="text-xs font-extrabold text-[#041f5e] flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#007af7]" />
                <span>Publicar a nombre del comercio:</span>
              </label>
              <select
                id="select-admin-post-business"
                value={selectedAdminBusinessId}
                onChange={(e) => {
                  const newBizId = e.target.value;
                  setSelectedAdminBusinessId(newBizId);
                  const b = businesses.find((biz) => biz.id === newBizId);
                  if (b) {
                    setCategoryId(b.categoryId || categories[0]?.id || '');
                    if (!imageUrl || imageUrl === currentBiz?.banner) {
                      setImageUrl(b.banner || '');
                      setOriginalImageUrl(b.banner || null);
                    }
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city} - {b.sector})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ======================================================== */}
          {/* THE EXPLORAR CARD (INTERACTIVE WYSIWYG EDITOR)            */}
          {/* ======================================================== */}
          <div className="flex justify-center">
            <div
              className="w-full max-w-[420px] bg-white rounded-[28px] sm:rounded-[32px] px-3.5 sm:px-4 pb-4 pt-2.5 shadow-lg border border-slate-200 flex flex-col relative overflow-hidden transition"
            >
              {/* 1. Header: Merchant Logo, Name, Location Pin & Lock Indicator (NON-MODIFIABLE) */}
              <header className="flex items-center justify-between mb-1 relative z-20 pt-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Circular Avatar of Business */}
                  <div className="relative rounded-full bg-[#081B38] p-[2.5px] shadow-md shrink-0 flex items-center justify-center ring-4 ring-white z-30 w-12 h-12 sm:w-14 sm:h-14">
                    {currentBusinessLogo ? (
                      <img
                        src={currentBusinessLogo}
                        alt={currentBiz.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-xs uppercase">
                        {currentBiz.name.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Business Name & Sector (Fixed) */}
                  <div className="flex flex-col min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-[#0A1D3C] text-sm sm:text-base leading-tight truncate">
                        {currentBiz.name}
                      </h3>
                      <span
                        className="text-[10px] text-slate-400 flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded-md"
                        title="Datos de tu perfil de negocio vinculados automáticamente"
                      >
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    </div>

                    <div className="flex items-center text-xs font-semibold text-slate-500 mt-0.5 gap-1">
                      <svg
                        className="w-3.5 h-3.5 text-[#0A62F4] shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          clipRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          fillRule="evenodd"
                        />
                      </svg>
                      <span className="truncate">
                        {currentBiz.sector || 'Centro'} · 0.1 km
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative Bookmark */}
                <div className="text-blue-600 p-1.5 rounded-full shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
              </header>

              {/* Hidden file input supporting image and video files */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg,video/mp4,video/webm,video/quicktime,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Hidden file input specifically for video thumbnail / poster image */}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleThumbnailUpload}
                className="hidden"
              />

              {/* 2. Media Container with interactive image/video picker and badges (exact 16:10 aspect ratio matching preview & final post) */}
              {!imageUrl && !videoUrl ? (
                isGeneratingAiImage ? (
                  <div className="w-full aspect-16/10 rounded-2xl flex flex-col items-center justify-center p-5 bg-purple-950/90 text-white text-center mb-2.5 animate-in fade-in shadow-inner">
                    <Loader2 className="w-9 h-9 animate-spin text-purple-400 mb-2" />
                    <span className="text-sm font-extrabold text-white">
                      Creando imagen con Inteligencia Artificial...
                    </span>
                    <span className="text-xs text-purple-200 mt-1 max-w-xs truncate">
                      "{aiCreatePrompt || 'Generando...'}"
                    </span>
                  </div>
                ) : (
                  <div
                    id="dropzone-upload-post-image"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full aspect-16/10 rounded-2xl flex flex-col items-center justify-center p-5 cursor-pointer border-2 border-dashed transition text-center mb-2.5 ${
                      isDragging
                        ? 'border-[#007af7] bg-blue-100/70 scale-[0.99]'
                        : 'border-blue-300 hover:border-[#007af7] bg-blue-50/50 hover:bg-blue-50/80'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#007af7] to-sky-400 text-white flex items-center justify-center shadow-md mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Haz clic o arrastra una imagen o video desde tu dispositivo (JPG, PNG, WEBP, MP4, WEBM · máx. 50 MB)
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#007af7] border border-blue-200 text-xs font-extrabold shadow-2xs hover:bg-blue-50 transition">
                        <Camera className="w-3.5 h-3.5" />
                        <Video className="w-3.5 h-3.5 text-sky-500" />
                        <span>Seleccionar archivo</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoUrlInputText(videoUrl || '');
                          setShowVideoUrlModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-300 text-xs font-bold shadow-2xs hover:bg-sky-100 transition active:scale-95 cursor-pointer"
                        title="Ingresar enlace o URL directa de video"
                      >
                        <Link2 className="w-3.5 h-3.5 text-sky-600" />
                        <span>Pegar URL de video</span>
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div
                    ref={imageContainerRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`relative w-full aspect-16/10 rounded-2xl overflow-hidden shadow-inner bg-slate-900 mb-2.5 select-none group touch-none transition-shadow ${
                      isDraggingImage ? 'cursor-grabbing ring-2 ring-[#007af7]' : 'cursor-grab hover:ring-1 hover:ring-blue-300'
                    }`}
                    style={{ aspectRatio: '16 / 10' }}
                    title="Haz clic o toca para reencuadrar arrastrándola"
                  >
                  {videoUrl ? (
                    videoPreviewMode === 'thumbnail' && imageUrl ? (
                      <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
                        {/* Ambient backdrop when contain or scaled down */}
                        {(imageFit === 'contain' || resizeScale < 1) && imageUrl && (
                          <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
                            <img
                              src={imageUrl}
                              alt=""
                              className="w-full h-full object-cover blur-2xl scale-120 opacity-40"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40" />
                          </div>
                        )}
                        <img
                          src={imageUrl}
                          alt="Miniatura de portada"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                          className={`w-full h-full select-none relative z-10 transition-transform ${
                            imageFit === 'contain' ? 'object-contain' : 'object-cover'
                          }`}
                          style={{
                            objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                            transform: resizeScale !== 1 ? `scale(${resizeScale})` : undefined,
                            filter: imageFilterCss !== 'none' ? imageFilterCss : undefined,
                          }}
                        />

                        {/* Center Play Button Overlay */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoPreviewMode('player');
                          }}
                          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/35 hover:bg-black/25 transition cursor-pointer group"
                        >
                          <div className="w-14 h-14 rounded-full bg-[#007af7] hover:bg-blue-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-all">
                            <Play className="w-6 h-6 fill-white ml-0.5" />
                          </div>
                          <span className="mt-2.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold shadow-md border border-white/20">
                            Probar reproducción
                          </span>
                        </div>

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600/95 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1 shadow-md border border-white/20">
                            <ImageIcon className="w-3 h-3" />
                            <span>Miniatura activa</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setVideoPreviewMode('player');
                            }}
                            className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/85 text-sky-300 text-[10px] font-bold backdrop-blur-md border border-white/20 transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Probar video</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                        {parseVideoUrl(videoUrl).isIframe ? (
                          (() => {
                            const parsed = parseVideoUrl(videoUrl);
                            const isTikTok = parsed.platform === 'tiktok';
                            const isInstagram = parsed.platform === 'instagram';
                            const isShorts = parsed.platform === 'youtube' && parsed.isVertical;
                            const isFacebookReel = parsed.platform === 'facebook' && parsed.isVertical;
                            const isVerticalEmbed = isTikTok || isInstagram || isShorts || isFacebookReel;

                            const nativeW = isTikTok ? 325 : isInstagram ? 328 : isShorts ? 315 : 320;
                            const nativeH = isTikTok ? 575 : isInstagram ? 520 : isShorts ? 560 : 540;

                            const fitScale = containerDimensions.height / nativeH;
                            const coverScale = containerDimensions.width / nativeW;
                            const baseScale = imageFit === 'cover' ? coverScale : fitScale;
                            const finalScale = baseScale * resizeScale;

                            return isVerticalEmbed ? (
                              <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
                                {/* Ambient backdrop so sides are seamless */}
                                {imageUrl && (
                                  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
                                    <img
                                      src={imageUrl}
                                      alt=""
                                      className="w-full h-full object-cover blur-2xl scale-120 opacity-40"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/50" />
                                  </div>
                                )}

                                {/* Centered vertical video scaling dynamically so the full video is visible */}
                                <div
                                  className="relative flex items-center justify-center select-none shadow-2xl rounded-xl overflow-hidden z-10"
                                  style={{
                                    width: `${nativeW}px`,
                                    height: `${nativeH}px`,
                                    transform: `scale(${finalScale})`,
                                    transformOrigin: 'center center',
                                  }}
                                >
                                  <iframe
                                    src={parsed.embedUrl}
                                    scrolling="no"
                                    className="w-full h-full border-0 select-none pointer-events-auto"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    title="Vista previa del video"
                                  />
                                </div>

                                {/* Floating platform fallback button */}
                                <a
                                  href={videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute bottom-2.5 right-2.5 z-30 px-3 py-1.5 rounded-xl bg-black/85 hover:bg-black text-white text-[11px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg transition active:scale-95"
                                >
                                  <span>Ver en {parsed.platformName}</span>
                                  <ExternalLink className="w-3 h-3 text-sky-400" />
                                </a>
                              </div>
                            ) : (
                              <div
                                className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black"
                                style={{
                                  transform: resizeScale !== 1 ? `scale(${resizeScale})` : undefined,
                                  transformOrigin: `${imagePosition.x}% ${imagePosition.y}%`,
                                }}
                              >
                                <iframe
                                  src={parsed.embedUrl}
                                  scrolling="no"
                                  className="w-full h-full border-0 pointer-events-auto"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  title="Vista previa del video"
                                />
                              </div>
                            );
                          })()
                        ) : (
                          <video
                            ref={videoRef}
                            src={videoUrl}
                            poster={imageUrl}
                            autoPlay
                            loop
                            muted={isVideoMuted}
                            playsInline
                            className={`w-full h-full select-none ${
                              imageFit === 'contain' ? 'object-contain' : 'object-cover'
                            }`}
                            style={{
                              objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                              transform: resizeScale !== 1 ? `scale(${resizeScale})` : undefined,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (videoRef.current) {
                                if (videoRef.current.paused) {
                                  videoRef.current.play();
                                  setIsVideoPlaying(true);
                                } else {
                                  videoRef.current.pause();
                                  setIsVideoPlaying(false);
                                }
                              }
                            }}
                          />
                        )}

                        {/* Video Indicator & Controls Pill */}
                        <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-rose-600/95 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1 shadow-md border border-white/20">
                            <Film className="w-3 h-3" />
                            <span>{parseVideoUrl(videoUrl).platformName}</span>
                          </span>
                          {imageUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVideoPreviewMode('thumbnail');
                              }}
                              className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/85 text-emerald-300 text-[10px] font-bold backdrop-blur-md border border-white/20 transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                            >
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>Ver miniatura</span>
                            </button>
                          )}
                          {!parseVideoUrl(videoUrl).isIframe && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (videoRef.current) {
                                    if (videoRef.current.paused) {
                                      videoRef.current.play();
                                      setIsVideoPlaying(true);
                                    } else {
                                      videoRef.current.pause();
                                      setIsVideoPlaying(false);
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 transition cursor-pointer shadow-xs active:scale-95"
                                title={isVideoPlaying ? 'Pausar video' : 'Reproducir video'}
                              >
                                {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsVideoMuted(!isVideoMuted);
                                  if (videoRef.current) {
                                    videoRef.current.muted = !isVideoMuted;
                                  }
                                }}
                                className="p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 transition cursor-pointer shadow-xs active:scale-95"
                                title={isVideoMuted ? 'Activar sonido' : 'Silenciar'}
                              >
                                {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  ) : imageUrl ? (
                    <>
                      {/* Ambient backdrop when image is contained or reduced: keeps predefined space seamlessly filled without raw empty gaps */}
                      {(imageFit === 'contain' || resizeScale < 1) && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
                          <img
                            alt=""
                            className="w-full h-full object-cover blur-2xl scale-125 opacity-40"
                            style={{
                              objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                              filter: imageFilterCss && imageFilterCss !== 'none' ? `${imageFilterCss} blur(24px)` : 'blur(24px)',
                            }}
                            src={imageUrl}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40" />
                        </div>
                      )}

                      <img
                        alt={title || 'Publicación'}
                        className={`w-full h-full select-none pointer-events-none relative z-1 will-change-transform ${
                          imageFit === 'contain' ? 'object-contain' : 'object-cover'
                        }`}
                        style={{
                          objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                          transform: resizeScale !== 1 ? `scale(${resizeScale})` : undefined,
                          transformOrigin: `${imagePosition.x}% ${imagePosition.y}%`,
                          filter: imageFilterCss && imageFilterCss !== 'none' ? imageFilterCss : undefined,
                        }}
                        src={imageUrl}
                        referrerPolicy="no-referrer"
                      />
                    </>
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />

                  {/* Rule of thirds framing grid when dragging */}
                  {isDraggingImage && (
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 border border-white/20">
                      <div className="border-r border-b border-white/25" />
                      <div className="border-r border-b border-white/25" />
                      <div className="border-b border-white/25" />
                      <div className="border-r border-b border-white/25" />
                      <div className="border-r border-b border-white/25" />
                      <div className="border-b border-white/25" />
                      <div className="border-r border-b border-white/25" />
                      <div className="border-r border-b border-white/25" />
                      <div />
                    </div>
                  )}

                  {/* Floating AI Regenerate shortcut when image was created with AI */}
                  {lastGeneratedPrompt && imageUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateAiImage(true);
                      }}
                      disabled={isGeneratingAiImage}
                      className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[11px] font-bold backdrop-blur-md shadow-md bg-purple-900/80 hover:bg-purple-800/95 border border-purple-300/40 transition-all cursor-pointer active:scale-95"
                      title="Haz clic para generar otra versión con IA"
                    >
                      {isGeneratingAiImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-200 shrink-0" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                      )}
                      <span>Regenerar IA ({aiVariationIndex + 1})</span>
                    </button>
                  )}

                  {/* Floating Reframe helper pill */}
                  <div
                    className={`absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[11px] font-bold backdrop-blur-md shadow-md border border-white/20 transition-all pointer-events-none ${
                      isDraggingImage ? 'bg-[#007af7]/95 scale-105' : 'bg-black/60 group-hover:bg-black/75'
                    }`}
                  >
                    <Move className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                    <span>{isDraggingImage ? `X: ${imagePosition.x}% · Y: ${imagePosition.y}%` : 'Mueve para reencuadrar'}</span>
                  </div>

                  {/* Auto-Adjust Confirmation Toast */}
                  {autoAdjustToast && (
                    <div className="absolute inset-x-0 bottom-12 z-30 flex justify-center pointer-events-none animate-in fade-in zoom-in-95">
                      <span className="px-3 py-1.5 rounded-full bg-[#081B38]/95 text-white text-xs font-bold shadow-lg border border-white/25 backdrop-blur-md flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{autoAdjustToast}</span>
                      </span>
                    </div>
                  )}

                  {/* Top-Right Decorative Curve / Swoosh Gradient */}
                  <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none select-none z-10 overflow-hidden rounded-tr-2xl">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full"
                      preserveAspectRatio="none"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="topCornerGrad-edit" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0060E6" />
                          <stop offset="40%" stopColor="#0099FF" />
                          <stop offset="75%" stopColor="#00CFFF" />
                          <stop offset="100%" stopColor="#1BE0F8" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 0 C 45 0, 80 18, 100 68 L 100 0 Z" fill="url(#topCornerGrad-edit)" />
                    </svg>
                  </div>

                  {/* AI Enhanced Super HD Badge */}
                  {isEnhanced && (
                    <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-full bg-emerald-600/95 text-white text-[11px] font-extrabold backdrop-blur-xs flex items-center gap-1 shadow-md border border-white/25 animate-in fade-in">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Mejorada con IA (Super HD)</span>
                    </div>
                  )}

                  {/* Active Photo Filter Badge */}
                  {imageFilterCss && imageFilterCss !== 'none' && (
                    <div
                      className={`absolute left-2.5 z-20 px-2.5 py-1 rounded-full bg-violet-600/95 text-white text-[11px] font-extrabold backdrop-blur-xs flex items-center gap-1 shadow-md border border-white/25 animate-in fade-in ${
                        isEnhanced ? 'top-10' : 'top-2.5'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-violet-200" />
                      <span>Filtro: {PHOTO_FILTERS.find((f) => f.id === activeFilterId)?.name || 'Personalizado'}</span>
                    </div>
                  )}

                  {/* Dynamic 3D Discount Badge */}
                  {discountPercent ? (
                    <div
                      className="absolute select-none z-20 left-3 top-6 sm:top-6.5"
                      style={{
                        display: 'inline-flex',
                        transform: 'rotate(-12deg) scale(0.80)',
                        transformOrigin: 'top left',
                      }}
                    >
                      <div className="relative flex items-center">
                        <div
                          className="relative z-10 text-white font-black text-base sm:text-lg px-3 py-1.5 tracking-tight rounded-full flex items-center justify-center leading-none"
                          style={{
                            background:
                              'linear-gradient(rgb(255, 179, 0) 0%, rgb(255, 145, 0) 35%, rgb(240, 80, 0) 70%, rgb(230, 57, 0) 100%)',
                            boxShadow:
                              'rgba(230, 60, 0, 0.52) 0px 4px 16px, rgba(0, 0, 0, 0.22) 0px 2px 6px, rgba(255, 255, 255, 0.65) 0px 1.5px 1.5px inset',
                            textShadow: 'rgba(150, 20, 0, 0.45) 0px 1px 2px',
                          }}
                        >
                          -{discountPercent}%
                        </div>
                        <div className="absolute -top-1.5 -right-1 pointer-events-none w-5 h-5 flex items-center justify-center z-0">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 32 32" fill="none" stroke="#FFB300" strokeLinecap="round">
                            <line x1="15" y1="16" x2="24" y2="6" strokeWidth="2.8" />
                            <line x1="18" y1="20" x2="30" y2="18" strokeWidth="2.8" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Expiry Pill */}
                  {customExpiryLabel && (
                    <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none bg-gradient-to-r from-teal-500 to-cyan-500/95 text-white text-xs px-3 py-1.5 font-bold rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-sm border border-white/25 max-w-[85%]">
                      <Clock className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="truncate">{customExpiryLabel}</span>
                    </div>
                  )}

                  {/* AI Image Generation Progress Overlay */}
                  {isGeneratingAiImage && (
                    <div className="absolute inset-0 z-30 bg-purple-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center animate-in fade-in">
                      <Loader2 className="w-9 h-9 animate-spin text-purple-400 mb-2" />
                      <span className="text-sm font-extrabold text-white">
                        Creando imagen con Inteligencia Artificial...
                      </span>
                      <span className="text-xs text-purple-200 mt-1 max-w-xs truncate">
                        "{aiCreatePrompt || 'Generando...'}"
                      </span>
                    </div>
                  )}

                  {/* Enhancing Progress Overlay */}
                  {isEnhancing && (
                    <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center animate-in fade-in">
                      <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-2" />
                      <span className="text-sm font-extrabold text-white">
                        Mejorando imagen con Inteligencia Artificial...
                      </span>
                      <span className="text-xs text-sky-200 mt-1">
                        {enhancingStep || 'Optimizando resolución y balance...'}
                      </span>
                    </div>
                  )}
                </div>
              )}

                {/* Toolbar containing ONLY icons */}
                <div className="flex items-center justify-between gap-1.5 px-3 py-1.5 mb-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl transition text-xs min-h-[44px]">
                  {showDeleteConfirm ? (
                    <div className="flex items-center justify-between w-full py-0.5 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{videoUrl ? '¿Eliminar el video actual?' : '¿Eliminar la foto actual?'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          id="btn-confirm-delete-photo"
                          onClick={handleConfirmDeletePhoto}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-2xs transition cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Sí, eliminar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      {/* Left: Creative and editing icons */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {/* 1. Subir foto o video */}
                        <button
                          type="button"
                          id="btn-upload-photo"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-sky-600 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          title="1. Subir foto o video desde tu dispositivo"
                          aria-label="Subir foto o video"
                        >
                          <Upload className="w-4 h-4" />
                        </button>

                        {/* 1b. Colocar o editar URL de video */}
                        <button
                          type="button"
                          id="btn-toolbar-video-url"
                          onClick={() => {
                            setVideoUrlInputText(videoUrl.startsWith('data:') ? '' : videoUrl);
                            setShowVideoUrlModal(true);
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                            videoUrl
                              ? 'bg-sky-50 border-sky-300 text-sky-600 font-bold'
                              : 'bg-white hover:bg-sky-50 border-slate-200 hover:border-sky-300 text-sky-600'
                          }`}
                          title="Colocar o editar URL del video"
                          aria-label="URL de video"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>

                        {/* 1c. Colocar o cambiar miniatura de portada (cuando hay video) */}
                        {videoUrl ? (
                          <button
                            type="button"
                            id="btn-toolbar-thumbnail"
                            onClick={() => {
                              setShowThumbnailModal(true);
                            }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                              imageUrl && imageUrl !== videoUrl
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-600 ring-1 ring-emerald-300'
                                : 'bg-white hover:bg-emerald-50 border-slate-200 hover:border-emerald-300 text-emerald-600'
                            }`}
                            title="Colocar o cambiar miniatura de portada del video"
                            aria-label="Miniatura del video"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        ) : null}

                        {/* 2. Auto ajustar */}
                        <button
                          type="button"
                          id="btn-auto-adjust-framing"
                          onClick={() => {
                            if (!imageUrl && !videoUrl) {
                              setAutoAdjustToast('Sube una foto o coloca un video primero para ajustar al espacio');
                              setTimeout(() => setAutoAdjustToast(null), 2500);
                              return;
                            }
                            handleAutoAdjustFraming();
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                            imageFit === 'contain'
                              ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm'
                              : 'bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-300 text-indigo-600'
                          }`}
                          title={
                            imageFit === 'contain'
                              ? 'Ajustado al espacio (clic para llenar marco)'
                              : '2. Auto-ajustar tamaño de la imagen o video al espacio (ver completa)'
                          }
                          aria-label="Auto ajustar tamaño al espacio"
                        >
                          <Crosshair className="w-4 h-4" />
                        </button>

                        {/* 3. Redimensionar */}
                        <button
                          type="button"
                          id="btn-resize-photo"
                          onClick={() => {
                            if (!imageUrl && !videoUrl) {
                              setAutoAdjustToast('Sube una foto o coloca un video primero para redimensionar');
                              setTimeout(() => setAutoAdjustToast(null), 2500);
                              return;
                            }
                            setActiveToolbarTool(activeToolbarTool === 'resize' ? null : 'resize');
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                            activeToolbarTool === 'resize'
                              ? 'bg-blue-100 border-blue-400 text-[#007af7] ring-2 ring-blue-300'
                              : 'bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-blue-600'
                          }`}
                          title="3. Ampliar o reducir imagen"
                          aria-label="Ampliar o reducir"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>

                        {/* 4. Recortar */}
                        <button
                          type="button"
                          id="btn-crop-photo"
                          onClick={() => {
                            if (!imageUrl) {
                              setAutoAdjustToast('Sube o genera una foto primero para recortar');
                              setTimeout(() => setAutoAdjustToast(null), 2500);
                              return;
                            }
                            setIsCropModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-600 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          title="4. Recortar imagen"
                          aria-label="Recortar"
                        >
                          <Crop className="w-4 h-4" />
                        </button>

                        {/* 5. Mejorar con IA */}
                        <button
                          type="button"
                          id="btn-enhance-ai"
                          onClick={() => {
                            if (!imageUrl) {
                              setAutoAdjustToast('Sube o genera una foto primero para mejorar con IA');
                              setTimeout(() => setAutoAdjustToast(null), 2500);
                              return;
                            }
                            setActiveToolbarTool(activeToolbarTool === 'enhance' ? null : 'enhance');
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                            activeToolbarTool === 'enhance'
                              ? 'bg-amber-100 border-amber-400 text-amber-600 ring-2 ring-amber-300'
                              : isEnhanced
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                              : 'bg-white hover:bg-amber-50 border-slate-200 hover:border-amber-300 text-amber-500'
                          }`}
                          title="5. Mejorar calidad y nitidez con IA"
                          aria-label="Mejorar con IA"
                        >
                          <Wand2 className="w-4 h-4" />
                        </button>

                        {/* 6. Filtros de imagen */}
                        <button
                          type="button"
                          id="btn-photo-filters"
                          onClick={() => {
                            if (!imageUrl) {
                              setAutoAdjustToast('Sube o genera una foto primero para aplicar filtros');
                              setTimeout(() => setAutoAdjustToast(null), 2500);
                              return;
                            }
                            setActiveToolbarTool(activeToolbarTool === 'filters' ? null : 'filters');
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                            activeToolbarTool === 'filters'
                              ? 'bg-violet-100 border-violet-400 text-violet-600 ring-2 ring-violet-300'
                              : (imageFilterCss && imageFilterCss !== 'none')
                              ? 'bg-violet-50 border-violet-300 text-violet-600 font-bold'
                              : 'bg-white hover:bg-violet-50 border-slate-200 hover:border-violet-300 text-violet-600'
                          }`}
                          title="6. Aplicar filtros y efectos de color"
                          aria-label="Filtros"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>

                        {/* 7. Crear con IA */}
                        <button
                          type="button"
                          id="btn-create-ai"
                          onClick={() => setActiveToolbarTool(activeToolbarTool === 'createAi' ? null : 'createAi')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                            activeToolbarTool === 'createAi'
                              ? 'bg-purple-100 border-purple-400 text-purple-600 ring-2 ring-purple-300'
                              : 'bg-white hover:bg-purple-50 border-slate-200 hover:border-purple-300 text-purple-600'
                          }`}
                          title="7. Crear imagen con IA desde una descripción"
                          aria-label="Crear con IA"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Right: Delete photo icon */}
                      <button
                        type="button"
                        id="btn-delete-photo"
                        onClick={() => {
                          if (!imageUrl) {
                            setAutoAdjustToast('No hay ninguna foto para eliminar');
                            setTimeout(() => setAutoAdjustToast(null), 2500);
                            return;
                          }
                          setShowDeleteConfirm(true);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-500 hover:text-rose-600 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        title="Eliminar foto"
                        aria-label="Eliminar foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

              {/* 3. Resize / Zoom Slider Drawer */}
              {activeToolbarTool === 'resize' && (
                <div className="mb-2.5 p-3 rounded-2xl bg-gradient-to-b from-blue-50/80 to-slate-50 border border-blue-200/90 shadow-2xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-[#007af7] shrink-0" />
                      <span className="text-xs font-bold text-slate-800">Escala y zoom</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveToolbarTool(null)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1 rounded-md cursor-pointer"
                      title="Cerrar"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Range Slider for Zoom In / Zoom Out with live percentage display */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between text-xs px-0.5">
                      <span className="text-slate-600 font-semibold text-[11px] flex items-center gap-1.5">
                        <span>Escala de imagen:</span>
                        <span className="text-slate-400 font-normal">
                          {resizeScale > 1.01 ? 'Aumento' : resizeScale < 0.99 ? 'Reducción' : 'Original'}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (resizeScale !== 1) {
                            setResizeScale(1);
                            setAutoAdjustToast('Tamaño restablecido al 100%');
                            setTimeout(() => setAutoAdjustToast(null), 2000);
                          }
                        }}
                        title={resizeScale !== 1 ? 'Haz clic para restablecer al 100%' : undefined}
                        className={`text-xs font-black text-[#007af7] bg-blue-50 border border-blue-200/90 px-2.5 py-0.5 rounded-full tabular-nums shadow-2xs transition ${
                          resizeScale !== 1 ? 'cursor-pointer hover:bg-blue-100 hover:border-blue-300' : 'cursor-default'
                        }`}
                      >
                        {Math.round(resizeScale * 100)}%
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setResizeScale((prev) => Math.max(0.4, parseFloat((prev - 0.05).toFixed(2))));
                        }}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-2xs cursor-pointer active:scale-95 shrink-0"
                        title="Reducir tamaño (-5%)"
                        aria-label="Reducir"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <div className="flex-1 relative flex items-center">
                        <input
                          type="range"
                          id="input-resize-scale-slider"
                          min="0.4"
                          max="2.5"
                          step="0.01"
                          value={resizeScale}
                          onInput={(e) => {
                            setResizeScale(parseFloat((e.target as HTMLInputElement).value));
                          }}
                          onChange={(e) => {
                            setResizeScale(parseFloat(e.target.value));
                          }}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#007af7]"
                          aria-label="Barra para ampliar o reducir"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setResizeScale((prev) => Math.min(2.5, parseFloat((prev + 0.05).toFixed(2))))}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-2xs cursor-pointer active:scale-95 shrink-0"
                        title="Ampliar tamaño (+5%)"
                        aria-label="Ampliar"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Compact AI Enhancer Drawer */}
              {activeToolbarTool === 'enhance' && (
                <div className="mb-2.5 p-3 rounded-2xl bg-gradient-to-b from-amber-50/60 to-slate-50 border border-amber-200/90 shadow-2xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-900">
                        Mejora con Inteligencia Artificial
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Super HD 2X
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveToolbarTool(null)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1 rounded-md cursor-pointer"
                      title="Cerrar opciones"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 3 style choices in a slim grid */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEnhancementMode('sharpness')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition text-center cursor-pointer border ${
                        enhancementMode === 'sharpness'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs font-bold'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      Super Nitidez
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnhancementMode('vivid')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition text-center cursor-pointer border ${
                        enhancementMode === 'vivid'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs font-bold'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      Color & Gourmet
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnhancementMode('contrast')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition text-center cursor-pointer border ${
                        enhancementMode === 'contrast'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs font-bold'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      Contraste Pro
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-apply-ai-enhance-post"
                      disabled={isEnhancing || !imageUrl}
                      onClick={handleEnhanceWithAi}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                        isEnhancing || !imageUrl
                          ? 'bg-amber-200 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white active:scale-99'
                      }`}
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{enhancingStep || 'Mejorando imagen...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                          <span>{isEnhanced ? 'Re-aplicar mejora con IA' : '✨ Mejorar foto con IA'}</span>
                        </>
                      )}
                    </button>

                    {isEnhanced && originalImageUrl && (
                      <button
                        type="button"
                        onClick={handleRevertToOriginal}
                        className="py-2 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1 cursor-pointer shrink-0"
                        title="Restaurar foto original sin modificaciones"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Original</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 6. Photo Filters Drawer */}
              {activeToolbarTool === 'filters' && (
                <div className="mb-2.5 p-3 rounded-2xl bg-gradient-to-b from-violet-50/90 to-slate-50 border border-violet-200/90 shadow-2xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <SlidersHorizontal className="w-4 h-4 text-violet-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 truncate">
                        Filtros y Efectos
                      </span>
                      {activeFilterId !== 'none' && (
                        <span className="text-[10px] font-extrabold text-violet-800 bg-violet-100/90 px-2 py-0.5 rounded-full border border-violet-200 shrink-0">
                          {PHOTO_FILTERS.find((f) => f.id === activeFilterId)?.name || 'Activo'}
                          {filterIntensity < 100 ? ` (${filterIntensity}%)` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {(activeFilterId !== 'none' ||
                        filterAdjustments.brightness !== 100 ||
                        filterAdjustments.contrast !== 100 ||
                        filterAdjustments.saturation !== 100 ||
                        filterAdjustments.warmth !== 0) && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Restablecer a colores originales"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-400" />
                          <span>Original</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveToolbarTool(null)}
                        className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1 rounded-md cursor-pointer"
                        title="Cerrar filtros"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Presets Horizontal Scrollable Carousel with Live Previews & Smooth Navigation */}
                  <div className="relative group">
                    {/* Left Scroll Chevron Button */}
                    <button
                      type="button"
                      onClick={() => scrollFilterCarousel('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 z-10 w-6 h-6 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95"
                      title="Desplazar a la izquierda"
                      aria-label="Ver filtros anteriores"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Right Scroll Chevron Button */}
                    <button
                      type="button"
                      onClick={() => scrollFilterCarousel('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 z-10 w-6 h-6 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95"
                      title="Desplazar a la derecha"
                      aria-label="Ver más filtros"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div
                      ref={filterCarouselRef}
                      className="flex items-center gap-2 overflow-x-auto px-2 pb-1.5 pt-0.5 scroll-smooth touch-pan-x scrollbar-thin scrollbar-thumb-violet-300 scrollbar-track-transparent"
                    >
                      {PHOTO_FILTERS.map((preset) => {
                        const isSelected = activeFilterId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectFilterPreset(preset.id)}
                            className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-transform duration-100 cursor-pointer shrink-0 select-none ${
                              isSelected
                                ? 'bg-white shadow-xs ring-2 ring-violet-500 scale-102'
                                : 'hover:bg-white/70 opacity-85 hover:opacity-100'
                            }`}
                          >
                            {/* Miniature preview rounded square with high-performance cached thumbnail */}
                            <div
                              className={`w-11 h-11 rounded-lg overflow-hidden border relative bg-slate-200 shadow-2xs ${
                                isSelected ? 'border-violet-500' : 'border-slate-300'
                              }`}
                            >
                              {filterThumbnailUrl || imageUrl ? (
                                <img
                                  src={filterThumbnailUrl || imageUrl}
                                  alt={preset.name}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover pointer-events-none"
                                  style={{
                                    filter: preset.filter !== 'none' ? preset.filter : undefined,
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
                                  Aa
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-violet-600/15 flex items-center justify-center">
                                  <div className="w-3.5 h-3.5 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <span
                              className={`text-[10px] leading-none text-center truncate max-w-[54px] ${
                                isSelected ? 'font-black text-violet-900' : 'font-medium text-slate-700'
                              }`}
                            >
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Intensity Slider (Visible when any filter preset is active) */}
                  {activeFilterId !== 'none' && (
                    <div className="p-2 rounded-xl bg-white border border-violet-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">Intensidad del filtro:</span>
                        <span className="font-bold text-violet-700">{filterIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={filterIntensity}
                        onChange={(e) => handleIntensityChange(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        aria-label="Intensidad del filtro"
                      />
                    </div>
                  )}

                  {/* Toggleable Advanced Light & Color Adjustments */}
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedAdjustments(!showAdvancedAdjustments)}
                      className="w-full py-1 px-2 rounded-lg bg-white/80 hover:bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 text-[11px] font-bold flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3 h-3 text-violet-600" />
                        <span>Ajustes finos (Brillo, Contraste, Saturación, Calidez)</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {showAdvancedAdjustments ? 'Ocultar ▲' : 'Ajustar ▼'}
                      </span>
                    </button>

                    {showAdvancedAdjustments && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-2 animate-in fade-in">
                        {/* Brillo */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                            <span>Brillo</span>
                            <span className="font-bold text-slate-800">
                              {filterAdjustments.brightness > 100
                                ? `+${filterAdjustments.brightness - 100}%`
                                : `${filterAdjustments.brightness - 100}%`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="70"
                            max="130"
                            step="2"
                            value={filterAdjustments.brightness}
                            onChange={(e) => handleAdjustmentChange('brightness', parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                          />
                        </div>

                        {/* Contraste */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                            <span>Contraste</span>
                            <span className="font-bold text-slate-800">
                              {filterAdjustments.contrast > 100
                                ? `+${filterAdjustments.contrast - 100}%`
                                : `${filterAdjustments.contrast - 100}%`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="70"
                            max="130"
                            step="2"
                            value={filterAdjustments.contrast}
                            onChange={(e) => handleAdjustmentChange('contrast', parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                          />
                        </div>

                        {/* Saturación */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                            <span>Saturación de color</span>
                            <span className="font-bold text-slate-800">
                              {filterAdjustments.saturation > 100
                                ? `+${filterAdjustments.saturation - 100}%`
                                : `${filterAdjustments.saturation - 100}%`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="170"
                            step="5"
                            value={filterAdjustments.saturation}
                            onChange={(e) => handleAdjustmentChange('saturation', parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                          />
                        </div>

                        {/* Calidez */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                            <span>Calidez dorada</span>
                            <span className="font-bold text-slate-800">
                              {filterAdjustments.warmth > 0 ? `+${filterAdjustments.warmth}%` : '0%'}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            step="5"
                            value={filterAdjustments.warmth}
                            onChange={(e) => handleAdjustmentChange('warmth', parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 7. Create with AI Drawer */}
              {activeToolbarTool === 'createAi' && (
                <div className="mb-2.5 p-3.5 rounded-2xl bg-gradient-to-b from-purple-50/90 to-slate-50 border border-purple-200/90 shadow-2xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-900">
                        Crear imagen con Inteligencia Artificial
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveToolbarTool(null)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1 rounded-md cursor-pointer"
                      title="Cerrar"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-tight">
                    Escribe brevemente qué imagen quieres para tu publicación y se creará automáticamente:
                  </p>

                  <div className="space-y-2">
                    <div className="relative">
                      <textarea
                        rows={2}
                        value={aiCreatePrompt}
                        onChange={(e) => setAiCreatePrompt(e.target.value)}
                        placeholder="Ej: Deliciosa hamburguesa artesanal con queso derretido, papas rústicas y gaseosa bien fría..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 placeholder:text-slate-400 resize-none"
                      />
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-purple-700 block">Ideas rápidas:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          'Hamburguesa artesanal con papas',
                          'Pizza crocante a la leña con queso',
                          'Plato del día con ensalada fresca',
                          'Café espresso y postre de chocolate',
                          'Corte de cabello moderno en barbería',
                          'Ropa de moda y accesorios en tienda',
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              setAiCreatePrompt(suggestion);
                              if (lastGeneratedPrompt !== suggestion) {
                                setAiVariationIndex(0);
                              }
                            }}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 transition cursor-pointer"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Category / Variation Status badge if already generated */}
                    {aiGeneratedCategory && lastGeneratedPrompt && lastGeneratedPrompt.toLowerCase() === aiCreatePrompt.trim().toLowerCase() && (
                      <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-purple-100/80 border border-purple-200 text-purple-950">
                        <span className="font-semibold truncate">
                          ✨ {aiGeneratedCategory}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-200/90 text-purple-900 shrink-0 ml-2">
                          Versión {aiVariationIndex + 1}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      id="btn-generate-ai-image-submit"
                      disabled={isGeneratingAiImage || !aiCreatePrompt.trim()}
                      onClick={() => handleGenerateAiImage(lastGeneratedPrompt.trim().toLowerCase() === aiCreatePrompt.trim().toLowerCase())}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                        isGeneratingAiImage || !aiCreatePrompt.trim()
                          ? 'bg-purple-200 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white active:scale-99'
                      }`}
                    >
                      {isGeneratingAiImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generando con IA...</span>
                        </>
                      ) : lastGeneratedPrompt && lastGeneratedPrompt.trim().toLowerCase() === aiCreatePrompt.trim().toLowerCase() ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Regenerar otra versión con IA</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Crear imagen con IA automáticamente</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Title & Description Editable DIRECTLY inside the card */}
              <div className="space-y-2.5">
                {/* Title Input Styled matching Explorar Card */}
                <div className="relative group">
                  <label htmlFor="post-title-input" className="text-[11px] font-bold text-slate-600 block px-1 mb-1">
                    Título principal
                  </label>
                  <input
                    id="post-title-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(capitalizeTitleWords(e.target.value))}
                    placeholder="Escribe el título de tu publicación..."
                    required
                    className="w-full text-base sm:text-[18px] font-extrabold text-[#0A1D3C] placeholder-slate-400 bg-slate-50/60 hover:bg-blue-50/50 focus:bg-white border border-slate-200 hover:border-blue-300 focus:border-[#007af7] focus:ring-2 focus:ring-blue-100 rounded-xl px-2.5 py-1.5 outline-none transition leading-tight"
                  />
                </div>

                {/* Description Textarea Styled matching Explorar Card */}
                <div className="relative group">
                  <label htmlFor="post-description-input" className="text-[11px] font-bold text-slate-600 block px-1 mb-1">
                    Descripción detallada
                  </label>
                  <textarea
                    id="post-description-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe qué incluye la oferta, ingredientes, detalles o condiciones..."
                    rows={2}
                    required
                    className="w-full text-xs text-slate-700 placeholder-slate-400 bg-slate-50/60 hover:bg-blue-50/50 focus:bg-white border border-slate-200 hover:border-blue-300 focus:border-[#007af7] focus:ring-2 focus:ring-blue-100 rounded-xl px-2.5 py-1.5 outline-none resize-none transition leading-relaxed"
                  />
                </div>

                {/* 4. Pricing Controls Styled directly in the Card */}
                <div className="relative group">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Precio (COP)
                    </label>
                    {discountPercent ? (
                      <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {discountPercent}% de ahorro
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Sin descuento activo</span>
                    )}
                  </div>

                  <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/80">

                  {/* Responsive price sizing based on digits length */}
                  {(() => {
                    const promoDisplayStr = promotionalPrice || '24900';
                    const promoLen = promoDisplayStr.length;
                    const promoFontSize =
                      promoLen <= 5
                        ? 'text-base sm:text-xl'
                        : promoLen <= 7
                        ? 'text-sm sm:text-lg'
                        : promoLen <= 9
                        ? 'text-xs sm:text-sm'
                        : 'text-[11px] sm:text-xs';

                    const origDisplayStr = originalPrice || '36000';
                    const origLen = origDisplayStr.length;
                    const origFontSize =
                      origLen <= 7
                        ? 'text-xs sm:text-sm'
                        : origLen <= 9
                        ? 'text-[11px] sm:text-xs'
                        : 'text-[10px] sm:text-[11px]';

                    return (
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Promotional Price inside Blue Pill with auto-adjusting size */}
                        <div
                          className={`text-white font-extrabold px-3.5 py-1.5 rounded-full inline-flex items-center gap-1 shadow-sm transition-all duration-150 ${promoFontSize}`}
                          style={{
                            background:
                              'linear-gradient(rgb(1, 117, 234) 0%, rgb(0, 87, 220) 60%, rgb(0, 68, 184) 100%)',
                          }}
                        >
                          <span className="shrink-0 select-none">$</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={promotionalPrice}
                            onChange={(e) => {
                              const cleanDigits = e.target.value.replace(/[^\d]/g, '');
                              setPromotionalPrice(cleanDigits);
                            }}
                            placeholder="24900"
                            style={{ width: `${Math.max(7.5, promoLen + 0.6)}ch` }}
                            className={`bg-transparent text-white font-black ${promoFontSize} placeholder-white/60 outline-none transition-all duration-150 min-w-[85px] sm:min-w-[95px] max-w-[220px]`}
                          />
                        </div>

                        {/* Original Price (Strikethrough) with auto-adjusting size */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400 font-medium shrink-0 select-none">Antes: $</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={originalPrice}
                            onChange={(e) => {
                              const cleanDigits = e.target.value.replace(/[^\d]/g, '');
                              setOriginalPrice(cleanDigits);
                            }}
                            placeholder="36000"
                            style={{ width: `${Math.max(7.5, origLen + 0.8)}ch` }}
                            className={`bg-white border border-slate-200 rounded-lg px-2.5 py-1 ${origFontSize} font-bold text-slate-500 line-through decoration-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-150 min-w-[85px] sm:min-w-[95px] max-w-[180px]`}
                          />
                        </div>
                      </div>
                    );
                  })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* HORARIOS Y VIGENCIA (DÍAS, HORAS Y VIGENCIA FUERA)       */}
          {/* ======================================================== */}
          <ValidityEngineControl
            initialSchedule={validitySchedule}
            initialExpiryLabel={customExpiryLabel}
            previewImageUrl={imageUrl}
            onChange={handleValidityChange}
          />

          {/* ======================================================== */}
          {/* CONFIGURACIÓN ADICIONAL DE LA PUBLICACIÓN (AL FINAL)     */}
          {/* ======================================================== */}
          <div className={`bg-white rounded-3xl border border-slate-200 shadow-xs transition-all ${isConfigAdicionalOpen ? 'p-4 sm:p-5 space-y-4' : 'p-3.5 sm:p-4'}`}>
            <button
              type="button"
              onClick={() => setIsConfigAdicionalOpen((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group select-none"
              aria-expanded={isConfigAdicionalOpen}
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#041f5e]">Configuración adicional de la publicación</span>
                {!planCategoryId && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Falta Tipo de Plan *
                  </span>
                )}
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-[#007af7] flex items-center justify-center transition-colors shrink-0">
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isConfigAdicionalOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isConfigAdicionalOpen && (
              <div className="space-y-4 pt-0.5">
                {/* 1. Tipo de Publicación */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Tipo de publicación
                  </label>
              <div ref={typeDropdownRef} className="relative">
                <button
                  type="button"
                  id="post-type-dropdown-trigger"
                  onClick={() => {
                    setIsTypeDropdownOpen((prev) => !prev);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all shadow-2xs cursor-pointer ${
                    isTypeDropdownOpen
                      ? 'border-[#007af7] ring-2 ring-[#007af7]/20 bg-white'
                      : 'border-slate-300 hover:border-[#007af7]/60 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#007af7] flex items-center justify-center shrink-0 font-medium text-sm">
                      <PostTypeIconDisplay
                        iconName={activePostTypeConfig.iconName}
                        fallbackId={activePostTypeConfig.id}
                        className="w-4 h-4"
                        emojiClassName="text-sm"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {activePostTypeConfig.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {activePostTypeConfig.description}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isTypeDropdownOpen ? 'rotate-180 text-[#007af7]' : ''
                    }`}
                  />
                </button>

                {isTypeDropdownOpen && (
                  <div
                    id="post-type-menu"
                    className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1 max-h-60 overflow-y-auto"
                  >
                    {postTypes.map((item) => {
                      const isSelected = type === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setType(item.id as PostType);
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2.5 transition cursor-pointer active:scale-[0.99] ${
                            isSelected
                              ? 'bg-blue-50/80 text-blue-900 border border-blue-200/80'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#007af7] flex items-center justify-center shrink-0">
                              <PostTypeIconDisplay
                                iconName={item.iconName}
                                fallbackId={item.id}
                                className="w-3.5 h-3.5"
                                emojiClassName="text-sm"
                              />
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-bold block text-slate-800">
                                {item.label}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {item.description}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#007af7] text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Categoría en Explorar */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Categoría en explorar
              </label>
              <div ref={categoryDropdownRef} className="relative">
                <button
                  type="button"
                  id="category-dropdown-trigger"
                  onClick={() => {
                    setIsCategoryDropdownOpen((prev) => !prev);
                    setCategorySearchQuery('');
                    setIsTypeDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all shadow-2xs cursor-pointer ${
                    isCategoryDropdownOpen
                      ? 'border-[#007af7] ring-2 ring-[#007af7]/20 bg-white'
                      : 'border-slate-300 hover:border-[#007af7]/60 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#007af7] flex items-center justify-center shrink-0">
                      {(() => {
                        const selCat = categories.find((c) => c.id === categoryId);
                        if (selCat && isEmoji(selCat.iconName)) {
                          return <span className="text-sm">{selCat.iconName}</span>;
                        }
                        const CatIcon = (selCat && ICON_MAP[selCat.iconName]) || Tag;
                        return <CatIcon className="w-4 h-4" />;
                      })()}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {categories.find((c) => c.id === categoryId)?.name || 'Selecciona categoría'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Categoría pública para clientes
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isCategoryDropdownOpen ? 'rotate-180 text-[#007af7]' : ''
                    }`}
                  />
                </button>

                {isCategoryDropdownOpen && (
                  <div
                    id="category-menu"
                    className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    {/* Quick Search */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={categorySearchQuery}
                          onChange={(e) => setCategorySearchQuery(e.target.value)}
                          placeholder="Buscar categoría..."
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#007af7]"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Scrollable list */}
                    <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                      {categories
                        .filter((c) =>
                          c.name.toLowerCase().includes(categorySearchQuery.trim().toLowerCase())
                        )
                        .map((c) => {
                          const isSelected = categoryId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setCategoryId(c.id);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2.5 transition cursor-pointer active:scale-[0.99] ${
                                isSelected
                                  ? 'bg-blue-50/80 text-blue-900 border border-blue-200/80'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                  {(() => {
                                    if (isEmoji(c.iconName)) {
                                      return <span className="text-sm">{c.iconName}</span>;
                                    }
                                    const CatIcon = ICON_MAP[c.iconName] || Tag;
                                    return <CatIcon className="w-3.5 h-3.5" />;
                                  })()}
                                </div>
                                <span className="text-xs font-bold text-slate-800 truncate">
                                  {c.name}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#007af7] text-white flex items-center justify-center shrink-0 shadow-2xs">
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      {categories.filter((c) =>
                        c.name.toLowerCase().includes(categorySearchQuery.trim().toLowerCase())
                      ).length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-400">
                          No se encontraron categorías
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Tipo de Plan (Obligatorio) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-900">
                  Tipo de Plan <span className="text-red-500 font-black">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  Obligatorio para que los vecinos encuentren este plan
                </span>
              </div>

              <div ref={planCategoryDropdownRef} className="relative">
                <button
                  type="button"
                  id="plan-category-dropdown-trigger"
                  onClick={() => {
                    setIsPlanCategoryDropdownOpen((prev) => !prev);
                    setIsTypeDropdownOpen(false);
                    setIsCategoryDropdownOpen(false);
                    setPlanCategorySearchQuery('');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all shadow-2xs cursor-pointer ${
                    isPlanCategoryDropdownOpen
                      ? 'border-[#007af7] ring-2 ring-[#007af7]/20 bg-white'
                      : !planCategoryId
                      ? 'border-amber-400 bg-amber-50/50 hover:bg-amber-50'
                      : 'border-slate-300 hover:border-[#007af7]/60 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {(() => {
                      const selPlan = planCategories.find((p) => p.id === planCategoryId);
                      if (!selPlan) {
                        return (
                          <>
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Compass className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-amber-900 truncate">
                                Seleccionar Tipo de Plan *
                              </div>
                              <div className="text-[10px] text-amber-700 truncate">
                                Elige la temática en español para este plan o salida
                              </div>
                            </div>
                          </>
                        );
                      }
                      return (
                        <>
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#007af7] flex items-center justify-center shrink-0 shadow-2xs">
                            <PostTypeIconDisplay
                              iconName={selPlan.iconName}
                              fallbackId="other"
                              className="w-4 h-4"
                              emojiClassName="text-sm"
                            />
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-800 truncate">
                              {selPlan.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {selPlan.subtitle || 'Tipo de plan asignado'}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isPlanCategoryDropdownOpen ? 'rotate-180 text-[#007af7]' : ''
                    }`}
                  />
                </button>

                {isPlanCategoryDropdownOpen && (
                  <div
                    id="plan-category-menu"
                    className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    {/* Quick Search */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={planCategorySearchQuery}
                          onChange={(e) => setPlanCategorySearchQuery(e.target.value)}
                          placeholder="Buscar tipo de plan..."
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#007af7]"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Scrollable list */}
                    <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                      {planCategories
                        .filter((p) =>
                          p.name.toLowerCase().includes(planCategorySearchQuery.trim().toLowerCase()) ||
                          (p.subtitle && p.subtitle.toLowerCase().includes(planCategorySearchQuery.trim().toLowerCase()))
                        )
                        .map((p) => {
                          const isSelected = planCategoryId === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setPlanCategoryId(p.id);
                                setIsPlanCategoryDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2.5 transition cursor-pointer active:scale-[0.99] ${
                                isSelected
                                  ? 'bg-blue-50/80 text-blue-900 border border-blue-200/80'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#007af7] flex items-center justify-center shrink-0">
                                  <PostTypeIconDisplay
                                    iconName={p.iconName}
                                    fallbackId="other"
                                    className="w-3.5 h-3.5"
                                    emojiClassName="text-sm"
                                  />
                                </div>
                                <div className="truncate">
                                  <span className="text-xs font-bold text-slate-800 block truncate">
                                    {p.name}
                                  </span>
                                  {p.subtitle && (
                                    <span className="text-[10px] text-slate-400 block truncate">
                                      {p.subtitle}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#007af7] text-white flex items-center justify-center shrink-0 shadow-2xs">
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      {planCategories.filter((p) =>
                        p.name.toLowerCase().includes(planCategorySearchQuery.trim().toLowerCase()) ||
                        (p.subtitle && p.subtitle.toLowerCase().includes(planCategorySearchQuery.trim().toLowerCase()))
                      ).length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-400">
                          No se encontraron tipos de planes
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#007af7] text-xs sm:text-sm font-bold transition flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-98 whitespace-nowrap"
              title="Ver cómo quedará la publicación para los clientes"
            >
              <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#007af7] shrink-0" />
              <span className="hidden xs:inline">Vista previa</span>
              <span className="xs:hidden">Previa</span>
            </button>

            {editingPost && (editingPost.status === 'pending_review' || editingPost.reviewStatus === 'pending') ? (
              <div
                className="px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 cursor-not-allowed opacity-90 select-none whitespace-nowrap shadow-2xs"
                title="Esta publicación ya tiene una corrección en revisión enviada al administrador."
              >
                <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0 text-amber-700 animate-pulse" />
                <span>En Revisión (Enviada)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition shadow-md flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-98 whitespace-nowrap ${
                  editingPost && (editingPost.suspended || editingPost.status === 'suspended')
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                    : 'bg-[#007af7] hover:bg-[#0068d6] shadow-[#007af7]/25'
                }`}
              >
                {editingPost && (editingPost.suspended || editingPost.status === 'suspended') ? (
                  <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {editingPost && (editingPost.suspended || editingPost.status === 'suspended')
                    ? 'Enviar '
                    : 'Confirmar y '}
                </span>
                <span>
                  {editingPost
                    ? editingPost.suspended || editingPost.status === 'suspended'
                      ? 'Corrección a Revisión'
                      : 'Guardar'
                    : 'Publicar'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Customer Preview Modal */}
      {showPreviewModal && (
        <PostDetailModal
          post={getPreviewPost()}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* Image Crop Modal */}
      {isCropModalOpen && !!imageUrl && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          imageUrl={imageUrl}
          onClose={() => setIsCropModalOpen(false)}
          onApplyCrop={handleApplyCrop}
        />
      )}

      {/* Video URL Modal */}
      {showVideoUrlModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-2xs">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">URL del Video</h3>
                  <p className="text-[11px] text-slate-500">Ingresa el enlace directo a tu video</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoUrlModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enlace o URL del video (MP4, WEBM o enlace directo)
                </label>
                <div className="relative flex items-center">
                  <Link2 className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    value={videoUrlInputText}
                    onChange={(e) => setVideoUrlInputText(e.target.value)}
                    placeholder="https://ejemplo.com/videos/mi-video.mp4"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Formatos compatibles: TikTok, YouTube, Vimeo, MP4, WEBM o enlaces directos de video web.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowVideoUrlModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveVideoUrl}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#007af7] hover:bg-blue-600 text-white shadow-sm transition cursor-pointer active:scale-95"
              >
                Cargar Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Video Thumbnail Modal */}
      {showThumbnailModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Miniatura de Portada del Video</h3>
                  <p className="text-[11px] text-slate-500">Imagen que se mostrará antes de que inicie el video</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowThumbnailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Preview of current thumbnail if set */}
              {imageUrl && imageUrl !== videoUrl ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <img
                    src={imageUrl}
                    alt="Miniatura actual"
                    className="w-16 h-10 object-cover rounded-lg shadow-xs border border-emerald-300 shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-emerald-900">Miniatura actual activa</span>
                    <span className="text-[11px] text-emerald-700 truncate">Se mostrará en el feed y portada</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCustomThumbnail}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer"
                    title="Quitar miniatura personalizada"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                  <span className="text-xs text-slate-500">
                    Actualmente no hay miniatura personalizada. El navegador mostrará el primer fotograma del video.
                  </span>
                </div>
              )}

              {/* Subir imagen desde tu dispositivo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Subir imagen desde tu dispositivo
                </label>
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs active:scale-[0.99]"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Seleccionar imagen (JPG, PNG, WEBP)</span>
                </button>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowThumbnailModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white shadow-2xs transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
