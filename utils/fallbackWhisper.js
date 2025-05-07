// utils/fallbackWhisper.js
const fs = require("fs");
const tmp = require("tmp");
const ytdl = require("ytdl-core");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function fallbackWhisper(youtubeUrl) {
  console.log("🔁 Whisper fallback via API…");

  // 1. Create a temp file for the audio
  const tmpFile = tmp.tmpNameSync({ postfix: ".webm" });

  // 2. Download audio-only stream to that file
  await new Promise((resolve, reject) => {
    const stream = ytdl(youtubeUrl, { filter: "audioonly", quality: "highestaudio" });
    const ws = fs.createWriteStream(tmpFile);
    stream.pipe(ws);
    ws.on("finish", resolve);
    ws.on("error", reject);
  });
  console.log("✅ Audio downloaded:", tmpFile);

  // 3. Send to OpenAI Whisper API
  const form = new FormData();
  form.append("model", "whisper-1");
  form.append("file", fs.createReadStream(tmpFile));

  const resp = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    form,
    { headers: { 
        Authorization: `Bearer ${OPENAI_KEY}`,
        ...form.getHeaders()
      }
    }
  );

  // 4. Clean up and return text
  fs.unlinkSync(tmpFile);
  console.log("✅ Whisper transcript received");
  return resp.data.text;
}

// export under the name your route expects
module.exports = { transcribeWithWhisper: fallbackWhisper };
