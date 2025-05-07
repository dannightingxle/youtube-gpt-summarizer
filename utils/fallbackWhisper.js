// utils/fallbackWhisper.js
const fs = require("fs");
const tmp = require("tmp");
const ytdl = require("ytdl-core");
const axios = require("axios");
const FormData = require("form-data");

require("dotenv").config();
const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function fallbackWhisper(youtubeUrl) {
  console.log("🔁 Starting Whisper fallback via API…");

  // 1) create a temp file for webm audio
  const tempFile = tmp.tmpNameSync({ postfix: ".webm" });

  // 2) download audio-only stream into it
  const audioStream = ytdl(youtubeUrl, {
    filter: "audioonly",
    quality: "highestaudio",
  });
  await new Promise((res, rej) => {
    const ws = fs.createWriteStream(tempFile);
    audioStream.pipe(ws);
    ws.on("finish",  res);
    ws.on("error",   rej);
  });
  console.log("✅ Audio downloaded to", tempFile);

  // 3) send to Whisper API
  const form = new FormData();
  form.append("file", fs.createReadStream(tempFile));
  form.append("model", "whisper-1");

  console.log("📡 Sending to Whisper API…");
  try {
    const resp = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      { headers: { 
          Authorization: `Bearer ${OPENAI_KEY}`,
          ...form.getHeaders(),
        }
      }
    );
    console.log("✅ Whisper transcript received");
    return resp.data.text;
  } catch (e) {
    console.error("❌ Whisper API error:", e.response?.data || e.message);
    return null;
  } finally {
    fs.unlinkSync(tempFile);
  }
}

module.exports = { fallbackWhisper };
