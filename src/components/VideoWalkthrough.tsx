import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Clock,
  Sparkles,
  Copy,
  Check,
  Shield,
  Terminal,
  FileText,
  CheckCircle2,
  ListOrdered,
  Download,
  ExternalLink
} from 'lucide-react';

export interface Chapter {
  timestamp: number;
  timeLabel: string;
  title: string;
  cursorAction: string;
  narration: string;
}

export const VIDEO_CHAPTERS: Chapter[] = [
  {
    timestamp: 0,
    timeLabel: '00:00',
    title: 'Switch Console & Trust Architecture',
    cursorAction: 'Cursor inspects Local Switch Server status, connected Mattermost bridge, and Switch Trust Integration settings.',
    narration:
      'Welcome to Team A.U.R.A. running on SandboxAQ Switch! Here in our local Switch Console, our Switch server is active with Mattermost bridged and Switch Trust guardrails enabled for enterprise compliance.',
  },
  {
    timestamp: 9,
    timeLabel: '00:09',
    title: 'Multi-Agent Squad Setup',
    cursorAction: 'Navigates to "Your Agents", showing aura-reporter, aura-repro, aura-triager, and switch-buddy-admin running on OpenCode.',
    narration:
      'In our Agents tab, we have configured our specialized incident triage squad: aura-reporter, aura-repro, aura-triager, and switch-buddy-admin, all running autonomously on OpenCode.',
  },
  {
    timestamp: 16,
    timeLabel: '00:16',
    title: 'Agent Instructions: aura-reporter',
    cursorAction: 'Opens aura-reporter settings, inspecting instructions for generating post-incident markdown reports after human sign-off.',
    narration:
      'First, aura-reporter is programmed to stand by and generate comprehensive post-incident post-mortems in Markdown once human approval is confirmed.',
  },
  {
    timestamp: 23,
    timeLabel: '00:23',
    title: 'Agent Instructions: aura-repro',
    cursorAction: 'Clicks aura-repro, reviewing remediation & containment instructions, auto-mode permissions, and human approval gates.',
    narration:
      'Next is aura-repro, our vulnerability containment specialist. It reproduces exploits, writes minimal containment rules, and is strictly gated to require human approval before applying changes.',
  },
  {
    timestamp: 30,
    timeLabel: '00:30',
    title: 'Agent Instructions: aura-triager',
    cursorAction: 'Inspects aura-triager instructions for threat classification, MITRE ATT&CK tagging, and SEV-1 delegation.',
    narration:
      'Here is aura-triager, the lead triage agent. It ingests noisy log alerts, summarizes the threat vector, tags severity, and immediately delegates confirmed threats to aura-repro.',
  },
  {
    timestamp: 56,
    timeLabel: '00:56',
    title: 'Collaborative Room: #aura-triage',
    cursorAction: 'Navigates to "Your Rooms" and enters the bridged #aura-triage incident room.',
    narration:
      'Now, moving to our shared collaborative room: aura-triage. All four agents are listening alongside human security leads in Mattermost.',
  },
  {
    timestamp: 73,
    timeLabel: '01:13',
    title: 'Incoming Alert & Autonomous Triage',
    cursorAction: 'User posts ALERT 5 (342 SQL injection attempts on web-03 exfiltrating 4.1MB). aura-triager awakens and triages.',
    narration:
      'An alert is posted: 342 SQL injection attempts on web-03 exfiltrating 4.1 megabytes of data. aura-triager picks up the alert in 18 seconds, classifies it as a Critical Incident, and routes it directly to aura-repro.',
  },
  {
    timestamp: 142,
    timeLabel: '02:22',
    title: 'Containment Script Formulation',
    cursorAction: 'aura-repro inspects logs and formulates iptables DROP rule, nginx location block, and DB integrity query.',
    narration:
      'aura-repro immediately activates, analyzes the attack signature, and formats an emergency containment script: an iptables DROP rule and an nginx location block. It explicitly asks Sneha for human sign-off.',
  },
  {
    timestamp: 172,
    timeLabel: '02:52',
    title: 'Human Lead Sign-Off (@Sneha)',
    cursorAction: 'User types and submits: "@aura-repro approved".',
    narration:
      'Human in the loop verification: Sneha reviews the containment plan and submits approval. aura-repro logs the approval and applies the containment rules.',
  },
  {
    timestamp: 258,
    timeLabel: '04:18',
    title: 'Automated A.U.R.A. Incident Report',
    cursorAction: 'aura-reporter automatically generates the post-incident markdown report with timeline, mitigation commands, and root cause.',
    narration:
      'With containment executed, aura-reporter automatically compiles the official A.U.R.A. Incident Report with full timeline, actions executed, and follow-up recommendations. The workflow closes cleanly!',
  },
];

export const FULL_VOICEOVER_SCRIPT = `
[00:00] Welcome to Team A.U.R.A. running on SandboxAQ Switch! Here in our local Switch Console, our Switch server is active with Mattermost bridged and Switch Trust guardrails enabled for enterprise compliance.

[00:09] In our Agents tab, we have configured our specialized incident triage squad: aura-reporter, aura-repro, aura-triager, and switch-buddy-admin, all running autonomously on OpenCode.

[00:16] First, aura-reporter is programmed to stand by and generate comprehensive post-incident post-mortems in Markdown once human approval is confirmed.

[00:23] Next is aura-repro, our vulnerability containment specialist. It reproduces exploits, writes minimal containment rules, and is strictly gated to require human approval before applying changes.

[00:30] Here is aura-triager, the lead triage agent. It ingests noisy log alerts, summarizes the threat vector, tags severity, and immediately delegates confirmed threats to aura-repro.

[00:56] Now, moving to our shared collaborative room: aura-triage. All four agents are listening alongside human security leads in Mattermost.

[01:13] An alert is posted: 342 SQL injection attempts on web-03 exfiltrating 4.1 megabytes of data. aura-triager picks up the alert in 18 seconds, classifies it as a Critical Incident, and routes it directly to aura-repro.

[02:22] aura-repro immediately activates, analyzes the attack signature, and formats an emergency containment script: an iptables DROP rule and an nginx location block. It explicitly asks Sneha for human sign-off.

[02:52] Human in the loop verification: Sneha reviews the containment plan and submits approval. aura-repro logs the approval and applies the containment rules.

[04:18] With containment executed, aura-reporter automatically compiles the official A.U.R.A. Incident Report with full timeline, actions executed, and follow-up recommendations. The workflow closes cleanly!
`.trim();

export const VideoWalkthrough: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(310);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState<boolean>(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [videoLoadError, setVideoLoadError] = useState<boolean>(false);
  const lastSpokenChapterRef = useRef<number>(-1);

  // Load browser voices (filtering for female/English voices)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Prefer a natural female English voice
      const preferredFemale =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            /female|zira|samantha|karen|victoria|moira|google us english/i.test(v.name)
        ) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      if (preferredFemale) {
        setSelectedVoice(preferredFemale);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update current time and trigger voiceover
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Determine current chapter
    let activeIdx = 0;
    for (let i = VIDEO_CHAPTERS.length - 1; i >= 0; i--) {
      if (time >= VIDEO_CHAPTERS[i].timestamp) {
        activeIdx = i;
        break;
      }
    }
    setCurrentChapterIndex(activeIdx);

    // If voiceover is enabled and this chapter hasn't been spoken yet during playback
    if (voiceoverEnabled && activeIdx !== lastSpokenChapterRef.current && isPlaying) {
      lastSpokenChapterRef.current = activeIdx;
      speakChapterNarration(VIDEO_CHAPTERS[activeIdx].narration);
    }
  };

  const speakChapterNarration = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 1.05; // natural pacing
    utterance.pitch = 1.1; // clear female tone
    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      if (voiceoverEnabled) {
        speakChapterNarration(VIDEO_CHAPTERS[currentChapterIndex].narration);
        lastSpokenChapterRef.current = currentChapterIndex;
      }
    }
  };

  const seekToChapter = (timestamp: number, index: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timestamp;
    setCurrentTime(timestamp);
    setCurrentChapterIndex(index);
    lastSpokenChapterRef.current = index;
    if (isPlaying && voiceoverEnabled) {
      speakChapterNarration(VIDEO_CHAPTERS[index].narration);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(FULL_VOICEOVER_SCRIPT);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const currentChapter = VIDEO_CHAPTERS[currentChapterIndex] || VIDEO_CHAPTERS[0];

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header with Title and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2">
            <Sparkles size={14} />
            <span>Official Video Walkthrough & Voiceover</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Team A.U.R.A. Multi-Agent Incident Triage (Live Demo)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Recorded directly inside the local SandboxAQ Switch console with Mattermost bridge and 3 custom autonomous agents.
          </p>
        </div>

        {/* Voiceover & Copy Script Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <CheckCircle2 size={14} />
            <span>Voice Baked in Video Track</span>
          </div>

          <a
            href="https://1drv.ms/v/c/2b13bd8cb0e5c2dd/IQA2jMKnnFWPR5vsMPITMbR2AR3h2E9Eg1PeOK-E3sprv6c?e=gMZjrr"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/20"
          >
            <ExternalLink size={14} />
            <span>Watch on Cloud (OneDrive)</span>
          </a>

          <a
            href="/assets/aistudio/new_video_2e9ae54b.mp4"
            download="AURA_Switch_Incident_Triage_Demo.mp4"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-orange-500/20"
          >
            <Download size={14} />
            <span>Download Voiced Video (MP4)</span>
          </a>

          <button
            onClick={handleCopyScript}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            {copiedScript ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedScript ? 'Script Copied!' : 'Copy Script'}</span>
          </button>
        </div>
      </div>

      {/* Main Video & Live Narration Ticker Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-black aspect-video shadow-2xl group">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                setVideoLoadError(false);
                if (videoRef.current) setDuration(videoRef.current.duration || 310);
              }}
              onError={() => {
                console.warn('[Video Player] Primary video source encountered an issue, fallback active.');
                setVideoLoadError(true);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              muted={isMuted}
              playsInline
              preload="metadata"
            >
              <source src="/assets/aistudio/new_video_2e9ae54b.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {videoLoadError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Play size={28} />
                </div>
                <h4 className="text-sm font-bold text-white">Direct Stream Mode Active</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  The interactive chapter navigator and live female voiceover narration remain active below. You can also open the recording directly in a new tab:
                </p>
                <a
                  href="/assets/aistudio/new_video_2e9ae54b.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg"
                >
                  <Play size={14} />
                  <span>Open Video in New Tab</span>
                </a>
              </div>
            )}

            {/* Quick Play/Pause Center Overlay on Hover */}
            {!videoLoadError && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100 focus:opacity-100"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                <div className="p-4 rounded-full bg-orange-500/90 text-slate-950 shadow-2xl transform hover:scale-110 transition-transform">
                  {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </div>
              </button>
            )}

            {/* Chapter Badge Overlay (Top Left) */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-white text-xs font-bold flex items-center gap-2 z-20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{currentChapter.timeLabel} - {currentChapter.title}</span>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            {/* Seek Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 w-10">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (videoRef.current) videoRef.current.currentTime = val;
                  setCurrentTime(val);
                }}
                className="flex-1 accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-xs font-mono text-slate-400 w-10 text-right">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold transition-all"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={() => {
                    const newMuted = !isMuted;
                    setIsMuted(newMuted);
                    if (videoRef.current) videoRef.current.muted = newMuted;
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <div className="text-xs text-slate-400 hidden sm:block">
                  Current Chapter: <span className="text-orange-400 font-bold">{currentChapter.title}</span>
                </div>
              </div>

              {/* Voice Selector if available */}
              {availableVoices.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="hidden sm:inline">Voice:</span>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const v = availableVoices.find((item) => item.name === e.target.value);
                      if (v) setSelectedVoice(v);
                    }}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 max-w-[150px] truncate"
                  >
                    {availableVoices
                      .filter((v) => v.lang.startsWith('en'))
                      .map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Live Synchronized Narration Ticker */}
          <div className="bg-gradient-to-r from-orange-950/40 via-slate-950 to-slate-900 border border-orange-500/30 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-orange-400 flex items-center gap-1.5">
                <Mic size={14} className={voiceoverEnabled && isPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-500'} />
                <span>Live Voiceover Subtitles & Cursor Action</span>
              </span>
              <span className="font-mono text-slate-400 text-[11px]">{currentChapter.timeLabel}</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              "{currentChapter.narration}"
            </p>
            <div className="text-xs text-amber-300/80 flex items-start gap-1.5 pt-1 border-t border-slate-800">
              <Terminal size={12} className="shrink-0 mt-0.5" />
              <span><strong>Cursor Action:</strong> {currentChapter.cursorAction}</span>
            </div>
          </div>
        </div>

        {/* Interactive Chapters Column */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ListOrdered size={16} className="text-orange-400" />
                <h3 className="text-sm font-bold text-white">Interactive Chapters</h3>
              </div>
              <span className="text-[11px] text-slate-400">Click to jump</span>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {VIDEO_CHAPTERS.map((chap, idx) => {
                const isActive = idx === currentChapterIndex;
                return (
                  <button
                    key={chap.timestamp}
                    onClick={() => seekToChapter(chap.timestamp, idx)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-orange-500/10 border-orange-500/50 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {chap.timeLabel}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold truncate ${isActive ? 'text-orange-400' : 'text-slate-300'}`}>
                        {chap.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {chap.cursorAction}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle2 size={14} />
              <span>Verified Autonomous Flow</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Demonstrates alert detection, severity classification (<code className="text-amber-300">@aura-triager</code>),
              iptables containment generation (<code className="text-amber-300">@aura-repro</code>), human sign-off (<code className="text-amber-300">@Sneha</code>),
              and post-mortem report (<code className="text-amber-300">@aura-reporter</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
