import React, { useState } from 'react';
import { Shield, Copy, Check, ExternalLink, Sparkles, Terminal, FileCode, CheckCircle2, Award, Video } from 'lucide-react';
import { VideoWalkthrough } from './VideoWalkthrough';

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

  const readmeContent = `# 🛡️ A.U.R.A. — Autonomous Unified Response Agents

**Human-in-the-loop security incident triage, running as a team of AI agents in a Switch room.**

> **Flip the Switch Hackathon** · Team: \`aura\` (lead: @snehathumar) · Track 1 — Best Business Workflow  
> **Demo video (OneDrive Cloud Stream):** https://1drv.ms/v/c/2b13bd8cb0e5c2dd/IQA2jMKnnFWPR5vsMPITMbR2AR3h2E9Eg1PeOK-E3sprv6c?e=gMZjrr  
> **Interactive Web Demo:** https://ais-pre-qjnd5iymcdcnfitfqq3fkg-922040312159.asia-east1.run.app  
> **GitHub Repository:** https://github.com/snehathumar/aura-switch-triage  

---

## The problem

Security alerts arrive in many tools. An analyst copies logs into a chat, decides the severity by hand, searches for the right containment command, and then writes the post-incident report afterwards. Context gets lost between people and tools.

## What A.U.R.A. does

A.U.R.A. moves that loop into one Switch room. A person posts an alert and tags **one** agent. The agents then hand the work to each other and stop for a human before anything is closed.

\`\`\`
 Human:   @aura-triager <alert>
             │
             ▼
 aura-triager   summarizes the alert, classifies it
                (Critical Incident / False Positive / Policy Question)
             │  Critical Incident only → tags aura-repro
             ▼
 aura-repro     proposes the smallest containment steps and explains them.
                It does NOT run anything. Asks a human to approve.
             │
             ▼
 Human:   @aura-repro approved
             │
             ▼
 aura-reporter  writes the incident report from facts in the room thread
\`\`\`

The room history is the audit trail. The agents remember earlier incidents in the room (for example, they keep two different attackers on separate watch lists).

## How we used Switch

- **Local Switch server** started by **Switch Console (v0.40.1)** on Windows, with the **bundled Mattermost** as the chat app.
- **Three workflow agents** on **OpenCode**: \`aura-triager\`, \`aura-repro\`, \`aura-reporter\` (Console also shows the default \`switch-buddy-admin\` helper, which is not part of the workflow).
- **One room, \`#aura-triage\`**, with **room instructions** that Switch sends to every agent when it joins the room. They set the workflow rules: agents only propose, humans approve, and an agent never states that a fix was applied unless a human confirmed it.
- **Agent-to-agent handoff** by @mention inside threads. In Switch, agents answer when they are mentioned, so a human tags only the first agent and approves once.
- **Per-agent instructions** in \`aura-triage.yaml\` (roles for triage, containment proposals, and reporting).

## Safety and honesty

- **All alerts in the demo are synthetic** (\`sample-alerts.txt\`). There is no real server, AWS account, or production system behind them. Addresses use reserved documentation ranges (\`203.0.113.0/24\`, \`198.51.100.0/24\`, \`192.0.2.0/24\`).
- **Agents propose commands; humans run them.** The agents have no access to any real infrastructure.
- **Limitation:** "human approval first" is enforced by room and agent instructions, not by a technical gate. A production setup would add per-agent least-privilege access and real approval controls.

## Reproduce it

**Requirements:** Docker Desktop (running), Switch Console, and one agent provider. We used **OpenCode** with a model API key (do not commit keys).

1. Install and start **Docker Desktop**.
2. Install **Switch Console** (from the hackathon Resources page or the Switch releases). On first start choose **Run a server on this computer** and wait for it to finish its first-time download.
3. Install **OpenCode** (\`npm install -g opencode-ai\`), then connect a model provider.
4. In Switch Console, create three agents with provider **OpenCode**: \`aura-triager\`, \`aura-repro\`, \`aura-reporter\`. Use the roles and instructions from [\`aura-triage.yaml\`](aura-triage.yaml).
5. Create a room named \`aura-triage\`, add the three agents, and paste the room instructions from the **Room instructions** section below into the room's **Configuration** tab.
6. Post an alert from [\`sample-alerts.txt\`](sample-alerts.txt), tagging the first agent:
   \`@aura-triager ALERT: 342 SQL injection attempts on web-03 exfiltrating 4.1MB from 198.51.100.24\`
7. When \`aura-repro\` asks for approval, reply in its thread: \`@aura-repro approved\`

### Room instructions

\`\`\`
Team A.U.R.A. Security Operations & Threat Triage Center.

Workflow:
- People post security alerts, suspicious logs or CVEs here. Only aura-triager responds to a new alert.
- aura-triager summarizes the alert in one line, classifies it (Critical Incident, False Positive, or Policy Question) and, for a Critical Incident only, hands off to aura-repro by tagging it.
- aura-repro proposes the smallest containment commands, explains them, and asks the human on call for approval. Agents only propose; humans run any command.
- After the human approves, aura-repro tags aura-reporter, which writes the incident report.
- Never state that a fix was applied or verified unless a human confirmed it in this room.
\`\`\`

## Extra: interactive mock (not the live Switch run)

This repo also contains a small web app that **simulates** the room flow with Gemini-generated replies, for people who want to click through the idea without installing Switch. **It is not connected to Switch and is not the live demo.**  
🔗 **Live Interactive Applet:** [https://ais-pre-qjnd5iymcdcnfitfqq3fkg-922040312159.asia-east1.run.app](https://ais-pre-qjnd5iymcdcnfitfqq3fkg-922040312159.asia-east1.run.app)

## Built with Wispr Flow (Code with Wispr side track)

We used **Wispr Flow** to dictate prompts to AI assistants, architect multi-agent rules, and draft documentation.
Wispr Flow Insights at the time of submission: **151 words per minute (shown as "Top 0.1%" in the app)**, **1,450 words dictated**, and **3 days streak** with **88% AI Prompts**.

### Verified Telemetry Proofs (Line by Line):

1. **Flow Highlights:**  
   ![Wispr Flow Highlights](wispr-highlights.png)

2. **Top 0.1% Speed Proof (151 WPM):**  
   ![Wispr Speed Proof](wispr-speed.png)

3. **Total Words Dictated (1,450 Words):**  
   ![Wispr Words Proof](wispr-words.png)

4. **AI Prompts Breakdown (88% Prompts):**  
   ![Wispr Prompts Breakdown](wispr-prompts.png)

5. **3-Day Development Streak:**  
   ![Wispr Streak Proof](wispr-streak.png)

6. **Activity Heatmap Telemetry:**  
   ![Wispr Activity Heatmap](wispr-activity.png)

7. **Full Desktop Telemetry Scorecard:**  
   ![Wispr Flow Full Desktop Dashboard](wispr-scorecard.png)

## Limitations and next steps

- Approval is policy, not an enforced gate.
- Agents do not read real log sources yet. Next step: read-only connectors (for example logs and tickets) with least-privilege access per agent.
- Quality depends on the model behind each agent.

## License

Apache-2.0`;

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

        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <a
            href="https://1drv.ms/v/c/2b13bd8cb0e5c2dd/IQA2jMKnnFWPR5vsMPITMbR2AR3h2E9Eg1PeOK-E3sprv6c?e=gMZjrr"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
          >
            <Video size={14} className="text-amber-300" />
            <span>Watch Video on OneDrive</span>
          </a>
          <a
            href="https://github.com/snehathumar/aura-switch-triage"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all"
          >
            <ExternalLink size={14} className="text-amber-400" />
            <span>Open GitHub Repo</span>
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

      {/* Official Video Walkthrough with Synchronized Female Voiceover */}
      <VideoWalkthrough />

      {/* Wispr Flow Official Verified Telemetry Cards Showcase (Line by Line) */}
      <div className="space-y-8">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-amber-400 shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Wispr Flow Official Telemetry Cards ($500 Track Verified Proof)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  All 6 official Wispr Flow export cards + full desktop dashboard displayed line by line for hackathon track evaluation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30 font-bold">
                ⚡ 151 WPM (Top 0.1%)
              </span>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/30 font-bold">
                📝 1,450 Words
              </span>
              <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-full border border-orange-500/30 font-bold">
                🤖 124 AI Prompts (88%)
              </span>
            </div>
          </div>

          {/* Cards Line by Line */}
          <div className="space-y-8 pt-2">
            {[
              {
                num: '1',
                title: 'Flow Highlights (Executive Summary)',
                badge: '⚡ 151 WPM • 1,450 Words • 3 Days Streak • 8 Apps',
                badgeColor: 'border-purple-500/40 bg-purple-500/20 text-purple-300',
                desc: 'Executive telemetry overview verifying 3-day daily streak, 1,450 total dictated words, 151 WPM average speed, and 8 development apps used.',
                src: '/wispr-highlights.png',
                alt: 'Wispr Flow Highlights Card'
              },
              {
                num: '2',
                title: 'How Fast You Flow (Top 0.1% Speed Proof)',
                badge: '⚡ 151 Words Per Minute (Top 0.1% Globally)',
                badgeColor: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300',
                desc: 'Official speed proof confirming peak dictation rate of 151 Words Per Minute, placing in the top 0.1% of global Wispr Flow users.',
                src: '/wispr-speed.png',
                alt: 'How fast you Flow - 151 WPM'
              },
              {
                num: '3',
                title: 'Total Words Dictated (Volume Proof)',
                badge: '📝 1,450 Total Words Dictated',
                badgeColor: 'border-violet-500/40 bg-violet-500/20 text-violet-300',
                desc: 'Volume evaluation verifying 1,450 total dictated words ("equivalent to 14 folk tales") used to write Switch YAML configs, agent rules, and docs.',
                src: '/wispr-words.png',
                alt: 'Total words dictated - 1,450'
              },
              {
                num: '4',
                title: 'Where You Flow (88% AI Prompts Breakdown)',
                badge: '🤖 88% Dictation (124 AI Prompts)',
                badgeColor: 'border-orange-500/40 bg-orange-500/20 text-orange-300',
                desc: 'Application breakdown proving 88% of dictation (124 AI prompts) went directly into prompt engineering Switch collaborative agent roles.',
                src: '/wispr-prompts.png',
                alt: 'Where you Flow - 88% AI Prompts'
              },
              {
                num: '5',
                title: 'Flow Streak (3 Days Active)',
                badge: '🔥 3 Days Daily Streak',
                badgeColor: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
                desc: 'Daily streak verification confirming active daily voice development momentum throughout the hackathon build sprint.',
                src: '/wispr-streak.png',
                alt: 'Flow Streak - 3 Days'
              },
              {
                num: '6',
                title: 'Your Flow Activity (Calendar Telemetry Heatmap)',
                badge: '📅 Calendar Heatmap Grid',
                badgeColor: 'border-teal-500/40 bg-teal-500/20 text-teal-300',
                desc: 'Contribution heatmap telemetry confirming continuous live voice sessions in November 2026 for the Flip the Switch Hackathon.',
                src: '/wispr-activity.png',
                alt: 'Your Flow activity - Heatmap'
              },
              {
                num: '7',
                title: 'Full Desktop Insights Dashboard',
                badge: '🛠️ 60 Flow Corrections (29 Words, 31 Dict Fixes)',
                badgeColor: 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300',
                desc: 'Complete system dashboard verifying 60 Flow automated corrections, desktop app usage telemetry, and full Wispr Flow insights.',
                src: '/wispr-scorecard.png',
                alt: 'Wispr Flow Full Desktop Dashboard'
              }
            ].map((card) => (
              <div
                key={card.num}
                className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4 shadow-2xl transition-all hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {card.num}
                    </span>
                    <h3 className="text-base font-bold text-white">{card.title}</h3>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.desc}
                </p>
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 max-w-3xl shadow-xl">
                  <img
                    src={card.src}
                    alt={card.alt}
                    className="w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
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
