export type GrantStatus = 'not-started' | 'in-progress' | 'submitted' | 'won' | 'archived';

export type GrantProgram = 
  | 'KPO'           // Krajowy Plan Odbudowy (Poland)
  | 'FEnIKS'        // Fundusz Europejski na Infrastrukturę, Klimat i Środowisko
  | 'CEF'           // Connecting Europe Facility
  | 'Horizon'       // Horizon Europe
  | 'ERDF'          // European Regional Development Fund
  | 'Creative'      // Creative Europe
  | 'Erasmus'       // Erasmus+
  | 'LIFE'          // LIFE Programme (Environment & Climate)
  | 'Digital'       // Digital Europe Programme
  | 'JTF'           // Just Transition Fund
  | 'ESF+'          // European Social Fund Plus
  | 'InvestEU'      // InvestEU Programme
  | 'Interreg'      // Interreg (European Territorial Cooperation)
  | 'EMFAF'         // European Maritime, Fisheries and Aquaculture Fund
  | 'EAFRD'         // European Agricultural Fund for Rural Development
  | 'GreenDeal'     // European Green Deal
  | 'EU4Health';    // EU4Health Programme

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
