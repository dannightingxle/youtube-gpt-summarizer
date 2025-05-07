// utils/getTranscript.js
const { YouTubeTranscript } = require("youtube-transcript");
const { fallbackWhisper } = require("./fallbackWhisper");

async function getTranscriptFromYouTube(youtubeUrl) {
  try {
    console.log("📄 Trying YouTube captions...");
    const transcript = await YouTubeTranscript.fetchTranscript(youtubeUrl);
    const text = transcript.map(entry => entry.text).join(" ");
    console.log("✅ Captions found");
    return text;
  } catch (err) {
    console.warn("🔁 No captions found, trying Whisper fallback...");
    const fallback = await fallbackWhisper(youtubeUrl);
    if (fallback) {
      console.log("✅ Whisper fallback successful");
      return fallback;
    } else {
      console.error("❌ Whisper fallback failed");
      return null;
    }
  }
}

module.exports = { getTranscriptFromYouTube };
