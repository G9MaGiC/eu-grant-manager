import { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { WelcomeTour } from '@/components/WelcomeTour';
import type { ViewType } from '@/types';

// Starfield background component
function StarfieldBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${8 + Math.random() * 4}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-60 transition-opacity">
      {stars.map((star) => (
        <div
          key={star.id}
          className="starfield-dot"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.animationDelay,
            animationDuration: star.animationDuration,
          }}
        />
      ))}
    </div>
  );
}

// Keyboard shortcuts modal
function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', description: 'Open search' },
    { key: '⌘1', description: 'Go to Dashboard' },
    { key: '⌘2', description: 'Go to Pipeline' },
    { key: '⌘3', description: 'Go to Application Builder' },
    { key: '⌘4', description: 'Go to Reports' },
    { key: '⌘5', description: 'Go to Calendar' },
    { key: '⌘6', description: 'Go to Recommendations' },
    { key: '⌘7', description: 'Go to Budget Calculator' },
    { key: '⌘8', description: 'Go to Team Management' },
    { key: '?', description: 'Show this help' },
    { key: 'Esc', description: 'Close modal' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-theme rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary">Keyboard Shortcuts</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-tertiary rounded-lg text-secondary hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <span className="text-secondary text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-tertiary text-primary text-xs rounded-lg border border-theme font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  // Determine current view from URL
  const getCurrentView = useCallback((): ViewType => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path === '/pipeline') return 'pipeline';
    if (path.startsWith('/grants/')) return 'grant-detail';
    if (path === '/builder') return 'builder';
    if (path === '/reports') return 'reports';
    if (path === '/calendar') return 'calendar';
    if (path === '/recommendations') return 'recommendations';
    if (path === '/comparison') return 'comparison';
    if (path === '/budget') return 'budget';
    if (path === '/team') return 'team';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  }, [location.pathname]);

  const currentView = getCurrentView();

  // Show welcome tour on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const hasSeenTour = localStorage.getItem('grantManager_seenTour');
        if (!hasSeenTour) {
          setShowWelcomeTour(true);
        }
      } catch (e) {
        console.warn('Failed to check tour state');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
      
      // Cmd/Ctrl + 1-8 for navigation
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const routes = [
          '/', '/pipeline', '/builder', '/reports', 
          '/calendar', '/recommendations', '/budget', '/team'
        ];
        const index = parseInt(e.key) - 1;
        if (index < routes.length) {
          navigate(routes[index]);
        }
      }
      
      // ? for help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Animate content on view change
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      gsap.fromTo(mainContent,
        { opacity: 0.8 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [location.pathname]);

  // Handle navigation from sidebar
  const handleViewChange = useCallback((view: ViewType, grantId?: string) => {
    const routes: Record<ViewType, string> = {
      dashboard: '/',
      pipeline: '/pipeline',
      'grant-detail': grantId ? `/grants/${grantId}` : '/pipeline',
      builder: '/builder',
      reports: '/reports',
      calendar: '/calendar',
      recommendations: '/recommendations',
      comparison: '/comparison',
      budget: '/budget',
      team: '/team',
      settings: '/settings',
    };
    navigate(routes[view] || '/');
  }, [navigate]);

  // Get selected grant ID from URL
  const selectedGrantId = location.pathname.startsWith('/grants/') 
    ? location.pathname.replace('/grants/', '') 
    : null;

  return (
    <div className="h-screen w-full bg-primary flex overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange}
        selectedGrantId={selectedGrantId}
      />

      <main className="main-content flex-1 lg:ml-[260px] h-full overflow-y-auto scrollbar-thin relative">
        <Outlet />
      </main>

      {/* Starfield Background */}
      <StarfieldBackground />

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      {/* Welcome Tour */}
      {showWelcomeTour && (
        <WelcomeTour onClose={() => setShowWelcomeTour(false)} />
      )}

      {/* Keyboard Hint */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setShowShortcuts(true)}
          className="p-2 bg-surface border border-theme rounded-lg text-secondary hover:text-primary hover:border-accent/50 transition-colors shadow-lg"
          title="Keyboard shortcuts"
        >
          <kbd className="text-xs font-mono">?</kbd>
        </button>
      </div>
    </div>
  );
}
