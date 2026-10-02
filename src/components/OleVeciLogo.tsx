import React from 'react';

interface OleVeciIconProps {
  className?: string;
  size?: number | string;
}

/**
 * Pixel-perfect SVG vector recreation of the official OleVeci logo pin.
 * Matches the uploaded brand asset:
 * - Electric sky blue to deep navy outer ribbon (#0088ff -> #0062f5 -> #021b58)
 * - Luminous sun yellow to warm orange top-right ribbon (#ffbe00 -> #ff5500)
 * - Mint/cyan inner curve (#00d8a5 -> #00b4d8)
 * - 3 radiant sunburst rays at top right (#ffbe00 -> #ff7700)
 * - Pure white circular disc with subtle shadow
 * - Storefront silhouette in deep navy (#021b58) with 3-scallop canopy and arch door
 */
export const OleVeciIcon: React.FC<OleVeciIconProps> = ({
  className = '',
  size = 40,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const id = React.useId().replace(/:/g, '');

  if (!hasError) {
    return (
      <img
        src="/Icono_Oleveci_sin_fondo.png"
        alt="OleVeci Icon"
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${Math.round(size * (795 / 704))}px` : 'auto',
        }}
        className={`shrink-0 select-none object-contain inline-block drop-shadow-xs ${className}`}
        onError={() => setHasError(true)}
        draggable={false}
        loading="eager"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="OleVeci Logo Icon"
    >
      <defs>
        {/* Blue Ribbon Gradient: Electric Sky to Deep Navy */}
        <linearGradient
          id={`blueRibbon-${id}`}
          x1="40"
          y1="30"
          x2="95"
          y2="178"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0088ff" />
          <stop offset="35%" stopColor="#0062f5" />
          <stop offset="70%" stopColor="#003dbb" />
          <stop offset="100%" stopColor="#021b58" />
        </linearGradient>

        {/* Top-Right Ribbon: Luminous Golden Yellow to Vivid Orange */}
        <linearGradient
          id={`orangeRibbon-${id}`}
          x1="90"
          y1="20"
          x2="160"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffbe00" />
          <stop offset="45%" stopColor="#ff8400" />
          <stop offset="100%" stopColor="#ff5500" />
        </linearGradient>

        {/* Inner Swirl: Emerald Mint to Radiant Cyan */}
        <linearGradient
          id={`cyanCurve-${id}`}
          x1="100"
          y1="90"
          x2="145"
          y2="145"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#00d8a5" />
          <stop offset="100%" stopColor="#00b4d8" />
        </linearGradient>

        {/* Sunburst Rays Gradient */}
        <linearGradient
          id={`sunRay-${id}`}
          x1="130"
          y1="20"
          x2="160"
          y2="70"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffbe00" />
          <stop offset="100%" stopColor="#ff7700" />
        </linearGradient>

        {/* Soft Drop Shadow for Center Disc */}
        <filter id={`discShadow-${id}`} x="46" y="44" width="92" height="92" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#021b58" floodOpacity="0.22" />
        </filter>

        {/* Soft Ground Shadow under Pin Tip */}
        <radialGradient id={`groundShadow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#021b58" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#021b58" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground Soft Shadow */}
      <ellipse cx="92" cy="184" rx="26" ry="5.5" fill={`url(#groundShadow-${id})`} />

      {/* 3 Sunburst Rays (Sparks) */}
      <g>
        {/* Ray 1 (Top) */}
        <rect
          x="131"
          y="24"
          width="8"
          height="19"
          rx="4"
          transform="rotate(32 135 33)"
          fill={`url(#sunRay-${id})`}
        />
        {/* Ray 2 (Middle) */}
        <rect
          x="146"
          y="46"
          width="8"
          height="17"
          rx="4"
          transform="rotate(68 150 54)"
          fill={`url(#sunRay-${id})`}
        />
        {/* Ray 3 (Bottom) */}
        <rect
          x="148"
          y="73"
          width="7.5"
          height="15"
          rx="3.75"
          transform="rotate(96 151 80)"
          fill={`url(#sunRay-${id})`}
        />
      </g>

      {/* Pin Ribbon Fold 1: Orange/Yellow Top-Right Arch */}
      <path
        d="M92 24
           C128 24 152 50 152 84
           C152 110 134 135 92 178
           C112 138 138 114 138 84
           C138 56 118 34 92 34
           C82 34 72 38 64 45
           C72 32 82 24 92 24Z"
        fill={`url(#orangeRibbon-${id})`}
      />

      {/* Pin Ribbon Fold 2: Cyan/Teal Inner Swirl */}
      <path
        d="M92 178
           C116 142 140 116 140 84
           C140 80 139 76 138 72
           C134 98 116 126 94 144
           C92 156 92 168 92 178Z"
        fill={`url(#cyanCurve-${id})`}
      />

      {/* Pin Ribbon Fold 3: Blue/Navy Left Outer Shell */}
      <path
        d="M92 24
           C58 24 34 50 34 86
           C34 122 66 152 92 178
           C92 178 62 134 62 88
           C62 60 78 36 98 28
           C96 25 94 24 92 24Z"
        fill={`url(#blueRibbon-${id})`}
      />

      {/* Outer smooth wrap blending the pin shape */}
      <path
        d="M92 24
           C56 24 34 52 34 88
           C34 124 64 154 92 178
           C120 154 150 124 150 88
           C150 52 128 24 92 24ZM92 132
           C66.8 132 46 111.2 46 86
           C46 60.8 66.8 40 92 40
           C117.2 40 138 60.8 138 86
           C138 111.2 117.2 132 92 132Z"
        fill={`url(#blueRibbon-${id})`}
        opacity="0.95"
      />

      {/* Central White Circular Disc */}
      <circle cx="92" cy="86" r="33" fill="#FFFFFF" filter={`url(#discShadow-${id})`} />

      {/* Storefront Silhouette inside White Disc (Navy #021b58) */}
      <g fill="#021b58">
        {/* 3-Scallop Awning / Canopy */}
        <path
          d="M72 75
             C72 71.5 75 68.5 79 68.5
             H105
             C109 68.5 112 71.5 112 75
             L110.5 81.5
             C110.5 84 108.5 86 106 86
             C103.5 86 101.5 84 101.5 81.5
             L101 79
             H99
             L98.5 81.5
             C98.5 84 96.5 86 94 86
             C91.5 86 89.5 84 89.5 81.5
             L89 79
             H87
             L86.5 81.5
             C86.5 84 84.5 86 82 86
             C79.5 86 77.5 84 77.5 81.5
             L76 75
             Z"
        />
        {/* Lower Storefront Base with Arched Entryway */}
        <path
          d="M75 84.5
             H109
             V102
             C109 104 107.5 105 105.5 105
             H99
             V95
             C99 91.5 85 91.5 85 95
             V105
             H78.5
             C76.5 105 75 104 75 102
             Z"
        />
      </g>
    </svg>
  );
};

interface OleVeciLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  showCom?: boolean;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'light' | 'dark';
  onClick?: () => void;
}

/**
 * Official Brand Logo component for OleVeci
 * Uses the authentic high-resolution asset /Logo_OleVeci.png
 * with optimal responsive dimensions and graceful vector fallback.
 */
export const OleVeciLogo: React.FC<OleVeciLogoProps> = ({
  className = '',
  size = 'md',
  showSlogan = false,
  showCom = false,
  orientation = 'horizontal',
  variant = 'light',
  onClick,
}) => {
  const [imageError, setImageError] = React.useState(false);

  // Exact proportional heights to maintain the 2.85:1 aspect ratio cleanly
  const imageSizeClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-7.5 sm:h-8.5 md:h-9',
    lg: 'h-10 sm:h-11 md:h-12',
    xl: 'h-13 sm:h-15 md:h-16',
  };

  const iconSizes = {
    sm: 30,
    md: 38,
    lg: 48,
    xl: 64,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl sm:text-[26px]',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };

  const isDark = variant === 'dark';
  const oleColor = isDark ? 'text-white' : 'text-[#021b58]';
  const veciColor = 'text-[#007aff]';
  const comColor = 'text-[#ff7700]';

  // Primary rendering: Authentic official Logo_OleVeci with transparent background
  if (!imageError && orientation === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center select-none bg-transparent ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <img
          src="/Logo_OleVeci.png?v=transparent"
          alt="OleVeci - Negocios locales"
          className={`${imageSizeClasses[size]} w-auto object-contain shrink-0 bg-transparent`}
          onError={() => setImageError(true)}
          loading="eager"
          referrerPolicy="no-referrer"
        />
        {showCom && (
          <span className="text-[#ff7700] font-black text-sm tracking-tight -ml-1">
            .com
          </span>
        )}
      </div>
    );
  }

  // Fallback / Vertical vector rendering
  if (orientation === 'vertical') {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center text-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <OleVeciIcon size={iconSizes[size] * 1.5} className="mb-2" />
        <div className={`font-black tracking-tighter leading-none ${textSizes[size]} select-none`}>
          <span className={oleColor}>Ole</span>
          <span className={veciColor}>Veci</span>
          {showCom && <span className={comColor}>.com</span>}
        </div>
        {showSlogan && (
          <p className="font-semibold tracking-tight text-xs mt-1 text-slate-500">
            Negocios locales, más cerca de ti
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <OleVeciIcon size={iconSizes[size]} />
      <div className="flex flex-col justify-center">
        <div className={`font-black tracking-tighter leading-none flex items-baseline ${textSizes[size]} select-none`}>
          <span className={oleColor}>Ole</span>
          <span className={veciColor}>Veci</span>
          {showCom && <span className={comColor}>.com</span>}
        </div>
        {showSlogan && (
          <p className="font-semibold tracking-tight text-[11px] leading-tight mt-0.5 text-slate-500">
            Negocios locales, más cerca de ti
          </p>
        )}
      </div>
    </div>
  );
};
