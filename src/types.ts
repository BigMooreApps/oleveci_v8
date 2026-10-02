/**
 * Data types and interfaces for OleVeci
 */

export type RoleMode = 'home' | 'explorer' | 'plans' | 'directory' | 'business' | 'admin' | 'maps';

export type PostType = string;

export interface PostTypeConfig {
  id: string; // e.g. 'promotion', 'product', 'service', 'event', or custom
  label: string; // Display label
  slug?: string;
  order?: number;
  iconName?: string;
  icon?: string;
  color?: string;
  badgeBg?: string;
  badgeText?: string;
  description?: string;
}

export type SubscriptionStatus = 'active' | 'expired' | 'trial' | 'past_due';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface Municipality {
  id: string;
  name: string;
  department: string;
  coordinates: LocationCoordinates;
  code?: string;
  isPilot?: boolean;
  isActive?: boolean;
}

export interface CitySector {
  id: string;
  name: string;
  cityName: string;
  coordinates: LocationCoordinates;
  type?: 'urban' | 'rural' | 'corregimiento';
  radiusMeters?: number;
}

export type Sector = CitySector;

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description?: string;
  color?: string;
}

export interface PlanCategory {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  iconName: string; // Lucide icon name or emoji
  color: string;
  badgeBg?: string;
  badgeText?: string;
  allowedCategoryIds: string[]; // Category IDs associated with this plan
  maxMainDishes?: number; // e.g. 1 to prevent multiple heavy meals (e.g. burger + wings)
  preventDuplicateCategories?: boolean; // Avoid 2 stops of the exact same business category
  defaultTitleSuggestions?: string[];
  isActive: boolean;
  order?: number;
}

export interface BusinessMetrics {
  views: number;
  whatsappClicks: number;
  mapsClicks: number;
  calls: number;
  shares: number;
}

export interface BusinessBillingInfo {
  legalName: string;
  documentType: 'NIT' | 'CC' | 'CE';
  documentNumber: string;
  verificationDigit?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department?: string;
  taxRegime: 'simplificado' | 'comun';
}

export interface BusinessPaymentRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  planName: string;
  amountCOP: number;
  taxCOP: number;
  totalCOP: number;
  paymentMethod: 'wompi' | 'pse' | 'card' | 'nequi' | 'daviplata' | 'transfer' | 'cash';
  paymentDetails: {
    bankName?: string;
    cardLast4?: string;
    phone?: string;
    authCode: string;
    rejectionReason?: string;
  };
  status: 'approved' | 'rejected' | 'pending';
}

export interface SuspensionHistoryEntry {
  id: string;
  type: 'suspension' | 'review_request' | 'review_rejection' | 'reactivation';
  title: string;
  note: string;
  timestamp: string; // ISO date string
  authorRole: 'admin' | 'business';
  authorName?: string;
  badge?: string;
  incidentNumber?: number; // 1, 2, 3...
  reasonPreset?: string;
}

export interface BusinessSuspensionStats {
  totalSuspensions: number;
  totalReactivations: number;
  totalReviewRequests: number;
  totalRejections: number;
  totalEvents: number;
  lastSuspensionDate?: string;
  lastSuspensionReason?: string;
  lastReactivationDate?: string;
  isCurrentlySuspended: boolean;
  isCurrentlyPendingReview: boolean;
  recidivismLevel: 'none' | 'warning' | 'high';
  recidivismBadge: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  description: string;
  categoryId: string;
  subCategory: string;
  address: string;
  city: string;
  sector: string;
  coordinates: LocationCoordinates;
  hours: string;
  whatsapp: string;
  phone: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  rating: number;
  verified: boolean;
  featured: boolean;
  status: 'active' | 'pending' | 'suspended' | 'pending_review';
  suspensionReason?: string;
  suspendedAt?: string;
  reviewStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  reviewRequestedAt?: string;
  correctionNote?: string;
  lastReviewedAt?: string;
  rejectionReason?: string;
  suspensionHistory?: SuspensionHistoryEntry[];
  subscription: {
    status: SubscriptionStatus;
    planName: string;
    priceCOP: number;
    billingCycle: 'monthly' | 'yearly';
    expiresAt: string; // ISO date string
    autoRenew: boolean;
    reminders?: {
      auto7Days?: boolean;
      auto15Days?: boolean;
      lastSentAt?: string;
      lastSentType?: '7_days' | '15_days' | 'manual';
    };
  };
  billingInfo?: BusinessBillingInfo;
  paymentHistory?: BusinessPaymentRecord[];
  accessPin?: string;
  accessEmail?: string;
  accessPassword?: string;
  username?: string; // Consecutivo autogenerado único: OLE0101, OLE0102, etc. (No modificable)
  password?: string; // Contraseña de acceso a la plataforma (por defecto "Veci2026")
  ownerName?: string;
  ownerPhone?: string;
  metrics: BusinessMetrics;
  createdAt: string;
}

export type ValidityMode = 'table' | 'quick' | 'days_of_week' | 'happy_hour' | 'specific_date' | 'indefinite';

export interface DayScheduleRow {
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  dayIndex: number; // 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado, 0 = Domingo
  active: boolean;
  horaInicio: string; // "HH:MM"
  horaFin: string; // "HH:MM"
  fechaInicio?: string; // "YYYY-MM-DD" (opcional)
  fechaFin?: string; // "YYYY-MM-DD" (opcional)
}

export interface ValiditySchedule {
  mode: ValidityMode;
  scheduleTable?: DayScheduleRow[];
  validoDesde?: string; // Fecha de inicio de la vigencia (YYYY-MM-DD)
  validoHasta?: string; // Fecha en que se terminará la publicación (YYYY-MM-DD)
  validoHastaHora?: string; // Hora límite de vencimiento (HH:MM) - opcional
  quickPreset?: string; // e.g. 'today_10pm', 'today_night', 'tomorrow', 'weekend', '3_days'
  daysOfWeek?: number[]; // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado
  hasTimeRange?: boolean;
  startTime?: string; // "14:00"
  endTime?: string; // "18:00"
  specificDate?: string; // "YYYY-MM-DD"
  exactTime?: string; // "22:00"
  startDate?: string;
  endDate?: string;
  note?: string; // e.g. "Hasta agotar existencias"
}

export interface Post {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  businessCity: string;
  businessSector: string;
  businessWhatsapp: string;
  businessPhone: string;
  businessAddress: string;
  coordinates: LocationCoordinates;
  type: PostType;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  imagePosition?: { x: number; y: number };
  imageScale?: number;
  imageFit?: 'cover' | 'contain';
  imageFilter?: string;
  originalPrice?: number;
  promotionalPrice?: number;
  startsAt: string; // ISO string
  expiresAt?: string; // ISO string - crucial for promotions and events
  expiryLabel?: string; // e.g. "Hoy hasta las 9:00 PM"
  validitySchedule?: ValiditySchedule;
  categoryId: string;
  planCategoryId?: string;
  planCategoryName?: string;
  isPlan?: boolean;
  planData?: any;
  planStops?: Post[];
  featured?: boolean;
  tags: string[];
  status?: 'active' | 'suspended' | 'pending_review';
  suspended?: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  reviewStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  reviewRequestedAt?: string;
  lastCorrectionAt?: string;
  correctionNote?: string;
  lastReviewedAt?: string;
  rejectionReason?: string;
  suspensionHistory?: SuspensionHistoryEntry[];
  createdAt: string;
  metrics: {
    views: number;
    whatsappClicks: number;
    mapsClicks: number;
    calls: number;
    shares: number;
  };
}

export interface BusinessNotification {
  id: string;
  businessId: string;
  type:
    | 'post_suspended'
    | 'post_reactivated'
    | 'post_approved'
    | 'post_rejected'
    | 'review_requested'
    | 'policy_warning'
    | 'general'
    | 'business_suspended'
    | 'business_reactivated'
    | 'business_review_requested'
    | 'business_approved'
    | 'business_rejected';
  title: string;
  message: string;
  postId?: string;
  postTitle?: string;
  reason?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationPreference {
  enabled: boolean;
  promotions: boolean;
  events: boolean;
  newBusinesses: boolean;
  categories: string[]; // Category IDs
}

export interface SystemAnalytics {
  totalUsersServed: number;
  totalWhatsAppLeads: number;
  totalMapsDirections: number;
  activeBusinessesCount: number;
  activeSubscribersRevenueCOP: number;
}

export interface SuperAdminProfile {
  username: string; // e.g. "Admin"
  password: string; // e.g. "Ole2026"
  fullName: string;
  phone: string;
  email: string;
  supportEmail: string;
  roleTitle: string;
  municipality: string;
  whatsappSupport: string;
  supportHours: string;
  securityNotes?: string;
  lastLoginAt?: string;
}
