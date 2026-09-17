export type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Sensitive Security';

export type CaseStatus = 'Escalation' | 'At Risk' | 'Processing' | 'Delayed' | 'Resolved' | 'Human Verification';

export type SentimentType = 'Very Negative' | 'Negative' | 'Neutral' | 'Positive';

export type UrgencyLevel = 'High' | 'Medium' | 'Low';

export interface EmailMessage {
  id: string;
  from: string;
  senderName: string;
  senderAvatar?: string;
  to: string;
  date: string;
  subject: string;
  body: string;
  threadCount: number;
}

export interface TimelineEvent {
  date: string;
  event: string;
  type: 'client' | 'system' | 'ai' | 'agent';
  detail?: string;
}

export interface AIRecommendation {
  type: 'human_intervention' | 'normal_response' | 'human_verification_required' | 'proactive_update';
  title: string;
  explanation: string;
  suggestedAction: string;
  riskWarning?: string;
}

export interface AISuggestedResponse {
  subject: string;
  body: string;
  tone: 'balanced' | 'empathetic' | 'expedited';
  confidence: number;
  requiresReview: boolean;
}

export interface CaseItem {
  id: string;
  caseNumber: string;
  client: string;
  clientEmail: string;
  company: string;
  tier: 'Strategic Enterprise' | 'Key Vendor' | 'Standard Partner';
  request: string;
  subject: string;
  preview: string;
  waitingDays: number;
  waitingHours?: number;
  sentiment: SentimentType;
  intent: string;
  urgency: UrgencyLevel;
  riskPercentage: number;
  riskLevel: RiskLevel;
  status: CaseStatus;
  unread: boolean;
  whyAtRisk: string[];
  recommendation: AIRecommendation;
  email: EmailMessage;
  timeline: TimelineEvent[];
  suggestedResponse: AISuggestedResponse;
  agentAssigned?: string;
  lastUpdated: string;
  notes?: string[];
  multiAgentDeliberation?: MultiAgentDeliberation;
  mlFeatures?: MLFeatureContribution[];
}

export type AgentRole = 'sentiment_psychologist' | 'sla_operations' | 'security_sentinel' | 'consensus_coordinator';

export interface AgentOpinion {
  agentId: string;
  agentName: string;
  roleTitle: string;
  avatarIcon: string;
  riskScore: number;
  confidence: number;
  vote: 'ESCALATE' | 'SUPPRESS_BOT' | 'NORMAL_BOT' | 'SECURITY_BLOCK';
  keyFindings: string[];
  thoughtTrace: string;
}

export interface MultiAgentDeliberation {
  consensusScore: number;
  consensusDecision: string;
  conflictDetected: boolean;
  conflictResolutionNotes: string;
  deliberationTimestamp: string;
  agents: AgentOpinion[];
  coordinatorSummary: string;
}

export interface MLFeatureContribution {
  id: string;
  featureName: string;
  rawVal: string | number;
  shapWeight: number; // e.g. +0.32
  percentageWeight: number; // e.g. 32%
  direction: 'escalation_driver' | 'calming_factor' | 'neutral';
  explanation: string;
}

export interface MLModelMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  falseEscalationSuppression: number;
  totalTrainingSamples: number;
  modelArchitecture: string;
}

export interface DashboardKPIs {
  totalActive: number;
  totalActiveTrend: string;
  atRisk: number;
  atRiskTrend: string;
  delayed: number;
  delayedTrend: string;
  highUrgency: number;
  highUrgencyTrend: string;
}

export interface QuickAnalysisRequest {
  emailText: string;
  clientName: string;
  waitingDays: number;
  requestType?: string;
}

export interface QuickAnalysisResult {
  sentiment: SentimentType;
  intent: string;
  urgency: UrgencyLevel;
  riskPercentage: number;
  riskLevel: RiskLevel;
  status: CaseStatus;
  whyAtRisk: string[];
  recommendation: AIRecommendation;
  suggestedResponse: AISuggestedResponse;
  multiAgentDeliberation?: MultiAgentDeliberation;
  mlFeatures?: MLFeatureContribution[];
}

export interface CaseChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  persona?: 'copilot' | 'sentix' | 'chronos' | 'aegis';
}
