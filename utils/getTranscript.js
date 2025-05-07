// utils/getTranscript.js
const { YouTubeTranscript } = require("youtube-transcript");
const { fallbackWhisper } = require("./fallbackWhisper");

async function getTranscriptFromYouTube(youtubeUrl) {
  try {
    console.log("📄 Trying YouTube captions…");
    const raw = await YouTubeTranscript.fetchTranscript(youtubeUrl);
    const text = raw.map(p => p.text).join(" ");
    console.log("✅ Captions found");
    return text;
  } catch (err) {
    console.warn("🔁 No captions, falling back to Whisper API…");
    const t = await fallbackWhisper(youtubeUrl);
    if (t) return t;
    console.error("❌ Whisper API also failed");
    return null;
  }
}

module.exports = { getTranscriptFromYouTube };
