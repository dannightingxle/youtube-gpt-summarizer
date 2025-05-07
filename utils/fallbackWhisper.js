const { exec } = require("child_process");
const ytdlp = require("yt-dlp-exec");
const fs = require("fs");
const tmp = require("tmp");
const OpenAI = require("openai");
const ffmpeg = require("fluent-ffmpeg");

require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function transcribeWithWhisper(youtubeUrl) {
  return new Promise((resolve, reject) => {
    tmp.file({ postfix: ".webm" }, (err1, downloadPath) => {
      if (err1) return reject(err1);
    
      tmp.file({ postfix: ".mp3" }, async (err2, mp3Path, fd, cleanup) => {
        if (err2) return reject(err2);
    
        try {
          console.log("🎧 Downloading audio...");
          await ytdlp(youtubeUrl, {
            output: downloadPath,
            noCacheDir: true,
            forceOverwrite: true,
            format: "bestaudio",
          });          
    
          console.log("🔄 Converting to mp3...");
          ffmpeg(downloadPath)
            .toFormat("mp3")
            .on("end", async () => {
              console.log("✅ Audio ready for transcription");
    
              const response = await openai.audio.transcriptions.create({
                file: fs.createReadStream(mp3Path),
                model: "whisper-1",
              });
    
              cleanup();
              resolve(response.text);
            })
            .on("error", reject)
            .save(mp3Path);
        } catch (e) {
          reject(e);
        }
      });
    });    
  });
}

module.exports = { transcribeWithWhisper };
