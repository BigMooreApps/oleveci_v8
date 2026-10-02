import { Business, BusinessSuspensionStats, SuspensionHistoryEntry, Post } from '../types';

export type BusinessSubSection = 'posts' | 'info' | 'catalog' | 'membership' | 'metrics';

export interface SuspensionSolutionStep {
  number: number;
  title: string;
  description: string;
  actionTab?: BusinessSubSection;
  actionLabel?: string;
}

export interface SuspensionSolutionGuide {
  id: 'publications' | 'contact_info' | 'reports' | 'verification' | 'terms' | 'custom';
  categoryTitle: string;
  badge: string;
  badgeColor: string;
  iconType: 'posts' | 'contact' | 'reports' | 'security' | 'custom';
  explanationIntro: string;
  steps: SuspensionSolutionStep[];
  placeholder: string;
  primaryAction: {
    label: string;
    tab: BusinessSubSection;
  };
  secondaryAction?: {
    label: string;
    tab: BusinessSubSection;
  };
}

export function getBusinessSuspensionGuide(reason?: string): SuspensionSolutionGuide {
  const text = (reason || '').toLowerCase().trim();

  // 1. Publicación reiterada de contenido no permitido o engañoso
  if (
    text.includes('publicación') ||
    text.includes('publicacion') ||
    text.includes('contenido') ||
    text.includes('oferta') ||
    text.includes('promoción') ||
    text.includes('promocion') ||
    text.includes('anuncio')
  ) {
    return {
      id: 'publications',
      categoryTitle: 'Corrección y Saneamiento de Publicaciones',
      badge: 'Contenido y Publicaciones',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      iconType: 'posts',
      explanationIntro:
        'La suspensión se originó por publicaciones que incumplen las normas de contenido de la comunidad. Sigue estos pasos para corregirlas:',
      steps: [
        {
          number: 1,
          title: 'Revisar y depurar publicaciones activas',
          description:
            'Ve a la pestaña "Publicaciones" y examina tus anuncios, ofertas o eventos. Elimina o edita cualquier publicación que contenga precios irreales, imágenes engañosas o productos no permitidos.',
          actionTab: 'posts',
          actionLabel: 'Ir a Mis Publicaciones',
        },
        {
          number: 2,
          title: 'Ajustar descripciones y condiciones claras',
          description:
            'Asegúrate de que los textos sean transparentes y cumplan con las directrices de la plataforma (sin ofertas engañosas ni reclamos falsos).',
        },
        {
          number: 3,
          title: 'Detallar las publicaciones corregidas',
          description:
            'En el recuadro a continuación, explica qué publicaciones fueron modificadas o eliminadas para que el moderador verifique el catálogo y reactive tu comercio.',
        },
      ],
      placeholder:
        'Ejemplo: He revisado mis publicaciones activas y eliminé las 2 promociones que tenían precios o información confusa. También corregí las fotos y descripciones de los productos según las normas de OleVeci. Solicito reactivación...',
      primaryAction: {
        label: 'Revisar Mis Publicaciones',
        tab: 'posts',
      },
      secondaryAction: {
        label: 'Ver Información del Negocio',
        tab: 'info',
      },
    };
  }

  // 2. Información comercial o datos de contacto falsos / engañosos
  if (
    text.includes('contacto') ||
    text.includes('falso') ||
    text.includes('falsa') ||
    text.includes('engañ') ||
    text.includes('información comercial') ||
    text.includes('informacion comercial') ||
    text.includes('dirección') ||
    text.includes('direccion') ||
    text.includes('whatsapp') ||
    text.includes('teléfono') ||
    text.includes('telefono') ||
    text.includes('ubicación') ||
    text.includes('ubicacion')
  ) {
    return {
      id: 'contact_info',
      categoryTitle: 'Actualización de Datos de Contacto y Ubicación',
      badge: 'Datos de Contacto y Ubicación',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      iconType: 'contact',
      explanationIntro:
        'La suspensión se debe a datos de contacto, ubicación o identidad comercial inconsistentes o no comprobables. Sigue estos pasos para regularizarlos:',
      steps: [
        {
          number: 1,
          title: 'Actualizar información oficial del negocio',
          description:
            'Ve a la pestaña "Información del Negocio" y corrige tu nombre comercial, número verídico de WhatsApp, dirección física exacta en el mapa de Cajicá y horarios reales.',
          actionTab: 'info',
          actionLabel: 'Ir a Información del Negocio',
        },
        {
          number: 2,
          title: 'Verificar fotos reales del establecimiento',
          description:
            'Comprueba que el logo y la foto de portada correspondan a tu comercio real y no a imágenes genéricas o de terceros no autorizados.',
        },
        {
          number: 3,
          title: 'Especificar los datos regularizados',
          description:
            'En el recuadro a continuación, indica cuáles datos fueron actualizados para que el moderador pueda validarlos en mapa o telefónicamente.',
        },
      ],
      placeholder:
        'Ejemplo: He corregido el número de WhatsApp comercial oficial (+57...), ubicado con precisión nuestro local en el mapa de Cajicá y actualizado la foto de la fachada. Todos los datos han sido verificados...',
      primaryAction: {
        label: 'Editar Información del Negocio',
        tab: 'info',
      },
      secondaryAction: {
        label: 'Ver Mis Publicaciones',
        tab: 'posts',
      },
    };
  }

  // 3. Múltiples reportes o reclamaciones de usuarios
  if (
    text.includes('reporte') ||
    text.includes('reclamaci') ||
    text.includes('queja') ||
    text.includes('denuncia') ||
    text.includes('reclamo') ||
    text.includes('atención') ||
    text.includes('atencion') ||
    text.includes('cliente')
  ) {
    return {
      id: 'reports',
      categoryTitle: 'Resolución de Reclamaciones y Atención al Cliente',
      badge: 'Atención y Reclamos de Clientes',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
      iconType: 'reports',
      explanationIntro:
        'Se han recibido reportes o reclamaciones de clientes sobre tu servicio o atención comercial. Sigue estos pasos para solucionar la situación:',
      steps: [
        {
          number: 1,
          title: 'Atender y resolver casos pendientes con clientes',
          description:
            'Contacta a los clientes afectados a través de los canales de WhatsApp o teléfono para brindar solución a pedidos demorados, garantías o aclaraciones.',
        },
        {
          number: 2,
          title: 'Comprobar canales y tiempos de respuesta',
          description:
            'Asegúrate de que tus canales de soporte atiendan con cordialidad y rapidez durante los horarios comerciales publicados.',
          actionTab: 'info',
          actionLabel: 'Revisar Canales de Contacto',
        },
        {
          number: 3,
          title: 'Explicar las medidas y soluciones implementadas',
          description:
            'En el recuadro, detalla cómo fueron solucionadas las quejas y las medidas adoptadas para evitar nuevos reclamos en la comunidad.',
        },
      ],
      placeholder:
        'Ejemplo: Nos comunicamos directamente con los clientes que tuvieron inconvenientes con sus entregas y resolvimos satisfactoriamente cada caso con reposición del pedido. Hemos establecido un nuevo protocolo de respuesta rápida en WhatsApp...',
      primaryAction: {
        label: 'Ver Canales de Contacto',
        tab: 'info',
      },
      secondaryAction: {
        label: 'Revisar Publicaciones',
        tab: 'posts',
      },
    };
  }

  // 4. Actividad comercial no verificable o sospechosa
  if (
    text.includes('verificable') ||
    text.includes('sospechos') ||
    text.includes('actividad comercial') ||
    text.includes('legal') ||
    text.includes('autenticidad')
  ) {
    return {
      id: 'verification',
      categoryTitle: 'Verificación y Acreditación de Actividad Comercial',
      badge: 'Verificación del Comercio',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      iconType: 'security',
      explanationIntro:
        'No se pudo verificar la existencia real o la legitimidad de la actividad comercial. Sigue estos pasos para acreditar tu comercio:',
      steps: [
        {
          number: 1,
          title: 'Completar perfil comercial detallado',
          description:
            'En "Información del Negocio", completa la dirección física exacta, nombre del titular o representante y carga fotografías nítidas del local o taller de trabajo.',
          actionTab: 'info',
          actionLabel: 'Completar Información',
        },
        {
          number: 2,
          title: 'Asegurar línea de contacto directa',
          description:
            'Mantén activa la línea de WhatsApp comercial para que el equipo de moderación pueda comprobar tu disponibilidad.',
        },
        {
          number: 3,
          title: 'Aportar justificación de funcionamiento',
          description:
            'En el recuadro, describe claramente la modalidad de operación de tu negocio (local físico, taller o entrega a domicilio local en Cajicá) para sustentar la verificación.',
        },
      ],
      placeholder:
        'Ejemplo: Nuestro comercio opera con atención al público en Cajicá. Hemos cargado la foto real de la fachada de nuestro establecimiento y confirmado los datos del titular para su validación directa...',
      primaryAction: {
        label: 'Completar Información del Negocio',
        tab: 'info',
      },
      secondaryAction: {
        label: 'Revisar Mis Publicaciones',
        tab: 'posts',
      },
    };
  }

  // 5. Incumplimiento de términos y políticas del servicio
  if (
    text.includes('términos') ||
    text.includes('terminos') ||
    text.includes('política') ||
    text.includes('politica') ||
    text.includes('normas') ||
    text.includes('reglas') ||
    text.includes('condiciones')
  ) {
    return {
      id: 'terms',
      categoryTitle: 'Alineación con Términos y Normas de la Comunidad',
      badge: 'Términos y Normas',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
      iconType: 'security',
      explanationIntro:
        'El comercio fue suspendido por infringir los términos de servicio o normas comunitarias de OleVeci. Sigue estos pasos para subsanarlo:',
      steps: [
        {
          number: 1,
          title: 'Revisar las directrices de la plataforma',
          description:
            'Comprueba que tus servicios, publicaciones e identidad respeten las normas comunitarias (sin productos prohibidos, reventas ilícitas ni lenguaje inapropiado).',
        },
        {
          number: 2,
          title: 'Adecuar información y catálogo',
          description:
            'Edita o retira cualquier elemento en tu perfil comercial o en tus publicaciones que haya estado en conflicto con las reglas.',
          actionTab: 'info',
          actionLabel: 'Revisar Información del Negocio',
        },
        {
          number: 3,
          title: 'Confirmar compromiso y correcciones',
          description:
            'En el recuadro, detalla las adecuaciones efectuadas y confirma tu compromiso de respetar las políticas de la comunidad.',
        },
      ],
      placeholder:
        'Ejemplo: Hemos revisado los términos de uso de OleVeci y retirado los textos y elementos que generaban conflicto con las directrices. Nos comprometemos a mantener una conducta conforme a las normas de la comunidad...',
      primaryAction: {
        label: 'Revisar Información del Negocio',
        tab: 'info',
      },
      secondaryAction: {
        label: 'Revisar Mis Publicaciones',
        tab: 'posts',
      },
    };
  }

  // 6. Motivo personalizado u otro
  return {
    id: 'custom',
    categoryTitle: 'Atención a Observaciones Específicas de Moderación',
    badge: 'Observaciones del Administrador',
    badgeColor: 'bg-slate-100 text-slate-900 border-slate-200',
    iconType: 'custom',
    explanationIntro:
      'El administrador ha indicado observaciones puntuales para la suspensión de tu comercio. Sigue estos pasos para solventarlas:',
    steps: [
      {
        number: 1,
        title: 'Revisar el motivo específico indicado',
        description:
          'Lee cuidadosamente las observaciones expresadas por el administrador en el cuadro superior de este formulario.',
      },
      {
        number: 2,
        title: 'Efectuar los ajustes correspondientes',
        description:
          'Realiza los cambios necesarios en tu Información del Negocio o en tus Publicaciones según lo solicitado por el equipo.',
      },
      {
        number: 3,
        title: 'Explicar las correcciones efectuadas',
        description:
          'En el recuadro a continuación, describe de manera clara cómo atendiste cada observación para que el administrador reactive tu cuenta.',
      },
    ],
    placeholder:
      'Ejemplo: En respuesta a las observaciones indicadas por el administrador, hemos procedido a corregir los puntos señalados de la siguiente manera...',
    primaryAction: {
      label: 'Editar Información del Negocio',
      tab: 'info',
    },
    secondaryAction: {
      label: 'Revisar Mis Publicaciones',
      tab: 'posts',
    },
  };
}

/**
 * Calculates moderation and suspension statistics for a business,
 * helping administrators consult its track record before making new moderation decisions.
 */
export function getBusinessSuspensionStats(business: Business): BusinessSuspensionStats {
  const history: SuspensionHistoryEntry[] = Array.isArray(business.suspensionHistory)
    ? [...business.suspensionHistory]
    : [];

  const suspensionEntries = history.filter((e) => e.type === 'suspension');
  const reactivationEntries = history.filter((e) => e.type === 'reactivation');
  const reviewRequestEntries = history.filter((e) => e.type === 'review_request');
  const rejectionEntries = history.filter((e) => e.type === 'review_rejection');

  // If the business is currently suspended or pending review but has no explicit suspension entries yet
  let totalSuspensions = suspensionEntries.length;
  if (totalSuspensions === 0 && (business.status === 'suspended' || business.status === 'pending_review')) {
    totalSuspensions = 1;
  }

  // Find latest suspension
  const sortedSuspensions = [...suspensionEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lastSuspension = sortedSuspensions[0];

  // Find latest reactivation
  const sortedReactivations = [...reactivationEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lastReactivation = sortedReactivations[0];

  const isCurrentlySuspended = business.status === 'suspended';
  const isCurrentlyPendingReview = business.status === 'pending_review';

  let recidivismLevel: 'none' | 'warning' | 'high' = 'none';
  let recidivismBadge = 'Sin antecedentes';

  if (totalSuspensions === 1) {
    recidivismLevel = 'warning';
    recidivismBadge = '1 suspensión previa';
  } else if (totalSuspensions >= 2) {
    recidivismLevel = 'high';
    recidivismBadge = `Reincidente (${totalSuspensions} suspensiones)`;
  }

  return {
    totalSuspensions,
    totalReactivations: reactivationEntries.length,
    totalReviewRequests: reviewRequestEntries.length,
    totalRejections: rejectionEntries.length,
    totalEvents: history.length,
    lastSuspensionDate: lastSuspension?.timestamp || business.suspendedAt,
    lastSuspensionReason: lastSuspension?.note || business.suspensionReason,
    lastReactivationDate: lastReactivation?.timestamp,
    isCurrentlySuspended,
    isCurrentlyPendingReview,
    recidivismLevel,
    recidivismBadge,
  };
}

/**
 * Calculates suspension and moderation stats for a publication/post,
 * detecting recidivism (prior infractions) and event counters.
 */
export function getPostSuspensionStats(post: Post): BusinessSuspensionStats {
  const history: SuspensionHistoryEntry[] = Array.isArray(post.suspensionHistory)
    ? [...post.suspensionHistory]
    : [];

  const suspensionEntries = history.filter((e) => e.type === 'suspension');
  const reactivationEntries = history.filter((e) => e.type === 'reactivation');
  const reviewRequestEntries = history.filter((e) => e.type === 'review_request');
  const rejectionEntries = history.filter((e) => e.type === 'review_rejection');

  let totalSuspensions = suspensionEntries.length;
  if (totalSuspensions === 0 && (post.status === 'suspended' || post.suspended || post.status === 'pending_review')) {
    totalSuspensions = 1;
  }

  const sortedSuspensions = [...suspensionEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lastSuspension = sortedSuspensions[0];

  const sortedReactivations = [...reactivationEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lastReactivation = sortedReactivations[0];

  const isCurrentlySuspended = post.status === 'suspended' || !!post.suspended;
  const isCurrentlyPendingReview = post.status === 'pending_review';

  let recidivismLevel: 'none' | 'warning' | 'high' = 'none';
  let recidivismBadge = 'Sin antecedentes';

  if (totalSuspensions === 1) {
    recidivismLevel = 'warning';
    recidivismBadge = '1 sanción previa';
  } else if (totalSuspensions >= 2) {
    recidivismLevel = 'high';
    recidivismBadge = `Reincidente (${totalSuspensions} sanciones)`;
  }

  return {
    totalSuspensions,
    totalReactivations: reactivationEntries.length,
    totalReviewRequests: reviewRequestEntries.length,
    totalRejections: rejectionEntries.length,
    totalEvents: history.length || (totalSuspensions > 0 ? 1 : 0),
    lastSuspensionDate: lastSuspension?.timestamp || post.suspendedAt,
    lastSuspensionReason: lastSuspension?.note || post.suspensionReason,
    lastReactivationDate: lastReactivation?.timestamp,
    isCurrentlySuspended,
    isCurrentlyPendingReview,
    recidivismLevel,
    recidivismBadge,
  };
}

