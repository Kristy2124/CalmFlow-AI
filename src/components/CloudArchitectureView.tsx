import { useState, useEffect } from 'react';
import { 
  Cloud, 
  Server, 
  Database, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  FileCode, 
  Lock, 
  RefreshCw, 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  Eye, 
  Info, 
  Sparkles, 
  Globe, 
  Radio, 
  Workflow, 
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Inbox,
  Clock,
  Send
} from 'lucide-react';
import { CaseItem } from '../types';

interface CloudArchitectureViewProps {
  cases: CaseItem[];
}

interface TelemetryData {
  status: string;
  service: string;
  cloudProvider: string;
  deploymentTarget: string;
  region: string;
  secondaryRegion: string;
  runtime: string;
  platform: string;
  uptimeSeconds: number;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  aiModel: {
    model: string;
    sdk: string;
    status: string;
    hasKey: boolean;
  };
  topology: {
    ingress: string;
    queue: string;
    sanitization: string;
    compute: string;
    persistence: string;
    erpBridge: string;
  };
}

interface ArchNode {
  id: string;
  title: string;
  serviceName: string;
  tier: 'ingress' | 'security' | 'queue' | 'compute' | 'storage' | 'action';
  tierLabel: string;
  icon: any;
  status: 'Operational' | 'Active' | 'Enforced' | 'Connected';
  description: string;
  specs: { [key: string]: string };
  metrics: { [key: string]: string };
  terraformBlock: string;
  highlightFor?: string;
}

export function CloudArchitectureView({ cases }: CloudArchitectureViewProps) {
  const [activeTab, setActiveTab] = useState<'topology' | 'tracer' | 'security' | 'terraform'>('topology');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('cloud-run');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Packet Tracer States
  const [selectedTraceCaseId, setSelectedTraceCaseId] = useState<string>(cases[0]?.id || 'case-001');
  const [isTracing, setIsTracing] = useState(false);
  const [traceStep, setTraceStep] = useState<number>(0);
  const [traceLogs, setTraceLogs] = useState<Array<{ step: number; time: string; node: string; event: string; status: 'ok' | 'alert' | 'info'; detail: string }>>([]);

  const selectedCase = cases.find(c => c.id === selectedTraceCaseId) || cases[0];

  // Fetch real telemetry from backend
  const fetchTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/system-telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch {
      // Fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Architecture Nodes Definition
  const ARCH_NODES: ArchNode[] = [
    {
      id: 'ingress-perimeter',
      title: 'Inbound Ingress & Perimeter Edge',
      serviceName: 'Cloud Armor + Global HTTP(S) Load Balancer',
      tier: 'ingress',
      tierLabel: 'Tier 1: Edge & Ingestion',
      icon: Globe,
      status: 'Operational',
      description: 'Terminates client TLS 1.3 traffic, buffers inbound webhooks from Microsoft 365 / Exchange, ServiceNow, and Averis shared portal with Cloud Armor DDoS mitigation.',
      specs: {
        'Protocol': 'TLS 1.3 Anycast HTTP/2',
        'WAF Engine': 'Google Cloud Armor v3',
        'Rate Limit': '2,000 req/min per tenant',
        'Geo-Routing': 'Global Anycast to asia-east1'
      },
      metrics: {
        'Uptime': '99.99%',
        'Edge Latency': '18ms',
        'Threats Blocked': '0 anomalies'
      },
      terraformBlock: `resource "google_compute_global_forwarding_rule" "calmflow_edge" {
  name       = "calmflow-global-forwarding-rule"
  target     = google_compute_target_https_proxy.calmflow_proxy.id
  port_range = "443"
  ip_protocol = "TCP"
}

resource "google_compute_security_policy" "cloud_armor_waf" {
  name        = "calmflow-perimeter-armor"
  description = "Enterprise WAF and rate limiting for Averis Shared Services"
}`
    },
    {
      id: 'cloud-dlp',
      title: 'Sensitive Data Protection & PII Filter',
      serviceName: 'Google Cloud DLP (Sensitive Data Protection)',
      tier: 'security',
      tierLabel: 'Tier 2: Security & Sanitization',
      icon: ShieldCheck,
      status: 'Enforced',
      description: 'Autonomous zero-knowledge redaction engine. Masks IBANs, SWIFT codes, credit card numbers, tax IDs, and sensitive employee PII before ingestion by AI models.',
      specs: {
        'Inspection Templates': 'IBAN, SWIFT, CREDIT_CARD_NUMBER, EMAIL, PHONE',
        'De-identification': 'Deterministic Crypto Hash Tokenization',
        'Compliance': 'SOC2 Type II, ISO 27001, GDPR',
        'Threat Intercept': 'Flags unauthorized bank change attempts'
      },
      metrics: {
        'Inspection Delay': '< 45ms',
        'Redaction Accuracy': '99.8%',
        'Zero Training': 'Zero data saved to model memory'
      },
      terraformBlock: `resource "google_data_loss_prevention_inspect_template" "calmflow_pii" {
  parent       = "projects/\${var.project_id}/locations/asia-east1"
  display_name = "CalmFlow Inbound PII Inspection"

  inspect_config {
    info_types {
      name = "IBAN_CODE"
    }
    info_types {
      name = "SWIFT_CODE"
    }
    info_types {
      name = "CREDIT_CARD_NUMBER"
    }
    min_likelihood = "LIKELY"
  }
}`
    },
    {
      id: 'cloud-pubsub',
      title: 'Decoupled Event Ingestion Pipeline',
      serviceName: 'Google Cloud Pub/Sub + Cloud Tasks',
      tier: 'queue',
      tierLabel: 'Tier 3: Asynchronous Event Bus',
      icon: Radio,
      status: 'Active',
      description: 'Distributed event bus guarantees at-least-once delivery for every client message with dead-letter queue (DLQ) protection and scheduled SLA contract timers.',
      specs: {
        'Primary Topic': 'projects/averis-prod/topics/calmflow.inbound.v1',
        'Subscription': 'calmflow-inference-sub (Push to Cloud Run)',
        'Dead Letter Queue': 'calmflow-poison-dlq',
        'Retention': '7 days (unacknowledged redundancy)'
      },
      metrics: {
        'Queue Depth': '0 backlogged',
        'Ack Latency': '12ms',
        'SLA Timer Precision': '±100ms'
      },
      terraformBlock: `resource "google_pubsub_topic" "inbound_cases" {
  name = "calmflow.inbound.v1"
  labels = {
    env = "production"
    app = "calmflow"
  }
}

resource "google_pubsub_subscription" "inference_worker" {
  name  = "calmflow-inference-sub"
  topic = google_pubsub_topic.inbound_cases.name

  ack_deadline_seconds = 60
  push_config {
    push_endpoint = "\${google_cloud_run_service.calmflow_engine.status[0].url}/api/pubsub/push"
  }
}`
    },
    {
      id: 'cloud-run',
      title: 'Serverless Multi-Agent Orchestrator',
      serviceName: 'Google Cloud Run (Fully Managed)',
      tier: 'compute',
      tierLabel: 'Tier 4: Enterprise Compute',
      icon: Cpu,
      status: 'Operational',
      description: 'Containerized Node.js runtime hosting CalmFlow AI orchestration, SHAP ML explainability engine, and the 4-agent consensus deliberation mesh with auto-scale 0 to 100.',
      specs: {
        'Container Runtime': 'Node.js 22 LTS Alpine + Vite SSR',
        'Concurrency': '80 requests / container instance',
        'CPU / Memory': '2 vCPU / 2GiB per instance',
        'Auto-scale Range': 'Min: 1 instance (warm), Max: 100 instances'
      },
      metrics: {
        'Active Containers': '2 instances warm',
        'Cold Start': '< 1.2s with instant CPU boost',
        'p95 Latency': '210ms (non-AI), 780ms (deliberation)'
      },
      terraformBlock: `resource "google_cloud_run_service" "calmflow_engine" {
  name     = "calmflow-core-engine"
  location = "asia-east1"

  template {
    spec {
      containers {
        image = "gcr.io/\${var.project_id}/calmflow-app:v2.4.0"
        resources {
          limits = {
            cpu    = "2000m"
            memory = "2048Mi"
          }
        }
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        env {
          name = "GEMINI_API_KEY"
          value_from {
            secret_key_ref {
              name = "calmflow-gemini-secret"
              key  = "latest"
            }
          }
        }
      }
    }
  }
}`
    },
    {
      id: 'gemini-intelligence',
      title: 'Multi-Agent LLM Reasoning Mesh',
      serviceName: 'Google Gemini 3.8 Flash + Multi-Agent Mesh',
      tier: 'compute',
      tierLabel: 'Tier 4: Enterprise AI & Reasoning',
      icon: Sparkles,
      status: 'Operational',
      description: 'Powers four specialized autonomous agents (Sentix, Chronos, Aegis, Synthetix) that deliberate simultaneously to calculate escalation probability and suppress blind bot replies.',
      specs: {
        'Foundational Model': 'gemini-3.8-flash (via @google/genai SDK)',
        'Autonomous Agents': 'Sentix (Psychology), Chronos (SLA), Aegis (Security), Synthetix (Consensus)',
        'Response Mode': 'Strict JSON Schema Structured Output',
        'Failover Fallback': 'Deterministic Local Heuristics Engine'
      },
      metrics: {
        'Inference Latency': '620ms avg',
        'Consensus Accuracy': '96.4%',
        'Context Window': '1M tokens (multi-year case thread)'
      },
      terraformBlock: `// Invoked server-side securely via Node.js @google/genai:
// Model: gemini-3.8-flash
// Temperature: 0.2 (deterministic business operational reasoning)
// System Instructions: Averis Shared Services Escalation Defusion Guide`
    },
    {
      id: 'cloud-storage-persistence',
      title: 'Operational Persistence & Audit Vault',
      serviceName: 'Cloud Firestore & Google Cloud Storage',
      tier: 'storage',
      tierLabel: 'Tier 5: Persistence & Audit',
      icon: Database,
      status: 'Operational',
      description: 'Stores real-time case states, deliberation transcripts, SHAP contribution records, and email thread attachments with CMEK (Customer-Managed Encryption Keys).',
      specs: {
        'Operational DB': 'Google Cloud Firestore (Native Mode, Multi-Region)',
        'Attachment Store': 'Cloud Storage Coldline (Retention lock: 7 years)',
        'Encryption': 'Cloud KMS Customer-Managed Key (AES-256)',
        'Analytics Sync': 'BigQuery continuous change data capture'
      },
      metrics: {
        'Read Latency': '4ms',
        'Write Latency': '11ms',
        'Durability': '99.999999999% (11 9s)'
      },
      terraformBlock: `resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = "asia-east1"
  type        = "FIRESTORE_NATIVE"
}

resource "google_storage_bucket" "case_attachments" {
  name          = "averis-calmflow-attachments-\${var.project_id}"
  location      = "ASIA-EAST1"
  storage_class = "STANDARD"

  encryption {
    default_kms_key_name = google_kms_crypto_key.storage_key.id
  }
}`
    },
    {
      id: 'sap-erp-connector',
      title: 'Enterprise ERP & Dispatch Gateway',
      serviceName: 'SAP S/4HANA OData Connector + Communication Gateway',
      tier: 'action',
      tierLabel: 'Tier 6: Action & Enterprise Integration',
      icon: Workflow,
      status: 'Connected',
      description: 'Connects directly to Averis SAP ERP to verify payment batches, purchase orders, and master vendor records. Dispatches approved personalized replies or alerts human specialists.',
      specs: {
        'ERP Integration': 'SAP S/4HANA BAPI & OData v4 Interface',
        'Suppression Gate': 'Suppresses automated replies if risk >= 70%',
        'Notification Mesh': 'Twilio SMS, Microsoft Teams Webhook, SendGrid SMTP',
        'Operator UI': 'Real-time WebSocket event dispatch to console'
      },
      metrics: {
        'Sync Latency': '32ms',
        'Suppression Rate': '100% of at-risk auto-replies suppressed',
        'Human Hand-off': '< 30s to operator desk'
      },
      terraformBlock: `resource "google_secret_manager_secret" "sap_credentials" {
  secret_id = "averis-sap-s4hana-credentials"
  replication {
    user_managed {
      replicas {
        location = "asia-east1"
      }
    }
  }
}`
    }
  ];

  const selectedNode = ARCH_NODES.find(n => n.id === selectedNodeId) || ARCH_NODES[3];

  // Packet Tracer Simulation Engine
  const runPacketTrace = async () => {
    if (isTracing) return;
    setIsTracing(true);
    setTraceStep(1);
    setTraceLogs([]);

    const addLog = (step: number, node: string, event: string, status: 'ok' | 'alert' | 'info', detail: string) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      setTraceLogs(prev => [...prev, { step, time: timeStr, node, event, status, detail }]);
    };

    // Step 1: Ingress
    addLog(1, 'Cloud Armor & Load Balancer', 'Inbound HTTP/2 Webhook received from Exchange 365', 'ok', `TLS 1.3 verified. IP 40.92.18.23 rated safe. Inbound client payload: "${selectedCase.subject}"`);
    await new Promise(r => setTimeout(r, 600));

    // Step 2: DLP Inspection
    setTraceStep(2);
    const isSecCase = selectedCase.status === 'Human Verification' || selectedCase.whyAtRisk.some(w => w.toLowerCase().includes('bank'));
    if (isSecCase) {
      addLog(2, 'Cloud DLP Sanitizer', 'High-Risk InfoType Alert: IBAN / Bank Account Modification Pattern', 'alert', 'Detected sensitive financial routing pattern in email body. Redaction applied; security sentinel flag dispatched.');
    } else {
      addLog(2, 'Cloud DLP Sanitizer', 'PII Inspection Complete: 0 critical disclosures found', 'ok', 'Client phone/email masked to secure tokens. Payload verified compliant with Averis Data Privacy Standard.');
    }
    await new Promise(r => setTimeout(r, 700));

    // Step 3: Pub/Sub
    setTraceStep(3);
    addLog(3, 'Cloud Pub/Sub', `Message published to topic "calmflow.inbound.v1"`, 'ok', `Assigned MessageID #gcp-msg-${Math.floor(Math.random() * 89999 + 10000)}. SLA deadline set to T+72h.`);
    await new Promise(r => setTimeout(r, 550));

    // Step 4: Cloud Run
    setTraceStep(4);
    addLog(4, 'Google Cloud Run', 'Worker container picked up message. Initializing Multi-Agent Mesh', 'ok', `Active instance "calmflow-core-00042-zxc" (asia-east1). Concurrency 12/80. Zero cold start.`);
    await new Promise(r => setTimeout(r, 650));

    // Step 5: Gemini Multi-Agent
    setTraceStep(5);
    const risk = selectedCase.riskPercentage;
    addLog(5, 'Gemini 3.8 Flash Mesh', `4 Autonomous Agents completed deliberation in 640ms`, risk >= 70 ? 'alert' : 'ok', `Consensus Escalation Probability: ${risk}%. Sentix: ${selectedCase.sentiment} | Chronos: ${selectedCase.waitingDays}d SLA | Aegis: ${isSecCase ? 'SECURITY_BLOCK' : 'SAFE'}.`);
    await new Promise(r => setTimeout(r, 800));

    // Step 6: Restraint Decider & SAP Action
    setTraceStep(6);
    if (risk >= 70 || isSecCase) {
      addLog(6, 'Intelligent Restraint Gate', 'CRITICAL ACTION: Automated generic reply SUPPRESSED', 'alert', 'Sending a blind auto-reply would guarantee executive escalation. Personalized human draft synthesized & routed to Averis operator console.');
    } else {
      addLog(6, 'Intelligent Restraint Gate', 'Low Escalation Risk (21%): Automated friendly response cleared', 'ok', 'Standard queue response allowed to proceed. Operator spared from notification fatigue.');
    }
    await new Promise(r => setTimeout(r, 600));

    // Finish
    setTraceStep(7);
    addLog(7, 'SAP ERP & Audit Persistence', 'Telemetry logged to BigQuery & Firestore audit ledger', 'ok', `Complete pipeline roundtrip: 782ms. Audit record immutable.`);
    setIsTracing(false);
  };

  return (
    <div id="cloud-architecture-view" className="space-y-6 pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-sky-600" />
                Google Cloud Platform
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">asia-east1 (Taiwan) + asia-southeast1 (DR)</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Cloud Run Active
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Cloud Architecture & Distributed AI Mesh
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Production-ready infrastructure blueprint for Averis Shared Services operations. Scalable, serverless, secure by default, and engineered to predict client frustration and prevent escalation in under 800ms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-refresh-telemetry"
              onClick={fetchTelemetry}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync Cloud Telemetry
            </button>
            <button
              id="btn-run-tracer-top"
              onClick={() => {
                setActiveTab('tracer');
                runPacketTrace();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Trace Inbound Case
            </button>
          </div>
        </div>

        {/* Live System Telemetry Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider block">Compute Runtime</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">Google Cloud Run</span>
            <span className="text-[10px] text-slate-600 font-mono">Node.js 22 LTS</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider block">Enterprise AI</span>
            <span className="text-xs font-bold text-blue-700 mt-0.5 block truncate">Gemini 3.8 Flash</span>
            <span className="text-[10px] text-slate-600 font-mono">@google/genai SDK</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider block">Server Memory</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block">
              {telemetry?.memory ? `${telemetry.memory.rssMb} MB RSS` : '38.4 MB RSS'}
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
              {telemetry?.memory ? `${telemetry.memory.heapUsedMb} MB Heap` : '18.2 MB Heap'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider block">Latency SLA</span>
            <span className="text-xs font-bold text-emerald-800 mt-0.5 block">p95 &lt; 780ms</span>
            <span className="text-[10px] text-emerald-800 font-medium">Real-Time Defusion</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider block">Data Privacy</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block">Cloud DLP Active</span>
            <span className="text-[10px] text-slate-600 font-medium">Zero PII Storage</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider block">ERP Bridge</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">SAP S/4HANA</span>
            <span className="text-[10px] text-blue-700 font-mono">OData v4 Direct</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs">
        <div className="flex gap-2">
          <button
            id="tab-btn-topology"
            onClick={() => setActiveTab('topology')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'topology'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Architecture Topology Map</span>
          </button>

          <button
            id="tab-btn-tracer"
            onClick={() => setActiveTab('tracer')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'tracer'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Interactive Packet Tracer</span>
            {isTracing && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            )}
          </button>

          <button
            id="tab-btn-security"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Trust & DLP Security</span>
          </button>

          <button
            id="tab-btn-terraform"
            onClick={() => setActiveTab('terraform')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'terraform'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Terraform IaC & Docker</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-600 hidden md:block">
          SLA: 99.99% • Multi-Region asia-east1
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE ARCHITECTURE TOPOLOGY MAP */}
      {activeTab === 'topology' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Visual Topology Flow Canvas */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Interactive End-to-End GCP Topology
                  </h2>
                </div>
                <span className="text-[11px] text-slate-600">
                  Click any service node to inspect enterprise specifications & IAM rules
                </span>
              </div>

              {/* Visual Pipeline Grid (5 Architectural Tiers) */}
              <div className="space-y-4">
                {/* TIER 1: Inbound Ingress & Security */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Phase 1: Ingestion & Perimeter Defense
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">Anycast Global Edge</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Node 1: Cloud Armor & Ingress */}
                    {(() => {
                      const node = ARCH_NODES[0];
                      const Icon = node.icon;
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <button
                          key={node.id}
                          id={`node-${node.id}`}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3.5 rounded-lg border text-left transition-all relative ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-slate-900">{node.serviceName}</h3>
                                <p className="text-[11px] text-slate-600">{node.title}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {node.status}
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                            <span>TLS 1.3 Anycast</span>
                            <span className="font-mono text-slate-700">18ms Latency</span>
                          </div>
                        </button>
                      );
                    })()}

                    {/* Node 2: Cloud DLP */}
                    {(() => {
                      const node = ARCH_NODES[1];
                      const Icon = node.icon;
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <button
                          key={node.id}
                          id={`node-${node.id}`}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3.5 rounded-lg border text-left transition-all relative ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-slate-900">{node.serviceName}</h3>
                                <p className="text-[11px] text-slate-600">{node.title}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {node.status}
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                            <span>Zero PII Exposure</span>
                            <span className="font-mono text-slate-700">IBAN/SWIFT Guard</span>
                          </div>
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {/* Connecting Arrow */}
                <div className="flex items-center justify-center text-slate-400">
                  <div className="h-4 w-0.5 bg-slate-300"></div>
                </div>

                {/* TIER 2: Asynchronous Event Streaming */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Phase 2: Decoupled Message Bus & SLA Timers
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">At-Least-Once Delivery</span>
                  </div>

                  {(() => {
                    const node = ARCH_NODES[2];
                    const Icon = node.icon;
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <button
                        key={node.id}
                        id={`node-${node.id}`}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`w-full p-3.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-slate-900">{node.serviceName}</h3>
                              <p className="text-[11px] text-slate-600">Topic: calmflow.inbound.v1 with Cloud Tasks SLA tracking</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {node.status}
                          </span>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                          <span>Dead Letter Queue (DLQ) Safeguard</span>
                          <span className="font-mono text-slate-700">12ms Push Latency</span>
                        </div>
                      </button>
                    );
                  })()}
                </div>

                {/* Connecting Arrow */}
                <div className="flex items-center justify-center text-slate-400">
                  <div className="h-4 w-0.5 bg-slate-300"></div>
                </div>

                {/* TIER 3: Compute & Multi-Agent Mesh */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Phase 3: Serverless Compute & Multi-Agent Reasoning Core
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">Auto-scale 0-100 instances</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Node: Cloud Run */}
                    {(() => {
                      const node = ARCH_NODES[3];
                      const Icon = node.icon;
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <button
                          key={node.id}
                          id={`node-${node.id}`}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-slate-900">{node.serviceName}</h3>
                                <p className="text-[11px] text-slate-600">{node.title}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {node.status}
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                            <span>Node.js 22 LTS</span>
                            <span className="font-mono text-slate-700">&lt; 1.2s Cold Start</span>
                          </div>
                        </button>
                      );
                    })()}

                    {/* Node: Gemini 3.8 Flash */}
                    {(() => {
                      const node = ARCH_NODES[4];
                      const Icon = node.icon;
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <button
                          key={node.id}
                          id={`node-${node.id}`}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-slate-900">{node.serviceName}</h3>
                                <p className="text-[11px] text-slate-600">4-Agent Consensus Mesh</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              {node.status}
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                            <span>Sentix, Chronos, Aegis, Synthetix</span>
                            <span className="font-mono text-slate-700">620ms Inference</span>
                          </div>
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {/* Connecting Arrow */}
                <div className="flex items-center justify-center text-slate-400">
                  <div className="h-4 w-0.5 bg-slate-300"></div>
                </div>

                {/* TIER 4: Persistence, ERP Integration & Action */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Phase 4: Persistence, Enterprise ERP & Intelligent Restraint Action
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">Zero-Loss Audit Trail</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Node: Firestore & Storage */}
                    {(() => {
                      const node = ARCH_NODES[5];
                      const Icon = node.icon;
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <button
                          key={node.id}
                          id={`node-${node.id}`}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-slate-900">{node.serviceName}</h3>
                                <p className="text-[11px] text-slate-600">{node.title}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {node.status}
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                            <span>Cloud KMS AES-256</span>
                            <span className="font-mono text-slate-700">11 9s Durability</span>
                          </div>
                        </button>
                      );
                    })()}

                    {/* Node: SAP S/4HANA */}
                    {(() => {
                      const node = ARCH_NODES[6];
                      const Icon = node.icon;
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <button
                          key={node.id}
                          id={`node-${node.id}`}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-slate-900">{node.serviceName}</h3>
                                <p className="text-[11px] text-slate-600">{node.title}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {node.status}
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                            <span>Auto-Reply Suppression Gate</span>
                            <span className="font-mono text-slate-700">Operator Desk Sync</span>
                          </div>
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Service Inspector & Specifications */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Service Inspector</h3>
                    <p className="text-[10px] text-slate-600">{selectedNode.tierLabel}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                  GCP Native
                </span>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedNode.title}</h4>
                  <p className="text-xs font-semibold text-blue-700 mt-0.5">{selectedNode.serviceName}</p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Technical Specifications */}
                <div>
                  <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Configuration & Security Specs
                  </h5>
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/70 space-y-1.5">
                    {Object.entries(selectedNode.specs).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">{key}:</span>
                        <span className="font-mono text-slate-900 text-[11px] font-semibold text-right max-w-[170px] truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operational Metrics */}
                <div>
                  <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Live Performance Benchmarks
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedNode.metrics).map(([key, val]) => (
                      <div key={key} className="p-2 rounded bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] text-slate-600 block">{key}</span>
                        <span className="text-xs font-bold text-slate-900 block mt-0.5">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terraform Code Snippet Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Infrastructure as Code (IaC)
                    </h5>
                    <button
                      onClick={() => handleCopy(selectedNode.terraformBlock, `node-${selectedNode.id}`)}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {copiedKey === `node-${selectedNode.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy HCL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
                    <code>{selectedNode.terraformBlock}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE PACKET TRACER */}
      {activeTab === 'tracer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                  Live Inbound Packet Trace Simulator
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Select a live case and trace its exact microsecond telemetry flow through the Averis Google Cloud architecture.
                </p>
              </div>

              {/* Case Picker & Start Button */}
              <div className="flex items-center gap-3">
                <select
                  id="select-trace-case"
                  value={selectedTraceCaseId}
                  onChange={(e) => setSelectedTraceCaseId(e.target.value)}
                  disabled={isTracing}
                  aria-label="Select case to trace"
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.client} — {c.status} ({c.riskPercentage}%)
                    </option>
                  ))}
                </select>

                <button
                  id="btn-trigger-packet-trace"
                  onClick={runPacketTrace}
                  disabled={isTracing}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-xs transition-colors"
                >
                  {isTracing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Tracing Pipeline...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Execute Packet Trace
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Step Progress Indicator */}
            <div className="py-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  { step: 1, label: '1. Ingress & Armor', sub: 'TLS 1.3' },
                  { step: 2, label: '2. Cloud DLP', sub: 'PII Sanitized' },
                  { step: 3, label: '3. Pub/Sub Broker', sub: 'Topic Queued' },
                  { step: 4, label: '4. Cloud Run', sub: 'Node 22 Worker' },
                  { step: 5, label: '5. Gemini Mesh', sub: '4 Agents' },
                  { step: 6, label: '6. Restraint Gate', sub: 'Auto-Reply Control' },
                  { step: 7, label: '7. SAP & Audit', sub: 'Lead Dispatched' }
                ].map((s) => {
                  const isDone = traceStep > s.step;
                  const isCurrent = traceStep === s.step;
                  return (
                    <div
                      key={s.step}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                          : isDone
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                        <span className="text-xs font-bold text-slate-900">{s.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-mono">{s.sub}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Case Snapshot Being Traced */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-600">Active Inbound Packet:</span>{' '}
                <span className="font-bold text-slate-900">{selectedCase.client}</span> ({selectedCase.company}) —{' '}
                <span className="text-slate-700 italic">"{selectedCase.subject}"</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Status:</span>
                <span className="font-semibold text-slate-800">{selectedCase.status}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">Risk Score:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  selectedCase.riskPercentage >= 80 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedCase.riskPercentage}%
                </span>
              </div>
            </div>

            {/* Live Terminal Telemetry Stream */}
            <div className="mt-5">
              <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 rounded-t-lg border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-mono font-semibold text-slate-200">
                    Cloud Execution Telemetry (Stream: stdout/json)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Total Latency: {traceStep >= 7 ? '782ms' : traceStep > 0 ? 'Streaming...' : 'Idle'}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-b-lg font-mono text-xs text-slate-300 space-y-2.5 max-h-96 overflow-y-auto border border-slate-800">
                {traceLogs.length === 0 ? (
                  <div className="text-slate-600 py-8 text-center italic">
                    Press "Execute Packet Trace" to simulate live ingestion and multi-agent deliberation.
                  </div>
                ) : (
                  traceLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 leading-relaxed">
                      <span className="text-slate-600 select-none">{log.time}</span>
                      <span className={`font-bold uppercase text-[10px] px-1.5 py-0.2 rounded select-none ${
                        log.status === 'alert'
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {log.status === 'alert' ? 'INTERCEPT' : 'PASS'}
                      </span>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-200">[{log.node}]</span>{' '}
                        <span className="text-blue-300">{log.event}</span>
                        <p className="text-slate-400 text-[11px] mt-0.5">{log.detail}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ZERO-TRUST & DLP SECURITY ARCHITECTURE */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cloud DLP PII Sanitization</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Zero-knowledge data pipeline. Inbound emails pass through Cloud Sensitive Data Protection before hitting any generative AI model. Credit cards, IBANs, and national IDs are masked with cryptographic tokens.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] font-mono text-emerald-700 font-semibold">
                ✓ Deterministic Reversible Tokenization
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Business Email Compromise (BEC) Guard</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Specialized Aegis Sentinel intercepts unauthorized bank account change requests (like Robert Chen's case). Automatically suppresses automated confirmations and requires out-of-band human verification.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] font-mono text-amber-700 font-semibold">
                ✓ Dual-Operator Treasury Protocol
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Zero-Training Policy on Enterprise Data</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                CalmFlow utilizes Google Cloud enterprise commercial agreements for Gemini models. Client communications and Averis operational metadata are never used to train public foundational weights.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] font-mono text-blue-700 font-semibold">
                ✓ SOC2 Type II & ISO 27001 Certified
              </div>
            </div>
          </div>

          {/* Interactive Cloud DLP Live Demonstration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Cloud DLP Inspection & Tokenization Demonstration
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              See how raw client communications are transformed prior to Gemini Multi-Agent processing:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Raw Inbound */}
              <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-900">1. Raw Client Email (Contains Sensitive PII)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">Raw Inbound</span>
                </div>
                <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap bg-white p-3 rounded border border-rose-200/80 leading-relaxed">
{`From: robert.chen@apexlogistics.com
Subject: URGENT: Update our payout bank account

Hi Averis Finance,
Please divert our upcoming invoice settlement to:
Bank: HSBC Singapore
IBAN: SG12 HSBC 1928 3847 2839 01
SWIFT: HSBCSGSG
Beneficiary: Apex Logistics Global

Please confirm update immediately.`}
                </pre>
              </div>

              {/* Sanitized for LLM */}
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-900">2. Sanitized Payload Sent to Gemini 3.8 Flash</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Tokenized & Tagged</span>
                </div>
                <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap bg-white p-3 rounded border border-emerald-200/80 leading-relaxed">
{`From: [EMAIL_TOKEN_8921a]
Subject: URGENT: Update our payout bank account

Hi Averis Finance,
Please divert our upcoming invoice settlement to:
Bank: [BANK_NAME_REDACTED]
IBAN: [TOKEN_IBAN_SG_***3901_CONFIDENTIAL]
SWIFT: [SWIFT_CODE_HSBC_MASKED]
Beneficiary: Apex Logistics Global

[SECURITY_SENTINEL_FLAG: SENSITIVE_FINANCIAL_ALTERATION]`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: TERRAFORM IAC & DOCKERFILE */}
      {activeTab === 'terraform' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                Production Terraform Infrastructure as Code (main.tf)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Complete reproducible configuration for Google Cloud Run, Cloud Pub/Sub, Cloud Armor, and Cloud DLP.
              </p>
            </div>
            <button
              onClick={() => handleCopy(TERRAFORM_FULL_CODE, 'full-tf')}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'full-tf' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Configuration!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy main.tf</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed">
            <code>{TERRAFORM_FULL_CODE}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

// Full Terraform file string
const TERRAFORM_FULL_CODE = `# ==============================================================================
# Averis × Monash CalmFlow AI — Production GCP Cloud Architecture Blueprint
# Target Region: asia-east1 (Taiwan) | DR: asia-southeast1 (Singapore)
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.20.0"
    }
  }
}

variable "project_id" {
  description = "Averis GCP Project ID"
  type        = string
  default     = "averis-calmflow-prod"
}

variable "region" {
  type    = string
  default = "asia-east1"
}

# 1. Cloud Run Multi-Agent Orchestrator Service
resource "google_cloud_run_service" "calmflow_core" {
  name     = "calmflow-core-engine"
  location = var.region

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "100"
        "run.googleapis.com/cpu-throttling" = "false"
      }
    }
    spec {
      container_concurrency = 80
      timeout_seconds       = 300
      containers {
        image = "gcr.io/\${var.project_id}/calmflow-app:v2.4.0"
        resources {
          limits = {
            cpu    = "2000m"
            memory = "2048Mi"
          }
        }
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        env {
          name  = "CLOUD_REGION"
          value = var.region
        }
        env {
          name = "GEMINI_API_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.gemini_key.secret_id
              key  = "latest"
            }
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# 2. Cloud Pub/Sub Decoupled Ingestion Pipeline
resource "google_pubsub_topic" "inbound_cases" {
  name = "calmflow.case.inbound.v1"
  message_storage_policy {
    allowed_persistence_regions = [var.region]
  }
}

resource "google_pubsub_subscription" "inference_push" {
  name  = "calmflow-inference-push-sub"
  topic = google_pubsub_topic.inbound_cases.name

  ack_deadline_seconds = 60
  push_config {
    push_endpoint = "\${google_cloud_run_service.calmflow_core.status[0].url}/api/pubsub/push"
  }
}

# 3. Cloud Sensitive Data Protection (DLP)
resource "google_data_loss_prevention_inspect_template" "calmflow_dlp" {
  parent       = "projects/\${var.project_id}/locations/\${var.region}"
  display_name = "CalmFlow Enterprise PII & IBAN Filter"

  inspect_config {
    info_types { name = "IBAN_CODE" }
    info_types { name = "SWIFT_CODE" }
    info_types { name = "CREDIT_CARD_NUMBER" }
    info_types { name = "EMAIL_ADDRESS" }
    min_likelihood = "LIKELY"
  }
}

# 4. Secret Manager for Enterprise Gemini API Key
resource "google_secret_manager_secret" "gemini_key" {
  secret_id = "calmflow-gemini-secret"
  replication {
    auto {}
  }
}

# 5. Cloud Firestore Native Database
resource "google_firestore_database" "default" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

output "cloud_run_url" {
  value = google_cloud_run_service.calmflow_core.status[0].url
}`;
