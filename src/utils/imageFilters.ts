export interface ImageFilterPreset {
  id: string;
  name: string;
  category: 'populares' | 'estilo' | 'color';
  filter: string;
  description: string;
}

export interface ManualAdjustments {
  brightness: number; // 70 to 130 (100 = neutral)
  contrast: number;   // 70 to 130 (100 = neutral)
  saturation: number; // 50 to 170 (100 = neutral)
  warmth: number;     // 0 to 60 (0 = neutral)
}

export const DEFAULT_MANUAL_ADJUSTMENTS: ManualAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
};

export const PHOTO_FILTERS: ImageFilterPreset[] = [
  {
    id: 'none',
    name: 'Original',
    category: 'populares',
    filter: 'none',
    description: 'Sin filtro adicional, colores reales',
  },
  {
    id: 'vivid',
    name: 'Vívido',
    category: 'populares',
    filter: 'saturate(1.35) contrast(1.1) brightness(1.03)',
    description: 'Colores más vivos y luminosos',
  },
  {
    id: 'warm',
    name: 'Cálido',
    category: 'populares',
    filter: 'sepia(0.24) saturate(1.26) brightness(1.04) hue-rotate(-8deg)',
    description: 'Luz dorada, acogedora y apetecible',
  },
  {
    id: 'gourmet',
    name: 'Gourmet',
    category: 'populares',
    filter: 'contrast(1.18) saturate(1.34) brightness(1.02)',
    description: 'Especial para platos, bebidas y postres',
  },
  {
    id: 'cool',
    name: 'Fresco',
    category: 'color',
    filter: 'saturate(1.15) hue-rotate(15deg) brightness(1.03) contrast(1.06)',
    description: 'Tonos limpios, fríos y modernos',
  },
  {
    id: 'dramatic',
    name: 'Dramático',
    category: 'estilo',
    filter: 'contrast(1.32) brightness(0.96) saturate(1.12)',
    description: 'Alto impacto con sombras profundas',
  },
  {
    id: 'vintage',
    name: 'Retro',
    category: 'estilo',
    filter: 'sepia(0.38) contrast(1.08) brightness(0.96) saturate(1.08)',
    description: 'Estilo cinematográfico analógico',
  },
  {
    id: 'mono',
    name: 'B & N',
    category: 'estilo',
    filter: 'grayscale(1) contrast(1.24) brightness(1.04)',
    description: 'Blanco y negro elegante de alto contraste',
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    category: 'color',
    filter: 'sepia(0.28) saturate(1.4) hue-rotate(-18deg) contrast(1.1)',
    description: 'Atmósfera dorada y rojiza intensa',
  },
  {
    id: 'pastel',
    name: 'Pastel',
    category: 'color',
    filter: 'brightness(1.08) saturate(0.85) contrast(0.96)',
    description: 'Luminoso, suave y delicado',
  },
  {
    id: 'cinematic',
    name: 'Cine',
    category: 'estilo',
    filter: 'contrast(1.22) saturate(1.2) hue-rotate(-12deg) brightness(0.98)',
    description: 'Look de película Teal & Amber',
  },
];

/**
 * Builds composite CSS filter string based on preset, intensity (0-100), and fine adjustments.
 */
export function buildFilterCss(
  presetId: string,
  intensity: number = 100,
  adjustments: ManualAdjustments = DEFAULT_MANUAL_ADJUSTMENTS
): string {
  const parts: string[] = [];

  // Preset filter calculation with intensity blending
  if (presetId && presetId !== 'none') {
    const factor = Math.max(0, Math.min(100, intensity)) / 100;
    if (factor >= 0.99) {
      const preset = PHOTO_FILTERS.find((f) => f.id === presetId);
      if (preset && preset.filter !== 'none') {
        parts.push(preset.filter);
      }
    } else if (factor > 0.01) {
      if (presetId === 'vivid') {
        parts.push(
          `saturate(${Math.round(100 + 35 * factor)}%) contrast(${Math.round(100 + 10 * factor)}%) brightness(${Math.round(100 + 3 * factor)}%)`
        );
      } else if (presetId === 'warm') {
        parts.push(
          `sepia(${Math.round(24 * factor)}%) saturate(${Math.round(100 + 26 * factor)}%) brightness(${Math.round(100 + 4 * factor)}%) hue-rotate(${Math.round(-8 * factor)}deg)`
        );
      } else if (presetId === 'gourmet') {
        parts.push(
          `contrast(${Math.round(100 + 18 * factor)}%) saturate(${Math.round(100 + 34 * factor)}%) brightness(${Math.round(100 + 2 * factor)}%)`
        );
      } else if (presetId === 'cool') {
        parts.push(
          `saturate(${Math.round(100 + 15 * factor)}%) hue-rotate(${Math.round(15 * factor)}deg) brightness(${Math.round(100 + 3 * factor)}%) contrast(${Math.round(100 + 6 * factor)}%)`
        );
      } else if (presetId === 'dramatic') {
        parts.push(
          `contrast(${Math.round(100 + 32 * factor)}%) brightness(${Math.round(100 - 4 * factor)}%) saturate(${Math.round(100 + 12 * factor)}%)`
        );
      } else if (presetId === 'vintage') {
        parts.push(
          `sepia(${Math.round(38 * factor)}%) contrast(${Math.round(100 + 8 * factor)}%) brightness(${Math.round(100 - 4 * factor)}%) saturate(${Math.round(100 + 8 * factor)}%)`
        );
      } else if (presetId === 'mono') {
        parts.push(
          `grayscale(${Math.round(100 * factor)}%) contrast(${Math.round(100 + 24 * factor)}%) brightness(${Math.round(100 + 4 * factor)}%)`
        );
      } else if (presetId === 'sunset') {
        parts.push(
          `sepia(${Math.round(28 * factor)}%) saturate(${Math.round(100 + 40 * factor)}%) hue-rotate(${Math.round(-18 * factor)}deg) contrast(${Math.round(100 + 10 * factor)}%)`
        );
      } else if (presetId === 'pastel') {
        parts.push(
          `brightness(${Math.round(100 + 8 * factor)}%) saturate(${Math.round(100 - 15 * factor)}%) contrast(${Math.round(100 - 4 * factor)}%)`
        );
      } else if (presetId === 'cinematic') {
        parts.push(
          `contrast(${Math.round(100 + 22 * factor)}%) saturate(${Math.round(100 + 20 * factor)}%) hue-rotate(${Math.round(-12 * factor)}deg) brightness(${Math.round(100 - 2 * factor)}%)`
        );
      } else {
        const preset = PHOTO_FILTERS.find((f) => f.id === presetId);
        if (preset && preset.filter !== 'none') {
          parts.push(preset.filter);
        }
      }
    }
  }

  // Manual adjustments
  if (adjustments.brightness !== 100) {
    parts.push(`brightness(${adjustments.brightness}%)`);
  }
  if (adjustments.contrast !== 100) {
    parts.push(`contrast(${adjustments.contrast}%)`);
  }
  if (adjustments.saturation !== 100) {
    parts.push(`saturate(${adjustments.saturation}%)`);
  }
  if (adjustments.warmth > 0) {
    parts.push(`sepia(${adjustments.warmth}%)`);
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

/**
 * Bakes the CSS filter directly into an image using HTML5 Canvas
 */
export function bakeFilterToDataUrl(
  imageSource: string,
  cssFilter: string
): Promise<string> {
  return new Promise((resolve) => {
    if (!cssFilter || cssFilter === 'none') {
      return resolve(imageSource);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageSource);

        ctx.filter = cssFilter;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.94));
      } catch (err) {
        console.warn('Could not bake filter into canvas (CORS or canvas issue)', err);
        resolve(imageSource);
      }
    };

    img.onerror = () => resolve(imageSource);
    img.src = imageSource;
  });
}
