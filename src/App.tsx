import React, { useState } from 'react';
import { Header } from './components/Header';
import { RepoOverview } from './components/RepoOverview';
import { RoomSimulator } from './components/RoomSimulator';
import { MarkupTransformer } from './components/MarkupTransformer';
import { TrustConsole } from './components/TrustConsole';
import { SelfHostConfigurator } from './components/SelfHostConfigurator';
import { AuraKitView } from './components/AuraKitView';
import { ThreatModelView } from './components/ThreatModelView';
import { TestWalkthroughModal } from './components/TestWalkthroughModal';
import { PlatformType } from './types/switch';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'repo' | 'markup' | 'trust' | 'config' | 'threats' | 'aura-kit'>('aura-kit');
  const [platform, setPlatform] = useState<PlatformType>('slack');
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        platform={platform}
        setPlatform={setPlatform}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'repo' && (
          <RepoOverview
            onLaunchSimulator={() => setActiveTab('simulator')}
            onExploreTrust={() => setActiveTab('trust')}
            onExploreConverter={() => setActiveTab('markup')}
          />
        )}

        {activeTab === 'aura-kit' && <AuraKitView />}

        {activeTab === 'simulator' && (
          <RoomSimulator platform={platform} setPlatform={setPlatform} />
        )}

        {activeTab === 'markup' && <MarkupTransformer />}

        {activeTab === 'trust' && <TrustConsole />}

        {activeTab === 'threats' && <ThreatModelView />}

        {activeTab === 'config' && <SelfHostConfigurator />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SandboxAQ Switch</span>
            <span>&bull;</span>
            <span className="text-orange-400 font-mono">sandbox-quantum/switch</span>
            <span>&bull;</span>
            <span>Apache 2.0 + Commons Clause</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsWalkthroughOpen(true)}
              className="text-slate-400 hover:text-amber-300 transition-colors"
            >
              Test Walkthrough
            </button>
            <a
              href="https://github.com/sandbox-quantum/switch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              GitHub Repo
            </a>
            <a
              href="https://www.switchagents.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              switchagents.ai
            </a>
          </div>
        </div>
      </footer>

      {/* Functional Test Walkthrough Modal */}
      <TestWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
    </div>
  );
}
