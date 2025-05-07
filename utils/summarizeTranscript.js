const dotenv = require("dotenv");
dotenv.config();

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeTranscript(text) {
  const prompt = `
You are an expert summarizer. Summarize the following YouTube transcript with:
1. Key Points
2. Main Learnings
3. Actionable Takeaways

Transcript:
${text}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
}

module.exports = { summarizeTranscript };
