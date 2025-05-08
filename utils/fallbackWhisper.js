// utils/fallbackWhisper.js
const fs = require("fs");
const tmp = require("tmp");
const ytdl = require("ytdl-core");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();
const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function transcribeWithWhisper(youtubeUrl) {
  console.log("🔁 Whisper fallback via API…");
  try {
    const tmpFile = tmp.tmpNameSync({ postfix: ".webm" });
    await new Promise((res, rej) => {
      const stream = ytdl(youtubeUrl, { filter: "audioonly", quality: "highestaudio" });
      const ws = fs.createWriteStream(tmpFile);
      stream.pipe(ws);
      ws.on("finish", res);
      ws.on("error", rej);
      stream.on("error", rej);
    });
    console.log("✅ Audio downloaded");

    const form = new FormData();
    form.append("model", "whisper-1");
    form.append("file", fs.createReadStream(tmpFile));

    const resp = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      { headers: { Authorization: `Bearer ${OPENAI_KEY}`, ...form.getHeaders() } }
    );

    fs.unlinkSync(tmpFile);
    console.log("✅ Whisper transcript received");
    return resp.data.text;
  } catch (err) {
    console.error("❌ Whisper fallback error:", err.message || err);
    return null;
  }
}

module.exports = { transcribeWithWhisper };