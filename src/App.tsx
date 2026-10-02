import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HomeReelsView } from './components/HomeReelsView';
import { Feed } from './components/Feed';
import { ReadyPlansView } from './components/ReadyPlansView';
import { BusinessDirectory } from './components/BusinessDirectory';
import { BusinessAuthScreen } from './components/BusinessAuthScreen';
import { PostDetailModal } from './components/PostDetailModal';
import { BusinessProfileModal } from './components/BusinessProfileModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { WelcomeSplashScreen } from './components/WelcomeSplashScreen';
import type { BuilderMode } from './components/ItineraryBuilderModal';
import { Post } from './types';
import { APP_CONFIG } from './config/brand';
import { BellRing, X } from 'lucide-react';

// Lazy loaded heavy views and modals for optimal initial load
const VeciInMapsView = lazy(() => import('./components/VeciInMapsView').then(m => ({ default: m.VeciInMapsView })));
const BusinessDashboard = lazy(() => import('./components/BusinessDashboard').then(m => ({ default: m.BusinessDashboard })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const LocationPickerModal = lazy(() => import('./components/LocationPickerModal').then(m => ({ default: m.LocationPickerModal })));
const PushNotificationManager = lazy(() => import('./components/PushNotificationManager').then(m => ({ default: m.PushNotificationManager })));
const CreatePostModal = lazy(() => import('./components/CreatePostModal').then(m => ({ default: m.CreatePostModal })));
const ItineraryBuilderModal = lazy(() => import('./components/ItineraryBuilderModal').then(m => ({ default: m.ItineraryBuilderModal })));

const ViewLoadingFallback = () => (
  <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
    <div className="w-9 h-9 rounded-full border-3 border-cyan-400 border-t-transparent animate-spin" />
    <span className="text-xs text-slate-400 font-medium">Cargando sección...</span>
  </div>
);

const MainApp: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeNotificationToast,
    dismissNotificationToast,
    userLocation,
    setUserLocation,
    currentCity,
    currentSector,
    authenticatedBusinessId,
    posts,
    businesses,
    isAdminAuthenticated,
  } = useApp();

  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostFromProfile, setSelectedPostFromProfile] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isGlobalItineraryOpen, setIsGlobalItineraryOpen] = useState(false);
  const [globalItineraryMode, setGlobalItineraryMode] = useState<BuilderMode>('mode_select');

  // Business Auth Flow state
  const [showBusinessAuthScreen, setShowBusinessAuthScreen] = useState(false);
  const [businessAuthTab, setBusinessAuthTab] = useState<'login' | 'register'>('login');

  const handleWelcomeSplashFinish = React.useCallback(() => {
    // Al terminar la bienvenida con el logo oficial de OleVeci, pasar inmediatamente al home de reels
    setCurrentRole('home');
  }, [setCurrentRole]);

  // Handle direct URLs from WhatsApp or social shares (/anuncio/:id, /comercio/:id, ?post=:id, ?biz=:id)
  useEffect(() => {
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    let targetPostId = searchParams.get('post') || searchParams.get('anuncio');
    let targetBizId = searchParams.get('biz') || searchParams.get('comercio');

    if (!targetPostId && pathname.startsWith('/anuncio/')) {
      targetPostId = pathname.replace('/anuncio/', '').split('/')[0];
    } else if (!targetPostId && pathname.startsWith('/p/')) {
      targetPostId = pathname.replace('/p/', '').split('/')[0];
    }

    if (!targetBizId && pathname.startsWith('/comercio/')) {
      targetBizId = pathname.replace('/comercio/', '').split('/')[0];
    }

    if (targetPostId && posts.length > 0) {
      const foundPost = posts.find((p) => p.id === targetPostId);
      if (foundPost) {
        setSelectedPostFromProfile(false);
        setSelectedPost(foundPost);
      }
    } else if (targetBizId && businesses.length > 0) {
      const foundBiz = businesses.find((b) => b.id === targetBizId);
      if (foundBiz) {
        setSelectedBusinessId(foundBiz.id);
      }
    }
  }, [posts, businesses]);

  // Keep browser URL cleanly synchronized when viewing an announcement or business
  useEffect(() => {
    if (selectedPost) {
      window.history.replaceState({}, '', `/anuncio/${selectedPost.id}`);
    } else if (selectedBusinessId) {
      window.history.replaceState({}, '', `/comercio/${selectedBusinessId}`);
    } else {
      if (
        window.location.pathname.startsWith('/anuncio/') ||
        window.location.pathname.startsWith('/comercio/') ||
        window.location.pathname.startsWith('/p/')
      ) {
        window.history.replaceState({}, '', '/');
      }
    }
  }, [selectedPost, selectedBusinessId]);

  return (
    <div className={`min-h-screen ${currentRole === 'home' ? 'bg-[#040e28]' : 'bg-[#F2F6FA]'} flex flex-col text-slate-900 font-sans antialiased selection:bg-[#007af7] selection:text-white`}>
      {/* Welcome Presentation Splash Animation (snappy and skippable) */}
      <WelcomeSplashScreen durationMs={1200} onFinish={handleWelcomeSplashFinish} />

      {/* Offline Connectivity Alert */}
      <OfflineIndicator />

      {/* Real-time In-App Push Notification Toast */}
      {activeNotificationToast && (
        <div
          id="global-notification-toast"
          role="alert"
          aria-live="assertive"
          className="fixed top-4 right-4 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-full bg-[#08152c]/95 text-white p-3.5 sm:p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,180,216,0.22),0_4px_16px_rgba(0,0,0,0.5)] border border-[#00d8a5]/35 backdrop-blur-md flex items-start gap-3.5 animate-in slide-in-from-top duration-300 ring-1 ring-white/10 overflow-hidden group"
        >
          {/* Top brand gradient line (OleVeci Turquoise to Sky Blue) */}
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-[#00d8a5] via-[#00b4d8] to-[#007af7]" />

          {/* Subtle turquoise background ambient glow */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#00d8a5]/15 rounded-full blur-xl pointer-events-none" />

          {/* Turquoise Icon Badge */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d8a5] to-[#00b4d8] flex items-center justify-center text-[#021b58] shrink-0 mt-0.5 shadow-md shadow-[#00d8a5]/30">
            <BellRing className="w-4 h-4 text-[#021b58]" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#08152c] animate-pulse" />
          </div>

          {/* Text Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-[#00e5b8] tracking-tight truncate">
                {activeNotificationToast.title}
              </h4>
              <span className="text-[10px] text-[#00b4d8]/80 font-semibold shrink-0">
                {activeNotificationToast.time || 'Ahora'}
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
              {activeNotificationToast.body}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={dismissNotificationToast}
            className="p-1.5 text-slate-400 hover:text-[#00e5b8] hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0 active:scale-95"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenBusinessAuth={(tab = 'login') => {
          setBusinessAuthTab(tab);
          setShowBusinessAuthScreen(true);
          setCurrentRole('business');
        }}
      />

      {/* Main Body */}
      <main className={`flex-1 ${currentRole === 'home' || currentRole === 'maps' ? 'pb-0' : 'pb-12'}`}>
        {currentRole === 'home' && (
          <HomeReelsView
            onSelectPost={(post) => {
              setSelectedPostFromProfile(false);
              setSelectedPost(post);
            }}
            onSelectBusiness={(businessId) => setSelectedBusinessId(businessId)}
            onOpenItineraryBuilder={() => {
              setGlobalItineraryMode('manual');
              setIsGlobalItineraryOpen(true);
            }}
          />
        )}

        {currentRole === 'explorer' && (
          <Feed
            onSelectPost={(post) => {
              setSelectedPostFromProfile(false);
              setSelectedPost(post);
            }}
            onSelectBusiness={(businessId) => setSelectedBusinessId(businessId)}
            onOpenCreatePost={() => {
              if (!authenticatedBusinessId) {
                setBusinessAuthTab('login');
                setShowBusinessAuthScreen(true);
              }
              setCurrentRole('business');
              if (authenticatedBusinessId) {
                setIsCreatePostOpen(true);
              }
            }}
            onOpenCreateBusiness={() => {
              setBusinessAuthTab('register');
              setShowBusinessAuthScreen(true);
              setCurrentRole('business');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
          />
        )}

        {currentRole === 'plans' && (
          <ReadyPlansView
            onSelectPost={(post) => {
              setSelectedPostFromProfile(false);
              setSelectedPost(post);
            }}
            onSelectBusiness={(businessId) => setSelectedBusinessId(businessId)}
            onOpenItineraryBuilder={(mode) => {
              setGlobalItineraryMode(mode || 'manual');
              setIsGlobalItineraryOpen(true);
            }}
          />
        )}

        {currentRole === 'maps' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <VeciInMapsView
              onSelectBusiness={(businessId) => setSelectedBusinessId(businessId)}
              onSelectPost={(post) => {
                setSelectedPostFromProfile(false);
                setSelectedPost(post);
              }}
            />
          </Suspense>
        )}

        {currentRole === 'directory' && (
          <BusinessDirectory
            onSelectBusiness={(businessId) => setSelectedBusinessId(businessId)}
            onSelectPost={(post) => {
              setSelectedPostFromProfile(false);
              setSelectedPost(post);
            }}
          />
        )}

        {currentRole === 'business' && (
          !authenticatedBusinessId || showBusinessAuthScreen ? (
            <BusinessAuthScreen
              initialTab={businessAuthTab}
              onSuccessLogin={(_bizId) => {
                setShowBusinessAuthScreen(false);
              }}
              onCancel={() => {
                setShowBusinessAuthScreen(false);
                setCurrentRole('explorer');
              }}
            />
          ) : (
            <Suspense fallback={<ViewLoadingFallback />}>
              <BusinessDashboard
                onOpenCreatePost={() => setIsCreatePostOpen(true)}
                onSelectPost={(post) => {
                  setSelectedPostFromProfile(false);
                  setSelectedPost(post);
                }}
                onOpenAuthScreen={(tab) => {
                  setBusinessAuthTab(tab);
                  setShowBusinessAuthScreen(true);
                }}
              />
            </Suspense>
          )
        )}

        {currentRole === 'admin' && (
          isAdminAuthenticated ? (
            <Suspense fallback={<ViewLoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          ) : (
            <BusinessAuthScreen
              initialTab="login"
              onSuccessLogin={() => {
                setShowBusinessAuthScreen(false);
              }}
              onCancel={() => {
                setShowBusinessAuthScreen(false);
                setCurrentRole('explorer');
              }}
            />
          )
        )}
      </main>

      {/* Modals */}
      {isLocationPickerOpen && (
        <Suspense fallback={null}>
          <LocationPickerModal
            isOpen={isLocationPickerOpen}
            onClose={() => setIsLocationPickerOpen(false)}
            cityName={currentCity}
            sectorName={currentSector === 'all' ? 'Centro' : currentSector}
            initialAddress=""
            initialCoordinates={userLocation || APP_CONFIG.pilotCoordinates}
            onSelectLocation={(_address, coords) => {
              setUserLocation(coords);
              setIsLocationPickerOpen(false);
            }}
          />
        </Suspense>
      )}

      {isNotificationModalOpen && (
        <Suspense fallback={null}>
          <PushNotificationManager
            isOpen={isNotificationModalOpen}
            onClose={() => setIsNotificationModalOpen(false)}
          />
        </Suspense>
      )}

      <PostDetailModal
        post={selectedPost}
        onClose={() => {
          setSelectedPost(null);
          setSelectedPostFromProfile(false);
        }}
        onSelectBusiness={(businessId) => {
          setSelectedPost(null);
          setSelectedPostFromProfile(false);
          setSelectedBusinessId(businessId);
        }}
        onBackToProfile={(businessId) => {
          setSelectedPost(null);
          setSelectedPostFromProfile(false);
          setSelectedBusinessId(businessId);
        }}
        fromBusinessProfile={selectedPostFromProfile}
        onSelectPost={(nextPost) => setSelectedPost(nextPost)}
        isBusinessSection={currentRole === 'business'}
        onEditPost={(postToEdit) => {
          setSelectedPost(null);
          setSelectedPostFromProfile(false);
          setEditingPost(postToEdit);
          setIsCreatePostOpen(true);
        }}
      />

      <BusinessProfileModal
        businessId={selectedBusinessId}
        onClose={() => setSelectedBusinessId(null)}
        onSelectPost={(post) => {
          setSelectedBusinessId(null);
          setSelectedPostFromProfile(true);
          setSelectedPost(post);
        }}
      />

      {isCreatePostOpen && (
        <Suspense fallback={null}>
          <CreatePostModal
            isOpen={isCreatePostOpen}
            onClose={() => {
              setIsCreatePostOpen(false);
              setEditingPost(null);
            }}
            editingPost={editingPost}
            onPostCreated={(post) => {
              setSelectedPostFromProfile(false);
              setSelectedPost(post);
            }}
          />
        </Suspense>
      )}

      {/* Global Itinerary Builder Modal */}
      {isGlobalItineraryOpen && (
        <Suspense fallback={null}>
          <ItineraryBuilderModal
            isOpen={isGlobalItineraryOpen}
            initialMode={globalItineraryMode}
            onClose={() => setIsGlobalItineraryOpen(false)}
            onSelectBusiness={(bizId) => setSelectedBusinessId(bizId)}
            onSelectPost={(post) => setSelectedPost(post)}
            onNavigateToDescubre={() => {
              setIsGlobalItineraryOpen(false);
              setCurrentRole('explorer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Suspense>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
