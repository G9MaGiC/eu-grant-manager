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
  Users,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import type { ViewType } from '@/types';
import { toast } from 'sonner';
import { HelpCenter } from '@/components/views/HelpCenter';
import { useTheme } from '@/components/ThemeProvider';

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

type NavGroup = 'main' | 'tools' | 'management';

interface NavItem {
  view: ViewType;
  label: string;
  icon: React.ElementType;
  badge?: number;
  group: NavGroup;
}

const navItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { view: 'pipeline', label: 'Pipeline', icon: List, badge: 2, group: 'main' },
  { view: 'builder', label: 'Application Builder', icon: FileText, group: 'main' },
  { view: 'calendar', label: 'Calendar', icon: Calendar, group: 'main' },
  { view: 'recommendations', label: 'AI Recommendations', icon: Lightbulb, badge: 5, group: 'tools' },
  { view: 'comparison', label: 'Compare Grants', icon: Scale, group: 'tools' },
  { view: 'budget', label: 'Budget Calculator', icon: Calculator, group: 'tools' },
  { view: 'reports', label: 'Reports', icon: BarChart3, group: 'management' },
  { view: 'team', label: 'Team', icon: Users, group: 'management' },
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<NavGroup, boolean>>({
    main: true,
    tools: true,
    management: true,
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

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
    setIsMobileOpen(false);
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
      case 'deadline': return <Clock className="w-4 h-4 text-red-500" />;
      case 'success': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  const toggleGroup = (group: NavGroup) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const searchResults = [
    { type: 'grant', title: 'KPO Energy Retrofit', subtitle: 'Deadline: Mar 18', icon: Zap },
    { type: 'document', title: 'Budget_Template.xlsx', subtitle: 'KPO Energy Retrofit', icon: FileText },
    { type: 'task', title: 'Finalize budget table', subtitle: 'Due: Mar 15', icon: Check },
  ].filter(item => 
    searchQuery && (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = currentView === item.view || (item.view === 'pipeline' && currentView === 'grant-detail');
    
    return (
      <button
        key={item.view}
        onClick={() => handleViewClick(item.view)}
        className={`sidebar-item w-full text-left relative ${isActive ? 'active' : ''}`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{item.label}</span>
        {item.badge && (
          <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex-shrink-0">
            {item.badge}
          </span>
        )}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
        )}
      </button>
    );
  };

  const renderGroup = (title: string, group: NavGroup, items: NavItem[]) => {
    if (items.length === 0) return null;
    const isExpanded = expandedGroups[group];
    
    return (
      <div key={group} className="mb-2">
        <button
          onClick={() => toggleGroup(group)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-secondary uppercase tracking-wider w-full hover:text-primary transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
          {title}
        </button>
        {isExpanded && (
          <div className="space-y-1 px-3">
            {items.map(renderNavItem)}
          </div>
        )}
      </div>
    );
  };

  const mainItems = navItems.filter(i => i.group === 'main');
  const toolItems = navItems.filter(i => i.group === 'tools');
  const managementItems = navItems.filter(i => i.group === 'management');

  const ThemeToggle = () => (
    <div className="flex items-center gap-1 p-1 bg-tertiary rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-surface shadow-sm text-amber-500' : 'text-secondary hover:text-primary'}`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-surface shadow-sm text-indigo-400' : 'text-secondary hover:text-primary'}`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition-colors ${theme === 'system' ? 'bg-surface shadow-sm text-accent' : 'text-secondary hover:text-primary'}`}
        title="System preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-theme">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-white font-bold text-lg">EU</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-primary font-semibold text-sm leading-tight">Grant Manager</h1>
            <p className="text-secondary text-xs">Municipality of Krakow</p>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-secondary hover:text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text"
            placeholder="Search grants, docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            aria-label="Search grants and documents"
            className="w-full bg-tertiary border border-theme rounded-xl pl-9 pr-3 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-secondary text-muted text-xs rounded hidden sm:block">⌘K</kbd>
        </div>

        {/* Search Results Dropdown */}
        {showSearch && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-surface border border-theme rounded-xl shadow-xl z-50 overflow-hidden">
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
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center">
                      <result.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-primary text-sm font-medium truncate">{result.title}</p>
                      <p className="text-secondary text-xs truncate">{result.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-secondary" />
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-center">
                <p className="text-secondary text-sm">No results found</p>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-secondary text-sm">Type to search...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
        {renderGroup('Main', 'main', mainItems)}
        {renderGroup('Tools', 'tools', toolItems)}
        {renderGroup('Management', 'management', managementItems)}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-theme space-y-1">
        {/* Theme Toggle */}
        <div className="px-3 py-2">
          <ThemeToggle />
        </div>

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
              <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-theme rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-theme">
                <span className="text-primary font-medium text-sm">Notifications</span>
                <button 
                  onClick={markAllAsRead}
                  className="text-accent text-xs hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notificationList.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-3 border-b border-theme/50 cursor-pointer hover:bg-surface-hover transition-colors ${
                      !notification.read ? 'bg-accent-light/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'text-primary font-medium' : 'text-secondary'}`}>
                          {notification.title}
                        </p>
                        <p className="text-secondary text-xs truncate">{notification.message}</p>
                        <p className="text-muted text-xs mt-1">{notification.timestamp}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1" />
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
        <div className="mt-3 pt-3 border-t border-theme" ref={userMenuRef}>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 w-full hover:bg-tertiary rounded-xl transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AK</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-primary text-sm font-medium truncate">A. Kowalski</p>
                <p className="text-secondary text-xs truncate">Grant Officer</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-secondary transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-theme rounded-xl shadow-xl overflow-hidden">
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      onViewChange('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-tertiary rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      toast.success('Logged out successfully');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
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
      <ClickOutsideHandler 
        show={showUserMenu} 
        onClose={() => setShowUserMenu(false)} 
        excludeRef={userMenuRef}
      />

      {/* Help Center Modal */}
      {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-surface border border-theme rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`
          w-[260px] h-screen bg-secondary border-r border-theme flex flex-col fixed left-0 top-0 z-50
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {sidebarContent}
      </div>
    </>
  );
}
