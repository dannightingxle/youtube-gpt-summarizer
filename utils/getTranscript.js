const { getTranscript } = require("youtube-transcript-api");

async function getTranscriptFromYouTube(url) {
  try {
    const videoId = new URL(url).searchParams.get("v");
    const transcript = await getTranscript(videoId);
    return transcript.map(line => line.text).join(" ");
  } catch (err) {
    console.error("❌ Transcript error:", err.message || err);
    return null;
  }
}

module.exports = { getTranscriptFromYouTube };
