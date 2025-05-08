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
  try {
    const { email, youtubeUrl } = req.body;
    if (!email || !youtubeUrl) {
      return res.status(400).json({ error: "Missing email or YouTube URL" });
    }

    // Supabase usage tracking
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

    // Always fallback to Whisper API
    let transcript = await getTranscriptFromYouTube(youtubeUrl);
    console.log("📄 Transcript from captions:", transcript);

    // Use Whisper if no caption text
    if (!transcript) {
      console.log("🔁 No captions, using Whisper fallback...");
      transcript = await transcribeWithWhisper(youtubeUrl);
      if (!transcript) {
        return res.status(400).json({ error: "Transcript not available." });
      }
    }

    const summary = await summarizeTranscript(transcript);
    return res.json({ summary });
  } catch (err) {
    console.error("❌ /summarize crashed:", err);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
});

module.exports = app;