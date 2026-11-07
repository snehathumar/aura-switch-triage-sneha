import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Zap, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Coins, 
  Activity,
  Sparkles,
  FileText
} from 'lucide-react';
import { ScanResult } from '../types/switch';

export const TrustConsole: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    `Here is the production payment key: sk-live-498102938402948192840219 and our database admin token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. Please process order #8841 for customer jane.doe@acme-corp.com using credit card 4532 8912 3019 4421.`
  );
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showRedacted, setShowRedacted] = useState<boolean>(true);

  // ROI & Token Calculator state
  const [monthlyAgentMessages, setMonthlyAgentMessages] = useState<number>(12500);
  const [avgEngineerHourlyRate, setAvgEngineerHourlyRate] = useState<number>(85);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/trust/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Run initial scan on load
  React.useEffect(() => {
    handleScan();
  }, []);

  // ROI calculations
  // Say an agent saves 12 minutes of engineer triage per task
  const hoursSaved = (monthlyAgentMessages * 0.2).toFixed(0);
  const dollarSavings = (Number(hoursSaved) * avgEngineerHourlyRate).toLocaleString();
  const estimatedTokenCost = ((monthlyAgentMessages * 600 * 0.0000003)).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
          <ShieldCheck size={14} />
          <span>Switch Trust & Security Sentinel</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          In-Flight PII Redaction, Guardrails & ROI Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Enterprises cannot allow engineers to accidentally paste live AWS keys, customer emails, or credit card numbers into AI prompts. Switch Trust intercepts and redacts sensitive data at line rate before payloads reach any LLM.
        </p>
      </div>

      {/* Live PII & Secret Scanner Box */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-400" />
            <h2 className="text-base font-bold text-white">Live In-Flight Interception Simulator</h2>
          </div>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Zap size={14} />
            <span>{isScanning ? 'Scanning...' : 'Re-scan Payload'}</span>
          </button>
        </div>

        {/* Input Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 block">
            Simulate Untrusted Inbound Message (Containing Keys, Cards, or Emails):
          </label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-3 outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed resize-none"
            placeholder="Type text with simulated API keys or emails..."
          />
        </div>

        {/* Scan Results & Findings */}
        {scanResult && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            {/* Status Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                scanResult.hasSecret ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <span className="text-xs font-semibold">API Credentials</span>
                <span className="text-xs font-bold uppercase">{scanResult.hasSecret ? '🚨 Detected' : 'None'}</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                scanResult.hasPii ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <span className="text-xs font-semibold">Customer PII</span>
                <span className="text-xs font-bold uppercase">{scanResult.hasPii ? '⚠️ Detected' : 'None'}</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                scanResult.hasPromptInjection ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <span className="text-xs font-semibold">Adversarial Injection</span>
                <span className="text-xs font-bold uppercase">{scanResult.hasPromptInjection ? '⛔ Flagged' : 'Clean'}</span>
              </div>
            </div>

            {/* Findings List */}
            {scanResult.findings.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Flagged Security Items ({scanResult.findings.length}):</span>
                <div className="space-y-1.5">
                  {scanResult.findings.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {f.type}
                        </span>
                        <span className="text-slate-300">{f.description}</span>
                      </div>
                      <span className="font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {f.match}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sanitized Outbound Prompt (What the LLM sees) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock size={14} className="text-emerald-400" />
                  <span>Sanitized Payload Passed to LLM Context:</span>
                </span>
                <button
                  onClick={() => setShowRedacted(!showRedacted)}
                  className="text-xs text-orange-400 hover:underline flex items-center gap-1"
                >
                  {showRedacted ? <EyeOff size={12} /> : <Eye size={12} />}
                  <span>{showRedacted ? 'Hide Raw' : 'Show Redacted'}</span>
                </button>
              </div>
              <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap">
                {scanResult.redactedText}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Switch ROI & Cost Calculator */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-2">
          <Coins size={18} className="text-orange-400" />
          <h2 className="text-base font-bold text-white">Switch ROI & Engineering Value Metric</h2>
        </div>
        <p className="text-xs text-slate-400">
          SandboxAQ Switch's built-in ROI tracker benchmarks the direct dollar savings of having autonomous AI teammates handle routine incident triage, PR generation, and alert correlation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Monthly Agent Invocations: <strong className="text-white">{monthlyAgentMessages.toLocaleString()}</strong>
              </label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={monthlyAgentMessages}
                onChange={(e) => setMonthlyAgentMessages(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Blended Senior SRE Hourly Rate ($/hr): <strong className="text-white">${avgEngineerHourlyRate}</strong>
              </label>
              <input
                type="range"
                min="50"
                max="250"
                step="5"
                value={avgEngineerHourlyRate}
                onChange={(e) => setAvgEngineerHourlyRate(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>

          {/* Metric 1: Hours Saved */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400">Engineering Hours Saved</span>
            <div className="text-3xl font-extrabold text-white my-2">
              ~{Number(hoursSaved).toLocaleString()} <span className="text-sm font-normal text-slate-400">hrs/mo</span>
            </div>
            <span className="text-[11px] text-emerald-400">Equivalent to ~{(Number(hoursSaved) / 160).toFixed(1)} full-time engineers</span>
          </div>

          {/* Metric 2: Net Dollar ROI */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400">Net Monthly Value Generated</span>
            <div className="text-3xl font-extrabold text-emerald-400 my-2">
              ${dollarSavings}
            </div>
            <span className="text-[11px] text-slate-400">Est. API inference cost: ~${estimatedTokenCost}/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
