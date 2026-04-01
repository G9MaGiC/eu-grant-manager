import type { Grant, Submission, DashboardStats, UpcomingDeadline, GrantProgram } from '@/types';

export const grants: Grant[] = [
  {
    id: '1',
    name: 'Energy Retrofit — Public Building Modernization',
    program: 'KPO',
    deadline: '2026-03-18',
    status: 'in-progress',
    estimatedValue: 1200000,
    fitScore: 92,
    owner: { name: 'A. Kowalski' },
    description: 'Upgrade public buildings for energy efficiency. Covers insulation, HVAC, and smart metering. Co-financing rate up to 80%.',
    tasks: [
      { id: 't1', title: 'Prepare eligibility docs', completed: true, dueDate: '2026-03-10' },
      { id: 't2', title: 'Draft project narrative', completed: true, dueDate: '2026-03-12' },
      { id: 't3', title: 'Finalize budget table', completed: false, dueDate: '2026-03-15' },
      { id: 't4', title: 'Submit via national portal', completed: false, dueDate: '2026-03-18' },
    ],
    documents: [
      { id: 'd1', name: 'Eligibility_Checklist.pdf', size: '245 KB', type: 'PDF', uploadedAt: '2026-03-01' },
      { id: 'd2', name: 'Budget_Template.xlsx', size: '128 KB', type: 'XLSX', uploadedAt: '2026-03-02' },
      { id: 'd3', name: 'Letter_of_Support_Mayor.pdf', size: '189 KB', type: 'PDF', uploadedAt: '2026-03-05' },
    ],
    timeline: [
      { id: 'tm1', date: '2026-03-10', title: 'Internal review', type: 'review' },
      { id: 'tm2', date: '2026-03-14', title: 'Legal check', type: 'review' },
      { id: 'tm3', date: '2026-03-18', title: 'Submit', type: 'deadline' },
    ],
  },
  {
    id: '2',
    name: 'Digital Services for Citizens',
    program: 'FEnIKS',
    deadline: '2026-03-25',
    status: 'not-started',
    estimatedValue: 850000,
    fitScore: 88,
    owner: { name: 'M. Nowak' },
    description: 'Develop digital platforms for municipal services. Includes e-government portal, mobile app, and backend integration.',
    tasks: [
      { id: 't5', title: 'Review program guidelines', completed: false, dueDate: '2026-03-08' },
      { id: 't6', title: 'Prepare partnership agreements', completed: false, dueDate: '2026-03-15' },
    ],
    documents: [
      { id: 'd4', name: 'Program_Guidelines.pdf', size: '3.2 MB', type: 'PDF', uploadedAt: '2026-03-01' },
    ],
    timeline: [
      { id: 'tm4', date: '2026-03-15', title: 'Partner confirmation', type: 'milestone' },
      { id: 'tm5', date: '2026-03-25', title: 'Submit', type: 'deadline' },
    ],
  },
  {
    id: '3',
    name: 'Transport Corridor Enhancement',
    program: 'CEF',
    deadline: '2026-04-02',
    status: 'submitted',
    estimatedValue: 2100000,
    fitScore: 85,
    owner: { name: 'L. Schmidt' },
    description: 'Improve regional transport infrastructure. Covers road upgrades, cycling paths, and public transport connections.',
    tasks: [
      { id: 't7', title: 'Environmental impact assessment', completed: true },
      { id: 't8', title: 'Stakeholder consultation', completed: true },
      { id: 't9', title: 'Submit application', completed: true },
    ],
    documents: [
      { id: 'd5', name: 'Environmental_Assessment.pdf', size: '8.5 MB', type: 'PDF', uploadedAt: '2026-02-20' },
      { id: 'd6', name: 'Stakeholder_Report.pdf', size: '1.2 MB', type: 'PDF', uploadedAt: '2026-02-25' },
      { id: 'd7', name: 'Application_Final.pdf', size: '4.8 MB', type: 'PDF', uploadedAt: '2026-04-02' },
    ],
    timeline: [
      { id: 'tm6', date: '2026-04-02', title: 'Submitted', type: 'milestone' },
      { id: 'tm7', date: '2026-06-15', title: 'Evaluation result', type: 'milestone' },
    ],
  },
  {
    id: '4',
    name: 'Health Innovation Pilot',
    program: 'Horizon',
    deadline: '2026-04-10',
    status: 'won',
    estimatedValue: 600000,
    fitScore: 95,
    owner: { name: 'J. Rossi' },
    description: 'Pilot innovative healthcare solutions in municipal clinics. Focus on telemedicine and patient data management.',
    tasks: [
      { id: 't10', title: 'Project kickoff', completed: true },
      { id: 't11', title: 'Partner consortium setup', completed: true },
    ],
    documents: [
      { id: 'd8', name: 'Grant_Agreement.pdf', size: '2.1 MB', type: 'PDF', uploadedAt: '2026-04-15' },
      { id: 'd9', name: 'Consortium_Agreement.pdf', size: '1.8 MB', type: 'PDF', uploadedAt: '2026-04-12' },
    ],
    timeline: [
      { id: 'tm8', date: '2026-04-10', title: 'Awarded', type: 'milestone' },
      { id: 'tm9', date: '2026-05-01', title: 'Project start', type: 'milestone' },
    ],
  },
  {
    id: '5',
    name: 'Sustainable Urban Mobility',
    program: 'ERDF',
    deadline: '2026-04-20',
    status: 'in-progress',
    estimatedValue: 950000,
    fitScore: 78,
    owner: { name: 'P. Andersen' },
    description: 'Implement sustainable transport solutions. Electric vehicle charging infrastructure and bike-sharing program.',
    tasks: [
      { id: 't12', title: 'Feasibility study', completed: true },
      { id: 't13', title: 'Draft application', completed: false },
    ],
    documents: [
      { id: 'd10', name: 'Feasibility_Study.pdf', size: '5.2 MB', type: 'PDF', uploadedAt: '2026-03-10' },
    ],
    timeline: [
      { id: 'tm10', date: '2026-04-20', title: 'Submit', type: 'deadline' },
    ],
  },
  {
    id: '6',
    name: 'Smart City Data Platform',
    program: 'KPO',
    deadline: '2026-05-15',
    status: 'not-started',
    estimatedValue: 750000,
    fitScore: 82,
    owner: { name: 'S. Müller' },
    description: 'Centralized data platform for smart city initiatives. IoT sensors, data analytics, and citizen engagement tools.',
    tasks: [],
    documents: [],
    timeline: [
      { id: 'tm11', date: '2026-05-15', title: 'Submit', type: 'deadline' },
    ],
  },
];

export const submissions: Submission[] = [
  { id: 's1', grantName: 'KPO Energy Retrofit', submittedAt: '2026-03-18', format: 'PDF', grantId: '1' },
  { id: 's2', grantName: 'FEnIKS Digital Services', submittedAt: '2026-03-25', format: 'PDF', grantId: '2' },
  { id: 's3', grantName: 'CEF Transport Corridor', submittedAt: '2026-04-02', format: 'PDF', grantId: '3' },
];

export const dashboardStats: DashboardStats = {
  activeGrants: 12,
  fundingPipeline: 4200000,
  submissionsThisMonth: 3,
};

export const upcomingDeadlines: UpcomingDeadline[] = [
  { grantId: '1', grantName: 'KPO Energy Retrofit', deadline: '2026-03-18', daysLeft: 3 },
  { grantId: '2', grantName: 'FEnIKS Digital Services', deadline: '2026-03-25', daysLeft: 10 },
  { grantId: '3', grantName: 'CEF Transport Corridor', deadline: '2026-04-02', daysLeft: 18 },
];

export const getGrantById = (id: string): Grant | undefined => {
  return grants.find(g => g.id === id);
};

export const getGrantsByStatus = (status: Grant['status']): Grant[] => {
  return grants.filter(g => g.status === status);
};

export const getGrantsByProgram = (program: GrantProgram): Grant[] => {
  return grants.filter(g => g.program === program);
};
