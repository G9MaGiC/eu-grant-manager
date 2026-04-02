import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  Calendar,
  Filter,
  ChevronDown,
  Search,
  TrendingUp,
  PieChart,
  BarChart3,
  Share2,
  Printer,
  Eye,
  Check,
  X,
  Loader2,
  Mail,
  Link,
  Copy
} from 'lucide-react';
import { submissions, grants } from '@/data/mockData';
import { toast } from 'sonner';

interface ExportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  format: string;
}

const exportCards: ExportCard[] = [
  {
    id: 'pdf',
    title: 'Export PDF',
    description: 'Formatted for official submission',
    icon: FileText,
    color: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/15',
    format: 'PDF',
  },
  {
    id: 'word',
    title: 'Export Word',
    description: 'Editable for final review',
    icon: FileText,
    color: 'text-[#3B82F6]',
    bgColor: 'bg-[#3B82F6]/15',
    format: 'DOCX',
  },
  {
    id: 'csv',
    title: 'Export CSV',
    description: 'Pipeline data for leadership',
    icon: FileSpreadsheet,
    color: 'text-[#22C55E]',
    bgColor: 'bg-[#22C55E]/15',
    format: 'CSV',
  },
];

const programData = [
  { name: 'KPO', value: 3, color: '#4F46E5' },
  { name: 'FEnIKS', value: 1, color: '#22C55E' },
  { name: 'CEF', value: 1, color: '#F59E0B' },
  { name: 'Horizon', value: 1, color: '#8B5CF6' },
];

const monthlyData = [
  { month: 'Jan', submitted: 1, won: 0 },
  { month: 'Feb', submitted: 2, won: 1 },
  { month: 'Mar', submitted: 3, won: 1 },
  { month: 'Apr', submitted: 0, won: 2 },
];

export function Reports() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportedFiles, setExportedFiles] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFormat, setPreviewFormat] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.export-card');
        gsap.fromTo(cards,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
        );
      }
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll('.history-row');
        gsap.fromTo(rows,
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out', delay: 0.3 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleExport = async (cardId: string, format: string) => {
    setIsExporting(cardId);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const filename = `Grant_Report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
    setExportedFiles([...exportedFiles, filename]);
    setIsExporting(null);
    
    toast.success(`${format} exported successfully`, {
      description: filename,
      action: {
        label: 'Download',
        onClick: () => toast.info(`Downloading ${filename}...`),
      },
    });
  };

  const handlePreview = (format: string) => {
    setPreviewFormat(format);
    setShowPreview(true);
  };

  const handleShareByEmail = () => {
    if (shareEmail.trim()) {
      toast.success(`Report shared with ${shareEmail}`);
      setShareEmail('');
      setShowShareModal(false);
    }
  };

  const handleGenerateLink = () => {
    const link = `https://eugrantmanager.eu/share/${Date.now()}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
    toast.success('Share link copied to clipboard');
  };

  const getGrantStatus = (grantId: string) => {
    const grant = grants.find(g => g.id === grantId);
    return grant?.status || 'unknown';
  };

  const totalWon = grants.filter(g => g.status === 'won').length;
  const totalSubmitted = grants.filter(g => g.status === 'submitted').length;
  const totalValue = grants.filter(g => g.status === 'won').reduce((sum, g) => sum + g.estimatedValue, 0);

  return (
    <div ref={containerRef} className="p-7 space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Reports & exports</h1>
          <p className="text-secondary mt-1">Generate submission-ready documents and track history.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowShareModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button 
            onClick={() => toast.info('Printing...')}
            className="btn-secondary flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Export Cards */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exportCards.map((card) => {
          const Icon = card.icon;
          const isExported = exportedFiles.some(f => f.includes(card.format));
          return (
            <div 
              key={card.id}
              className="export-card card-dark p-6 hover:border-accent/35 transition-all duration-250 hover:-translate-y-1 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${card.color}`} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePreview(card.format)}
                    className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleExport(card.id, card.format)}
                    disabled={isExporting === card.id}
                    className={`p-2 rounded-lg transition-all ${
                      isExported 
                        ? 'bg-[#22C55E]/20 text-[#22C55E]' 
                        : 'text-secondary hover:text-accent hover:bg-accent/10'
                    }`}
                  >
                    {isExporting === card.id ? (
                      <Loader2 className="w-5 h-5 loading-spinner" />
                    ) : isExported ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-1">{card.title}</h3>
              <p className="text-secondary text-sm">{card.description}</p>
              
              {isExported && (
                <p className="text-[#22C55E] text-sm mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Ready for download
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Program Distribution */}
        <div className="card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Grants by Program</h2>
            <PieChart className="w-5 h-5 text-secondary" />
          </div>
          <div className="space-y-3">
            {programData.map((program) => (
              <div key={program.name} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: program.color }}
                />
                <span className="text-primary text-sm flex-1">{program.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-tertiary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${(program.value / grants.length) * 100}%`,
                        backgroundColor: program.color 
                      }}
                    />
                  </div>
                  <span className="text-secondary text-sm w-6">{program.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Monthly Activity</h2>
            <BarChart3 className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex items-end justify-between h-32 gap-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end h-24">
                  <div 
                    className="flex-1 bg-accent rounded-t transition-all duration-500"
                    style={{ height: `${(month.submitted / 3) * 100}%` }}
                    title={`${month.submitted} submitted`}
                  />
                  <div 
                    className="flex-1 bg-[#22C55E] rounded-t transition-all duration-500"
                    style={{ height: `${(month.won / 3) * 100}%` }}
                    title={`${month.won} won`}
                  />
                </div>
                <span className="text-secondary text-xs">{month.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded" />
              <span className="text-secondary text-xs">Submitted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#22C55E] rounded" />
              <span className="text-secondary text-xs">Won</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submission History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Submission history</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                placeholder="Search submissions..."
                className="w-56 bg-tertiary border border-theme rounded-xl pl-9 pr-4 py-2 text-sm text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
              />
            </div>
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              Date
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref={tableRef} className="card-dark overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-tertiary border-b border-theme">
                <th className="text-left text-secondary text-xs font-medium uppercase tracking-wider px-5 py-4">Grant</th>
                <th className="text-left text-secondary text-xs font-medium uppercase tracking-wider px-5 py-4">Submitted</th>
                <th className="text-left text-secondary text-xs font-medium uppercase tracking-wider px-5 py-4">Format</th>
                <th className="text-left text-secondary text-xs font-medium uppercase tracking-wider px-5 py-4">Status</th>
                <th className="text-right text-secondary text-xs font-medium uppercase tracking-wider px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => {
                const status = getGrantStatus(submission.grantId);
                return (
                  <tr 
                    key={submission.id}
                    className={`history-row border-b border-theme/50 table-row-hover ${index % 2 === 1 ? 'bg-tertiary/30' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-primary font-medium">{submission.grantName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-primary mono">{submission.submittedAt}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        submission.format === 'PDF' ? 'bg-[#EF4444]/15 text-[#EF4444]' :
                        submission.format === 'Word' ? 'bg-[#3B82F6]/15 text-[#3B82F6]' :
                        'bg-[#22C55E]/15 text-[#22C55E]'
                      }`}>
                        {submission.format}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        status === 'won' ? 'bg-[#22C55E]/15 text-[#22C55E]' :
                        status === 'submitted' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                        'bg-accent/15 text-accent'
                      }`}>
                        {status === 'won' ? 'Awarded' : status === 'submitted' ? 'Under review' : 'Submitted'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toast.info(`Opening ${submission.grantName}...`)}
                          className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toast.success(`Downloading ${submission.grantName}...`)}
                          className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22C55E]/15 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-secondary text-sm">Total submitted</p>
              <p className="text-primary text-xl font-semibold">{submissions.length}</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-secondary text-sm">Under review</p>
              <p className="text-primary text-xl font-semibold">{totalSubmitted}</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F59E0B]/15 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-secondary text-sm">Success rate</p>
              <p className="text-primary text-xl font-semibold">{Math.round((totalWon / (totalWon + totalSubmitted)) * 100) || 0}%</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B5CF6]/15 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-secondary text-sm">Total won value</p>
              <p className="text-primary text-xl font-semibold">€{(totalValue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-secondary border border-theme rounded-2xl w-[800px] max-w-[90vw] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-theme">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-primary">Preview: {previewFormat} Export</h2>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="bg-white text-black p-8 rounded-lg">
                <h1 className="text-2xl font-bold mb-4">EU Grant Application Report</h1>
                <p className="text-gray-600 mb-6">Generated on {new Date().toLocaleDateString()}</p>
                
                <h2 className="text-lg font-semibold mb-3">Executive Summary</h2>
                <p className="mb-4">This report summarizes the current state of EU grant applications for the Municipality of Krakow.</p>
                
                <h2 className="text-lg font-semibold mb-3">Key Metrics</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>Active grants: 12</li>
                  <li>Total pipeline value: €4.2M</li>
                  <li>Success rate: 67%</li>
                  <li>Applications submitted this month: 3</li>
                </ul>
                
                <h2 className="text-lg font-semibold mb-3">Upcoming Deadlines</h2>
                <table className="w-full border-collapse mb-4">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Grant</th>
                      <th className="text-left py-2">Deadline</th>
                      <th className="text-left py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">KPO Energy Retrofit</td>
                      <td className="py-2">2026-03-18</td>
                      <td className="py-2">€1.2M</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">FEnIKS Digital Services</td>
                      <td className="py-2">2026-03-25</td>
                      <td className="py-2">€850K</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-theme">
              <button 
                onClick={() => setShowPreview(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowPreview(false);
                  toast.success(`${previewFormat} downloaded`);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download {previewFormat}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary border border-theme rounded-2xl p-6 w-[450px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Share Report</h2>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              {/* Share by Email */}
              <div>
                <label className="text-secondary text-sm mb-2 block flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Share by Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="flex-1 bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                  />
                  <button
                    onClick={handleShareByEmail}
                    disabled={!shareEmail.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Share Link */}
              <div className="pt-4 border-t border-theme">
                <label className="text-secondary text-sm mb-2 block flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Share Link
                </label>
                <button
                  onClick={handleGenerateLink}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Generate & Copy Link
                </button>
                {shareLink && (
                  <p className="mt-2 text-[#22C55E] text-sm text-center">{shareLink}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
