import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Code, 
  Bot, 
  User, 
  Terminal, 
  Zap, 
  RefreshCw,
  CornerDownRight,
  Shield,
  ThumbsUp,
  MessageSquare,
  HelpCircle,
  Hash,
  Activity,
  Layers,
  Users,
  ShieldCheck,
  FileText,
  Download,
  Copy,
  X,
  Check,
  ExternalLink,
  Search,
  Lock,
  Globe
} from 'lucide-react';
import { PlatformType, ChatMessage, AgentTeammate, SwitchChannel } from '../types/switch';
import { INITIAL_AGENTS, INITIAL_CHANNELS, INITIAL_MESSAGES } from '../data/mockData';

interface RoomSimulatorProps {
  platform: PlatformType;
  setPlatform: (p: PlatformType) => void;
}

export const RoomSimulator: React.FC<RoomSimulatorProps> = ({ platform, setPlatform }) => {
  const [channels] = useState<SwitchChannel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('aura-triage');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [targetAgent, setTargetAgent] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'postmortem' | 'audit_log' | 'siem_logs' | 'ip_intel' | 'active_rules' | 'script_diff' | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`📁 Downloaded ${filename}`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`📋 Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const channelMessages = messages[activeChannelId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [channelMessages, isSubmitting]);

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(null), 3000);
  };

  // Send message through Switch backend
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    const userMessageText = inputText.trim();
    setInputText('');

    // Add user message to channel state immediately
    const userMsgId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      senderId: 'user-current',
      senderName: 'Sneha Thumar (Engineering Lead)',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
      isAgent: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: userMessageText,
      platform,
      channelId: activeChannelId,
    };

    setMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));

    setIsSubmitting(true);

    try {
      // Route smartly based on channel if 'all' is chosen
      let selectedAgentId = targetAgent;
      if (selectedAgentId === 'all') {
        selectedAgentId = activeChannelId === 'aura-triage' ? 'aura-triager' : 'sre-triage';
      }

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          message: userMessageText,
          channel: `#${currentChannel.name}`,
          history: (channelMessages || []).slice(-4).map((m) => ({
            role: m.isAgent ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const respondingAgent = INITIAL_AGENTS.find((a) => a.id === selectedAgentId) || INITIAL_AGENTS[0];

      const agentReplyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        senderId: respondingAgent.id,
        senderName: respondingAgent.name,
        senderAvatar: respondingAgent.avatar,
        isAgent: true,
        agentHandle: respondingAgent.handle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: data.reply || 'Message processed by Switch room agent.',
        platform,
        channelId: activeChannelId,
        trustScan: data.trustScan
          ? {
              hasPii: data.trustScan.hasPii,
              hasSecret: data.trustScan.hasSecret,
              hasPromptInjection: data.trustScan.hasPromptInjection,
              redactedCount: data.trustScan.findings?.length || 0,
            }
          : undefined,
      };

      setMessages((prev) => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), agentReplyMsg],
      }));

      if (data.trustScan && (data.trustScan.hasSecret || data.trustScan.hasPii)) {
        showToast('🛡️ Switch Trust: Sensitive credentials or PII were detected and redacted in flight!');
      }
    } catch (err: any) {
      console.error('Failed to query Switch agent:', err);
      // Fallback agent message
      const fallbackMsg: ChatMessage = {
        id: `reply-err-${Date.now()}`,
        senderId: 'switch-buddy',
        senderName: 'Switch Buddy',
        senderAvatar: INITIAL_AGENTS[3].avatar,
        isAgent: true,
        agentHandle: '@switch-buddy',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Acknowledged. The message was recorded into channel #${currentChannel.name}. (Note: Agent connection active via local Switch bus).`,
        platform,
        channelId: activeChannelId,
      };
      setMessages((prev) => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), fallbackMsg],
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Interactive Card Action Handlers
  const handleCardAction = (btn: string, message: ChatMessage) => {
    if (btn === 'Approve & Execute DROP Rule') {
      const userApprovalMsg: ChatMessage = {
        id: `msg-approval-${Date.now()}`,
        senderId: 'user-sneha',
        senderName: 'Sneha Thumar (Security Lead)',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
        isAgent: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: 'Approved. Execute emergency iptables DROP rule and revoke ingress for 198.51.100.24 immediately.',
        platform,
        channelId: activeChannelId,
      };

      setMessages((prev) => {
        const chanMsgs = (prev[activeChannelId] || []).map((m) => {
          if (m.id === message.id && m.cardData) {
            return {
              ...m,
              cardData: {
                ...m.cardData,
                status: 'resolved' as const,
                title: 'Containment Action Signed-Off by @Sneha',
                details: [
                  { label: 'Containment Action', value: 'Firewall IP DROP (EXECUTED)' },
                  { label: 'Offending Host', value: '198.51.100.24/32 (BLOCKED)' },
                  { label: 'Human Sign-off', value: 'Approved by Sneha Thumar' },
                ],
                actionButtons: ['View Active Rules', 'Export Incident Audit Log'],
              },
            };
          }
          return m;
        });
        return {
          ...prev,
          [activeChannelId]: [...chanMsgs, userApprovalMsg],
        };
      });

      // Agent confirms mitigation execution
      setTimeout(() => {
        const reproAgent = INITIAL_AGENTS.find((a) => a.id === 'aura-repro') || INITIAL_AGENTS[1];
        const confirmationMsg: ChatMessage = {
          id: `msg-confirm-${Date.now()}`,
          senderId: reproAgent.id,
          senderName: reproAgent.name,
          senderAvatar: reproAgent.avatar,
          isAgent: true,
          agentHandle: reproAgent.handle,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: '✅ **Containment Action Executed Successfully:**\n\n- Applied `iptables -I INPUT 1 -s 198.51.100.24 -p tcp --dport 22 -j DROP` on bastion `ip-10-0-4-12`.\n- Revoked AWS Security Group `sg-04812a` ingress for `198.51.100.24/32`.\n- CloudWatch telemetry verified: Failed SSH attempts dropped from 5,420/min to **0/min**.\n- Threat status: **MITIGATED & CLOSED**.',
          platform,
          channelId: activeChannelId,
          cardData: {
            type: 'incident',
            title: 'Threat Neutralized: IP 198.51.100.24 Blocked',
            status: 'resolved',
            details: [
              { label: 'Attack Vector', value: 'SSH Brute Force (T1110)' },
              { label: 'Offending IP', value: '198.51.100.24 (BLOCKED)' },
              { label: 'Resolution Status', value: 'INCIDENT CLOSED' },
            ],
            actionButtons: ['Export Post-Mortem', 'Generate Incident Audit Log'],
          },
        };

        setMessages((prev) => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), confirmationMsg],
        }));
      }, 600);

      showToast('🛡️ Rule executed! Offending IP 198.51.100.24 has been blocked.');
      return;
    }

    if (btn === 'Approve & Create PR') {
      const userPRApproval: ChatMessage = {
        id: `msg-pr-${Date.now()}`,
        senderId: 'user-sneha',
        senderName: 'Sneha Thumar (Engineering Lead)',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
        isAgent: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: 'Approved. Please open the hotfix PR fix/tax-calc-null-guard against main.',
        platform,
        channelId: activeChannelId,
      };

      setMessages((prev) => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), userPRApproval],
      }));

      setTimeout(() => {
        const codeAgent = INITIAL_AGENTS.find((a) => a.id === 'code-auditor') || INITIAL_AGENTS[2];
        const prCreatedMsg: ChatMessage = {
          id: `msg-pr-done-${Date.now()}`,
          senderId: codeAgent.id,
          senderName: codeAgent.name,
          senderAvatar: codeAgent.avatar,
          isAgent: true,
          agentHandle: codeAgent.handle,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: '🚀 **Hotfix PR #402 Opened:** `fix: add safe optional chaining to taxCalculationService.ts`.\n\nAll 24 automated unit tests are green. Ready for final merge and deployment to prod.',
          platform,
          channelId: activeChannelId,
        };

        setMessages((prev) => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), prCreatedMsg],
        }));
      }, 600);

      showToast('🚀 PR #402 created successfully!');
      return;
    }

    if (btn === 'Export Post-Mortem') {
      setActiveModal('postmortem');
      showToast('📄 Opened Incident Post-Mortem Report SEC-891');
      return;
    }

    if (btn === 'Generate Incident Audit Log' || btn === 'Export Incident Audit Log') {
      setActiveModal('audit_log');
      showToast('🔒 Generated Cryptographic Switch Trust Audit Log');
      return;
    }

    if (btn === 'View SIEM Raw Logs') {
      setActiveModal('siem_logs');
      showToast('🔍 Opened Raw Bastion SIEM auth.log entries');
      return;
    }

    if (btn === 'Inspect Bastion IP') {
      setActiveModal('ip_intel');
      showToast('🛡️ Loaded Threat Intelligence Profile for IP 198.51.100.24');
      return;
    }

    if (btn === 'View Active Rules') {
      setActiveModal('active_rules');
      showToast('⚙️ Loaded Active iptables & AWS Security Group Rules');
      return;
    }

    if (btn === 'View Script Diff' || btn === 'View Diff & Run Tests' || btn === 'Review Code Changes') {
      setActiveModal('script_diff');
      showToast('📝 Loaded Containment Script & Security Group Diff');
      return;
    }

    showToast(`Action executed: "${btn}" triggered via Switch protocol`);
  };

  // Quick Scenario Triggers
  const triggerScenario = async (type: string) => {
    let prompt = '';
    let agentId = 'aura-triager';

    if (activeChannelId === 'aura-triage') {
      if (type === 'outage' || type === 'ssh_alert') {
        prompt = '🚨 SECURITY ALERT: 5,420 failed SSH attempts on Bastion ip-10-0-4-12 from IP 198.51.100.24. @aura-triager please classify and route to @aura-repro!';
        agentId = 'aura-triager';
      } else if (type === 'fix' || type === 'drop_rule') {
        prompt = '@aura-repro please generate emergency iptables DROP command and AWS security group revocation for IP 198.51.100.24.';
        agentId = 'aura-repro';
      } else if (type === 'approve') {
        // Find latest card and execute approval directly
        const lastCardMsg = [...channelMessages].reverse().find((m) => m.cardData);
        if (lastCardMsg) {
          handleCardAction('Approve & Execute DROP Rule', lastCardMsg);
          return;
        }
        prompt = 'Approved. Execute emergency iptables DROP rule for 198.51.100.24 immediately.';
        agentId = 'aura-repro';
      } else if (type === 'retrospective' || type === 'summary') {
        prompt = '@aura-triager please generate a complete cybersecurity incident retrospective and compliance report for this brute-force attack.';
        agentId = 'aura-triager';
      }
    } else {
      if (type === 'outage') {
        prompt = '🚨 ALERT: Datadog reporting checkout error rate jumped to 21.4%. Endpoint: /api/v1/checkout/process. SRE Commander please triage!';
        agentId = 'sre-triage';
      } else if (type === 'fix') {
        prompt = '@code-auditor please prepare the emergency PR with unit tests for the missing null guard in taxCalculationService.ts and show the diff.';
        agentId = 'code-auditor';
      } else if (type === 'pii_leak') {
        prompt = 'Please test payment token sk-live-948192849182948214 and customer email john.doe@example.com for order #90214.';
        agentId = 'trust-sentinel';
      } else if (type === 'retrospective') {
        prompt = '@sre-triage summarize this incident root cause, time to resolution, and preventative action items for our engineering retro.';
        agentId = 'sre-triage';
      }
    }

    setInputText(prompt);
    setTargetAgent(agentId);
  };

  // Platform specific theme styling
  const platformThemes: Record<PlatformType, {
    sidebarBg: string;
    sidebarText: string;
    chatBg: string;
    bubbleUser: string;
    bubbleAgent: string;
    brandColor: string;
    badgeStyle: string;
  }> = {
    slack: {
      sidebarBg: 'bg-[#3F0E40]',
      sidebarText: 'text-slate-200',
      chatBg: 'bg-slate-900',
      bubbleUser: 'bg-slate-800/80 border-slate-700',
      bubbleAgent: 'bg-slate-950/60 border-slate-800',
      brandColor: '#4A154B',
      badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-800',
    },
    discord: {
      sidebarBg: 'bg-[#1E1F22]',
      sidebarText: 'text-slate-300',
      chatBg: 'bg-[#313338]',
      bubbleUser: 'bg-[#2B2D31] border-transparent',
      bubbleAgent: 'bg-[#2B2D31]/90 border-transparent',
      brandColor: '#5865F2',
      badgeStyle: 'bg-[#5865F2] text-white font-bold text-[9px] uppercase px-1 rounded',
    },
    teams: {
      sidebarBg: 'bg-[#201F1F]',
      sidebarText: 'text-slate-200',
      chatBg: 'bg-[#181818]',
      bubbleUser: 'bg-[#292929] border-slate-700',
      bubbleAgent: 'bg-[#242424] border-slate-800',
      brandColor: '#464EB8',
      badgeStyle: 'bg-[#464EB8] text-white text-[10px]',
    },
    telegram: {
      sidebarBg: 'bg-[#17212B]',
      sidebarText: 'text-slate-200',
      chatBg: 'bg-[#0E1621]',
      bubbleUser: 'bg-[#2B5278] border-transparent text-white',
      bubbleAgent: 'bg-[#182533] border-transparent text-slate-100',
      brandColor: '#2AABEE',
      badgeStyle: 'bg-[#2AABEE]/20 text-[#2AABEE] text-[10px]',
    },
    mattermost: {
      sidebarBg: 'bg-[#1D2226]',
      sidebarText: 'text-slate-200',
      chatBg: 'bg-[#121417]',
      bubbleUser: 'bg-[#1C2026] border-slate-700',
      bubbleAgent: 'bg-[#161A1E] border-slate-800',
      brandColor: '#1C58D9',
      badgeStyle: 'bg-[#1C58D9]/20 text-sky-400 text-[10px]',
    },
  };

  const getModalFilename = (type: string | null): string => {
    switch (type) {
      case 'postmortem':
        return 'incident-postmortem-SEC-891.md';
      case 'audit_log':
        return 'aura-audit-trail-SEC-891.json';
      case 'siem_logs':
        return 'bastion-auth-SEC-891.log';
      case 'ip_intel':
        return 'threat-intel-198.51.100.24.json';
      case 'active_rules':
        return 'active-firewall-rules-SEC-891.txt';
      case 'script_diff':
        return 'containment-diff-SEC-891.patch';
      default:
        return 'incident-export.txt';
    }
  };

  const getModalContent = (type: string | null): string => {
    switch (type) {
      case 'postmortem':
        return `# INCIDENT POST-MORTEM REPORT: SEC-891
================================================================================
Incident ID:          SEC-891
Classification:       MITRE ATT&CK T1110.001 (Password Guessing / Brute Force)
Severity:             SEV-1 (CRITICAL)
Status:               RESOLVED & CLOSED
Lead Triager:         @aura-triager (Gemini Flash Autonomous Agent)
Remediation Agent:    @aura-repro (Gemini Flash Containment Agent)
Incident Commander:   Sneha Thumar (Engineering Lead)
Impacted System:      bastion-prod-01 (ip-10-0-4-12, AWS eu-west-1)
Attacking Host:       198.51.100.24 (Abuse Confidence 98% • Tor Exit Proxy)
Detection Time:       2026-11-06 02:40:12 UTC
Mitigation Signed:    2026-11-06 05:11:15 UTC (Sneha Thumar Human Sign-off)
Containment Commited: 2026-11-06 05:11:18 UTC
MTTD (Detection):     18 seconds
MTTR (Recovery):      1 minute 24 seconds (from human sign-off)

1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
At 02:40:12 UTC, automated SIEM auth.log sensors triggered an emergency threshold
alert on bastion-prod-01. A single source IP (198.51.100.24) generated 5,420 failed
SSH login attempts in 60 seconds cycling through standard UNIX user accounts.

A.U.R.A. Autonomous Triager (@aura-triager) ingested the syslog event via the
Switch bus, classified the attack under MITRE ATT&CK T1110.001, and delegated
remediation to @aura-repro.

@aura-repro synthesized an emergency Linux iptables DROP rule and AWS Security
Group ingress revocation. In compliance with Switch AI Security Directives,
high-privilege containment was placed behind cryptographic Human-in-the-Loop
authorization.

Sneha Thumar reviewed and approved the containment action at 05:11 UTC. The DROP
rule was inserted into Chain INPUT position 1 and AWS SG was revoked. Telemetry
confirmed failed SSH attempts dropped from 5,420/min to 0/min. Production systems
suffered zero downtime and zero unauthorized access.

2. ROOT CAUSE ANALYSIS
--------------------------------------------------------------------------------
- Bastion Security Group sg-04812a had port 22 exposed to 0.0.0.0/0 to support
  emergency access during an off-hours database migration.
- Threat actors ran distributed hydra/medusa password spraying targeting:
  ['admin', 'root', 'deploy', 'ubuntu', 'postgres', 'test'].
- Bastion key-only authentication prevented account compromise, but connection
  exhaustion posed a severe availability hazard to on-call engineers.

3. CONTAINMENT & MITIGATION ACTIONS EXECUTED
--------------------------------------------------------------------------------
[1] Host-Level Linux iptables Containment:
    sudo iptables -I INPUT 1 -s 198.51.100.24 -p tcp --dport 22 -j DROP

[2] Cloud Infrastructure AWS Security Group Revocation:
    aws ec2 revoke-security-group-ingress --group-id sg-04812a \\
      --protocol tcp --port 22 --cidr 198.51.100.24/32

[3] Live Telemetry Verification:
    CloudWatch metrics confirmed failed SSH attempts returned to 0/min.

4. PERMANENT REMEDIATION & PREVENTATIVE ACTION ITEMS
--------------------------------------------------------------------------------
[x] Migrate bastion ingress exclusively to AWS SSM Session Manager (Zero public SSH).
[x] Deploy fail2ban daemon with 5-retry limit and 24-hour jail drop.
[x] Deploy Switch Trust cryptographic signing for all infrastructure modifications.
[x] Rotate bastion host SSH host keys and audit developer authorized_keys files.`;

      case 'audit_log':
        return JSON.stringify(
          {
            audit_schema: "switch-trust-v2.1",
            incident_id: "SEC-891",
            created_at: "2026-11-06T05:11:18.420Z",
            cryptographic_seal: {
              algorithm: "HMAC-SHA256",
              digest: "8f4a129d3c5b881e01f6a27e992b4510bca03f8e77a1129de912440187ba5302",
              verified: true,
              verification_engine: "Switch Trust Sentinel"
            },
            incident_summary: {
              vector: "SSH_BRUTE_FORCE_T1110",
              offending_ip: "198.51.100.24",
              target: "bastion-prod-01 (10.0.4.12:22)",
              action_taken: "IPTABLES_DROP_AND_AWS_SG_REVOKE",
              final_status: "RESOLVED"
            },
            timeline_events: [
              {
                step: 1,
                timestamp: "2026-11-06T02:40:12.012Z",
                actor: "siem-collector",
                event_type: "ALERT_ANOMALY_DETECTED",
                payload: {
                  source_ip: "198.51.100.24",
                  failed_attempts_rate: "5420/min",
                  rule: "SIEM_SSH_BURST_09"
                }
              },
              {
                step: 2,
                timestamp: "2026-11-06T02:41:04.220Z",
                actor: "@aura-triager",
                agent_model: "gemini-2.5-flash",
                event_type: "THREAT_CLASSIFIED",
                payload: {
                  mitre_id: "T1110.001",
                  classification: "Password Guessing",
                  severity: "CRITICAL_SEV1"
                }
              },
              {
                step: 3,
                timestamp: "2026-11-06T02:42:01.890Z",
                actor: "@aura-repro",
                agent_model: "gemini-2.5-flash",
                event_type: "REMEDIATION_SYNTHESIS",
                payload: {
                  commands: [
                    "sudo iptables -I INPUT 1 -s 198.51.100.24 -p tcp --dport 22 -j DROP",
                    "aws ec2 revoke-security-group-ingress --group-id sg-04812a --protocol tcp --port 22 --cidr 198.51.100.24/32"
                  ],
                  requires_human_approval: true
                }
              },
              {
                step: 4,
                timestamp: "2026-11-06T05:11:15.118Z",
                actor: "Sneha Thumar (Engineering Lead)",
                actor_id: "user-sneha",
                event_type: "HUMAN_IN_THE_LOOP_SIGN_OFF",
                payload: {
                  channel: "#aura-triage",
                  action: "APPROVED_AND_EXECUTED",
                  signature: "SIG_HITL_SNEHA_THUMAR_0511"
                }
              },
              {
                step: 5,
                timestamp: "2026-11-06T05:11:18.410Z",
                actor: "switch-execution-engine",
                event_type: "CONTAINMENT_COMMITTED",
                payload: {
                  exit_code: 0,
                  active_rule: "iptables-INPUT-1",
                  telemetry_verification: "0 failures/min verified"
                }
              }
            ]
          },
          null,
          2
        );

      case 'siem_logs':
        return `[2026-11-06 02:40:11.204 UTC] ip-10-0-4-12 sshd[28490]: Invalid user admin from 198.51.100.24 port 49120
[2026-11-06 02:40:11.381 UTC] ip-10-0-4-12 sshd[28490]: Failed password for invalid user admin from 198.51.100.24 port 49120 ssh2
[2026-11-06 02:40:12.012 UTC] ip-10-0-4-12 sshd[28491]: Invalid user root from 198.51.100.24 port 49122
[2026-11-06 02:40:12.189 UTC] ip-10-0-4-12 sshd[28491]: Failed password for invalid user root from 198.51.100.24 port 49122 ssh2
[2026-11-06 02:40:12.905 UTC] ip-10-0-4-12 sshd[28492]: Invalid user deploy from 198.51.100.24 port 49124
[2026-11-06 02:40:13.102 UTC] ip-10-0-4-12 sshd[28492]: Failed password for invalid user deploy from 198.51.100.24 port 49124 ssh2
[2026-11-06 02:40:13.784 UTC] ip-10-0-4-12 sshd[28493]: Invalid user ubuntu from 198.51.100.24 port 49126
[2026-11-06 02:40:14.015 UTC] ip-10-0-4-12 sshd[28493]: Failed password for invalid user ubuntu from 198.51.100.24 port 49126 ssh2
[2026-11-06 02:40:14.650 UTC] ip-10-0-4-12 sshd[28494]: Received disconnect from 198.51.100.24 port 49128:11: Bye Bye [preauth]
[2026-11-06 02:40:15.118 UTC] ip-10-0-4-12 sshd[28495]: pam_unix(sshd:auth): check pass; user unknown
[2026-11-06 02:40:15.121 UTC] ip-10-0-4-12 sshd[28495]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.24
[2026-11-06 02:40:15.980 UTC] ip-10-0-4-12 cloudwatch-agent[1402]: [ALERT] MetricFilter: SSH_AUTH_FAILURES exceeded threshold (5420/min >= 100/min)
----------------------------------------------------------------------------------------------------
[2026-11-06 05:11:15.200 UTC] ip-10-0-4-12 switch-agent[918]: HITL Sign-off received from Sneha Thumar
[2026-11-06 05:11:18.410 UTC] ip-10-0-4-12 kernel: [39182.112] [AURA-IPTABLES-DROP] IN=eth0 OUT= MAC=06:41:88:9a:11:02 SRC=198.51.100.24 DST=10.0.4.12 LEN=60 PROTO=TCP SPT=49130 DPT=22 [DROP]
[2026-11-06 05:11:19.001 UTC] ip-10-0-4-12 cloudwatch-agent[1402]: [INFO] MetricFilter: SSH_AUTH_FAILURES returned to baseline (0/min)
[2026-11-06 05:11:20.100 UTC] ip-10-0-4-12 switch-agent[918]: Verification Complete: 0 packets admitted from 198.51.100.24`;

      case 'ip_intel':
        return JSON.stringify(
          {
            query_ip: "198.51.100.24",
            is_public: true,
            abuse_confidence_score: 98,
            threat_severity: "CRITICAL",
            isp: "Cloudflare Warp / Bulletproof Transit B.V.",
            domain: "exit-proxy.net",
            country_code: "NL",
            country_name: "Netherlands",
            city: "Amsterdam",
            total_reports: 1280,
            num_distinct_users: 142,
            last_reported_at: "2026-11-06T02:40:00Z",
            threat_categories: [
              "18 - Brute-Force",
              "14 - Port Scan",
              "22 - SSH Attack",
              "04 - DDoS Attack Relay"
            ],
            bastion_mitigation_status: "BLOCKED_PERMANENTLY",
            firewall_rule: "iptables -I INPUT 1 -s 198.51.100.24 -p tcp --dport 22 -j DROP"
          },
          null,
          2
        );

      case 'active_rules':
        return `# LINUX KERNEL NETFILTER / IPTABLES (bastion-prod-01)
$ sudo iptables -L INPUT -v -n --line-numbers
--------------------------------------------------------------------------------
Chain INPUT (policy ACCEPT 142K packets, 88M bytes)
num   pkts  bytes  target  prot  opt  in    out   source          destination
1     4192   251K  DROP    tcp   --   eth0  *     198.51.100.24   0.0.0.0/0    tcp dpt:22 /* AURA Emergency Containment SEC-891 */
2    98102    12M  ACCEPT  all   --   lo    *     0.0.0.0/0       0.0.0.0/0
3     1.2M   840M  ACCEPT  all   --   *     *     0.0.0.0/0       0.0.0.0/0    state RELATED,ESTABLISHED
4      120   7200  ACCEPT  tcp   --   eth0  *     10.0.0.0/8      0.0.0.0/0    tcp dpt:22 /* Internal VPC Admin */

# AWS EC2 SECURITY GROUP AUDIT
$ aws ec2 describe-security-groups --group-ids sg-04812a --query 'SecurityGroups[0].IpPermissions'
--------------------------------------------------------------------------------
[
  {
    "FromPort": 22,
    "ToPort": 22,
    "IpProtocol": "tcp",
    "IpRanges": [
      { "CidrIp": "10.0.0.0/16", "Description": "Internal VPC Only" }
    ],
    "RevokedIpRanges": [
      { "CidrIp": "198.51.100.24/32", "Description": "Revoked by @aura-repro (SEC-891)" }
    ]
  }
]`;

      case 'script_diff':
        return `--- /etc/iptables/rules.v4.bak\t2026-11-06 02:30:00.000000000 +0000
+++ /etc/iptables/rules.v4\t2026-11-06 05:11:18.000000000 +0000
@@ -1,6 +1,8 @@
 *filter
 :INPUT ACCEPT [0:0]
 :FORWARD ACCEPT [0:0]
 :OUTPUT ACCEPT [0:0]
+# --- EMERGENCY CONTAINMENT BY A.U.R.A. (SEC-891) ---
+-A INPUT -s 198.51.100.24/32 -p tcp -m tcp --dport 22 -j DROP
 -A INPUT -i lo -j ACCEPT
 -A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT

--- aws-security-group-ingress.json.bak
+++ aws-security-group-ingress.json
@@ -8,7 +8,6 @@
         "FromPort": 22,
         "ToPort": 22,
         "IpRanges": [
-            { "CidrIp": "198.51.100.24/32" }
         ]
     }
 ]`;

      default:
        return 'No incident data available.';
    }
  };

  const currentTheme = platformThemes[platform];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Platform Switcher & Scenario Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        {/* Left: Platform Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400">Messenger View:</span>
          <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
            {(['slack', 'discord', 'teams', 'telegram', 'mattermost'] as PlatformType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  platform === p
                    ? 'bg-orange-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {p === 'teams' ? 'Teams' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Quick Scenario Injections */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Simulate Event:</span>
          {activeChannelId === 'aura-triage' ? (
            <>
              <button
                onClick={() => triggerScenario('ssh_alert')}
                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlertTriangle size={12} />
                <span>Simulate SSH Alert</span>
              </button>

              <button
                onClick={() => triggerScenario('drop_rule')}
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Code size={12} />
                <span>Generate DROP Rule</span>
              </button>

              <button
                onClick={() => triggerScenario('approve')}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer animate-pulse"
              >
                <Shield size={12} />
                <span>Approve & Execute DROP</span>
              </button>

              <button
                onClick={() => triggerScenario('summary')}
                className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap size={12} />
                <span>Incident Report</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => triggerScenario('outage')}
                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle size={12} />
                <span>500 Outage Alert</span>
              </button>

              <button
                onClick={() => triggerScenario('fix')}
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Code size={12} />
                <span>Generate Hotfix PR</span>
              </button>

              <button
                onClick={() => triggerScenario('pii_leak')}
                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Shield size={12} />
                <span>Test PII Redaction</span>
              </button>

              <button
                onClick={() => triggerScenario('retrospective')}
                className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Zap size={12} />
                <span>Incident Retro</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-[700px]">
        {/* Left Sidebar: Channels & Workspace Agents */}
        <div className={`lg:col-span-3 ${currentTheme.sidebarBg} border-r border-slate-800 flex flex-col justify-between overflow-y-auto`}>
          <div>
            {/* Workspace Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>SandboxAQ Engineering</span>
                </h3>
                <p className="text-[11px] text-white/60">Switch Room Router: Connected</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Channels List */}
            <div className="p-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-white/50 px-2 py-1 tracking-wider">
                Rooms & Channels
              </div>
              {channels.map((chan) => (
                <button
                  key={chan.id}
                  onClick={() => setActiveChannelId(chan.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeChannelId === chan.id
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash size={14} className="opacity-70 shrink-0" />
                    <span className="truncate">{chan.name}</span>
                  </div>
                  {chan.unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {chan.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active AI Teammates in this Room */}
            <div className="p-3 border-t border-white/10 space-y-2">
              <div className="text-[10px] uppercase font-bold text-white/50 px-2 py-1 tracking-wider flex items-center justify-between">
                <span>Room AI Teammates</span>
                <span className="text-orange-400 font-mono text-[9px]">
                  {currentChannel.assignedAgents.length} in room
                </span>
              </div>
              <div className="space-y-1">
                {INITIAL_AGENTS.filter((a) => currentChannel.assignedAgents.includes(a.id)).map((agent) => (
                  <div
                    key={agent.id}
                    className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center gap-2.5"
                  >
                    <div className="relative">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900"></span>
                    </div>
                    <div className="truncate flex-1">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                        <span>{agent.handle}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-orange-300">
                          {agent.harness.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/60 truncate">{agent.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Status Bar */}
          <div className="p-3 border-t border-white/10 bg-black/30 flex items-center gap-2.5">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80"
                alt="Sneha Thumar"
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-bold text-white truncate">Sneha Thumar</div>
              <div className="text-[10px] text-white/50">Lead Engineer</div>
            </div>
          </div>
        </div>

        {/* Center/Right: Chat Stream & Message Area */}
        <div className={`lg:col-span-9 ${currentTheme.chatBg} flex flex-col justify-between overflow-hidden`}>
          {/* Channel Header Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Hash size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentChannel.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                    {platform.toUpperCase()} Skin
                  </span>
                </h4>
                <p className="text-xs text-slate-400 truncate max-w-xl">{currentChannel.topic}</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Users size={14} /> 4 Members
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Bot size={14} /> 3 Agents Listening
              </span>
            </div>
          </div>

          {/* Toast notification banner */}
          {activeToast && (
            <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-200 text-xs px-4 py-2 flex items-center justify-between animate-in fade-in duration-150">
              <span className="flex items-center gap-2">
                <Shield size={14} className="text-amber-400" />
                {activeToast}
              </span>
              <button onClick={() => setActiveToast(null)} className="text-amber-400 font-bold hover:text-white">
                &times;
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {channelMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl border transition-all ${
                  msg.isAgent ? currentTheme.bubbleAgent : currentTheme.bubbleUser
                }`}
              >
                {/* Message Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{msg.senderName}</span>
                        {msg.isAgent && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${currentTheme.badgeStyle}`}>
                            APP / AGENT
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      </div>
                      {msg.agentHandle && (
                        <div className="text-[10px] text-orange-400 font-mono">{msg.agentHandle}</div>
                      )}
                    </div>
                  </div>

                  {msg.trustScan && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <ShieldCheck size={12} />
                      <span>Switch Trust Verified</span>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap pl-10">
                  {msg.content}
                </div>

                {/* Structured Incident / PR Card (Switch Markdown Card rendering) */}
                {msg.cardData && (
                  <div className="ml-10 mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        {msg.cardData.type === 'incident' ? (
                          <AlertTriangle size={14} className="text-rose-400" />
                        ) : (
                          <Code size={14} className="text-emerald-400" />
                        )}
                        <span>{msg.cardData.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          msg.cardData.status === 'investigating'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {msg.cardData.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {msg.cardData.details.map((d, idx) => (
                        <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{d.label}</span>
                          <span className="font-semibold text-slate-200 truncate block mt-0.5 font-mono">
                            {d.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {msg.cardData.actionButtons && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.cardData.actionButtons.map((btn, bidx) => (
                          <button
                            key={bidx}
                            onClick={() => handleCardAction(btn, msg)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 hover:border-orange-500/50 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                          >
                            {btn}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reactions */}
                {msg.reactions && (
                  <div className="ml-10 mt-2 flex items-center gap-1.5">
                    {msg.reactions.map((r, ridx) => (
                      <span
                        key={ridx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300"
                      >
                        <span>{r.emoji}</span>
                        <span>{r.count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isSubmitting && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3 animate-pulse">
                <Bot size={16} className="text-orange-400 animate-spin" />
                <span className="text-xs text-slate-400">
                  Switch Agent responding with Gemini Fallback Engine...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
            {/* Target Agent Selector */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Direct to:</span>
                <select
                  value={targetAgent}
                  onChange={(e) => setTargetAgent(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="all">⚡ All Agents in Room</option>
                  <option value="aura-triager">@aura-triager (Lead Threat Triager)</option>
                  <option value="aura-repro">@aura-repro (Vulnerability Mitigator)</option>
                  <option value="sre-triage">@sre-triage (Incident Commander)</option>
                  <option value="code-auditor">@code-auditor (Code Auditor & Fixer)</option>
                  <option value="trust-sentinel">@trust-sentinel (Security & PII Sentinel)</option>
                  <option value="switch-buddy">@switch-buddy (Switch Assistant)</option>
                </select>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Supports Switch Markdown, mentions & MCP tools
              </span>
            </div>

            {/* Input & Send Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message #${currentChannel.name} or ask @${targetAgent}...`}
                className="flex-1 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting || !inputText.trim()}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20"
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Dialog Viewer for Card Actions */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-3xl w-full max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  {activeModal === 'postmortem' && <FileText size={18} />}
                  {activeModal === 'audit_log' && <Lock size={18} />}
                  {activeModal === 'siem_logs' && <Terminal size={18} />}
                  {activeModal === 'ip_intel' && <Globe size={18} />}
                  {activeModal === 'active_rules' && <ShieldCheck size={18} />}
                  {activeModal === 'script_diff' && <Code size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {activeModal === 'postmortem' && 'Official Incident Post-Mortem: SEC-891'}
                      {activeModal === 'audit_log' && 'Cryptographic Switch Trust Audit Log'}
                      {activeModal === 'siem_logs' && 'Bastion SIEM Raw auth.log Stream'}
                      {activeModal === 'ip_intel' && 'Threat Intelligence Dossier: 198.51.100.24'}
                      {activeModal === 'active_rules' && 'Active Linux iptables & AWS Security Group Rules'}
                      {activeModal === 'script_diff' && 'Emergency Containment Script Diff'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {activeModal === 'postmortem' ? 'SEV-1 CLOSED' : activeModal === 'audit_log' ? 'HMAC-SHA256 SIGNED' : 'VERIFIED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    A.U.R.A. Autonomous Unified Response Agents • Signed by Sneha Thumar
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Actions Bar */}
            <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-mono">
                {activeModal === 'postmortem' && 'incident-postmortem-SEC-891.md'}
                {activeModal === 'audit_log' && 'aura-audit-trail-SEC-891.json'}
                {activeModal === 'siem_logs' && 'bastion-auth-SEC-891.log'}
                {activeModal === 'ip_intel' && 'threat-intel-198.51.100.24.json'}
                {activeModal === 'active_rules' && 'active-firewall-rules-SEC-891.txt'}
                {activeModal === 'script_diff' && 'containment-diff-SEC-891.patch'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const content = getModalContent(activeModal);
                    const filename = getModalFilename(activeModal);
                    downloadTextFile(filename, content);
                  }}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-orange-500/20"
                >
                  <Download size={13} />
                  <span>Download File</span>
                </button>

                <button
                  onClick={() => {
                    const content = getModalContent(activeModal);
                    copyToClipboard(content, activeModal);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedField === activeModal ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed space-y-4">
              <pre className="whitespace-pre-wrap font-mono selection:bg-orange-500 selection:text-slate-950">
                {getModalContent(activeModal)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck size={14} />
                <span>Audited via Switch Trust Engine (Zero-Leakage Guarantee)</span>
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
