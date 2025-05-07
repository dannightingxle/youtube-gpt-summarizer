// utils/fallbackWhisper.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const tmp = require("tmp");
const ytdlp = require("yt-dlp-exec");

require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function fallbackWhisper(youtubeUrl) {
  console.log("🔁 Starting Whisper fallback...");

  const tempFile = tmp.tmpNameSync({ postfix: ".mp3" });
  console.log("🎧 Downloading audio to:", tempFile);

  try {
    // Download and convert audio to mp3 directly
    await ytdlp(youtubeUrl, {
      output: tempFile,
      extractAudio: true,
      audioFormat: "mp3",
    });

    console.log("✅ Audio downloaded");

    const form = new FormData();
    form.append("file", fs.createReadStream(tempFile));
    form.append("model", "whisper-1");

    console.log("📡 Sending to OpenAI Whisper API...");

    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", form, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
    });

    console.log("✅ Transcript received");
    return response.data.text;

  } catch (err) {
    console.error("❌ Whisper API failed:", err.message);
    return null;
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

module.exports = { fallbackWhisper };
