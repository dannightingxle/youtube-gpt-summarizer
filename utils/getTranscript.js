// utils/getTranscript.js

/**
 * Stub out YouTube captions entirely.
 * Always return null so your Whisper fallback runs.
 */
async function getTranscriptFromYouTube(youtubeUrl) {
  // We’re not using captions any more.
  return null;
}

module.exports = { getTranscriptFromYouTube };
