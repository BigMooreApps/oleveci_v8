/**
 * Wompi Colombia Checkout Widget Integration
 * Documentación oficial: https://docs.wompi.co/docs/colombia/widget-checkout-web/
 */

export interface WompiCustomerData {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  phoneNumberPrefix?: string;
  legalId?: string;
  legalIdType?: 'CC' | 'CE' | 'NIT' | 'PP' | 'TI' | 'DNI' | 'RG' | 'OTHER';
}

export interface WompiWidgetConfig {
  currency: string; // 'COP'
  amountInCents: number; // e.g. 2990000 para $29.900 COP
  reference: string;
  publicKey: string;
  signature?: {
    integrity: string;
  };
  redirectUrl?: string;
  expirationTime?: string;
  taxInCents?: {
    vat?: number;
    consumption?: number;
  };
  customerData?: WompiCustomerData;
}

export interface WompiTransaction {
  id: string;
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
  reference: string;
  amountInCents: number;
  currency: string;
  paymentMethodType?: string;
  paymentMethod?: {
    type?: string;
    extra?: Record<string, unknown>;
    installments?: number;
  };
  statusMessage?: string;
}

export interface WompiCheckoutResult {
  transaction?: WompiTransaction;
  error?: unknown;
}

declare global {
  interface Window {
    WidgetCheckout?: new (config: WompiWidgetConfig) => {
      open: (callback: (result: WompiCheckoutResult) => void) => void;
    };
  }
}

// Configuración de llaves de Wompi (Pruebas / Sandbox)
export const WOMPI_CONFIG = {
  publicKey: 'pub_test_JAtNkfPRS3E9HnQrw6DNbKQoEhPLDOCb',
  integritySecret: 'test_integrity_BVNqrZB4SzW85EwjB9nvk4knLesN6KwS',
  widgetScriptUrl: 'https://checkout.wompi.co/widget.js',
  currency: 'COP',
};

/**
 * Calcula la firma de integridad SHA-256 requerida por Wompi:
 * SHA256(referencia + montoEnCentavos + moneda + [expirationTime] + secretoIntegridad)
 */
export async function calculateIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string = 'COP',
  secret: string = WOMPI_CONFIG.integritySecret,
  expirationTime?: string
): Promise<string> {
  // Intentar obtener la firma firmada en el backend primero (mayor seguridad)
  try {
    const res = await fetch('/api/wompi/signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, amountInCents, currency, expirationTime }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.signature) {
        return data.signature;
      }
    }
  } catch {
    // Si la ruta backend no está disponible en este entorno, calcular vía Web Crypto API
  }

  // Fallback seguro en cliente usando Web Crypto API nativa
  const rawString = `${reference}${amountInCents}${currency}${expirationTime || ''}${secret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Asegura que el script oficial de Wompi esté cargado en la página
 */
export function loadWompiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.WidgetCheckout) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src="${WOMPI_CONFIG.widgetScriptUrl}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('No se pudo cargar el script de Wompi')));
      return;
    }

    const script = document.createElement('script');
    script.src = WOMPI_CONFIG.widgetScriptUrl;
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Error al conectar con la pasarela de pagos Wompi'));
    document.head.appendChild(script);
  });
}

/**
 * Abre el Widget de Wompi y retorna una Promesa con el resultado de la transacción
 */
export async function openWompiCheckoutModal(params: {
  reference: string;
  amountInCents: number;
  customerData?: WompiCustomerData;
  planName?: string;
  redirectUrl?: string;
}): Promise<WompiCheckoutResult> {
  await loadWompiScript();

  if (!window.WidgetCheckout) {
    throw new Error('El Widget de Wompi no se encuentra inicializado.');
  }

  // Calcular la firma de integridad SHA256 obligatoria
  const integritySignature = await calculateIntegritySignature(
    params.reference,
    params.amountInCents,
    WOMPI_CONFIG.currency
  );

  let activePublicKey = WOMPI_CONFIG.publicKey;
  try {
    const cfgRes = await fetch('/api/wompi/config');
    if (cfgRes.ok) {
      const cfgData = await cfgRes.json();
      if (cfgData.publicKey) {
        activePublicKey = cfgData.publicKey;
      }
    }
  } catch {
    // Usar fallback
  }

  return new Promise((resolve) => {
    const checkout = new window.WidgetCheckout!({
      currency: WOMPI_CONFIG.currency,
      amountInCents: params.amountInCents,
      reference: params.reference,
      publicKey: activePublicKey,
      signature: {
        integrity: integritySignature,
      },
      customerData: params.customerData,
      redirectUrl: params.redirectUrl,
    });

    checkout.open((result: WompiCheckoutResult) => {
      resolve(result);
    });
  });
}
