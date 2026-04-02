import { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  FileText, 
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const faqs = [
  {
    question: 'How do I add a new grant to the pipeline?',
    answer: 'Navigate to the Pipeline page and click the "Add Grant" button. Fill in the grant details including name, program, deadline, and estimated value.',
  },
  {
    question: 'How does the AI Application Builder work?',
    answer: 'The AI Application Builder provides pre-filled templates for common grant sections. Use the AI Assistant panel to get suggestions, improve clarity, and check compliance.',
  },
  {
    question: 'Can I export my grant data?',
    answer: 'Yes! Go to Settings > Data & Privacy to export all your grant data in JSON format. You can also export individual reports from the Reports page.',
  },
  {
    question: 'How are match scores calculated?',
    answer: 'Match scores are calculated based on your municipality profile, past applications, program alignment, and deadline compatibility.',
  },
  {
    question: 'How do I invite team members?',
    answer: 'Go to the Team page and click "Invite Member". Enter their email and select their role (Member, Manager, or Admin).',
  },
];

const guides = [
  { title: 'Getting Started Guide', icon: BookOpen, description: 'Learn the basics of EU Grant Manager' },
  { title: 'Writing Winning Applications', icon: FileText, description: 'Tips for crafting compelling grant proposals' },
  { title: 'Video Tutorials', icon: Video, description: 'Watch step-by-step video guides' },
  { title: 'Community Forum', icon: MessageCircle, description: 'Connect with other grant managers' },
];

export function HelpCenter({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary border border-theme rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme">
          <div>
            <h2 className="text-xl font-semibold text-primary">Help Center</h2>
            <p className="text-secondary text-sm">Find answers and get support</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-theme">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full bg-tertiary border border-theme rounded-xl pl-12 pr-4 py-3 text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Guides */}
          <div>
            <h3 className="text-primary font-semibold mb-4">Quick Guides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guides.map((guide, i) => (
                <button
                  key={i}
                  onClick={() => toast.info(`${guide.title} - Opening in new tab...`)}
                  className="flex items-center gap-3 p-4 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center">
                    <guide.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-primary font-medium text-sm">{guide.title}</p>
                    <p className="text-secondary text-xs">{guide.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-secondary" />
                </button>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h3 className="text-primary font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {filteredFaqs.map((faq, i) => (
                <div 
                  key={i}
                  className="bg-tertiary rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-hover transition-colors"
                  >
                    <span className="text-primary font-medium text-sm">{faq.question}</span>
                    <ChevronRight className={`w-4 h-4 text-secondary transition-transform ${expandedFaq === i ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedFaq === i && (
                    <div className="px-4 pb-4">
                      <p className="text-secondary text-sm">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <p className="text-secondary text-center py-4">No results found. Try a different search.</p>
              )}
            </div>
          </div>

          {/* Contact Support */}
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
            <h3 className="text-primary font-semibold mb-2">Need more help?</h3>
            <p className="text-secondary text-sm mb-4">Our support team is here to assist you.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => toast.success('Support email copied: support@eugrantmanager.eu')}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg text-white text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </button>
              <button 
                onClick={() => toast.info('Phone support: +48 12 345 6789')}
                className="flex items-center gap-2 px-4 py-2 bg-tertiary hover:bg-surface-hover rounded-lg text-primary text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
