import React from 'react';
import { 
  Bot, 
  GitBranch, 
  ShieldCheck, 
  Code2, 
  Settings2, 
  HelpCircle, 
  ExternalLink,
  Layers,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { PlatformType } from '../types/switch';

interface HeaderProps {
  activeTab: 'simulator' | 'repo' | 'markup' | 'trust' | 'config' | 'threats' | 'aura-kit';
  setActiveTab: (tab: 'simulator' | 'repo' | 'markup' | 'trust' | 'config' | 'threats' | 'aura-kit') => void;
  platform: PlatformType;
  setPlatform: (p: PlatformType) => void;
  onOpenWalkthrough: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  platform,
  setPlatform,
  onOpenWalkthrough,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      {/* Top Banner with Repo Highlights */}
      <div className="bg-gradient-to-r from-orange-600/90 via-amber-600/90 to-rose-600/90 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
            GitHub Spotlight
          </span>
          <span>sandbox-quantum/switch: Open-source AI teammates in Slack, Teams, Discord, Telegram & Mattermost</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 opacity-90">
            ⭐ 3,995+ Stars
          </span>
          <span className="flex items-center gap-1 opacity-90">
            ⚖️ Apache 2.0 + Commons Clause
          </span>
          <a
            href="https://github.com/sandbox-quantum/switch"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-orange-200 transition-colors flex items-center gap-1"
          >
            Visit Repo <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2 flex-wrap gap-2">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-500/20">
              <Bot size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-white tracking-tight">SandboxAQ Switch</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Multi-Agent Shared Context Collaboration Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers size={14} />
              <span>Room Simulator (#aura-triage)</span>
            </button>

            <button
              onClick={() => setActiveTab('aura-kit' as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === ('aura-kit' as any)
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-400 hover:text-rose-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles size={14} />
              <span>A.U.R.A. Hackathon Kit</span>
            </button>

            <button
              onClick={() => setActiveTab('repo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'repo'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GitBranch size={14} />
              <span>Repo Deep Dive</span>
            </button>

            <button
              onClick={() => setActiveTab('markup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'markup'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 size={14} />
              <span>Markup Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('trust')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'trust'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Switch Trust</span>
            </button>

            <button
              onClick={() => setActiveTab('threats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'threats'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert size={14} />
              <span>Threat Model</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'config'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Settings2 size={14} />
              <span>Self-Host</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Platform Skin Selector */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium text-[11px]">Chat Skin:</span>
              {(['slack', 'discord', 'teams', 'telegram', 'mattermost'] as PlatformType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition-all ${
                    platform === p
                      ? 'bg-slate-700 text-amber-300 border border-slate-600'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p === 'teams' ? 'Teams' : p}
                </button>
              ))}
            </div>

            {/* Test Walkthrough Button */}
            <button
              onClick={onOpenWalkthrough}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="View verification and test walkthroughs"
            >
              <HelpCircle size={14} className="text-amber-400" />
              <span>Test Walkthrough</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
