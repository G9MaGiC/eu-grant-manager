import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { 
  Scale, 
  Check, 
  X, 
  Plus, 
  Trash2,
  TrendingUp,
  Clock,
  Euro,
  Target,
  Download
} from 'lucide-react';
import { useGrants } from '@/hooks/useGrants';
import type { ViewType } from '@/types';
import { toast } from 'sonner';

interface ComparisonGrant {
  id: string;
  name: string;
  program: string;
  deadline: string;
  estimatedValue: number;
  fitScore: number;
  status: string;
  pros: string[];
  cons: string[];
}



interface GrantComparisonProps {
  onViewChange?: (view: ViewType, grantId?: string) => void;
}

export function GrantComparison({ onViewChange }: GrantComparisonProps) {
  const { grants, loading } = useGrants();
  const [selectedGrants, setSelectedGrants] = useState<ComparisonGrant[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (grants.length > 0 && selectedGrants.length === 0) {
      const comparisonData: ComparisonGrant[] = grants.slice(0, 3).map(g => ({
        ...g,
        pros: [
          'High fit score with municipality priorities',
          'Strong track record in similar programs',
          'Adequate timeline for preparation',
        ],
        cons: [
          'Complex application requirements',
          'High competition expected',
        ],
      }));
      setSelectedGrants(comparisonData);
    }
  }, [grants]);

  useEffect(() => {
    gsap.fromTo('.comparison-card',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
    );
  }, [selectedGrants]);

  const removeGrant = (id: string) => {
    setSelectedGrants(prev => prev.filter(g => g.id !== id));
    toast.success('Grant removed from comparison');
  };

  const addGrant = (grant: typeof grants[0]) => {
    if (selectedGrants.find(g => g.id === grant.id)) {
      toast.error('Grant already in comparison');
      return;
    }
    if (selectedGrants.length >= 4) {
      toast.error('Maximum 4 grants can be compared');
      return;
    }
    setSelectedGrants(prev => [...prev, {
      ...grant,
      pros: ['Relevant to current priorities'],
      cons: ['Requires further analysis'],
    }] as ComparisonGrant[]);
    setShowAddModal(false);
    toast.success('Grant added to comparison');
  };

  const getDaysLeft = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-accent';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-success/15';
    if (score >= 80) return 'bg-accent/15';
    if (score >= 70) return 'bg-warning/15';
    return 'bg-danger/15';
  };

  if (loading) {
    return (
      <div className="p-7 flex items-center justify-center h-64">
        <div className="text-secondary">Loading grants...</div>
      </div>
    );
  }

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-primary">Grant Comparison</h1>
              <p className="text-secondary">Compare grants side-by-side to make informed decisions</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.info('Comparison exported')}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={selectedGrants.length >= 4}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Grant
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      {selectedGrants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 w-48">
                  <span className="text-secondary text-sm font-medium">Criteria</span>
                </th>
                {selectedGrants.map((grant) => (
                  <th key={grant.id} className="p-4 min-w-[280px]">
                    <div className="comparison-card card-dark p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-2 py-1 bg-accent/15 text-accent text-xs rounded-lg">
                          {grant.program}
                        </span>
                        <button 
                          onClick={() => removeGrant(grant.id)}
                          className="text-secondary hover:text-danger transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-primary font-semibold mb-2 line-clamp-2">{grant.name}</h3>
                      <button 
                        onClick={() => onViewChange?.('grant-detail', grant.id)}
                        className="text-accent text-sm hover:underline"
                      >
                        View details →
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Fit Score */}
              <tr className="border-b border-theme">
                <td className="p-4">
                  <div className="flex items-center gap-2 text-secondary">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Fit Score</span>
                  </div>
                </td>
                {selectedGrants.map(grant => (
                  <td key={grant.id} className="p-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${getScoreBg(grant.fitScore)}`}>
                      <span className={`text-2xl font-bold ${getScoreColor(grant.fitScore)}`}>
                        {grant.fitScore}%
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Funding Amount */}
              <tr className="border-b border-theme">
                <td className="p-4">
                  <div className="flex items-center gap-2 text-secondary">
                    <Euro className="w-4 h-4" />
                    <span className="text-sm">Funding Amount</span>
                  </div>
                </td>
                {selectedGrants.map(grant => (
                  <td key={grant.id} className="p-4">
                    <span className="text-primary text-lg font-semibold">
                      {new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(grant.estimatedValue)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Deadline */}
              <tr className="border-b border-theme">
                <td className="p-4">
                  <div className="flex items-center gap-2 text-secondary">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Days to Deadline</span>
                  </div>
                </td>
                {selectedGrants.map(grant => {
                  const days = getDaysLeft(grant.deadline);
                  return (
                    <td key={grant.id} className="p-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        days <= 7 ? 'bg-danger/15 text-danger' :
                        days <= 14 ? 'bg-warning/15 text-warning' :
                        'bg-success/15 text-success'
                      }`}>
                        <span className="font-medium">{days} days</span>
                      </div>
                      <p className="text-secondary text-xs mt-1">{grant.deadline}</p>
                    </td>
                  );
                })}
              </tr>

              {/* Status */}
              <tr className="border-b border-theme">
                <td className="p-4">
                  <div className="flex items-center gap-2 text-secondary">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Current Status</span>
                  </div>
                </td>
                {selectedGrants.map(grant => (
                  <td key={grant.id} className="p-4">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      grant.status === 'won' ? 'bg-success/15 text-success' :
                      grant.status === 'submitted' ? 'bg-warning/15 text-warning' :
                      grant.status === 'in-progress' ? 'bg-accent/15 text-accent' :
                      'bg-tertiary text-secondary'
                    }`}>
                      {grant.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Pros */}
              <tr className="border-b border-theme">
                <td className="p-4 align-top">
                  <div className="flex items-center gap-2 text-success">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Pros</span>
                  </div>
                </td>
                {selectedGrants.map(grant => (
                  <td key={grant.id} className="p-4 align-top">
                    <ul className="space-y-2">
                      {grant.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-primary text-sm">
                          <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Cons */}
              <tr className="border-b border-theme">
                <td className="p-4 align-top">
                  <div className="flex items-center gap-2 text-danger">
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Cons</span>
                  </div>
                </td>
                {selectedGrants.map(grant => (
                  <td key={grant.id} className="p-4 align-top">
                    <ul className="space-y-2">
                      {grant.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-primary text-sm">
                          <X className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Action */}
              <tr>
                <td className="p-4"></td>
                {selectedGrants.map(grant => (
                  <td key={grant.id} className="p-4">
                    <button 
                      onClick={() => onViewChange?.('builder')}
                      className="w-full btn-primary"
                    >
                      Start Application
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-tertiary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-10 h-10 text-secondary" />
          </div>
          <h3 className="text-primary font-semibold mb-2">No grants to compare</h3>
          <p className="text-secondary text-sm mb-4">Add grants to start comparing</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add Grant
          </button>
        </div>
      )}

      {/* Add Grant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary border border-theme rounded-2xl p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Add Grant to Comparison</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {grants.filter(g => !selectedGrants.find(sg => sg.id === g.id)).map(grant => (
                <button
                  key={grant.id}
                  onClick={() => addGrant(grant)}
                  className="w-full flex items-center gap-4 p-4 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center">
                    <span className="text-accent text-sm font-medium">{grant.program}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-primary font-medium truncate">{grant.name}</p>
                    <p className="text-secondary text-sm">{grant.deadline} • €{(grant.estimatedValue / 1000000).toFixed(1)}M</p>
                  </div>
                  <Plus className="w-5 h-5 text-accent" />
                </button>
              ))}
              {grants.filter(g => !selectedGrants.find(sg => sg.id === g.id)).length === 0 && (
                <p className="text-secondary text-center py-4">All grants are already in comparison</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
