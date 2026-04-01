import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Save,
  Mail,
  Smartphone,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  X,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';

export function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences' | 'data'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile settings
  const [profile, setProfile] = useState({
    name: 'A. Kowalski',
    email: 'a.kowalski@krakow.pl',
    role: 'Grant Officer',
    department: 'Municipal Development',
    phone: '+48 12 123 4567',
    timezone: 'Europe/Warsaw',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailDeadlines: true,
    emailUpdates: true,
    emailWeekly: true,
    pushDeadlines: true,
    pushUpdates: false,
    smsCritical: false,
  });

  // Theme integration
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Preferences
  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'EUR',
    dateFormat: 'YYYY-MM-DD',
    compactMode: false,
  });

  // Avatar
  const [avatar, setAvatar] = useState<string | null>(null);

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');

  useEffect(() => {
    gsap.fromTo('.settings-content',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success('Settings saved successfully');
  };

  const handleExport = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Exporting your data...',
        success: 'Data exported successfully',
        error: 'Export failed',
      }
    );
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
        toast.success('Avatar updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handle2FASetup = () => {
    if (twoFACode === '123456') {
      setTwoFAEnabled(true);
      setShow2FAModal(false);
      setTwoFACode('');
      toast.success('Two-factor authentication enabled');
    } else if (twoFACode) {
      toast.error('Invalid verification code');
    }
  };

  const handle2FADisable = () => {
    setTwoFAEnabled(false);
    toast.success('Two-factor authentication disabled');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          JSON.parse(event.target?.result as string);
          toast.success('Data imported successfully');
        } catch {
          toast.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires admin approval', {
      description: 'Please contact your system administrator',
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Database },
  ];

  return (
    <div className="p-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-primary">Settings</h1>
        <p className="text-secondary mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <div className="card-dark p-2 sticky top-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-accent/15 text-accent'
                      : 'text-secondary hover:text-primary hover:bg-tertiary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-9">
          <div className="settings-content card-dark p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-primary mb-6">Profile Information</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        'AK'
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-tertiary border border-theme rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-primary font-medium">{profile.name}</h3>
                    <p className="text-secondary text-sm">{profile.role}</p>
                    <p className="text-secondary text-sm">{profile.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-secondary text-sm mb-2 block">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                    />
                  </div>
                  <div>
                    <label className="text-secondary text-sm mb-2 block">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                    />
                  </div>
                  <div>
                    <label className="text-secondary text-sm mb-2 block">Role</label>
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                    />
                  </div>
                  <div>
                    <label className="text-secondary text-sm mb-2 block">Department</label>
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                    />
                  </div>
                  <div>
                    <label className="text-secondary text-sm mb-2 block">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                    />
                  </div>
                  <div>
                    <label className="text-secondary text-sm mb-2 block">Timezone</label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                    >
                      <option value="Europe/Warsaw">Europe/Warsaw (GMT+1)</option>
                      <option value="Europe/Berlin">Europe/Berlin (GMT+1)</option>
                      <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-primary mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-primary font-medium mb-4 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent" />
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'emailDeadlines', label: 'Deadline reminders', description: 'Get notified 7, 3, and 1 day before deadlines' },
                        { key: 'emailUpdates', label: 'Grant status updates', description: 'When grants are submitted, approved, or rejected' },
                        { key: 'emailWeekly', label: 'Weekly summary', description: 'Weekly digest of your grant pipeline' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-start gap-3 p-3 bg-tertiary rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="mt-1 w-4 h-4 rounded border-theme text-accent focus:ring-[#4F46E5] bg-[#0B0F1C]"
                          />
                          <div className="flex-1">
                            <p className="text-primary text-sm font-medium">{item.label}</p>
                            <p className="text-secondary text-xs">{item.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-theme">
                    <h3 className="text-primary font-medium mb-4 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#22C55E]" />
                      Push Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'pushDeadlines', label: 'Deadline alerts', description: 'Browser notifications for urgent deadlines' },
                        { key: 'pushUpdates', label: 'Status changes', description: 'When tasks are completed or updated' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-start gap-3 p-3 bg-tertiary rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="mt-1 w-4 h-4 rounded border-theme text-accent focus:ring-[#4F46E5] bg-[#0B0F1C]"
                          />
                          <div className="flex-1">
                            <p className="text-primary text-sm font-medium">{item.label}</p>
                            <p className="text-secondary text-xs">{item.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-semibold text-primary mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-primary font-medium mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-accent" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-secondary text-sm mb-2 block">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                            className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-secondary text-sm mb-2 block">New Password</label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                        />
                      </div>
                      <div>
                        <label className="text-secondary text-sm mb-2 block">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-theme">
                    <h3 className="text-primary font-medium mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-tertiary rounded-xl">
                      <div>
                        <p className="text-primary font-medium">
                          {twoFAEnabled ? '2FA is enabled' : '2FA is disabled'}
                        </p>
                        <p className="text-secondary text-sm">
                          {twoFAEnabled ? 'Your account is protected' : 'Add an extra layer of security'}
                        </p>
                      </div>
                      {twoFAEnabled ? (
                        <button 
                          onClick={handle2FADisable}
                          className="px-4 py-2 bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25 rounded-xl transition-colors"
                        >
                          Disable
                        </button>
                      ) : (
                        <button 
                          onClick={() => setShow2FAModal(true)}
                          className="btn-primary"
                        >
                          Enable
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-theme">
                    <h3 className="text-primary font-medium mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-tertiary rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#22C55E] rounded-full" />
                          <div>
                            <p className="text-primary text-sm">Chrome on macOS</p>
                            <p className="text-secondary text-xs">Warsaw, Poland • Current session</p>
                          </div>
                        </div>
                        <span className="text-[#22C55E] text-xs">Active now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-lg font-semibold text-primary mb-6">Application Preferences</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-secondary text-sm mb-2 block">Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                      >
                        <option value="en">English</option>
                        <option value="pl">Polski</option>
                        <option value="de">Deutsch</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-secondary text-sm mb-2 block">Currency</label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                        className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="PLN">PLN (zł)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-secondary text-sm mb-2 block">Date Format</label>
                      <select
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                        className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-secondary text-sm mb-2 block">Theme</label>
                      <div className="flex items-center gap-2 p-1 bg-tertiary rounded-xl">
                        <button
                          onClick={() => setTheme('light')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            theme === 'light' ? 'bg-accent text-white' : 'text-secondary hover:text-primary'
                          }`}
                        >
                          <Sun className="w-4 h-4" />
                          Light
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            theme === 'dark' ? 'bg-accent text-white' : 'text-secondary hover:text-primary'
                          }`}
                        >
                          <Moon className="w-4 h-4" />
                          Dark
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            theme === 'system' ? 'bg-accent text-white' : 'text-secondary hover:text-primary'
                          }`}
                        >
                          <Monitor className="w-4 h-4" />
                          Auto
                        </button>
                      </div>
                      <p className="text-xs text-secondary mt-2">
                        Currently using {resolvedTheme} mode
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-theme">
                    <label className="flex items-center justify-between p-4 bg-tertiary rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
                      <div>
                        <p className="text-primary font-medium">Compact Mode</p>
                        <p className="text-secondary text-sm">Reduce spacing for more content</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full transition-colors ${preferences.compactMode ? 'bg-accent' : 'bg-[#273155]'} relative`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.compactMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div>
                <h2 className="text-lg font-semibold text-primary mb-6">Data & Privacy</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-primary font-medium mb-4 flex items-center gap-2">
                      <Download className="w-4 h-4 text-accent" />
                      Export Your Data
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                      Download a copy of all your grants, documents, and application data.
                    </p>
                    <button 
                      onClick={handleExport}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Data (JSON)
                    </button>
                  </div>

                  <div className="pt-6 border-t border-theme">
                    <h3 className="text-primary font-medium mb-4 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#22C55E]" />
                      Import Data
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                      Import grants and data from a previous export.
                    </p>
                    <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Import Data
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="pt-6 border-t border-theme">
                    <h3 className="text-[#EF4444] font-medium mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Danger Zone
                    </h3>
                    <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
                      <p className="text-primary font-medium mb-1">Delete Account</p>
                      <p className="text-secondary text-sm mb-4">
                        This will permanently delete your account and all associated data.
                      </p>
                      <button 
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-theme flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2 disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full loading-spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary border border-theme rounded-2xl p-6 w-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Enable 2FA</h2>
              <button 
                onClick={() => setShow2FAModal(false)}
                className="text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-tertiary rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <div className="text-secondary text-xs text-center p-2">
                    [QR Code]<br/>Scan with authenticator app
                  </div>
                </div>
                <p className="text-secondary text-sm">Scan this QR code with your authenticator app</p>
              </div>
              <div>
                <label className="text-secondary text-sm mb-2 block">Verification Code</label>
                <input
                  type="text"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50 text-center text-2xl tracking-widest"
                />
                <p className="text-secondary text-xs mt-2 text-center">Demo: enter "123456" to enable</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handle2FASetup}
                  className="flex-1 btn-primary"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
