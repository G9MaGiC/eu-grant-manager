import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Table, 
  Save, 
  Eye,
  Sparkles,
  Send,
  Check,
  FileText,
  Wand2,
  RotateCcw,
  AlertCircle,
  Type,
  Clock,
  Zap,
  Plus,
  X
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  targetWords: number;
  guidance: string;
  isComplete: boolean;
}

interface AIMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  actions?: string[];
  suggestion?: string;
}

interface TemplateSuggestion {
  id: string;
  title: string;
  preview: string;
}

const sectionTemplates: Record<string, { content: string; guidance: string; targetWords: number }> = {
  s1: {
    content: `PROJECT SUMMARY

This project proposes a comprehensive energy retrofit initiative targeting public buildings within the municipality. The program aligns with EU Green Deal objectives and national climate commitments, aiming to achieve substantial energy savings and carbon emission reductions.

KEY HIGHLIGHTS:
• Total investment: €1,200,000
• EU co-financing: 80% (€960,000)
• Municipal contribution: 20% (€240,000)
• Implementation period: 24 months
• Expected energy savings: 2,500 MWh annually
• CO₂ reduction: 1,200 tonnes annually

The project will modernize HVAC systems, improve building insulation, and install smart metering infrastructure across 15 municipal buildings.`,
    guidance: 'Provide a concise overview (200-300 words) highlighting project goals, budget, timeline, and expected impact.',
    targetWords: 250,
  },
  s2: {
    content: `OBJECTIVES AND SCOPE

Primary Objectives:
1. Reduce energy consumption in municipal buildings by 40% within 24 months
2. Decrease CO₂ emissions by 1,200 tonnes annually
3. Improve indoor air quality and thermal comfort for building occupants
4. Establish a replicable model for other municipalities

Scope of Work:
• Building envelope improvements (insulation, windows, roofing)
• HVAC system upgrades to high-efficiency models
• Installation of smart metering and building management systems
• Integration of renewable energy sources where feasible
• Staff training on energy-efficient operations

Target Buildings:
- City Hall (built 1985, 4,500 m²)
- Public Library (built 1992, 2,800 m²)
- Community Center (built 1978, 3,200 m²)
- 12 additional municipal facilities

Measurable Targets:
✓ Energy savings: 2,500 MWh/year
✓ CO₂ reduction: 1,200 tonnes/year
✓ Cost savings: €180,000/year in utility bills`,
    guidance: 'Define clear, measurable objectives. Include scope boundaries and specific targets with quantifiable metrics.',
    targetWords: 300,
  },
  s3: {
    content: `IMPLEMENTATION PLAN

Phase 1: Preparation (Months 1-3)
• Finalize technical designs and specifications
• Obtain necessary permits and approvals
• Launch procurement processes
• Establish project management structure

Phase 2: Execution (Months 4-18)
• Building envelope improvements (Months 4-10)
• HVAC system installations (Months 8-14)
• Smart metering deployment (Months 12-16)
• Renewable energy integration (Months 14-18)

Phase 3: Commissioning (Months 19-21)
• System testing and calibration
• Staff training programs
• Documentation and handover

Phase 4: Monitoring (Months 22-24)
• Performance verification
• Energy audit and reporting
• Lessons learned documentation

Key Milestones:
📅 Month 3: Procurement complete
📅 Month 10: Envelope works finished
📅 Month 18: All installations complete
📅 Month 24: Project closure`,
    guidance: 'Break down implementation into phases with clear timelines, deliverables, and key milestones.',
    targetWords: 350,
  },
  s4: {
    content: `BUDGET AND CO-FINANCING

Total Project Budget: €1,200,000

COST BREAKDOWN:
├─ Building envelope improvements: €480,000 (40%)
├─ HVAC systems and equipment: €420,000 (35%)
├─ Smart metering & BMS: €180,000 (15%)
├─ Project management & administration: €72,000 (6%)
└─ Contingency (5%): €48,000 (4%)

CO-FINANCING STRUCTURE:
┌─────────────────────────────────────────┐
│  EU Funds (KPO):        €960,000  80%   │
│  Municipal Budget:      €240,000  20%   │
└─────────────────────────────────────────┘

FINANCIAL SUSTAINABILITY:
• Annual energy cost savings: €180,000
• Simple payback period: 6.7 years
• 10-year NPV: €420,000 positive
• Maintenance cost increase: minimal (€8,000/year)

CASH FLOW PROJECTION:
Year 1-2: Implementation (-€1,200,000)
Year 3+: Annual savings (+€180,000)`,
    guidance: 'Provide detailed budget breakdown, co-financing sources, and financial sustainability analysis.',
    targetWords: 250,
  },
  s5: {
    content: `RISK MANAGEMENT AND COMPLIANCE

IDENTIFIED RISKS:

1. Construction Delays (Medium Probability)
   Mitigation: Buffer time in schedule, pre-qualified contractors
   Contingency: 10% time buffer built into timeline

2. Cost Overruns (Medium Probability)
   Mitigation: Fixed-price contracts, 5% budget contingency
   Contingency: €48,000 contingency fund allocated

3. Technical Performance (Low Probability)
   Mitigation: Certified equipment, warranty terms
   Contingency: Maintenance contracts with suppliers

4. Regulatory Changes (Low Probability)
   Mitigation: Regular compliance reviews
   Contingency: Flexible design approach

COMPLIANCE FRAMEWORK:
✓ EU Energy Efficiency Directive compliance
✓ National building codes and standards
✓ Environmental impact assessment completed
✓ Public procurement regulations adherence
✓ State aid rules compliance (GBER)

MONITORING AND REPORTING:
• Monthly progress reports to funding authority
• Quarterly financial statements
• Annual energy performance verification
• Independent audit at project completion`,
    guidance: 'Identify key risks with mitigation strategies. Demonstrate compliance with relevant regulations.',
    targetWords: 300,
  },
  s6: {
    content: `ANNEXES

Annex A: Technical Specifications
• Building survey reports
• Energy audit findings
• Technical drawings and plans
• Equipment specifications

Annex B: Financial Documents
• Detailed budget spreadsheet
• Co-financing commitment letters
• Cash flow projections
• Financial capacity statements

Annex C: Legal and Administrative
• Municipality resolution authorizing application
• Environmental permits
• Building permits
• Procurement plans

Annex D: Supporting Documents
• Letters of support from stakeholders
• Partnership agreements (if applicable)
• CVs of key project personnel
• References from similar projects`,
    guidance: 'List all supporting documents. Ensure completeness for submission requirements.',
    targetWords: 150,
  },
};

const initialSections: Section[] = [
  { id: 's1', title: 'Executive Summary', content: '', wordCount: 0, targetWords: 250, guidance: '', isComplete: false },
  { id: 's2', title: 'Objectives & Scope', content: '', wordCount: 0, targetWords: 300, guidance: '', isComplete: false },
  { id: 's3', title: 'Implementation Plan', content: '', wordCount: 0, targetWords: 350, guidance: '', isComplete: false },
  { id: 's4', title: 'Budget & Co-financing', content: '', wordCount: 0, targetWords: 250, guidance: '', isComplete: false },
  { id: 's5', title: 'Risk & Compliance', content: '', wordCount: 0, targetWords: 300, guidance: '', isComplete: false },
  { id: 's6', title: 'Annexes', content: '', wordCount: 0, targetWords: 150, guidance: '', isComplete: false },
];

const aiSuggestions: TemplateSuggestion[] = [
  { id: 't1', title: 'Energy Savings Template', preview: 'Pre-written paragraph for measurable energy targets...' },
  { id: 't2', title: 'Budget Justification', preview: 'Standard budget rationale for KPO applications...' },
  { id: 't3', title: 'Risk Mitigation', preview: 'Common risk factors and mitigation strategies...' },
  { id: 't4', title: 'EU Compliance Checklist', preview: 'Key compliance points for EU funding...' },
];

export function ApplicationBuilder() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [activeSectionId, setActiveSectionId] = useState('s1');
  const [editorContent, setEditorContent] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGuidance, setShowGuidance] = useState(true);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Initialize first section - only run once on mount
  const isInitialized = useRef(false);
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    const template = sectionTemplates['s1'];
    setEditorContent(template.content);
    // Use functional update to avoid stale closure
    setSections(prev => prev.map(s => 
      s.id === 's1' 
        ? { ...s, content: template.content, wordCount: countWords(template.content), guidance: template.guidance }
        : s
    ));
    
    // Welcome message
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: `Welcome to the Application Builder! I'm here to help you craft a compelling grant application.\n\nFor the **Executive Summary**, focus on:\n• Project value proposition\n• Budget and timeline\n• Expected impact\n\nWould you like me to suggest improvements or generate specific content?`,
      actions: ['Improve this section', 'Check KPO compliance', 'Add metrics'],
    }]);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (aiPanelRef.current) {
        gsap.fromTo(aiPanelRef.current,
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.2 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    const wordCount = countWords(content);
    const template = sectionTemplates[sectionId];
    
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          content,
          wordCount,
          guidance: template?.guidance || '',
          isComplete: wordCount >= template?.targetWords * 0.8,
        };
      }
      return s;
    }));
  };

  const handleSectionClick = (sectionId: string) => {
    // Save current section content
    updateSectionContent(activeSectionId, editorContent);
    
    // Load new section
    setActiveSectionId(sectionId);
    const template = sectionTemplates[sectionId];
    const section = sections.find(s => s.id === sectionId);
    
    if (section?.content) {
      setEditorContent(section.content);
    } else if (template) {
      setEditorContent(template.content);
      updateSectionContent(sectionId, template.content);
    }

    // Update AI context
    const welcomeMessages: Record<string, string> = {
      s1: 'Executive Summary: Focus on the big picture - what, why, and how much. Keep it under 300 words.',
      s2: 'Objectives & Scope: Be specific and measurable. Use SMART criteria for your objectives.',
      s3: 'Implementation Plan: Break into phases with clear milestones. Show you have a realistic timeline.',
      s4: 'Budget: Be transparent about costs. Show the value for money and financial sustainability.',
      s5: 'Risks: Be honest about challenges and show you have mitigation strategies in place.',
      s6: 'Annexes: List all supporting documents. Make sure nothing is missing for submission.',
    };

    setMessages([{
      id: `welcome-${sectionId}`,
      type: 'ai',
      content: welcomeMessages[sectionId],
      actions: ['Get writing tips', 'See examples', 'Check requirements'],
    }]);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    updateSectionContent(activeSectionId, newContent);
  };

  const handleSave = () => {
    setIsSaving(true);
    updateSectionContent(activeSectionId, editorContent);
    
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 800);
  };

  const applySuggestion = (suggestion: string, messageId: string) => {
    const cursorPosition = editorRef.current?.selectionStart || editorContent.length;
    const newContent = editorContent.slice(0, cursorPosition) + '\n\n' + suggestion + '\n\n' + editorContent.slice(cursorPosition);
    
    setEditorContent(newContent);
    updateSectionContent(activeSectionId, newContent);
    
    setAppliedSuggestions(prev => new Set(prev).add(messageId));

    // Confirmation message
    setMessages(prev => [...prev, {
      id: `applied-${Date.now()}`,
      type: 'ai',
      content: '✓ Content added to your document. You can edit it as needed.',
    }]);
  };

  const generateAIResponse = (action: string, sectionId: string): { content: string; suggestion?: string; actions?: string[] } => {
    const section = sections.find(s => s.id === sectionId);
    const currentWords = section?.wordCount || 0;
    const targetWords = section?.targetWords || 250;
    
    const responses: Record<string, Record<string, { content: string; suggestion?: string; actions?: string[] }>> = {
      s1: {
        'Improve this section': {
          content: `I've reviewed your Executive Summary. Here are suggestions to strengthen it:\n\n1. **Lead with impact** - Start with the problem you're solving\n2. **Quantify benefits** - Add specific numbers (energy savings, CO₂ reduction)\n3. **Keep it concise** - Current: ${currentWords} words, Target: ~${targetWords} words`,
          suggestion: `IMPACT STATEMENT:\nThis project will reduce municipal energy costs by €180,000 annually while cutting CO₂ emissions by 1,200 tonnes—equivalent to removing 650 cars from the road.`,
          actions: ['Add to document', 'Rewrite completely', 'More suggestions'],
        },
        'Add metrics': {
          content: 'Here are key metrics to include in your Executive Summary:',
          suggestion: `KEY PERFORMANCE INDICATORS:\n• Energy reduction: 2,500 MWh/year (40% improvement)\n• CO₂ reduction: 1,200 tonnes/year\n• Financial savings: €180,000/year\n• Payback period: 6.7 years\n• Buildings modernized: 15 facilities\n• Beneficiaries: 2,500 daily building users`,
          actions: ['Add to document', 'Customize numbers', 'Add more KPIs'],
        },
        'Check KPO compliance': {
          content: '✓ Your Executive Summary meets KPO requirements.\n⚠ Consider adding:\n• Explicit mention of EU Green Deal alignment\n• Reference to national climate targets\n• Brief mention of co-financing structure',
          actions: ['Add EU alignment text', 'Add co-financing mention', 'Full compliance check'],
        },
      },
      s2: {
        'Get writing tips': {
          content: 'For Objectives & Scope, use the SMART framework:\n\n**S**pecific - Clear, well-defined objectives\n**M**easurable - Quantifiable targets\n**A**chievable - Realistic given resources\n**R**elevant - Aligned with program goals\n**T**ime-bound - Clear deadlines',
          actions: ['Review my objectives', 'Suggest SMART targets', 'See examples'],
        },
        'Suggest SMART targets': {
          content: 'Here are measurable targets for your objectives:',
          suggestion: `SMART TARGETS:\n\n1. Reduce energy consumption by 40% (from 6,250 MWh to 3,750 MWh) within 24 months of project completion.\n\n2. Achieve CO₂ emission reduction of 1,200 tonnes annually by end of Year 2.\n\n3. Improve indoor comfort scores from current 6.2/10 to 8.5/10 based on occupant surveys.\n\n4. Establish replication framework shared with 5+ municipalities by Month 24.`,
          actions: ['Add to document', 'Adjust targets', 'Add timeline'],
        },
      },
      s3: {
        'Get writing tips': {
          content: 'A strong Implementation Plan should:\n\n• Show realistic timelines with buffers\n• Identify critical path activities\n• Include clear milestones\n• Define responsibilities\n• Plan for monitoring and evaluation',
          actions: ['Review my timeline', 'Add milestones', 'Suggest phase breakdown'],
        },
      },
      s4: {
        'Get writing tips': {
          content: 'For Budget & Co-financing:\n\n• Be transparent and detailed\n• Justify major cost items\n• Show value for money\n• Demonstrate financial sustainability\n• Include sensitivity analysis',
          actions: ['Review budget structure', 'Add justification', 'Check cost realism'],
        },
      },
      s5: {
        'Get writing tips': {
          content: 'For Risk Management:\n\n• Be honest about potential issues\n• Show proactive mitigation\n• Include contingency plans\n• Demonstrate monitoring approach\n• Reference compliance framework',
          actions: ['Review my risks', 'Suggest common risks', 'Add mitigation strategies'],
        },
      },
      s6: {
        'Get writing tips': {
          content: 'For Annexes:\n\n• List all required documents\n• Ensure they\'re ready for submission\n• Cross-reference with program guidelines\n• Include document status (ready/pending)',
          actions: ['See required documents', 'Check completeness', 'Add status tracking'],
        },
      },
    };

    const sectionResponses = responses[sectionId] || responses['s1'];
    return sectionResponses[action] || {
      content: 'I can help you improve this section. What would you like me to focus on?',
      actions: ['Improve clarity', 'Add detail', 'Check compliance'],
    };
  };

  const handleAIAction = (action: string) => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const response = generateAIResponse(action, activeSectionId);
      
      const newMessage: AIMessage = {
        id: `m${Date.now()}`,
        type: 'ai',
        content: response.content,
        suggestion: response.suggestion,
        actions: response.actions || ['Apply suggestion', 'Try another', 'Dismiss'],
      };

      setMessages(prev => [...prev, newMessage]);
      setIsGenerating(false);
    }, 1200);
  };

  const handleSendMessage = () => {
    if (aiInput.trim()) {
      const userMessage: AIMessage = {
        id: `m${Date.now()}`,
        type: 'user',
        content: aiInput,
      };
      setMessages(prev => [...prev, userMessage]);
      setAiInput('');

      setIsGenerating(true);
      setTimeout(() => {
        const aiResponse: AIMessage = {
          id: `m${Date.now() + 1}`,
          type: 'ai',
          content: `I understand you're asking about "${aiInput}". Based on your current section (${sections.find(s => s.id === activeSectionId)?.title}), here's what I can help with:\n\n• Refine your writing for clarity and impact\n• Suggest specific content based on KPO requirements\n• Check compliance with EU funding guidelines\n• Generate measurable targets and KPIs`,
          actions: ['Suggest content', 'Check compliance', 'Improve writing'],
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsGenerating(false);
      }, 1500);
    }
  };

  const insertTemplate = (templateId: string) => {
    const templates: Record<string, string> = {
      t1: `MEASURABLE ENERGY TARGETS:\n\nThe project targets the following measurable outcomes:\n• Primary energy savings: 2,500 MWh annually (40% reduction)\n• CO₂ emission reduction: 1,200 tonnes CO₂e/year\n• Energy cost savings: €180,000/year\n• Simple payback period: 6.7 years\n• Improved building energy ratings: minimum 2 classes improvement`,
      t2: `BUDGET JUSTIFICATION:\n\nThe total project budget of €1,200,000 is justified based on:\n• Market rates for energy retrofit works (3 quotes obtained)\n• Comparable project benchmarks from similar municipalities\n• Independent cost verification by certified energy auditor\n• 5% contingency for unforeseen circumstances`,
      t3: `RISK MITIGATION STRATEGIES:\n\nKey risks and mitigation approaches:\n\n1. Construction delays → Fixed-price contracts, penalty clauses\n2. Cost overruns → 5% contingency, phased implementation\n3. Technical underperformance → Performance guarantees, warranties\n4. Regulatory changes → Flexible design, compliance monitoring`,
      t4: `EU COMPLIANCE CHECKLIST:\n\n✓ State aid compliance (GBER Article 38)\n✓ Environmental impact assessment completed\n✓ Public procurement rules adherence\n✓ Energy Efficiency Directive alignment\n✓ National climate targets contribution\n✓ Do No Significant Principle (DNSH) assessment`,
    };

    const content = templates[templateId];
    if (content) {
      const newContent = editorContent + '\n\n' + content;
      setEditorContent(newContent);
      updateSectionContent(activeSectionId, newContent);
      setShowTemplates(false);

      setMessages(prev => [...prev, {
        id: `template-${Date.now()}`,
        type: 'ai',
        content: '✓ Template inserted. Customize the content to match your specific project details.',
      }]);
    }
  };

  const formatText = (format: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    let newText = editorContent;

    switch (format) {
      case 'bold':
        newText = editorContent.substring(0, start) + `**${selectedText}**` + editorContent.substring(end);
        break;
      case 'italic':
        newText = editorContent.substring(0, start) + `*${selectedText}*` + editorContent.substring(end);
        break;
      case 'bullet':
        newText = editorContent.substring(0, start) + `• ${selectedText}` + editorContent.substring(end);
        break;
      case 'numbered':
        newText = editorContent.substring(0, start) + `1. ${selectedText}` + editorContent.substring(end);
        break;
    }

    setEditorContent(newText);
    updateSectionContent(activeSectionId, newText);
  };

  const activeSection = sections.find(s => s.id === activeSectionId);
  const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
  const totalTargetWords = sections.reduce((sum, s) => sum + s.targetWords, 0);
  const completionPercentage = Math.round((totalWords / totalTargetWords) * 100);
  const completedSections = sections.filter(s => s.isComplete).length;

  return (
    <div ref={containerRef} className="h-[calc(100vh-0px)] flex">
      {/* Left Sidebar - Sections */}
      <div className="w-[300px] bg-[#111827] border-r border-[#273155] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#273155]">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#4F46E5]" />
            <span className="text-[#A9B3D0] text-xs uppercase tracking-wider">Template</span>
          </div>
          <h2 className="text-[#F3F6FF] font-semibold mb-3">KPO Project Description</h2>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A9B3D0]">Progress</span>
              <span className="text-[#4F46E5] font-medium">{completedSections}/6 sections</span>
            </div>
            <div className="h-2 bg-[#161F32] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
                style={{ width: `${(completedSections / 6) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#A9B3D0]">
              <span>{totalWords} words</span>
              <span>{completionPercentage}% of target</span>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                section.id === activeSectionId
                  ? 'bg-[#4F46E5]/15 text-[#4F46E5] border border-[#4F46E5]/30'
                  : 'text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32]'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                section.isComplete 
                  ? 'bg-[#22C55E]/20 text-[#22C55E]' 
                  : section.id === activeSectionId
                    ? 'bg-[#4F46E5]/20 text-[#4F46E5]'
                    : 'bg-[#161F32] text-[#A9B3D0]'
              }`}>
                {section.isComplete ? <Check className="w-3.5 h-3.5" /> : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{section.title}</p>
                <p className={`text-xs ${section.wordCount >= section.targetWords * 0.8 ? 'text-[#22C55E]' : 'text-[#A9B3D0]'}`}>
                  {section.wordCount}/{section.targetWords} words
                </p>
              </div>
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="p-4 border-t border-[#273155] space-y-2">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving ? (
              <RotateCcw className="w-4 h-4 loading-spinner" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save draft'}
          </button>
          
          {lastSaved && (
            <p className="text-center text-xs text-[#A9B3D0]">
              Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          
          <button className="w-full btn-secondary flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            Preview PDF
          </button>
        </div>
      </div>

      {/* Center Editor */}
      <div className="flex-1 flex flex-col bg-[#0B0F1C]">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-3 border-b border-[#273155] bg-[#111827]">
          <button onClick={() => formatText('bold')} className="p-2 text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32] rounded-lg transition-colors" title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => formatText('italic')} className="p-2 text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32] rounded-lg transition-colors" title="Italic">
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-[#273155] mx-2" />
          <button onClick={() => formatText('bullet')} className="p-2 text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32] rounded-lg transition-colors" title="Bullet list">
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => formatText('numbered')} className="p-2 text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32] rounded-lg transition-colors" title="Numbered list">
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-[#273155] mx-2" />
          <button className="p-2 text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32] rounded-lg transition-colors" title="Insert link">
            <Link className="w-4 h-4" />
          </button>
          <button className="p-2 text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32] rounded-lg transition-colors" title="Insert table">
            <Table className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-[#273155] mx-2" />
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${showTemplates ? 'text-[#4F46E5] bg-[#4F46E5]/15' : 'text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32]'}`}
            title="Insert template"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm">Templates</span>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#A9B3D0]">
              <Type className="w-4 h-4" />
              <span>{activeSection?.wordCount || 0} words</span>
            </div>
            <div className="flex items-center gap-2 text-[#A9B3D0]">
              <Clock className="w-4 h-4" />
              <span>~{Math.ceil((activeSection?.wordCount || 0) / 200)} min read</span>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Editor */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              {/* Section Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-[#F3F6FF] mb-2">{activeSection?.title}</h1>
                
                {/* Guidance Banner */}
                {showGuidance && activeSection?.guidance && (
                  <div className="flex items-start gap-3 p-4 bg-[#4F46E5]/10 border border-[#4F46E5]/30 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[#A9B3D0] text-sm">{activeSection.guidance}</p>
                    </div>
                    <button 
                      onClick={() => setShowGuidance(false)}
                      className="text-[#A9B3D0] hover:text-[#F3F6FF]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Text Area */}
              <textarea
                ref={editorRef}
                value={editorContent}
                onChange={handleContentChange}
                className="w-full min-h-[500px] bg-transparent text-[#F3F6FF] leading-relaxed resize-none focus:outline-none text-[15px] font-mono"
                placeholder={`Write your ${activeSection?.title.toLowerCase()} here...`}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Templates Panel */}
          {showTemplates && (
            <div className="w-72 bg-[#111827] border-l border-[#273155] p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#F3F6FF] font-semibold">Quick Templates</h3>
                <button 
                  onClick={() => setShowTemplates(false)}
                  className="text-[#A9B3D0] hover:text-[#F3F6FF]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {aiSuggestions.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => insertTemplate(template.id)}
                    className="w-full p-4 bg-[#161F32] hover:bg-[#1E293B] rounded-xl text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="w-4 h-4 text-[#4F46E5]" />
                      <span className="text-[#F3F6FF] font-medium text-sm">{template.title}</span>
                    </div>
                    <p className="text-[#A9B3D0] text-xs">{template.preview}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right AI Panel */}
      <div 
        ref={aiPanelRef} 
        className="w-[360px] bg-[#161F32] border-l border-[#273155] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#273155]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4F46E5]/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div>
              <h3 className="text-[#F3F6FF] font-semibold">AI Assistant</h3>
              <p className="text-[#A9B3D0] text-xs">Powered by GPT-4</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-[#4F46E5]/40 mx-auto mb-4" />
              <p className="text-[#A9B3D0] text-sm">Ask me anything about your application</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`${message.type === 'ai' ? '' : 'flex justify-end'}`}
            >
              <div 
                className={`max-w-[95%] p-4 rounded-xl text-sm ${
                  message.type === 'ai' 
                    ? 'bg-[#111827] text-[#F3F6FF] border border-[#273155]' 
                    : 'bg-[#4F46E5] text-white'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                
                {message.suggestion && !appliedSuggestions.has(message.id) && (
                  <div className="mt-4 p-3 bg-[#0B0F1C] rounded-lg border border-[#273155]">
                    <p className="text-xs text-[#A9B3D0] mb-2 uppercase tracking-wider">Suggested content:</p>
                    <p className="text-[#F3F6FF] text-xs whitespace-pre-line mb-3">{message.suggestion.slice(0, 150)}...</p>
                    <button
                      onClick={() => applySuggestion(message.suggestion!, message.id)}
                      className="w-full py-2 bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg text-white text-xs font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      Add to document
                    </button>
                  </div>
                )}
                
                {message.actions && !message.suggestion && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.actions.map((action) => (
                      <button
                        key={action}
                        onClick={() => handleAIAction(action)}
                        disabled={isGenerating}
                        className="px-3 py-1.5 bg-[#4F46E5]/20 hover:bg-[#4F46E5]/30 text-[#4F46E5] text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex items-center gap-3 text-[#A9B3D0] text-sm p-4 bg-[#111827] rounded-xl border border-[#273155]">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce delay-200" />
              </div>
              <span>AI is thinking...</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-[#273155]">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-4 h-4 text-[#A9B3D0]" />
            <span className="text-[#A9B3D0] text-xs uppercase tracking-wider">Quick actions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Improve clarity', 'Add metrics', 'Check compliance'].map((action) => (
              <button 
                key={action}
                onClick={() => handleAIAction(action)}
                disabled={isGenerating}
                className="px-3 py-1.5 bg-[#111827] hover:bg-[#1E293B] text-[#A9B3D0] hover:text-[#F3F6FF] text-xs rounded-lg transition-colors border border-[#273155] disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#273155]">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AI for help..."
              className="flex-1 bg-[#111827] border border-[#273155] rounded-xl px-4 py-3 text-sm text-[#F3F6FF] placeholder:text-[#A9B3D0]/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!aiInput.trim() || isGenerating}
              className="p-3 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
