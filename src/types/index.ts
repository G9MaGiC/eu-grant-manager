export type GrantStatus = 'not-started' | 'in-progress' | 'submitted' | 'won' | 'archived';

export type GrantProgram = 'KPO' | 'FEnIKS' | 'CEF' | 'Horizon' | 'ERDF';

export interface Grant {
  id: string;
  name: string;
  program: GrantProgram;
  deadline: string;
  status: GrantStatus;
  estimatedValue: number;
  fitScore: number;
  owner: {
    name: string;
    avatar?: string;
  };
  description?: string;
  tasks?: Task[];
  documents?: Document[];
  notes?: Note[];
  timeline?: TimelineEvent[];
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type: 'milestone' | 'deadline' | 'review';
}

export interface Submission {
  id: string;
  grantName: string;
  submittedAt: string;
  format: 'PDF' | 'Word' | 'CSV';
  grantId: string;
}

export interface DashboardStats {
  activeGrants: number;
  fundingPipeline: number;
  submissionsThisMonth: number;
}

export interface UpcomingDeadline {
  grantId: string;
  grantName: string;
  deadline: string;
  daysLeft: number;
}

export type ViewType = 'dashboard' | 'pipeline' | 'grant-detail' | 'builder' | 'reports' | 'settings' | 'calendar' | 'recommendations' | 'comparison' | 'budget' | 'team';
