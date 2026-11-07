import React, { useState, useEffect } from 'react';
import { Code2, ArrowRight, Check, Copy, RefreshCw, Sparkles, Terminal, FileCode, Layers } from 'lucide-react';
import { PlatformType } from '../types/switch';

export const MarkupTransformer: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('incident');
  const [sourceMarkdown, setSourceMarkdown] = useState<string>(
    `**[SEV-2 Incident]** Checkout Service Failure
Error rate reached **14.8%** after commit \`d89a41f\`.
- Investigated by: @sre-triage
- Suggested fix: Add defensive null guard to \`taxCalculationService.ts\`.
Please approve the deployment rollback or emergency hotfix.`
  );
  const [targetPlatform, setTargetPlatform] = useState<PlatformType>('slack');
  const [convertedPayload, setConvertedPayload] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const presets: Record<string, { label: string; text: string }> = {
    incident: {
      label: 'Incident Alert Card',
      text: `**[SEV-2 Incident]** Checkout Service Failure
Error rate reached **14.8%** after commit \`d89a41f\`.
- Investigated by: @sre-triage
- Suggested fix: Add defensive null guard to \`taxCalculationService.ts\`.
Please approve the deployment rollback or emergency hotfix.`,
    },
    pr_review: {
      label: 'Pull Request Review Card',
      text: `**[PR #402 Ready for Sign-Off]** Fix unhandled null postal code
Created by @code-auditor for branch \`fix/tax-calc-null-guard\`.
\`\`\`diff
- const rate = taxTable[region.code].taxRate;
+ const code = region?.code ?? 'DEFAULT';
+ const rate = taxTable[code]?.taxRate ?? 0.08;
\`\`\`
All 24 automated unit tests are green.`,
    },
    multi_agent: {
      label: 'Multi-Agent Delegation Card',
      text: `**Switch Agent Task Delegation**
Task #891: Database Index Optimization
1. @sre-triage collected slow query telemetry from pg_stat_activity.
2. @code-auditor generated migration \`add_index_users_email.sql\`.
3. @trust-sentinel verified no customer PII exposed in query planner.`,
    },
  };

  const loadPreset = (key: string) => {
    setSelectedPreset(key);
    setSourceMarkdown(presets[key].text);
  };

  const handleConvert = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/converter/switch-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: sourceMarkdown,
          targetPlatform,
        }),
      });
      const data = await res.json();
      setConvertedPayload(data.convertedPayload);
    } catch (err) {
      console.error('Failed to convert markdown:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleConvert();
  }, [targetPlatform, sourceMarkdown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(convertedPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
          <Code2 size={14} />
          <span>Universal Chat Markup Protocol</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Switch Markdown Normalization Engine
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Different platforms have contradictory formatting standards (Slack uses <code className="text-orange-300">*bold*</code> and Block Kit JSON, Discord uses <code className="text-orange-300">**bold**</code> and Embeds, Teams uses Adaptive Cards, Telegram uses HTML). Switch compiles markdown into a standardized AST and translates payloads bi-directionally.
        </p>
      </div>

      {/* Preset Pickers */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
        <span className="text-xs font-bold text-slate-400 px-2">Example Payloads:</span>
        {Object.entries(presets).map(([key, p]) => (
          <button
            key={key}
            onClick={() => loadPreset(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedPreset === key
                ? 'bg-orange-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Two Column Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Source Switch Markdown */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-orange-400" />
                <h3 className="text-sm font-bold text-white">Source: Switch Markdown (AST Input)</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Standardized AST
              </span>
            </div>

            <textarea
              rows={12}
              value={sourceMarkdown}
              onChange={(e) => setSourceMarkdown(e.target.value)}
              className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-4 outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed resize-none"
              placeholder="Type Switch Markdown here..."
            />
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span>Supports bold, italics, code blocks, bullet lists, and agent handles</span>
            <span className="font-mono text-orange-400">{sourceMarkdown.length} chars</span>
          </div>
        </div>

        {/* Right Column: Target Platform Compiler Output */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">Target Platform Output</h3>
              </div>

              {/* Target Platform Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['slack', 'discord', 'teams', 'telegram', 'mattermost'] as PlatformType[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTargetPlatform(p)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize transition-all ${
                      targetPlatform === p
                        ? 'bg-orange-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p === 'teams' ? 'Teams' : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Output JSON / Payload View */}
            <div className="relative">
              <pre className="bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 rounded-xl p-4 h-[288px] overflow-auto leading-relaxed">
                {isLoading ? (
                  <div className="text-slate-500 flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin" /> Compiling schema...
                  </div>
                ) : (
                  JSON.stringify(convertedPayload, null, 2)
                )}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 border border-slate-700 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Compiled to {targetPlatform.toUpperCase()} native schema
            </span>
            <span className="text-slate-500 font-mono">AST Type: {convertedPayload?.type || 'normalized'}</span>
          </div>
        </div>
      </div>

      {/* Platform Compatibility Matrix */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers size={18} className="text-orange-400" />
          <span>Switch Cross-Platform Markup Compatibility Matrix</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Feature</th>
                <th className="py-2.5 px-3">Slack</th>
                <th className="py-2.5 px-3">Discord</th>
                <th className="py-2.5 px-3">Microsoft Teams</th>
                <th className="py-2.5 px-3">Telegram</th>
                <th className="py-2.5 px-3">Mattermost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Bold Syntax</td>
                <td className="py-2 px-3 font-mono text-amber-300">*bold*</td>
                <td className="py-2 px-3 font-mono text-amber-300">**bold**</td>
                <td className="py-2 px-3 font-mono text-amber-300">**bold**</td>
                <td className="py-2 px-3 font-mono text-amber-300">&lt;b&gt;bold&lt;/b&gt;</td>
                <td className="py-2 px-3 font-mono text-amber-300">**bold**</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Interactive Buttons</td>
                <td className="py-2 px-3 text-emerald-400">Block Kit Actions</td>
                <td className="py-2 px-3 text-emerald-400">Message Components</td>
                <td className="py-2 px-3 text-emerald-400">Adaptive Card Submit</td>
                <td className="py-2 px-3 text-emerald-400">Inline Keyboards</td>
                <td className="py-2 px-3 text-emerald-400">Interactive Attachments</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Agent Mentions</td>
                <td className="py-2 px-3 font-mono text-sky-300">&lt;@U1234&gt;</td>
                <td className="py-2 px-3 font-mono text-sky-300">&lt;@!1234&gt;</td>
                <td className="py-2 px-3 font-mono text-sky-300">&lt;at&gt;Agent&lt;/at&gt;</td>
                <td className="py-2 px-3 font-mono text-sky-300">@agent_bot</td>
                <td className="py-2 px-3 font-mono text-sky-300">@agent</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Code Blocks</td>
                <td className="py-2 px-3 text-emerald-400">```lang supported</td>
                <td className="py-2 px-3 text-emerald-400">```lang supported</td>
                <td className="py-2 px-3 text-emerald-400">CodeBlock element</td>
                <td className="py-2 px-3 text-emerald-400">&lt;pre&gt;&lt;code&gt;</td>
                <td className="py-2 px-3 text-emerald-400">CommonMark fences</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
