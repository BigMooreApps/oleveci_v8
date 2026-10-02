import sharp, { OverlayOptions } from 'sharp';
import { Post, Business } from '../src/types';

function escapeXml(unsafe?: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatCop(amount?: number): string {
  if (!amount && amount !== 0) return '';
  return `$ ${amount.toLocaleString('es-CO')}`;
}

// In-memory cache for rendered card image buffers to ensure lightning-fast responses
const cardCache = new Map<string, { buffer: Buffer; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export async function renderPostCardImage(post: Post, business?: Business | null): Promise<Buffer> {
  const cacheKey = `${post.id}_${post.promotionalPrice || ''}_${post.title}`;
  const cached = cardCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.buffer;
  }

  const CARD_WIDTH = 800;
  const CARD_HEIGHT = 1020;
  const PADDING = 32;
  const IMAGE_WIDTH = CARD_WIDTH - PADDING * 2; // 736
  const IMAGE_HEIGHT = 440;

  // Calculate discount percentage if applicable
  const hasDiscount = Boolean(
    post.originalPrice &&
    post.promotionalPrice &&
    post.originalPrice > post.promotionalPrice
  );
  const discountPercent = hasDiscount
    ? Math.round(((post.originalPrice! - post.promotionalPrice!) / post.originalPrice!) * 100)
    : 0;

  // Validity badge text
  const validityText = post.expiryLabel || 'Disponible hoy';

  // Prepare post image
  let imageLayerBuffer: Buffer | null = null;
  if (post.imageUrl) {
    try {
      let rawBuffer: Buffer | null = null;
      if (post.imageUrl.startsWith('data:')) {
        const matches = post.imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          rawBuffer = Buffer.from(matches[2], 'base64');
        }
      } else {
        const response = await fetch(post.imageUrl, {
          headers: { 'User-Agent': 'OleVeciCardRenderer/1.0' },
          signal: AbortSignal.timeout(4000),
        });
        if (response.ok) {
          rawBuffer = Buffer.from(await response.arrayBuffer());
        }
      }

      if (rawBuffer) {
        // Rounded corner mask for the post image
        const roundedCornersMask = Buffer.from(
          `<svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
            <rect x="0" y="0" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" rx="24" ry="24" fill="#ffffff"/>
          </svg>`
        );

        imageLayerBuffer = await sharp(rawBuffer)
          .resize(IMAGE_WIDTH, IMAGE_HEIGHT, { fit: 'cover', position: 'center' })
          .composite([{ input: roundedCornersMask, blend: 'dest-in' }])
          .png()
          .toBuffer();
      }
    } catch {
      imageLayerBuffer = null;
    }
  }

  // Fallback image if fetch failed or no image
  if (!imageLayerBuffer) {
    const fallbackSvg = `
      <svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
        <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" rx="24" ry="24" fill="#0f172a"/>
        <text x="${IMAGE_WIDTH / 2}" y="${IMAGE_HEIGHT / 2}" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" fill="#94a3b8" text-anchor="middle">
          ${escapeXml(post.title)}
        </text>
      </svg>
    `;
    imageLayerBuffer = await sharp(Buffer.from(fallbackSvg)).png().toBuffer();
  }

  // Prepare business logo / avatar
  let logoLayerBuffer: Buffer | null = null;
  const logoUrl = business?.logo || post.businessLogo;
  if (logoUrl) {
    try {
      let rawLogo: Buffer | null = null;
      if (logoUrl.startsWith('data:')) {
        const matches = logoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          rawLogo = Buffer.from(matches[2], 'base64');
        }
      } else {
        const response = await fetch(logoUrl, {
          headers: { 'User-Agent': 'OleVeciCardRenderer/1.0' },
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          rawLogo = Buffer.from(await response.arrayBuffer());
        }
      }

      if (rawLogo) {
        const circleMask = Buffer.from(
          `<svg width="60" height="60">
            <circle cx="30" cy="30" r="30" fill="#ffffff"/>
          </svg>`
        );
        logoLayerBuffer = await sharp(rawLogo)
          .resize(60, 60, { fit: 'cover' })
          .composite([{ input: circleMask, blend: 'dest-in' }])
          .png()
          .toBuffer();
      }
    } catch {
      logoLayerBuffer = null;
    }
  }

  // Truncate title and description nicely
  const displayTitle = post.title.length > 60 ? post.title.slice(0, 58) + '...' : post.title;
  const displayDesc = post.description.length > 120 ? post.description.slice(0, 118) + '...' : post.description;

  // Prices formatting
  const priceDisplay = post.promotionalPrice
    ? formatCop(post.promotionalPrice)
    : post.originalPrice
    ? formatCop(post.originalPrice)
    : 'Consultar';
  const originalDisplay = post.originalPrice && post.promotionalPrice && post.originalPrice > post.promotionalPrice
    ? formatCop(post.originalPrice)
    : '';

  // Tags
  const safeTags = (post.tags || []).slice(0, 5).map((t) => (t.startsWith('#') ? t : `#${t}`));

  // Generate SVG overlay representing the exact card design
  const cardSvg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.12"/>
        </filter>
        <linearGradient id="discountGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ea580c"/>
          <stop offset="100%" stop-color="#c2410c"/>
        </linearGradient>
      </defs>

      <!-- Canvas background -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#F1F5F9" />

      <!-- Main Rounded Card Body -->
      <rect x="16" y="16" width="${CARD_WIDTH - 32}" height="${CARD_HEIGHT - 32}" rx="32" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#cardShadow)"/>

      <!-- Header Section -->
      <g transform="translate(${PADDING}, 40)">
        <!-- Fallback avatar circle if logo fetch failed -->
        ${
          !logoLayerBuffer
            ? `<circle cx="30" cy="30" r="30" fill="#007af7" />
               <text x="30" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">
                 ${escapeXml(post.businessName.slice(0, 2).toUpperCase())}
               </text>`
            : ''
        }

        <!-- Business Name and Sector / City -->
        <text x="74" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" fill="#0F172A">
          ${escapeXml(post.businessName)}
        </text>

        <!-- Location Pin + Text -->
        <g transform="translate(74, 36)">
          <circle cx="6" cy="10" r="5" fill="#007af7"/>
          <text x="18" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#64748B">
            ${escapeXml(post.businessSector || 'Sector')} · ${escapeXml(post.businessCity)}
          </text>
        </g>

        <!-- "Ver perfil" Button pill on the right -->
        <g transform="translate(${IMAGE_WIDTH - 120}, 8)">
          <rect width="120" height="42" rx="21" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5"/>
          <text x="60" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#007AF7" text-anchor="middle">
            🏪 Ver perfil
          </text>
        </g>
      </g>

      <!-- Post Image Position is (PADDING, 120), size 736 x 440 -->

      <!-- Badges Over the Post Image -->
      <!-- Discount Badge (Top Left) -->
      ${
        hasDiscount
          ? `<g transform="translate(${PADDING + 16}, 136)">
              <rect width="110" height="48" rx="24" fill="url(#discountGrad)"/>
              <text x="55" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle">
                -${discountPercent}%
              </text>
            </g>`
          : ''
      }

      <!-- Validity Pill (Bottom Left of Image) -->
      <g transform="translate(${PADDING + 16}, 500)">
        <rect width="280" height="42" rx="21" fill="#0284C7" fill-opacity="0.95"/>
        <text x="24" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">
          ⏱ ${escapeXml(validityText)}
        </text>
      </g>

      <!-- Post Title -->
      <text x="${PADDING}" y="610" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#0F172A">
        ${escapeXml(displayTitle)}
      </text>

      <!-- Post Description -->
      <text x="${PADDING}" y="650" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#475569">
        ${escapeXml(displayDesc)}
      </text>

      <!-- Pricing Row -->
      <g transform="translate(${PADDING}, 685)">
        <!-- Blue Price Pill -->
        <rect width="190" height="58" rx="29" fill="#007AF7" />
        <text x="95" y="39" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle">
          ${escapeXml(priceDisplay)}
        </text>

        <!-- Original Strikethrough Price if discount -->
        ${
          originalDisplay
            ? `<text x="210" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#94A3B8" text-decoration="line-through">
                ${escapeXml(originalDisplay)}
              </text>`
            : ''
        }
      </g>

      <!-- Tags Pills Row -->
      <g transform="translate(${PADDING}, 775)">
        ${safeTags
          .map((tag, idx) => {
            const xOffset = idx * 110;
            return `
              <g transform="translate(${xOffset}, 0)">
                <rect width="100" height="34" rx="17" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1"/>
                <text x="50" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#475569" text-anchor="middle">
                  ${escapeXml(tag)}
                </text>
              </g>
            `;
          })
          .join('')}
      </g>

      <!-- Bottom Interactive Action Buttons Preview -->
      <g transform="translate(${PADDING}, 845)">
        <!-- Green WhatsApp Button -->
        <rect width="180" height="64" rx="20" fill="#22C55E"/>
        <text x="90" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">
          💬 WhatsApp
        </text>

        <!-- Phone Button -->
        <g transform="translate(196, 0)">
          <rect width="160" height="64" rx="20" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5"/>
          <text x="80" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#1D4ED8" text-anchor="middle">
            📞 Llamar
          </text>
        </g>

        <!-- Maps Button -->
        <g transform="translate(372, 0)">
          <rect width="160" height="64" rx="20" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5"/>
          <text x="80" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#1D4ED8" text-anchor="middle">
            📍 Cómo llegar
          </text>
        </g>

        <!-- Share Button -->
        <g transform="translate(548, 0)">
          <rect width="188" height="64" rx="20" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5"/>
          <text x="94" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#1D4ED8" text-anchor="middle">
            🔗 Compartir
          </text>
        </g>
      </g>

      <!-- Watermark / Footer -->
      <text x="${CARD_WIDTH - PADDING}" y="${CARD_HEIGHT - 38}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#94A3B8" text-anchor="end">
        OleVeci.com · Negocios locales en tu municipio
      </text>
    </svg>
  `;

  // Composite SVG over canvas and place the image layer and logo layer
  const composites: OverlayOptions[] = [
    {
      input: imageLayerBuffer,
      top: 120,
      left: PADDING,
    },
    {
      input: Buffer.from(cardSvg),
      top: 0,
      left: 0,
    },
  ];

  if (logoLayerBuffer) {
    composites.push({
      input: logoLayerBuffer,
      top: 40,
      left: PADDING,
    });
  }

  const finalCardBuffer = await sharp({
    create: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      channels: 4,
      background: { r: 241, g: 245, b: 249, alpha: 1 },
    },
  })
    .composite(composites)
    .png({ quality: 95 })
    .toBuffer();

  cardCache.set(cacheKey, { buffer: finalCardBuffer, timestamp: Date.now() });
  return finalCardBuffer;
}
