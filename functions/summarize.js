const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getTranscriptFromYouTube } = require("../utils/getTranscript");
const { summarizeTranscript } = require("../utils/summarizeTranscript");
const { transcribeWithWhisper } = require("../utils/fallbackWhisper");
const { supabase } = require("../supabaseClient");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/summarize", async (req, res) => {
  const { email, youtubeUrl } = req.body;

  if (!email || !youtubeUrl) {
    return res.status(400).json({ error: "Missing email or YouTube URL" });
  }

  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  const today = new Date().toISOString().split("T")[0];

  if (!user) {
    const { data: newUser } = await supabase
      .from("users")
      .insert([{ email, isPro: false, usageToday: 1, lastUsedDate: today }])
      .select()
      .single();
    user = newUser;
  } else {
    if (user.lastUsedDate !== today) {
      await supabase
        .from("users")
        .update({ usageToday: 0, lastUsedDate: today })
        .eq("email", email);
      user.usageToday = 0;
    }

    if (!user.isPro && user.usageToday >= 5) {
      return res.json({
        error: "Free limit reached",
        upgrade: true,
        message:
          "You’ve reached your free summary limit. [Click here to upgrade for unlimited access]",
      });
    }

    await supabase
      .from("users")
      .update({ usageToday: user.usageToday + 1 })
      .eq("email", email);
  }

  let transcript = await getTranscriptFromYouTube(youtubeUrl);

  console.log("📄 Transcript from captions:", transcript?.slice(0, 100));

  if (
    !transcript ||
    transcript.trim().length < 20 ||
    transcript.toLowerCase().includes("youtube is currently blocking")
  ) {  
    console.log("🔁 No captions found, trying Whisper fallback...");
    try {
      transcript = await transcribeWithWhisper(youtubeUrl);
    } catch (err) {
      console.error("❌ Whisper failed:", err.message || err);
      return res.status(400).json({ error: "Transcript not available." });
    }
  }

  const summary = await summarizeTranscript(transcript);
  return res.json({ summary });
});

module.exports = app;
