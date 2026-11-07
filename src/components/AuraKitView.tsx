import React, { useState } from 'react';
import { Shield, Copy, Check, ExternalLink, Sparkles, Terminal, FileCode, CheckCircle2, Award } from 'lucide-react';

export const AuraKitView: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const yamlContent = `agents:
  - name: "aura-triager"
    description: Analyzes security alerts, classifies severity, and routes confirmed threats
    addressing: anyone
    provider: "{provider}"
    instructions: |
      You are the Lead Cybersecurity Triage Agent for Team A.U.R.A. For every security alert or log reported:
      1. Summarize the threat vector and affected service in one clear line.
      2. Classify it as Critical Incident, False Positive, or Policy Question.
      3. Route Critical Incidents directly to @aura-repro by name for mitigation.

  - name: "aura-repro"
    description: Reproduces security vulnerabilities and writes mitigation patches
    addressing: owner-agents
    provider: "{provider}"
    instructions: |
      When @aura-triager routes a security incident to you:
      1. Write the smallest verification script or firewall/patch command to contain the threat.
      2. Report back in the same thread with the exact remediation steps for human sign-off.

room:
  name: "aura-triage"
  bridge: "{bridge}"
  agents: ["aura-triager", "aura-repro"]
  users: ["{$creator}"]

kickoff: |
  @aura-triager and @aura-repro: Welcome to the A.U.R.A. Cybersecurity Incident Response room. Stand by for incoming threat alerts.`;

  const readmeContent = `# 🛡️ A.U.R.A. (Autonomous Unified Response Agents)
**AI-Driven Cybersecurity Incident Triage & Mitigation Workflow built with Switch**

> **Flip the Switch Hackathon Submission**  
> **Team:** aura (Lead: @snehathumar)  
> **Track:** Track 1 - Best Business Workflow ($2,000)  
> **Side Tracks:** Code with Wispr ($500)

---

## 📌 Overview
Security and DevOps teams often lose critical response time sorting through noisy security alerts, server logs, and vulnerability reports across fragmented dashboards. **A.U.R.A.** brings automated, multi-agent cybersecurity incident triage directly into team chat using **Switch**.

By turning a Discord, Slack, or Telegram channel into a shared Switch Room, A.U.R.A. connects two specialized AI agents that collaborate with human security engineers in real time to classify threats and generate immediate containment scripts.

---

## ⚙️ How We Used Switch

### 1. Connected Agents
We configured two collaborative agents inside our Switch room (\`#aura-triage\`):
* **\`@aura-triager\` (Lead Threat Triager):** Listens to incoming security alerts or suspicious logs reported by teammates, summarizes the threat vector in one clear line, classifies severity (\`Critical Incident\`, \`False Positive\`, or \`Policy Question\`), and routes critical threats directly to \`@aura-repro\`.
* **\`@aura-repro\` (Remediation & Reproduction Agent):** Triggered automatically by \`@aura-triager\` for critical incidents. It writes a minimal verification script or firewall/patch command to isolate the threat and posts the exact remediation steps in the same thread for human sign-off.

### 2. Room & Chat Setup
* **Platform:** Discord / Telegram / Slack bridged via Switch
* **Room Name:** \`aura-triage\`
* **Workflow:** Human teammates drop raw server logs or CVE alerts into the chat channel. Both agents read from the shared room log, hand off tasks autonomously via the Switch protocol, and wait for a human teammate to approve the final rollback or patch command.

---

## 🔄 Room Collaboration Flow

\`\`\`
[Incoming Alert: 5,420 Failed SSH Logins on Production Bastion]
                               │
                               ▼
                   #aura-triage (Switch Room)
                               │
                               ▼
                       [@aura-triager]
       "Critical Incident: SSH Brute Force detected on Bastion. 
       Routing to @aura-repro for containment script."
                               │
                               ▼
                       [@aura-repro]
       "Remediation: iptables -I INPUT 1 -s 198.51.100.24 -p tcp --dport 22 -j DROP
       @Sneha please review and sign off."
                               │
                               ▼
                   [@Sneha: "Approved. Apply."]
                               │
                               ▼
                    [Threat Mitigated & Closed]
\`\`\`

---

## 🎙️ Built by Voice with Wispr Flow ($500 Track Submission)

This entire project—including agent system instructions, \`aura-triage.yaml\` configuration, and documentation—was created and dictated using **Wispr Flow**.

### Wispr Flow Scorecard & Insights:
- **Dictation Speed:** **151 Words Per Minute** (Top 0.1%)
- **Total Words Dictated:** **1,450 Words**
- **AI Prompt Dictation:** **124 AI Prompts Dictated** (88% of desktop usage)
- **Fixes Made by Flow:** **60 fixes** (29 words corrected, 31 dictionary fixes)
- **Active Streak:** **3 Days** (Longest streak | 3 days)

![Wispr Flow Scorecard](wispr-scorecard.png)

---

## 🚀 How to Run It

### Prerequisites
* [Switch](https://github.com/sandbox-quantum/switch) installed on your machine or cloud environment
* A Discord, Slack, or Telegram bridge token
* Any Switch-compatible agent provider (Gemini, Claude Code, OpenCode, or Codex)

### Setup Steps
1. **Clone this repository:**
   \`\`\`bash
   git clone https://github.com/snehathumar/aura-switch-triage.git
   cd aura-switch-triage
   \`\`\`

2. **Launch Switch with the A.U.R.A. room config:**
   \`\`\`bash
   switch run --config aura-triage.yaml
   \`\`\`

3. **Interact in your chat channel:**
   - Drop a security alert into \`#aura-triage\`.
   - Watch \`@aura-triager\` triage and hand off to \`@aura-repro\`.
   - Human lead provides sign-off to mitigate!

---

## ⚖️ License
Apache 2.0`;

  const copyToClipboard = (text: string, filename: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-900/60 via-slate-900 to-amber-900/40 p-6 sm:p-8 rounded-3xl border border-rose-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <Shield size={14} />
            <span>Team aura Official Hackathon Kit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            A.U.R.A. Submission Files & Ready-To-Copy Kit
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            All hackathon submission artifacts, configuration manifests, and verified Wispr Flow telemetry proofs are compiled below. Click to copy any asset directly to your clipboard.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <a
            href="https://github.com/snehathumar/aura-switch-triage"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all"
          >
            <ExternalLink size={14} className="text-amber-400" />
            <span>Open snehathumar/aura-switch-triage</span>
          </a>
          <a
            href="https://www.wemakedevs.org/hackathons/switch"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            <Award size={14} />
            <span>Submit on WeMakeDevs</span>
          </a>
        </div>
      </div>

      {/* Wispr Scorecard Display */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400 shrink-0" />
            <h2 className="text-base font-bold text-white">Wispr Flow Scorecard ($500 Track Verified Proof)</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-semibold">
              ⚡ 151 WPM (Top 0.1%)
            </span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-semibold">
              📝 1,450 Words
            </span>
            <span className="text-xs bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30 font-semibold">
              🤖 124 AI Prompts (88%)
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Official telemetry screenshot verifying 151 WPM dictation speed, 60 Flow fixes, and 1,450 total dictated words:
        </p>
        <div className="rounded-xl overflow-hidden border border-slate-800 max-w-4xl bg-slate-950 shadow-2xl">
          <img
            src="/wispr-scorecard.png"
            alt="Wispr Flow Insights Scorecard"
            className="w-full object-contain"
          />
        </div>
      </div>

      {/* File 1: aura-triage.yaml */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode size={18} className="text-rose-400" />
            <h2 className="text-base font-bold text-white">1. aura-triage.yaml (Switch Room Config)</h2>
          </div>
          <button
            onClick={() => copyToClipboard(yamlContent, 'yaml')}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedFile === 'yaml' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedFile === 'yaml' ? 'Copied to Clipboard!' : 'Copy aura-triage.yaml'}</span>
          </button>
        </div>
        <pre className="bg-slate-950 font-mono text-xs text-amber-300 p-4 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
          {yamlContent}
        </pre>
      </div>

      {/* File 2: README.md */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">2. README.md (Complete Project Documentation)</h2>
          </div>
          <button
            onClick={() => copyToClipboard(readmeContent, 'readme')}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedFile === 'readme' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedFile === 'readme' ? 'Copied to Clipboard!' : 'Copy README.md'}</span>
          </button>
        </div>
        <pre className="bg-slate-950 font-mono text-xs text-emerald-300 p-4 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed max-h-[400px]">
          {readmeContent}
        </pre>
      </div>
    </div>
  );
};
