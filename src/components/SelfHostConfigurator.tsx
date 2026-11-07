import React, { useState } from 'react';
import { Settings2, Server, Terminal, Copy, Check, Download, Layers, Shield, Key } from 'lucide-react';

export const SelfHostConfigurator: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'yaml' | 'docker' | 'cloudrun'>('yaml');
  const [copied, setCopied] = useState<boolean>(false);

  // Configuration form fields
  const [enableSlack, setEnableSlack] = useState<boolean>(true);
  const [enableDiscord, setEnableDiscord] = useState<boolean>(true);
  const [enableTeams, setEnableTeams] = useState<boolean>(false);
  const [primaryModel, setPrimaryModel] = useState<string>('gemini-3.6-flash');
  const [enableMCP, setEnableMCP] = useState<boolean>(true);
  const [trustPiiRedaction, setTrustPiiRedaction] = useState<boolean>(true);

  // Generate switch.config.yaml
  const generateYaml = () => {
    return `# SandboxAQ Switch Core Configuration (v2.4)
# Generated for Self-Hosted Deployment
version: '2.4'

server:
  host: '0.0.0.0'
  port: 8080
  cors:
    allowed_origins: ['*']

messaging_platforms:
  slack:
    enabled: ${enableSlack}
    bot_token: '\${SLACK_BOT_TOKEN}'
    app_token: '\${SLACK_APP_TOKEN}'
    signing_secret: '\${SLACK_SIGNING_SECRET}'
  discord:
    enabled: ${enableDiscord}
    bot_token: '\${DISCORD_BOT_TOKEN}'
    public_key: '\${DISCORD_PUBLIC_KEY}'
  teams:
    enabled: ${enableTeams}
    app_id: '\${TEAMS_APP_ID}'
    app_password: '\${TEAMS_APP_PASSWORD}'

agent_harnesses:
  default_provider: 'google_genai'
  models:
    primary: '${primaryModel}'
    fallback_ladder:
      - 'gemini-3.6-flash'
      - 'gemini-3.1-flash-lite'
      - 'gemini-flash-latest'
  mcp_servers:
    enabled: ${enableMCP}
    connectors:
      - name: 'github'
        command: 'npx'
        args: ['-y', '@modelcontextprotocol/server-github']
      - name: 'sentry'
        command: 'npx'
        args: ['-y', '@modelcontextprotocol/server-sentry']

switch_trust:
  pii_redaction: ${trustPiiRedaction}
  sensitive_patterns:
    - 'API_KEYS'
    - 'CREDIT_CARDS'
    - 'BEARER_TOKENS'
    - 'CUSTOMER_EMAILS'
  prompt_injection_guard: true
  token_budget_monthly: 50000000
`;
  };

  const generateDockerCompose = () => {
    return `version: '3.8'

services:
  switch-core:
    image: ghcr.io/sandbox-quantum/switch:latest
    container_name: switch-hub
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - SLACK_BOT_TOKEN=\${SLACK_BOT_TOKEN}
      - SLACK_APP_TOKEN=\${SLACK_APP_TOKEN}
      - DISCORD_BOT_TOKEN=\${DISCORD_BOT_TOKEN}
      - SWITCH_CONFIG_PATH=/etc/switch/switch.config.yaml
    volumes:
      - ./switch.config.yaml:/etc/switch/switch.config.yaml:ro
      - switch-data:/var/lib/switch
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  switch-data:
`;
  };

  const generateCloudRun = () => {
    return `# Google Cloud Run Deployment Commands for Switch

# 1. Enable Required Services
gcloud services enable run.googleapis.com secretmanager.googleapis.com

# 2. Secure Secret Injection via Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant Service Account Secret Accessor Role
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \\
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \\
  --role="roles/secretmanager.secretAccessor"

# 4. Deploy Container to Cloud Run with Campaign Label
gcloud run deploy switch-teammates \\
  --image=ghcr.io/sandbox-quantum/switch:latest \\
  --platform=managed \\
  --region=us-central1 \\
  --allow-unauthenticated \\
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \\
  --update-labels=dev-tutorial=cloud-run-ai-challenge
`;
  };

  const currentContent =
    selectedFormat === 'yaml'
      ? generateYaml()
      : selectedFormat === 'docker'
      ? generateDockerCompose()
      : generateCloudRun();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
          <Server size={14} />
          <span>Self-Hosting Architect</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Self-Host Switch in Your Private Cloud
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Keep your company conversations, incident logs, and proprietary code strictly within your infrastructure. Generate tailor-made configuration files for Docker, Kubernetes, or Google Cloud Run.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Options */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings2 size={16} className="text-orange-400" />
            <span>Customize Deployment Spec</span>
          </h2>

          {/* Messaging Platforms */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">Messaging Integrations:</span>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs cursor-pointer">
                <span className="text-white font-medium">Slack (Events API & Socket Mode)</span>
                <input
                  type="checkbox"
                  checked={enableSlack}
                  onChange={(e) => setEnableSlack(e.target.checked)}
                  className="accent-orange-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs cursor-pointer">
                <span className="text-white font-medium">Discord (Bot Gateway & Interactions)</span>
                <input
                  type="checkbox"
                  checked={enableDiscord}
                  onChange={(e) => setEnableDiscord(e.target.checked)}
                  className="accent-orange-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs cursor-pointer">
                <span className="text-white font-medium">Microsoft Teams (Bot Framework)</span>
                <input
                  type="checkbox"
                  checked={enableTeams}
                  onChange={(e) => setEnableTeams(e.target.checked)}
                  className="accent-orange-500 rounded"
                />
              </label>
            </div>
          </div>

          {/* AI Engine & Fallback Model */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Primary AI Model:</span>
            <select
              value={primaryModel}
              onChange={(e) => setPrimaryModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Fast & Cost Efficient)</option>
              <option value="gemini-3.7-flash">Google Gemini 3.7 Flash (Deep Reasoning)</option>
              <option value="gemini-3.1-flash-lite">Google Gemini 3.1 Flash Lite (High Availability)</option>
              <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Anthropic SDK)</option>
            </select>
          </div>

          {/* Security & MCP Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block">Security & Tool Calling:</span>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs cursor-pointer">
                <div>
                  <span className="text-white font-medium block">Switch Trust In-Flight Redaction</span>
                  <span className="text-[10px] text-slate-400">Mask API keys and emails before inference</span>
                </div>
                <input
                  type="checkbox"
                  checked={trustPiiRedaction}
                  onChange={(e) => setTrustPiiRedaction(e.target.checked)}
                  className="accent-orange-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs cursor-pointer">
                <div>
                  <span className="text-white font-medium block">Model Context Protocol (MCP)</span>
                  <span className="text-[10px] text-slate-400">Connect GitHub, Sentry, Jira tools</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableMCP}
                  onChange={(e) => setEnableMCP(e.target.checked)}
                  className="accent-orange-500 rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Output: Code Generator */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Generated Deployment Artifact</h3>
              </div>

              {/* Format selector tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setSelectedFormat('yaml')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    selectedFormat === 'yaml' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  switch.config.yaml
                </button>
                <button
                  onClick={() => setSelectedFormat('docker')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    selectedFormat === 'docker' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  docker-compose.yml
                </button>
                <button
                  onClick={() => setSelectedFormat('cloudrun')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    selectedFormat === 'cloudrun' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cloud Run Deploy
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative">
              <pre className="bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 rounded-xl p-4 h-[420px] overflow-auto leading-relaxed">
                {currentContent}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700 transition-colors shadow"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span>Ready for production deployment on Google Cloud Run or Kubernetes</span>
            <span className="font-mono text-orange-400">Config Schema v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
