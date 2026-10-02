export type VideoPlatform = 'direct' | 'tiktok' | 'youtube' | 'instagram' | 'facebook' | 'vimeo' | 'drive';

export interface ParsedVideoInfo {
  platform: VideoPlatform;
  embedUrl: string;
  directUrl: string;
  isIframe: boolean;
  videoId?: string;
  defaultThumbnail?: string;
  platformName: string;
  isVertical?: boolean;
}

/**
 * Parses any video URL (TikTok, YouTube, Instagram Reels, Vimeo, Google Drive, or direct MP4/WebM)
 * and returns embeddable iframe URL or direct stream URL.
 */
export function parseVideoUrl(rawUrl?: string | null): ParsedVideoInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      platform: 'direct',
      embedUrl: '',
      directUrl: '',
      isIframe: false,
      platformName: 'Directo',
    };
  }

  const url = rawUrl.trim();

  // 1. TikTok: https://www.tiktok.com/@user/video/7123456789012345678
  // Matches standard web links, mobile links, embed links, or any tiktok URL containing the 15-22 digit video ID
  const tiktokMatch =
    url.match(/tiktok\.com\/(?:@[\w.-]+\/video|v|embed|embed\/v2)\/(\d+)/i) ||
    url.match(/tiktok\.com\/.*?(\d{15,22})/i);
  if (tiktokMatch && tiktokMatch[1]) {
    const videoId = tiktokMatch[1];
    return {
      platform: 'tiktok',
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      directUrl: url,
      isIframe: true,
      videoId,
      platformName: 'TikTok',
      isVertical: true,
    };
  }

  // 2. YouTube & YouTube Shorts
  // https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // https://youtu.be/dQw4w9WgXcQ
  // https://www.youtube.com/shorts/dQw4w9WgXcQ
  // https://www.youtube.com/embed/dQw4w9WgXcQ
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?.*?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const isShorts = url.toLowerCase().includes('/shorts/');
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&playsinline=1&controls=1&rel=0`,
      directUrl: url,
      isIframe: true,
      videoId,
      defaultThumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      platformName: isShorts ? 'YouTube Shorts' : 'YouTube',
      isVertical: isShorts,
    };
  }

  // 3. Instagram Reels
  const igMatch = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const reelId = igMatch[1];
    return {
      platform: 'instagram',
      embedUrl: `https://www.instagram.com/reel/${reelId}/embed/`,
      directUrl: url,
      isIframe: true,
      videoId: reelId,
      platformName: 'Instagram Reel',
      isVertical: true,
    };
  }

  // 4. Facebook Videos & Reels
  const fbMatch = url.match(/(?:facebook\.com\/(?:reel|watch\/?\?v=|.*?\/videos\/)|fb\.watch\/)/i);
  if (fbMatch) {
    return {
      platform: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`,
      directUrl: url,
      isIframe: true,
      platformName: 'Facebook',
      isVertical: url.toLowerCase().includes('/reel'),
    };
  }

  // 5. Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      platform: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&loop=1&playsinline=1`,
      directUrl: url,
      isIframe: true,
      videoId,
      platformName: 'Vimeo',
    };
  }

  // 5. Google Drive
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return {
      platform: 'drive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      directUrl: url,
      isIframe: true,
      videoId: fileId,
      platformName: 'Google Drive',
    };
  }

  // 6. Direct Video (.mp4, .webm, data:video, blob:, etc.)
  return {
    platform: 'direct',
    embedUrl: url,
    directUrl: url,
    isIframe: false,
    platformName: 'Video directo',
  };
}
