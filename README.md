# 🛡️ A.U.R.A. (Autonomous Unified Response Agents)
**AI-Driven Cybersecurity Incident Triage & Mitigation Workflow built with Switch**

> **Flip the Switch Hackathon Submission**  
> **Team:** aura (Lead: @snehathumar)  
> **Track:** Track 1 - Best Business Workflow ($2,000)  
> **Side Tracks:** Code with Wispr ($500)  
> **Live Demo App:** [https://ais-pre-wije7negbmt2nybprhcr3c-922040312159.asia-east1.run.app](https://switch-open-source-ai-teammates-777.ai.studio)

---

## 📌 Overview
Security and DevOps teams often lose critical response time sorting through noisy security alerts, server logs, and vulnerability reports across fragmented dashboards. **A.U.R.A.** brings automated, multi-agent cybersecurity incident triage directly into team chat using **Switch**.

By turning a Discord, Slack, or Telegram channel into a shared Switch Room, A.U.R.A. connects two specialized AI agents that collaborate with human security engineers in real time to classify threats and generate immediate containment scripts.

---

## ⚙️ How We Used Switch

### 1. Connected Agents
We configured two collaborative agents inside our Switch room (`#aura-triage`):
* **`@aura-triager` (Lead Threat Triager):** Listens to incoming security alerts or suspicious logs reported by teammates, summarizes the threat vector in one clear line, classifies severity (`Critical Incident`, `False Positive`, or `Policy Question`), and routes critical threats directly to `@aura-repro`.
* **`@aura-repro` (Remediation & Reproduction Agent):** Triggered automatically by `@aura-triager` for critical incidents. It writes a minimal verification script or firewall/patch command to isolate the threat and posts the exact remediation steps in the same thread for human sign-off.

### 2. Room & Chat Setup
* **Platform:** Discord / Telegram / Slack bridged via Switch
* **Room Name:** `aura-triage`
* **Workflow:** Human teammates drop raw server logs or CVE alerts into the chat channel. Both agents read from the shared room log, hand off tasks autonomously via the Switch protocol, and wait for a human teammate to approve the final rollback or patch command.

---

## 🔄 Room Collaboration Flow

```
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
```

---

## 🎙️ Built by Voice with Wispr Flow ($500 Track Submission)

This entire project—including agent system instructions, `aura-triage.yaml` configuration, and documentation—was created and dictated using **Wispr Flow**.

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
   ```bash
   git clone https://github.com/snehathumar/aura-switch-triage.git
   cd aura-switch-triage
   ```

2. **Launch Switch with the A.U.R.A. room config:**
   ```bash
   switch run --config aura-triage.yaml
   ```

3. **Interact in your chat channel:**
   - Drop a security alert into `#aura-triage`.
   - Watch `@aura-triager` triage and hand off to `@aura-repro`.
   - Human lead provides sign-off to mitigate!

---

## ☁️ Google Cloud Run Deployment & Campaign Verification

To deploy A.U.R.A. as a self-hosted Switch web service on Google Cloud Run:

```bash
# 1. Deploy to Cloud Run
gcloud run deploy aura-switch-triage \
  --image gcr.io/YOUR_PROJECT_ID/aura-switch-triage \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000

# 2. Apply mandatory campaign verification label
gcloud run services update aura-switch-triage \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## ⚖️ License
Apache 2.0
