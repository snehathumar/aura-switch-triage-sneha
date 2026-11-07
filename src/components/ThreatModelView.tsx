import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  FileCode, 
  Database, 
  Radio, 
  Cpu, 
  Flame, 
  KeyRound,
  ExternalLink
} from 'lucide-react';

export const ThreatModelView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'zones' | 'owasp' | 'reviewer'>('zones');

  const threatZones = [
    {
      zone: '1. Input Surfaces',
      icon: Terminal,
      risk: 'Malicious chat messages, webhook spoofing from untrusted IP, oversized payloads, nested JSON bombs.',
      threatVector: 'OWASP LLM01 / LLM02',
      countermeasures: [
        'HMAC SHA256 signature verification on inbound Slack/Teams/Discord webhooks.',
        'Strict schema validation using Zod/TypeScript guards before payload routing.',
        'Hard body size limit (10MB) configured in Express middleware.',
        'Null-safe defensive destructuring: (req.body && typeof req.body === "object") ? req.body : {}.',
      ],
      status: 'MITIGATED',
      severity: 'HIGH',
    },
    {
      zone: '2. Planning & Reasoning',
      icon: Cpu,
      risk: 'Indirect prompt injection in tickets or log traces attempting to override agent instructions or escape guardrails.',
      threatVector: 'OWASP LLM01',
      countermeasures: [
        'Data-vs-Instruction separation: Untrusted log traces enclosed in explicit delimited context blocks.',
        'In-flight Switch Trust sentinel scanning for jailbreak patterns prior to inference.',
        'System instructions enforce role boundaries (e.g. @sre-triage cannot run arbitrary shell code without human confirmation).',
      ],
      status: 'MITIGATED',
      severity: 'CRITICAL',
    },
    {
      zone: '3. Tool Execution',
      icon: Flame,
      risk: 'SSRF via MCP tool connectors, unauthorized Git branch deletion, rogue database writes.',
      threatVector: 'OWASP LLM07 / LLM08',
      countermeasures: [
        'Human-in-the-loop (HITL) mandatory sign-off button for destructive actions (e.g. merge hotfix PR, delete pod).',
        'Strict egress IP allowlisting and domain whitelisting for tool execution servers.',
        'Least privilege API keys: Read-only tokens for telemetry, branch-restricted tokens for GitHub hotfixes.',
      ],
      status: 'MITIGATED',
      severity: 'CRITICAL',
    },
    {
      zone: '4. Memory & State',
      icon: Database,
      risk: 'Cross-channel context leakage, unauthorized agent access to private executive channels, session hijacking.',
      threatVector: 'OWASP A01 (Broken Access Control)',
      countermeasures: [
        'Channel isolation boundaries: Agents only receive events for rooms where explicitly assigned.',
        'Owner-bound Firestore security rules: request.auth.uid == userId for personal preferences.',
        'Zero-insecure default: Strict deny-all fallback for unspecified collections.',
      ],
      status: 'MITIGATED',
      severity: 'HIGH',
    },
    {
      zone: '5. Inter-System Communication',
      icon: Radio,
      risk: 'Leaking customer PII, Stripe tokens, or Google Workspace credentials in outbound webhook calls or AI training sinks.',
      threatVector: 'OWASP LLM06 / OWASP A02',
      countermeasures: [
        'Line-rate Switch Trust PII redaction: regex & Presidio stripping of API keys, CCs, and emails in-flight.',
        'Zero hardcoded API keys: Secrets dynamically retrieved from Google Secret Manager / process.env.',
        'Bearer token stripping prior to logging or caching payloads.',
      ],
      status: 'MITIGATED',
      severity: 'CRITICAL',
    },
  ];

  const codeRemediations = [
    {
      title: 'Vulnerability #1: Hardcoded Secrets & Dynamic Ingestion (Critical)',
      description: 'Hardcoded API tokens in client code expose corporate accounts. Handlers crashing on undefined bodies cause denial of service.',
      diffBefore: `// INSECURE: Hardcoded credentials & unsafe destructuring
const API_KEY = "AIzaSyD-untrusted-hardcoded-secret";
app.post('/api/chat', (req, res) => {
  const { message } = req.body; // Crashes if req.body is undefined!
  ...
});`,
      diffAfter: `// REMEDIATED: Secret Manager & Defensive Ingestion
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY environment variable missing");

app.post('/api/chat', async (req, res) => {
  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const message = typeof body.message === 'string' ? body.message : '';
  ...
});`,
    },
    {
      title: 'Vulnerability #2: Insecure Firestore Security Rules (Critical)',
      description: 'Wildcard read/write access enables any unauthenticated user to read proprietary incident discussions and wipe rooms.',
      diffBefore: `// INSECURE: Open read/write to world
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // CRITICAL VULNERABILITY!
    }
  }
}`,
      diffAfter: `// REMEDIATED: Owner-Bound & RBAC Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /channels/{channelId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.authorId == request.auth.uid;
    }
    match /{document=**} {
      allow read, write: if false; // Secure Default Deny
    }
  }
}`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-2">
          <ShieldAlert size={14} />
          <span>Security Reviewer & Agentic Threat Model</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Agentic Threat Matrix (The 5 Threat Zones)
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Multi-agent collaborative platforms execute sensitive code, process enterprise communications, and interact with external systems. Here is the structured security model and verification review.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'zones'
              ? 'bg-orange-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          The 5 Threat Zones Matrix
        </button>
        <button
          onClick={() => setActiveTab('reviewer')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'reviewer'
              ? 'bg-orange-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Security Reviewer Findings & Diffs
        </button>
      </div>

      {/* 5 Threat Zones Table */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {threatZones.map((tz, idx) => {
              const Icon = tz.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-orange-400">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{tz.zone}</h3>
                        <span className="text-[11px] text-amber-400 font-mono">{tz.threatVector}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tz.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {tz.severity} SEVERITY
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        {tz.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400">Threat Scenario:</span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono">
                      {tz.risk}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400">Implemented Countermeasures:</span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {tz.countermeasures.map((cm, cidx) => (
                        <li key={cidx} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security Reviewer Findings & Remediation Diffs */}
      {activeTab === 'reviewer' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound size={18} className="text-orange-400" />
              <span>Concrete Vulnerability Remediations & Code Diffs</span>
            </h2>
            <p className="text-xs text-slate-400">
              In accordance with Production Directive #5 (Security Reviewer Persona), here are concrete code remediation diffs mapping insecure anti-patterns to production-hardened implementations.
            </p>
          </div>

          <div className="space-y-6">
            {codeRemediations.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl"
              >
                <div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  {/* Before */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      <span>Insecure Pattern (Before)</span>
                    </span>
                    <pre className="bg-slate-950 font-mono text-[11px] text-rose-300 border border-rose-900/40 rounded-xl p-4 overflow-auto leading-relaxed">
                      {item.diffBefore}
                    </pre>
                  </div>

                  {/* After */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Remediated Secure Standard (After)</span>
                    </span>
                    <pre className="bg-slate-950 font-mono text-[11px] text-emerald-300 border border-emerald-900/40 rounded-xl p-4 overflow-auto leading-relaxed">
                      {item.diffAfter}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
