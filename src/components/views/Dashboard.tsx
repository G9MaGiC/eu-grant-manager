import { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  FileCheck, 
  Clock, 
  Plus, 
  FileText, 
  Upload, 
  BarChart3,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  Target,
  Euro,
  Calendar,
  CheckCircle2,
  MoreHorizontal,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useGrants } from '@/hooks/useGrants';
import type { ViewType } from '@/types';
import { toast } from 'sonner';

interface DashboardProps {
  onViewChange?: (view: ViewType, grantId?: string) => void;
}

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1.2 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => setDisplayValue(Math.round(obj.val)),
    });
  }, [value, duration]);

  const formatValue = (val: number) => {
    if (value >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (val / 1000).toFixed(0) + 'K';
    }
    return val.toString();
  };

  return (
    <span ref={ref} className="mono text-3xl font-semibold text-primary">
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
}

function MiniChart({ data, color = 'accent' }: { data: number[]; color?: 'accent' | 'success' | 'warning' | 'danger' }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const colorClasses = {
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };
  
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((val, i) => {
        const height = ((val - min) / range) * 100;
        return (
          <div
            key={i}
            className={`w-2 rounded-t transition-all duration-300 ${colorClasses[color]}`}
            style={{ 
              height: `${Math.max(height, 10)}%`,
              opacity: 0.6 + (i / data.length) * 0.4
            }}
          />
        );
      })}
    </div>
  );
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const deadlinesRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { grants, loading, refetch } = useGrants();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll('.stat-card');
        gsap.fromTo(cards,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
        );
      }
      if (deadlinesRef.current) {
        const items = deadlinesRef.current.querySelectorAll('.deadline-item');
        gsap.fromTo(items,
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.3 }
        );
      }
      if (actionsRef.current) {
        const buttons = actionsRef.current.querySelectorAll('.action-btn');
        gsap.fromTo(buttons,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.4 }
        );
      }
      if (recentRef.current) {
        const items = recentRef.current.querySelectorAll('.recent-item');
        gsap.fromTo(items,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.5 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 500)),
      {
        loading: 'Refreshing dashboard data...',
        success: 'Dashboard updated successfully',
        error: 'Failed to refresh',
      }
    );
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleGrantClick = (grantId: string) => {
    if (onViewChange) {
      onViewChange('grant-detail', grantId);
    } else {
      navigate(`/grants/${grantId}`);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'find':
        if (onViewChange) {
          onViewChange('recommendations');
        } else {
          navigate('/recommendations');
        }
        break;
      case 'draft':
        if (onViewChange) {
          onViewChange('builder');
        } else {
          navigate('/builder');
        }
        break;
      case 'upload':
        toast.success('Document upload ready', {
          description: 'Select a grant to upload documents to',
        });
        if (onViewChange) {
          onViewChange('pipeline');
        } else {
          navigate('/pipeline');
        }
        break;
      case 'report':
        if (onViewChange) {
          onViewChange('reports');
        } else {
          navigate('/reports');
        }
        break;
    }
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 3) return 'border-l-[#EF4444] bg-[#EF4444]/5';
    if (daysLeft <= 7) return 'border-l-[#F59E0B] bg-[#F59E0B]/5';
    return 'border-l-[#4F46E5]';
  };

  const getUrgencyText = (daysLeft: number) => {
    if (daysLeft <= 3) return 'text-red-500';
    if (daysLeft <= 7) return 'text-amber-500';
    return 'text-secondary';
  };

  // Calculate stats from grants data
  const stats = useMemo(() => {
    const activeGrants = grants.filter(g => g.status !== 'awarded' && g.status !== 'rejected').length;
    const fundingPipeline = grants
      .filter(g => g.status !== 'rejected')
      .reduce((sum, g) => sum + (g.estimatedValue || 0), 0);
    const submissionsThisMonth = grants.filter(g => {
      const grantDate = new Date(g.deadline);
      const now = new Date();
      return grantDate.getMonth() === now.getMonth() && grantDate.getFullYear() === now.getFullYear();
    }).length;
    return { activeGrants, fundingPipeline, submissionsThisMonth };
  }, [grants]);

  // Calculate upcoming deadlines from grants data
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return grants
      .filter(g => g.status !== 'awarded' && g.status !== 'rejected')
      .map(g => {
        const deadline = new Date(g.deadline);
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          grantId: g.id,
          grantName: g.name,
          deadline: g.deadline,
          daysLeft,
        };
      })
      .filter(d => d.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [grants]);

  // Mock chart data
  const pipelineData = [2.1, 2.5, 2.8, 3.2, 3.8, 4.2];
  const submissionsData = [1, 2, 1, 3, 2, 3];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex items-center gap-3 text-secondary">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
          <p className="text-secondary mt-1">Here's what needs attention this week.</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'loading-spinner' : ''}`} />
        </button>
      </div>

      {/* Stats Row */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="stat-card card-dark p-5 hover:border-accent/35 focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-secondary text-sm mb-1">Active grants</p>
              <AnimatedNumber value={stats.activeGrants} />
              <div className="flex items-center gap-1 mt-2 text-green-500 text-xs">
                <ArrowUpRight className="w-3 h-3" />
                <span>+2 this month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center group-hover:bg-accent/25 transition-colors">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
          </div>
          <MiniChart data={[8, 9, 10, 11, 11, 12]} color="accent" />
        </div>

        <div className="stat-card card-dark p-5 hover:border-accent/35 focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-secondary text-sm mb-1">Funding pipeline</p>
              <AnimatedNumber value={stats.fundingPipeline} prefix="€" />
              <div className="flex items-center gap-1 mt-2 text-green-500 text-xs">
                <ArrowUpRight className="w-3 h-3" />
                <span>+€850K from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-success/15 rounded-xl flex items-center justify-center group-hover:bg-success/25 transition-colors">
              <Euro className="w-6 h-6 text-success" />
            </div>
          </div>
          <MiniChart data={pipelineData} color="success" />
        </div>

        <div className="stat-card card-dark p-5 hover:border-accent/35 focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-secondary text-sm mb-1">Submissions this month</p>
              <AnimatedNumber value={stats.submissionsThisMonth} />
              <div className="flex items-center gap-1 mt-2 text-secondary text-xs">
                <Target className="w-3 h-3" />
                <span>Target: 5</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-warning/15 rounded-xl flex items-center justify-center group-hover:bg-warning/25 transition-colors">
              <FileCheck className="w-6 h-6 text-warning" />
            </div>
          </div>
          <MiniChart data={submissionsData} color="warning" />
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Upcoming Deadlines */}
        <div ref={deadlinesRef} className="lg:col-span-3 card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-primary">Upcoming deadlines</h2>
              <span className="px-2 py-0.5 bg-danger/15 text-danger text-xs rounded-full">
                {upcomingDeadlines.filter(d => d.daysLeft <= 7).length} urgent
              </span>
            </div>
            <button 
              onClick={() => onViewChange ? onViewChange('pipeline') : navigate('/pipeline')}
              className="text-accent text-sm hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => {
              const grant = grants.find(g => g.id === deadline.grantId);
              return (
                <div 
                  key={deadline.grantId}
                  onClick={() => handleGrantClick(deadline.grantId)}
                  className={`deadline-item flex items-center justify-between p-4 rounded-xl border-l-4 cursor-pointer hover:brightness-110 transition-all ${getUrgencyColor(deadline.daysLeft)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      deadline.daysLeft <= 3 ? 'bg-[#EF4444]/15' : 
                      deadline.daysLeft <= 7 ? 'bg-[#F59E0B]/15' : 'bg-accent/15'
                    }`}>
                      <Clock className={`w-5 h-5 ${
                        deadline.daysLeft <= 3 ? 'text-red-500' : 
                        deadline.daysLeft <= 7 ? 'text-amber-500' : 'text-accent'
                      }`} />
                    </div>
                    <div>
                      <p className="text-primary font-medium">{deadline.grantName}</p>
                      <p className="text-secondary text-sm">{grant?.program} Program • €{(grant?.estimatedValue || 0) / 1000000}M</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-medium mono">{deadline.deadline}</p>
                    <p className={`text-sm ${getUrgencyText(deadline.daysLeft)}`}>
                      {deadline.daysLeft === 0 ? 'Due today!' : 
                       deadline.daysLeft === 1 ? '1 day left' : 
                       `${deadline.daysLeft} days left`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div ref={actionsRef} className="lg:col-span-2 card-dark p-5">
          <h2 className="text-lg font-semibold text-primary mb-4">Quick actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => handleQuickAction('find')}
              className="action-btn w-full flex items-center gap-3 p-4 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors group"
            >
              <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center group-hover:bg-accent/25 transition-colors">
                <Plus className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left flex-1">
                <p className="text-primary font-medium">Find new grants</p>
                <p className="text-secondary text-sm">Discover opportunities</p>
              </div>
              <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => handleQuickAction('draft')}
              className="action-btn w-full flex items-center gap-3 p-4 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors group"
            >
              <div className="w-10 h-10 bg-[#22C55E]/15 rounded-lg flex items-center justify-center group-hover:bg-[#22C55E]/25 transition-colors">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-left flex-1">
                <p className="text-primary font-medium">Draft application</p>
                <p className="text-secondary text-sm">Continue writing</p>
              </div>
              <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => handleQuickAction('upload')}
              className="action-btn w-full flex items-center gap-3 p-4 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors group"
            >
              <div className="w-10 h-10 bg-[#F59E0B]/15 rounded-lg flex items-center justify-center group-hover:bg-[#F59E0B]/25 transition-colors">
                <Upload className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-left flex-1">
                <p className="text-primary font-medium">Upload document</p>
                <p className="text-secondary text-sm">Add to grant folder</p>
              </div>
              <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => handleQuickAction('report')}
              className="action-btn w-full flex items-center gap-3 p-4 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors group"
            >
              <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center group-hover:bg-accent/25 transition-colors">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left flex-1">
                <p className="text-primary font-medium">Generate report</p>
                <p className="text-secondary text-sm">Export submission data</p>
              </div>
              <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div ref={recentRef} className="card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Recent activity</h2>
            <button className="text-secondary hover:text-primary text-sm">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {[
              { action: 'Document uploaded', item: 'Budget_Template.xlsx', grant: 'KPO Energy Retrofit', time: '2 hours ago', icon: Upload, color: 'text-warning' },
              { action: 'Application submitted', item: 'CEF Transport Corridor', grant: 'Submitted to portal', time: 'Yesterday', icon: CheckCircle2, color: 'text-success' },
              { action: 'Task completed', item: 'Draft project narrative', grant: 'FEnIKS Digital Services', time: '2 days ago', icon: FileCheck, color: 'text-accent' },
              { action: 'Grant added', item: 'Smart City Data Platform', grant: 'KPO Program', time: '3 days ago', icon: Plus, color: 'text-accent' },
            ].map((activity, i) => (
              <div key={i} className="recent-item flex items-center gap-4 p-3 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors cursor-pointer">
                <div className={`w-9 h-9 bg-tertiary rounded-lg flex items-center justify-center`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-primary text-sm font-medium">{activity.action}</p>
                  <p className="text-secondary text-xs truncate">{activity.item} • {activity.grant}</p>
                </div>
                <span className="text-secondary text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Performance</h2>
            <button className="p-1.5 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-secondary text-sm">Success rate</span>
                <span className="text-green-500 font-medium">67%</span>
              </div>
              <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                <div className="h-full w-[67%] bg-[#22C55E] rounded-full" />
              </div>
              <p className="text-secondary text-xs mt-1">4 won out of 6 submitted</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-secondary text-sm">Application completion</span>
                <span className="text-accent font-medium">83%</span>
              </div>
              <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                <div className="h-full w-[83%] bg-accent rounded-full" />
              </div>
              <p className="text-secondary text-xs mt-1">5 of 6 sections complete</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-secondary text-sm">Document readiness</span>
                <span className="text-amber-500 font-medium">72%</span>
              </div>
              <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                <div className="h-full w-[72%] bg-[#F59E0B] rounded-full" />
              </div>
              <p className="text-secondary text-xs mt-1">18 of 25 documents ready</p>
            </div>

            <div className="pt-3 border-t border-theme">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span className="text-secondary text-sm">Next milestone</span>
                </div>
                <span className="text-primary text-sm font-medium">Mar 18</span>
              </div>
              <p className="text-secondary text-xs mt-1 ml-6">KPO Energy Retrofit submission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="flex items-center gap-3 p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-primary text-sm">
            <span className="font-medium">Action required:</span> KPO Energy Retrofit deadline is in 3 days. Finalize budget table and prepare for submission.
          </p>
        </div>
        <button 
          onClick={() => handleGrantClick('1')}
          className="px-4 py-2 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-amber-500 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          View grant →
        </button>
      </div>
    </div>
  );
}
