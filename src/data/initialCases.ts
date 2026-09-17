import { CaseItem } from '../types';
import { generateMultiAgentDeliberation, calculateMLFeatures } from '../utils/mlEngine';

const RAW_CASES: CaseItem[] = [
  {
    id: 'case-001',
    caseNumber: 'CF-8921',
    client: 'Sarah Tan',
    clientEmail: 's.tan@apexlogistics.com',
    company: 'Apex Global Logistics (Averis Tier 1 Vendor)',
    tier: 'Strategic Enterprise',
    request: 'Payment Status',
    subject: 'Re: Payment Request — Escalation Warning',
    preview: 'I submitted this request five days ago and still haven\'t received an update. This is becoming extremely frustrating because we need the payment processed urgently...',
    waitingDays: 5,
    waitingHours: 120,
    sentiment: 'Very Negative',
    intent: 'Payment Status Enquiry',
    urgency: 'High',
    riskPercentage: 91,
    riskLevel: 'High Risk',
    status: 'Escalation',
    unread: true,
    whyAtRisk: [
      'Request is overdue against standard SLA (3 days target vs 5 days elapsed)',
      'Multiple follow-ups detected (2 unanswered reminder pings)',
      'Negative sentiment and explicit frustration markers detected',
      'High urgency language indicates operational dependency ("payment processed urgently")',
      'Similar historical cases required management intervention when delayed past 4 days'
    ],
    recommendation: {
      type: 'human_intervention',
      title: 'Human intervention recommended',
      explanation: 'This client has a high probability of escalation if another generic acknowledgement is sent. A personalized status update or direct human response is recommended.',
      suggestedAction: 'Route immediately to Senior Operations Specialist and send a personalized timeline commitment.',
      riskWarning: 'Sending an automated bot acknowledgement will trigger an executive complaint based on escalation history.'
    },
    email: {
      id: 'email-001',
      from: 'Sarah Tan <s.tan@apexlogistics.com>',
      senderName: 'Sarah Tan',
      to: 'Averis Shared Services — Accounts Payable <ap-services@averis.com>',
      date: 'Sept 17, 2026 at 09:14 AM',
      subject: 'Re: Urgent: Payment Status Enquiry for Batch INV-88204',
      body: `Hi,

I submitted this request five days ago and still haven't received an update. This is becoming extremely frustrating because we need the payment processed urgently for our port clearance release.

If this cannot be verified by today, we will have to escalate this to your shared services leadership team and freeze pending supply deliveries.

Please let us know the exact status immediately.

Regards,
Sarah Tan
Regional Logistics Director | Apex Global Logistics`,
      threadCount: 4
    },
    timeline: [
      {
        date: 'Sept 12, 2026',
        event: 'Client submitted request',
        type: 'client',
        detail: 'Initial payment enquiry submitted via procurement portal.'
      },
      {
        date: 'Sept 12, 2026',
        event: 'Automatic acknowledgement sent',
        type: 'system',
        detail: 'Standard generic ticket auto-reply dispatched (Ticket CF-8921).'
      },
      {
        date: 'Sept 14, 2026',
        event: 'Expected processing time approaching',
        type: 'system',
        detail: 'Standard 48-hour internal review window lapsed without update.'
      },
      {
        date: 'Sept 16, 2026',
        event: 'Client follow-up',
        type: 'client',
        detail: 'First follow-up email received inquiring about delay.'
      },
      {
        date: 'Sept 17, 2026',
        event: 'Second follow-up',
        type: 'client',
        detail: 'Second follow-up with heightened tone regarding port clearance freeze.'
      },
      {
        date: 'Sept 17, 2026',
        event: 'AI detected high escalation risk',
        type: 'ai',
        detail: 'CalmFlow AI flagged 91% escalation risk. Suppressed generic auto-reply.'
      }
    ],
    suggestedResponse: {
      subject: 'Update: Payment Request INV-88204 — Priority Verification',
      body: `Hi Sarah,

We apologize for the delay with your request. It is currently undergoing an additional verification step with our senior treasury audit team to ensure swift clearance. 

Our team is actively expediting this case and expects to provide the finalized confirmation number by Thursday at 3 PM. 

No further action is required from you at this time. I am personally tracking this item to port release.

Best regards,
Finance Operations Team
Averis Shared Services`,
      tone: 'empathetic',
      confidence: 96,
      requiresReview: true
    },
    agentAssigned: 'Operations Lead (Shared Services)',
    lastUpdated: '12 mins ago'
  },
  {
    id: 'case-002',
    caseNumber: 'CF-8924',
    client: 'Daniel Lee',
    clientEmail: 'd.lee@crestviewmfg.com',
    company: 'Crestview Manufacturing',
    tier: 'Key Vendor',
    request: 'Invoice Request',
    subject: 'Status of Invoice Revision PO-8839',
    preview: 'Can someone check on the invoice revision for PO-8839? Our monthly financial close is tomorrow and we cannot proceed without the updated document...',
    waitingDays: 3,
    waitingHours: 72,
    sentiment: 'Negative',
    intent: 'Invoice Request',
    urgency: 'High',
    riskPercentage: 74,
    riskLevel: 'Medium Risk',
    status: 'At Risk',
    unread: true,
    whyAtRisk: [
      'Approaching SLA threshold (Day 3 of 3-day turnaround limit)',
      'Client indicates hard accounting deadline ("monthly close tomorrow")',
      'Mild negative sentiment transitioning toward frustration',
      'High business criticality for shared accounting ledger reconciliation'
    ],
    recommendation: {
      type: 'proactive_update',
      title: 'Proactive personalized update recommended',
      explanation: 'While not yet an open dispute, a generic automated delay notice will cause escalation before month-end close. A proactive personalized status update will prevent escalation.',
      suggestedAction: 'Send proactive revised draft timeline and assign accounting reviewer.'
    },
    email: {
      id: 'email-002',
      from: 'Daniel Lee <d.lee@crestviewmfg.com>',
      senderName: 'Daniel Lee',
      to: 'Averis Shared Services — Invoicing <invoicing@averis.com>',
      date: 'Sept 17, 2026 at 08:30 AM',
      subject: 'Status of Invoice Revision PO-8839 (Month-End Close)',
      body: `Hi Operations Team,

Can someone please check on the invoice revision for PO-8839? We requested the tax code adjustment 3 days ago.

Our monthly financial close is tomorrow afternoon and our audit department cannot approve the ledger without this document. 

Looking forward to your quick response today.

Best regards,
Daniel Lee
Finance Controller | Crestview Manufacturing`,
      threadCount: 2
    },
    timeline: [
      {
        date: 'Sept 14, 2026',
        event: 'Client submitted request',
        type: 'client',
        detail: 'Tax adjustment request for PO-8839 received.'
      },
      {
        date: 'Sept 14, 2026',
        event: 'Automatic acknowledgement sent',
        type: 'system',
        detail: 'Receipt acknowledged with 72-hour standard SLA.'
      },
      {
        date: 'Sept 16, 2026',
        event: 'SLA threshold warning',
        type: 'ai',
        detail: 'CalmFlow AI noted month-end close timing sensitivity.'
      },
      {
        date: 'Sept 17, 2026',
        event: 'Client follow-up received',
        type: 'client',
        detail: 'Follow-up regarding financial close deadline.'
      }
    ],
    suggestedResponse: {
      subject: 'Re: Status of Invoice Revision PO-8839 (In Progress)',
      body: `Hi Daniel,

Thank you for checking in. We recognize your month-end close deadline tomorrow afternoon.

Your revised invoice for PO-8839 with the updated tax code is currently in the final manager sign-off queue. We will deliver the updated PDF to your inbox today before 4:00 PM.

Thank you for your patience while we finalize the adjustment.

Best regards,
Invoicing Operations Team
Averis Shared Services`,
      tone: 'balanced',
      confidence: 93,
      requiresReview: true
    },
    agentAssigned: 'David K. (Billing Operations)',
    lastUpdated: '45 mins ago'
  },
  {
    id: 'case-003',
    caseNumber: 'CF-8930',
    client: 'Emily Wong',
    clientEmail: 'emily.w@pacificlog.com',
    company: 'Pacific Coast Logistics',
    tier: 'Standard Partner',
    request: 'Document Request',
    subject: 'Status of invoice PO-45821',
    preview: 'Hi, could you please let me know the status of invoice PO-45821? Just following our routine weekly check...',
    waitingDays: 1,
    waitingHours: 18,
    sentiment: 'Neutral',
    intent: 'Invoice Status',
    urgency: 'Medium',
    riskPercentage: 21,
    riskLevel: 'Low Risk',
    status: 'Processing',
    unread: false,
    whyAtRisk: [
      'Normal processing turnaround (18 hours elapsed, SLA is 48 hours)',
      'Neutral, courteous language with no escalation triggers',
      'No repeat follow-ups detected',
      'Standard low-risk inquiry suitable for automated tracking update'
    ],
    recommendation: {
      type: 'normal_response',
      title: 'Normal response recommended',
      explanation: 'This case is within healthy turnaround parameters. CalmFlow AI demonstrates intelligent restraint by not unnecessarily escalating or alerting human agents.',
      suggestedAction: 'Send automated status tracker link or queue for standard batch reply.'
    },
    email: {
      id: 'email-003',
      from: 'Emily Wong <emily.w@pacificlog.com>',
      senderName: 'Emily Wong',
      to: 'Averis Shared Services — Invoicing <invoicing@averis.com>',
      date: 'Sept 17, 2026 at 07:15 AM',
      subject: 'Status of invoice PO-45821',
      body: `Hi,

Could you please let me know the status of invoice PO-45821? Just following up as part of our routine weekly reconciliation.

No urgent rush, just checking in.

Thank you!
Emily Wong
Pacific Coast Logistics`,
      threadCount: 1
    },
    timeline: [
      {
        date: 'Sept 16, 2026',
        event: 'Client submitted request',
        type: 'client',
        detail: 'Routine status inquiry received.'
      },
      {
        date: 'Sept 16, 2026',
        event: 'Automatic acknowledgement sent',
        type: 'system',
        detail: 'Ticket generated with SLA 48 hours.'
      },
      {
        date: 'Sept 17, 2026',
        event: 'AI sentiment & risk check passed',
        type: 'ai',
        detail: 'CalmFlow AI verified healthy parameters (21% risk).'
      }
    ],
    suggestedResponse: {
      subject: 'Re: Status of invoice PO-45821 — Processing Normally',
      body: `Hi Emily,

Thanks for reaching out! Invoice PO-45821 was approved on Sept 15 and is queued for standard payment run scheduled for Friday.

You can also view real-time settlement status directly on the Averis Partner Portal.

Best regards,
Accounts Payable Team`,
      tone: 'balanced',
      confidence: 98,
      requiresReview: false
    },
    agentAssigned: 'Automated Service Queue',
    lastUpdated: '2 hours ago'
  },
  {
    id: 'case-004',
    caseNumber: 'CF-8935',
    client: 'Robert Chen',
    clientEmail: 'r.chen@globalfleet-intl.com',
    company: 'Global Fleet Services',
    tier: 'Strategic Enterprise',
    request: 'Bank Account Change Request',
    subject: 'URGENT: Change of Remittance Bank Account for September Wire',
    preview: 'Please change the bank account associated with our payment immediately to our new IBAN account DE89370400440532013000...',
    waitingDays: 0,
    waitingHours: 2,
    sentiment: 'Neutral',
    intent: 'Sensitive Financial Request',
    urgency: 'High',
    riskPercentage: 88,
    riskLevel: 'Sensitive Security',
    status: 'Human Verification',
    unread: true,
    whyAtRisk: [
      'High-risk security category: Out-of-band bank account / banking details modification',
      'Urgency language ("immediately") aligns with known Business Email Compromise (BEC) fraud signatures',
      'Automated processing strictly forbidden under Averis Internal Controls Policy §4.2',
      'Requires verified voice callback to registered corporate executive phone directory'
    ],
    recommendation: {
      type: 'human_verification_required',
      title: 'Human verification required (Sensitive Security Safeguard)',
      explanation: 'CalmFlow AI detected a sensitive financial account modification request. Automatic response and unverified changes are blocked to prevent fraudulent account redirection.',
      suggestedAction: 'Hold all outbound payments. Conduct telephone verification with the registered CFO contact number.',
      riskWarning: 'DO NOT send banking confirmation via email without independent voice verification.'
    },
    email: {
      id: 'email-004',
      from: 'Robert Chen <r.chen@globalfleet-intl.com>',
      senderName: 'Robert Chen',
      to: 'Averis Shared Services — Treasury <treasury@averis.com>',
      date: 'Sept 17, 2026 at 09:45 AM',
      subject: 'URGENT: Change of Remittance Bank Account for September Wire',
      body: `Dear Treasury Operations,

Please change the bank account associated with our payment immediately. Our legal banking entity has updated its clearing branch.

New Remittance Details:
Bank: Deutsche Bundesbank International
IBAN: DE89 3704 0044 0532 0130 00
SWIFT: DUSBDEDDXXX

Please process this update immediately for today's payment run and confirm back.

Best regards,
Robert Chen
Corporate Treasurer | Global Fleet Services`,
      threadCount: 1
    },
    timeline: [
      {
        date: 'Sept 17, 2026 — 09:45 AM',
        event: 'Client email received',
        type: 'client',
        detail: 'Request submitted regarding banking details modification.'
      },
      {
        date: 'Sept 17, 2026 — 09:46 AM',
        event: 'CalmFlow AI Fraud & Security Intercept',
        type: 'ai',
        detail: 'Sensitive Financial Modification detected. Auto-reply disabled.'
      },
      {
        date: 'Sept 17, 2026 — 09:47 AM',
        event: 'Compliance ticket flagged for dual verification',
        type: 'system',
        detail: 'Requires two-person protocol and callback verification.'
      }
    ],
    suggestedResponse: {
      subject: 'Security Notice: Bank Account Verification Protocol [Ticket CF-8935]',
      body: `Dear Robert Chen,

Thank you for contacting Averis Treasury Operations. In compliance with enterprise financial security and anti-fraud protocols, bank account updates cannot be processed via email alone.

A member of our treasury risk compliance team will contact the primary authorized officer via our secured registered phone line within 2 business hours to verify this instruction.

Pending this verbal dual-authentication, scheduled disbursements will remain safely on hold.

Sincerely,
Treasury Compliance & Risk Operations
Averis Shared Services`,
      tone: 'formal' as any,
      confidence: 99,
      requiresReview: true
    },
    agentAssigned: 'Treasury Risk & Fraud Unit',
    lastUpdated: '10 mins ago'
  },
  {
    id: 'case-005',
    caseNumber: 'CF-8919',
    client: 'Priya Patel',
    clientEmail: 'p.patel@horizonhealth.my',
    company: 'Horizon Health Services',
    tier: 'Key Vendor',
    request: 'ERP Access Credentials Renewal',
    subject: 'Delayed Access Credentials for Shared Reporting Portal',
    preview: 'We have been waiting 4 days for our updated credentials. Our compliance team needs to file regional audit logs today...',
    waitingDays: 4,
    waitingHours: 96,
    sentiment: 'Negative',
    intent: 'IT Access Request',
    urgency: 'Medium',
    riskPercentage: 68,
    riskLevel: 'Medium Risk',
    status: 'Delayed',
    unread: true,
    whyAtRisk: [
      'Overdue SLA (Standard IT credential provisioning is 48 hours, 96 hours elapsed)',
      'Escalating language mentioning audit log deadlines',
      'Client relationship risk moderate'
    ],
    recommendation: {
      type: 'proactive_update',
      title: 'Proactive update recommended',
      explanation: 'Client is experiencing prolonged delay for routine system access. Provide immediate ETA to prevent escalation to IT steering committee.',
      suggestedAction: 'Expedite ticket with Identity & Access Management and dispatch warm progress notification.'
    },
    email: {
      id: 'email-005',
      from: 'Priya Patel <p.patel@horizonhealth.my>',
      senderName: 'Priya Patel',
      to: 'Averis Shared Services — IT Helpdesk <it-shared@averis.com>',
      date: 'Sept 16, 2026 at 04:20 PM',
      subject: 'Delayed Access Credentials for Shared Reporting Portal',
      body: `Hello Support,

We have been waiting 4 days for our updated credentials for the shared reporting portal. 

Our compliance team needs to file regional audit logs by tomorrow noon, and we are currently locked out. Can someone please look into this as soon as possible?

Thank you,
Priya Patel
Compliance Manager | Horizon Health`,
      threadCount: 2
    },
    timeline: [
      {
        date: 'Sept 13, 2026',
        event: 'Ticket logged',
        type: 'client',
        detail: 'Portal renewal request logged.'
      },
      {
        date: 'Sept 15, 2026',
        event: 'Internal queue delay',
        type: 'system',
        detail: 'Access management batch queue experienced backlog.'
      },
      {
        date: 'Sept 16, 2026',
        event: 'Client reminder received',
        type: 'client',
        detail: 'Inquiry regarding compliance audit deadline.'
      }
    ],
    suggestedResponse: {
      subject: 'Re: Priority Update: Access Credentials for Reporting Portal',
      body: `Hi Priya,

We sincerely apologize for the delay with your access credentials. We understand your compliance team has an audit filing deadline tomorrow noon.

Our Identity & Access Management lead is generating your temporary secure token right now, which will arrive in an encrypted email before 11:00 AM.

Thank you for your patience while we expedite this for you.

Best regards,
IT Services Operations Team`,
      tone: 'empathetic',
      confidence: 91,
      requiresReview: true
    },
    agentAssigned: 'Kevin W. (IT Operations)',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'case-006',
    caseNumber: 'CF-8902',
    client: 'Marcus Vance',
    clientEmail: 'm.vance@vancetech.com',
    company: 'Vance Technologies',
    tier: 'Strategic Enterprise',
    request: 'Tax Exemption Certificate',
    subject: 'Resolved: 2026 Tax Exemption Certificate Filing',
    preview: 'Thank you for the prompt personalized update earlier today. That gave our tax auditors exactly what they needed...',
    waitingDays: 0,
    waitingHours: 0,
    sentiment: 'Positive',
    intent: 'Document Request',
    urgency: 'Low',
    riskPercentage: 8,
    riskLevel: 'Low Risk',
    status: 'Resolved',
    unread: false,
    whyAtRisk: [
      'Escalation successfully prevented via CalmFlow AI proactive intervention on Sept 15'
    ],
    recommendation: {
      type: 'normal_response',
      title: 'Resolved — Escalation successfully avoided',
      explanation: 'This case previously exhibited a 78% escalation trajectory. Proactive communication by the operations team defused tension and achieved positive client satisfaction.',
      suggestedAction: 'Archive case; positive CSAT recorded.'
    },
    email: {
      id: 'email-006',
      from: 'Marcus Vance <m.vance@vancetech.com>',
      senderName: 'Marcus Vance',
      to: 'Averis Shared Services — Tax Operations <tax-ops@averis.com>',
      date: 'Sept 16, 2026 at 02:40 PM',
      subject: 'Resolved: 2026 Tax Exemption Certificate Filing',
      body: `Hi Operations Team,

Thank you for the prompt personalized update earlier today and for issuing the stamped certificate ahead of the audit deadline.

That prevented a major roadblock on our end. Much appreciated!

Warm regards,
Marcus Vance`,
      threadCount: 3
    },
    timeline: [
      {
        date: 'Sept 14, 2026',
        event: 'Client submitted request',
        type: 'client',
        detail: 'Tax exemption certificate requested.'
      },
      {
        date: 'Sept 15, 2026',
        event: 'AI flagged 78% risk; suggested proactive update',
        type: 'ai',
        detail: 'CalmFlow AI recommended human update.'
      },
      {
        date: 'Sept 15, 2026',
        event: 'Agent sent personalized response',
        type: 'agent',
        detail: 'Personalized update and expedited certificate sent.'
      },
      {
        date: 'Sept 16, 2026',
        event: 'Client confirmed resolution with positive sentiment',
        type: 'client',
        detail: 'Case closed with CSAT 5/5.'
      }
    ],
    suggestedResponse: {
      subject: 'Re: 2026 Tax Exemption Certificate Filing [Closed]',
      body: `Hi Marcus,

You are very welcome! We are glad we could help you beat the audit deadline. Please reach out anytime if we can assist further.

Best regards,
Tax Operations Team`,
      tone: 'balanced',
      confidence: 99,
      requiresReview: false
    },
    agentAssigned: 'Operations Lead',
    lastUpdated: '1 day ago'
  }
];

export const INITIAL_CASES: CaseItem[] = RAW_CASES.map((c) => ({
  ...c,
  multiAgentDeliberation: c.multiAgentDeliberation || generateMultiAgentDeliberation(c),
  mlFeatures: c.mlFeatures || calculateMLFeatures(c)
}));

export const MOCK_KPIS = {
  totalActive: 142,
  totalActiveTrend: '+4% vs last week',
  atRisk: 18,
  atRiskTrend: '-12% this month',
  delayed: 7,
  delayedTrend: '3 cases resolved today',
  highUrgency: 5,
  highUrgencyTrend: 'Immediate action needed'
};

export const RISK_DISTRIBUTION = [
  { name: 'Low Risk', count: 104, percentage: 73, color: 'emerald', hex: '#10b981' },
  { name: 'Medium Risk (At Risk)', count: 23, percentage: 16, color: 'amber', hex: '#f59e0b' },
  { name: 'High Risk (Escalation)', count: 15, percentage: 11, color: 'rose', hex: '#f43f5e' }
];
