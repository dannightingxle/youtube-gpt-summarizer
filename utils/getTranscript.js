const { YouTubeTranscript } = require("youtube-transcript");
const { fallbackWhisper }     = require("./fallbackWhisper");

async function getTranscriptFromYouTube(url) {
  try {
    console.log("📄 Trying YouTube captions…");
    const raw = await YouTubeTranscript.fetchTranscript(url);
    const text = raw.map(e => e.text).join(" ");
    console.log("✅ Captions fetched");
    return text;
  } catch (_err) {
    console.warn("🔁 Captions failed, falling back to Whisper API…");
    return await fallbackWhisper(url);
  }
}

module.exports = { getTranscriptFromYouTube };
