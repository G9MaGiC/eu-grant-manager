import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  Plus, // @ts-ignore - used in JSX below
  ChevronDown, 
  Eye,
  Search,
  ArrowUpDown,
  Trash2,
  Copy,
  Archive,
  Download,
  CheckSquare,
  Square,
  X,
  Calendar,
  Euro,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useGrants } from '@/hooks/useGrants';
import type { ViewType, GrantProgram, GrantStatus } from '@/types';
import { toast } from 'sonner';

interface PipelineProps {
  onViewChange?: (view: ViewType, grantId?: string) => void;
}

const programFilters: (GrantProgram | 'All')[] = [
  'All', 
  'KPO', 
  'FEnIKS', 
  'CEF', 
  'Horizon', 
  'ERDF',
  'Creative',
  'Erasmus',
  'LIFE',
  'Digital',
  'JTF',
  'ESF+',
  'InvestEU',
  'Interreg',
  'EMFAF',
  'EAFRD',
  'GreenDeal',
  'EU4Health',
];

const statusConfig: Record<GrantStatus, { label: string; className: string }> = {
  'not-started': { label: 'Not started', className: 'status-not-started' },
  'in-progress': { label: 'In progress', className: 'status-in-progress' },
  'submitted': { label: 'Submitted', className: 'status-submitted' },
  'won': { label: 'Won', className: 'status-won' },
  'archived': { label: 'Archived', className: 'bg-[#6B7280]/15 text-[#6B7280]' },
};

const programColors: Record<GrantProgram, string> = {
  'KPO': 'bg-accent/15 text-accent',
  'FEnIKS': 'bg-[#22C55E]/15 text-[#22C55E]',
  'CEF': 'bg-[#F59E0B]/15 text-[#F59E0B]',
  'Horizon': 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  'ERDF': 'bg-[#EC4899]/15 text-[#EC4899]',
  'Creative': 'bg-[#F472B6]/15 text-[#F472B6]',
  'Erasmus': 'bg-[#3B82F6]/15 text-[#3B82F6]',
  'LIFE': 'bg-[#10B981]/15 text-[#10B981]',
  'Digital': 'bg-[#06B6D4]/15 text-[#06B6D4]',
  'JTF': 'bg-[#F97316]/15 text-[#F97316]',
  'ESF+': 'bg-[#84CC16]/15 text-[#84CC16]',
  'InvestEU': 'bg-[#6366F1]/15 text-[#6366F1]',
  'Interreg': 'bg-[#14B8A6]/15 text-[#14B8A6]',
  'EMFAF': 'bg-[#0EA5E9]/15 text-[#0EA5E9]',
  'EAFRD': 'bg-[#65A30D]/15 text-[#65A30D]',
  'GreenDeal': 'bg-[#22C55E]/15 text-[#22C55E]',
  'EU4Health': 'bg-[#EF4444]/15 text-[#EF4444]',
};

export function Pipeline({ onViewChange }: PipelineProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const { grants, loading, deleteGrant, createGrant, updateGrant } = useGrants();
  const [activeFilter, setActiveFilter] = useState<GrantProgram | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<GrantStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrants, setSelectedGrants] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'deadline' | 'value' | 'fit'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGrantName, setNewGrantName] = useState('');
  const [newGrantProgram, setNewGrantProgram] = useState<GrantProgram>('KPO');
  const [newGrantDeadline, setNewGrantDeadline] = useState('');
  const [newGrantValue, setNewGrantValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll('.grant-row');
        gsap.fromTo(rows,
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out', delay: 0.2 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [activeFilter, statusFilter, searchQuery, sortBy, sortOrder, grants]);

  const filteredGrants = grants.filter(grant => {
    const matchesProgram = activeFilter === 'All' || grant.program === activeFilter;
    const matchesStatus = statusFilter === 'All' || grant.status === statusFilter;
    const matchesSearch = grant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         grant.program.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesStatus && matchesSearch;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'deadline':
        comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        break;
      case 'value':
        comparison = a.estimatedValue - b.estimatedValue;
        break;
      case 'fit':
        comparison = a.fitScore - b.fitScore;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSelection = (grantId: string) => {
    const newSelection = new Set(selectedGrants);
    if (newSelection.has(grantId)) {
      newSelection.delete(grantId);
    } else {
      newSelection.add(grantId);
    }
    setSelectedGrants(newSelection);
  };

  const selectAll = () => {
    if (selectedGrants.size === filteredGrants.length) {
      setSelectedGrants(new Set());
    } else {
      setSelectedGrants(new Set(filteredGrants.map(g => g.id)));
    }
  };

  const handleGrantClick = (grantId: string) => {
    navigate(`/grants/${grantId}`);
    onViewChange?.('grant-detail', grantId);
  };

  const handleDuplicate = async (e: React.MouseEvent, grantId: string) => {
    e.stopPropagation();
    const grant = grants.find(g => g.id === grantId);
    if (grant) {
      try {
        await createGrant({
          name: `${grant.name} (Copy)`,
          program: grant.program,
          deadline: grant.deadline,
          status: 'not-started',
          estimatedValue: grant.estimatedValue,
          fitScore: grant.fitScore,
          owner: grant.owner,
          description: grant.description,
        });
        toast.success('Grant duplicated successfully');
      } catch (err) {
        // Error handled in hook
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, grantId: string) => {
    e.stopPropagation();
    try {
      await deleteGrant(grantId);
      toast.success('Grant deleted');
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedGrants.size === 0) {
      toast.error('No grants selected');
      return;
    }
    
    if (action === 'export') {
      const selectedData = grants.filter(g => selectedGrants.has(g.id));
      const exportData = JSON.stringify(selectedData, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grants-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${selectedGrants.size} grants`);
    } else if (action === 'archive') {
      // Archive each selected grant
      for (const grantId of selectedGrants) {
        const grant = grants.find(g => g.id === grantId);
        if (grant) {
          await updateGrant(grantId, { ...grant, status: 'archived' });
        }
      }
      toast.success(`Archived ${selectedGrants.size} grants`);
      setSelectedGrants(new Set());
    }
  };

  // Use Plus icon to avoid unused import warning
  void Plus;
  
  const handleAddGrant = () => {
    setShowAddModal(true);
    // Reset form
    setNewGrantName('');
    setNewGrantProgram('KPO');
    setNewGrantDeadline('');
    setNewGrantValue('');
  };
  
  // Reference handleAddGrant to avoid unused warning
  void handleAddGrant;

  const handleSubmitNewGrant = async () => {
    if (!newGrantName.trim() || !newGrantDeadline || !newGrantValue) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const value = parseFloat(newGrantValue);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid value');
      return;
    }

    setIsCreating(true);
    try {
      await createGrant({
        name: newGrantName.trim(),
        program: newGrantProgram,
        deadline: newGrantDeadline,
        status: 'not-started',
        estimatedValue: value,
        fitScore: Math.floor(Math.random() * 20) + 70,
        owner: { name: 'A. Kowalski' },
        description: 'New grant opportunity.',
      });
      toast.success('Grant added successfully');
      setShowAddModal(false);
      setNewGrantName('');
      setNewGrantDeadline('');
      setNewGrantValue('');
    } catch (err) {
      // Error handled in hook
    } finally {
      setIsCreating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const totalValue = filteredGrants.reduce((sum, g) => sum + g.estimatedValue, 0);
  const avgFitScore = filteredGrants.length > 0 
    ? Math.round(filteredGrants.reduce((sum, g) => sum + g.fitScore, 0) / filteredGrants.length) 
    : 0;

  if (loading) {
    return (
      <div ref={containerRef} className="p-7 space-y-5">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-7 space-y-5">
      {/* Header -->
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Pipeline</h1>
          <p className="text-secondary mt-1">Manage all your grant opportunities in one place.</p>
        </div>
        <button 
          onClick={handleAddGrant}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add grant
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card-dark p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-secondary text-xs">Total grants</p>
              <p className="text-primary text-xl font-semibold">{filteredGrants.length}</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22C55E]/15 rounded-lg flex items-center justify-center">
              <Euro className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-secondary text-xs">Total value</p>
              <p className="text-primary text-xl font-semibold">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F59E0B]/15 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-secondary text-xs">This month</p>
              <p className="text-primary text-xl font-semibold">
                {filteredGrants.filter(g => {
                  const d = new Date(g.deadline + 'T00:00:00');
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card-dark p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B5CF6]/15 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-secondary text-xs">Avg fit score</p>
              <p className="text-primary text-xl font-semibold">{avgFitScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {programFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-250 ${
                activeFilter === filter
                  ? 'bg-accent text-white'
                  : 'bg-tertiary text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              placeholder="Search grants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-tertiary border border-theme rounded-xl pl-9 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as GrantStatus | 'All')}
            className="bg-tertiary border border-theme rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="All">All statuses</option>
            <option value="not-started">Not started</option>
            <option value="in-progress">In progress</option>
            <option value="submitted">Submitted</option>
            <option value="won">Won</option>
          </select>
          
          <button 
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortBy === 'deadline' ? 'Deadline' : sortBy === 'value' ? 'Value' : 'Fit'}
            <ChevronDown className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedGrants.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-accent/10 border border-[#4F46E5]/30 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-accent" />
            <span className="text-primary font-medium">{selectedGrants.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleBulkAction('export')}
              className="px-3 py-1.5 text-sm text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => handleBulkAction('archive')}
              className="px-3 py-1.5 text-sm text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
            <button 
              onClick={() => setSelectedGrants(new Set())}
              className="px-3 py-1.5 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div ref={tableRef} className="card-dark overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-tertiary border-b border-theme">
              <th className="px-4 py-4 w-10">
                <button 
                  onClick={selectAll}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  {selectedGrants.size === filteredGrants.length && filteredGrants.length > 0 ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="text-left text-secondary text-xs font-medium uppercase tracking-wider px-4 py-4">Program</th>
              <th className="text-left text-secondary text-xs font-medium uppercase tracking-wider px-4 py-4 cursor-pointer hover:text-primary" onClick={() => setSortBy('deadline')}>
                Deadline {sortBy === 'deadline' && '•'}
              </th>
              <th className="text-left text-secondary text-xs font-medium uppercase tracking-wider px-4 py-4">Status</th>
              <th className="text-left text-secondary text-xs font-medium uppercase tracking-wider px-4 py-4 cursor-pointer hover:text-primary" onClick={() => setSortBy('value')}>
                Value {sortBy === 'value' && '•'}
              </th>
              <th className="text-left text-secondary text-xs font-medium uppercase tracking-wider px-4 py-4 cursor-pointer hover:text-primary" onClick={() => setSortBy('fit')}>
                Fit {sortBy === 'fit' && '•'}
              </th>
              <th className="text-left text-secondary text-xs font-medium uppercase tracking-wider px-4 py-4">Owner</th>
              <th className="text-right text-secondary text-xs font-medium uppercase tracking-wider px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrants.map((grant, index) => (
              <tr 
                key={grant.id} 
                className={`grant-row border-b border-theme/50 table-row-hover ${index % 2 === 1 ? 'bg-tertiary/30' : ''} ${selectedGrants.has(grant.id) ? 'bg-accent/10' : ''}`}
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => toggleSelection(grant.id)}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    {selectedGrants.has(grant.id) ? (
                      <CheckSquare className="w-5 h-5 text-accent" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => handleGrantClick(grant.id)}>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${programColors[grant.program]}`}>
                      {grant.program}
                    </span>
                    <span className="text-primary font-medium">{grant.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => handleGrantClick(grant.id)}>
                  <span className="text-primary mono">{grant.deadline}</span>
                </td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => handleGrantClick(grant.id)}>
                  <span className={`status-badge ${statusConfig[grant.status].className}`}>
                    {statusConfig[grant.status].label}
                  </span>
                </td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => handleGrantClick(grant.id)}>
                  <span className="text-primary mono">{formatCurrency(grant.estimatedValue)}</span>
                </td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => handleGrantClick(grant.id)}>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2.5 bg-tertiary rounded-full overflow-hidden border border-theme">
                      <div 
                        className="h-full bg-accent rounded-full transition-all duration-600"
                        style={{ width: `${grant.fitScore}%` }}
                      />
                    </div>
                    <span className="text-secondary text-sm mono">{grant.fitScore}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => handleGrantClick(grant.id)}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30">
                      <span className="text-accent text-xs font-medium">{grant.owner.name.charAt(0)}</span>
                    </div>
                    <span className="text-secondary text-sm">{grant.owner.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => handleGrantClick(grant.id)}
                      className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDuplicate(e, grant.id)}
                      className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, grant.id)}
                      className="p-2 text-secondary hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredGrants.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-tertiary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-secondary" />
            </div>
            <p className="text-primary font-medium mb-1">No grants found</p>
            <p className="text-secondary text-sm">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-secondary">
          Showing <span className="text-primary font-medium">{filteredGrants.length}</span> of <span className="text-primary font-medium">{grants.length}</span> grants
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            <span className="text-secondary">In progress: {grants.filter(g => g.status === 'in-progress').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
            <span className="text-secondary">Won: {grants.filter(g => g.status === 'won').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
            <span className="text-secondary">Submitted: {grants.filter(g => g.status === 'submitted').length}</span>
          </div>
        </div>
      </div>

      {/* Add Grant Modal (simplified) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary border border-theme rounded-2xl p-6 w-[500px] max-w-[90vw]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Add New Grant</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-secondary text-sm mb-2 block">Grant Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter grant name..."
                  value={newGrantName}
                  onChange={(e) => setNewGrantName(e.target.value)}
                  className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-secondary text-sm mb-2 block">Program *</label>
                  <select 
                    value={newGrantProgram}
                    onChange={(e) => setNewGrantProgram(e.target.value as GrantProgram)}
                    className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary"
                  >
                    <option value="KPO">KPO</option>
                    <option value="FEnIKS">FEnIKS</option>
                    <option value="CEF">CEF</option>
                    <option value="Horizon">Horizon</option>
                    <option value="ERDF">ERDF</option>
                    <option value="Creative">Creative Europe</option>
                    <option value="Erasmus">Erasmus+</option>
                    <option value="LIFE">LIFE Programme</option>
                    <option value="Digital">Digital Europe</option>
                    <option value="JTF">Just Transition Fund</option>
                    <option value="ESF+">ESF+</option>
                    <option value="InvestEU">InvestEU</option>
                    <option value="Interreg">Interreg</option>
                    <option value="EMFAF">EMFAF</option>
                    <option value="EAFRD">EAFRD</option>
                    <option value="GreenDeal">Green Deal</option>
                    <option value="EU4Health">EU4Health</option>
                  </select>
                </div>
                <div>
                  <label className="text-secondary text-sm mb-2 block">Deadline *</label>
                  <input 
                    type="date" 
                    value={newGrantDeadline}
                    onChange={(e) => setNewGrantDeadline(e.target.value)}
                    className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-secondary text-sm mb-2 block">Estimated Value (€) *</label>
                <input 
                  type="number" 
                  placeholder="1000000"
                  value={newGrantValue}
                  onChange={(e) => setNewGrantValue(e.target.value)}
                  className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitNewGrant}
                disabled={!newGrantName.trim() || !newGrantDeadline || !newGrantValue || isCreating}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Add Grant'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
