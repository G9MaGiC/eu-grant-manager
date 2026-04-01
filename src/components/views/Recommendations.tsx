import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Zap,
  CheckCircle2,
  Clock,
  Euro,
  ArrowRight,
  Filter,
  Bookmark,
  ExternalLink,
  Bell,
  X,
  FileText,
  Users,
  Calendar,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import type { ViewType } from '@/types';

interface Recommendation {
  id: string;
  title: string;
  program: string;
  deadline: string;
  value: number;
  matchScore: number;
  categories: string[];
  description: string;
  saved: boolean;
  notified: boolean;
}

const mockRecommendations: Recommendation[] = [
  {
    id: 'r1',
    title: 'Smart Cities and Communities',
    program: 'Horizon Europe',
    deadline: '2026-05-15',
    value: 2500000,
    matchScore: 94,
    categories: ['Digital', 'Innovation', 'Sustainability'],
    description: 'Funding for innovative solutions in urban mobility, energy efficiency, and digital services for citizens.',
    saved: false,
    notified: false,
  },
  {
    id: 'r2',
    title: 'Circular Economy Municipal Projects',
    program: 'LIFE Programme',
    deadline: '2026-04-30',
    value: 1800000,
    matchScore: 89,
    categories: ['Environment', 'Waste Management', 'Sustainability'],
    description: 'Support for municipalities implementing circular economy practices and waste reduction initiatives.',
    saved: false,
    notified: false,
  },
  {
    id: 'r3',
    title: 'Public Transport Modernization',
    program: 'CEF Transport',
    deadline: '2026-06-20',
    value: 3500000,
    matchScore: 87,
    categories: ['Transport', 'Infrastructure', 'Green Deal'],
    description: 'Co-funding for sustainable public transport infrastructure and clean vehicle deployment.',
    saved: true,
    notified: true,
  },
  {
    id: 'r4',
    title: 'Digital Skills for Public Servants',
    program: 'Digital Europe',
    deadline: '2026-05-01',
    value: 950000,
    matchScore: 85,
    categories: ['Digital', 'Education', 'Capacity Building'],
    description: 'Training programs to enhance digital competencies of municipal staff.',
    saved: false,
    notified: false,
  },
  {
    id: 'r5',
    title: 'Climate Adaptation Strategies',
    program: 'EU Mission on Adaptation',
    deadline: '2026-07-10',
    value: 2100000,
    matchScore: 82,
    categories: ['Climate', 'Resilience', 'Planning'],
    description: 'Support for developing and implementing climate adaptation and resilience plans.',
    saved: false,
    notified: false,
  },
];

interface RecommendationsProps {
  onViewChange: (view: ViewType, grantId?: string) => void;
}

export function Recommendations({ onViewChange }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [filter, setFilter] = useState<'all' | 'saved' | 'high-match'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  // Animate cards only on initial mount, not on filter changes
  const hasAnimated = useRef(false);
  useEffect(() => {
    if (!hasAnimated.current && filteredRecommendations.length > 0) {
      hasAnimated.current = true;
      gsap.fromTo('.rec-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, []);  // Empty deps - only animate on mount

  const categories = Array.from(new Set(recommendations.flatMap(r => r.categories)));

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'saved' && !rec.saved) return false;
    if (filter === 'high-match' && rec.matchScore < 90) return false;
    if (selectedCategories.length > 0 && !rec.categories.some(c => selectedCategories.includes(c))) return false;
    return true;
  });

  const toggleSave = (id: string) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        const newSaved = !rec.saved;
        toast.success(newSaved ? 'Grant saved to your list' : 'Grant removed from saved');
        return { ...rec, saved: newSaved };
      }
      return rec;
    }));
  };

  const toggleNotify = (id: string) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        const newNotified = !rec.notified;
        toast.success(newNotified ? 'Reminder set for this grant' : 'Reminder removed');
        return { ...rec, notified: newNotified };
      }
      return rec;
    }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const avgMatchScore = Math.round(
    recommendations.reduce((sum, r) => sum + r.matchScore, 0) / recommendations.length
  );

  const totalPotentialValue = recommendations.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#F3F6FF]">AI Grant Recommendations</h1>
              <p className="text-[#A9B3D0]">Personalized funding opportunities based on your profile</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.info('Preferences updated')}
            className="btn-secondary flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Update Preferences
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#4F46E5]/15 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <div>
              <p className="text-[#A9B3D0] text-sm">Recommendations</p>
              <p className="text-[#F3F6FF] text-2xl font-semibold">{recommendations.length}</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#22C55E]/15 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-[#A9B3D0] text-sm">Avg Match Score</p>
              <p className="text-[#F3F6FF] text-2xl font-semibold">{avgMatchScore}%</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F59E0B]/15 rounded-xl flex items-center justify-center">
              <Euro className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-[#A9B3D0] text-sm">Potential Value</p>
              <p className="text-[#F3F6FF] text-2xl font-semibold">€{(totalPotentialValue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#8B5CF6]/15 rounded-xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-[#A9B3D0] text-sm">Saved</p>
              <p className="text-[#F3F6FF] text-2xl font-semibold">{recommendations.filter(r => r.saved).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Recommendations', count: recommendations.length },
            { id: 'saved', label: 'Saved', count: recommendations.filter(r => r.saved).length },
            { id: 'high-match', label: 'High Match (90%+)', count: recommendations.filter(r => r.matchScore >= 90).length },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-[#161F32] text-[#A9B3D0] hover:text-[#F3F6FF]'
              }`}
            >
              {f.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                filter === f.id ? 'bg-white/20' : 'bg-[#273155]'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-[#4F46E5]/15 text-[#4F46E5]' : ''}`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="card-dark p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#A9B3D0] text-sm mr-2">Categories:</span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-[#4F46E5] text-white'
                    : 'bg-[#161F32] text-[#A9B3D0] hover:text-[#F3F6FF]'
                }`}
              >
                {category}
              </button>
            ))}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="text-[#A9B3D0] hover:text-[#F3F6FF] text-sm ml-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-2 gap-5">
        {filteredRecommendations.map((rec) => (
          <div 
            key={rec.id}
            className="rec-card card-dark p-5 hover:border-[#4F46E5]/30 transition-all duration-200 hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  rec.matchScore >= 90 ? 'bg-[#22C55E]/15' :
                  rec.matchScore >= 80 ? 'bg-[#4F46E5]/15' : 'bg-[#F59E0B]/15'
                }`}>
                  <span className={`text-lg font-bold ${
                    rec.matchScore >= 90 ? 'text-[#22C55E]' :
                    rec.matchScore >= 80 ? 'text-[#4F46E5]' : 'text-[#F59E0B]'
                  }`}>
                    {rec.matchScore}%
                  </span>
                </div>
                <div>
                  <span className="px-2 py-0.5 bg-[#4F46E5]/15 text-[#4F46E5] text-xs rounded-full">
                    {rec.program}
                  </span>
                  <p className="text-[#A9B3D0] text-xs mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Deadline: {rec.deadline}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleSave(rec.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    rec.saved ? 'text-[#4F46E5] bg-[#4F46E5]/15' : 'text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${rec.saved ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => toggleNotify(rec.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    rec.notified ? 'text-[#4F46E5] bg-[#4F46E5]/15' : 'text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32]'
                  }`}
                >
                  <Bell className={`w-4 h-4 ${rec.notified ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-[#F3F6FF] font-semibold mb-2">{rec.title}</h3>
            <p className="text-[#A9B3D0] text-sm mb-4 line-clamp-2">{rec.description}</p>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {rec.categories.map((cat, i) => (
                <span key={i} className="px-2 py-1 bg-[#161F32] text-[#A9B3D0] text-xs rounded-lg">
                  {cat}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#273155]">
              <div className="flex items-center gap-4">
                <span className="text-[#F3F6FF] font-medium">
                  €{(rec.value / 1000000).toFixed(1)}M
                </span>
                <div className="flex items-center gap-1 text-[#22C55E] text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Good fit</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setSelectedRec(rec);
                    setShowDetailsModal(true);
                  }}
                  className="p-2 text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32] rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    toast.success('Added to pipeline');
                    onViewChange('pipeline');
                  }}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  Add to Pipeline
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-[#161F32] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Filter className="w-10 h-10 text-[#A9B3D0]" />
          </div>
          <h3 className="text-[#F3F6FF] font-semibold mb-2">No recommendations match</h3>
          <p className="text-[#A9B3D0] text-sm">Try adjusting your filters or update your preferences</p>
        </div>
      )}

      {/* AI Explanation */}
      <div className="mt-8 card-dark p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[#F3F6FF] font-semibold mb-2">How AI recommendations work</h3>
            <p className="text-[#A9B3D0] text-sm leading-relaxed">
              Our AI analyzes your profile, past applications, and current pipeline to find the most relevant EU funding opportunities. 
              Match scores consider: your municipality's focus areas, successful past applications, deadline compatibility, 
              and funding amount alignment with your typical projects.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#22C55E] rounded-full" />
                <span className="text-[#A9B3D0] text-sm">90%+ Excellent match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#4F46E5] rounded-full" />
                <span className="text-[#A9B3D0] text-sm">80-89% Good match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#F59E0B] rounded-full" />
                <span className="text-[#A9B3D0] text-sm">70-79% Fair match</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRec && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#273155] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#273155]">
              <div>
                <h2 className="text-xl font-semibold text-[#F3F6FF]">{selectedRec.title}</h2>
                <p className="text-[#A9B3D0] text-sm">{selectedRec.program}</p>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-2 text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Match Score */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  selectedRec.matchScore >= 90 ? 'bg-[#22C55E]/15' :
                  selectedRec.matchScore >= 80 ? 'bg-[#4F46E5]/15' : 'bg-[#F59E0B]/15'
                }`}>
                  <span className={`text-2xl font-bold ${
                    selectedRec.matchScore >= 90 ? 'text-[#22C55E]' :
                    selectedRec.matchScore >= 80 ? 'text-[#4F46E5]' : 'text-[#F59E0B]'
                  }`}>{selectedRec.matchScore}%</span>
                </div>
                <div>
                  <p className="text-[#F3F6FF] font-medium">Match Score</p>
                  <p className="text-[#A9B3D0] text-sm">
                    {selectedRec.matchScore >= 90 ? 'Excellent match for your profile' :
                     selectedRec.matchScore >= 80 ? 'Good match for your needs' : 'Fair match, review carefully'}
                  </p>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[#161F32] rounded-xl">
                  <div className="flex items-center gap-2 text-[#A9B3D0] text-sm mb-1">
                    <Euro className="w-4 h-4" />
                    <span>Funding</span>
                  </div>
                  <p className="text-[#F3F6FF] font-medium">€{(selectedRec.value / 1000000).toFixed(1)}M</p>
                </div>
                <div className="p-4 bg-[#161F32] rounded-xl">
                  <div className="flex items-center gap-2 text-[#A9B3D0] text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline</span>
                  </div>
                  <p className="text-[#F3F6FF] font-medium">{selectedRec.deadline}</p>
                </div>
                <div className="p-4 bg-[#161F32] rounded-xl">
                  <div className="flex items-center gap-2 text-[#A9B3D0] text-sm mb-1">
                    <Users className="w-4 h-4" />
                    <span>Eligible</span>
                  </div>
                  <p className="text-[#F3F6FF] font-medium">Municipalities</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-[#F3F6FF] font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4F46E5]" />
                  Description
                </h3>
                <p className="text-[#A9B3D0] text-sm leading-relaxed">{selectedRec.description}</p>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-[#F3F6FF] font-semibold mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRec.categories.map((cat, i) => (
                    <span key={i} className="px-3 py-1 bg-[#4F46E5]/15 text-[#4F46E5] text-sm rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#273155]">
                <button 
                  onClick={() => {
                    toast.success('Added to pipeline');
                    setShowDetailsModal(false);
                    onViewChange('pipeline');
                  }}
                  className="flex-1 btn-primary py-3"
                >
                  Add to Pipeline
                </button>
                <button 
                  onClick={() => toast.info('Opening official program page...')}
                  className="flex items-center gap-2 px-4 py-3 bg-[#161F32] hover:bg-[#1E293B] rounded-xl text-[#F3F6FF] transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Official Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
