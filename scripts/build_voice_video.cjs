const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const googleTTS = require('google-tts-api');

const chapters = [
  {
    timestamp: 0.5,
    text: "Welcome to Team A.U.R.A. running on SandboxAQ Switch! Here in our local Switch Console, our Switch server is active with Mattermost bridged and Switch Trust guardrails enabled for enterprise compliance."
  },
  {
    timestamp: 9.5,
    text: "In our Agents tab, we have configured our specialized incident triage squad: aura-reporter, aura-repro, aura-triager, and switch-buddy-admin, all running autonomously on OpenCode."
  },
  {
    timestamp: 16.5,
    text: "First, aura-reporter is programmed to stand by and generate comprehensive post-incident post-mortems in Markdown once human approval is confirmed."
  },
  {
    timestamp: 23.5,
    text: "Next is aura-repro, our vulnerability containment specialist. It reproduces exploits, writes minimal containment rules, and is strictly gated to require human approval before applying changes."
  },
  {
    timestamp: 30.5,
    text: "Here is aura-triager, the lead triage agent. It ingests noisy log alerts, summarizes the threat vector, tags severity, and immediately delegates confirmed threats to aura-repro."
  },
  {
    timestamp: 56.0,
    text: "Now, moving to our shared collaborative room: aura-triage. All four agents are listening alongside human security leads in Mattermost."
  },
  {
    timestamp: 73.0,
    text: "An alert is posted: 342 SQL injection attempts on web-03 exfiltrating 4.1 megabytes of data. aura-triager picks up the alert in 18 seconds, classifies it as a Critical Incident, and routes it directly to aura-repro."
  },
  {
    timestamp: 142.0,
    text: "aura-repro immediately activates, analyzes the attack signature, and formats an emergency containment script: an iptables DROP rule and an nginx location block. It explicitly asks Sneha for human sign-off."
  },
  {
    timestamp: 172.0,
    text: "Human in the loop verification: Sneha reviews the containment plan and submits approval. aura-repro logs the approval and applies the containment rules."
  },
  {
    timestamp: 258.0,
    text: "With containment executed, aura-reporter automatically compiles the official A.U.R.A. Incident Report with full timeline, actions executed, and follow-up recommendations. The workflow closes cleanly!"
  }
];

async function run() {
  const tempDir = path.resolve(__dirname, '../.audio_temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  console.log("1. Generating TTS audio clips...");
  const clipFiles = [];

  for (let i = 0; i < chapters.length; i++) {
    const item = chapters[i];
    const base64List = await googleTTS.getAllAudioBase64(item.text, {
      lang: 'en',
      slow: false,
      timeout: 15000,
      splitPunct: ',.?!'
    });

    // Combine base64 buffers for this chapter
    const buffers = base64List.map(b => Buffer.from(b.base64, 'base64'));
    const combinedBuffer = Buffer.concat(buffers);
    const clipPath = path.join(tempDir, `clip_${i}.mp3`);
    fs.writeFileSync(clipPath, combinedBuffer);
    clipFiles.push({ path: clipPath, timestamp: item.timestamp });
    console.log(`- Generated clip_${i}.mp3 for timestamp ${item.timestamp}s`);
  }

  console.log("2. Building ffmpeg filter graph for synchronized audio...");
  // Use adelay for each clip according to its timestamp (in ms)
  const inputs = clipFiles.map(c => `-i "${c.path}"`).join(' ');
  const filterParts = clipFiles.map((c, idx) => {
    const delayMs = Math.round(c.timestamp * 1000);
    return `[${idx}:a]adelay=${delayMs}|${delayMs}[a${idx}]`;
  }).join(';');

  const mixInputs = clipFiles.map((_, idx) => `[a${idx}]`).join('');
  const filterGraph = `${filterParts};${mixInputs}amix=inputs=${clipFiles.length}:normalize=0[aout]`;

  const fullAudioPath = path.join(tempDir, 'full_voiceover.mp3');
  const mixCmd = `ffmpeg ${inputs} -filter_complex "${filterGraph}" -map "[aout]" -y "${fullAudioPath}"`;
  execSync(mixCmd, { stdio: 'inherit' });

  console.log("3. Merging voiceover track into video with faststart...");
  const inputVideo = path.resolve(__dirname, '../public/assets/aistudio/new_video_2e9ae54b.mp4');
  const outputVideo = path.resolve(__dirname, '../public/assets/aistudio/new_video_voiced.mp4');

  const mergeCmd = `ffmpeg -i "${inputVideo}" -i "${fullAudioPath}" -c:v copy -c:a aac -b:a 128k -map 0:v:0 -map 1:a:0 -movflags +faststart -y "${outputVideo}"`;
  execSync(mergeCmd, { stdio: 'inherit' });

  // Overwrite the video file with the voiced version
  fs.copyFileSync(outputVideo, inputVideo);
  const distVideo = path.resolve(__dirname, '../dist/assets/aistudio/new_video_2e9ae54b.mp4');
  if (fs.existsSync(path.dirname(distVideo))) {
    fs.copyFileSync(outputVideo, distVideo);
  }

  console.log("SUCCESS! Video now has permanently embedded female voiceover track.");
}

run().catch(err => {
  console.error("FAILED to generate voiced video:", err);
  process.exit(1);
});
