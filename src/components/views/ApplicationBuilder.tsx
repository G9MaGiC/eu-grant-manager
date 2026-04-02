import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered,
  Link, Quote,
  Save, Download, FileText, Eye,
  Sparkles, Send, Check, X,
  Search,
  History, MessageSquare, Zap,
  Target,
  FileDown, FileUp,
  Undo,
  Redo,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Section {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  targetWords: number;
  guidance: string;
  isComplete: boolean;
  lastModified: Date;
  comments: Comment[];
}

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
}

interface Version {
  id: string;
  timestamp: Date;
  author: string;
  changes: string;
  content: Record<string, string>;
}

interface AIMessage {
  id: string;
  type: 'ai' | 'user' | 'system';
  content: string;
  actions?: string[];
  suggestion?: string;
}

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  preview: string;
  sections: Record<string, string>;
}

// Templates Data
const templates: Template[] = [
  {
    id: 'kpo-energy',
    title: 'KPO Energy Retrofit',
    description: 'Standard template for energy efficiency projects under KPO',
    category: 'KPO',
    preview: 'Energy retrofit of public buildings with 80% EU co-financing...',
    sections: {
      s1: `PROJECT SUMMARY

This project proposes a comprehensive energy retrofit initiative targeting public buildings within the municipality. The program aligns with EU Green Deal objectives and national climate commitments.

KEY HIGHLIGHTS:
• Total investment: €1,200,000
• EU co-financing: 80% (€960,000)
• Implementation period: 24 months
• Expected energy savings: 2,500 MWh annually`,
      s2: `OBJECTIVES AND SCOPE

Primary Objectives:
1. Reduce energy consumption by 40% within 24 months
2. Decrease CO₂ emissions by 1,200 tonnes annually
3. Improve indoor air quality and thermal comfort`,
      s3: `IMPLEMENTATION PLAN

Phase 1: Preparation (Months 1-3)
• Finalize technical designs and specifications
• Obtain necessary permits and approvals
• Launch procurement processes

Phase 2: Execution (Months 4-18)
• Building envelope improvements
• HVAC system installations
• Smart metering deployment`,
      s4: `BUDGET AND CO-FINANCING

Total Project Budget: €1,200,000

COST BREAKDOWN:
├─ Building envelope improvements: €480,000 (40%)
├─ HVAC systems and equipment: €420,000 (35%)
├─ Smart metering & BMS: €180,000 (15%)
├─ Project management: €72,000 (6%)
└─ Contingency (5%): €48,000 (4%)`,
      s5: `RISK MANAGEMENT AND COMPLIANCE

IDENTIFIED RISKS:

1. Construction Delays (Medium Probability)
   Mitigation: Buffer time in schedule, pre-qualified contractors

2. Cost Overruns (Medium Probability)
   Mitigation: Fixed-price contracts, 5% budget contingency

COMPLIANCE FRAMEWORK:
✓ EU Energy Efficiency Directive compliance
✓ National building codes and standards
✓ Public procurement regulations adherence`,
      s6: `ANNEXES

Annex A: Technical Specifications
• Building survey reports
• Energy audit findings
• Technical drawings and plans

Annex B: Financial Documents
• Detailed budget spreadsheet
• Co-financing commitment letters
• Cash flow projections

Annex C: Legal and Administrative
• Municipality resolution authorizing application
• Environmental permits
• Building permits`
    }
  },
  {
    id: 'cef-transport',
    title: 'CEF Transport Corridor',
    description: 'Template for transport infrastructure projects under CEF',
    category: 'CEF',
    preview: 'Regional transport infrastructure improvements...',
    sections: {
      s1: 'PROJECT SUMMARY\n\nThis project aims to enhance regional transport infrastructure...',
    }
  },
  {
    id: 'horizon-innovation',
    title: 'Horizon Innovation',
    description: 'Research and innovation project template for Horizon Europe',
    category: 'Horizon',
    preview: 'Innovative healthcare solutions pilot project...',
    sections: {}
  },
];

// Initial Sections
const createInitialSections = (): Section[] => [
  { 
    id: 's1', 
    title: 'Executive Summary', 
    content: '', 
    wordCount: 0, 
    targetWords: 250, 
    guidance: 'Provide a concise overview highlighting project goals, budget, timeline, and expected impact. Keep it under 300 words.',
    isComplete: false,
    lastModified: new Date(),
    comments: []
  },
  { 
    id: 's2', 
    title: 'Objectives & Scope', 
    content: '', 
    wordCount: 0, 
    targetWords: 300, 
    guidance: 'Define clear, measurable objectives using SMART criteria. Include scope boundaries and specific targets.',
    isComplete: false,
    lastModified: new Date(),
    comments: []
  },
  { 
    id: 's3', 
    title: 'Implementation Plan', 
    content: '', 
    wordCount: 0, 
    targetWords: 350, 
    guidance: 'Break down implementation into phases with clear timelines, deliverables, and key milestones.',
    isComplete: false,
    lastModified: new Date(),
    comments: []
  },
  { 
    id: 's4', 
    title: 'Budget & Co-financing', 
    content: '', 
    wordCount: 0, 
    targetWords: 250, 
    guidance: 'Provide detailed budget breakdown, co-financing sources, and financial sustainability analysis.',
    isComplete: false,
    lastModified: new Date(),
    comments: []
  },
  { 
    id: 's5', 
    title: 'Risk & Compliance', 
    content: '', 
    wordCount: 0, 
    targetWords: 300, 
    guidance: 'Identify key risks with mitigation strategies. Demonstrate compliance with relevant regulations.',
    isComplete: false,
    lastModified: new Date(),
    comments: []
  },
  { 
    id: 's6', 
    title: 'Annexes', 
    content: '', 
    wordCount: 0, 
    targetWords: 150, 
    guidance: 'List all supporting documents. Ensure completeness for submission requirements.',
    isComplete: false,
    lastModified: new Date(),
    comments: []
  },
];

interface ApplicationBuilderProps {
  onClose?: () => void;
}

export function ApplicationBuilder({ onClose }: ApplicationBuilderProps) {
  // Core State
  const [sections, setSections] = useState<Section[]>(createInitialSections());
  const [activeSectionId, setActiveSectionId] = useState('s1');
  const [editorContent, setEditorContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // UI State
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  // AI State
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Version State
  const [versions, setVersions] = useState<Version[]>([]);
  
  // Find/Replace State
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);
  
  // Comments
  const [newComment, setNewComment] = useState('');
  
  // History for undo/redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize
  useEffect(() => {
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      type: 'ai',
      content: `👋 Welcome to the Application Builder!

I can help you:
• Write and edit grant sections
• Check compliance with EU requirements
• Improve clarity and impact
• Suggest metrics and KPIs

Start by selecting a template or begin writing.`,
      actions: ['Browse Templates', 'Writing Tips', 'Compliance Check']
    };
    setAiMessages([welcomeMessage]);
  }, []);

  // Load initial section
  useEffect(() => {
    const initialSection = sections.find(s => s.id === 's1');
    if (initialSection) {
      setEditorContent(initialSection.content);
      // Initialize history
      setHistory([initialSection.content]);
      setHistoryIndex(0);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (isDirty && !isSaving) {
      autoSaveRef.current = setTimeout(() => {
        handleSave();
      }, 5000);
    }
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [isDirty, editorContent, isSaving]);

  // Update section stats
  const updateSectionStats = useCallback((sectionId: string, content: string) => {
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plainText ? plainText.split(/\s+/).length : 0;
    
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          content,
          wordCount,
          isComplete: wordCount >= s.targetWords * 0.8,
          lastModified: new Date()
        };
      }
      return s;
    }));
  }, []);

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setEditorContent(newContent);
    setIsDirty(true);
    updateSectionStats(activeSectionId, newContent);
    
    // Add to history (debounced)
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        return newHistory.slice(-50); // Keep last 50 changes
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, 1000);
  };

  // Handle section change
  const handleSectionChange = (sectionId: string) => {
    if (sectionId === activeSectionId) return;
    
    // Save current section
    updateSectionStats(activeSectionId, editorContent);
    
    // Load new section
    setActiveSectionId(sectionId);
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditorContent(section.content);
      setHistory([section.content]);
      setHistoryIndex(0);
      setIsDirty(false);
    }
  };

  // Save all sections
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    // Update current section
    updateSectionStats(activeSectionId, editorContent);
    
    // Create version snapshot
    const newVersion: Version = {
      id: `v${Date.now()}`,
      timestamp: new Date(),
      author: 'A. Kowalski',
      changes: isDirty ? 'Manual save' : 'Auto-saved',
      content: sections.reduce((acc, s) => ({ 
        ...acc, 
        [s.id]: s.id === activeSectionId ? editorContent : s.content 
      }), {})
    };
    
    setVersions(prev => [newVersion, ...prev].slice(0, 20));
    setIsDirty(false);
    setIsSaving(false);
    
    toast.success('Application saved', { 
      description: `Saved at ${new Date().toLocaleTimeString()}` 
    });
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const content = history[newIndex];
      setEditorContent(content);
      updateSectionStats(activeSectionId, content);
      toast.success('Undo');
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const content = history[newIndex];
      setEditorContent(content);
      updateSectionStats(activeSectionId, content);
      toast.success('Redo');
    }
  };

  // Apply template
  const applyTemplate = (template: Template) => {
    const sectionCount = Object.keys(template.sections).length;
    if (sectionCount === 0) {
      toast.error('This template has no content');
      return;
    }
    
    if (confirm(`Apply template "${template.title}"? This will replace content in ${sectionCount} sections.`)) {
      setSections(prev => prev.map(s => {
        const templateContent = template.sections[s.id];
        if (templateContent) {
          return {
            ...s,
            content: templateContent,
            wordCount: templateContent.split(/\s+/).length,
            isComplete: templateContent.split(/\s+/).length >= s.targetWords * 0.8,
            lastModified: new Date()
          };
        }
        return s;
      }));
      
      // Update current editor content
      const currentTemplateContent = template.sections[activeSectionId];
      if (currentTemplateContent) {
        setEditorContent(currentTemplateContent);
        updateSectionStats(activeSectionId, currentTemplateContent);
      }
      
      setShowTemplates(false);
      toast.success(`Template "${template.title}" applied`);
    }
  };

  // AI Actions
  const handleAIAction = async (action: string) => {
    setIsGenerating(true);
    
    await new Promise(r => setTimeout(r, 1200));
    
    const section = sections.find(s => s.id === activeSectionId);
    const currentWords = section?.wordCount || 0;
    const targetWords = section?.targetWords || 250;
    
    const responses: Record<string, AIMessage> = {
      'Browse Templates': {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: 'I can help you browse templates. Click the "Templates" button in the left sidebar to see available options.',
      },
      'Writing Tips': {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `Tips for ${section?.title}:

1. Be specific and measurable
2. Use active voice
3. Avoid jargon
4. Include concrete numbers
5. Link objectives to EU priorities`,
      },
      'Compliance Check': {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `✓ Compliance Check Results

✓ State aid rules (GBER)
✓ Public procurement regulations
⚠ EU Green Deal alignment needs strengthening
⚠ Consider adding DNSH assessment`,
        suggestion: `This project contributes to the EU Green Deal by reducing CO₂ emissions by 1,200 tonnes annually, supporting the EU's climate neutrality goal for 2050.`,
        actions: ['Add to document', 'Full compliance report']
      },
      'Improve clarity': {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `✓ Clarity Analysis

Current: ${currentWords} words (target: ${targetWords})

Suggestions:
1. Opening could be more direct
2. Break long sentences in paragraph 2
3. Add transition between sections`,
        suggestion: `This project will reduce municipal energy costs by €180,000 annually while cutting CO₂ emissions by 1,200 tonnes per year.`,
        actions: ['Apply suggestion', 'Show more improvements']
      },
      'Add metrics': {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: 'Key metrics for your project:',
        suggestion: `KEY PERFORMANCE INDICATORS:
• Energy reduction: 2,500 MWh/year (40% improvement)
• CO₂ reduction: 1,200 tonnes/year
• Cost savings: €180,000/year
• ROI period: 6.7 years
• Jobs created: 15 direct, 25 indirect`,
        actions: ['Add to document', 'Customize numbers']
      }
    };
    
    const response = responses[action] || {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: 'I can help with this section. What would you like to improve?',
      actions: ['Improve clarity', 'Add metrics', 'Check compliance']
    };
    
    setAiMessages(prev => [...prev, response]);
    setIsGenerating(false);
  };

  // Apply AI suggestion
  const applySuggestion = (suggestion: string) => {
    const newContent = editorContent + '\n\n' + suggestion;
    handleContentChange(newContent);
    toast.success('Suggestion applied');
  };

  // Find and Replace
  const handleFindNext = () => {
    if (!findText || !editorRef.current) return;
    
    const text = editorContent;
    const regex = new RegExp(findText, 'gi');
    const matches = [...text.matchAll(regex)];
    
    if (matches.length > 0) {
      const nextMatch = (currentMatch + 1) % matches.length;
      setCurrentMatch(nextMatch);
      const match = matches[nextMatch];
      
      // Focus and select in textarea
      editorRef.current.focus();
      editorRef.current.setSelectionRange(match.index!, match.index! + findText.length);
    }
  };

  const handleReplace = () => {
    if (!findText) return;
    
    const regex = new RegExp(findText, 'gi');
    const newContent = editorContent.replace(regex, replaceText);
    const count = (editorContent.match(regex) || []).length;
    
    handleContentChange(newContent);
    toast.success(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
    setShowFindReplace(false);
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    
    const regex = new RegExp(findText, 'gi');
    const newContent = editorContent.replace(regex, replaceText);
    const count = (editorContent.match(regex) || []).length;
    
    handleContentChange(newContent);
    toast.success(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
  };

  // Add comment
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: `c${Date.now()}`,
      text: newComment,
      author: 'A. Kowalski',
      timestamp: new Date(),
      resolved: false
    };
    
    setSections(prev => prev.map(s => 
      s.id === activeSectionId 
        ? { ...s, comments: [...s.comments, comment] }
        : s
    ));
    setNewComment('');
    toast.success('Comment added');
  };

  // Export functions
  const exportToPDF = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Generating PDF...',
        success: 'PDF ready for download',
        error: 'Failed to generate PDF'
      }
    );
  };

  const exportToWord = () => {
    const fullText = sections.map(s => `${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    const blob = new Blob([fullText], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grant-application.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Word document exported');
  };

  // Format text helper
  const formatText = (before: string, after: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    
    const newText = editorContent.substring(0, start) + before + selectedText + after + editorContent.substring(end);
    handleContentChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Stats
  const activeSection = sections.find(s => s.id === activeSectionId);
  const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
  const totalTarget = sections.reduce((sum, s) => sum + s.targetWords, 0);
  const completionPercent = Math.min(100, Math.round((totalWords / totalTarget) * 100));
  const completedSections = sections.filter(s => s.isComplete).length;

  return (
    <div className="h-screen flex bg-primary">
      {/* Left Sidebar */}
      <div className="w-80 bg-secondary border-r border-theme flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-theme">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              <span className="text-xs font-medium text-secondary uppercase tracking-wider">Application</span>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <h2 className="text-lg font-semibold text-primary mb-4">KPO Project Description</h2>
          
          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary">Overall Progress</span>
              <span className="text-accent font-medium">{completionPercent}%</span>
            </div>
            <div className="h-2 bg-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>{completedSections}/6 sections</span>
              <span>{totalWords.toLocaleString()} words</span>
            </div>
          </div>
        </div>

        {/* Section List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-secondary uppercase">Sections</span>
            <button 
              onClick={() => setShowTemplates(true)}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Templates
            </button>
          </div>
          
          <div className="space-y-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`
                  w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all
                  ${section.id === activeSectionId 
                    ? 'bg-accent-light border border-accent/30' 
                    : 'bg-surface border border-transparent hover:border-theme'
                  }
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5
                  ${section.isComplete 
                    ? 'bg-green-500/20 text-green-500' 
                    : section.id === activeSectionId
                      ? 'bg-accent/20 text-accent'
                      : 'bg-tertiary text-secondary'
                  }
                `}>
                  {section.isComplete ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${section.id === activeSectionId ? 'text-accent' : 'text-primary'}`}>
                    {section.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${section.wordCount >= section.targetWords * 0.8 ? 'text-green-500' : 'text-secondary'}`}>
                      {section.wordCount}/{section.targetWords}
                    </span>
                    {section.comments.length > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-500">
                        <MessageSquare className="w-3 h-3" />
                        {section.comments.length}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-theme space-y-2">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Now'}
            {isDirty && !isSaving && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setShowVersions(true)}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button 
              onClick={() => setShowExport(true)}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-theme bg-secondary flex-wrap">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <button 
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="toolbar-btn disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="toolbar-btn disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-5 bg-theme mx-1" />
          
          {/* Text Style */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => formatText('**', '**')} className="toolbar-btn" title="Bold">
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('*', '*')} className="toolbar-btn" title="Italic">
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('__', '__')} className="toolbar-btn" title="Underline">
              <Underline className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('~~', '~~')} className="toolbar-btn" title="Strikethrough">
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-5 bg-theme mx-1" />
          
          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => formatText('<!-- align:left -->\n', '\n')} className="toolbar-btn" title="Align Left">
              <AlignLeft className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('<!-- align:center -->\n', '\n')} className="toolbar-btn" title="Align Center">
              <AlignCenter className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('<!-- align:right -->\n', '\n')} className="toolbar-btn" title="Align Right">
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-5 bg-theme mx-1" />
          
          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => formatText('\n• ', '')} className="toolbar-btn" title="Bullet List">
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('\n1. ', '')} className="toolbar-btn" title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-5 bg-theme mx-1" />
          
          {/* Insert */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => formatText('[', '](url)')} className="toolbar-btn" title="Insert Link">
              <Link className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('\n> ', '')} className="toolbar-btn" title="Quote">
              <Quote className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1" />
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowFindReplace(true)}
              className="toolbar-btn"
              title="Find & Replace"
            >
              <Search className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`toolbar-btn ${showComments ? 'bg-accent-light text-accent' : ''}`}
              title="Comments"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`toolbar-btn ${showPreview ? 'bg-accent-light text-accent' : ''}`}
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowAI(!showAI)}
              className={`toolbar-btn ${showAI ? 'bg-accent-light text-accent' : ''}`}
              title="AI Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-primary mb-2">{activeSection?.title}</h1>
                <div className="flex items-start gap-3 p-4 bg-accent-light/50 border border-accent/20 rounded-xl">
                  <Target className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-secondary">{activeSection?.guidance}</p>
                </div>
              </div>

              {/* Editor */}
              {showPreview ? (
                <div className="prose dark:prose-invert max-w-none min-h-[500px] p-6 bg-surface rounded-xl border border-theme">
                  <pre className="whitespace-pre-wrap font-sans text-primary">{editorContent}</pre>
                </div>
              ) : (
                <textarea
                  ref={editorRef}
                  value={editorContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={`Write your ${activeSection?.title.toLowerCase()} here...`}
                  className="w-full min-h-[500px] p-6 bg-surface rounded-xl border border-theme focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none text-primary font-sans leading-relaxed"
                  spellCheck={false}
                />
              )}

              {/* Word Count */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-secondary">Word count</span>
                  <span className={`font-medium ${activeSection && activeSection.wordCount >= activeSection.targetWords * 0.8 ? 'text-green-500' : 'text-secondary'}`}>
                    {activeSection?.wordCount || 0} / {activeSection?.targetWords} words
                    {activeSection && activeSection.wordCount >= activeSection.targetWords * 0.8 && ' ✓'}
                  </span>
                </div>
                <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeSection && activeSection.wordCount >= activeSection.targetWords * 0.8 
                        ? 'bg-green-500' 
                        : 'bg-accent'
                    }`}
                    style={{ width: `${Math.min(100, ((activeSection?.wordCount || 0) / (activeSection?.targetWords || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comments Panel */}
          {showComments && (
            <div className="w-80 bg-secondary border-l border-theme flex flex-col">
              <div className="p-4 border-b border-theme">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comments
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {activeSection?.comments.length === 0 ? (
                  <p className="text-secondary text-sm text-center py-8">No comments yet</p>
                ) : (
                  <div className="space-y-3">
                    {activeSection?.comments.map(comment => (
                      <div 
                        key={comment.id} 
                        className={`p-3 rounded-lg ${comment.resolved ? 'bg-green-500/10 opacity-50' : 'bg-surface border border-theme'}`}
                      >
                        <p className="text-sm text-primary">{comment.text}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-secondary">{comment.author}</span>
                          <button 
                            onClick={() => {
                              setSections(prev => prev.map(s => 
                                s.id === activeSectionId 
                                  ? { ...s, comments: s.comments.map(c => c.id === comment.id ? { ...c, resolved: !c.resolved } : c) }
                                  : s
                              ));
                            }}
                            className="text-xs text-accent hover:underline"
                          >
                            {comment.resolved ? 'Unresolve' : 'Resolve'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-theme">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full input text-sm mb-2 resize-none h-20"
                />
                <button 
                  onClick={handleAddComment}
                  className="w-full btn-primary text-sm"
                >
                  Add Comment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Panel */}
      {showAI && (
        <div className="w-96 bg-secondary border-l border-theme flex flex-col">
          <div className="p-4 border-b border-theme">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">AI Assistant</h3>
                <p className="text-xs text-secondary">GPT-4 Powered</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.map((msg) => (
              <div key={msg.id} className={msg.type === 'user' ? 'flex justify-end' : ''}>
                <div className={`max-w-[90%] p-3 rounded-xl text-sm ${
                  msg.type === 'ai' 
                    ? 'bg-surface border border-theme' 
                    : 'bg-accent text-white'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                  
                  {msg.suggestion && (
                    <div className="mt-3 p-2 bg-primary rounded-lg border border-theme">
                      <p className="text-xs text-secondary mb-2">Suggested:</p>
                      <p className="text-xs text-primary line-clamp-3">{msg.suggestion}</p>
                      <button 
                        onClick={() => applySuggestion(msg.suggestion!)}
                        className="mt-2 w-full py-1.5 bg-accent text-white text-xs rounded-lg hover:bg-accent-hover"
                      >
                        Apply to Document
                      </button>
                    </div>
                  )}
                  
                  {msg.actions && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.actions.map(action => (
                        <button
                          key={action}
                          onClick={() => handleAIAction(action)}
                          disabled={isGenerating}
                          className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-lg hover:bg-accent/30 disabled:opacity-50"
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
              <div className="flex items-center gap-2 text-secondary text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200" />
                </div>
                Thinking...
              </div>
            )}
          </div>

          <div className="p-4 border-t border-theme">
            <div className="flex flex-wrap gap-2 mb-3">
              {['Improve clarity', 'Add metrics', 'Check compliance'].map(action => (
                <button
                  key={action}
                  onClick={() => handleAIAction(action)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-surface text-secondary text-xs rounded-lg border border-theme hover:text-primary disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAIAction(aiInput)}
                placeholder="Ask AI..."
                className="flex-1 input text-sm"
              />
              <button 
                onClick={() => handleAIAction(aiInput)}
                disabled={!aiInput.trim() || isGenerating}
                className="p-2 bg-accent text-white rounded-xl disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-theme">
              <h2 className="text-xl font-semibold text-primary">Choose Template</h2>
              <button onClick={() => setShowTemplates(false)} className="p-2 hover:bg-surface rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="p-4 bg-surface border border-theme rounded-xl text-left hover:border-accent transition-colors"
                  >
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                      {template.category}
                    </span>
                    <h3 className="font-semibold text-primary mt-2">{template.title}</h3>
                    <p className="text-sm text-secondary mt-1">{template.description}</p>
                    <p className="text-xs text-muted mt-2 line-clamp-2">{template.preview}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Versions Modal */}
      {showVersions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-theme">
              <h2 className="text-xl font-semibold text-primary">Version History</h2>
              <button onClick={() => setShowVersions(false)} className="p-2 hover:bg-surface rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {versions.length === 0 ? (
                <p className="text-secondary text-center py-8">No saved versions yet</p>
              ) : (
                <div className="space-y-3">
                  {versions.map((version, i) => (
                    <div key={version.id} className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-theme">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <History className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary">
                          {i === 0 ? 'Current version' : `Version ${versions.length - i}`}
                        </p>
                        <p className="text-sm text-secondary">
                          {version.timestamp.toLocaleString()} by {version.author}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm('Restore this version? Current changes will be lost.')) {
                            Object.entries(version.content).forEach(([sectionId, content]) => {
                              if (sectionId === activeSectionId) {
                                handleContentChange(content);
                              }
                            });
                            setSections(prev => prev.map(s => {
                              const versionContent = version.content[s.id];
                              if (versionContent) {
                                return {
                                  ...s,
                                  content: versionContent,
                                  wordCount: versionContent.split(/\s+/).filter(w => w.length > 0).length,
                                  isComplete: versionContent.split(/\s+/).filter(w => w.length > 0).length >= s.targetWords * 0.8
                                };
                              }
                              return s;
                            }));
                            setShowVersions(false);
                            toast.success('Version restored');
                          }
                        }}
                        className="text-accent text-sm hover:underline"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Find & Replace Modal */}
      {showFindReplace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Find & Replace</h2>
              <button onClick={() => setShowFindReplace(false)} className="p-2 hover:bg-surface rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-secondary mb-2 block">Find</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    className="flex-1 input"
                    placeholder="Search text..."
                  />
                  <button onClick={handleFindNext} className="btn-secondary">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-secondary mb-2 block">Replace with</label>
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="w-full input"
                  placeholder="Replacement text..."
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleReplace}
                  className="flex-1 btn-primary"
                >
                  Replace
                </button>
                <button 
                  onClick={handleReplaceAll}
                  className="flex-1 btn-secondary"
                >
                  Replace All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Export Application</h2>
              <button onClick={() => setShowExport(false)} className="p-2 hover:bg-surface rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { exportToPDF(); setShowExport(false); }}
                className="p-6 bg-surface border border-theme rounded-xl hover:border-accent transition-colors text-center"
              >
                <FileDown className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="font-medium text-primary">Export as PDF</p>
                <p className="text-xs text-secondary mt-1">Best for submission</p>
              </button>
              <button 
                onClick={() => { exportToWord(); setShowExport(false); }}
                className="p-6 bg-surface border border-theme rounded-xl hover:border-accent transition-colors text-center"
              >
                <FileUp className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="font-medium text-primary">Export as Word</p>
                <p className="text-xs text-secondary mt-1">Editable format</p>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .toolbar-btn {
          padding: 0.375rem;
          border-radius: 0.375rem;
          color: var(--color-text-secondary);
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .toolbar-btn:hover {
          background-color: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        .toolbar-btn.disabled\:opacity-30:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
