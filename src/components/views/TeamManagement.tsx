import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { 
  Users, 
  Plus, 
  Mail, 
  Shield,
  User,
  CheckCircle2,
  Clock,
  X,
  Search,
  Filter,
  Crown,
  Edit2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  department: string;
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  joinedAt: string;
  grants: number;
}

const mockTeam: TeamMember[] = [
  { id: '1', name: 'A. Kowalski', email: 'a.kowalski@krakow.pl', role: 'admin', department: 'Municipal Development', status: 'active', joinedAt: '2025-01-15', grants: 5 },
  { id: '2', name: 'M. Nowak', email: 'm.nowak@krakow.pl', role: 'manager', department: 'Finance', status: 'active', joinedAt: '2025-02-01', grants: 3 },
  { id: '3', name: 'L. Schmidt', email: 'l.schmidt@krakow.pl', role: 'member', department: 'Legal', status: 'active', joinedAt: '2025-03-10', grants: 2 },
  { id: '4', name: 'J. Rossi', email: 'j.rossi@krakow.pl', role: 'member', department: 'Technical', status: 'pending', joinedAt: '2026-03-25', grants: 0 },
  { id: '5', name: 'P. Andersen', email: 'p.andersen@krakow.pl', role: 'member', department: 'Planning', status: 'active', joinedAt: '2025-06-01', grants: 1 },
];

const roleConfig = {
  admin: { label: 'Administrator', color: 'text-[#4F46E5]', bgColor: 'bg-[#4F46E5]/15', icon: Crown },
  manager: { label: 'Manager', color: 'text-[#22C55E]', bgColor: 'bg-[#22C55E]/15', icon: Shield },
  member: { label: 'Member', color: 'text-[#A9B3D0]', bgColor: 'bg-[#161F32]', icon: User },
};

export function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('member');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<TeamMember['role']>('member');

  useEffect(() => {
    gsap.fromTo('.team-row',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
    );
  }, [team]);

  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      department: 'Pending Assignment',
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0],
      grants: 0,
    };
    
    setTeam([...team, newMember]);
    setShowInviteModal(false);
    setInviteEmail('');
    toast.success('Invitation sent successfully');
  };

  const handleRemove = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
    toast.success('Team member removed');
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditDepartment(member.department);
    setEditRole(member.role);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingMember) {
      setTeam(team.map(m => 
        m.id === editingMember.id 
          ? { ...m, name: editName, department: editDepartment, role: editRole }
          : m
      ));
      setShowEditModal(false);
      setEditingMember(null);
      toast.success('Team member updated');
    }
  };

  const activeCount = team.filter(m => m.status === 'active').length;
  const pendingCount = team.filter(m => m.status === 'pending').length;

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#F3F6FF]">Team Management</h1>
              <p className="text-[#A9B3D0]">Manage your grant team members and permissions</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#4F46E5]/15 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <div>
              <p className="text-[#A9B3D0] text-sm">Total Members</p>
              <p className="text-[#F3F6FF] text-2xl font-semibold">{team.length}</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#22C55E]/15 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-[#A9B3D0] text-sm">Active</p>
              <p className="text-[#F3F6FF] text-2xl font-semibold">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F59E0B]/15 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-[#A9B3D0] text-sm">Pending</p>
              <p className="text-[#F3F6FF] text-2xl font-semibold">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="card-dark p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#8B5CF6]/15 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-[#A9B3D0] text-sm">Admins</p>
              <p className="text-[#F3F6FF] text-2xl font-semibold">{team.filter(m => m.role === 'admin').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3D0]" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161F32] border border-[#273155] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F3F6FF] placeholder:text-[#A9B3D0]/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Team Table */}
      <div className="card-dark overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#161F32] border-b border-[#273155]">
              <th className="text-left text-[#A9B3D0] text-xs font-medium uppercase tracking-wider px-5 py-4">Member</th>
              <th className="text-left text-[#A9B3D0] text-xs font-medium uppercase tracking-wider px-5 py-4">Role</th>
              <th className="text-left text-[#A9B3D0] text-xs font-medium uppercase tracking-wider px-5 py-4">Department</th>
              <th className="text-left text-[#A9B3D0] text-xs font-medium uppercase tracking-wider px-5 py-4">Status</th>
              <th className="text-left text-[#A9B3D0] text-xs font-medium uppercase tracking-wider px-5 py-4">Grants</th>
              <th className="text-right text-[#A9B3D0] text-xs font-medium uppercase tracking-wider px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeam.map((member, index) => {
              const role = roleConfig[member.role];
              const RoleIcon = role.icon;
              return (
                <tr 
                  key={member.id} 
                  className={`team-row border-b border-[#273155]/50 hover:bg-[#161F32]/50 transition-colors ${index % 2 === 1 ? 'bg-[#161F32]/20' : ''}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-[#F3F6FF] font-medium">{member.name}</p>
                        <p className="text-[#A9B3D0] text-sm">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${role.bgColor} ${role.color}`}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      {role.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[#F3F6FF] text-sm">{member.department}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active' ? 'bg-[#22C55E]/15 text-[#22C55E]' :
                      member.status === 'pending' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                      'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        member.status === 'active' ? 'bg-[#22C55E]' :
                        member.status === 'pending' ? 'bg-[#F59E0B]' :
                        'bg-[#EF4444]'
                      }`} />
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[#F3F6FF] text-sm font-medium">{member.grants}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(member)}
                        className="p-2 text-[#A9B3D0] hover:text-[#F3F6FF] hover:bg-[#161F32] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRemove(member.id)}
                        className="p-2 text-[#A9B3D0] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTeam.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-[#A9B3D0]">No team members found</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111827] border border-[#273155] rounded-2xl p-6 w-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#F3F6FF]">Invite Team Member</h2>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-[#A9B3D0] hover:text-[#F3F6FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[#A9B3D0] text-sm mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3D0]" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full bg-[#161F32] border border-[#273155] rounded-xl pl-9 pr-4 py-3 text-[#F3F6FF] placeholder:text-[#A9B3D0]/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#A9B3D0] text-sm mb-2 block">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                  className="w-full bg-[#161F32] border border-[#273155] rounded-xl px-4 py-3 text-[#F3F6FF] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                >
                  <option value="member">Member - Can view and edit assigned grants</option>
                  <option value="manager">Manager - Can manage grants and team members</option>
                  <option value="admin">Administrator - Full access to all features</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleInvite}
                className="flex-1 btn-primary"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111827] border border-[#273155] rounded-2xl p-6 w-[450px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#F3F6FF]">Edit Team Member</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-[#A9B3D0] hover:text-[#F3F6FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[#A9B3D0] text-sm mb-2 block">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-[#161F32] border border-[#273155] rounded-xl px-4 py-3 text-[#F3F6FF] placeholder:text-[#A9B3D0]/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                />
              </div>
              <div>
                <label className="text-[#A9B3D0] text-sm mb-2 block">Department</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="e.g., Finance, Legal"
                  className="w-full bg-[#161F32] border border-[#273155] rounded-xl px-4 py-3 text-[#F3F6FF] placeholder:text-[#A9B3D0]/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                />
              </div>
              <div>
                <label className="text-[#A9B3D0] text-sm mb-2 block">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as TeamMember['role'])}
                  className="w-full bg-[#161F32] border border-[#273155] rounded-xl px-4 py-3 text-[#F3F6FF] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                >
                  <option value="member">Member - Can view and edit assigned grants</option>
                  <option value="manager">Manager - Can manage grants and team members</option>
                  <option value="admin">Administrator - Full access to all features</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
