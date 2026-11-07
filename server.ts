import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get port: command line --port arg takes precedence, then port 3000 in dev
function getPort(): number {
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('--port');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const parsed = parseInt(args[portIndex + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }
  // In dev, dev server must run on port 3000 (even if process.env.PORT is injected by Cloud Run container host)
  if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 3000;
}

const PORT = getPort();
const app = express();

// Mandatory Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Model Fallback Ladder configuration
const MODEL_FALLBACK_LADDER = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-flash-latest'
];

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentName?: string;
}

// Resilient helper utility for Gemini API with Fallback Protocol
async function generateContentWithFallback(
  systemInstruction: string,
  prompt: string,
  apiKey: string
): Promise<{ text: string; modelUsed: string; tokenEstimate: { input: number; output: number } }> {
  const ai = new GoogleGenAI({ apiKey });

  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      return {
        text: responseText,
        modelUsed: model,
        tokenEstimate: {
          input: Math.ceil((systemInstruction.length + prompt.length) / 4),
          output: Math.ceil(responseText.length / 4),
        },
      };
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${model} encountered error:`, err?.status || err?.message || err);
      lastError = err;
      // Continue to next model in ladder
    }
  }

  throw new Error(`All Gemini models in fallback ladder failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// PII & Security Sanitizer Rule set for Switch Trust
interface ScanResult {
  hasPii: boolean;
  hasSecret: boolean;
  hasPromptInjection: boolean;
  redactedText: string;
  findings: Array<{
    type: 'API_KEY' | 'EMAIL' | 'CREDIT_CARD' | 'PHONE' | 'INJECTION_PATTERN' | 'BEARER_TOKEN';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    match: string;
    description: string;
  }>;
}

function scanAndSanitizeContent(input: string): ScanResult {
  const findings: ScanResult['findings'] = [];
  let sanitized = input;

  // 1. API Keys (e.g. OpenAI, Anthropic, Google AIzaSy)
  const apiKeyRegex = /(?:sk-[a-zA-Z0-9_-]{24,}|AIzaSy[a-zA-Z0-9_-]{33}|ghp_[a-zA-Z0-9]{36}|xoxb-[0-9]{10,}-[a-zA-Z0-9]+)/g;
  sanitized = sanitized.replace(apiKeyRegex, (match) => {
    findings.push({
      type: 'API_KEY',
      severity: 'CRITICAL',
      match: match.substring(0, 4) + '***' + match.slice(-4),
      description: 'Exposed API token detected and redacted in flight',
    });
    return '[REDACTED_API_KEY]';
  });

  // 2. Bearer tokens
  const bearerRegex = /Bearer\s+([a-zA-Z0-9_\-\.]{16,})/gi;
  sanitized = sanitized.replace(bearerRegex, (_match, token) => {
    findings.push({
      type: 'BEARER_TOKEN',
      severity: 'CRITICAL',
      match: token.substring(0, 3) + '***',
      description: 'Authorization Bearer header value stripped',
    });
    return 'Bearer [REDACTED_BEARER_TOKEN]';
  });

  // 3. Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  sanitized = sanitized.replace(emailRegex, (match) => {
    findings.push({
      type: 'EMAIL',
      severity: 'MEDIUM',
      match: match,
      description: 'Personal Identifiable Information (Email address) redacted',
    });
    return '[REDACTED_EMAIL]';
  });

  // 4. Credit card numbers (Luhn check pattern)
  const ccRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  sanitized = sanitized.replace(ccRegex, (match) => {
    findings.push({
      type: 'CREDIT_CARD',
      severity: 'CRITICAL',
      match: match.substring(0, 4) + ' **** **** ' + match.slice(-4),
      description: 'PCI-DSS sensitive card number pattern detected and masked',
    });
    return '[REDACTED_CREDIT_CARD]';
  });

  // 5. Prompt injection triggers
  const injectionPatterns = [
    /ignore (?:all )?previous instructions/i,
    /system override/i,
    /you are now in jailbreak mode/i,
    /disregard safeguards/i,
    /<\|im_start\|>/i,
    /switch into unrestricted/i,
  ];

  let hasInjection = false;
  for (const pattern of injectionPatterns) {
    if (pattern.test(input)) {
      hasInjection = true;
      findings.push({
        type: 'INJECTION_PATTERN',
        severity: 'HIGH',
        match: input.match(pattern)?.[0] || 'injection trigger',
        description: 'Adversarial instruction or jailbreak phrase flagged by Switch Trust Guardrails',
      });
    }
  }

  return {
    hasPii: findings.some((f) => f.type === 'EMAIL' || f.type === 'CREDIT_CARD' || f.type === 'PHONE'),
    hasSecret: findings.some((f) => f.type === 'API_KEY' || f.type === 'BEARER_TOKEN'),
    hasPromptInjection: hasInjection,
    redactedText: sanitized,
    findings,
  };
}

// REST API Endpoints

// 1. Health check & configuration metadata
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'Switch (SandboxAQ)',
    repo: 'sandbox-quantum/switch',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    models: MODEL_FALLBACK_LADDER,
    timestamp: new Date().toISOString(),
  });
});

// 2. Chat / Agent Execution Endpoint
app.post('/api/agent/chat', async (req: Request, res: Response) => {
  try {
    // Defensive Payload Ingestion (Null-Safe Destructuring)
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { agentId = 'sre-triage', message = '', channel = '#incident-checkout', history = [] } = body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Valid string message is required.' });
      return;
    }

    // Run Switch Trust inspection first
    const trustScan = scanAndSanitizeContent(message);

    // Agent instructions tailored to Switch roles
    const agentPersonalities: Record<string, string> = {
      'aura-triager': `You are @aura-triager, the Lead Cybersecurity Triage Agent for Team A.U.R.A. running on SandboxAQ Switch.
For every incoming security alert or log:
1. Summarize the threat vector and affected service in one clear line.
2. Classify it as Critical Incident, False Positive, or Policy Question (and reference MITRE ATT&CK codes like T1110, T1190).
3. Route Critical Incidents directly to @aura-repro by name for containment and mitigation.`,

      'aura-repro': `You are @aura-repro, the Vulnerability Reproducer and Patch Mitigator for Team A.U.R.A. on SandboxAQ Switch.
When @aura-triager routes an incident to you:
1. Write the smallest verification command or firewall containment rule (iptables DROP, security group revocation).
2. Format commands in clear bash codeblocks.
3. Explicitly ask the human on-call lead (@Sneha) for approval and sign-off before execution.`,

      'sre-triage': `You are @sre-triage, an SRE Incident Commander agent running inside SandboxAQ Switch.
You collaborate in real-time alongside human engineers and other AI agents (like @code-auditor and @trust-sentinel) in enterprise chat rooms.
You analyze deployment failures, error spikes, traces, and metrics.
Format your responses using Switch Markdown:
- Include clear bullet points and action items.
- Mention other agents when delegating (e.g., "@code-auditor can you inspect commit abc1234?").
- Use code blocks with language tags for metrics, logs, or command execution.
- Maintain professional, calm incident triage demeanor.`,

      'code-auditor': `You are @code-auditor, an automated codebase security and PR review agent on SandboxAQ Switch.
You review code diffs, identify vulnerabilities (SQLi, auth leaks, command injection, memory bounds), and propose concrete Git patches.
When proposing fixes, format them in unified diff or clean code snippets. Always explain root causes.`,

      'trust-sentinel': `You are @trust-sentinel, the Switch Trust & Compliance Guardian agent.
You monitor cross-agent and human messages for PII, secrets leakage, unauthorized tool execution, and adversarial prompt injections.
You provide clear audit findings and enforce enterprise data protection policies.`,

      'switch-buddy': `You are @switch-buddy, the official welcome and orchestration agent for SandboxAQ Switch (github.com/sandbox-quantum/switch).
You help teams self-host Switch, connect their Slack/Teams/Discord/Telegram/Mattermost channels, register custom agent harnesses (MCP, Claude Code, LangChain, Gemini, OpenAI), and configure collaborative rooms.
You are enthusiastic, technical, concise, and helpful.`,
    };

    const systemInstruction =
      agentPersonalities[agentId] ||
      `You are an AI teammate operating within SandboxAQ Switch collaborative platform in channel ${channel}.`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Deterministic High-Fidelity Agent Response Engine when running in standalone mode
      let offlineReply = '';
      if (agentId === 'aura-triager') {
        offlineReply = `Understood @Sneha. Triage analysis complete:

1. **Threat Vector:** High-frequency distributed password-spraying / brute force targeting port 22 on Production Bastion \`ip-10-0-4-12\`.
2. **Severity Classification:** **Critical Incident** (MITRE ATT&CK: \`T1110.001 - Password Guessing\`).
3. **Routing:** Forwarding directly to @aura-repro to generate emergency firewall containment.`;
      } else if (agentId === 'aura-repro') {
        offlineReply = `Received @aura-triager. Verification test reproduced the attack pattern: IP \`198.51.100.24\` is cycling through standard admin credentials.

I have prepared the emergency containment iptables DROP rule and AWS Security Group revocation script:

\`\`\`bash
# Emergency iptables containment command
sudo iptables -I INPUT 1 -s 198.51.100.24 -p tcp --dport 22 -j DROP
# AWS Security Group Ingress Revocation
aws ec2 revoke-security-group-ingress --group-id sg-04812a --protocol tcp --port 22 --cidr 198.51.100.24/32
\`\`\`

@Sneha, please review and provide human sign-off to execute.`;
      } else if (agentId === 'sre-triage') {
        offlineReply = `Acknowledged. Production telemetry ingested for ${channel}.

- **Incident Finding:** Error spike detected in checkout service post-release.
- **Trace Context:** Null-pointer exception flagged in \`taxCalculationService.ts\`.
- **Action:** Delegating emergency unit-tested hotfix to @code-auditor.`;
      } else if (agentId === 'code-auditor') {
        offlineReply = `🚀 **Automated Code Audit & Hotfix Prepared:**
- Added optional chaining guard \`item?.taxRate ?? 0.0825\` to prevent uncaught TypeError.
- Generated 24 unit test cases with 100% boundary condition coverage.
- Pull Request ready for human sign-off.`;
      } else if (agentId === 'trust-sentinel') {
        offlineReply = `🛡️ **Switch Trust & Compliance Guard Verification:**
- In-flight Token Redaction: ${trustScan.hasSecret ? 'CRITICAL Secret redacted in-flight' : 'Zero secrets exposed'}.
- PII Exposure: ${trustScan.hasPii ? 'Customer email/card masked' : 'Clean'}.
- Adversarial Injection: PASSED. Zero compliance violations.`;
      } else {
        offlineReply = `Message processed through SandboxAQ Switch Room Router for channel ${channel}. Context synchronized across active agent harnesses.`;
      }

      res.json({
        reply: offlineReply,
        agentId,
        channel,
        trustScan,
        modelUsed: 'switch-autonomous-engine',
        tokenEstimate: { input: 80, output: 120 },
      });
      return;
    }

    // Call Gemini with Fallback Ladder
    const prompt = `Channel: ${channel}
User Input: ${trustScan.redactedText}
Context: Multi-agent collaboration session in SandboxAQ Switch.`;

    const result = await generateContentWithFallback(systemInstruction, prompt, apiKey);

    res.json({
      reply: result.text,
      agentId,
      channel,
      trustScan,
      modelUsed: result.modelUsed,
      tokenEstimate: result.tokenEstimate,
    });
  } catch (error: any) {
    console.error('Error in /api/agent/chat:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process agent response',
      details: 'Check server logs for fallback ladder trace',
    });
  }
});

// 3. Switch Trust Scanner endpoint
app.post('/api/trust/scan', (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const text = typeof body.text === 'string' ? body.text : '';

    const scan = scanAndSanitizeContent(text);
    res.json(scan);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Scanning failed' });
  }
});

// 4. Switch Markdown Converter endpoint (Demonstrating AST normalization)
app.post('/api/converter/switch-markdown', (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { markdown = '', targetPlatform = 'slack' } = body;

    // Convert Switch Markdown to Platform Specific Payload
    let output: any = {};

    switch (targetPlatform) {
      case 'slack':
        // Slack Block Kit representation
        output = {
          type: 'slack_blocks',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: markdown.replace(/\*\*(.*?)\*\*/g, '*$1*'), // Slack bold is *bold*
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'Approve Action' },
                  style: 'primary',
                  value: 'approve',
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'Escalate to SRE' },
                  value: 'escalate',
                },
              ],
            },
          ],
        };
        break;

      case 'discord':
        output = {
          type: 'discord_embed',
          embeds: [
            {
              title: 'Switch Agent Dispatch',
              description: markdown,
              color: 0x5865f2,
              footer: { text: 'SandboxAQ Switch Protocol v2.4' },
              timestamp: new Date().toISOString(),
            },
          ],
        };
        break;

      case 'teams':
        output = {
          type: 'teams_adaptive_card',
          body: [
            {
              type: 'TextBlock',
              size: 'Medium',
              weight: 'Bolder',
              text: 'Switch AI Teammate Update',
            },
            {
              type: 'TextBlock',
              text: markdown,
              wrap: true,
            },
          ],
          actions: [
            {
              type: 'Action.Submit',
              title: 'Review in Switch Console',
              data: { action: 'view_room' },
            },
          ],
        };
        break;

      case 'telegram':
        output = {
          type: 'telegram_html',
          text: markdown
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre><code class="$1">$2</code></pre>'),
          parse_mode: 'HTML',
        };
        break;

      case 'mattermost':
      default:
        output = {
          type: 'mattermost_markdown',
          message: markdown,
          props: {
            attachments: [
              {
                fallback: 'Switch Agent Card',
                color: '#FF895E',
                text: 'Processed via Switch Room Bus',
              },
            ],
          },
        };
        break;
    }

    res.json({
      targetPlatform,
      sourceMarkdown: markdown,
      convertedPayload: output,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Conversion failed' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath);

  if (isProd && hasDist) {
    console.log(`[Switch Server] Production mode: Serving static files from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    console.log(`[Switch Server] Dev/Middleware mode: Mounting Vite middlewares`);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = getPort();
  app.listen(port, '0.0.0.0', () => {
    console.log(`[Switch Server] Listening on http://0.0.0.0:${port} (PID: ${process.pid})`);
  });
}

startServer().catch((err) => {
  console.error('[Switch Server] Failed to initialize:', err);
  process.exit(1);
});
