import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config/brand';
import { Post, Business, LocationCoordinates, BusinessPaymentRecord } from '../types';
import { CreatePostModal } from './CreatePostModal';
import { ScheduleSelector } from './ScheduleSelector';
import { ScheduleReadOnlyTable } from './ScheduleReadOnlyTable';
import { EditBusinessImageModal } from './EditBusinessImageModal';
import { BusinessLocationMapModal } from './BusinessLocationMapModal';

const LocationPickerModal = React.lazy(() =>
  import('./LocationPickerModal').then((m) => ({ default: m.LocationPickerModal }))
);
import { OleVeciIcon } from './OleVeciLogo';
import { BusinessMetricsDashboard } from './BusinessMetricsDashboard';
import { formatColombianPhone, extractLocalPhone, normalizeToColombianWa } from '../utils/phoneUtils';
import { getBusinessSuspensionGuide } from '../utils/businessSuspensionGuide';
import { SuspensionTimeline } from './common/SuspensionTimeline';
import { PostDatesBar } from './common/PostDatesBar';
import { NotificationsModal, NotificationItemData } from './common/NotificationsModal';
import {
  Store,
  Plus,
  Eye,
  MessageCircle,
  MessageSquare,
  Navigation,
  Phone,
  Share2,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Trash2,
  Edit3,
  TrendingUp,
  ShieldCheck,
  Building2,
  ExternalLink,
  LayoutDashboard,
  FileText,
  MapPin,
  Map as MapIcon,
  Check,
  Sparkles,
  Camera,
  Tag,
  Layers,
  History,
  ChevronDown,
  ChevronUp,
  Search,
  Receipt,
  Download,
  HelpCircle,
  Zap,
  Printer,
  ArrowRight,
  X,
  LogOut,
  Ban,
  Bell,
  Save,
  Send,
  Loader2,
  Copy,
  Mail,
  Lock,
  KeyRound,
  EyeOff,
} from 'lucide-react';
import { openWompiCheckoutModal, WOMPI_CONFIG } from '../utils/wompi';
import { DEFAULT_PREDEFINED_PASSWORD } from '../utils/credentialUtils';
import {
  BusinessMainInfoSection,
  BusinessLocationContactSection,
  BusinessCredentialsSection,
} from './business-form';
import { getPostTypeLabel, getPostTypeBadgeStyle } from '../utils/postTypeIcons';

interface BusinessDashboardProps {
  onOpenCreatePost: () => void;
  onSelectPost: (post: Post) => void;
  onOpenAuthScreen?: (tab: 'login' | 'register') => void;
}

type BusinessSubSection = 'posts' | 'dashboard' | 'info' | 'subscription';

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  onOpenCreatePost,
  onSelectPost,
  onOpenAuthScreen,
}) => {
  const {
    businesses,
    posts,
    currentBusinessId,
    setCurrentBusinessId,
    authenticatedBusinessId,
    logoutBusiness,
    deletePost,
    renewBusinessSubscription,
    addBusinessPaymentRecord,
    updateBusiness,
    updateBusinessCredentials,
    requestPasswordReset,
    submitBusinessCorrection,
    sectors,
    categories,
    postTypes,
    isPostActive,
    businessNotifications,
    markBusinessNotificationAsRead,
    deleteBusinessNotification,
    clearBusinessNotifications,
  } = useApp();

  const [activeTab, setActiveTab] = useState<BusinessSubSection>('posts');
  const [postFilter, setPostFilter] = useState<
    'all' | 'active' | 'expired' | 'suspended' | 'pending_review'
  >('all');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showBusinessReviewModal, setShowBusinessReviewModal] = useState(false);
  const [isSanitationExpanded, setIsSanitationExpanded] = useState(true);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [isReviewDraftSaved, setIsReviewDraftSaved] = useState(false);
  const [businessCorrectionNote, setBusinessCorrectionNote] = useState('');
  const [showSuspensionHistory, setShowSuspensionHistory] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isWompiLoading, setIsWompiLoading] = useState(false);
  const [wompiError, setWompiError] = useState<string | null>(null);
  const [wompiPendingNotice, setWompiPendingNotice] = useState<string | null>(null);
  const [lastWompiTx, setLastWompiTx] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const business =
    businesses.find((b) => b.id === (authenticatedBusinessId || currentBusinessId)) || businesses[0];

  // Profile edit local state
  const [profileName, setProfileName] = useState(business?.name || '');
  const [profileSubCategory, setProfileSubCategory] = useState(business?.subCategory || '');
  const [profileCategoryId, setProfileCategoryId] = useState(business?.categoryId || '');
  const [profileLogo, setProfileLogo] = useState(business?.logo || '');
  const [profileCoverImage, setProfileCoverImage] = useState(business?.coverImage || '');
  const [profileAddress, setProfileAddress] = useState(business?.address || '');
  const [profileCity, setProfileCity] = useState(business?.city || 'Cajicá');
  const [profileSector, setProfileSector] = useState(business?.sector || 'Centro');
  const [profileCoordinates, setProfileCoordinates] = useState<LocationCoordinates>(
    business?.coordinates?.lat && business?.coordinates?.lng
      ? business.coordinates
      : { lat: 4.9288, lng: -74.0252 }
  );
  const [profileWhatsapp, setProfileWhatsapp] = useState(extractLocalPhone(business?.whatsapp || ''));
  const [profilePhone, setProfilePhone] = useState(business?.phone || '');
  const [profileEmail, setProfileEmail] = useState(business?.email || business?.accessEmail || '');
  const [profileHours, setProfileHours] = useState(business?.hours || '');
  const [profileDesc, setProfileDesc] = useState(business?.description || '');

  // Collapsible section toggles matching Horario de Atención
  const [isMainInfoOpen, setIsMainInfoOpen] = useState(false);
  const [isLocationContactOpen, setIsLocationContactOpen] = useState(false);
  const [isReadOnlyHoursOpen, setIsReadOnlyHoursOpen] = useState(false);

  // Subscription tab collapsible submodules
  const [isBillingTaxOpen, setIsBillingTaxOpen] = useState(false);
  const [isBillingHistoryOpen, setIsBillingHistoryOpen] = useState(false);
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  // Modal to edit banner or logo
  const [imageModalConfig, setImageModalConfig] = useState<{
    isOpen: boolean;
    type: 'banner' | 'logo';
  } | null>(null);

  // Modal to select location on interactive map (Edit mode)
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  // Modal to view business location with OleVeci pin and directions (View mode)
  const [isViewMapModalOpen, setIsViewMapModalOpen] = useState(false);

  // Custom modern dropdown states & click outside handlers
  const [isProfileCatOpen, setIsProfileCatOpen] = useState(false);
  const [profileCatSearch, setProfileCatSearch] = useState('');
  const profileCatRef = useRef<HTMLDivElement>(null);

  const [isProfileCityOpen, setIsProfileCityOpen] = useState(false);
  const profileCityRef = useRef<HTMLDivElement>(null);

  const [isProfileSectorOpen, setIsProfileSectorOpen] = useState(false);
  const profileSectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileCatRef.current && !profileCatRef.current.contains(e.target as Node)) {
        setIsProfileCatOpen(false);
      }
      if (profileCityRef.current && !profileCityRef.current.contains(e.target as Node)) {
        setIsProfileCityOpen(false);
      }
      if (profileSectorRef.current && !profileSectorRef.current.contains(e.target as Node)) {
        setIsProfileSectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subscription & Billing local state
  const [selectedInvoice, setSelectedInvoice] = useState<BusinessPaymentRecord | null>(null);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [billingNit, setBillingNit] = useState('901.458.329-1');
  const [billingEmail, setBillingEmail] = useState(
    `facturacion@${(business?.name || 'comercio').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
  );
  const [billingAddress, setBillingAddress] = useState(
    `${business?.address || 'Carrera 4 # 3-21'}, ${business?.city || 'Cajicá'}`
  );
  const [billingSavedToast, setBillingSavedToast] = useState(false);
  const [quickRenewToast, setQuickRenewToast] = useState(false);

  // Usuario y Contraseña section states
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [isReadOnlyCredsOpen, setIsReadOnlyCredsOpen] = useState(false);
  const [profilePassword, setProfilePassword] = useState(
    business?.password || DEFAULT_PREDEFINED_PASSWORD
  );
  const [showPassword, setShowPassword] = useState(false);

  // States for changing password directly from profile
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmPasswordVal, setConfirmPasswordVal] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

  // Keep form in sync when changing selected business
  useEffect(() => {
    if (business) {
      setProfileName(business.name || '');
      setProfileSubCategory(business.subCategory || '');
      setProfileCategoryId(business.categoryId || '');
      setProfileLogo(business.logo || '');
      setProfileCoverImage(business.coverImage || '');
      setProfileAddress(business.address || '');
      setProfileCity(business.city || 'Cajicá');
      setProfileSector(business.sector || 'Centro');
      setProfileCoordinates(
        business.coordinates?.lat && business.coordinates?.lng
          ? business.coordinates
          : { lat: 4.9288, lng: -74.0252 }
      );
      setProfileWhatsapp(extractLocalPhone(business.whatsapp || ''));
      setProfilePhone(business.phone || '');
      setProfileEmail(business.email || business.accessEmail || '');
      setProfileHours(business.hours || '');
      setProfileDesc(business.description || '');
      setProfilePassword(business.password || business.accessPassword || DEFAULT_PREDEFINED_PASSWORD);
      setPasswordChangeError(null);
      setPasswordChangeSuccess(null);
    }
  }, [business?.id, business?.logo, business?.coverImage]);

  // Cancel edit helper to reset draft values back to business values
  const handleCancelEdit = () => {
    if (business) {
      setProfileName(business.name || '');
      setProfileSubCategory(business.subCategory || '');
      setProfileCategoryId(business.categoryId || '');
      setProfileLogo(business.logo || '');
      setProfileCoverImage(business.coverImage || '');
      setProfileAddress(business.address || '');
      setProfileCity(business.city || 'Cajicá');
      setProfileSector(business.sector || 'Centro');
      setProfileCoordinates(
        business.coordinates?.lat && business.coordinates?.lng
          ? business.coordinates
          : { lat: 4.9288, lng: -74.0252 }
      );
      setProfileWhatsapp(extractLocalPhone(business.whatsapp || ''));
      setProfilePhone(business.phone || '');
      setProfileEmail(business.email || business.accessEmail || '');
      setProfileHours(business.hours || '');
      setProfileDesc(business.description || '');
      setProfilePassword(business.password || business.accessPassword || DEFAULT_PREDEFINED_PASSWORD);
      setPasswordChangeError(null);
    }
    setIsEditingProfile(false);
  };

  const handleChangePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordChangeError(null);
    const trimmed = newPasswordVal.trim();
    if (!trimmed) {
      setPasswordChangeError('Ingresa una contraseña válida.');
      return;
    }
    if (trimmed.length < 4) {
      setPasswordChangeError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (trimmed !== confirmPasswordVal.trim()) {
      setPasswordChangeError('Las contraseñas no coinciden.');
      return;
    }

    if (business) {
      updateBusiness(business.id, { password: trimmed });
      updateBusinessCredentials(business.id, { password: trimmed });
      setProfilePassword(trimmed);
      setNewPasswordVal('');
      setConfirmPasswordVal('');
      setIsChangingPassword(false);
      setPasswordChangeSuccess('¡Contraseña actualizada exitosamente!');
      setTimeout(() => setPasswordChangeSuccess(null), 4000);
    }
  };

  const handleDirectSavePassword = (newPass: string) => {
    setPasswordChangeError(null);
    const trimmed = (newPass || '').trim();
    if (!trimmed) {
      setPasswordChangeError('Ingresa una contraseña válida.');
      return;
    }
    if (trimmed.length < 3) {
      setPasswordChangeError('La contraseña debe tener al menos 3 caracteres.');
      return;
    }

    if (business) {
      updateBusiness(business.id, { password: trimmed, accessPassword: trimmed });
      updateBusinessCredentials(business.id, { password: trimmed, accessPassword: trimmed });
      setProfilePassword(trimmed);
      setPasswordChangeSuccess('¡Contraseña actualizada exitosamente!');
      setTimeout(() => setPasswordChangeSuccess(null), 4000);
    }
  };

  // Google Maps location helper
  const handleOpenInGoogleMaps = () => {
    const addressString = [profileAddress, profileSector, profileCity, 'Colombia'].filter(Boolean).join(', ');
    const destination = addressString
      ? encodeURIComponent(addressString)
      : profileCoordinates?.lat && profileCoordinates?.lng
      ? `${profileCoordinates.lat},${profileCoordinates.lng}`
      : '';
    if (!destination) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handler when a location is picked on the interactive map
  const handleLocationSelected = (newAddress: string, newCoords: LocationCoordinates) => {
    setProfileAddress(newAddress);
    setProfileCoordinates(newCoords);
  };

  // Available municipalities (cities) from sectors catalog (alphabetically sorted)
  const availableCities: string[] = useMemo(() => {
    const list: string[] = Array.from(new Set(sectors.map((s) => s.cityName)));
    const baseList: string[] =
      list.length > 0
        ? list
        : ['Cajicá', 'Chía', 'Cogua', 'Cota', 'Gachancipá', 'Sesquilé', 'Sopó', 'Tabio', 'Tenjo', 'Tocancipá', 'Zipaquirá'];
    return [...baseList].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [sectors]);

  // Available sectors (barrios) for the selected municipality (alphabetically sorted)
  const availableSectors: string[] = useMemo(() => {
    const list = sectors
      .filter((s) => s.cityName.toLowerCase() === profileCity.toLowerCase())
      .map((s) => s.name);
    return (list.length > 0 ? list : ['Centro']).sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' })
    );
  }, [sectors, profileCity]);

  // Handle city change and auto-select appropriate sector
  const handleCityChange = (newCity: string) => {
    setProfileCity(newCity);
    const sectorsForNewCity = sectors
      .filter((s) => s.cityName.toLowerCase() === newCity.toLowerCase())
      .map((s) => s.name)
      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    if (sectorsForNewCity.length > 0) {
      setProfileSector(sectorsForNewCity[0]);
    }
  };

  // Live display values for real-time header banner reflection while editing
  const displayName = isEditingProfile ? (profileName.trim() || 'Nombre del Comercio') : business.name;
  const displaySubCategory = isEditingProfile ? (profileSubCategory.trim() || 'Especialidad / Subcategoría') : business.subCategory;
  const displayCity = isEditingProfile ? profileCity : business.city;
  const displaySector = isEditingProfile ? profileSector : business.sector;
  const displayCover = isEditingProfile ? (profileCoverImage || business.coverImage) : business.coverImage;
  const displayLogo = isEditingProfile ? (profileLogo || business.logo) : business.logo;

  if (!business) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se encontró el negocio seleccionado.
      </div>
    );
  }

  const businessPosts = posts.filter((p) => p.businessId === business.id);
  const activePostsCount = businessPosts.filter((p) => isPostActive(p)).length;
  const pendingReviewPostsForBiz = businessPosts.filter(
    (p) => p.status === 'pending_review' || p.reviewStatus === 'pending'
  );
  const suspendedPostsForBiz = businessPosts.filter(
    (p) =>
      (p.status === 'suspended' || Boolean(p.suspended)) &&
      p.status !== 'pending_review' &&
      p.reviewStatus !== 'pending'
  );
  const expiredPostsCount = businessPosts.filter(
    (p) =>
      !p.suspended &&
      p.status !== 'suspended' &&
      p.status !== 'pending_review' &&
      p.reviewStatus !== 'pending' &&
      p.expiresAt &&
      new Date(p.expiresAt).getTime() <= Date.now()
  ).length;

  // Business notifications
  const currentBizNotifications = useMemo(() => {
    if (!business) return [];
    return businessNotifications.filter((n) => n.businessId === business.id);
  }, [businessNotifications, business]);

  const unreadNotifsCount = useMemo(() => {
    return currentBizNotifications.filter((n) => !n.read).length;
  }, [currentBizNotifications]);

  const formattedBizNotifications = useMemo<NotificationItemData[]>(() => {
    return currentBizNotifications.map((notif) => {
      const targetPost = notif.postId ? posts.find((p) => p.id === notif.postId) : null;
      const isBusinessRelated = notif.type.startsWith('business_');
      const isPostRelated = notif.type.startsWith('post_') || Boolean(notif.postId);

      let category: 'business' | 'post' | 'system' = 'system';
      if (isPostRelated) category = 'post';
      else if (isBusinessRelated) category = 'business';

      let onView: (() => void) | undefined = undefined;

      if (targetPost) {
        onView = () => {
          if (!notif.read) markBusinessNotificationAsRead(notif.id);
          setShowNotificationsModal(false);
          setActiveTab('posts');
          if (targetPost.status === 'suspended' || targetPost.suspended) {
            setEditingPost(targetPost);
          }
        };
      } else if (
        isBusinessRelated &&
        (notif.type === 'business_suspended' ||
          notif.type === 'business_rejected' ||
          notif.type === 'business_review_requested')
      ) {
        onView = () => {
          if (!notif.read) markBusinessNotificationAsRead(notif.id);
          setShowNotificationsModal(false);
          const draftKey = `oleveci_review_draft_${business?.id || ''}`;
          const saved = localStorage.getItem(draftKey);
          if (saved) {
            setBusinessCorrectionNote(saved);
            setIsWritingReview(true);
            setIsReviewDraftSaved(true);
          } else if (business?.correctionNote) {
            setBusinessCorrectionNote(business.correctionNote);
            setIsWritingReview(true);
            setIsReviewDraftSaved(true);
          } else {
            setBusinessCorrectionNote('');
            setIsWritingReview(false);
            setIsReviewDraftSaved(false);
          }
          setShowBusinessReviewModal(true);
        };
      } else if (isBusinessRelated) {
        onView = () => {
          if (!notif.read) markBusinessNotificationAsRead(notif.id);
          setShowNotificationsModal(false);
          setActiveTab('profile');
        };
      }

      return {
        id: notif.id,
        title: notif.title,
        message: notif.message,
        category,
        timeFormatted: new Date(notif.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        read: notif.read,
        reason: notif.reason,
        onView,
        onDismiss: () => deleteBusinessNotification(notif.id),
      };
    });
  }, [
    currentBizNotifications,
    posts,
    business,
    markBusinessNotificationAsRead,
    deleteBusinessNotification,
  ]);

  // Filtered posts for the "Publicaciones" tab
  const filteredBusinessPosts = businessPosts.filter((post) => {
    const isPendingReview = post.status === 'pending_review' || post.reviewStatus === 'pending';
    const isSuspended = (post.status === 'suspended' || Boolean(post.suspended)) && !isPendingReview;
    if (postFilter === 'pending_review') return isPendingReview;
    if (postFilter === 'suspended') return isSuspended;
    const isExpired = !isSuspended && !isPendingReview && post.expiresAt && new Date(post.expiresAt).getTime() <= Date.now();
    if (postFilter === 'active') return isPostActive(post);
    if (postFilter === 'expired') return isExpired;
    return true; // 'all' shows all posts including suspended and pending so merchant can manage them
  });

  // Metrics sum
  const totalViews = businessPosts.reduce((acc, p) => acc + (p.metrics?.views || 0), business.metrics.views || 0);
  const totalWhatsapp = businessPosts.reduce((acc, p) => acc + (p.metrics?.whatsappClicks || 0), business.metrics.whatsappClicks || 0);
  const totalMaps = businessPosts.reduce((acc, p) => acc + (p.metrics?.mapsClicks || 0), business.metrics.mapsClicks || 0);
  const totalCalls = businessPosts.reduce((acc, p) => acc + (p.metrics?.calls || 0), business.metrics.calls || 0);
  const totalShares = businessPosts.reduce((acc, p) => acc + (p.metrics?.shares || 0), business.metrics.shares || 0);

  // Total customer interactions generated
  const totalLeads = totalWhatsapp + totalMaps + totalCalls;

  // Subscription calculation
  const isSubActive = business.subscription.status === 'active';
  const expiresDate = new Date(business.subscription.expiresAt);
  const daysRemaining = Math.max(
    0,
    Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPassword = profilePassword.trim() || DEFAULT_PREDEFINED_PASSWORD;
    updateBusiness(business.id, {
      name: profileName,
      subCategory: profileSubCategory,
      categoryId: profileCategoryId,
      logo: profileLogo,
      coverImage: profileCoverImage,
      address: profileAddress,
      city: profileCity,
      sector: profileSector,
      coordinates: profileCoordinates,
      whatsapp: normalizeToColombianWa(profileWhatsapp),
      phone: profilePhone,
      email: profileEmail.trim(),
      hours: profileHours,
      description: profileDesc,
      password: trimmedPassword,
    });
    updateBusinessCredentials(business.id, {
      password: trimmedPassword,
    });
    setIsEditingProfile(false);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleSaveImageModal = (newImageUrl: string) => {
    if (!imageModalConfig) return;
    if (imageModalConfig.type === 'banner') {
      setProfileCoverImage(newImageUrl);
      updateBusiness(business.id, { coverImage: newImageUrl });
    } else {
      setProfileLogo(newImageUrl);
      updateBusiness(business.id, { logo: newImageUrl });
    }
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handlePayWithWompi = async () => {
    setIsWompiLoading(true);
    setWompiError(null);
    setWompiPendingNotice(null);

    const isYearly = selectedCheckoutPlan === 'yearly';
    const amountInCOP = isYearly ? 299000 : 29900;
    const amountInCents = amountInCOP * 100;
    const planName = isYearly ? 'Plan Anual OleVeci' : 'Plan Mensual OleVeci';
    const cleanBizId = business.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6);
    const reference = `OLEVECI-${isYearly ? 'Y' : 'M'}-${cleanBizId}-${Date.now()}`;

    try {
      const isSandbox = WOMPI_CONFIG.publicKey.startsWith('pub_test_');
      const customerEmail = billingEmail?.trim() || business.accessEmail || 'contacto@oleveci.com';
      const rawPhone = (business.phone || business.whatsapp || '3000000000').replace(/\D/g, '');
      const customerPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : '3001234567';

      // En modo sandbox, NO enviamos customerData para evitar que Wompi bloquee con WS01
      // por discrepancia entre el nombre del negocio y el titular de la tarjeta/teléfono de prueba
      const result = await openWompiCheckoutModal({
        reference,
        amountInCents,
        planName,
        customerData: isSandbox
          ? undefined
          : {
              email: customerEmail,
              fullName: business.name,
              phoneNumber: customerPhone,
              phoneNumberPrefix: '+57',
            },
      });

      const tx = result?.transaction;
      if (tx?.status === 'APPROVED') {
        const txId = tx.id || `WOMPI-${Date.now()}`;
        setLastWompiTx(txId);
        renewBusinessSubscription(business.id, {
          days: isYearly ? 365 : 30,
          planName,
          priceCOP: amountInCOP,
          billingCycle: isYearly ? 'yearly' : 'monthly',
          paymentRecord: {
            id: `wompi_${txId}`,
            invoiceNumber: `WOMPI-${txId.slice(-8).toUpperCase()}`,
            date: new Date().toISOString(),
            planName,
            amountCOP: amountInCOP,
            taxCOP: 0,
            totalCOP: amountInCOP,
            paymentMethod: (tx.paymentMethodType?.toLowerCase().includes('card')
              ? 'card'
              : tx.paymentMethodType?.toLowerCase().includes('nequi')
              ? 'nequi'
              : tx.paymentMethodType?.toLowerCase().includes('daviplata')
              ? 'daviplata'
              : 'pse') as any,
            paymentDetails: {
              authCode: txId,
              bankName: tx.paymentMethodType || 'Wompi Colombia (Bancolombia)',
            },
            status: 'approved',
          },
        });
        setPaymentSuccess(true);
        setTimeout(() => {
          setPaymentSuccess(false);
          setShowCheckoutModal(false);
        }, 3000);
      } else if (tx?.status === 'PENDING') {
        setWompiPendingNotice(
          `Tu pago fue recibido y está en validación por tu entidad financiera (Ref: ${tx.reference || reference}). Wompi confirmará en minutos.`
        );
      } else if (tx?.status === 'DECLINED') {
        const txId = tx?.id || `WOMPI-DECLINED-${Date.now()}`;
        const rejectedRecord: BusinessPaymentRecord = {
          id: `wompi_${txId}`,
          invoiceNumber: `REC-WOMPI-${txId.slice(-8).toUpperCase()}`,
          date: new Date().toISOString(),
          planName,
          amountCOP: amountInCOP,
          taxCOP: 0,
          totalCOP: amountInCOP,
          paymentMethod: (tx?.paymentMethodType?.toLowerCase().includes('card')
            ? 'card'
            : tx?.paymentMethodType?.toLowerCase().includes('nequi')
            ? 'nequi'
            : tx?.paymentMethodType?.toLowerCase().includes('daviplata')
            ? 'daviplata'
            : 'wompi') as any,
          paymentDetails: {
            authCode: txId,
            bankName: tx?.paymentMethodType || 'Wompi Bancolombia',
            rejectionReason: 'Transacción declinada por la entidad emisora o fondos insuficientes.',
          },
          status: 'rejected',
        };
        addBusinessPaymentRecord(business.id, rejectedRecord);
        setWompiError('La transacción fue rechazada por la entidad emisora. El intento ha sido registrado en tu historial de facturación.');
      } else if (tx?.status === 'ERROR') {
        const txId = tx?.id || `WOMPI-ERR-${Date.now()}`;
        const rejectedRecord: BusinessPaymentRecord = {
          id: `wompi_${txId}`,
          invoiceNumber: `REC-WOMPI-${txId.slice(-8).toUpperCase()}`,
          date: new Date().toISOString(),
          planName,
          amountCOP: amountInCOP,
          taxCOP: 0,
          totalCOP: amountInCOP,
          paymentMethod: 'wompi',
          paymentDetails: {
            authCode: txId,
            bankName: 'Wompi Bancolombia',
            rejectionReason: 'Error técnico al procesar el pago en la pasarela.',
          },
          status: 'rejected',
        };
        addBusinessPaymentRecord(business.id, rejectedRecord);
        setWompiError('Ocurrió un error al procesar el pago en Wompi. El intento ha sido registrado en tu historial de facturación.');
      }
    } catch (err: any) {
      console.error('Error al abrir checkout Wompi:', err);
      setWompiError(err?.message || 'No fue posible abrir la pasarela Wompi. Intenta nuevamente.');
    } finally {
      setIsWompiLoading(false);
    }
  };

  const formatPaymentDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'wompi':
        return { label: 'Wompi Bancolombia', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'nequi':
        return { label: 'Nequi', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'daviplata':
        return { label: 'Daviplata', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'pse':
        return { label: 'PSE Bancario', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'card':
        return { label: 'Tarjeta Débito/Crédito', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'transfer':
        return { label: 'Transferencia', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'cash':
        return { label: 'Efectivo / Manual', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: method || 'Pasarela de Pago', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const formatCOP = (val: number) => `$${(val || 0).toLocaleString('es-CO')} COP`;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Merchant Header */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#041f5e] via-[#082a7a] to-[#0a3a9c] text-white shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {business.logo ? (
            <img
              src={business.logo}
              alt={business.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-2xl object-cover border border-white/20 shrink-0 shadow-md"
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-[#007af7] flex items-center justify-center font-bold text-white shrink-0 shadow-md border border-white/20">
              <Store className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-bold truncate">{business.name}</h2>
              {business.verified && (
                <ShieldCheck className="w-4 h-4 text-[#ff7700] shrink-0" title="Comercio Verificado" />
              )}
            </div>
            <p className="text-xs text-blue-200 truncate">
              {displaySubCategory} · {displaySector}, {displayCity}
            </p>
          </div>
        </div>

        {/* Quick action buttons matching AdminDashboard */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-business-header-notifications"
            onClick={() => setShowNotificationsModal(true)}
            className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/15 cursor-pointer flex items-center justify-center"
            title="Notificaciones y avisos del negocio"
            aria-label="Notificaciones del negocio"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white font-black text-[10px] leading-none shadow-xs animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            id="btn-business-header-logout"
            onClick={() => logoutBusiness()}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition border border-white/15 cursor-pointer flex items-center justify-center shadow-xs active:scale-95"
            title="Cerrar sesión de comerciante"
            aria-label="Cerrar sesión de comerciante"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Business Suspended or In Review Notice */}
      {(business.status === 'suspended' || business.status === 'pending_review') && (
        <div
          className={`p-4 sm:p-4.5 rounded-2xl border flex flex-col gap-3 sm:gap-4 shadow-xs transition-all ${
            business.status === 'pending_review'
              ? 'bg-amber-50/90 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  business.status === 'pending_review'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {business.status === 'pending_review' ? (
                  <Clock className="w-5 h-5 animate-pulse" />
                ) : (
                  <Ban className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {business.status === 'pending_review'
                      ? 'Solicitud de Revisión en Curso'
                      : 'Comercio Suspendido Temporalmente'}
                  </h4>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                      business.status === 'pending_review'
                        ? 'bg-amber-200/80 text-amber-900 border-amber-300'
                        : 'bg-rose-200/80 text-rose-900 border-rose-300'
                    }`}
                  >
                    {business.status === 'pending_review' ? 'En Moderación' : 'Suspendido'}
                  </span>
                </div>

                {business.status === 'pending_review' ? (
                  <div>
                    <p className="text-xs text-amber-900 font-medium">
                      Has enviado una solicitud de revisión al equipo de administración.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-rose-800 font-semibold">
                      Motivo: {business.suspensionReason || 'Tu comercio ha sido suspendido temporalmente por políticas de la plataforma.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {business.status === 'suspended' && (
                <button
                  type="button"
                  onClick={() => {
                    const draftKey = `oleveci_review_draft_${business.id}`;
                    const saved = localStorage.getItem(draftKey);
                    if (saved) {
                      setBusinessCorrectionNote(saved);
                      setIsWritingReview(true);
                      setIsReviewDraftSaved(true);
                    } else if (business.correctionNote) {
                      setBusinessCorrectionNote(business.correctionNote);
                      setIsWritingReview(true);
                      setIsReviewDraftSaved(true);
                    } else {
                      setBusinessCorrectionNote('');
                      setIsWritingReview(false);
                      setIsReviewDraftSaved(false);
                    }
                    setShowBusinessReviewModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Solicitar Revisión</span>
                </button>
              )}

              {business.status === 'pending_review' && (
                <button
                  type="button"
                  onClick={() => setShowSuspensionHistory((prev) => !prev)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Ver historial paso a paso de la moderación y respuestas"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showSuspensionHistory ? 'Ocultar Histórico' : 'Ver Histórico'}</span>
                  {showSuspensionHistory ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Histórico Paso a Paso Desplegable */}
          {showSuspensionHistory && (
            <div className="w-full pt-3 mt-1 border-t border-slate-200/80">
              <SuspensionTimeline business={business} />
            </div>
          )}
        </div>
      )}

      {/* 4 Sub-sections Navigation Bar */}
      <div className="flex items-center p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
        <button
          type="button"
          id="tab-business-posts"
          onClick={() => setActiveTab('posts')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-[#007af7] text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">Publicaciones</span>
          <span className="sm:hidden">Posts</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0 ${
              activeTab === 'posts'
                ? 'bg-white text-[#007af7]'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {businessPosts.length}
          </span>
        </button>

        <button
          type="button"
          id="tab-business-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#007af7] text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">Dashboard &amp; Métricas</span>
          <span className="sm:hidden">Métricas</span>
        </button>

        <button
          type="button"
          id="tab-business-info"
          onClick={() => setActiveTab('info')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'info'
              ? 'bg-[#007af7] text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden md:inline">Información del Negocio</span>
          <span className="hidden sm:inline md:hidden">Información</span>
          <span className="sm:hidden">Perfil</span>
        </button>

        <button
          type="button"
          id="tab-business-subscription"
          onClick={() => setActiveTab('subscription')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'subscription'
              ? 'bg-[#007af7] text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">Suscripción</span>
          <span className="sm:hidden">Plan</span>
        </button>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Información comercial guardada exitosamente.</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SUB-SECCIÓN: PUBLICACIONES / POSTS */}
      {/* ========================================================================= */}
      {activeTab === 'posts' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header with Filters & Create Action in ONE row */}
          <div className="flex flex-row items-center justify-between gap-2 bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              id="btn-new-post-merchant"
              onClick={onOpenCreatePost}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer active:scale-98 hover:brightness-110 shrink-0"
              style={{
                background: 'linear-gradient(135deg, #031c54 0%, #0056d6 50%, #007af7 100%)',
                boxShadow: '0 4px 14px -2px rgba(0, 86, 214, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
              }}
              title="Crear nueva publicación"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Crear <span className="hidden min-[380px]:inline">Publicación</span></span>
            </button>

            {/* Filter Pills with Icons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-0.5 shrink-0 overflow-x-auto no-scrollbar">
              <button
                id="filter-merchant-all"
                onClick={() => setPostFilter('all')}
                title={`Todas las publicaciones (${businessPosts.length})`}
                aria-label={`Todas las publicaciones (${businessPosts.length})`}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  postFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${postFilter === 'all' ? 'text-[#007af7]' : 'text-slate-400'}`} />
                <span className="text-[11px] sm:text-xs font-bold">{businessPosts.length}</span>
                <span className="hidden sm:inline">Todas</span>
              </button>

              <button
                id="filter-merchant-active"
                onClick={() => setPostFilter('active')}
                title={`Publicaciones Activas (${activePostsCount})`}
                aria-label="Publicaciones Activas"
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  postFilter === 'active'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-emerald-600 hover:bg-white/60'
                }`}
              >
                <span className="relative flex items-center justify-center">
                  <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${postFilter === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {postFilter === 'active' && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </span>
                <span className="hidden sm:inline">Activas</span>
              </button>

              <button
                id="filter-merchant-expired"
                onClick={() => setPostFilter('expired')}
                title={`Publicaciones Vencidas (${expiredPostsCount})`}
                aria-label="Publicaciones Vencidas"
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  postFilter === 'expired'
                    ? 'bg-white text-red-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-red-600 hover:bg-white/60'
                }`}
              >
                <History className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${postFilter === 'expired' ? 'text-red-600' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Vencidas</span>
              </button>

              {pendingReviewPostsForBiz.length > 0 && (
                <button
                  id="filter-merchant-pending-review"
                  onClick={() => setPostFilter('pending_review')}
                  title={`En Revisión (${pendingReviewPostsForBiz.length})`}
                  aria-label="En Revisión"
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    postFilter === 'pending_review'
                      ? 'bg-amber-600 text-white shadow-2xs font-bold'
                      : 'text-amber-800 bg-amber-100/90 hover:bg-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 animate-pulse" />
                  <span className="hidden sm:inline text-[11px] sm:text-xs font-bold">En Revisión ({pendingReviewPostsForBiz.length})</span>
                </button>
              )}

              {suspendedPostsForBiz.length > 0 && (
                <button
                  id="filter-merchant-suspended"
                  onClick={() => setPostFilter('suspended')}
                  title={`Publicaciones Suspendidas (${suspendedPostsForBiz.length})`}
                  aria-label="Publicaciones Suspendidas"
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    postFilter === 'suspended'
                      ? 'bg-red-600 text-white shadow-2xs font-bold'
                      : 'text-red-700 bg-red-100/80 hover:bg-red-200'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden sm:inline text-[11px] sm:text-xs font-bold">Suspendidas</span>
                </button>
              )}
            </div>
          </div>


          {/* Posts Content: Always in list view */}
          {filteredBusinessPosts.length > 0 ? (
            <div className="space-y-3">
              {filteredBusinessPosts.map((post) => {
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
                          <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border shrink-0 bg-slate-100 flex items-center justify-center ${
                            isPendingReview
                              ? 'border-2 border-amber-400 ring-1 ring-amber-300'
                              : isSuspended
                              ? 'border-2 border-red-400 ring-1 ring-red-300'
                              : 'border-slate-200'
                          }`}>
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
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex flex-col items-center justify-center shrink-0 text-[10px] font-bold ${
                            isPendingReview
                              ? 'bg-amber-100 border-amber-300 text-amber-700'
                              : isSuspended
                              ? 'bg-red-100 border-red-300 text-red-600'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}>
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

                          {/* Suspension Box if suspended */}
                          {isSuspended && (
                            <div className="mt-1.5 p-2 rounded-lg bg-red-100/80 border border-red-200 text-xs text-red-900 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-bold">Motivo de suspensión:</span>{' '}
                                <span className="text-red-800">{post.suspensionReason || 'Incumplimiento de políticas de contenido.'}</span>
                              </div>
                            </div>
                          )}

                          <h4
                            className="text-sm font-bold text-slate-900 truncate block mt-1 max-w-full"
                            title={post.title}
                          >
                            {post.title}
                          </h4>
                          <div className="text-xs font-semibold text-[#041f5e] mt-1">
                            {post.promotionalPrice
                              ? `$${post.promotionalPrice.toLocaleString('es-CO')} COP`
                              : 'Sin precio'}
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
                          onClick={() => onSelectPost(post)}
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                          title="Previsualizar cómo la ven los usuarios"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Action buttons: if in review, lock changes and display "En Revisión" */}
                        {isPendingReview ? (
                          <div
                            className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-100/90 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs select-none cursor-not-allowed opacity-90"
                            title="Publicación en revisión por el administrador. Ya se envió la corrección y no se permiten más cambios hasta recibir respuesta del administrador."
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                            <span>En Revisión</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (isSuspended) {
                                currentBizNotifications.forEach((n) => {
                                  if (n.postId === post.id) {
                                    deleteBusinessNotification(n.id);
                                  }
                                });
                              }
                              setEditingPost(post);
                            }}
                            className={`p-2 rounded-xl border transition cursor-pointer ${
                              isSuspended
                                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-xs flex items-center gap-1 px-3'
                                : 'border-slate-200 text-slate-600 hover:text-[#007af7] hover:bg-blue-50'
                            }`}
                            title={isSuspended ? 'Corregir publicación suspendida' : 'Editar publicación'}
                          >
                            <Edit3 className="w-4 h-4" />
                            {isSuspended && <span className="text-xs font-bold">Corregir</span>}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminar esta publicación?')) {
                              deletePost(post.id);
                            }
                          }}
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Eliminar publicación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>


                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <Store className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">
                {postFilter === 'all'
                  ? 'Aún no tienes publicaciones'
                  : postFilter === 'pending_review'
                  ? 'No tienes publicaciones en revisión'
                  : postFilter === 'suspended'
                  ? 'No tienes publicaciones suspendidas'
                  : `No hay publicaciones ${postFilter === 'active' ? 'activas' : 'vencidas'}`}
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                Crea tu primera promoción, producto o evento para aparecer en el feed de tu municipio.
              </p>
              <button
                onClick={onOpenCreatePost}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all duration-300 shadow-xs active:scale-98 hover:brightness-110 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #031c54 0%, #0056d6 50%, #007af7 100%)',
                  boxShadow: '0 4px 14px -2px rgba(0, 86, 214, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
                }}
              >
                Publicar ahora
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-SECCIÓN: DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <BusinessMetricsDashboard
          business={business}
          businessPosts={businessPosts}
          onOpenCreatePost={onOpenCreatePost}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-SECCIÓN: INFORMACIÓN DEL NEGOCIO */}
      {/* ========================================================================= */}
      {activeTab === 'info' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Cover & Business Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-slate-100 group">
              {displayCover ? (
                <img
                  src={displayCover}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-101"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />

              {/* Direct button to change Banner on hover/always */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {isEditingProfile && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 shadow-xs backdrop-blur-xs">
                    <Sparkles className="w-3 h-3 text-amber-900" />
                    <span>Vista en vivo</span>
                  </span>
                )}
                <button
                  type="button"
                  id="btn-edit-banner"
                  onClick={() => setImageModalConfig({ isOpen: true, type: 'banner' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 shadow-sm transition hover:scale-102 active:scale-98 cursor-pointer"
                  title="Cambiar foto de portada o banner"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-300" />
                  <span>Cambiar Portada</span>
                </button>
              </div>

              {/* Bottom bar with logo and info */}
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Logo with direct quick edit badge */}
                  <div className="relative group/logo shrink-0">
                    {displayLogo ? (
                      <img
                        src={displayLogo}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-contain border-2 border-white/80 shadow-md bg-transparent shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold border-2 border-white shadow-md">
                        {displayName.slice(0, 2)}
                      </div>
                    )}
                    {/* Hover overlay button on desktop */}
                    <button
                      type="button"
                      id="btn-edit-logo-overlay"
                      onClick={() => setImageModalConfig({ isOpen: true, type: 'logo' })}
                      className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition duration-150 backdrop-blur-xs text-white cursor-pointer"
                      title="Cambiar logotipo"
                    >
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] font-bold">Cambiar</span>
                    </button>
                    {/* Always visible camera badge on mobile or quick tap */}
                    <button
                      type="button"
                      id="btn-edit-logo-badge"
                      onClick={() => setImageModalConfig({ isOpen: true, type: 'logo' })}
                      className="sm:hidden absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#007af7] hover:bg-[#0068d6] text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition"
                      title="Cambiar logotipo"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold drop-shadow-xs truncate">
                        {displayName}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setImageModalConfig({ isOpen: true, type: 'logo' })}
                        className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-200 hover:text-white underline underline-offset-2 cursor-pointer shrink-0"
                      >
                        Cambiar logo
                      </button>
                    </div>
                    <p className="text-xs text-blue-100 font-medium truncate">
                      <span className="font-bold text-white drop-shadow-2xs">{displaySubCategory}</span> · {displaySector}, {displayCity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {business.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Verificado</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Content / Editor */}
            <div className="p-4 sm:p-6 space-y-4">
              {isEditingProfile ? (
                /* Edit Profile Form with distinct visual section cards */
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  {/* Sección 1: Información Principal (MODULAR) */}
                  <BusinessMainInfoSection
                    name={profileName}
                    onChangeName={setProfileName}
                    subCategory={profileSubCategory}
                    onChangeSubCategory={setProfileSubCategory}
                    categoryId={profileCategoryId}
                    onChangeCategoryId={setProfileCategoryId}
                    categories={categories}
                    description={profileDesc}
                    onChangeDescription={setProfileDesc}
                    isOpen={isMainInfoOpen}
                    onToggleOpen={() => setIsMainInfoOpen(!isMainInfoOpen)}
                    idPrefix="dashboard-profile"
                  />

                  {/* Sección 2: Ubicación & Contacto (MODULAR) */}
                  <BusinessLocationContactSection
                    city={profileCity}
                    onChangeCity={handleCityChange}
                    sector={profileSector}
                    onChangeSector={setProfileSector}
                    address={profileAddress}
                    onChangeAddress={setProfileAddress}
                    coordinates={profileCoordinates}
                    whatsapp={profileWhatsapp}
                    onChangeWhatsapp={setProfileWhatsapp}
                    phone={profilePhone}
                    onChangePhone={setProfilePhone}
                    email={profileEmail}
                    onChangeEmail={setProfileEmail}
                    sectors={sectors}
                    onOpenMapPicker={() => setIsLocationPickerOpen(true)}
                    isOpen={isLocationContactOpen}
                    onToggleOpen={() => setIsLocationContactOpen(!isLocationContactOpen)}
                    idPrefix="dashboard-profile"
                  />

                  {/* Sección 3: Horario de Atención */}
                  <ScheduleSelector
                    value={profileHours}
                    onChange={(newHours) => setProfileHours(newHours)}
                    title="Horario de atención"
                  />

                  {/* Sección 4: Usuario y Contraseña (MODULAR) */}
                  <BusinessCredentialsSection
                    username={business.username || ''}
                    password={profilePassword}
                    onChangePassword={setProfilePassword}
                    onSavePassword={handleDirectSavePassword}
                    saveButtonText="Actualizar Contraseña"
                    saveSuccessMessage={passwordChangeSuccess}
                    saveErrorMessage={passwordChangeError}
                    isOpen={isCredentialsOpen}
                    onToggleOpen={() => setIsCredentialsOpen(!isCredentialsOpen)}
                    role="business"
                    idPrefix="dashboard-profile-creds-edit"
                  />

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#007af7] hover:bg-[#0068d6] text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                /* Information Readonly View structured in the exact same 3 collapsible visual containers as the editor */
                <div className="space-y-4 text-xs">
                  {/* Sección 1: Información Principal */}
                  <div
                    className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
                      isMainInfoOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
                    }`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsMainInfoOpen(!isMainInfoOpen)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsMainInfoOpen(!isMainInfoOpen);
                        }
                      }}
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
                    </div>

                    {isMainInfoOpen && (
                      <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
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
                              {business.subCategory}
                            </div>
                          </div>

                          <div>
                            <span className="block font-bold text-slate-700 text-xs mb-1">
                              Categoría Comercial
                            </span>
                            <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 shadow-2xs">
                              {categories.find((c) => c.id === business.categoryId)?.name || 'General'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="block font-bold text-slate-700 text-xs mb-1">
                            Descripción del Comercio
                          </span>
                          <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 leading-relaxed shadow-2xs">
                            {business.description}
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
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsLocationContactOpen(!isLocationContactOpen)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsLocationContactOpen(!isLocationContactOpen);
                        }
                      }}
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
                    </div>

                    {isLocationContactOpen && (
                      <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
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
                            <span className="text-[10px] font-semibold text-slate-400">
                              Haz clic para ver ubicación en el mapa
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsViewMapModalOpen(true)}
                              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/40 text-xs font-medium text-slate-900 shadow-2xs text-left transition flex items-center justify-between group cursor-pointer"
                              title="Ver ubicación en el mapa de OleVeci y cómo llegar"
                            >
                              <span className="truncate">{business.address || 'Dirección no especificada'}</span>
                              <span className="text-[11px] text-[#007af7] font-bold opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                                Ver mapa →
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsViewMapModalOpen(true)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#007af7] to-[#041f5e] hover:brightness-110 active:scale-95 px-3.5 py-2.5 rounded-xl transition border border-blue-600/30 shrink-0 shadow-2xs cursor-pointer"
                              title="Ver ubicación en el mapa con el icono de OleVeci para poder llegar"
                            >
                              <OleVeciIcon size={16} />
                              <span>Ver en Mapa</span>
                            </button>
                          </div>
                          <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5 px-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>
                              Haz clic en <strong>Ver en Mapa</strong> para ver el local con el pin oficial de <strong>OleVeci</strong> y trazar ruta de llegada.
                            </span>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="block font-bold text-slate-700 text-xs mb-1">
                              WhatsApp de Atención
                            </span>
                            <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs font-normal text-emerald-950 shadow-2xs">
                              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{formatColombianPhone(business.whatsapp)}</span>
                            </div>
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

                        {/* Correo Electrónico del Negocio */}
                        <div>
                          <span className="block font-bold text-slate-700 text-xs mb-1">
                            Correo Electrónico del Negocio
                          </span>
                          <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 shadow-2xs">
                            <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                            {business.email || business.billingInfo?.email ? (
                              <a
                                href={`mailto:${business.email || business.billingInfo?.email}`}
                                className="text-[#007af7] hover:underline truncate font-medium"
                              >
                                {business.email || business.billingInfo?.email}
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">No registrado</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sección 3: Horario de Atención */}
                  <div
                    className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
                      isReadOnlyHoursOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
                    }`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsReadOnlyHoursOpen(!isReadOnlyHoursOpen)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsReadOnlyHoursOpen(!isReadOnlyHoursOpen);
                        }
                      }}
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
                          {isReadOnlyHoursOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>

                    {isReadOnlyHoursOpen && (
                      <div className="pt-2 animate-in fade-in duration-150">
                        <ScheduleReadOnlyTable schedule={business.hours} />
                      </div>
                    )}
                  </div>

                  {/* Sección 4: Usuario y Contraseña (Lectura - MODULAR) */}
                  <BusinessCredentialsSection
                    username={business.username || ''}
                    password={profilePassword}
                    onChangePassword={setProfilePassword}
                    onSavePassword={handleDirectSavePassword}
                    saveButtonText="Actualizar Contraseña"
                    saveSuccessMessage={passwordChangeSuccess}
                    saveErrorMessage={passwordChangeError}
                    isOpen={isReadOnlyCredsOpen}
                    onToggleOpen={() => setIsReadOnlyCredsOpen(!isReadOnlyCredsOpen)}
                    role="business"
                    idPrefix="dashboard-profile-creds-view"
                  />

                  {/* Botón Editar Información en la parte inferior */}
                  <div className="flex items-center justify-end pt-2">
                    <button
                      id="btn-toggle-edit-profile"
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition bg-[#007af7] text-white hover:bg-[#0068d6] shadow-xs cursor-pointer active:scale-[0.99]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Información</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-SECCIÓN: SUSCRIPCIÓN Y FACTURACIÓN */}
      {/* ========================================================================= */}
      {activeTab === 'subscription' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          {/* Quick Toast Alerts */}
          {quickRenewToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¡Suscripción renovada exitosamente! Se han añadido 30 días a tu vigencia.</span>
            </div>
          )}
          {billingSavedToast && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Datos fiscales y de facturación electrónica guardados con éxito.</span>
            </div>
          )}

          {/* 1. Hero Plan Status Card */}
          {(() => {
            const isSubActiveState = isSubActive && daysRemaining > 0;
            const isExpiringSoon = isSubActiveState && daysRemaining <= 3;
            const isExpired = !isSubActive || daysRemaining <= 0;

            let subStatusLabel = 'ACTIVA';
            let cardBorderAndBg = 'bg-[#ecfdf5] border-[#86efac]';
            let rayColorClass = 'text-emerald-600';
            let iconBgGradient = 'bg-gradient-to-br from-[#059669] to-[#047857]';
            let badgeBgClass = 'bg-[#059669]';
            let badgeIcon = <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />;
            let statusLabelColor = 'text-[#059669]';
            let pillIconColor = 'text-[#059669]';
            let btnGradientClass = 'bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065f46]';

            if (isExpired) {
              subStatusLabel = 'VENCIDA';
              cardBorderAndBg = 'bg-[#fff1f2] border-[#fecdd3]';
              rayColorClass = 'text-rose-600';
              iconBgGradient = 'bg-gradient-to-br from-[#f43f5e] to-[#e11d48]';
              badgeBgClass = 'bg-[#e11d48]';
              badgeIcon = <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />;
              statusLabelColor = 'text-[#e11d48]';
              pillIconColor = 'text-[#e11d48]';
              btnGradientClass = 'bg-gradient-to-r from-[#f43f5e] to-[#e11d48] hover:from-[#e11d48] hover:to-[#be123c]';
            } else if (isExpiringSoon) {
              subStatusLabel = 'PRÓXIMA A VENCER';
              cardBorderAndBg = 'bg-[#fffbeb] border-[#fde68a]';
              rayColorClass = 'text-amber-600';
              iconBgGradient = 'bg-gradient-to-br from-[#f59e0b] to-[#ea580c]';
              badgeBgClass = 'bg-[#ea580c]';
              badgeIcon = <Clock className="w-2.5 h-2.5 text-white" strokeWidth={3} />;
              statusLabelColor = 'text-[#d97706]';
              pillIconColor = 'text-[#ea580c]';
              btnGradientClass = 'bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#d97706] hover:to-[#c2410c]';
            }

            const shortRenewalDate = `${String(expiresDate.getDate()).padStart(2, '0')}/${String(expiresDate.getMonth() + 1).padStart(2, '0')}/${expiresDate.getFullYear()}`;

            return (
              <div className={`relative overflow-hidden rounded-2xl border-2 p-3 sm:p-4 md:p-4.5 transition-all shadow-xs ${cardBorderAndBg}`}>
                {/* Decorative Top-Right Sparkle/Sunburst */}
                <div className="absolute top-2.5 right-3 pointer-events-none flex items-center gap-0.5 opacity-80">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={rayColorClass}>
                    <path d="M12 3V6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M18.36 5.64L16.24 7.76" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M21 12H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-3.5 md:gap-4">
                  {/* Left Section: Icon + Status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white shadow-xs ${iconBgGradient}`}>
                        <CreditCard className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.2} />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-2 border-white flex items-center justify-center text-white shadow-2xs ${badgeBgClass}`}>
                        {badgeIcon}
                      </div>
                    </div>

                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`block text-[10px] font-black tracking-wider uppercase ${statusLabelColor}`}>
                          {business.subscription?.planName || 'Plan Mensual OleVeci'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">•</span>
                        <span className={`text-[10px] font-bold ${statusLabelColor}`}>
                          ${(business.subscription?.priceCOP || 29900).toLocaleString('es-CO')} COP/{business.subscription?.billingCycle === 'yearly' ? 'año' : 'mes'}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-black text-[#041f5e] tracking-tight leading-none mt-0.5">
                        {subStatusLabel}
                      </h3>
                    </div>
                  </div>

                  {/* Center Section: Próxima Renovación & Días de Cobertura */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-1 max-w-md min-w-0">
                    <div className="bg-white rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 border border-slate-100 shadow-2xs flex items-center gap-2 min-w-0">
                      <Calendar className={`w-4 h-4 shrink-0 ${pillIconColor}`} strokeWidth={2.2} />
                      <div className="min-w-0">
                        <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase truncate">
                          PRÓXIMA RENOVACIÓN
                        </span>
                        <span className="block text-xs sm:text-sm font-black text-[#041f5e] tracking-tight truncate">
                          {shortRenewalDate}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 border border-slate-100 shadow-2xs flex items-center gap-2 min-w-0">
                      <Clock className={`w-4 h-4 shrink-0 ${pillIconColor}`} strokeWidth={2.2} />
                      <div className="min-w-0">
                        <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase truncate">
                          DÍAS DE COBERTURA
                        </span>
                        <span className="block text-xs sm:text-sm font-black text-[#041f5e] tracking-tight truncate">
                          {isSubActive ? `${daysRemaining} días` : '0 días'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: CTA Button */}
                  <div className="shrink-0 w-full md:w-auto">
                    <button
                      id="btn-subscription-checkout-open"
                      onClick={() => setShowCheckoutModal(true)}
                      className={`w-full md:w-auto px-4 sm:px-4.5 py-2.5 rounded-xl text-white font-extrabold text-xs tracking-wider uppercase shadow-xs hover:shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${btnGradientClass}`}
                    >
                      <CreditCard className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2.2} />
                      <span>Renovar</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}


          {/* 2. Billing & Tax Data (Datos de Facturación) */}
          <div
            className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
              isBillingTaxOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
            }`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsBillingTaxOpen(!isBillingTaxOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsBillingTaxOpen(!isBillingTaxOpen);
                }
              }}
              className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#041f5e] font-extrabold">
                  Datos para facturación
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                  {isBillingTaxOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            {isBillingTaxOpen && (
              <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                {isEditingBilling ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsEditingBilling(false);
                      setBillingSavedToast(true);
                      setTimeout(() => setBillingSavedToast(false), 3000);
                    }}
                    className="space-y-3 pt-1"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Razón Social / Nombre Comercial
                        </label>
                        <input
                          type="text"
                          value={business.name}
                          disabled
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          NIT o Cédula de Ciudadanía
                        </label>
                        <input
                          type="text"
                          value={billingNit}
                          onChange={(e) => setBillingNit(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#007af7]"
                          placeholder="Ej: 901.458.329-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Correo Electrónico de Facturación
                        </label>
                        <input
                          type="email"
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#007af7]"
                          placeholder="facturacion@tunegocio.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Dirección Fiscal
                        </label>
                        <input
                          type="text"
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#007af7]"
                          placeholder="Dirección comercial y municipio"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingBilling(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Guardar Datos Fiscales
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 pt-1 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                          Razón Social
                        </span>
                        <div className="font-bold text-slate-800">{business.name}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                          NIT / C.C.
                        </span>
                        <div className="font-bold text-slate-800">{billingNit}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                          Correo para Comprobantes
                        </span>
                        <div className="font-bold text-slate-800 truncate">{billingEmail}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                          Dirección Fiscal
                        </span>
                        <div className="font-bold text-slate-800 truncate">{billingAddress}</div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingBilling(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Editar Datos Fiscales</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Billing History & Invoices */}
          <div
            className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
              isBillingHistoryOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
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
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#041f5e] font-extrabold">
                  Historial de facturación
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                  {isBillingHistoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            {isBillingHistoryOpen && (
              <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                {(!business.paymentHistory || business.paymentHistory.length === 0) ? (
                  <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-1.5">
                    <Receipt className="w-7 h-7 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No hay pagos ni intentos registrados</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Cualquier pago o intento de suscripción (incluyendo transacciones rechazadas) quedará registrado en esta sección.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {business.paymentHistory.map((inv) => {
                      const isApproved = inv.status === 'approved';
                      const isRejected = inv.status === 'rejected';
                      const badge = getMethodBadge(inv.paymentMethod);
                      return (
                        <div
                          key={inv.id}
                          className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-slate-900">{inv.invoiceNumber}</span>
                              {isApproved ? (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Aprobado
                                </span>
                              ) : isRejected ? (
                                <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  Rechazado
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  En Proceso
                                </span>
                              )}
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 font-bold">{inv.planName}</p>
                            <p className="text-[11px] text-slate-400">
                              Fecha: {formatPaymentDate(inv.date)} • Ref: {inv.paymentDetails?.authCode || inv.id}
                            </p>
                            {isRejected && inv.paymentDetails?.rejectionReason && (
                              <p className="text-[11px] font-medium text-rose-600 bg-rose-50/80 px-2 py-0.5 rounded border border-rose-100 inline-block">
                                Motivo: {inv.paymentDetails.rejectionReason}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                            <div className="text-right">
                              <span className={`text-sm font-black ${isRejected ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                {formatCOP(inv.totalCOP || inv.amountCOP)}
                              </span>
                              {isRejected && (
                                <div className="text-[10px] font-bold text-rose-600">No cobrado</div>
                              )}
                            </div>
                            <button
                              id={`btn-view-invoice-${inv.id}`}
                              onClick={() => setSelectedInvoice(inv)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition shadow-2xs cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5 text-blue-600" />
                              <span>Ver Comprobante</span>
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

          {/* 4. What's Included in the Plan */}
          <div
            className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
              isBenefitsOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
            }`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsBenefitsOpen(!isBenefitsOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsBenefitsOpen(!isBenefitsOpen);
                }
              }}
              className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#041f5e] font-extrabold">
                  Beneficios incluidos en tu suscripción
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                  {isBenefitsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            {isBenefitsOpen && (
              <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {APP_CONFIG.subscription.plans[0].features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700 font-medium"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. FAQ & Support */}
          <div
            className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
              isFaqOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
            }`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsFaqOpen(!isFaqOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsFaqOpen(!isFaqOpen);
                }
              }}
              className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#041f5e] font-extrabold">
                  Preguntas frecuentes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
                  {isFaqOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            {isFaqOpen && (
              <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-900 block mb-1">
                      ¿Cuáles son los planes de suscripción disponibles?
                    </span>
                    <p>
                      Contamos con dos modalidades alineadas a tus necesidades: el <strong>Plan Mensual OleVeci</strong> por $29.900 COP cada 30 días, o el <strong>Plan Anual OleVeci</strong> por $299.000 COP al año (incluye 2 meses de ahorro). No existen comisiones adicionales sobre tus ventas.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-900 block mb-1">
                      ¿Qué ocurre si vence mi suscripción?
                    </span>
                    <p>
                      Tus publicaciones activas pausarán su visualización en el feed comercial de Cajicá, pero todos tus datos, promociones y catálogo permanecen intactos para cuando reactives.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. Franja de soporte vía WhatsApp */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3.5">
            <div className="text-center sm:text-left">
              <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                ¿Tienes dudas con tu pago o suscripción?
              </h4>
              <p className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-0.5">
                Contacta a nuestro equipo de soporte.
              </p>
            </div>

            <a
              id="btn-whatsapp-support-billing"
              href="https://wa.me/573000000000?text=Hola,%20necesito%20soporte%20con%20mi%20facturacion%20o%20suscripcion%20en%20OleVeci"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-[0.99] font-bold text-xs shadow-xs transition shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-[#007af7]">{APP_CONFIG.name}</span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {selectedInvoice.status === 'rejected' ? 'Registro de Intento de Pago' : 'Comprobante Oficial'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  OleVeci S.A.S. • NIT: 901.882.114-5
                </div>
                <div className="text-[11px] text-slate-400">Cajicá, Cundinamarca, Colombia</div>
              </div>

              {selectedInvoice.status === 'approved' ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  PAGADO
                </span>
              ) : selectedInvoice.status === 'rejected' ? (
                <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  RECHAZADO
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  PENDIENTE
                </span>
              )}
            </div>

            {selectedInvoice.status === 'rejected' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">Transacción no completada</span>
                  <span className="text-[11px]">
                    {selectedInvoice.paymentDetails?.rejectionReason ||
                      'La transacción fue declinada por la entidad bancaria o no contó con fondos suficientes. No se generó cargo a tu cuenta.'}
                  </span>
                </div>
              </div>
            )}

            {/* Body Info */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Número de Factura / Ref:</span>
                <span className="font-bold text-slate-900">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Fecha del Registro:</span>
                <span className="font-semibold text-slate-800">{formatPaymentDate(selectedInvoice.date)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Comercio / Facturado a:</span>
                <span className="font-bold text-slate-900">{business.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">NIT / Cédula:</span>
                <span className="font-semibold text-slate-800">{business.billingInfo?.documentNumber || billingNit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Método Utilizado:</span>
                <span className="font-semibold text-slate-800">{getMethodBadge(selectedInvoice.paymentMethod).label}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Código de Autorización:</span>
                <span className="font-mono text-[11px] text-slate-700">
                  {selectedInvoice.paymentDetails?.authCode || selectedInvoice.id}
                </span>
              </div>

              {/* Line item breakdown */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 space-y-1.5 border border-slate-100">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{selectedInvoice.planName}</span>
                  <span>{formatCOP(selectedInvoice.totalCOP || selectedInvoice.amountCOP)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Subtotal:</span>
                  <span>
                    {formatCOP(
                      (selectedInvoice.totalCOP || selectedInvoice.amountCOP) - (selectedInvoice.taxCOP || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>IVA (19%):</span>
                  <span>{formatCOP(selectedInvoice.taxCOP || 0)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>{selectedInvoice.status === 'rejected' ? 'Total Intentado:' : 'Total Pagado:'}</span>
                  <span className={selectedInvoice.status === 'rejected' ? 'text-rose-600' : 'text-emerald-700'}>
                    {formatCOP(selectedInvoice.totalCOP || selectedInvoice.amountCOP)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 transition shadow-2xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Imprimir / PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Subscription Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Suscripción {APP_CONFIG.name}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Selecciona tu plan de suscripción comercial
            </p>

            {/* Plan Selector (2 official plans) */}
            <div className="grid grid-cols-2 gap-2 my-3">
              <button
                type="button"
                onClick={() => setSelectedCheckoutPlan('monthly')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  selectedCheckoutPlan === 'monthly'
                    ? 'border-[#007af7] bg-blue-50/70 ring-1 ring-[#007af7]'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <span className="block text-[11px] font-bold text-slate-800">Plan Mensual</span>
                <span className="block text-xs font-black text-[#007af7] mt-0.5">$29.900</span>
                <span className="block text-[10px] text-slate-500">COP / mes</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCheckoutPlan('yearly')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
                  selectedCheckoutPlan === 'yearly'
                    ? 'border-[#007af7] bg-blue-50/70 ring-1 ring-[#007af7]'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="block text-[11px] font-bold text-slate-800">Plan Anual</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                    Ahorro
                  </span>
                </div>
                <span className="block text-xs font-black text-[#007af7] mt-0.5">$299.000</span>
                <span className="block text-[10px] text-slate-500">COP / año</span>
              </button>
            </div>

            <div className="my-3 p-3.5 rounded-xl bg-orange-50 border border-orange-200">
              <span className="text-xs text-orange-800 font-semibold block">Total a pagar:</span>
              <span className="text-2xl font-black text-slate-900">
                {selectedCheckoutPlan === 'yearly' ? '$299.000 COP / año' : '$29.900 COP / mes'}
              </span>
              <ul className="text-[11px] text-slate-600 mt-2 space-y-1">
                <li>✓ Publicaciones ilimitadas (promociones, eventos, productos)</li>
                <li>✓ Sin comisiones por ventas o reservas</li>
                <li>✓ Contacto directo a tu WhatsApp y Google Maps</li>
                {selectedCheckoutPlan === 'yearly' && (
                  <li className="font-bold text-emerald-800">✓ 2 meses de ahorro incluidos</li>
                )}
              </ul>
            </div>

            {paymentSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-center font-bold text-sm border border-emerald-200 space-y-1 animate-in zoom-in-95">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                  <Check className="w-5 h-5" strokeWidth={3} />
                </div>
                <p>¡Suscripción {selectedCheckoutPlan === 'yearly' ? 'anual' : 'mensual'} activada con éxito!</p>
                {lastWompiTx && (
                  <p className="text-[10px] font-mono text-emerald-700">ID Wompi: {lastWompiTx}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {wompiError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="flex-1">{wompiError}</span>
                  </div>
                )}

                {wompiPendingNotice && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="flex-1">{wompiPendingNotice}</span>
                  </div>
                )}

                {/* Primary Wompi Button */}
                <button
                  type="button"
                  id="btn-wompi-checkout-pay"
                  disabled={isWompiLoading}
                  onClick={handlePayWithWompi}
                  className="w-full py-3 px-4 rounded-xl bg-[#041f5e] hover:bg-[#0a3596] active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-2">
                    {isWompiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-[#ff7700]" />
                    )}
                    <span>
                      {isWompiLoading ? 'Iniciando Wompi...' : `Pagar con Wompi (${selectedCheckoutPlan === 'yearly' ? '$299.000' : '$29.900'} COP)`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-200 font-semibold">
                    <span>Nequi</span>
                    <span>•</span>
                    <span>PSE</span>
                    <span>•</span>
                    <span>Bancolombia</span>
                    <span>•</span>
                    <span>Tarjetas</span>
                  </div>
                </button>

                <div className="text-center space-y-1">
                  <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Pasarela oficial Wompi Bancolombia · Cifrado SHA-256
                  </p>
                  <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md py-0.5 px-2 font-medium inline-block">
                    Modo Pruebas activo (Sandbox) · No se realizarán cobros reales
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowCheckoutModal(false)}
              className="mt-4 w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Edit Image (Banner or Logo) Modal */}
      {imageModalConfig?.isOpen && (
        <EditBusinessImageModal
          isOpen={imageModalConfig.isOpen}
          onClose={() => setImageModalConfig(null)}
          type={imageModalConfig.type}
          currentImage={imageModalConfig.type === 'banner' ? profileCoverImage : profileLogo}
          onSave={handleSaveImageModal}
          businessName={displayName}
        />
      )}

      {/* Interactive Location Picker Modal (Edit Mode) */}
      {isLocationPickerOpen && (
        <React.Suspense fallback={null}>
          <LocationPickerModal
            isOpen={isLocationPickerOpen}
            onClose={() => setIsLocationPickerOpen(false)}
            onSelectLocation={handleLocationSelected}
            initialAddress={profileAddress}
            initialCoordinates={profileCoordinates}
            cityName={profileCity}
            sectorName={profileSector}
            businessName={displayName}
          />
        </React.Suspense>
      )}

      {/* Interactive Location View Modal with OleVeci Pin (View Mode) */}
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

      {/* Edit Post Modal */}
      {editingPost !== null && (
        <CreatePostModal
          isOpen={true}
          onClose={() => setEditingPost(null)}
          editingPost={editingPost}
          onPostCreated={(updatedPost) => {
            onSelectPost(updatedPost);
          }}
        />
      )}

      {/* Merchant Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        title="Notificaciones y Avisos"
        subtitle={`Mensajes de moderación y estado de ${business.name}`}
        items={formattedBizNotifications}
        onMarkAllAsRead={() => {
          currentBizNotifications.forEach((n) => {
            if (!n.read) markBusinessNotificationAsRead(n.id);
          });
        }}
        onClearAll={() => clearBusinessNotifications(business.id)}
      />

      {/* Business Review Request Modal */}
      {showBusinessReviewModal && business.status !== 'pending_review' && (() => {
        const suspensionGuide = getBusinessSuspensionGuide(business.suspensionReason);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Solicitud de Revisión de Suspensión
                    </h3>
                    <p className="text-xs text-slate-500">
                      Envía tus correcciones y justificación al equipo de administración
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBusinessReviewModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                {/* 1. Pasos y recomendaciones contextuales de Corrección y Saneamiento (Ampliar / Reducir) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 transition-all">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        {suspensionGuide.iconType === 'posts' && <FileText className="w-4 h-4" />}
                        {suspensionGuide.iconType === 'contact' && <MapPin className="w-4 h-4" />}
                        {suspensionGuide.iconType === 'reports' && <MessageCircle className="w-4 h-4" />}
                        {suspensionGuide.iconType === 'security' && <ShieldCheck className="w-4 h-4" />}
                        {suspensionGuide.iconType === 'custom' && <Sparkles className="w-4 h-4" />}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words">
                        Consejos Prácticos
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSanitationExpanded((prev) => !prev)}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0"
                      title={isSanitationExpanded ? 'Reducir' : 'Ampliar'}
                      aria-label={isSanitationExpanded ? 'Reducir' : 'Ampliar'}
                    >
                      {isSanitationExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>

                  {isSanitationExpanded && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {suspensionGuide.explanationIntro}
                      </p>

                      <div className="space-y-2.5">
                        {suspensionGuide.steps.map((step) => (
                          <div key={step.number} className="flex items-start gap-2.5 text-[11px]">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                              {step.number}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900">{step.title}</p>
                              <p className="text-slate-600 mt-0.5 leading-relaxed">{step.description}</p>
                              {step.actionTab && step.actionLabel && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowBusinessReviewModal(false);
                                    setActiveTab(step.actionTab!);
                                  }}
                                  className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                  <span>{step.actionLabel}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Histórico cronológico de moderación (Ampliar / Reducir) */}
                <SuspensionTimeline business={business} collapsible={true} defaultExpanded={true} />

                {/* 3. Sección de respuesta: Botón '+' para crear el cuadrito amarillo o el cuadrito en edición */}
                {!isWritingReview ? (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsWritingReview(true)}
                      className="w-full p-3.5 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50/80 text-slate-800 transition cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
                    >
                      <div className="flex items-center gap-3 text-left min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
                          <Plus className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5 flex-wrap">
                            <span>Solicitar Revisión del Comercio</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-900 border border-amber-300">
                              Comentario del Cliente
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-600">
                            Haz clic en el botón <strong>+</strong> para redactar tu justificación y enviar tus correcciones a moderación.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition shrink-0 flex items-center gap-1">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Responder</span>
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="relative pl-6 animate-in fade-in duration-200">
                    {/* Indicador de nodo circular amarillo con el signo + en la línea de tiempo */}
                    <div
                      className="absolute left-0 top-3.5 w-5 h-5 rounded-full bg-amber-500 text-white ring-4 ring-amber-100 flex items-center justify-center font-bold text-[10px] shadow-xs"
                      title="Nueva Solicitud de Revisión"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    {/* Cuadrito amarillo idéntico a los del historial */}
                    <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/60 text-xs space-y-2.5 shadow-xs transition-all">
                      {/* Encabezado: Título + Badge 'Comentario del Cliente' + Fecha/Estado + Botón cerrar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-amber-200/80 pb-2">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span className="font-bold text-slate-900 break-words text-xs">
                            Solicitud de Revisión
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 bg-amber-100 text-amber-900 border-amber-300">
                            Comentario del Cliente
                          </span>
                          {isReviewDraftSaved ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Borrador guardado</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-900 shrink-0">
                              En redacción
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium shrink-0">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>Ahora</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsWritingReview(false)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-amber-200/50 transition cursor-pointer"
                            title="Cerrar redacción"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Autor del comentario */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 flex-wrap">
                        <Store className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="break-words">
                          Comentado por: <strong className="text-slate-800">{business.name || 'Comercio'}</strong> (Cliente / Comercio)
                        </span>
                      </div>

                      {/* Comentario y justificación: Vista de validación o Edición */}
                      <div className="space-y-1.5">
                        {isReviewDraftSaved ? (
                          <div
                            onClick={() => setIsReviewDraftSaved(false)}
                            className="group p-3 rounded-lg bg-white/95 border border-amber-300 text-slate-800 text-xs leading-relaxed font-medium whitespace-pre-wrap shadow-2xs hover:border-amber-400 cursor-pointer transition"
                            title="Haz clic para volver a editar"
                          >
                            {businessCorrectionNote.trim() ? (
                              <span>{businessCorrectionNote}</span>
                            ) : (
                              <span className="italic text-slate-400">
                                (Borrador sin texto. Haz clic aquí o en "Editar" para redactar tu justificación).
                              </span>
                            )}
                            <div className="mt-2.5 pt-2 border-t border-amber-100/90 flex items-center justify-between text-[11px]">
                              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Borrador validado, listo para enviar a moderación</span>
                              </span>
                              <span className="text-amber-800 font-bold group-hover:underline flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                <span>Editar</span>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={businessCorrectionNote}
                              onChange={(e) => {
                                setBusinessCorrectionNote(e.target.value);
                                if (e.target.value.trim()) {
                                  localStorage.setItem(`oleveci_review_draft_${business.id}`, e.target.value);
                                }
                              }}
                              placeholder={suspensionGuide.placeholder}
                              className="w-full p-2.5 rounded-lg bg-white/95 border border-amber-300 text-slate-800 text-xs focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-hidden leading-relaxed font-medium placeholder:text-slate-400 resize-none shadow-2xs"
                              autoFocus
                            />
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (businessCorrectionNote.trim()) {
                                    localStorage.setItem(`oleveci_review_draft_${business.id}`, businessCorrectionNote);
                                  }
                                  setIsReviewDraftSaved(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Guardar borrador</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBusinessReviewModal(false);
                    setIsWritingReview(false);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                {isWritingReview && isReviewDraftSaved && (
                  <button
                    type="button"
                    onClick={() => setIsReviewDraftSaved(false)}
                    className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar borrador</span>
                  </button>
                )}
                {!isWritingReview ? (
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Solicitar Revisión</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const noteToSend =
                        businessCorrectionNote.trim() ||
                        'Se han realizado las correcciones solicitadas.';
                      submitBusinessCorrection(business.id, undefined, noteToSend);
                      localStorage.removeItem(`oleveci_review_draft_${business.id}`);
                      setShowBusinessReviewModal(false);
                      setIsWritingReview(false);
                      setIsReviewDraftSaved(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar a Moderación</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

