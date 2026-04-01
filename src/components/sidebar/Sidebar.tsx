import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  LayoutDashboard, 
  List, 
  FileText, 
  BarChart3, 
  Search, 
  Settings, 
  HelpCircle,
  LogOut,
  Bell,
  Check,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Zap,
  Calendar,
  Lightbulb,
  Scale,
  Calculator,
  Users
} from 'lucide-react';
import type { ViewType } from '@/types';
import { toast } from 'sonner';
import { HelpCenter } from '@/components/views/HelpCenter';

// Component to handle clicks outside a referenced element
function ClickOutsideHandler({ 
  show, 
  onClose, 
  excludeRef 
}: { 
  show: boolean; 
  onClose: () => void; 
  excludeRef: React.RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    if (!show) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (excludeRef.current && !excludeRef.current.contains(target)) {
        onClose();
      }
    };
    
    // Use setTimeout to avoid triggering immediately on the same click that opened
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [show, onClose, excludeRef]);
  
  return null;
}

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedGrantId?: string | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'success' | 'info' | 'warning';
  timestamp: string;
  read: boolean;
}

const notifications: Notification[] = [
  { id: 'n1', title: 'Deadline approaching', message: 'KPO Energy Retrofit due in 3 days', type: 'deadline', timestamp: '10 min ago', read: false },
  { id: 'n2', title: 'Document uploaded', message: 'Budget_Template.xlsx uploaded successfully', type: 'success', timestamp: '1 hour ago', read: false },
  { id: 'n3', title: 'AI suggestion ready', message: 'New content suggestions for Executive Summary', type: 'info', timestamp: '2 hours ago', read: true },
  { id: 'n4', title: 'Task completed', message: 'M. Nowak completed "Review guidelines"', type: 'success', timestamp: 'Yesterday', read: true },
];

const navItems: { view: ViewType; label: string; icon: React.ElementType; badge?: number }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'pipeline', label: 'Pipeline', icon: List, badge: 2 },
  { view: 'builder', label: 'Application Builder', icon: FileText },
  { view: 'calendar', label: 'Calendar', icon: Calendar },
  { view: 'recommendations', label: 'AI Recommendations', icon: Lightbulb, badge: 5 },
  { view: 'comparison', label: 'Compare Grants', icon: Scale },
  { view: 'budget', label: 'Budget Calculator', icon: Calculator },
  { view: 'reports', label: 'Reports', icon: BarChart3 },
  { view: 'team', label: 'Team', icon: Users },
];

export function Sidebar({ currentView, onViewChange, selectedGrantId }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(notifications.filter(n => !n.read).length);
  const [notificationList, setNotificationList] = useState(notifications);
  const [showHelp, setShowHelp] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      const items = navRef.current.querySelectorAll('.sidebar-item');
      gsap.fromTo(items, 
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, []);

  const handleViewClick = (view: ViewType) => {
    if (view === 'grant-detail' && !selectedGrantId) {
      onViewChange('pipeline');
    } else {
      onViewChange(view);
    }
  };

  const markAsRead = (id: string) => {
    setNotificationList(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotificationList(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deadline': return <Clock className="w-4 h-4 text-[#EF4444]" />;
      case 'success': return <Check className="w-4 h-4 text-[#22C55E]" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-[#F59E0B]" />;
      default: return <Sparkles className="w-4 h-4 text-[#4F46E5]" />;
    }
  };

  const searchResults = [
    { type: 'grant', title: 'KPO Energy Retrofit', subtitle: 'Deadline: Mar 18', icon: Zap },
    { type: 'document', title: 'Budget_Template.xlsx', subtitle: 'KPO Energy Retrofit', icon: FileText },
    { type: 'task', title: 'Finalize budget table', subtitle: 'Due: Mar 15', icon: Check },
  ].filter(item => 
    searchQuery && (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div 
      ref={sidebarRef}
      className="w-[260px] h-screen bg-[#111827] border-r border-[#273155] flex flex-col fixed left-0 top-0 z-50"
    >
      {/* Logo */}
      <div className="p-5 border-b border-[#273155]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg shadow-[#4F46E5]/20">
            <span className="text-white font-bold text-lg">EU</span>
          </div>
          <div>
            <h1 className="text-[#F3F6FF] font-semibold text-sm leading-tight">Grant Manager</h1>
            <p className="text-[#A9B3D0] text-xs">Municipality of Krakow</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3D0]" />
          <input 
            type="text"
            placeholder="Search grants, docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            aria-label="Search grants and documents"
            className="w-full bg-[#161F32] border border-[#273155] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#F3F6FF] placeholder:text-[#A9B3D0]/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-[#273155] text-[#A9B3D0] text-xs rounded">⌘K</kbd>
        </div>

        {/* Search Results Dropdown */}
        {showSearch && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-[#161F32] border border-[#273155] rounded-xl shadow-xl z-50 overflow-hidden">
            {searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                      toast.success(`Navigating to ${result.title}...`);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1E293B] transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-[#4F46E5]/15 rounded-lg flex items-center justify-center">
                      <result.icon className="w-4 h-4 text-[#4F46E5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F3F6FF] text-sm font-medium truncate">{result.title}</p>
                      <p className="text-[#A9B3D0] text-xs truncate">{result.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A9B3D0]" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-[#A9B3D0] text-sm">No results found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view || (item.view === 'pipeline' && currentView === 'grant-detail');
          return (
            <button
              key={item.view}
              onClick={() => handleViewClick(item.view)}
              className={`sidebar-item w-full text-left relative ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 bg-[#EF4444] text-white text-xs rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#4F46E5] rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-[#273155] space-y-1">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="sidebar-item w-full text-left relative"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-[#EF4444] text-white text-xs rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#161F32] border border-[#273155] rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-[#273155]">
                <span className="text-[#F3F6FF] font-medium text-sm">Notifications</span>
                <button 
                  onClick={markAllAsRead}
                  className="text-[#4F46E5] text-xs hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notificationList.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-3 border-b border-[#273155]/50 cursor-pointer hover:bg-[#1E293B] transition-colors ${
                      !notification.read ? 'bg-[#4F46E5]/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#0B0F1C] rounded-lg flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'text-[#F3F6FF] font-medium' : 'text-[#A9B3D0]'}`}>
                          {notification.title}
                        </p>
                        <p className="text-[#A9B3D0] text-xs truncate">{notification.message}</p>
                        <p className="text-[#A9B3D0] text-xs mt-1">{notification.timestamp}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#4F46E5] rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => onViewChange('settings')}
          className={`sidebar-item w-full text-left ${currentView === 'settings' ? 'active' : ''}`}
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
          {currentView === 'settings' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#4F46E5] rounded-r-full" />
          )}
        </button>
        <button 
          onClick={() => setShowHelp(true)}
          className="sidebar-item w-full text-left"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Help</span>
        </button>
        
        {/* User */}
        <div className="mt-3 pt-3 border-t border-[#273155]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AK</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F3F6FF] text-sm font-medium truncate">A. Kowalski</p>
              <p className="text-[#A9B3D0] text-xs truncate">Grant Officer</p>
            </div>
            <button 
              onClick={() => toast.success('Logged out successfully')}
              className="text-[#A9B3D0] hover:text-[#F3F6FF] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      <ClickOutsideHandler 
        show={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        excludeRef={sidebarRef}
      />
      <ClickOutsideHandler 
        show={showSearch} 
        onClose={() => setShowSearch(false)} 
        excludeRef={searchRef}
      />

      {/* Help Center Modal */}
      {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}
    </div>
  );
}
