import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  ArrowLeft, 
  Calendar, 
  Euro, 
  CheckCircle2, 
  FileText, 
  Download, 
  Upload,
  User,
  UserPlus,
  Send,
  Edit3,
  MoreVertical,
  Flag,
  Clock,
  Check,
  X,
  Link as LinkIcon,
  ExternalLink,
  Paperclip,
  History,
  Share2,
  Star,
  Plus,
  Loader2
} from 'lucide-react';
import { useGrant } from '@/hooks/useGrant';
import { useParams, useNavigate } from 'react-router-dom';
import type { Task, Note } from '@/types';
import { toast } from 'sonner';

export function GrantDetail() {
  const { grantId } = useParams();
  const navigate = useNavigate();
  const { grant, loading } = useGrant(grantId || null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<Task[]>(grant?.tasks || []);
  const [notes, setNotes] = useState<Note[]>(grant?.notes || []);
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'history'>('overview');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: grant?.owner.name || 'A. Kowalski', role: 'Lead', email: 'a.kowalski@krakow.pl', status: 'active' },
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Member');

  useEffect(() => {
    setTasks(grant?.tasks || []);
    setNotes(grant?.notes || []);
  }, [grant]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftPanelRef.current) {
        gsap.fromTo(leftPanelRef.current,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
      if (rightPanelRef.current) {
        gsap.fromTo(rightPanelRef.current,
          { opacity: 0, x: 16 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [grantId]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast.success(task.completed ? 'Task marked incomplete' : 'Task completed!');
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: `t${Date.now()}`,
        title: newTask,
        completed: false,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      setTasks([...tasks, task]);
      setNewTask('');
      toast.success('Task added');
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    toast.success('Task deleted');
  };

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: `n${Date.now()}`,
        content: newNote,
        createdAt: new Date().toISOString().split('T')[0],
        author: 'A. Kowalski',
      };
      setNotes([note, ...notes]);
      setNewNote('');
      toast.success('Note added');
    }
  };

  const handleUpload = () => {
    setShowUploadModal(false);
    toast.success('Document uploaded successfully');
  };

  const handleShare = () => {
    toast.success('Grant link copied to clipboard');
  };

  const addTeamMember = () => {
    if (newMemberEmail.trim()) {
      // Format email prefix into readable name
      const emailPrefix = newMemberEmail.split('@')[0];
      const formattedName = emailPrefix
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
      
      const newMember = {
        id: `tm${Date.now()}`,
        name: formattedName,
        role: newMemberRole,
        email: newMemberEmail,
        status: 'pending'
      };
      setTeamMembers([...teamMembers, newMember]);
      setNewMemberEmail('');
      setShowTeamModal(false);
      toast.success(`Invitation sent to ${newMemberEmail}`);
    }
  };

  const removeTeamMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    toast.success('Team member removed');
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string; icon: React.ElementType }> = {
      'not-started': { label: 'Not started', className: 'bg-tertiary text-secondary', icon: Clock },
      'in-progress': { label: 'In progress', className: 'bg-accent/15 text-accent', icon: Edit3 },
      'submitted': { label: 'Submitted', className: 'bg-[#F59E0B]/15 text-[#F59E0B]', icon: CheckCircle2 },
      'won': { label: 'Won', className: 'bg-[#22C55E]/15 text-[#22C55E]', icon: Star },
    };
    const config = configs[status] || configs['not-started'];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.className}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  if (loading) {
    return (
      <div className="p-7 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-secondary">Loading grant...</p>
        </div>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="p-7">
        <p className="text-secondary">Grant not found.</p>
        <button 
          onClick={() => navigate('/pipeline')}
          className="btn-primary mt-4"
        >
          Back to Pipeline
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-7">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={() => navigate('/pipeline')}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Pipeline</span>
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
            aria-label="Share grant"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div ref={leftPanelRef} className="lg:col-span-7 space-y-5">
          {/* Header Card */}
          <div className="card-dark p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                    grant.program === 'KPO' ? 'bg-accent/15 text-accent' :
                    grant.program === 'FEnIKS' ? 'bg-[#22C55E]/15 text-[#22C55E]' :
                    grant.program === 'CEF' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                    'bg-[#8B5CF6]/15 text-[#8B5CF6]'
                  }`}>
                    {grant.program}
                  </span>
                  {getStatusBadge(grant.status)}
                </div>
                <h1 className="text-2xl font-semibold text-primary">{grant.name}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/builder')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Application
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-tertiary rounded-xl">
                <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline</span>
                </div>
                <p className="text-primary font-medium mono">{grant.deadline}</p>
              </div>
              <div className="p-3 bg-tertiary rounded-xl">
                <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                  <Euro className="w-4 h-4" />
                  <span>Value</span>
                </div>
                <p className="text-primary font-medium mono">
                  {new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(grant.estimatedValue)}
                </p>
              </div>
              <div className="p-3 bg-tertiary rounded-xl">
                <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                  <Flag className="w-4 h-4" />
                  <span>Fit score</span>
                </div>
                <p className="text-accent font-medium">{grant.fitScore}%</p>
              </div>
            </div>

            <p className="text-secondary leading-relaxed">{grant.description}</p>

            {/* Progress Bar */}
            <div className="mt-5 pt-5 border-t border-theme">
              <div className="flex items-center justify-between mb-2">
                <span className="text-secondary text-sm">Task completion</span>
                <span className="text-primary text-sm font-medium">{completedTasks}/{tasks.length}</span>
              </div>
              <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-tertiary rounded-xl w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'documents', label: 'Documents', icon: Paperclip },
              { id: 'history', label: 'History', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent text-white'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* Tasks */}
              <div className="card-dark p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary">Tasks</h2>
                  <span className="text-secondary text-sm">
                    {completedTasks}/{tasks.length} completed
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`flex items-center gap-3 p-3 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors group ${task.completed ? 'opacity-60' : ''}`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.completed 
                            ? 'bg-accent border-[#4F46E5]' 
                            : 'border-theme hover:border-accent'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                      <span className={`flex-1 ${task.completed ? 'text-secondary line-through' : 'text-primary'}`}>
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <span className="text-secondary text-sm mono">{task.dueDate}</span>
                      )}
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-secondary hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add a new task..."
                    className="flex-1 bg-tertiary border border-theme rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                  />
                  <button 
                    onClick={addTask}
                    disabled={!newTask.trim()}
                    className="px-4 py-2.5 bg-accent hover:bg-[#4338CA] disabled:opacity-50 rounded-xl text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Documents */}
              <div className="card-dark p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary">Documents</h2>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>
                <div className="space-y-2">
                  {grant.documents?.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center gap-3 p-3 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors group"
                    >
                      <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-primary font-medium truncate">{doc.name}</p>
                        <p className="text-secondary text-sm">{doc.size} • {doc.uploadedAt}</p>
                      </div>
                      <button 
                        onClick={() => toast.success(`Downloading ${doc.name}...`)}
                        className="p-2 text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'documents' && (
            <div className="card-dark p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary">All Documents</h2>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload New
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {grant.documents?.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-4 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-primary font-medium truncate">{doc.name}</p>
                        <p className="text-secondary text-sm">{doc.size}</p>
                        <p className="text-secondary text-xs mt-1">Uploaded {doc.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => toast.success(`Opening ${doc.name}...`)}
                        className="flex-1 py-2 bg-[#0B0F1C] hover:bg-tertiary rounded-lg text-secondary hover:text-primary text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </button>
                      <button 
                        onClick={() => toast.success(`Downloading ${doc.name}...`)}
                        className="flex-1 py-2 bg-[#0B0F1C] hover:bg-tertiary rounded-lg text-secondary hover:text-primary text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card-dark p-5">
              <h2 className="text-lg font-semibold text-primary mb-4">Activity History</h2>
              <div className="space-y-4">
                {[
                  { action: 'Grant created', date: '2026-02-15', user: 'A. Kowalski' },
                  { action: 'Document uploaded: Eligibility_Checklist.pdf', date: '2026-03-01', user: 'A. Kowalski' },
                  { action: 'Task completed: Prepare eligibility docs', date: '2026-03-05', user: 'A. Kowalski' },
                  { action: 'Status changed to In Progress', date: '2026-03-08', user: 'A. Kowalski' },
                  { action: 'Document uploaded: Budget_Template.xlsx', date: '2026-03-10', user: 'M. Nowak' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                    <div className="flex-1 pb-4 border-b border-theme/50">
                      <p className="text-primary">{item.action}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-secondary text-sm">{item.date}</span>
                        <span className="text-muted">•</span>
                        <span className="text-secondary text-sm">{item.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div ref={rightPanelRef} className="lg:col-span-5 space-y-5">
          {/* Timeline */}
          <div className="card-dark p-5">
            <h2 className="text-lg font-semibold text-primary mb-4">Timeline</h2>
            <div className="space-y-0">
              {grant.timeline?.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      event.type === 'deadline' ? 'bg-[#EF4444]' : 
                      event.type === 'milestone' ? 'bg-[#22C55E]' : 'bg-accent'
                    }`} />
                    {index < (grant.timeline?.length || 0) - 1 && (
                      <div className="w-0.5 h-full bg-border-strong my-1" />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className="text-primary font-medium">{event.title}</p>
                    <p className="text-secondary text-sm mono">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card-dark p-5">
            <h2 className="text-lg font-semibold text-primary mb-4">Notes</h2>
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 bg-tertiary border border-theme rounded-xl px-4 py-3 text-sm text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50 resize-none h-20"
                />
                <button 
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="p-3 bg-accent hover:bg-[#4338CA] disabled:opacity-50 rounded-xl text-white transition-colors self-end"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
              {notes.length === 0 ? (
                <p className="text-secondary text-sm text-center py-4">No notes yet.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-3 bg-tertiary rounded-xl">
                    <p className="text-primary text-sm">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-secondary text-xs">{note.author}</span>
                      <span className="text-muted">•</span>
                      <span className="text-secondary text-xs mono">{note.createdAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team */}
          <div className="card-dark p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Team</h2>
              <button 
                onClick={() => setShowTeamModal(true)}
                className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-tertiary rounded-xl">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center border border-[#4F46E5]/30">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-primary text-sm font-medium">{member.name}</p>
                    <p className="text-secondary text-xs">{member.role} • {member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      member.status === 'active' ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                    }`}>
                      {member.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                    {member.id !== '1' && (
                      <button 
                        onClick={() => removeTeamMember(member.id)}
                        className="p-1 text-secondary hover:text-[#EF4444] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="card-dark p-5">
            <h2 className="text-lg font-semibold text-primary mb-4">Quick Links</h2>
            <div className="space-y-2">
              {[
                { label: 'Program Guidelines', url: '#' },
                { label: 'Submission Portal', url: '#' },
                { label: 'Template Library', url: '#' },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info(`Opening ${link.label}...`);
                  }}
                  className="flex items-center justify-between p-3 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-4 h-4 text-secondary" />
                    <span className="text-primary text-sm">{link.label}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary border border-theme rounded-2xl p-6 w-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Upload Document</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div 
              className="border-2 border-dashed border-theme rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
              onClick={handleUpload}
            >
              <Upload className="w-12 h-12 text-secondary mx-auto mb-4" />
              <p className="text-primary font-medium mb-1">Click to upload</p>
              <p className="text-secondary text-sm">or drag and drop</p>
              <p className="text-secondary text-xs mt-2">PDF, Word, Excel up to 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary border border-theme rounded-2xl p-6 w-[450px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Add Team Member</h2>
              <button 
                onClick={() => setShowTeamModal(false)}
                className="text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-secondary text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="colleague@krakow.pl"
                  className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                />
              </div>
              <div>
                <label className="block text-secondary text-sm mb-2">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                >
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Reviewer">Reviewer</option>
                </select>
              </div>
              <button
                onClick={addTeamMember}
                disabled={!newMemberEmail.trim()}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
