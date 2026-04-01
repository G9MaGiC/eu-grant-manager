import { useEffect, useRef, useState, useCallback } from 'react';
// import { gsap } from 'gsap';
import { 
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered,
  Link, Table, Quote,
  Save, Download, FileText, Eye,
  Sparkles, Send, Check, X,
  Search,
  History, MessageSquare, Zap,
  Target,
  FileDown, FileUp
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
  selection?: { start: number; end: number };
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
  sectionId?: string;
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
    }
  },
  {
    id: 'cef-transport',
    title: 'CEF Transport Corridor',
    description: 'Template for transport infrastructure projects under CEF',
    category: 'CEF',
    preview: 'Regional transport infrastructure improvements...',
    sections: {}
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

export function ApplicationBuilder() {
  // Core State
  const [sections, setSections] = useState<Section[]>(createInitialSections());
  const [activeSectionId, setActiveSectionId] = useState('s1');
  const [editorContent, setEditorContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  
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
  const [findMatches, setFindMatches] = useState(0);
  
  // Comments
  const [newComment, setNewComment] = useState('');
  
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      type: 'ai',
      content: `👋 Welcome to the enhanced Application Builder!

I can help you:
• Write and edit grant sections
• Check compliance with EU requirements
• Improve clarity and impact
• Suggest metrics and KPIs

Start by selecting a template or begin writing.`,
      actions: ['Browse Templates', 'Writing Tips', 'Compliance Check']
    };
    setAiMessages([welcomeMessage]);
    
    // Load initial section content
    const initialSection = sections.find(s => s.id === 's1');
    if (initialSection) {
      setEditorContent(initialSection.content);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (isDirty) {
      autoSaveRef.current = setTimeout(() => {
        handleSave();
      }, 3000);
    }
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [isDirty, editorContent]);

  // Update section content
  const updateSection = useCallback((sectionId: string, content: string) => {
    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    
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
    setIsDirty(true);
  }, []);

  // Handle section change
  const handleSectionChange = (sectionId: string) => {
    // Save current section
    updateSection(activeSectionId, editorContent);
    
    // Load new section
    setActiveSectionId(sectionId);
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditorContent(section.content);
      setIsDirty(false);
    }
  };

  // Save all sections
  const handleSave = () => {
    updateSection(activeSectionId, editorContent);
    
    // Create version snapshot
    const newVersion: Version = {
      id: `v${Date.now()}`,
      timestamp: new Date(),
      author: 'A. Kowalski',
      changes: 'Auto-saved changes',
      content: sections.reduce((acc, s) => ({ ...acc, [s.id]: s.content }), {})
    };
    setVersions(prev => [newVersion, ...prev].slice(0, 20)); // Keep last 20 versions
    
    setIsDirty(false);
    toast.success('Application saved', { description: 'All changes have been saved' });
  };

  // Apply template
  const applyTemplate = (template: Template) => {
    if (confirm('This will replace current content. Continue?')) {
      setSections(prev => prev.map(s => ({
        ...s,
        content: template.sections[s.id] || s.content,
        lastModified: new Date()
      })));
      
      const currentSection = sections.find(s => s.id === activeSectionId);
      if (currentSection && template.sections[activeSectionId]) {
        setEditorContent(template.sections[activeSectionId]);
      }
      
      setShowTemplates(false);
      toast.success(`Template "${template.title}" applied`);
    }
  };

  // AI Actions
  const handleAIAction = async (action: string) => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(r => setTimeout(r, 1500));
    
    const section = sections.find(s => s.id === activeSectionId);
    const responses: Record<string, AIMessage> = {
      'Improve clarity': {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `✓ Clarity Analysis for "${section?.title}"

I found 3 areas to improve:
1. Opening paragraph could be more direct
2. Consider breaking the long sentence in paragraph 2
3. Add transition between sections 2 and 3`,
        suggestion: `This project will reduce municipal energy consumption by 40%, saving €180,000 annually while cutting CO₂ emissions by 1,200 tonnes per year.`,
        actions: ['Apply suggestion', 'Show all improvements', 'Dismiss']
      },
      'Add metrics': {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: 'Here are suggested metrics for your project:',
        suggestion: `KEY PERFORMANCE INDICATORS:
• Energy reduction: 2,500 MWh/year (40% improvement)
• CO₂ reduction: 1,200 tonnes/year
• Cost savings: €180,000/year
• ROI period: 6.7 years`,
        actions: ['Add to document', 'Customize', 'More KPIs']
      },
      'Check compliance': {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `✓ Compliance Check Results

✓ State aid rules (GBER)
✓ Public procurement regulations
✓ Environmental impact assessment
⚠ Consider adding: EU Green Deal alignment statement`,
        actions: ['Add alignment text', 'Full report', 'Dismiss']
      }
    };
    
    const response = responses[action] || {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: 'I can help you with this section. What specific aspect would you like to improve?',
      actions: ['Improve clarity', 'Add metrics', 'Check compliance']
    };
    
    setAiMessages(prev => [...prev, response]);
    setIsGenerating(false);
  };

  // Apply AI suggestion
  const applySuggestion = (suggestion: string) => {
    const newContent = editorContent + '\n\n' + suggestion;
    setEditorContent(newContent);
    updateSection(activeSectionId, newContent);
    toast.success('Suggestion applied');
  };

  // Find and Replace
  const handleFindReplace = (replace: boolean) => {
    if (!findText) return;
    
    let count = 0;
    let newContent = editorContent;
    
    if (replace && replaceText !== undefined) {
      const regex = new RegExp(findText, 'gi');
      newContent = editorContent.replace(regex, () => {
        count++;
        return replaceText;
      });
      setEditorContent(newContent);
      updateSection(activeSectionId, newContent);
      toast.success(`Replaced ${count} occurrences`);
    } else {
      const regex = new RegExp(findText, 'gi');
      const matches = editorContent.match(regex);
      setFindMatches(matches?.length || 0);
    }
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
    toast.success('Generating PDF...', { description: 'Download will start shortly' });
    // In real implementation, use a PDF library
  };

  const exportToWord = () => {
    const fullText = sections.map(s => `${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    const blob = new Blob([fullText], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grant-application.doc';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Word document exported');
  };

  // Editor toolbar actions
  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  // Stats
  const activeSection = sections.find(s => s.id === activeSectionId);
  const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
  const totalTarget = sections.reduce((sum, s) => sum + s.targetWords, 0);
  const completionPercent = Math.round((totalWords / totalTarget) * 100);
  const completedSections = sections.filter(s => s.isComplete).length;

  return (
    <div ref={containerRef} className="h-screen flex bg-primary">
      {/* Left Sidebar - Navigation */}
      <div className="w-80 bg-secondary border-r border-theme flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-theme">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-accent" />
            <span className="text-xs font-medium text-secondary uppercase tracking-wider">Application</span>
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
                      {section.wordCount}/{section.targetWords} words
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
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Now
            {isDirty && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
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
        <div className="flex items-center gap-1 p-3 border-b border-theme bg-secondary flex-wrap">
          {/* Text Style */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => execCommand('bold')} className="toolbar-btn" title="Bold (Ctrl+B)">
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => execCommand('italic')} className="toolbar-btn" title="Italic (Ctrl+I)">
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => execCommand('underline')} className="toolbar-btn" title="Underline">
              <Underline className="w-4 h-4" />
            </button>
            <button onClick={() => execCommand('strikeThrough')} className="toolbar-btn" title="Strikethrough">
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-5 bg-theme mx-2" />
          
          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => execCommand('justifyLeft')} className="toolbar-btn" title="Align Left">
              <AlignLeft className="w-4 h-4" />
            </button>
            <button onClick={() => execCommand('justifyCenter')} className="toolbar-btn" title="Align Center">
              <AlignCenter className="w-4 h-4" />
            </button>
            <button onClick={() => execCommand('justifyRight')} className="toolbar-btn" title="Align Right">
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-5 bg-theme mx-2" />
          
          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => execCommand('insertUnorderedList')} className="toolbar-btn" title="Bullet List">
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => execCommand('insertOrderedList')} className="toolbar-btn" title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-5 bg-theme mx-2" />
          
          {/* Insert */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => execCommand('createLink')} className="toolbar-btn" title="Insert Link">
              <Link className="w-4 h-4" />
            </button>
            <button className="toolbar-btn" title="Insert Table">
              <Table className="w-4 h-4" />
            </button>
            <button onClick={() => execCommand('formatBlock', 'blockquote')} className="toolbar-btn" title="Quote">
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
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8">
              {/* Section Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-primary mb-2">{activeSection?.title}</h1>
                
                {/* Guidance */}
                <div className="flex items-start gap-3 p-4 bg-accent-light/50 border border-accent/20 rounded-xl">
                  <Target className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-secondary">{activeSection?.guidance}</p>
                </div>
              </div>

              {/* Editor */}
              {showPreview ? (
                <div 
                  className="editor-content prose prose-invert max-w-none min-h-[500px] p-6 bg-surface rounded-xl border border-theme"
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  className="editor-content min-h-[500px] p-6 bg-surface rounded-xl border border-theme focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  onInput={(e) => {
                    setEditorContent(e.currentTarget.innerHTML);
                    setIsDirty(true);
                  }}
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                  data-placeholder={`Write your ${activeSection?.title.toLowerCase()} here...`}
                />
              )}

              {/* Word Count Goal */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-secondary">Word count goal</span>
                    <span className={`font-medium ${activeSection && activeSection.wordCount >= activeSection.targetWords * 0.8 ? 'text-green-500' : 'text-secondary'}`}>
                      {activeSection?.wordCount || 0} / {activeSection?.targetWords} words
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

      {/* AI Assistant Panel */}
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
                placeholder="Ask AI for help..."
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
                      <button className="text-accent text-sm hover:underline">
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
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="w-full input"
                  placeholder="Search text..."
                />
                {findMatches > 0 && (
                  <p className="text-xs text-secondary mt-1">{findMatches} matches found</p>
                )}
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
                  onClick={() => handleFindReplace(false)}
                  className="flex-1 btn-secondary"
                >
                  Find All
                </button>
                <button 
                  onClick={() => handleFindReplace(true)}
                  className="flex-1 btn-primary"
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
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: var(--color-text-secondary);
          transition: all 0.15s;
        }
        .toolbar-btn:hover {
          background-color: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: var(--color-text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
