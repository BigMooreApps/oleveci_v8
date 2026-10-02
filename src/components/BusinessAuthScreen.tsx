import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BusinessBillingInfo, BusinessPaymentRecord, Business } from '../types';
import { extractLocalPhone, normalizeToColombianWa } from '../utils/phoneUtils';
import { openWompiCheckoutModal } from '../utils/wompi';
import { ScheduleSelector } from './ScheduleSelector';
import { EditBusinessImageModal } from './EditBusinessImageModal';
import { RegistrationStep1Form } from './RegistrationStep1Form';

const LocationPickerModal = React.lazy(() =>
  import('./LocationPickerModal').then((m) => ({ default: m.LocationPickerModal }))
);
import {
  Store,
  Plus,
  Search,
  Receipt,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Sparkles,
  Upload,
  Lock,
  Printer,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  QrCode,
  Smartphone,
  Wallet,
  Camera,
  Map as MapIcon,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Send,
  Mail,
  Copy,
  X,
} from 'lucide-react';

interface BusinessAuthScreenProps {
  onSuccessLogin?: (businessId: string) => void;
  onCancel?: () => void;
  initialTab?: 'login' | 'register';
}

const SAMPLE_LOGOS_BY_CAT: Record<string, string[]> = {
  cat_restaurantes: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
  ],
  cat_cafes: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
  ],
  cat_belleza: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
  ],
  cat_fitness: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=600&auto=format&fit=crop&q=80',
  ],
};

const COLOMBIAN_BANKS = [
  'Bancolombia',
  'Banco Davivienda',
  'Banco de Bogotá',
  'Nequi (PSE)',
  'Daviplata (PSE)',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Popular',
  'Scotiabank Colpatria',
  'Banco AV Villas',
  'Banco Caja Social',
  'Lulo Bank',
  'Nu Colombia (Cuenta de Ahorros)',
];

export const BusinessAuthScreen: React.FC<BusinessAuthScreenProps> = ({
  onSuccessLogin,
  onCancel,
  initialTab = 'login',
}) => {
  const {
    businesses,
    categories,
    sectors,
    loginAsBusiness,
    addBusiness,
    setCurrentRole,
    requestPasswordReset,
    loginAsAdmin,
    adminProfile,
  } = useApp();

  // Primary mode: 'login' (Ingresar a negocio ya creado) or 'register' (Crear nuevo negocio)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
    if (initialTab === 'register') {
      setRegStep(1);
    }
  }, [initialTab]);

  // ----------------------------------------------------
  // LOGIN TAB STATE
  // ----------------------------------------------------
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Password reset modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetResult, setResetResult] = useState<{ success: boolean; message: string; email?: string } | null>(null);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const query = loginUsername.trim().toLowerCase();
    if (!query) {
      setLoginError('Por favor ingresa tu usuario (ej: OLE0101, Admin) o correo.');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Por favor ingresa tu contraseña.');
      return;
    }

    // 1. Verificación de acceso de Superadministrador (Usuario: Admin / Contraseña: Ole2026 o configuradas)
    const superadminUsername = (adminProfile?.username || 'Admin').trim().toLowerCase();
    const superadminEmail = (adminProfile?.email || 'admin@oleveci.com').trim().toLowerCase();

    if (query === superadminUsername || query === superadminEmail) {
      const expectedAdminPassword = (adminProfile?.password || 'Ole2026').trim();
      if (loginPassword.trim() !== expectedAdminPassword) {
        setLoginError('Contraseña de Administrador incorrecta. Por favor verifica tus credenciales.');
        return;
      }

      setIsLoggingIn(true);
      setTimeout(() => {
        loginAsAdmin(expectedAdminPassword);
        setIsLoggingIn(false);
        setCurrentRole('admin');
        if (onSuccessLogin) onSuccessLogin('admin');
      }, 400);
      return;
    }

    // 2. Verificación de comercio registrado
    const matchedBiz = businesses.find(
      (b) =>
        b.username?.toLowerCase() === query ||
        b.email?.toLowerCase() === query ||
        b.billingInfo?.email?.toLowerCase() === query ||
        b.accessEmail?.toLowerCase() === query ||
        b.id.toLowerCase() === query
    );

    if (!matchedBiz) {
      setLoginError('No encontramos un comercio con ese usuario o correo registrado.');
      return;
    }

    const expectedPassword = (matchedBiz.password || matchedBiz.accessPassword || 'Veci2026').trim();
    if (loginPassword.trim() !== expectedPassword) {
      setLoginError('Contraseña incorrecta. Por favor verifica tus credenciales de acceso.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      loginAsBusiness(matchedBiz.id);
      setIsLoggingIn(false);
      if (onSuccessLogin) onSuccessLogin(matchedBiz.id);
    }, 400);
  };

  const handleSendResetInstructions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetInput.trim()) return;
    setIsSendingReset(true);
    try {
      const res = requestPasswordReset(resetInput.trim());
      setResetResult(res);
    } finally {
      setIsSendingReset(false);
    }
  };

  // ----------------------------------------------------
  // REGISTRATION & BILLING & PAYMENT WIZARD STATE
  // ----------------------------------------------------
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);

  // Accordion open/close states (default collapsed/reducidas as requested by user)
  const [isMainInfoOpen, setIsMainInfoOpen] = useState(false);
  const [isLocationContactOpen, setIsLocationContactOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  // Cover Banner & Logo Modal State
  const [bizCoverUrl, setBizCoverUrl] = useState(
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80'
  );
  const [imageModalConfig, setImageModalConfig] = useState<{
    isOpen: boolean;
    type: 'banner' | 'logo';
  } | null>(null);

  // Dropdown states for category, city, and sector
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const catDropdownRef = useRef<HTMLDivElement>(null);

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const sectorDropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(e.target as Node)) {
        setIsSectorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Business Information Fields
  const [bizName, setBizName] = useState('');
  const [bizCategoryId, setBizCategoryId] = useState(categories[0]?.id || 'cat_restaurantes');
  const [bizSubCategory, setBizSubCategory] = useState('');
  const [bizCity, setBizCity] = useState('Cajicá');
  const [bizSector, setBizSector] = useState('Centro');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizWhatsapp, setBizWhatsapp] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizHours, setBizHours] = useState('Lunes a Sábado: 8:00 AM - 7:00 PM');
  const [bizDescription, setBizDescription] = useState('');
  const [bizLogoUrl, setBizLogoUrl] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
  );
  const [bizCoordinates, setBizCoordinates] = useState({ lat: 4.9184, lng: -74.0259 });
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Billing Data (Facturación Electrónica DIAN)
  const [billingLegalName, setBillingLegalName] = useState('');
  const [billingDocType, setBillingDocType] = useState<'NIT' | 'CC' | 'CE'>('NIT');
  const [billingDocNumber, setBillingDocNumber] = useState('');
  const [billingVerificationDigit, setBillingVerificationDigit] = useState('1');
  const [billingEmail, setBillingEmail] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('Cajicá');
  const [billingTaxRegime, setBillingTaxRegime] = useState<'simplificado' | 'comun'>('simplificado');
  const [useSameAddress, setUseSameAddress] = useState(true);

  // Plan and Payment
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'pse' | 'card' | 'nequi' | 'daviplata'>('wompi');
  const [isWompiLoading, setIsWompiLoading] = useState(false);
  const [wompiError, setWompiError] = useState<string | null>(null);
  const [wompiPendingNotice, setWompiPendingNotice] = useState<string | null>(null);
  
  // PSE form
  const [pseBank, setPseBank] = useState(COLOMBIAN_BANKS[0]);
  const [psePersonType, setPsePersonType] = useState<'natural' | 'juridica'>('natural');
  const [pseHolderName, setPseHolderName] = useState('');
  const [pseDocNumber, setPseDocNumber] = useState('');

  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardInstallments, setCardInstallments] = useState('1');

  // Wallet form (Nequi / Daviplata)
  const [walletPhone, setWalletPhone] = useState('');

  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentProcessStep, setPaymentProcessStep] = useState('');

  // Final Invoice / Receipt Confirmation Record
  const [completedPaymentRecord, setCompletedPaymentRecord] = useState<BusinessPaymentRecord | null>(null);
  const [paymentAttempts, setPaymentAttempts] = useState<BusinessPaymentRecord[]>([]);
  const [newlyCreatedBusiness, setNewlyCreatedBusiness] = useState<Business | null>(null);

  // Available cities & sectors for registration
  const availableCities = useMemo(() => {
    const list: string[] = Array.from(new Set(sectors.map((s) => s.cityName)));
    const baseList: string[] =
      list.length > 0
        ? list
        : ['Cajicá', 'Chía', 'Cogua', 'Cota', 'Gachancipá', 'Sesquilé', 'Sopó', 'Tabio', 'Tenjo', 'Tocancipá', 'Zipaquirá'];
    return [...baseList].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [sectors]);

  const availableSectors = useMemo(() => {
    const list = sectors
      .filter((s) => s.cityName.toLowerCase() === bizCity.toLowerCase())
      .map((s) => s.name);
    return (list.length > 0 ? list : ['Centro']).sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' })
    );
  }, [sectors, bizCity]);

  const handleCityChange = (newCity: string) => {
    setBizCity(newCity);
    if (useSameAddress) {
      setBillingCity(newCity);
    }
    const sectorsForNewCity = sectors
      .filter((s) => s.cityName.toLowerCase() === newCity.toLowerCase())
      .map((s) => s.name)
      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    if (sectorsForNewCity.length > 0) {
      setBizSector(sectorsForNewCity[0]);
    }
  };

  const handleBizNameChange = (val: string) => {
    setBizName(val);
    if (!billingLegalName || billingLegalName === bizName) {
      setBillingLegalName(val);
    }
  };

  const handleBizAddressChange = (val: string) => {
    setBizAddress(val);
    if (useSameAddress) {
      setBillingAddress(val);
    }
  };

  // Pricing calculations
  const planPrice = selectedPlan === 'monthly' ? 29900 : 299000;
  const ivaRate = billingTaxRegime === 'comun' ? 0.19 : 0;
  const taxAmount = Math.round(planPrice * ivaRate);
  const totalToPay = planPrice + taxAmount;

  // Format COP currency
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Auto-fill sample images when category changes
  const handleCategorySelect = (catId: string) => {
    setBizCategoryId(catId);
    const samples = SAMPLE_LOGOS_BY_CAT[catId] || SAMPLE_LOGOS_BY_CAT.default;
    if (samples && samples.length > 0 && (!bizLogoUrl || bizLogoUrl === SAMPLE_LOGOS_BY_CAT.default[0])) {
      setBizLogoUrl(samples[0]);
    }
  };

  // Step 1 Validation (Validates all 4 collapsible sections)
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!bizName.trim()) {
      errors.bizName = 'Ingresa el nombre de tu negocio o establecimiento.';
      setIsMainInfoOpen(true);
    }
    if (!bizAddress.trim()) {
      errors.bizAddress = 'Ingresa la dirección física de tu local o sede.';
      setIsLocationContactOpen(true);
    }
    if (!bizWhatsapp.trim()) {
      errors.bizWhatsapp = 'Ingresa el número de WhatsApp para recibir clientes.';
      setIsLocationContactOpen(true);
    }
    if (!billingLegalName.trim()) {
      errors.billingLegalName = 'Ingresa la razón social o nombre del titular para la factura.';
      setIsBillingOpen(true);
    }
    if (!billingDocNumber.trim()) {
      errors.billingDocNumber = 'Ingresa el número de NIT o documento.';
      setIsBillingOpen(true);
    }
    if (!billingEmail.trim() || !billingEmail.includes('@')) {
      errors.billingEmail = 'Ingresa un correo válido para el envío de la factura electrónica DIAN.';
      setIsBillingOpen(true);
    }
    if (!billingAddress.trim()) {
      errors.billingAddress = 'Ingresa la dirección fiscal de facturación.';
      setIsBillingOpen(true);
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    // Pre-fill payment details if blank
    if (!pseHolderName) setPseHolderName(billingLegalName || bizName);
    if (!pseDocNumber) setPseDocNumber(billingDocNumber);
    if (!cardHolder) setCardHolder(billingLegalName || bizName);
    if (!walletPhone) setWalletPhone(extractLocalPhone(bizWhatsapp));

    setRegStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to persist business and billing upon approved payment
  const finalizeBusinessRegistration = (
    record?: BusinessPaymentRecord,
    extraAttempts?: BusinessPaymentRecord[]
  ) => {
    // 1. Build billing info
    const billing: BusinessBillingInfo = {
      legalName: billingLegalName,
      documentType: billingDocType,
      documentNumber: billingDocNumber,
      verificationDigit: billingDocType === 'NIT' ? billingVerificationDigit : undefined,
      email: billingEmail,
      phone: billingPhone || bizWhatsapp,
      address: billingAddress,
      city: billingCity,
      department: 'Cundinamarca',
      taxRegime: billingTaxRegime,
    };

    // 2. Expiration calculation
    const days = selectedPlan === 'monthly' ? 30 : 365;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const isApproved = record?.status === 'approved';

    const fullHistory: BusinessPaymentRecord[] = [
      ...(record ? [record] : []),
      ...(extraAttempts || paymentAttempts),
    ];

    // 3. Create new Business in AppContext with cover and logo
    const created = addBusiness(
      {
        name: bizName.trim(),
        slug: bizName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logo: bizLogoUrl,
        coverImage: bizCoverUrl || bizLogoUrl,
        description: bizDescription.trim() || `Comercio local en ${bizSector}, ${bizCity}.`,
        categoryId: bizCategoryId,
        subCategory: bizSubCategory.trim() || 'Comercio Local',
        address: bizAddress.trim(),
        city: bizCity,
        sector: bizSector,
        coordinates: bizCoordinates,
        hours: bizHours.trim(),
        whatsapp: normalizeToColombianWa(bizWhatsapp),
        phone: bizPhone.trim() || bizWhatsapp.trim(),
        email: bizEmail.trim() || billingEmail.trim(),
        rating: 5.0,
        verified: selectedPlan === 'yearly',
        featured: selectedPlan === 'yearly',
        status: isApproved ? 'active' : 'suspended',
        subscription: {
          status: isApproved ? 'active' : 'expired',
          planName: selectedPlan === 'monthly' ? 'Plan Mensual OleVeci' : 'Plan Anual OleVeci',
          priceCOP: planPrice,
          billingCycle: selectedPlan,
          expiresAt: isApproved ? expiresAt : new Date().toISOString(),
          autoRenew: true,
        },
        accessPin: '1234',
      },
      billing,
      undefined,
      fullHistory
    );

    setCompletedPaymentRecord(record || fullHistory[0]);
    setNewlyCreatedBusiness(created);
    setIsProcessingPayment(false);
    setIsWompiLoading(false);
    setRegStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Process Payment & Activate Business
  const handleExecutePayment = async () => {
    if (!paymentMethod) {
      alert('Por favor selecciona un método de pago para continuar.');
      return;
    }

    if (!acceptTerms) {
      alert('Debes aceptar los Términos y Condiciones del Servicio para continuar.');
      return;
    }

    // A. FLUJO OFICIAL WOMPI COLOMBIA
    if (paymentMethod === 'wompi') {
      setIsWompiLoading(true);
      setWompiError(null);
      setWompiPendingNotice(null);

      const amountInCents = totalToPay * 100;
      const cleanSlug = (bizName || 'BIZ').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
      const reference = `OLEVECI-REG-${cleanSlug}-${Date.now()}`;
      const customerEmail = billingEmail?.trim() || 'contacto@oleveci.com';
      const rawPhone = (billingPhone || bizWhatsapp || '3000000000').replace(/\D/g, '');
      const customerPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : '3001234567';

      try {
        const result = await openWompiCheckoutModal({
          reference,
          amountInCents,
          planName: selectedPlan === 'monthly' ? 'Plan Mensual OleVeci' : 'Plan Anual OleVeci',
          customerData: {
            email: customerEmail,
            fullName: billingLegalName.trim() || bizName.trim(),
            phoneNumber: customerPhone,
            phoneNumberPrefix: '+57',
            legalId: billingDocNumber.trim() || undefined,
            legalIdType: (billingDocType === 'NIT' ? 'NIT' : 'CC') as any,
          },
        });

        const tx = result?.transaction;
        if (tx?.status === 'APPROVED') {
          const txId = tx.id || `WOMPI-${Date.now()}`;
          const invoiceNumber = `FE-WOMPI-${txId.slice(-8).toUpperCase()}`;
          const record: BusinessPaymentRecord = {
            id: `pay_wompi_${txId}`,
            invoiceNumber,
            date: new Date().toISOString(),
            planName: selectedPlan === 'monthly' ? 'Plan Mensual OleVeci' : 'Plan Anual OleVeci',
            amountCOP: planPrice,
            taxCOP: taxAmount,
            totalCOP: totalToPay,
            paymentMethod: 'wompi',
            paymentDetails: {
              bankName: tx.paymentMethodType || 'Wompi Bancolombia',
              authCode: txId,
            },
            status: 'approved',
          };
          finalizeBusinessRegistration(record);
        } else if (tx?.status === 'PENDING') {
          setWompiPendingNotice(
            `Tu transacción está en validación por tu entidad bancaria (Ref: ${tx.reference || reference}). Wompi confirmará en breve.`
          );
        } else if (tx?.status === 'DECLINED') {
          const txId = tx?.id || `WOMPI-DECLINED-${Date.now()}`;
          const rejectedRecord: BusinessPaymentRecord = {
            id: `pay_wompi_${txId}`,
            invoiceNumber: `REC-WOMPI-${txId.slice(-8).toUpperCase()}`,
            date: new Date().toISOString(),
            planName: selectedPlan === 'monthly' ? 'Plan Mensual OleVeci' : 'Plan Anual OleVeci',
            amountCOP: planPrice,
            taxCOP: taxAmount,
            totalCOP: totalToPay,
            paymentMethod: 'wompi',
            paymentDetails: {
              bankName: tx?.paymentMethodType || 'Wompi Bancolombia',
              authCode: txId,
              rejectionReason: 'Transacción rechazada por la entidad emisora o fondos insuficientes.',
            },
            status: 'rejected',
          };
          setPaymentAttempts((prev) => [rejectedRecord, ...prev]);
          setWompiError(
            'La transacción fue rechazada por la entidad bancaria. El intento ha sido guardado para tu historial de facturación.'
          );
        } else if (tx?.status === 'ERROR') {
          const txId = tx?.id || `WOMPI-ERR-${Date.now()}`;
          const rejectedRecord: BusinessPaymentRecord = {
            id: `pay_wompi_${txId}`,
            invoiceNumber: `REC-WOMPI-${txId.slice(-8).toUpperCase()}`,
            date: new Date().toISOString(),
            planName: selectedPlan === 'monthly' ? 'Plan Mensual OleVeci' : 'Plan Anual OleVeci',
            amountCOP: planPrice,
            taxCOP: taxAmount,
            totalCOP: totalToPay,
            paymentMethod: 'wompi',
            paymentDetails: {
              bankName: 'Wompi Bancolombia',
              authCode: txId,
              rejectionReason: 'Error técnico al procesar el pago en Wompi.',
            },
            status: 'rejected',
          };
          setPaymentAttempts((prev) => [rejectedRecord, ...prev]);
          setWompiError('Ocurrió un error al procesar el pago en Wompi. El intento ha sido guardado para tu historial de facturación.');
        }
      } catch (err: any) {
        console.error('Error abriendo checkout de Wompi:', err);
        setWompiError(err?.message || 'No fue posible abrir la pasarela Wompi. Por favor intenta de nuevo.');
      } finally {
        setIsWompiLoading(false);
      }
      return;
    }

    // B. FLUJO DIRECTO / SIMULACIÓN DE PRUEBA (PSE, Card, Nequi, Daviplata)
    setIsProcessingPayment(true);
    setPaymentProcessStep('Conectando de forma segura con la pasarela de pagos...');

    setTimeout(() => {
      setPaymentProcessStep('Autorizando transacción bancaria...');
    }, 800);

    setTimeout(() => {
      setPaymentProcessStep('Generando Factura Electrónica legal DIAN...');
    }, 1500);

    setTimeout(() => {
      const invoiceNumber = `FE-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const authCode = `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const record: BusinessPaymentRecord = {
        id: `pay_${Date.now()}`,
        invoiceNumber,
        date: new Date().toISOString(),
        planName: selectedPlan === 'monthly' ? 'Plan Mensual OleVeci' : 'Plan Anual OleVeci',
        amountCOP: planPrice,
        taxCOP: taxAmount,
        totalCOP: totalToPay,
        paymentMethod,
        paymentDetails: {
          bankName: paymentMethod === 'pse' ? pseBank : undefined,
          cardLast4: paymentMethod === 'card' ? cardNumber.slice(-4) || '4242' : undefined,
          phone: paymentMethod === 'nequi' || paymentMethod === 'daviplata' ? walletPhone : undefined,
          authCode,
        },
        status: 'approved',
      };

      finalizeBusinessRegistration(record);
    }, 2200);
  };

  // Image URL helpers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBizLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredRegCategories = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const query = catSearch.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(query));
  }, [categories, catSearch]);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === bizCategoryId);
  }, [categories, bizCategoryId]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-in fade-in duration-200">
      {/* Main Mode Switcher: Ingresar a negocio existente vs Crear nuevo negocio */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-200/60 border border-slate-300/60 backdrop-blur-xs shadow-inner mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'login'
              ? 'bg-gradient-to-r from-[#041f5e] via-[#082b78] to-[#0056d6] text-white shadow-md shadow-[#041f5e]/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeTab === 'login' ? 'text-[#00e5b8]' : 'text-[#041f5e]'}`} />
          <span>Ingresar a mi Espacio</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('register');
            setIsMainInfoOpen(false);
            setIsLocationContactOpen(false);
            setIsScheduleOpen(false);
            setIsBillingOpen(false);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'register'
              ? 'bg-gradient-to-r from-[#041f5e] via-[#082b78] to-[#0056d6] text-white shadow-md shadow-[#041f5e]/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Plus className={`w-4 h-4 ${activeTab === 'register' ? 'text-[#00e5b8]' : 'text-[#041f5e]'}`} />
          <span>Crear Nuevo Espacio</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INGRESAR A NEGOCIO EXISTENTE (LOGIN) */}
      {/* ========================================================================= */}
      {activeTab === 'login' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white/95 border border-slate-200/90 shadow-[0_8px_30px_rgba(4,31,94,0.06)] space-y-5">
            {/* Top brand line indicator */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#041f5e] via-[#007af7] to-[#00d8a5]" />

            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 text-[#041f5e] flex items-center justify-center shrink-0 shadow-2xs">
                <Store className="w-5 h-5 text-[#0056d6]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Bienvenido Veci!</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ingresa con tu usuario asignado o correo y contraseña para gestionar tu espacio.
                </p>
              </div>
            </div>

            {/* FORMULARIO DE ACCESO (USUARIO Y CONTRASEÑA) */}
            <form onSubmit={handleCredentialsLogin} className="space-y-4 max-w-lg mx-auto py-2">
              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Campo Usuario */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#007af7]" />
                  Usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Usuario (ej: OLE0101, Admin) o correo"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-[#F4F7FC]/70 hover:bg-[#F4F7FC] focus:bg-white focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-semibold text-slate-900 shadow-2xs font-mono transition-all"
                    required
                  />
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#007af7]" />
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer transition"
                  >
                    {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showLoginPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-[#F4F7FC]/70 hover:bg-[#F4F7FC] focus:bg-white focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-semibold text-slate-900 shadow-2xs font-mono transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="flex items-center justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetOpen(!isResetOpen);
                      setResetResult(null);
                      setResetInput(loginUsername || '');
                    }}
                    className="text-[11px] font-bold text-[#007af7] hover:text-[#041f5e] transition cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              {/* Restitución de contraseña expandible */}
              {isResetOpen && (
                <div className="p-4 rounded-2xl bg-[#F4F7FC]/80 border border-blue-200/80 shadow-sm space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#007af7]" />
                      Restitución de Contraseña
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsResetOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Ingresa tu usuario (ej. <strong>OLE0101</strong>) o correo electrónico. Te enviaremos las instrucciones de restitución inmediatamente.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={resetInput}
                      onChange={(e) => setResetInput(e.target.value)}
                      placeholder="OLE0101 o tu correo"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300/90 bg-white focus:outline-hidden focus:border-[#007af7] focus:ring-3 focus:ring-blue-500/10 shadow-2xs font-mono"
                    />
                    <button
                      type="button"
                      disabled={isSendingReset || !resetInput.trim()}
                      onClick={handleSendResetInstructions}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#041f5e] to-[#0056d6] hover:from-[#03194a] hover:to-[#0047b3] text-white font-bold text-xs shadow-md shadow-[#041f5e]/20 transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3 h-3 text-[#00e5b8]" />
                      {isSendingReset ? 'Enviando...' : 'Enviar instrucciones'}
                    </button>
                  </div>

                  {resetResult && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                        resetResult.success
                          ? 'bg-emerald-100/70 border border-emerald-200 text-emerald-800'
                          : 'bg-amber-100/70 border border-amber-200 text-amber-800'
                      }`}
                    >
                      {resetResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span>{resetResult.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#041f5e] via-[#082b78] to-[#0056d6] hover:from-[#03194a] hover:via-[#062464] hover:to-[#0047b3] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#041f5e]/25 hover:shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#00e5b8]" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar a la Plataforma</span>
                    <ArrowRight className="w-4 h-4 text-[#00e5b8]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Modern OleVeci Invitation banner */}
          <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#041f5e] via-[#072464] to-[#0d347c] text-white shadow-md border border-[#007af7]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Ambient background glow accents */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#007af7]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#ff7700]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ff7700]/25 to-amber-500/20 border border-[#ff7700]/40 text-[#ff9f1c] text-[11px] font-extrabold tracking-wide uppercase">
                <Store className="w-3.5 h-3.5 text-[#ff7700]" />
                <span>¿Quieres ser un Veci?</span>
              </div>
              <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Publica tu negocio ante toda la comunidad
              </h4>
              <p className="text-xs text-blue-100/90 font-medium">
                Promociones, catálogo por WhatsApp y presencia en el mapa desde <strong className="text-white">$29.900 COP/mes</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="relative z-10 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff7700] to-[#ff9500] hover:from-[#e66a00] hover:to-[#ff8500] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 whitespace-nowrap cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <span>Registrar Nuevo Espacio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CREAR NUEVO NEGOCIO (PLAN -> REGISTRO -> PAGO -> ACTIVACIÓN) */}
      {/* ========================================================================= */}
      {activeTab === 'register' && (
        <div className="space-y-6">
          {/* ------------------------------------------------------------------- */}
          {/* STEP 1: SELECCIÓN DEL PLAN */}
          {/* ------------------------------------------------------------------- */}
          {regStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Plan Choice Header & Cards */}
              <div className="relative overflow-hidden p-5 sm:p-7 rounded-3xl bg-white/95 border border-slate-200/90 shadow-[0_8px_30px_rgba(4,31,94,0.06)] space-y-6">
                {/* Top brand line indicator */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#041f5e] via-[#007af7] to-[#00d8a5]" />

                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#007af7]" />
                    <span>Elige el plan para activar tu Espacio</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    0% comisiones por venta. Publicaciones ilimitadas y contacto directo por WhatsApp con clientes locales.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Monthly Plan */}
                  <div
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-5 sm:p-6 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedPlan === 'monthly'
                        ? 'border-[#007af7] bg-gradient-to-b from-blue-50/60 via-white to-blue-50/20 shadow-md shadow-blue-500/10 ring-4 ring-blue-500/10'
                        : 'border-slate-200/90 bg-[#F8FAFD]/70 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[11px] font-bold">
                          Suscripción Flexible
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                            selectedPlan === 'monthly'
                              ? 'bg-[#007af7] border-[#007af7] text-white shadow-2xs'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selectedPlan === 'monthly' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Plan Mensual OleVeci</h4>
                      <p className="text-xs text-slate-500 mb-2">Cancela o renueva cuando quieras</p>
                      <div className="text-2xl sm:text-3xl font-black text-[#041f5e] mb-4">
                        $29.900 <span className="text-xs font-semibold text-slate-500">COP / mes</span>
                      </div>

                      {/* Beneficios Plan Mensual */}
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Beneficios incluidos:
                        </p>
                        <ul className="space-y-2 text-xs text-slate-700">
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>Perfil mi espacio verificado</strong> con logo, horarios y catálogo</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>Publicaciones ilimitadas</strong> de ofertas, novedades y eventos</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>Botón directo a tu WhatsApp</strong> con 0% de comisiones por venta</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>Ubicación en el mapa interactivo</strong> y botón «Cómo llegar»</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>Métricas en tiempo real</strong> de visitas, clics y clientes</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>Visibilidad en el feed local</strong> y directorio de tu municipio</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Yearly Plan */}
                  <div
                    onClick={() => setSelectedPlan('yearly')}
                    className={`p-5 sm:p-6 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedPlan === 'yearly'
                        ? 'border-[#007af7] bg-gradient-to-b from-blue-50/60 via-white to-amber-50/20 shadow-md shadow-blue-500/10 ring-4 ring-blue-500/10'
                        : 'border-slate-200/90 bg-[#F8FAFD]/70 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ff7700] to-amber-500 text-white text-[11px] font-extrabold shadow-2xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-200" />
                          <span>Ahorra 2 Meses (16% Dcto)</span>
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                            selectedPlan === 'yearly'
                              ? 'bg-[#007af7] border-[#007af7] text-white shadow-2xs'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selectedPlan === 'yearly' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Plan Anual OleVeci</h4>
                      <p className="text-xs text-slate-500 mb-2">12 meses de cobertura ininterrumpida</p>
                      <div className="mb-4">
                        <div className="text-2xl sm:text-3xl font-black text-[#041f5e]">
                          $299.000 <span className="text-xs font-semibold text-slate-500">COP / año</span>
                        </div>
                      </div>

                      {/* Beneficios Plan Anual */}
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#007af7]">
                            Todo lo del plan mensual, más:
                          </p>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700">
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-[#007af7] flex items-center justify-center shrink-0 mt-0.5">
                              <Sparkles className="w-2.5 h-2.5 stroke-[2.5]" />
                            </div>
                            <span><strong>Ahorro inmediato de $59.800 COP</strong> frente al pago mensual</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-[#007af7] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>12 meses ininterrumpidos</strong> de servicio sin cortes ni renovaciones</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-[#007af7] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>Posicionamiento prioritario</strong> en explorador, feed y búsquedas</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-[#007af7] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>Insignia destacada</strong> de comercio anual verificado en tu perfil</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-[#007af7] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>Soporte preferencial</strong> para carga de catálogo, menú y fotos</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-[#007af7] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span><strong>Mayor reputación y confianza</strong> ante vecinos de tu comunidad</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust / Guarantee Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F4F7FC]/80 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-[#ff7700] border border-orange-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">0% Comisiones</div>
                      <div className="text-[11px] text-slate-500">Tus ventas por WhatsApp van 100% a ti</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-[#007af7] border border-blue-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Sin Contratos Forzosos</div>
                      <div className="text-[11px] text-slate-500">Libertad total, sin cláusulas de permanencia</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 border border-emerald-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Activación Inmediata</div>
                      <div className="text-[11px] text-slate-500">Comienza a recibir vecilovers locales hoy mismo</div>
                    </div>
                  </div>
                </div>

                {/* Plan navigation action buttons */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (onCancel) {
                        onCancel();
                      } else {
                        setActiveTab('login');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Cancelar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#041f5e] via-[#082b78] to-[#0056d6] hover:from-[#03194a] hover:via-[#062464] hover:to-[#0047b3] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#041f5e]/25 hover:shadow-lg hover:shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Continuar con Datos de mi espacio</span>
                    <ArrowRight className="w-4 h-4 text-[#00e5b8]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* STEP 2: INFORMACIÓN DEL NEGOCIO & FACTURACIÓN */}
          {/* ------------------------------------------------------------------- */}
          {regStep === 2 && (
            <RegistrationStep1Form
              bizName={bizName}
              onBizNameChange={handleBizNameChange}
              bizSubCategory={bizSubCategory}
              setBizSubCategory={setBizSubCategory}
              bizCategoryId={bizCategoryId}
              onCategorySelect={handleCategorySelect}
              categories={categories}
              bizDescription={bizDescription}
              setBizDescription={setBizDescription}
              bizCity={bizCity}
              onCityChange={handleCityChange}
              availableCities={availableCities}
              bizSector={bizSector}
              setBizSector={setBizSector}
              availableSectors={availableSectors}
              bizAddress={bizAddress}
              onBizAddressChange={handleBizAddressChange}
              onOpenMapPicker={() => setIsLocationPickerOpen(true)}
              bizWhatsapp={bizWhatsapp}
              setBizWhatsapp={setBizWhatsapp}
              bizPhone={bizPhone}
              setBizPhone={setBizPhone}
              bizEmail={bizEmail}
              setBizEmail={setBizEmail}
              bizHours={bizHours}
              setBizHours={setBizHours}
              bizLogoUrl={bizLogoUrl}
              bizCoverUrl={bizCoverUrl}
              onOpenImageModal={(type) => setImageModalConfig({ isOpen: true, type })}
              billingLegalName={billingLegalName}
              setBillingLegalName={setBillingLegalName}
              billingDocType={billingDocType}
              setBillingDocType={setBillingDocType}
              billingDocNumber={billingDocNumber}
              setBillingDocNumber={setBillingDocNumber}
              billingVerificationDigit={billingVerificationDigit}
              setBillingVerificationDigit={setBillingVerificationDigit}
              billingEmail={billingEmail}
              setBillingEmail={setBillingEmail}
              billingPhone={billingPhone}
              setBillingPhone={setBillingPhone}
              billingAddress={billingAddress}
              setBillingAddress={setBillingAddress}
              billingCity={billingCity}
              setBillingCity={setBillingCity}
              billingTaxRegime={billingTaxRegime}
              setBillingTaxRegime={setBillingTaxRegime}
              useSameAddress={useSameAddress}
              setUseSameAddress={setUseSameAddress}
              isMainInfoOpen={isMainInfoOpen}
              setIsMainInfoOpen={setIsMainInfoOpen}
              isLocationContactOpen={isLocationContactOpen}
              setIsLocationContactOpen={setIsLocationContactOpen}
              isBillingOpen={isBillingOpen}
              setIsBillingOpen={setIsBillingOpen}
              formErrors={formErrors}
              onSubmit={handleContinueToStep3}
              onCancel={() => {
                setRegStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* ------------------------------------------------------------------- */}
          {/* STEP 3: MÉTODO DE PAGO Y CONFIRMACIÓN */}
          {/* ------------------------------------------------------------------- */}
          {regStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Selected Plan Recap Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F7FC]/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/70 text-[#ff7700] flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <CreditCard className="w-5 h-5 text-[#ff7700]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Seleccionado</span>
                    <h4 className="text-sm font-bold text-[#041f5e]">
                      {selectedPlan === 'monthly' ? 'Plan Mensual OleVeci ($29.900 COP/mes)' : 'Plan Anual OleVeci ($299.000 COP/año)'}
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRegStep(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-[#007af7] hover:text-[#041f5e] hover:underline self-start sm:self-center cursor-pointer transition"
                >
                  Cambiar Plan
                </button>
              </div>

              {/* Payment Methods */}
              <div className="relative overflow-hidden p-5 sm:p-7 rounded-3xl bg-white/95 border border-slate-200/90 shadow-[0_8px_30px_rgba(4,31,94,0.06)] space-y-5">
                {/* Top brand line indicator */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#041f5e] via-[#007af7] to-[#00d8a5]" />

                <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-extrabold text-[#041f5e] tracking-tight">
                    Selecciona el método de pago
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Pasarela Wompi Bancolombia Oficial
                  </span>
                </div>

                {/* Wompi Pasarela Oficial Unificada */}

                {/* WOMPI TRUST & PAYMENT METHODS CARD */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFD] border border-blue-200/80 space-y-3.5 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#041f5e] to-[#0056d6] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ShieldCheck className="w-5 h-5 text-[#00e5b8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-black text-[#041f5e]">Wompi Bancolombia</h5>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          Activa
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Paga en tiempo real con cifrado de seguridad SHA-256 respaldado por Bancolombia. Al hacer clic en el botón de abajo se abrirá la pasarela con todos tus medios de pago:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center gap-2 shadow-2xs">
                      <Smartphone className="w-4 h-4 text-purple-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold text-slate-800">Nequi</span>
                        <span className="block text-[10px] text-slate-400">Push al móvil</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center gap-2 shadow-2xs">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold text-slate-800">PSE Débito</span>
                        <span className="block text-[10px] text-slate-400">Todos los bancos</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center gap-2 shadow-2xs">
                      <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold text-slate-800">Bancolombia</span>
                        <span className="block text-[10px] text-slate-400">Transferencia</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center gap-2 shadow-2xs">
                      <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold text-slate-800">Tarjetas</span>
                        <span className="block text-[10px] text-slate-400">Crédito o Débito</span>
                      </div>
                    </div>
                  </div>

                  {wompiError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{wompiError}</span>
                    </div>
                  )}

                  {wompiPendingNotice && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{wompiPendingNotice}</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown / Invoice Summary */}
                <div className="p-4 rounded-2xl bg-[#F4F7FC]/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Subtotal {selectedPlan === 'monthly' ? 'Mensual' : 'Anual'}:</span>
                    <span className="font-semibold">{formatCOP(planPrice)}</span>
                  </div>
                  {taxAmount > 0 ? (
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>IVA (19% Régimen Común):</span>
                      <span className="font-semibold">{formatCOP(taxAmount)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>IVA:</span>
                      <span>$0 COP (No responsable)</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#041f5e]">Total a Pagar hoy:</span>
                    <span className="text-lg font-black text-[#ff7700]">{formatCOP(totalToPay)}</span>
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded text-[#007af7] focus:ring-[#007af7]"
                  />
                  <span>
                    Acepto los Términos del Servicio Comercial y la Política de Facturación Electrónica de OleVeci.
                  </span>
                </label>

                {/* Processing Overlay Simulation */}
                {isProcessingPayment && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#041f5e] to-[#0056d6] text-white flex items-center gap-3 animate-pulse shadow-md">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <div className="text-xs font-bold">
                      <p>{paymentProcessStep}</p>
                      <p className="text-[10px] text-blue-200 font-normal">Por favor, no cierres esta ventana...</p>
                    </div>
                  </div>
                )}

                {/* Notificación si hay intentos previos rechazados */}
                {paymentAttempts.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Tienes {paymentAttempts.length} intento(s) previo(s) registrado(s)</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      El intento rechazado quedará guardado en el historial de facturación de tu comercio. Puedes reintentar con Wompi o guardar tu comercio ahora y activar la suscripción más tarde desde tu panel.
                    </p>
                    <button
                      type="button"
                      onClick={() => finalizeBusinessRegistration(undefined, paymentAttempts)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                    >
                      Crear negocio con pago pendiente y revisar historial
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => {
                    setRegStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Información</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment || isWompiLoading}
                  onClick={handleExecutePayment}
                  className="px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#041f5e] via-[#082b78] to-[#0056d6] hover:from-[#03194a] hover:via-[#062464] hover:to-[#0047b3] text-white text-xs sm:text-sm font-black transition shadow-lg shadow-[#041f5e]/25 hover:shadow-xl hover:shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWompiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#00e5b8]" />
                      <span>Abriendo Pasarela Wompi...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#00e5b8]" />
                      <span>Pagar {formatCOP(totalToPay)} con Wompi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* STEP 4: COMPROBANTE Y ACTIVACIÓN EXITOSA / RECHAZO */}
          {/* ------------------------------------------------------------------- */}
          {regStep === 4 && completedPaymentRecord && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              {/* Success / Pending Hero Banner */}
              {completedPaymentRecord.status === 'approved' ? (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">
                    ¡Pago Aprobado y Negocio Activado!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
                    Tu comercio <strong>{bizName}</strong> ya está registrado y listo para publicar promociones y ofertas en {bizCity}.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 to-rose-700 text-white shadow-xl text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto shadow-xs">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">
                    Negocio Registrado · Pago Pendiente
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-100 max-w-md mx-auto">
                    Tu comercio <strong>{bizName}</strong> fue registrado con éxito. Tu intento de pago ha quedado archivado en tu <strong>historial de facturación</strong>. Puedes reintentar el pago cuando desees desde tu panel.
                  </p>
                </div>
              )}

              {/* Printable Invoice / Factura Electrónica Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      {completedPaymentRecord.status === 'approved' ? 'Comprobante de Pago & Factura' : 'Registro de Intento de Pago'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {completedPaymentRecord.invoiceNumber}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {completedPaymentRecord.status === 'approved' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Transacción Aprobada</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Transacción Rechazada</span>
                      </span>
                    )}
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                      title="Imprimir comprobante"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {completedPaymentRecord.status === 'rejected' && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Motivo del Rechazo:</span>
                      <span>
                        {completedPaymentRecord.paymentDetails?.rejectionReason ||
                          'La transacción no fue autorizada por la entidad financiera. No se realizó ningún cargo.'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Establecimiento Registrado:</span>
                    <p className="font-bold text-slate-900">{bizName}</p>
                    <p className="text-slate-500">{bizAddress}, {bizSector}, {bizCity}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Facturado a:</span>
                    <p className="font-bold text-slate-900">{billingLegalName}</p>
                    <p className="text-slate-500">
                      {billingDocType}: {billingDocNumber}{billingVerificationDigit ? `-${billingVerificationDigit}` : ''}
                    </p>
                    <p className="text-slate-500">{billingEmail}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Plan Comercial:</span>
                    <p className="font-bold text-slate-900">{completedPaymentRecord.planName}</p>
                    <p className={completedPaymentRecord.status === 'approved' ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                      {completedPaymentRecord.status === 'approved' ? 'Vigencia activa' : 'Pendiente de pago'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Método de Pago:</span>
                    <p className="font-bold text-slate-900 uppercase">
                      {completedPaymentRecord.paymentMethod === 'wompi'
                        ? 'Wompi Oficial (Bancolombia)'
                        : completedPaymentRecord.paymentMethod}
                    </p>
                    {completedPaymentRecord.paymentDetails.bankName && (
                      <p className="text-xs text-slate-500">{completedPaymentRecord.paymentDetails.bankName}</p>
                    )}
                    <p className="text-slate-500">
                      Cód. Autorización: {completedPaymentRecord.paymentDetails.authCode}
                    </p>
                  </div>
                </div>

                {/* Price Total Row */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-700">
                    {completedPaymentRecord.status === 'approved' ? 'Total Pagado:' : 'Total Intentado (Sin cargo):'}
                  </span>
                  <span className={`text-lg font-black ${completedPaymentRecord.status === 'approved' ? 'text-[#041f5e]' : 'text-rose-600'}`}>
                    {formatCOP(completedPaymentRecord.totalCOP)}
                  </span>
                </div>
              </div>

              {/* Action: Go to Business Dashboard */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    if (newlyCreatedBusiness) {
                      loginAsBusiness(newlyCreatedBusiness.id);
                      if (onSuccessLogin) onSuccessLogin(newlyCreatedBusiness.id);
                    } else {
                      setCurrentRole('business');
                    }
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0056d6] hover:bg-[#0047b3] text-white text-sm sm:text-base font-black transition shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 mx-auto"
                >
                  <span>
                    {completedPaymentRecord.status === 'rejected'
                      ? 'Ir al Panel y Ver Historial de Facturación'
                      : 'Ir a Mi Panel de Control del Negocio'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Map Picker Modal */}
      {isLocationPickerOpen && (
        <React.Suspense fallback={null}>
          <LocationPickerModal
            isOpen={isLocationPickerOpen}
            onClose={() => setIsLocationPickerOpen(false)}
            cityName={bizCity}
            sectorName={bizSector}
            initialAddress={bizAddress}
            initialCoordinates={bizCoordinates}
            onSelectLocation={(newAddress, newCoords) => {
              setBizAddress(newAddress);
              setBizCoordinates(newCoords);
              setIsLocationPickerOpen(false);
            }}
          />
        </React.Suspense>
      )}
    </div>
  );
};
