import { useState, useEffect, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Dashboard } from '@/components/views/Dashboard';
import { Pipeline } from '@/components/views/Pipeline';
import { GrantDetail } from '@/components/views/GrantDetail';
import { ApplicationBuilder } from '@/components/views/ApplicationBuilder';
import { Reports } from '@/components/views/Reports';
import { Settings } from '@/components/views/Settings';
import { Calendar } from '@/components/views/Calendar';
import { Recommendations } from '@/components/views/Recommendations';
import { GrantComparison } from '@/components/views/GrantComparison';
import { BudgetCalculator } from '@/components/views/BudgetCalculator';
import { TeamManagement } from '@/components/views/TeamManagement';
import { WelcomeTour } from '@/components/WelcomeTour';
import type { ViewType } from '@/types';
import './App.css';

// Memoized starfield component to prevent re-render jumps
function StarfieldBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${8 + Math.random() * 4}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
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

// Keyboard shortcuts help modal
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
    { key: '⌘S', description: 'Save current document' },
    { key: '⌘N', description: 'Add new grant' },
    { key: '?', description: 'Show this help' },
    { key: 'Esc', description: 'Close modal / Cancel' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#111827] border border-[#273155] rounded-2xl p-6 w-[400px] max-w-[90vw]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#F3F6FF]">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-[#A9B3D0] hover:text-[#F3F6FF]">
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <span className="text-[#A9B3D0] text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-[#161F32] text-[#F3F6FF] text-xs rounded-lg border border-[#273155]">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedGrantId, setSelectedGrantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const validViews: ViewType[] = ['dashboard', 'pipeline', 'grant-detail', 'builder', 'reports', 'settings', 'calendar', 'recommendations', 'comparison', 'budget', 'team'];
    
    try {
      const savedView = localStorage.getItem('grantManager_currentView');
      const savedGrantId = localStorage.getItem('grantManager_selectedGrantId');
      
      if (savedView && validViews.includes(savedView as ViewType)) {
        setCurrentView(savedView as ViewType);
      }
      if (savedGrantId && /^[a-zA-Z0-9_-]+$/.test(savedGrantId)) {
        setSelectedGrantId(savedGrantId);
      }
    } catch (e) {
      console.warn('Failed to load saved state');
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      // Show welcome tour for first-time users
      try {
        const hasSeenTour = localStorage.getItem('grantManager_seenTour');
        if (!hasSeenTour) {
          setShowWelcomeTour(true);
        }
      } catch (e) {
        console.warn('Failed to check tour state');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('grantManager_currentView', currentView);
      if (selectedGrantId) {
        localStorage.setItem('grantManager_selectedGrantId', selectedGrantId);
      }
    } catch (e) {
      console.warn('Failed to save state');
    }
  }, [currentView, selectedGrantId]);

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
        const views: ViewType[] = [
          'dashboard', 'pipeline', 'builder', 'reports', 
          'calendar', 'recommendations', 'budget', 'team'
        ];
        const index = parseInt(e.key) - 1;
        if (index < views.length) {
          setCurrentView(views[index]);
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
  }, []);

  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      gsap.fromTo(mainContent,
        { opacity: 0.8 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [currentView]);

  const handleViewChange = useCallback((view: ViewType, grantId?: string) => {
    if (grantId) {
      setSelectedGrantId(grantId);
    }
    setCurrentView(view);
  }, [setSelectedGrantId, setCurrentView]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={handleViewChange} />;
      case 'pipeline':
        return <Pipeline onViewChange={handleViewChange} />;
      case 'grant-detail':
        if (selectedGrantId) {
          return <GrantDetail grantId={selectedGrantId} onViewChange={handleViewChange} />;
        }
        return <Pipeline onViewChange={handleViewChange} />;
      case 'builder':
        return <ApplicationBuilder />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'calendar':
        return <Calendar onViewChange={handleViewChange} />;
      case 'recommendations':
        return <Recommendations onViewChange={handleViewChange} />;
      case 'comparison':
        return <GrantComparison onViewChange={handleViewChange} />;
      case 'budget':
        return <BudgetCalculator />;
      case 'team':
        return <TeamManagement />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#0B0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#4F46E5] rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">EU</span>
          </div>
          <p className="text-[#A9B3D0] text-sm">Loading Grant Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0B0F1C] flex overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange}
        selectedGrantId={selectedGrantId}
      />

      <main className="main-content flex-1 ml-[260px] h-full overflow-y-auto scrollbar-thin">
        {renderView()}
      </main>

      {/* Starfield Background Effect */}
      <StarfieldBackground />

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            border: '1px solid #273155',
            color: '#F3F6FF',
          },
        }}
      />

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
          className="p-2 bg-[#161F32] border border-[#273155] rounded-lg text-[#A9B3D0] hover:text-[#F3F6FF] hover:border-[#4F46E5]/50 transition-colors"
          title="Keyboard shortcuts"
        >
          <kbd className="text-xs">?</kbd>
        </button>
      </div>
    </div>
  );
}

export default App;
