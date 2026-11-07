import React, { useState } from 'react';
import { 
  GitBranch, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  ArrowRight, 
  Users, 
  CheckCircle2, 
  Zap, 
  Server,
  Lock,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface RepoOverviewProps {
  onLaunchSimulator: () => void;
  onExploreTrust: () => void;
  onExploreConverter: () => void;
}

export const RepoOverview: React.FC<RepoOverviewProps> = ({
  onLaunchSimulator,
  onExploreTrust,
  onExploreConverter,
}) => {
  const [selectedArchNode, setSelectedArchNode] = useState<string>('hub');
  const [activeLevel, setActiveLevel] = useState<number>(2);

  const archNodes = {
    adapters: {
      title: '1. Multi-Platform Adapters',
      tagline: 'Translates native webhooks & payloads',
      desc: 'Connects directly to Slack Events API, Discord Gateway, Microsoft Teams Bot Framework, Telegram Bot API, and Mattermost webhooks. Every inbound chat message is normalized immediately.',
      tech: 'Webhooks, Websockets, Platform SDKs, HMAC Signature Verification',
    },
    markup: {
      title: '2. Switch Markdown Normalizer',
      tagline: 'Universal cross-platform AST',
      desc: 'Normalizes markdown nuances across platforms. Slack bold (*bold*) vs Discord/Teams (**bold**), inline mentions, attachments, and interactive buttons are compiled into a unified Switch AST and translated back losslessly.',
      tech: 'Custom Parser, AST Transformation, Block Kit / Adaptive Card Emitters',
    },
    hub: {
      title: '3. Switch Room Authority & Bus',
      tagline: 'Shared context & multi-agent orchestrator',
      desc: 'The central orchestration brain. Maintains thread history, channel context, role permissions, and agent registration. Multiple AI agents can join the room, listen to each other, and hand off tasks autonomously.',
      tech: 'Event Emitter, Pub/Sub Bus, State Machine, Redis/Memory Session Cache',
    },
    harness: {
      title: '4. Agent Harness Layer',
      tagline: 'Pluggable agent execution runtime',
      desc: 'Connects to any AI engine without vendor lock-in. Supports Claude Code CLI, Google Gemini SDK, OpenAI Codex, LangChain, AutoGen, and Model Context Protocol (MCP) servers running locally or in the cloud.',
      tech: 'MCP Client, Google GenAI SDK, Anthropic SDK, Subprocess Spawner',
    },
    trust: {
      title: '5. Switch Trust & Guardrails',
      tagline: 'Enterprise compliance, PII redaction & ROI',
      desc: 'In-flight security sentinel. Redacts API tokens, emails, and sensitive credentials before they ever hit LLM prompts. Enforces RBAC so agents only access authorized rooms, and tracks token consumption for ROI metrics.',
      tech: 'Regex Pattern Redaction, Presidio Entity Recognizer, Token Metering',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <Sparkles size={14} />
            <span>SandboxAQ Open-Source Innovation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            AI Teammates in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400">Slack, Teams & Discord</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            <strong>Switch</strong> (<code className="text-orange-300 bg-orange-950/40 px-1.5 py-0.5 rounded text-sm">sandbox-quantum/switch</code>) is an open-source platform that transforms everyday team messaging channels into shared rooms where humans and AI agents collaborate side-by-side with full context.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onLaunchSimulator}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Zap size={16} className="fill-slate-950" />
              <span>Launch Live Room Simulator</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onExploreTrust}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all"
            >
              <ShieldCheck size={16} className="text-amber-400" />
              <span>Test Switch Trust Guardrails</span>
            </button>

            <a
              href="https://github.com/sandbox-quantum/switch"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white font-medium text-sm border border-slate-800 flex items-center gap-2 transition-colors"
            >
              <GitBranch size={16} />
              <span>GitHub Repository</span>
              <ExternalLink size={14} className="opacity-70" />
            </a>
          </div>
        </div>

        {/* Quick Spec Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800/80">
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Supported Platforms</div>
            <div className="text-lg font-bold text-white mt-1">Slack, Teams, Discord</div>
            <div className="text-[11px] text-orange-400">+ Telegram & Mattermost</div>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Agent Harnesses</div>
            <div className="text-lg font-bold text-white mt-1">Any Agent / Model</div>
            <div className="text-[11px] text-emerald-400">Claude Code, Gemini, MCP, OpenAI</div>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Self-Hosting</div>
            <div className="text-lg font-bold text-white mt-1">100% On-Premise</div>
            <div className="text-[11px] text-sky-400">Docker, Cloud Run, Kubernetes</div>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Enterprise Guardrails</div>
            <div className="text-lg font-bold text-white mt-1">Switch Trust</div>
            <div className="text-[11px] text-amber-400">PII Redaction, RBAC, Token ROI</div>
          </div>
        </div>
      </div>

      {/* The 3 Adoption Levels */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">How Teams Adopt Switch (The 3 Levels)</h2>
            <p className="text-sm text-slate-400 mt-1">
              Switch is designed for progressive adoption from single-channel developer assistance to enterprise-wide autonomous multi-agent operations.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeLevel === lvl
                    ? 'bg-orange-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Level {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level 1 */}
          <div 
            onClick={() => setActiveLevel(1)}
            className={`p-6 rounded-2xl border transition-all cursor-pointer ${
              activeLevel === 1 
                ? 'bg-slate-900 border-orange-500/60 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/30' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                Level 1
              </span>
              <Users size={18} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Everyday Agents in Chat</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Your agents move directly into the team chat channels where work happens. No isolated web dashboards or pasting logs.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span>Pair-program with a colleague and your Claude Code agent in one channel.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span>Teammates can review agent conversations in-line with full context history.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span>Stand up specialized agents that anyone on the team can question directly.</span>
              </li>
            </ul>
          </div>

          {/* Level 2 */}
          <div 
            onClick={() => setActiveLevel(2)}
            className={`p-6 rounded-2xl border transition-all cursor-pointer ${
              activeLevel === 2 
                ? 'bg-slate-900 border-orange-500/60 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/30' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold">
                Level 2 (Featured)
              </span>
              <Cpu size={18} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Encoding How Work Runs</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Channels become self-organizing pipelines where manager agents auto-triage, reproduce bugs, and file tickets.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span><strong>Bootstrap Channel:</strong> Manager agent spawns work channels & invites agents.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span><strong>Incident Room:</strong> Agent correlates error spike with bad deploy and opens hotfix PR.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span><strong>Bug Triage:</strong> Agent collects system logs, versions, and reproduces error trace.</span>
              </li>
            </ul>
          </div>

          {/* Level 3 */}
          <div 
            onClick={() => setActiveLevel(3)}
            className={`p-6 rounded-2xl border transition-all cursor-pointer ${
              activeLevel === 3 
                ? 'bg-slate-900 border-orange-500/60 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/30' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                Level 3
              </span>
              <Layers size={18} className="text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Autonomous Multi-Agent Org</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Multiple agents across different roles collaborate autonomously with human oversight at critical gates.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span>Triage agent finds bug &rarr; coding agent fixes &rarr; human approves &rarr; deploy agent ships.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span>On-call alert auto-summarized and appended to team runbook knowledge base.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span>Cross-agent handoffs retain full historical context without lost knowledge.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Architecture Breakdown */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Switch Architectural Pipeline</h2>
          <p className="text-sm text-slate-400 mt-1">
            Click any component node below to inspect its internal engineering, protocols, and data flow.
          </p>
        </div>

        {/* Pipeline Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(archNodes).map(([key, node]) => (
            <button
              key={key}
              onClick={() => setSelectedArchNode(key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedArchNode === key
                  ? 'bg-orange-500/10 border-orange-500 text-white shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-orange-400 mb-1">{key}</div>
              <div className="text-xs font-bold text-white truncate">{node.title.replace(/^\d+\.\s*/, '')}</div>
              <div className="text-[11px] text-slate-400 truncate mt-1">{node.tagline}</div>
            </button>
          ))}
        </div>

        {/* Selected Node Details Box */}
        {archNodes[selectedArchNode as keyof typeof archNodes] && (
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {archNodes[selectedArchNode as keyof typeof archNodes].title}
                </h3>
                <p className="text-xs text-orange-400 font-medium">
                  {archNodes[selectedArchNode as keyof typeof archNodes].tagline}
                </p>
              </div>
              <div className="text-xs bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-slate-400">
                Component Inspector
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {archNodes[selectedArchNode as keyof typeof archNodes].desc}
            </p>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs">
              <span className="font-semibold text-slate-400">Technical Foundation: </span>
              <span className="text-amber-300 font-mono">
                {archNodes[selectedArchNode as keyof typeof archNodes].tech}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {selectedArchNode === 'markup' && (
                <button
                  onClick={onExploreConverter}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Markup Playground</span>
                  <ChevronRight size={14} />
                </button>
              )}
              {selectedArchNode === 'trust' && (
                <button
                  onClick={onExploreTrust}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Switch Trust Scanner</span>
                  <ChevronRight size={14} />
                </button>
              )}
              {selectedArchNode === 'hub' && (
                <button
                  onClick={onLaunchSimulator}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Simulate Room Collaboration</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Switch vs Traditional Bots Comparison */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white">Why Switch is Different from Traditional AI Bots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/70 p-6 rounded-xl border border-rose-900/30 space-y-3">
            <div className="text-rose-400 font-bold text-sm flex items-center gap-2">
              <span>Traditional AI Bots (Legacy)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">&times;</span>
                <span>Isolated 1:1 direct messages; other engineers cannot see the agent's work.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">&times;</span>
                <span>Context lost whenever the chat session ends or another tool is used.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">&times;</span>
                <span>Vendor lock-in: tied to one proprietary assistant UI (e.g. only web tabs).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">&times;</span>
                <span>Agents cannot talk to each other or hand off tasks to specialized teammates.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-950/70 p-6 rounded-xl border border-emerald-900/30 space-y-3">
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
              <span>SandboxAQ Switch (Modern Multi-Agent Team)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&#10003;</span>
                <span>Agents join native team channels (Slack, Teams, Discord) alongside everyone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&#10003;</span>
                <span>Shared room context: full audit trail of questions, debug logs, and decisions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&#10003;</span>
                <span>Any model & harness: Claude Code on laptop, Gemini on server, LangChain on cloud.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&#10003;</span>
                <span>Multi-agent coordination: SRE agent investigates &rarr; Code agent opens pull request.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
