// utils/summarizeTranscript.js
const dotenv = require("dotenv");
dotenv.config();

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Rough heuristic: max ~2000 tokens per chunk (~12 000 characters)
const MAX_CHARS = 12_000;

// Split transcript into chunks on natural breaks
function chunkTranscript(text) {
  const chunks = [];
  let cursor = 0;
  while (cursor < text.length) {
    let end = Math.min(cursor + MAX_CHARS, text.length);
    if (end < text.length) {
      const nl = text.lastIndexOf("\n", end);
      if (nl > cursor) end = nl;
    }
    chunks.push(text.slice(cursor, end));
    cursor = end;
  }
  return chunks;
}

async function summarizeTranscript(fullText) {
  // 1) Break into manageable chunks
  const chunks = chunkTranscript(fullText);
  const partials = [];

  // 2) Summarize each chunk
  for (let i = 0; i < chunks.length; i++) {
    const prompt = `
You are an expert summarizer. Here is part ${i + 1} of a transcript. Summarize it with:
1. Key Points
2. Main Learnings
3. Actionable Takeaways

Transcript part:
${chunks[i]}
`;
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    partials.push(res.choices[0].message.content.trim());
  }

  // 3) Merge partial summaries into a final cohesive summary
  const combinePrompt = `
You have these section summaries of a YouTube video:
${partials.map((s, i) => `--- Part ${i + 1} Summary ---\n${s}`).join("\n\n")}

Please merge them into a single cohesive summary, organized into:
1. Key Points
2. Main Learnings
3. Actionable Takeaways
`;
  const finalRes = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: combinePrompt }],
  });

  return finalRes.choices[0].message.content.trim();
}

module.exports = { summarizeTranscript };
