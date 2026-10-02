/**
 * Branding and System Configuration
 * Allows easy rebranding and multi-city expansion without altering core logic.
 */

export const APP_CONFIG = {
  name: 'OleVeci',
  domain: 'OleVeci.com',
  subName: '',
  tagline: 'Negocios locales, más cerca de ti',
  description: 'Plataforma hiperlocal para descubrir promociones, planes, productos y servicios del comercio local en tiempo real.',
  defaultCity: 'Cajicá',
  defaultDepartment: 'Cundinamarca',
  country: 'Colombia',
  countryCode: '+57',
  currency: 'COP',
  currencySymbol: '$',
  
  // Pilot market center coordinates (Parque Principal de Cajicá)
  pilotCoordinates: {
    lat: 4.9184,
    lng: -74.0259,
  },

  // Business Subscription details
  subscription: {
    monthlyPriceCOP: 29900,
    yearlyPriceCOP: 299000,
    formattedPrice: '$29.900 COP / mes',
    plans: [
      {
        id: 'plan_monthly',
        name: 'Plan Mensual OleVeci',
        priceCOP: 29900,
        billing: 'mensual',
        period: 'mes',
        features: [
          'Perfil verificado de tu negocio',
          'Publicaciones ilimitadas (promociones, productos, servicios, eventos)',
          'Contacto directo por WhatsApp sin comisiones',
          'Botón de Google Maps "Cómo llegar"',
          'Estadísticas de visualizaciones y clics en tiempo real',
          'Presencia prioritaria en el feed de tu municipio',
        ],
      },
      {
        id: 'plan_yearly',
        name: 'Plan Anual OleVeci',
        priceCOP: 299000,
        billing: 'anual',
        period: 'año',
        features: [
          'Todo lo del Plan Mensual',
          '12 meses de cobertura continua',
          'Ahorra 2 meses (16% de descuento)',
          'Soporte prioritario para configuración de catálogo',
          'Posicionamiento preferencial en búsquedas',
        ],
      },
    ],
  },
};
