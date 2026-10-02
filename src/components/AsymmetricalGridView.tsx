import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  LayoutGrid,
  Columns,
  Layers,
  Component,
} from 'lucide-react';
import { Post } from '../types';
import { PostCard } from './PostCard';

export const AUTO_ROTATE_SECONDS = 15;

export interface LayoutArchetype {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  icon: React.ElementType;
}

export const LAYOUT_ARCHETYPES: LayoutArchetype[] = [
  {
    id: 'hero-top',
    name: 'Hero Superior',
    shortName: 'Hero',
    tag: 'Clásico Asimétrico',
    icon: LayoutGrid,
  },
  {
    id: 'hero-center',
    name: 'Destacado Central',
    shortName: 'Centro',
    tag: 'Columnas & Centro',
    icon: Component,
  },
  {
    id: 'zigzag',
    name: 'Zig-Zag Dinámico',
    shortName: 'Zig-Zag',
    tag: 'Ritmo Alternado',
    icon: Layers,
  },
  {
    id: 'hero-bottom',
    name: 'Mural Invertido',
    shortName: 'Mural',
    tag: 'Tall & Hero Base',
    icon: Columns,
  },
];

export interface AsymmetricalGridViewProps {
  posts: Post[];
  layoutIndex?: number;
  shiftOffset?: number;
  onSelectPost: (post: Post) => void;
  onSelectBusiness?: (businessId: string) => void;
}

export const AsymmetricalGridView: React.FC<AsymmetricalGridViewProps> = ({
  posts,
  layoutIndex = 0,
  shiftOffset = 0,
  onSelectPost,
  onSelectBusiness,
}) => {
  // Generate shifted posts array so different publications take the highlighted Hero/Tall spots
  const arrangedPosts = useMemo(() => {
    if (posts.length === 0) return [];
    const len = posts.length;
    const offset = shiftOffset % len;
    return [...posts.slice(offset), ...posts.slice(0, offset)];
  }, [posts, shiftOffset]);

  const activeArchetype = LAYOUT_ARCHETYPES[layoutIndex % LAYOUT_ARCHETYPES.length];
  const ActiveIcon = activeArchetype.icon;

  /* Render layout based on active archetype */
  const renderLayoutContent = () => {
    if (arrangedPosts.length === 0) return null;

    const p = arrangedPosts;
    const currentId = activeArchetype.id;

    // Helper to safely fetch post by index with wrapping
    const getP = (idx: number) => p[idx % p.length];

    // ARCHETYPE 1: "hero-top" (Classic diagram: Hero top 2 cols, left 2 stacked, right 1 tall)
    if (currentId === 'hero-top') {
      const chunks: Post[][] = [];
      for (let i = 0; i < p.length; i += 4) {
        chunks.push(p.slice(i, i + 4));
      }

      return (
        <div className="space-y-4 sm:space-y-5 w-full">
          {chunks.map((chunk, cIdx) => {
            if (chunk.length >= 4) {
              const [p0, p1, p2, p3] = chunk;
              return (
                <div key={`arch1-${cIdx}-${p0.id}`} className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
                  {/* Hero Top (Spans 2 cols) */}
                  <div className="col-span-2 w-full">
                    <PostCard
                      post={p0}
                      viewMode="list"
                      cardVariant="hero"
                      className="w-full max-w-none"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>

                  {/* Left Column Top */}
                  <div className="col-span-1 w-full">
                    <PostCard
                      post={p1}
                      viewMode="grid"
                      className="w-full h-full max-w-none flex flex-col justify-between"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>

                  {/* Right Column Tall (Spans 2 rows) */}
                  <div className="col-span-1 row-span-2 w-full">
                    <PostCard
                      post={p3}
                      viewMode="grid"
                      cardVariant="tall"
                      className="w-full h-full max-w-none flex flex-col justify-between"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>

                  {/* Left Column Bottom */}
                  <div className="col-span-1 w-full">
                    <PostCard
                      post={p2}
                      viewMode="grid"
                      className="w-full h-full max-w-none flex flex-col justify-between"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>
                </div>
              );
            }

            // Fallback for remaining items
            return (
              <div key={`arch1-rem-${cIdx}`} className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
                {chunk.map((item) => (
                  <div key={item.id} className="col-span-1 w-full">
                    <PostCard
                      post={item}
                      viewMode="grid"
                      className="w-full h-full max-w-none"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    // ARCHETYPE 2: "hero-center" (Tall on left, 2 stacked on right, then center Hero, then 2 grid cards)
    if (currentId === 'hero-center') {
      const chunks: Post[][] = [];
      for (let i = 0; i < p.length; i += 5) {
        chunks.push(p.slice(i, i + 5));
      }

      return (
        <div className="space-y-4 sm:space-y-5 w-full">
          {chunks.map((chunk, cIdx) => {
            if (chunk.length >= 4) {
              const p0 = chunk[0];
              const p1 = chunk[1];
              const p2 = chunk[2];
              const p3 = chunk[3];
              const p4 = chunk[4]; // optional 5th

              return (
                <div key={`arch2-${cIdx}-${p0.id}`} className="space-y-2.5 sm:space-y-4 w-full">
                  {/* Top Split Section: Tall Left (spans 2 rows), 2 Stacked Right */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
                    <div className="col-span-1 row-span-2 w-full">
                      <PostCard
                        post={p0}
                        viewMode="grid"
                        cardVariant="tall"
                        className="w-full h-full max-w-none flex flex-col justify-between"
                        onSelectPost={onSelectPost}
                        onSelectBusiness={onSelectBusiness}
                      />
                    </div>

                    <div className="col-span-1 w-full">
                      <PostCard
                        post={p1}
                        viewMode="grid"
                        className="w-full h-full max-w-none flex flex-col justify-between"
                        onSelectPost={onSelectPost}
                        onSelectBusiness={onSelectBusiness}
                      />
                    </div>

                    <div className="col-span-1 w-full">
                      <PostCard
                        post={p2}
                        viewMode="grid"
                        className="w-full h-full max-w-none flex flex-col justify-between"
                        onSelectPost={onSelectPost}
                        onSelectBusiness={onSelectBusiness}
                      />
                    </div>
                  </div>

                  {/* Center Hero Banner (Spans 2 cols) */}
                  <div className="w-full">
                    <PostCard
                      post={p3}
                      viewMode="list"
                      cardVariant="hero"
                      className="w-full max-w-none"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>

                  {/* If 5th exists, show alongside wrapped item or single */}
                  {p4 && (
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
                      <div className="col-span-1 w-full">
                        <PostCard
                          post={p4}
                          viewMode="grid"
                          className="w-full h-full max-w-none"
                          onSelectPost={onSelectPost}
                          onSelectBusiness={onSelectBusiness}
                        />
                      </div>
                      <div className="col-span-1 w-full">
                        <PostCard
                          post={getP(cIdx * 5 + 5)}
                          viewMode="grid"
                          className="w-full h-full max-w-none"
                          onSelectPost={onSelectPost}
                          onSelectBusiness={onSelectBusiness}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={`arch2-rem-${cIdx}`} className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
                {chunk.map((item) => (
                  <div key={item.id} className="col-span-1 w-full">
                    <PostCard
                      post={item}
                      viewMode="grid"
                      className="w-full h-full max-w-none"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    // ARCHETYPE 3: "zigzag" (Dynamic alternating asymmetry: Tall Right with 2 stacked Left, followed by Tall Left with 2 stacked Right, punctuated by Hero)
    if (currentId === 'zigzag') {
      const chunks: Post[][] = [];
      for (let i = 0; i < p.length; i += 6) {
        chunks.push(p.slice(i, i + 6));
      }

      return (
        <div className="space-y-4 sm:space-y-5 w-full">
          {chunks.map((chunk, cIdx) => {
            if (chunk.length >= 3) {
              const p0 = chunk[0];
              const p1 = chunk[1];
              const p2 = chunk[2];
              const p3 = chunk[3];
              const p4 = chunk[4];
              const p5 = chunk[5];

              return (
                <div key={`arch3-${cIdx}-${p0.id}`} className="space-y-2.5 sm:space-y-4 w-full">
                  {/* First Phase: Tall Right, 2 Stacked Left */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
                    <div className="col-span-1 w-full">
                      <PostCard
                        post={p0}
                        viewMode="grid"
                        className="w-full h-full max-w-none"
                        onSelectPost={onSelectPost}
                        onSelectBusiness={onSelectBusiness}
                      />
                    </div>
                    <div className="col-span-1 row-span-2 w-full">
                      <PostCard
                        post={p1}
                        viewMode="grid"
                        cardVariant="tall"
                        className="w-full h-full max-w-none"
                        onSelectPost={onSelectPost}
                        onSelectBusiness={onSelectBusiness}
                      />
                    </div>
                    <div className="col-span-1 w-full">
                      <PostCard
                        post={p2}
                        viewMode="grid"
                        className="w-full h-full max-w-none"
                        onSelectPost={onSelectPost}
                        onSelectBusiness={onSelectBusiness}
                      />
                    </div>
                  </div>

                  {/* Middle Accent: If p3 exists */}
                  {p3 && (
                    <div className="w-full">
                      <PostCard
                        post={p3}
                        viewMode="list"
                        cardVariant="hero"
                        className="w-full max-w-none"
                        onSelectPost={onSelectPost}
                        onSelectBusiness={onSelectBusiness}
                      />
                    </div>
                  )}

                  {/* Second Phase: Inverse ZigZag - Tall Left, 2 Stacked Right */}
                  {p4 && (
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
                      <div className="col-span-1 row-span-2 w-full">
                        <PostCard
                          post={p4}
                          viewMode="grid"
                          cardVariant="tall"
                          className="w-full h-full max-w-none"
                          onSelectPost={onSelectPost}
                          onSelectBusiness={onSelectBusiness}
                        />
                      </div>
                      <div className="col-span-1 w-full">
                        <PostCard
                          post={p5 || getP(0)}
                          viewMode="grid"
                          className="w-full h-full max-w-none"
                          onSelectPost={onSelectPost}
                          onSelectBusiness={onSelectBusiness}
                        />
                      </div>
                      <div className="col-span-1 w-full">
                        <PostCard
                          post={getP(cIdx * 6 + 6)}
                          viewMode="grid"
                          className="w-full h-full max-w-none"
                          onSelectPost={onSelectPost}
                          onSelectBusiness={onSelectBusiness}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={`arch3-rem-${cIdx}`} className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
                {chunk.map((item) => (
                  <div key={item.id} className="col-span-1 w-full">
                    <PostCard
                      post={item}
                      viewMode="grid"
                      className="w-full h-full max-w-none"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    // ARCHETYPE 4: "hero-bottom" (Inverted Mural: 2 standard top, Tall Left + 2 Stacked Right in middle, Hero Bottom)
    if (currentId === 'hero-bottom') {
      const chunks: Post[][] = [];
      for (let i = 0; i < p.length; i += 4) {
        chunks.push(p.slice(i, i + 4));
      }

      return (
        <div className="space-y-4 sm:space-y-5 w-full">
          {chunks.map((chunk, cIdx) => {
            if (chunk.length >= 4) {
              const [p0, p1, p2, p3] = chunk;
              return (
                <div key={`arch4-${cIdx}-${p0.id}`} className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
                  {/* Left Column Tall (spans 2 rows) */}
                  <div className="col-span-1 row-span-2 w-full">
                    <PostCard
                      post={p0}
                      viewMode="grid"
                      cardVariant="tall"
                      className="w-full h-full max-w-none flex flex-col justify-between"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>

                  {/* Top Right */}
                  <div className="col-span-1 w-full">
                    <PostCard
                      post={p1}
                      viewMode="grid"
                      className="w-full h-full max-w-none flex flex-col justify-between"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>

                  {/* Bottom Right */}
                  <div className="col-span-1 w-full">
                    <PostCard
                      post={p2}
                      viewMode="grid"
                      className="w-full h-full max-w-none flex flex-col justify-between"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>

                  {/* Hero Bottom (Spans 2 cols) */}
                  <div className="col-span-2 w-full">
                    <PostCard
                      post={p3}
                      viewMode="list"
                      cardVariant="hero"
                      className="w-full max-w-none"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div key={`arch4-rem-${cIdx}`} className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
                {chunk.map((item) => (
                  <div key={item.id} className="col-span-1 w-full">
                    <PostCard
                      post={item}
                      viewMode="grid"
                      className="w-full h-full max-w-none"
                      onSelectPost={onSelectPost}
                      onSelectBusiness={onSelectBusiness}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      key={`layout-${layoutIndex}-${shiftOffset}`}
      initial={{ opacity: 0.9, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full select-none"
    >
      {renderLayoutContent()}
    </motion.div>
  );
};
