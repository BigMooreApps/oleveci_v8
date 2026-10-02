import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { INITIAL_POSTS, INITIAL_BUSINESSES } from './src/data/seedData';
import { Post, Business } from './src/types';
import { renderPostCardImage } from './server/cardRenderer';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory store for instant Open Graph crawler resolution (seeded + runtime sync)
const postStore = new Map<string, Post>();
const businessStore = new Map<string, Business>();

const DB_POSTS_FILE = path.join(process.cwd(), 'server', 'db_posts.json');
const DB_BUSINESSES_FILE = path.join(process.cwd(), 'server', 'db_businesses.json');

let lastPostsSerialized = '';
let savePostsTimer: NodeJS.Timeout | null = null;

// Helper: Save posts to database file on disk with debouncing and change detection
function savePostsToDisk() {
  if (savePostsTimer) clearTimeout(savePostsTimer);
  savePostsTimer = setTimeout(() => {
    try {
      const list = Array.from(postStore.values());
      const serialized = JSON.stringify(list, null, 2);
      if (serialized !== lastPostsSerialized) {
        lastPostsSerialized = serialized;
        fs.writeFileSync(DB_POSTS_FILE, serialized, 'utf-8');
      }
    } catch (err) {
      console.error('Error saving db_posts.json:', err);
    }
  }, 300);
}

let lastBusinessesSerialized = '';
let saveBusinessesTimer: NodeJS.Timeout | null = null;

// Helper: Save businesses to database file on disk with debouncing and change detection
function saveBusinessesToDisk() {
  if (saveBusinessesTimer) clearTimeout(saveBusinessesTimer);
  saveBusinessesTimer = setTimeout(() => {
    try {
      const list = Array.from(businessStore.values());
      const serialized = JSON.stringify(list, null, 2);
      if (serialized !== lastBusinessesSerialized) {
        lastBusinessesSerialized = serialized;
        fs.writeFileSync(DB_BUSINESSES_FILE, serialized, 'utf-8');
      }
    } catch (err) {
      console.error('Error saving db_businesses.json:', err);
    }
  }, 300);
}

// Initialize stores from seeds
INITIAL_POSTS.forEach((p) => postStore.set(p.id, p));
INITIAL_BUSINESSES.forEach((b) => businessStore.set(b.id, b));

// Restore persisted database posts from disk if available
try {
  if (fs.existsSync(DB_POSTS_FILE)) {
    const raw = fs.readFileSync(DB_POSTS_FILE, 'utf-8');
    lastPostsSerialized = raw;
    const savedList = JSON.parse(raw);
    if (Array.isArray(savedList)) {
      savedList.forEach((p: Post) => {
        if (p?.id) postStore.set(p.id, p);
      });
    }
  } else {
    savePostsToDisk();
  }
} catch (err) {
  console.error('Error reading db_posts.json:', err);
}

// Restore persisted database businesses from disk if available
try {
  if (fs.existsSync(DB_BUSINESSES_FILE)) {
    const raw = fs.readFileSync(DB_BUSINESSES_FILE, 'utf-8');
    lastBusinessesSerialized = raw;
    const savedList = JSON.parse(raw);
    if (Array.isArray(savedList)) {
      savedList.forEach((b: Business) => {
        if (b?.id) businessStore.set(b.id, b);
      });
    }
  } else {
    saveBusinessesToDisk();
  }
} catch (err) {
  console.error('Error reading db_businesses.json:', err);
}

// Helper: Escape HTML special characters for meta tags
function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: Format Colombian Peso
function formatPrice(amount?: number): string {
  if (!amount && amount !== 0) return '';
  return `$${amount.toLocaleString('es-CO')}`;
}

// Helper: Injects Open Graph & Twitter meta tags into HTML
function injectOgMeta(
  html: string,
  meta: {
    title: string;
    description: string;
    image?: string;
    url: string;
    type?: string;
  }
): string {
  let output = html;

  // Replace Title
  output = output.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(meta.title)}</title>`
  );

  // Replace Meta Description
  if (output.includes('name="description"')) {
    output = output.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(meta.description)}" />`
    );
  }

  // Replace og:title
  if (output.includes('property="og:title"')) {
    output = output.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
    );
  }

  // Replace og:description
  if (output.includes('property="og:description"')) {
    output = output.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
    );
  }

  // Build full social card tags
  const ogImage = meta.image || '/Logo_OleVeci.png';
  const socialTags = `
    <!-- Dynamic Social Share & WhatsApp OpenGraph Card -->
    <meta property="og:site_name" content="OleVeci" />
    <meta property="og:type" content="${escapeHtml(meta.type || 'article')}" />
    <meta property="og:url" content="${escapeHtml(meta.url)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  `;

  output = output.replace('</head>', `${socialTags}\n  </head>`);
  return output;
}

// Claves de Wompi Colombia (configurables vía variables de entorno o valores de prueba/sandbox autorizados)
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY || 'pub_test_JAtNkfPRS3E9HnQrw6DNbKQoEhPLDOCb';
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || 'prv_test_pceMdDuhgzbGb1mMTM5DQjn8owHDqk2D';
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || 'test_integrity_BVNqrZB4SzW85EwjB9nvk4knLesN6KwS';
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || 'test_events_YLv4k58YATWgD3jHcTwXPz7tmf42qDcF';

// API Routes FIRST

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'OleVeci Server', timestamp: new Date().toISOString() });
});

// Obtener configuración pública de Wompi
app.get('/api/wompi/config', (_req, res) => {
  res.json({
    publicKey: WOMPI_PUBLIC_KEY,
    currency: 'COP',
  });
});

// Generar firma de integridad SHA256 en el backend para máxima seguridad
app.post('/api/wompi/signature', (req, res) => {
  try {
    const { reference, amountInCents, currency = 'COP', expirationTime } = req.body;

    if (!reference || amountInCents === undefined) {
      return res.status(400).json({ error: 'Parámetros reference y amountInCents requeridos' });
    }

    // Fórmula Wompi: SHA256(reference + amountInCents + currency + [expirationTime] + integritySecret)
    const rawString = `${reference}${amountInCents}${currency}${expirationTime || ''}${WOMPI_INTEGRITY_SECRET}`;
    const signature = crypto.createHash('sha256').update(rawString).digest('hex');

    return res.json({
      signature,
      reference,
      amountInCents,
      currency,
      publicKey: WOMPI_PUBLIC_KEY,
    });
  } catch (error) {
    console.error('Error calculando firma Wompi:', error);
    return res.status(500).json({ error: 'Error al generar firma de integridad' });
  }
});

// Consultar estado de una transacción directamente en Wompi API
app.get('/api/wompi/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isSandbox = WOMPI_PUBLIC_KEY.startsWith('pub_test_') || WOMPI_PRIVATE_KEY.startsWith('prv_test_');
    const wompiBaseUrl = isSandbox ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';

    const response = await fetch(`${wompiBaseUrl}/transactions/${id}`, {
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error consultando transacción Wompi:', error);
    return res.status(500).json({ error: 'Error al consultar Wompi' });
  }
});

// Webhook para eventos de Wompi (transacciones aprobadas/rechazadas)
app.post('/api/wompi/webhook', (req, res) => {
  try {
    const event = req.body;
    const checksumHeader = req.headers['x-event-checksum'] as string;

    // Validación opcional de firma del evento
    if (checksumHeader && event?.data?.transaction && event?.signature?.properties) {
      const properties: string[] = event.signature.properties;
      let concatenated = '';

      for (const prop of properties) {
        const parts = prop.split('.');
        let val: any = event.data;
        for (const p of parts) {
          val = val?.[p];
        }
        concatenated += val !== undefined ? String(val) : '';
      }

      concatenated += String(event.timestamp);
      concatenated += WOMPI_EVENTS_SECRET;

      const calculatedChecksum = crypto.createHash('sha256').update(concatenated).digest('hex');
      if (calculatedChecksum !== checksumHeader) {
        console.warn('Wompi Webhook: Checksum mismatch');
        return res.status(401).json({ error: 'Firma de webhook inválida' });
      }
    }

    console.log('Wompi Webhook recibido:', event?.event, event?.data?.transaction?.id, event?.data?.transaction?.status);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook de Wompi:', error);
    return res.status(500).json({ error: 'Error al procesar webhook' });
  }
});

// Endpoint para sincronizar publicaciones y comercios en memoria para que WhatsApp las previsualice
app.post('/api/posts/sync', (req, res) => {
  try {
    const { posts, businesses, post, business } = req.body;
    let postsChanged = false;
    let businessesChanged = false;

    if (post?.id) {
      postStore.set(post.id, post);
      postsChanged = true;
    }
    if (business?.id) {
      businessStore.set(business.id, business);
      businessesChanged = true;
    }
    if (Array.isArray(posts)) {
      posts.forEach((p: Post) => {
        if (p?.id) {
          const existing = postStore.get(p.id);
          if (
            !existing ||
            existing.title !== p.title ||
            existing.description !== p.description ||
            existing.promotionalPrice !== p.promotionalPrice ||
            existing.originalPrice !== p.originalPrice ||
            existing.imageUrl !== p.imageUrl
          ) {
            postStore.set(p.id, p);
            postsChanged = true;
          }
        }
      });
    }
    if (Array.isArray(businesses)) {
      businesses.forEach((b: Business) => {
        if (b?.id) {
          const existing = businessStore.get(b.id);
          if (
            !existing ||
            existing.name !== b.name ||
            existing.description !== b.description ||
            existing.address !== b.address ||
            existing.rating !== b.rating ||
            existing.logo !== b.logo
          ) {
            businessStore.set(b.id, b);
            businessesChanged = true;
          }
        }
      });
    }
    if (postsChanged) savePostsToDisk();
    if (businessesChanged) saveBusinessesToDisk();
    return res.json({ ok: true, totalPosts: postStore.size, totalBusinesses: businessStore.size });
  } catch (error) {
    return res.status(500).json({ error: 'Sync failed' });
  }
});

// Endpoint para consultar todas las publicaciones
app.get('/api/posts', (_req, res) => {
  return res.json(Array.from(postStore.values()));
});

// Servir archivos estáticos de videos
app.use('/videos', express.static(path.join(process.cwd(), 'public', 'videos')));

// Endpoint para consultar datos de un anuncio específico
app.get('/api/posts/:id', (req, res) => {
  const post = postStore.get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post no encontrado' });
  return res.json(post);
});

// Endpoint para servir la imagen exacta del anuncio para WhatsApp y Open Graph
app.get('/api/og/card/:id.png', async (req, res) => {
  try {
    const rawId = req.params.id || '';
    const postId = rawId.replace(/\.png$/i, '');
    const post = postStore.get(postId);
    if (!post) {
      return res.status(404).send('Post no encontrado');
    }
    const business = businessStore.get(post.businessId);
    const cardBuffer = await renderPostCardImage(post, business);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).send(cardBuffer);
  } catch (error) {
    console.error('Error generando tarjeta de anuncio:', error);
    return res.status(500).send('Error generando imagen de tarjeta');
  }
});

// Vite middleware & Dynamic Open Graph Static Serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  let vite: any = null;

  app.use(express.static(path.join(process.cwd(), 'public')));

  if (isDev) {
    vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: [
            '**/server/**',
            '**/server/db_*.json',
            '**/server/db_posts.json',
            '**/server/db_businesses.json',
            '**/dist/**',
            '**/.git/**',
          ],
        },
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
  }

  // Interceptor para servir HTML con Open Graph enriquecido para WhatsApp y redes
  app.get('*', async (req, res, next) => {
    try {
      const urlPath = req.path;
      const origin = `${req.protocol}://${req.get('host')}`;
      let ogMeta: { title: string; description: string; image?: string; url: string; type?: string } | null = null;

      // 1. Detectar si es un anuncio (/anuncio/:id o ?post=:id)
      let postId = '';
      if (urlPath.startsWith('/anuncio/')) {
        postId = urlPath.replace('/anuncio/', '').split('/')[0];
      } else if (urlPath.startsWith('/p/')) {
        postId = urlPath.replace('/p/', '').split('/')[0];
      } else if (req.query.post) {
        postId = String(req.query.post);
      }

      if (postId && postStore.has(postId)) {
        const post = postStore.get(postId)!;
        const priceStr = post.promotionalPrice
          ? `${formatPrice(post.promotionalPrice)} COP`
          : post.originalPrice
          ? `${formatPrice(post.originalPrice)} COP`
          : 'Consultar precio';
        const discountStr =
          post.originalPrice && post.promotionalPrice && post.originalPrice > post.promotionalPrice
            ? ` (${Math.round(((post.originalPrice - post.promotionalPrice) / post.originalPrice) * 100)}% OFF)`
            : '';

        const cacheBuster = post.createdAt ? new Date(post.createdAt).getTime() : Date.now();
        ogMeta = {
          title: `${post.title} · ${post.businessName}`,
          description: `${priceStr}${discountStr} — ${post.description || post.title}. ${post.businessAddress || post.businessCity}. Descubre esta oferta en OleVeci.`,
          image: `${origin}/api/og/card/${post.id}.png?v=${cacheBuster}`,
          url: `${origin}/anuncio/${post.id}`,
          type: 'article',
        };
      }

      // 2. Detectar si es un comercio (/comercio/:id o ?biz=:id)
      let bizId = '';
      if (urlPath.startsWith('/comercio/')) {
        bizId = urlPath.replace('/comercio/', '').split('/')[0];
      } else if (req.query.biz) {
        bizId = String(req.query.biz);
      }

      if (!ogMeta && bizId && businessStore.has(bizId)) {
        const biz = businessStore.get(bizId)!;
        ogMeta = {
          title: `${biz.name} · Negocio Local en ${biz.city}`,
          description: `${biz.subCategory || 'Comercio verificado'} — ${biz.description || biz.name}. ${biz.address}, ${biz.city}.`,
          image: biz.coverImage || biz.logo || `${origin}/Logo_OleVeci.png`,
          url: `${origin}/comercio/${biz.id}`,
          type: 'profile',
        };
      }

      // Leer index.html base
      let html = '';
      if (isDev) {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        html = fs.readFileSync(indexPath, 'utf-8');
      } else {
        const distIndexPath = path.resolve(process.cwd(), 'dist', 'index.html');
        html = fs.readFileSync(distIndexPath, 'utf-8');
      }

      // Inyectar metadatos si coinciden con un anuncio o negocio
      if (ogMeta) {
        html = injectOgMeta(html, ogMeta);
      }

      if (isDev && vite) {
        html = await vite.transformIndexHtml(req.originalUrl, html);
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    } catch (error) {
      console.error('Error procesando OpenGraph HTML:', error);
      next(error);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OleVeci Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
