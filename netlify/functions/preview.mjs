export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    const { transcript } = JSON.parse(event.body || "{}");
    if (!transcript) throw new Error("缺少 transcript");

    const prompt = `You are an expert English teacher analyzing an All Ears English podcast episode transcript.

Analyze this transcript and return ONLY a raw JSON object (no markdown, no backticks) with this exact structure:
{
  "summary": "2-3 sentence summary in Traditional Chinese",
  "vocabulary": [
    { "phrase": "English phrase", "meaning": "Traditional Chinese meaning", "example": "Example sentence" }
  ],
  "warmup_prompts": ["Opening line 1", "Opening line 2", "Opening line 3"],
  "hint_cards": ["Useful phrase 1", "Useful phrase 2", "Useful phrase 3", "Useful phrase 4", "Useful phrase 5"],
  "dialogue": [
    { "speaker": "Lindsay", "text": "What they said" },
    { "speaker": "Aubrey", "text": "What they said" }
  ]
}

Rules:
- vocabulary: 6 most useful phrases from the transcript
- dialogue: parse the transcript into alternating speaker turns. The two speakers are Lindsay and Aubrey. If you cannot identify speakers clearly, alternate them starting with Lindsay. Keep each turn concise (max 3 sentences). Include 8-12 turns total.
- All Chinese must be Traditional Chinese

Transcript:
${transcript.slice(0, 4000)}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ANTHROPIC_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 2000, messages: [{ role: "user", content: prompt }], temperature: 0.3 }),
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    const raw = data.choices[0].message.content.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(raw);

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
