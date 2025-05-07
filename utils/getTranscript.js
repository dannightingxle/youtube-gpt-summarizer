// utils/getTranscript.js
const { YouTubeTranscript } = require("youtube-transcript");

/**
 * Try to fetch captions from YouTube.
 * On any error (410, network, etc.), return null.
 */
async function getTranscriptFromYouTube(youtubeUrl) {
  try {
    console.log("📄 Trying YouTube captions…");
    const transcript = await YouTubeTranscript.fetchTranscript(youtubeUrl);
    const text = transcript.map((p) => p.text).join(" ");
    console.log("✅ Captions fetched");
    return text;
  } catch (err) {
    console.warn("⚠️ YouTube captions failed:", err.message || err);
    return null;
  }
}

module.exports = { getTranscriptFromYouTube };
