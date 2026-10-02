import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Business, LocationCoordinates, BusinessPaymentRecord, BusinessBillingInfo, Post, SubscriptionStatus } from '../../types';
import { EditBusinessImageModal } from '../EditBusinessImageModal';
import { ScheduleSelector } from '../ScheduleSelector';

const LocationPickerModal = React.lazy(() =>
  import('../LocationPickerModal').then((m) => ({ default: m.LocationPickerModal }))
);
import {
  BusinessMainInfoSection,
  BusinessLocationContactSection,
  BusinessCredentialsSection,
} from '../business-form';
import { extractLocalPhone, normalizeToColombianWa } from '../../utils/phoneUtils';
import {
  isSubscriptionActive,
  getSubscriptionDaysExpired,
  getSubscriptionDaysRemaining,
  formatDaysSinRenovarLabel,
} from '../../utils/subscriptionHelper';
import { APP_CONFIG } from '../../config/brand';
import { getPostTypeLabel, getPostTypeBadgeStyle } from '../../utils/postTypeIcons';
import {
  X,
  Store,
  MapPin,
  Map as MapIcon,
  Phone,
  Clock,
  ShieldCheck,
  Check,
  Camera,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Receipt,
  FileText,
  CreditCard,
  Plus,
  Calendar,
  Printer,
  Building2,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Mail,
  ArrowUpRight,
  History,
  Tag,
  Ban,
  AlertTriangle,
  Package,
  MessageCircle,
  Navigation,
  Share2,
  KeyRound,
  Copy,
  EyeOff,
  Send,
  Lock,
} from 'lucide-react';
import { SuspensionTimeline } from '../common/SuspensionTimeline';
import { PostDatesBar } from '../common/PostDatesBar';
import { PostDetailModal } from '../PostDetailModal';
import {
  DEFAULT_PREDEFINED_PASSWORD,
  getNextConsecutiveUsername,
} from '../../utils/credentialUtils';

interface AdminBusinessModalProps {
  isOpen: boolean;
  businessToEdit: Business | null;
  onClose: () => void;
  onSave: (businessData: Partial<Business> & { id?: string }) => void;
}

export const AdminBusinessModal: React.FC<AdminBusinessModalProps> = ({
  isOpen,
  businessToEdit,
  onClose,
  onSave,
}) => {
  const {
    categories,
    municipalities,
    sectors,
    posts,
    businesses,
    postTypes,
    requestPasswordReset,
    updateBusiness,
    updateBusinessCredentials,
  } = useApp();

  const isEditing = !!businessToEdit;

  // Business state
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat_restaurantes');
  const [subCategory, setSubCategory] = useState('');
  const [city, setCity] = useState(municipalities[0]?.name || 'Cajicá');
  const [sector, setSector] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<LocationCoordinates>({
    lat: 4.9184,
    lng: -74.0259,
  });
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [openingHours, setOpeningHours] = useState('Lunes a Sábado: 8:00 AM - 8:00 PM');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Dropdown toggles
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

  // Collapsible section toggles (start reduced/collapsed as requested)
  const [isMainInfoOpen, setIsMainInfoOpen] = useState(false);
  const [isLocationContactOpen, setIsLocationContactOpen] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isUserPassOpen, setIsUserPassOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(DEFAULT_PREDEFINED_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCredential, setCopiedCredential] = useState<'user' | 'pass' | null>(null);
  const [adminPasswordSavedMsg, setAdminPasswordSavedMsg] = useState<string | null>(null);

  const handleDirectAdminPasswordSave = (newPass: string) => {
    const cleanPass = newPass.trim() || DEFAULT_PREDEFINED_PASSWORD;
    setPassword(cleanPass);
    if (isEditing && businessToEdit) {
      businessToEdit.password = cleanPass;
      businessToEdit.accessPassword = cleanPass;

      updateBusinessCredentials(businessToEdit.id, {
        password: cleanPass,
        accessPassword: cleanPass,
      });
      updateBusiness(businessToEdit.id, {
        password: cleanPass,
        accessPassword: cleanPass,
      });

      setAdminPasswordSavedMsg('¡Contraseña actualizada correctamente en el sistema!');
      setTimeout(() => setAdminPasswordSavedMsg(null), 3500);
    }
  };

  const handleCopyCredential = (text: string, type: 'user' | 'pass') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCredential(type);
    setTimeout(() => setCopiedCredential(null), 2000);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPass = `Veci${rand}!`;
    setPassword(newPass);
    setShowPassword(true);
  };

  const handleResetDefaultPassword = () => {
    setPassword(DEFAULT_PREDEFINED_PASSWORD);
    setShowPassword(true);
  };
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isBillingDataOpen, setIsBillingDataOpen] = useState(false);
  const [isBillingHistoryOpen, setIsBillingHistoryOpen] = useState(false);
  const [isBusinessModerationOpen, setIsBusinessModerationOpen] = useState(false);
  const [isPostsModerationOpen, setIsPostsModerationOpen] = useState(false);
  const [isClientPostsOpen, setIsClientPostsOpen] = useState(false);
  const [postsSearchQuery, setPostsSearchQuery] = useState('');
  const [postsTypeFilter, setPostsTypeFilter] = useState<'all' | string>('all');
  const [postsStatusFilter, setPostsStatusFilter] = useState<'all' | 'active' | 'pending_review' | 'suspended'>('all');
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [selectedPostIdForTimeline, setSelectedPostIdForTimeline] = useState<string | null>(null);
  const [expandedPostHistoryIds, setExpandedPostHistoryIds] = useState<Record<string, boolean>>({});

  const togglePostHistory = (postId: string) => {
    setExpandedPostHistoryIds((prev) => ({
      ...prev,
      [postId]: prev[postId] !== undefined ? !prev[postId] : false,
    }));
  };

  const expandAllPostHistories = (posts: Post[]) => {
    const next: Record<string, boolean> = {};
    posts.forEach((p) => {
      next[p.id] = true;
    });
    setExpandedPostHistoryIds(next);
  };

  const collapseAllPostHistories = (posts: Post[]) => {
    const next: Record<string, boolean> = {};
    posts.forEach((p) => {
      next[p.id] = false;
    });
    setExpandedPostHistoryIds(next);
  };

  // Billing state
  const [billingLegalName, setBillingLegalName] = useState('');
  const [billingDocType, setBillingDocType] = useState<'NIT' | 'CC' | 'CE'>('NIT');
  const [billingDocNumber, setBillingDocNumber] = useState('');
  const [billingVerificationDigit, setBillingVerificationDigit] = useState('1');
  const [billingTaxRegime, setBillingTaxRegime] = useState<'simplificado' | 'comun'>('simplificado');
  const [billingEmail, setBillingEmail] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');

  // Subscription state
  const [subPlanName, setSubPlanName] = useState('Plan Mensual OleVeci');
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>('active');
  const [subPriceCOP, setSubPriceCOP] = useState(29900);
  const [subExpiresAt, setSubExpiresAt] = useState('');
  const [subAutoRenew, setSubAutoRenew] = useState(true);

  // Live subscription status calculations for modal UI
  const currentModalSub = useMemo(() => {
    return {
      status: subStatus,
      planName: subPlanName,
      priceCOP: subPriceCOP,
      billingCycle: 'monthly' as const,
      expiresAt: subExpiresAt ? `${subExpiresAt}T23:59:59Z` : '',
      autoRenew: subAutoRenew,
    };
  }, [subStatus, subPlanName, subPriceCOP, subExpiresAt, subAutoRenew]);

  const modalIsActive = useMemo(() => isSubscriptionActive(currentModalSub), [currentModalSub]);
  const modalDaysExpired = useMemo(() => getSubscriptionDaysExpired(currentModalSub), [currentModalSub]);
  const modalDaysRemaining = useMemo(() => getSubscriptionDaysRemaining(currentModalSub), [currentModalSub]);

  // Payment history state
  const [paymentHistory, setPaymentHistory] = useState<BusinessPaymentRecord[]>([]);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<BusinessPaymentRecord | null>(null);

  // New manual payment form state
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayAmount, setNewPayAmount] = useState(29900);
  const [newPayDate, setNewPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [newPayMethod, setNewPayMethod] = useState<'pse' | 'card' | 'nequi' | 'daviplata' | 'transfer' | 'cash'>('nequi');
  const [newPayConcept, setNewPayConcept] = useState('Suscripción Mensual - Plan Mensual OleVeci');
  const [newPayAuth, setNewPayAuth] = useState('');

  // Submodals
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [imageModalConfig, setImageModalConfig] = useState<{
    isOpen: boolean;
    type: 'banner' | 'logo';
  }>({
    isOpen: false,
    type: 'banner',
  });

  // Dropdown outside click refs
  const catRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const sectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
      if (sectorRef.current && !sectorRef.current.contains(e.target as Node)) {
        setIsSectorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lastInitializedIdRef = useRef<string | null>(null);

  // Initialize data on open / businessToEdit change
  useEffect(() => {
    if (!isOpen) {
      lastInitializedIdRef.current = null;
      return;
    }

    const currentTargetId = businessToEdit ? businessToEdit.id : '__new__';
    if (lastInitializedIdRef.current === currentTargetId) {
      // Modal already initialized for this business. Do not overwrite user edits/passwords
      return;
    }
    lastInitializedIdRef.current = currentTargetId;

    // Keep all collapsible sections reduced/collapsed when opening the window
    setIsMainInfoOpen(false);
    setIsLocationContactOpen(false);
    setIsHoursOpen(false);
    setIsSubscriptionOpen(false);
    setIsBillingDataOpen(false);
    setIsBillingHistoryOpen(false);

    if (businessToEdit) {
      setName(businessToEdit.name || '');
      setCategoryId(businessToEdit.categoryId || categories[0]?.id || 'cat_restaurantes');
      setSubCategory(businessToEdit.subCategory || '');
      setCity(businessToEdit.city || municipalities[0]?.name || 'Cajicá');
      setSector(businessToEdit.sector || 'Centro');
      setAddress(businessToEdit.address || '');
      setCoordinates(
        businessToEdit.coordinates?.lat && businessToEdit.coordinates?.lng
          ? businessToEdit.coordinates
          : { lat: 4.9184, lng: -74.0259 }
      );
      setPhone(businessToEdit.phone || '');
      setWhatsapp(extractLocalPhone(businessToEdit.whatsapp || ''));
      setEmail(businessToEdit.email || '');
      setOpeningHours(businessToEdit.hours || 'Lunes a Sábado: 8:00 AM - 8:00 PM');
      setDescription(businessToEdit.description || '');
      setLogo(
        businessToEdit.logo ||
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
      );
      setCoverImage(
        businessToEdit.coverImage ||
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'
      );

      // Usuario y Contraseña
      setUsername(businessToEdit.username || '');
      setPassword(businessToEdit.password || businessToEdit.accessPassword || DEFAULT_PREDEFINED_PASSWORD);

      // Billing info
      setBillingLegalName(
        businessToEdit.billingInfo?.legalName || businessToEdit.name || ''
      );
      setBillingDocType(businessToEdit.billingInfo?.documentType || 'NIT');
      setBillingDocNumber(
        businessToEdit.billingInfo?.documentNumber || '901.458.329'
      );
      setBillingVerificationDigit(
        businessToEdit.billingInfo?.verificationDigit || '1'
      );
      setBillingTaxRegime(
        businessToEdit.billingInfo?.taxRegime || 'simplificado'
      );
      setBillingEmail(
        businessToEdit.billingInfo?.email ||
          businessToEdit.accessEmail ||
          `${businessToEdit.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@oleveci.com`
      );
      setBillingPhone(
        businessToEdit.billingInfo?.phone ||
          businessToEdit.phone ||
          businessToEdit.whatsapp ||
          '3124567890'
      );
      setBillingAddress(
        businessToEdit.billingInfo?.address ||
          businessToEdit.address ||
          'Calle Principal'
      );
      setBillingCity(
        businessToEdit.billingInfo?.city ||
          businessToEdit.city ||
          municipalities[0]?.name ||
          'Cajicá'
      );

      // Subscription
      setSubPlanName(businessToEdit.subscription?.planName || 'Plan Mensual OleVeci');
      setSubStatus(businessToEdit.subscription?.status || 'active');
      setSubPriceCOP(businessToEdit.subscription?.priceCOP || 29900);
      setSubExpiresAt(
        businessToEdit.subscription?.expiresAt
          ? businessToEdit.subscription.expiresAt.slice(0, 10)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      );
      setSubAutoRenew(businessToEdit.subscription?.autoRenew ?? true);

      // Payment History
      if (businessToEdit.paymentHistory && businessToEdit.paymentHistory.length > 0) {
        setPaymentHistory(businessToEdit.paymentHistory);
      } else {
        setPaymentHistory([
          {
            id: `inv-${businessToEdit.id}-09`,
            invoiceNumber: 'FAC-2026-0906',
            date: '2026-09-06',
            planName: businessToEdit.subscription?.planName || 'Plan Mensual OleVeci',
            amountCOP: businessToEdit.subscription?.priceCOP || 29900,
            taxCOP: 4774,
            totalCOP: businessToEdit.subscription?.priceCOP || 29900,
            paymentMethod: 'nequi',
            paymentDetails: {
              phone: businessToEdit.phone || '3124567890',
              authCode: 'AUT-9948210-CO',
            },
            status: 'approved',
          },
          {
            id: `inv-${businessToEdit.id}-08`,
            invoiceNumber: 'FAC-2026-0806',
            date: '2026-08-06',
            planName: businessToEdit.subscription?.planName || 'Plan Mensual OleVeci',
            amountCOP: businessToEdit.subscription?.priceCOP || 29900,
            taxCOP: 4774,
            totalCOP: businessToEdit.subscription?.priceCOP || 29900,
            paymentMethod: 'pse',
            paymentDetails: {
              bankName: 'Bancolombia',
              authCode: 'AUT-7731924-CO',
            },
            status: 'approved',
          },
          {
            id: `inv-${businessToEdit.id}-07`,
            invoiceNumber: 'FAC-2026-0706',
            date: '2026-07-06',
            planName: businessToEdit.subscription?.planName || 'Plan Mensual OleVeci',
            amountCOP: businessToEdit.subscription?.priceCOP || 29900,
            taxCOP: 4774,
            totalCOP: businessToEdit.subscription?.priceCOP || 29900,
            paymentMethod: 'card',
            paymentDetails: {
              cardLast4: '4242',
              authCode: 'AUT-5529148-CO',
            },
            status: 'approved',
          },
        ]);
      }
    } else {
      setName('');
      setCategoryId(categories[0]?.id || 'cat_restaurantes');
      setSubCategory('');
      const defaultCity = municipalities[0]?.name || 'Cajicá';
      setCity(defaultCity);
      const firstSector = sectors.find(
        (s) => s.cityName.toLowerCase() === defaultCity.toLowerCase()
      );
      setSector(firstSector?.name || 'Centro');
      setAddress('');
      setCoordinates({ lat: 4.9184, lng: -74.0259 });
      setPhone('3101234567');
      setWhatsapp('3101234567');
      setEmail('');
      setOpeningHours('Lunes a Sábado: 8:00 AM - 8:00 PM');
      setDescription('');
      setLogo(
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
      );
      setCoverImage(
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'
      );

      setBillingLegalName('');
      setBillingDocType('NIT');
      setBillingDocNumber('901.458.329');
      setBillingVerificationDigit('1');
      setBillingTaxRegime('simplificado');
      setBillingEmail('facturacion@tunegocio.com');
      setBillingPhone('3101234567');
      setBillingAddress('Calle Principal');
      setBillingCity(defaultCity);
      setSubPlanName('Plan Mensual OleVeci');
      setSubStatus('active');
      setSubPriceCOP(29900);
      setSubExpiresAt(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      );
      setSubAutoRenew(true);
      setPaymentHistory([]);

      // Usuario y Contraseña para nuevo comercio
      const nextUser = getNextConsecutiveUsername(businesses);
      setUsername(nextUser);
      setPassword(DEFAULT_PREDEFINED_PASSWORD);
    }
    setIsUserPassOpen(false);
    setShowPassword(false);
    setIsAddingPayment(false);
    setSelectedInvoiceForModal(null);
    setCatSearch('');
    setIsCatDropdownOpen(false);
    setIsCityDropdownOpen(false);
    setIsSectorDropdownOpen(false);
    setIsBusinessModerationOpen(false);
    setIsPostsModerationOpen(false);
    setIsClientPostsOpen(false);
    setPostsSearchQuery('');
    setPostsTypeFilter('all');
    setPostsStatusFilter('all');
    setSelectedPostForDetail(null);
    setSelectedPostIdForTimeline(null);
  }, [businessToEdit, isOpen]);

  const businessPosts = useMemo(() => {
    if (!businessToEdit) return [];
    return posts.filter((p) => p.businessId === businessToEdit.id);
  }, [businessToEdit, posts]);

  const postTypeCounts = useMemo(() => {
    const counts = {
      producto: 0,
      promocion: 0,
      servicio: 0,
      evento: 0,
    };
    businessPosts.forEach((p) => {
      if (counts[p.type as keyof typeof counts] !== undefined) {
        counts[p.type as keyof typeof counts]++;
      }
    });
    return counts;
  }, [businessPosts]);

  const filteredClientPosts = useMemo(() => {
    return businessPosts.filter((p) => {
      // Type filter
      if (postsTypeFilter !== 'all' && p.type !== postsTypeFilter) {
        return false;
      }
      // Status filter
      if (postsStatusFilter !== 'all') {
        if (postsStatusFilter === 'suspended' && !(p.status === 'suspended' || p.suspended)) {
          return false;
        }
        if (postsStatusFilter === 'pending_review' && p.status !== 'pending_review') {
          return false;
        }
        if (postsStatusFilter === 'active' && (p.status === 'suspended' || p.suspended || p.status === 'pending_review')) {
          return false;
        }
      }
      // Search query
      if (postsSearchQuery.trim()) {
        const query = postsSearchQuery.toLowerCase();
        const matchesTitle = p.title?.toLowerCase().includes(query);
        const matchesDesc = p.description?.toLowerCase().includes(query);
        const matchesBadge = p.badge?.toLowerCase().includes(query) || p.type?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesBadge) {
          return false;
        }
      }
      return true;
    });
  }, [businessPosts, postsTypeFilter, postsStatusFilter, postsSearchQuery]);

  const businessPostsWithHistory = useMemo(() => {
    return businessPosts.filter(
      (p) =>
        p.status === 'suspended' ||
        p.suspended ||
        p.status === 'pending_review' ||
        Boolean(p.suspensionReason) ||
        (Array.isArray(p.suspensionHistory) && p.suspensionHistory.length > 0)
    );
  }, [businessPosts]);

  const activePostForTimeline = useMemo(() => {
    if (selectedPostIdForTimeline) {
      const found = businessPostsWithHistory.find((p) => p.id === selectedPostIdForTimeline);
      if (found) return found;
    }
    return businessPostsWithHistory[0] || null;
  }, [businessPostsWithHistory, selectedPostIdForTimeline]);

  const sortedMunicipalities = useMemo(() => {
    return [...municipalities].sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );
  }, [municipalities]);

  // Sectors of selected city (alphabetically sorted)
  const citySectors = useMemo(() => {
    return sectors
      .filter((s) => s.cityName.toLowerCase() === city.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }, [sectors, city]);

  if (!isOpen) return null;

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const matchingSectors = sectors
      .filter((s) => s.cityName.toLowerCase() === newCity.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    setSector(matchingSectors[0]?.name || 'Centro');
  };

  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Fecha no definida';
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleExtendSubscription = (daysToAdd: number) => {
    const currentExp = subExpiresAt ? new Date(`${subExpiresAt}T23:59:59`) : new Date();
    const baseDate = isNaN(currentExp.getTime()) || currentExp.getTime() < Date.now() ? new Date() : currentExp;
    const newDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    setSubExpiresAt(newDate.toISOString().slice(0, 10));
    setSubStatus('active');
  };

  const handleSaveManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const today = newPayDate || new Date().toISOString().slice(0, 10);
    const dateParts = today.split('-');
    const yearMonth = dateParts[0] + (dateParts[1] || '01');
    const invoiceNum = `FAC-${yearMonth}-${Math.floor(1000 + Math.random() * 9000)}`;
    const authCode = newPayAuth.trim() || `AUT-${Math.floor(1000000 + Math.random() * 9000000)}-CO`;
    const amt = Number(newPayAmount) || 29900;
    const tax = Math.round((amt * 0.19) / 1.19);

    const newPayment: BusinessPaymentRecord = {
      id: `inv-manual-${Date.now()}`,
      invoiceNumber: invoiceNum,
      date: today,
      planName: newPayConcept.trim() || subPlanName,
      amountCOP: amt,
      taxCOP: tax,
      totalCOP: amt,
      paymentMethod: newPayMethod,
      paymentDetails: {
        authCode,
      },
      status: 'approved',
    };

    setPaymentHistory([newPayment, ...paymentHistory]);
    handleExtendSubscription(30);
    setIsAddingPayment(false);
    setNewPayAuth('');
  };

  const getPaymentMethodBadge = (method: BusinessPaymentRecord['paymentMethod']) => {
    switch (method) {
      case 'wompi':
        return { label: 'Wompi Bancolombia', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'nequi':
        return { label: 'Nequi', bg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' };
      case 'daviplata':
        return { label: 'Daviplata', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'pse':
        return { label: 'PSE / Bancos', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'card':
        return { label: 'Tarjeta Débito/Crédito', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'transfer':
        return { label: 'Transferencia Directa', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'cash':
        return { label: 'Efectivo en Oficina', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Digital', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Ingresa el nombre comercial del negocio.');
      return;
    }

    const normalizedWa = normalizeToColombianWa(whatsapp);

    const payload: Partial<Business> & { id?: string } = {
      name: name.trim(),
      categoryId,
      subCategory: subCategory.trim() || 'Comercio Local',
      city,
      sector: sector || (citySectors[0]?.name ?? 'Centro'),
      address: address.trim() || 'Calle Principal',
      coordinates,
      phone: phone.trim() || '3100000000',
      whatsapp: normalizedWa || '573100000000',
      email: email.trim() || undefined,
      hours: openingHours.trim(),
      description: description.trim(),
      logo: logo.trim(),
      coverImage: coverImage.trim(),
      billingInfo: {
        legalName: billingLegalName.trim() || name.trim(),
        documentType: billingDocType,
        documentNumber: billingDocNumber.trim() || '901.458.329',
        verificationDigit:
          billingDocType === 'NIT' ? billingVerificationDigit.trim() || '1' : undefined,
        taxRegime: billingTaxRegime,
        email:
          billingEmail.trim() ||
          `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@oleveci.com`,
        phone: billingPhone.trim() || phone.trim() || '3100000000',
        address: billingAddress.trim() || address.trim() || 'Calle Principal',
        city: billingCity.trim() || city,
        department: 'Cundinamarca',
      },
      subscription: {
        status: (subExpiresAt && new Date(`${subExpiresAt}T23:59:59Z`).getTime() < Date.now() && subStatus === 'active')
          ? 'expired'
          : subStatus,
        planName: subPlanName,
        priceCOP: Number(subPriceCOP) || 29900,
        billingCycle: 'monthly',
        expiresAt: new Date(
          subExpiresAt ? `${subExpiresAt}T23:59:59Z` : Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        autoRenew: subAutoRenew,
      },
      paymentHistory,
      username: username || (isEditing && businessToEdit ? businessToEdit.username : getNextConsecutiveUsername(businesses)),
      password: password.trim() || DEFAULT_PREDEFINED_PASSWORD,
      accessPassword: password.trim() || DEFAULT_PREDEFINED_PASSWORD,
    };

    if (isEditing && businessToEdit) {
      payload.id = businessToEdit.id;
    } else {
      payload.verified = true;
      payload.featured = false;
      payload.accessEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@oleveci.com`;
      payload.accessPassword = password.trim() || DEFAULT_PREDEFINED_PASSWORD;
      payload.accessPin = '1234';
      payload.ownerName = name.trim();
      payload.ownerPhone = phone.trim() || '3100000000';
    }

    onSave(payload);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
        <div
          className="bg-slate-50 rounded-3xl max-w-3xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#041f5e] via-[#003780] to-[#007af7] text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shadow-inner text-white">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                  {isEditing ? `Editar Negocio: ${businessToEdit.name}` : 'Inscribir Nuevo Negocio'}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Edita la información pública, ubicación en mapa, horarios y credenciales del comercio
                </p>
              </div>
            </div>
            <button
              type="button"
              id="btn-close-admin-business-modal"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scroll Area */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* ========================================================================= */}
            {/* PORTADA Y LOGOTIPO (LIVE PREVIEW & IMAGE PICKER)                         */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-100 group">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={name || 'Portada'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-101"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />

                {/* Badge live preview & button change banner */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 shadow-xs backdrop-blur-xs">
                    <Sparkles className="w-3 h-3 text-amber-900" />
                    <span>Vista en vivo</span>
                  </span>
                  <button
                    type="button"
                    id="btn-admin-edit-banner"
                    onClick={() => setImageModalConfig({ isOpen: true, type: 'banner' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 shadow-sm transition hover:scale-102 active:scale-98 cursor-pointer"
                    title="Cambiar foto de portada"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-300" />
                    <span>Cambiar Portada</span>
                  </button>
                </div>

                {/* Bottom bar with logo and info */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Logo container with direct edit */}
                    <div className="relative group/logo shrink-0">
                      {logo ? (
                        <img
                          src={logo}
                          alt={name || 'Logo'}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold border-2 border-white shadow-md text-lg">
                          {(name || 'N').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <button
                        type="button"
                        id="btn-admin-edit-logo-overlay"
                        onClick={() => setImageModalConfig({ isOpen: true, type: 'logo' })}
                        className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition duration-150 backdrop-blur-xs text-white cursor-pointer"
                        title="Cambiar logotipo"
                      >
                        <Camera className="w-4 h-4 mb-0.5" />
                        <span className="text-[9px] font-bold">Cambiar</span>
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold drop-shadow-xs truncate">
                          {name || 'Nombre del Negocio'}
                        </h3>
                        {(businessToEdit ? businessToEdit.verified : true) && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full shrink-0">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Verificado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 drop-shadow-xs truncate">
                        {subCategory || 'Especialidad'} · {sector || 'Sector'}, {city || 'Municipio'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setImageModalConfig({ isOpen: true, type: 'logo' })}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition cursor-pointer shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Cambiar Logo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECCIÓN 1: INFORMACIÓN PRINCIPAL (MODULAR COMPONENT)                      */}
            {/* ========================================================================= */}
            <BusinessMainInfoSection
              name={name}
              onChangeName={setName}
              subCategory={subCategory}
              onChangeSubCategory={setSubCategory}
              categoryId={categoryId}
              onChangeCategoryId={setCategoryId}
              description={description}
              onChangeDescription={setDescription}
              categories={categories}
              isOpen={isMainInfoOpen}
              onToggleOpen={() => setIsMainInfoOpen(!isMainInfoOpen)}
              idPrefix="admin-biz-main"
            />

            {/* ========================================================================= */}
            {/* SECCIÓN 2: UBICACIÓN Y CONTACTO (MODULAR COMPONENT)                       */}
            {/* ========================================================================= */}
            <BusinessLocationContactSection
              city={city}
              onChangeCity={(newCity) => handleCityChange(newCity)}
              sector={sector}
              onChangeSector={setSector}
              address={address}
              onChangeAddress={setAddress}
              coordinates={coordinates}
              onOpenMapPicker={() => setIsLocationPickerOpen(true)}
              whatsapp={whatsapp}
              onChangeWhatsapp={setWhatsapp}
              phone={phone}
              onChangePhone={setPhone}
              email={email}
              onChangeEmail={setEmail}
              isOpen={isLocationContactOpen}
              onToggleOpen={() => setIsLocationContactOpen(!isLocationContactOpen)}
              idPrefix="admin-biz-loc"
            />

            {/* ========================================================================= */}
            {/* SECCIÓN 3: HORARIO DE ATENCIÓN (SCHEDULE SELECTOR COMPONENT)             */}
            {/* ========================================================================= */}
            <div
              className={`bg-white rounded-2xl border border-slate-200 shadow-2xs transition-all ${
                isHoursOpen ? 'p-4 sm:p-5 space-y-4' : 'p-3.5 sm:p-4'
              }`}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsHoursOpen(!isHoursOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsHoursOpen(!isHoursOpen);
                  }
                }}
                className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#041f5e] font-extrabold">Horario de atención</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                  {isHoursOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>

              {isHoursOpen && (
                <div className="pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                  <ScheduleSelector
                    value={openingHours}
                    onChange={(newHours) => setOpeningHours(newHours)}
                    embedded={true}
                  />
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* SECCIÓN 4: USUARIO Y CONTRASEÑA (MODULAR COMPONENT)                      */}
            {/* ========================================================================= */}
            <BusinessCredentialsSection
              username={username}
              password={password}
              onChangePassword={setPassword}
              onSavePassword={handleDirectAdminPasswordSave}
              saveButtonText="Guardar Contraseña"
              saveSuccessMessage={adminPasswordSavedMsg}
              role="admin"
              isOpen={isUserPassOpen}
              onToggleOpen={() => setIsUserPassOpen(!isUserPassOpen)}
              idPrefix="admin-biz-creds"
            />

            {/* ========================================================================= */}
            {/* SECCIÓN 5: SUSCRIPCIÓN                                                   */}
            {/* ========================================================================= */}
            <div
              className={`bg-white rounded-2xl border border-slate-200 shadow-2xs transition-all ${
                isSubscriptionOpen ? 'p-4 sm:p-5 space-y-4' : 'p-3.5 sm:p-4'
              }`}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsSubscriptionOpen(!isSubscriptionOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsSubscriptionOpen(!isSubscriptionOpen);
                  }
                }}
                className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-slate-900">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#041f5e] font-extrabold">Suscripción</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                  {isSubscriptionOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>

              {isSubscriptionOpen && (
                <div className="pt-2 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">
                      Estado y configuración del plan
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        !modalIsActive && modalDaysExpired > 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : modalIsActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {!modalIsActive && modalDaysExpired > 0 ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{modalDaysExpired} {modalDaysExpired === 1 ? 'Día' : 'Días'} sin renovar</span>
                        </>
                      ) : modalIsActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Suscripción Activa</span>
                        </>
                      ) : (
                        <span>Pago Pendiente</span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Plan Name */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">
                        Plan Comercial
                      </label>
                      <select
                        value={subPlanName}
                        onChange={(e) => {
                          const newPlan = e.target.value;
                          setSubPlanName(newPlan);
                          if (newPlan.includes('Anual')) setSubPriceCOP(299000);
                          else setSubPriceCOP(29900);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#007af7]"
                      >
                        <option value="Plan Mensual OleVeci">Plan Mensual OleVeci ($29.900/mes)</option>
                        <option value="Plan Anual OleVeci">Plan Anual OleVeci ($299.000/año)</option>
                      </select>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">
                        Estado de Cobro
                      </label>
                      <select
                        value={subStatus}
                        onChange={(e) =>
                          setSubStatus(e.target.value as SubscriptionStatus)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#007af7]"
                      >
                        <option value="active">Activa (Al día)</option>
                        <option value="expired">Vencida (Sin renovar)</option>
                        <option value="pending">Pendiente de Pago</option>
                        <option value="suspended">Suspendida / En Mora</option>
                      </select>
                    </div>

                    {/* Precio COP */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">
                        Tarifa Plan (COP)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={subPriceCOP}
                          onChange={(e) => setSubPriceCOP(Number(e.target.value))}
                          step="1000"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#007af7]"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {formatCOP(subPriceCOP)} {subPlanName.includes('Anual') ? '/ año' : '/ mes'}
                      </span>
                    </div>
                  </div>

                  {/* Vencimiento y Extensiones rápidas */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <label className="font-bold text-slate-700 text-xs whitespace-nowrap">
                        Próximo Vencimiento:
                      </label>
                      <input
                        type="date"
                        value={subExpiresAt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubExpiresAt(val);
                          if (val && new Date(`${val}T23:59:59Z`).getTime() < Date.now()) {
                            setSubStatus('expired');
                          } else if (val && new Date(`${val}T23:59:59Z`).getTime() >= Date.now()) {
                            setSubStatus('active');
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-[#007af7]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 mr-1">
                        Renovación rápida:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleExtendSubscription(30)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#007af7] border border-blue-200 text-[11px] font-bold transition cursor-pointer"
                      >
                        +30 Días
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExtendSubscription(365)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition cursor-pointer"
                      >
                        +1 Año
                      </button>
                    </div>
                  </div>

                  {/* Auto-renew checkbox */}
                  <div className="pt-1 flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subAutoRenew}
                        onChange={(e) => setSubAutoRenew(e.target.checked)}
                        className="w-4 h-4 rounded text-[#007af7] focus:ring-[#007af7]"
                      />
                      <span>Renovación automática habilitada (Recordatorio por correo / WhatsApp)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* SECCIÓN 5: DATOS DE FACTURACIÓN (TAX & FISCAL BILLING DATA)               */}
            {/* ========================================================================= */}
            <div
              className={`bg-white rounded-2xl border border-slate-200 shadow-2xs transition-all ${
                isBillingDataOpen ? 'p-4 sm:p-5 space-y-4' : 'p-3.5 sm:p-4'
              }`}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsBillingDataOpen(!isBillingDataOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsBillingDataOpen(!isBillingDataOpen);
                  }
                }}
                className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-slate-900">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#041f5e] font-extrabold">Datos de facturación</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                  {isBillingDataOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>

              {isBillingDataOpen && (
                <div className="pt-2 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                  {/* Datos Fiscales para Facturación Electrónica DIAN */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <Building2 className="w-4 h-4 text-[#041f5e]" />
                      <span className="text-xs font-extrabold text-[#041f5e]">
                        Datos Fiscales y Tributarios del Negocio (RUT / DIAN)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Razón Social */}
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Razón Social o Nombre Legal (según RUT / Cámara de Comercio)
                        </label>
                        <input
                          type="text"
                          value={billingLegalName}
                          onChange={(e) => setBillingLegalName(e.target.value)}
                          placeholder="Ej: Inversiones Gastronómicas La Brasa S.A.S."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] text-xs text-slate-900 bg-white shadow-2xs"
                        />
                      </div>

                      {/* Tipo de Documento */}
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Tipo de Identificación Fiscal
                        </label>
                        <select
                          value={billingDocType}
                          onChange={(e) =>
                            setBillingDocType(e.target.value as 'NIT' | 'CC' | 'CE')
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#007af7] shadow-2xs"
                        >
                          <option value="NIT">NIT - Número de Identificación Tributaria</option>
                          <option value="CC">C.C. - Cédula de Ciudadanía</option>
                          <option value="CE">C.E. - Cédula de Extranjería</option>
                        </select>
                      </div>

                      {/* Número de Documento + DV */}
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Número de Documento {billingDocType === 'NIT' && 'y Dígito (DV)'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={billingDocNumber}
                            onChange={(e) => setBillingDocNumber(e.target.value)}
                            placeholder="Ej: 901.458.329"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] text-xs text-slate-900 bg-white shadow-2xs"
                          />
                          {billingDocType === 'NIT' && (
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-slate-400 text-xs font-bold">-</span>
                              <input
                                type="text"
                                maxLength={1}
                                value={billingVerificationDigit}
                                onChange={(e) => setBillingVerificationDigit(e.target.value)}
                                placeholder="1"
                                className="w-10 px-2 py-2.5 text-center rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] text-xs font-bold text-slate-900 bg-white shadow-2xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Régimen Tributario */}
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Régimen Tributario
                        </label>
                        <select
                          value={billingTaxRegime}
                          onChange={(e) =>
                            setBillingTaxRegime(e.target.value as 'simplificado' | 'comun')
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#007af7] shadow-2xs"
                        >
                          <option value="simplificado">No responsable de IVA (Régimen Simplificado)</option>
                          <option value="comun">Responsable de IVA (Régimen Común)</option>
                        </select>
                      </div>

                      {/* Correo Electrónico de Facturación */}
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Correo Electrónico de Facturación
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={billingEmail}
                            onChange={(e) => setBillingEmail(e.target.value)}
                            placeholder="facturacion@tunegocio.com"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] text-xs text-slate-900 bg-white shadow-2xs"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Teléfono Fiscal */}
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Teléfono de Contacto Fiscal
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={billingPhone}
                            onChange={(e) => setBillingPhone(e.target.value)}
                            placeholder="3124567890"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] text-xs text-slate-900 bg-white shadow-2xs"
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Ciudad / Municipio Fiscal */}
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Ciudad / Municipio Fiscal
                        </label>
                        <select
                          value={billingCity}
                          onChange={(e) => setBillingCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#007af7] shadow-2xs"
                        >
                          {sortedMunicipalities.map((m) => (
                            <option key={m.id} value={m.name}>
                              {m.name} (Cundinamarca)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dirección Fiscal */}
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Dirección Fiscal Registrada
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            placeholder="Cra. 3 # 4-28, Cajicá"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] text-xs text-slate-900 bg-white shadow-2xs"
                          />
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* SECCIÓN 6: HISTORIAL DE FACTURACIÓN (INVOICE & PAYMENT HISTORY)          */}
            {/* ========================================================================= */}
            <div
              className={`bg-white rounded-2xl border border-slate-200 shadow-2xs transition-all ${
                isBillingHistoryOpen ? 'p-4 sm:p-5 space-y-4' : 'p-3.5 sm:p-4'
              }`}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsBillingHistoryOpen(!isBillingHistoryOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsBillingHistoryOpen(!isBillingHistoryOpen);
                  }
                }}
                className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-slate-900">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#041f5e] font-extrabold">Historial de facturación</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                  {isBillingHistoryOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>

              {isBillingHistoryOpen && (
                <div className="pt-2 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
                  {/* Summary & Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block">
                        Total Facturado Acumulado:
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {formatCOP(
                          paymentHistory.reduce((acc, curr) => acc + (curr.totalCOP || curr.amountCOP || 0), 0)
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingPayment(!isAddingPayment)}
                      className="px-3 py-1.5 rounded-xl bg-[#007af7] hover:bg-blue-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddingPayment ? 'Cerrar Registro' : 'Registrar Pago Manual'}</span>
                    </button>
                  </div>

                  {/* Formulario para registrar pago manual si isAddingPayment es true */}
                  {isAddingPayment && (
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#041f5e] flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#007af7]" />
                          Registrar Nuevo Comprobante de Pago
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Super Administrador
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 text-xs mb-1">
                            Concepto
                          </label>
                          <input
                            type="text"
                            value={newPayConcept}
                            onChange={(e) => setNewPayConcept(e.target.value)}
                            placeholder="Suscripción Mensual - Plan Mensual OleVeci"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#007af7]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 text-xs mb-1">
                            Monto en COP
                          </label>
                          <input
                            type="number"
                            value={newPayAmount}
                            onChange={(e) => setNewPayAmount(Number(e.target.value))}
                            step="1000"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#007af7]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 text-xs mb-1">
                            Fecha del Pago
                          </label>
                          <input
                            type="date"
                            value={newPayDate}
                            onChange={(e) => setNewPayDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#007af7]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 text-xs mb-1">
                            Método de Pago
                          </label>
                          <select
                            value={newPayMethod}
                            onChange={(e) =>
                              setNewPayMethod(
                                e.target.value as
                                  | 'pse'
                                  | 'card'
                                  | 'nequi'
                                  | 'daviplata'
                                  | 'transfer'
                                  | 'cash'
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#007af7]"
                          >
                            <option value="nequi">Nequi</option>
                            <option value="daviplata">Daviplata</option>
                            <option value="pse">PSE / Bancolombia</option>
                            <option value="card">Tarjeta Débito / Crédito</option>
                            <option value="transfer">Transferencia Bancaria Directa</option>
                            <option value="cash">Efectivo en Oficina</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 text-xs mb-1">
                            Código / Referencia de Autorización (opcional)
                          </label>
                          <input
                            type="text"
                            value={newPayAuth}
                            onChange={(e) => setNewPayAuth(e.target.value)}
                            placeholder="Ej: AUT-9923841-CO (dejar vacío para auto-generar)"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#007af7]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
                        <button
                          type="button"
                          onClick={() => setIsAddingPayment(false)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveManualPayment}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Guardar Comprobante & Extender +30 Días</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Listado de Facturas */}
                  {paymentHistory.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
                      <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">
                        No hay facturas registradas para este negocio.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Puedes registrar el primer pago o comprobante de suscripción usando el botón superior.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {paymentHistory.map((invoice) => {
                        const badge = getPaymentMethodBadge(invoice.paymentMethod);
                        return (
                          <div
                            key={invoice.id}
                            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                                  invoice.status === 'rejected'
                                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                                    : invoice.status === 'pending'
                                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                                    : 'bg-blue-50 border-blue-100 text-[#007af7]'
                                }`}
                              >
                                <Receipt className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-black text-slate-900 tracking-wide">
                                    {invoice.invoiceNumber}
                                  </span>
                                  {invoice.status === 'approved' || !invoice.status ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Aprobado
                                    </span>
                                  ) : invoice.status === 'rejected' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                      <AlertCircle className="w-3 h-3 text-rose-600" />
                                      Rechazado
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      Pendiente
                                    </span>
                                  )}
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                                  >
                                    {badge.label}
                                  </span>
                                </div>
                                <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                                  {invoice.planName}
                                </div>
                                {invoice.status === 'rejected' && invoice.paymentDetails?.rejectionReason && (
                                  <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                                    Motivo: {invoice.paymentDetails.rejectionReason}
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-400">
                                  {invoice.status === 'rejected' ? 'Intento fallido: ' : 'Emitido: '}
                                  {formatDateDisplay(invoice.date)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <div className="text-right">
                                <div className={`text-xs font-black ${invoice.status === 'rejected' ? 'text-rose-600' : 'text-slate-900'}`}>
                                  {formatCOP(invoice.totalCOP || invoice.amountCOP)}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {invoice.status === 'rejected' ? 'Sin cobro' : `IVA inc. ${formatCOP(invoice.taxCOP || 0)}`}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceForModal(invoice)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Recibo</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* SECCIÓN 7: PUBLICACIONES DEL CLIENTE (SOLO EDICIÓN)                       */}
            {/* ========================================================================= */}
            {businessToEdit && (
              <div
                className={`bg-white rounded-2xl border border-slate-200 shadow-2xs transition-all ${
                  isClientPostsOpen ? 'p-4 sm:p-5 space-y-4' : 'p-3.5 sm:p-4'
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsClientPostsOpen(!isClientPostsOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsClientPostsOpen(!isClientPostsOpen);
                    }
                  }}
                  className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-slate-900">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[#041f5e] font-extrabold">Publicaciones del cliente</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                    {isClientPostsOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>

                {isClientPostsOpen && (
                  <div className="pt-2 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
                    {businessPosts.length === 0 ? (
                      <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">Este cliente aún no tiene publicaciones registradas</p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Las ofertas, productos o servicios que publique este comercio en la plataforma se verán reflejados aquí.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Search and Filters Bar */}
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={postsSearchQuery}
                              onChange={(e) => setPostsSearchQuery(e.target.value)}
                              placeholder="Buscar publicación por título, detalle o tipo..."
                              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#007af7] focus:ring-1 focus:ring-[#007af7] transition placeholder:text-slate-400"
                            />
                            {postsSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setPostsSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {/* Type filter tabs */}
                            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                              <button
                                type="button"
                                onClick={() => setPostsTypeFilter('all')}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                  postsTypeFilter === 'all'
                                    ? 'bg-[#041f5e] text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Todas ({businessPosts.length})
                              </button>
                              {postTypeCounts.producto > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPostsTypeFilter('producto')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                    postsTypeFilter === 'producto'
                                      ? 'bg-[#041f5e] text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Productos ({postTypeCounts.producto})
                                </button>
                              )}
                              {postTypeCounts.promocion > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPostsTypeFilter('promocion')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                    postsTypeFilter === 'promocion'
                                      ? 'bg-[#041f5e] text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Promociones ({postTypeCounts.promocion})
                                </button>
                              )}
                              {postTypeCounts.servicio > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPostsTypeFilter('servicio')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                    postsTypeFilter === 'servicio'
                                      ? 'bg-[#041f5e] text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Servicios ({postTypeCounts.servicio})
                                </button>
                              )}
                              {postTypeCounts.evento > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPostsTypeFilter('evento')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                    postsTypeFilter === 'evento'
                                      ? 'bg-[#041f5e] text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Eventos ({postTypeCounts.evento})
                                </button>
                              )}
                            </div>

                            {/* Status filter dropdown */}
                            <div className="flex items-center gap-1.5 ml-auto">
                              <span className="text-[11px] text-slate-400 font-medium">Estado:</span>
                              <select
                                value={postsStatusFilter}
                                onChange={(e) => setPostsStatusFilter(e.target.value as any)}
                                className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-hidden cursor-pointer"
                              >
                                <option value="all">Todos</option>
                                <option value="active">Activas</option>
                                <option value="pending_review">En revisión</option>
                                <option value="suspended">Suspendidas</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>
                              Mostrando <strong className="text-slate-700">{filteredClientPosts.length}</strong> de {businessPosts.length} publicaciones
                            </span>
                            {(postsSearchQuery || postsTypeFilter !== 'all' || postsStatusFilter !== 'all') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPostsSearchQuery('');
                                  setPostsTypeFilter('all');
                                  setPostsStatusFilter('all');
                                }}
                                className="text-[#007af7] hover:underline font-bold cursor-pointer"
                              >
                                Restablecer filtros
                              </button>
                            )}
                          </div>
                        </div>

                        {/* List of posts: identical to 'Mi Negocio' / 'BusinessDashboard' */}
                        {filteredClientPosts.length === 0 ? (
                          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                            No se encontraron publicaciones que coincidan con los filtros aplicados.
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                            {filteredClientPosts.map((post) => {
                              const isPendingReview = post.status === 'pending_review' || post.reviewStatus === 'pending';
                              const isSuspended = (post.status === 'suspended' || Boolean(post.suspended)) && !isPendingReview;
                              const isExpired = !isSuspended && !isPendingReview && post.expiresAt && new Date(post.expiresAt).getTime() <= Date.now();

                              return (
                                <div
                                  key={post.id}
                                  className={`p-3.5 sm:p-4 rounded-2xl transition overflow-hidden w-full flex flex-col justify-between gap-3 ${
                                    isPendingReview
                                      ? 'bg-amber-50/95 border-2 border-amber-400 shadow-md ring-2 ring-amber-200/80'
                                      : isSuspended
                                      ? 'bg-red-50/95 border-2 border-red-500 shadow-md ring-2 ring-red-200/80'
                                      : 'bg-white border border-slate-200 shadow-2xs hover:border-blue-200'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
                                    <div className="flex items-start sm:items-center gap-3 min-w-0 w-full flex-1">
                                      {post.imageUrl ? (
                                        <div
                                          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border shrink-0 bg-slate-100 flex items-center justify-center ${
                                            isPendingReview
                                              ? 'border-2 border-amber-400 ring-1 ring-amber-300'
                                              : isSuspended
                                              ? 'border-2 border-red-400 ring-1 ring-red-300'
                                              : 'border-slate-200'
                                          }`}
                                        >
                                          <img
                                            src={post.imageUrl}
                                            alt=""
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                              (e.currentTarget as HTMLElement).style.display = 'none';
                                            }}
                                            className={`w-full h-full ${post.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                                            style={{
                                              objectPosition: post.imagePosition
                                                ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                                                : '50% 50%',
                                              transform: post.imageScale && post.imageScale !== 1 ? `scale(${post.imageScale})` : undefined,
                                              transformOrigin: post.imagePosition
                                                ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                                                : '50% 50%',
                                              filter: post.imageFilter && post.imageFilter !== 'none' ? post.imageFilter : undefined,
                                            }}
                                          />
                                          <Tag className="w-5 h-5 text-slate-300 absolute" />
                                        </div>
                                      ) : (
                                        <div
                                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex flex-col items-center justify-center shrink-0 text-[10px] font-bold ${
                                            isPendingReview
                                              ? 'bg-amber-100 border-amber-300 text-amber-700'
                                              : isSuspended
                                              ? 'bg-red-100 border-red-300 text-red-600'
                                              : 'bg-slate-100 border-slate-200 text-slate-400'
                                          }`}
                                        >
                                          <Tag className="w-4 h-4 text-slate-300 mb-0.5" />
                                          <span>Sin foto</span>
                                        </div>
                                      )}

                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 shadow-2xs ${getPostTypeBadgeStyle(
                                              post.type,
                                              postTypes
                                            )}`}
                                          >
                                            {getPostTypeLabel(post.type, postTypes)}
                                          </span>
                                          {isPendingReview ? (
                                            <span className="text-[10px] font-black text-amber-950 bg-amber-200 border border-amber-400 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 shadow-2xs">
                                              <Clock className="w-3 h-3 text-amber-800 animate-pulse" />
                                              EN REVISIÓN POR ADMINISTRADOR
                                            </span>
                                          ) : isSuspended ? (
                                            <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 shadow-2xs">
                                              <Ban className="w-3 h-3 text-white" />
                                              SUSPENDIDA POR POLÍTICAS
                                            </span>
                                          ) : isExpired ? (
                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md shrink-0">
                                              Vencida (Fuera del feed)
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                                              Activa en Feed
                                            </span>
                                          )}
                                        </div>

                                        <h4
                                          className="text-sm font-bold text-slate-900 truncate block mt-1 max-w-full"
                                          title={post.title}
                                        >
                                          {post.title}
                                        </h4>

                                        <div className="text-xs font-semibold text-[#041f5e] mt-1 flex items-baseline gap-1.5">
                                          <span>
                                            {post.promotionalPrice
                                              ? `$${post.promotionalPrice.toLocaleString('es-CO')} COP`
                                              : post.price
                                              ? `$${post.price.toLocaleString('es-CO')} COP`
                                              : 'Sin precio'}
                                          </span>
                                          {post.originalPrice &&
                                            (post.promotionalPrice || post.price) &&
                                            post.originalPrice > (post.promotionalPrice || post.price || 0) && (
                                              <span className="text-[10px] text-slate-400 line-through font-normal">
                                                ${post.originalPrice.toLocaleString('es-CO')} COP
                                              </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                                          <span className="inline-flex items-center gap-1 text-slate-600 font-semibold shrink-0" title="Vistas">
                                            <Eye className="w-3.5 h-3.5 text-sky-500" />
                                            <span>{post.metrics?.views || 0}</span>
                                          </span>
                                          <span className="text-slate-300">·</span>
                                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold shrink-0" title="WhatsApp Directo">
                                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>{post.metrics?.whatsappClicks || 0}</span>
                                          </span>
                                          <span className="text-slate-300">·</span>
                                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold shrink-0" title="Cómo llegar (Maps)">
                                            <Navigation className="w-3.5 h-3.5 text-amber-600" />
                                            <span>{post.metrics?.mapsClicks || 0}</span>
                                          </span>
                                          <span className="text-slate-300">·</span>
                                          <span className="inline-flex items-center gap-1 text-blue-700 font-semibold shrink-0" title="Llamadas">
                                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                                            <span>{post.metrics?.calls || 0}</span>
                                          </span>
                                          <span className="text-slate-300">·</span>
                                          <span className="inline-flex items-center gap-1 text-purple-700 font-semibold shrink-0" title="Compartidos">
                                            <Share2 className="w-3.5 h-3.5 text-purple-600" />
                                            <span>{post.metrics?.shares || 0}</span>
                                          </span>
                                        </div>

                                        {/* Fechas de Publicación */}
                                        <PostDatesBar post={post} isExpired={isExpired} />
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedPostForDetail(post)}
                                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-[#041f5e] hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
                                        title="Previsualizar cómo la ven los usuarios"
                                      >
                                        <Eye className="w-4 h-4" />
                                        <span className="hidden sm:inline">Ver publicación</span>
                                      </button>

                                      {(post.status === 'suspended' ||
                                        Boolean(post.suspended) ||
                                        post.status === 'pending_review' ||
                                        Boolean(post.suspensionReason) ||
                                        (Array.isArray(post.suspensionHistory) && post.suspensionHistory.length > 0)) && (
                                        <button
                                          type="button"
                                          onClick={() => togglePostHistory(post.id)}
                                          className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs ${
                                            expandedPostHistoryIds[post.id]
                                              ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                                              : 'border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100/80 font-bold'
                                          }`}
                                          title={expandedPostHistoryIds[post.id] ? 'Reducir histórico de moderación' : 'Ampliar histórico de moderación'}
                                        >
                                          <History className="w-4 h-4 text-amber-700" />
                                          <span className="hidden sm:inline">
                                            {expandedPostHistoryIds[post.id] ? 'Reducir histórico' : 'Ampliar histórico'}
                                          </span>
                                          {expandedPostHistoryIds[post.id] ? (
                                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                          ) : (
                                            <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Moderation History if expanded in Section 7 */}
                                  {expandedPostHistoryIds[post.id] && (
                                    <div className="pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                                      <SuspensionTimeline
                                        post={post}
                                        collapsible={true}
                                        isExpanded={expandedPostHistoryIds[post.id]}
                                        onToggleExpand={() => togglePostHistory(post.id)}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECCIÓN 8: HISTÓRICO DE MODERACIÓN DEL COMERCIO (SOLO EDICIÓN)           */}
            {/* ========================================================================= */}
            {businessToEdit && (
              <div
                className={`bg-white rounded-2xl border border-slate-200 shadow-2xs transition-all ${
                  isBusinessModerationOpen ? 'p-4 sm:p-5 space-y-4' : 'p-3.5 sm:p-4'
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsBusinessModerationOpen(!isBusinessModerationOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsBusinessModerationOpen(!isBusinessModerationOpen);
                    }
                  }}
                  className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-slate-900">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[#041f5e] font-extrabold">Histórico de moderación del comercio</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                    {isBusinessModerationOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>

                {isBusinessModerationOpen && (
                  <div className="pt-2 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
                    <SuspensionTimeline business={businessToEdit} />
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECCIÓN 9: HISTÓRICO DE MODERACIÓN DE LAS PUBLICACIONES (SOLO EDICIÓN)    */}
            {/* ========================================================================= */}
            {businessToEdit && (
              <div
                className={`bg-white rounded-2xl border border-slate-200 shadow-2xs transition-all ${
                  isPostsModerationOpen ? 'p-4 sm:p-5 space-y-4' : 'p-3.5 sm:p-4'
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsPostsModerationOpen(!isPostsModerationOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsPostsModerationOpen(!isPostsModerationOpen);
                    }
                  }}
                  className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-slate-900">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[#041f5e] font-extrabold">Histórico de moderación de las publicaciones</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                    {isPostsModerationOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>

                {isPostsModerationOpen && (
                  <div className="pt-2 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
                    {businessPostsWithHistory.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 space-y-1">
                        <p className="font-bold text-slate-700">Ninguna publicación presenta novedades de moderación</p>
                        <p className="text-slate-500">
                          Todas las ofertas y productos de este comercio cumplen con las normativas comunitarias y no registran suspensiones ni observaciones.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {businessPostsWithHistory.length > 1 && (
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                            <span className="font-semibold text-slate-700">
                              Mostrando <strong className="text-[#041f5e]">{businessPostsWithHistory.length}</strong> publicaciones con registros de moderación
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => expandAllPostHistories(businessPostsWithHistory)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                              >
                                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                <span>Ampliar todas</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => collapseAllPostHistories(businessPostsWithHistory)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                              >
                                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                <span>Reducir todas</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          {businessPostsWithHistory.map((post) => {
                            const isExpanded = expandedPostHistoryIds[post.id] ?? true;
                            const isPendingReview = post.status === 'pending_review' || post.reviewStatus === 'pending';
                            const isSuspended = (post.status === 'suspended' || Boolean(post.suspended)) && !isPendingReview;
                            const isExpired = !isSuspended && !isPendingReview && post.expiresAt && new Date(post.expiresAt).getTime() <= Date.now();
                            const eventCount = (Array.isArray(post.suspensionHistory) && post.suspensionHistory.length > 0)
                              ? post.suspensionHistory.length
                              : 1;

                            return (
                              <div
                                key={post.id}
                                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition hover:shadow-xs"
                              >
                                {/* Publication Card: identical to 'Publicaciones del cliente' */}
                                <div
                                  className={`p-3.5 sm:p-4 transition w-full flex flex-col justify-between gap-3 ${
                                    isPendingReview
                                      ? 'bg-amber-50/95 border-b-2 border-amber-300'
                                      : isSuspended
                                      ? 'bg-red-50/95 border-b-2 border-red-300'
                                      : 'bg-white border-b border-slate-100'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
                                    <div className="flex items-start sm:items-center gap-3 min-w-0 w-full flex-1">
                                      {post.imageUrl ? (
                                        <div
                                          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border shrink-0 bg-slate-100 flex items-center justify-center ${
                                            isPendingReview
                                              ? 'border-2 border-amber-400 ring-1 ring-amber-300'
                                              : isSuspended
                                              ? 'border-2 border-red-400 ring-1 ring-red-300'
                                              : 'border-slate-200'
                                          }`}
                                        >
                                          <img
                                            src={post.imageUrl}
                                            alt=""
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                              (e.currentTarget as HTMLElement).style.display = 'none';
                                            }}
                                            className={`w-full h-full ${post.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                                            style={{
                                              objectPosition: post.imagePosition
                                                ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                                                : '50% 50%',
                                              transform: post.imageScale && post.imageScale !== 1 ? `scale(${post.imageScale})` : undefined,
                                              transformOrigin: post.imagePosition
                                                ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                                                : '50% 50%',
                                              filter: post.imageFilter && post.imageFilter !== 'none' ? post.imageFilter : undefined,
                                            }}
                                          />
                                          <Tag className="w-5 h-5 text-slate-300 absolute" />
                                        </div>
                                      ) : (
                                        <div
                                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex flex-col items-center justify-center shrink-0 text-[10px] font-bold ${
                                            isPendingReview
                                              ? 'bg-amber-100 border-amber-300 text-amber-700'
                                              : isSuspended
                                              ? 'bg-red-100 border-red-300 text-red-600'
                                              : 'bg-slate-100 border-slate-200 text-slate-400'
                                          }`}
                                        >
                                          <Tag className="w-4 h-4 text-slate-300 mb-0.5" />
                                          <span>Sin foto</span>
                                        </div>
                                      )}

                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 shadow-2xs ${getPostTypeBadgeStyle(
                                              post.type,
                                              postTypes
                                            )}`}
                                          >
                                            {getPostTypeLabel(post.type, postTypes)}
                                          </span>
                                          {isPendingReview ? (
                                            <span className="text-[10px] font-black text-amber-950 bg-amber-200 border border-amber-400 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 shadow-2xs">
                                              <Clock className="w-3 h-3 text-amber-800 animate-pulse" />
                                              EN REVISIÓN POR ADMINISTRADOR
                                            </span>
                                          ) : isSuspended ? (
                                            <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 shadow-2xs">
                                              <Ban className="w-3 h-3 text-white" />
                                              SUSPENDIDA POR POLÍTICAS
                                            </span>
                                          ) : isExpired ? (
                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md shrink-0">
                                              Vencida (Fuera del feed)
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                                              Activa en Feed
                                            </span>
                                          )}
                                        </div>

                                        <h4
                                          className="text-sm font-bold text-slate-900 truncate block mt-1 max-w-full"
                                          title={post.title}
                                        >
                                          {post.title}
                                        </h4>

                                        <div className="text-xs font-semibold text-[#041f5e] mt-1 flex items-baseline gap-1.5">
                                          <span>
                                            {post.promotionalPrice
                                              ? `$${post.promotionalPrice.toLocaleString('es-CO')} COP`
                                              : post.price
                                              ? `$${post.price.toLocaleString('es-CO')} COP`
                                              : 'Sin precio'}
                                          </span>
                                          {post.originalPrice &&
                                            (post.promotionalPrice || post.price) &&
                                            post.originalPrice > (post.promotionalPrice || post.price || 0) && (
                                              <span className="text-[10px] text-slate-400 line-through font-normal">
                                                ${post.originalPrice.toLocaleString('es-CO')} COP
                                              </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                                          <span className="inline-flex items-center gap-1 text-slate-600 font-semibold shrink-0" title="Vistas">
                                            <Eye className="w-3.5 h-3.5 text-sky-500" />
                                            <span>{post.metrics?.views || 0}</span>
                                          </span>
                                          <span className="text-slate-300">·</span>
                                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold shrink-0" title="WhatsApp Directo">
                                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>{post.metrics?.whatsappClicks || 0}</span>
                                          </span>
                                          <span className="text-slate-300">·</span>
                                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold shrink-0" title="Cómo llegar (Maps)">
                                            <Navigation className="w-3.5 h-3.5 text-amber-600" />
                                            <span>{post.metrics?.mapsClicks || 0}</span>
                                          </span>
                                          <span className="text-slate-300">·</span>
                                          <span className="inline-flex items-center gap-1 text-blue-700 font-semibold shrink-0" title="Llamadas">
                                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                                            <span>{post.metrics?.calls || 0}</span>
                                          </span>
                                          <span className="text-slate-300">·</span>
                                          <span className="inline-flex items-center gap-1 text-purple-700 font-semibold shrink-0" title="Compartidos">
                                            <Share2 className="w-3.5 h-3.5 text-purple-600" />
                                            <span>{post.metrics?.shares || 0}</span>
                                          </span>
                                        </div>

                                        {/* Fechas de Publicación */}
                                        <PostDatesBar post={post} isExpired={isExpired} />
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedPostForDetail(post)}
                                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-[#041f5e] hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
                                        title="Previsualizar cómo la ven los usuarios"
                                      >
                                        <Eye className="w-4 h-4" />
                                        <span className="hidden sm:inline">Ver publicación</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Histórico de Moderación / SuspensionTimeline */}
                                <div className="p-3.5 sm:p-4 bg-slate-50/40 border-t border-slate-100">
                                  <SuspensionTimeline
                                    post={post}
                                    collapsible={true}
                                    isExpanded={isExpanded}
                                    onToggleExpand={() => togglePostHistory(post.id)}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#007af7] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Negocio'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Submodal 3: Comprobante Oficial de Pago / Factura Viewer */}
      {selectedInvoiceForModal && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setSelectedInvoiceForModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-5 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del recibo */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center font-black text-base shadow-sm">
                  OV
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">
                    OleVeci Colombia
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    NIT: 901.882.114-5 • Cajicá, Cundinamarca
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Plataforma Oficial de Comercios & Negocios de la Sabana
                  </p>
                </div>
              </div>

              <div className="text-right">
                {selectedInvoiceForModal.status === 'approved' || !selectedInvoiceForModal.status ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PAGADO
                  </span>
                ) : selectedInvoiceForModal.status === 'rejected' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5" />
                    RECHAZADO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    PENDIENTE
                  </span>
                )}
                <span className="block text-[11px] font-mono text-slate-500 font-bold mt-1">
                  {selectedInvoiceForModal.invoiceNumber}
                </span>
              </div>
            </div>

            {selectedInvoiceForModal.status === 'rejected' && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">Transacción no completada</span>
                  <span className="text-[11px]">
                    {selectedInvoiceForModal.paymentDetails?.rejectionReason ||
                      'La transacción fue rechazada por la entidad emisora o fondos insuficientes. No se generó cargo a la cuenta.'}
                  </span>
                </div>
              </div>
            )}

            {/* Datos del Cliente y de la Transacción */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Facturado a:
                </span>
                <span className="font-extrabold text-slate-900 block mt-0.5">
                  {billingLegalName || name || 'Comercio Local'}
                </span>
                <span className="text-slate-600 block text-[11px]">
                  {billingDocType}: {billingDocNumber}{' '}
                  {billingDocType === 'NIT' && billingVerificationDigit ? `-${billingVerificationDigit}` : ''}
                </span>
                <span className="text-slate-500 block text-[11px] truncate">
                  {billingEmail}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Detalles del Pago:
                </span>
                <span className="text-slate-700 block mt-0.5 text-[11px]">
                  Fecha:{' '}
                  <strong className="text-slate-900 font-bold">
                    {formatDateDisplay(selectedInvoiceForModal.date)}
                  </strong>
                </span>
                <span className="text-slate-700 block text-[11px]">
                  Medio:{' '}
                  <strong className="text-slate-900 font-bold capitalize">
                    {getPaymentMethodBadge(selectedInvoiceForModal.paymentMethod).label}
                  </strong>
                </span>
                <span className="text-slate-500 block text-[10px] font-mono mt-0.5 truncate">
                  Autorización: {selectedInvoiceForModal.paymentDetails?.authCode || 'AUT-7782190-CO'}
                </span>
              </div>
            </div>

            {/* Tabla de Conceptos */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="px-3 py-2.5">Descripción del Servicio</th>
                    <th className="px-3 py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-3 py-2.5 text-slate-800">
                      <span className="font-bold block text-slate-900">
                        {selectedInvoiceForModal.planName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Membresía activa en el directorio municipal de la Sabana Centro
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-800">
                      {formatCOP(
                        (selectedInvoiceForModal.totalCOP || selectedInvoiceForModal.amountCOP) -
                          (selectedInvoiceForModal.taxCOP || 0)
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 text-slate-500 text-[11px]">IVA DIAN (19%)</td>
                    <td className="px-3 py-1.5 text-right text-slate-600 text-[11px]">
                      {formatCOP(selectedInvoiceForModal.taxCOP || 0)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/80 font-black text-slate-900">
                    <td className="px-3 py-2.5 text-sm">
                      {selectedInvoiceForModal.status === 'rejected' ? 'TOTAL INTENTADO' : 'TOTAL PAGADO'}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right text-sm ${
                        selectedInvoiceForModal.status === 'rejected' ? 'text-rose-600' : 'text-[#007af7]'
                      }`}
                    >
                      {formatCOP(selectedInvoiceForModal.totalCOP || selectedInvoiceForModal.amountCOP)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer del recibo con botones */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400">
                Documento soporte equivalente generado electrónicamente.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForModal(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submodal 1: Interactive Leaflet Map Picker */}
      {isLocationPickerOpen && (
        <React.Suspense fallback={null}>
          <LocationPickerModal
            isOpen={isLocationPickerOpen}
            onClose={() => setIsLocationPickerOpen(false)}
            cityName={city}
            sectorName={sector}
            businessName={name}
            initialAddress={address}
            initialCoordinates={coordinates}
            onSelectLocation={(selectedAddress, selectedCoords) => {
              setAddress(selectedAddress);
              setCoordinates(selectedCoords);
              setIsLocationPickerOpen(false);
            }}
          />
        </React.Suspense>
      )}

      {/* Submodal 2: Banner / Logo Image Editor with AI, Upload & Cropping */}
      {imageModalConfig.isOpen && (
        <EditBusinessImageModal
          isOpen={imageModalConfig.isOpen}
          type={imageModalConfig.type}
          currentImage={imageModalConfig.type === 'banner' ? coverImage : logo}
          businessName={name || 'Comercio'}
          onClose={() => setImageModalConfig((prev) => ({ ...prev, isOpen: false }))}
          onSave={(newImageUrl) => {
            if (imageModalConfig.type === 'banner') {
              setCoverImage(newImageUrl);
            } else {
              setLogo(newImageUrl);
            }
            setImageModalConfig((prev) => ({ ...prev, isOpen: false }));
          }}
        />
      )}

      {/* Submodal 3: Post Detail Preview Modal */}
      {selectedPostForDetail && (
        <PostDetailModal
          post={selectedPostForDetail}
          onClose={() => setSelectedPostForDetail(null)}
        />
      )}
    </>
  );
};
