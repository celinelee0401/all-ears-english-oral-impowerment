export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { transcript } = JSON.parse(event.body || "{}");
    if (!transcript) throw new Error("缺少 transcript");

    const prompt = `You are an expert English teacher analyzing an All Ears English podcast episode transcript.

Analyze this transcript and return a JSON object (no markdown, no backticks, just raw JSON) with this exact structure:
{
  "summary": "2-3 sentence summary of the episode topic in Traditional Chinese",
  "vocabulary": [
    {
      "phrase": "the English phrase or word",
      "meaning": "Traditional Chinese meaning",
      "example": "A natural example sentence using this phrase"
    }
  ],
  "warmup_prompts": [
    "Opening line 1 that Aubrey might say to start the conversation",
    "Opening line 2 - a different approach",
    "Opening line 3 - another option"
  ],
  "hint_cards": [
    "Helpful phrase or sentence the user can say during practice",
    "Another useful phrase",
    "Another useful phrase",
    "Another useful phrase",
    "Another useful phrase"
  ]
}

Rules:
- vocabulary: pick the 6 most useful/interesting phrases from the transcript
- warmup_prompts: natural Aubrey-style opening lines based on the episode content
- hint_cards: 5 useful phrases/sentences the learner can reference during conversation
- All Chinese text must be Traditional Chinese

Transcript:
${transcript.slice(0, 3000)}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    const raw = data.choices[0].message.content.trim();
    
    // Strip markdown if present
    const clean = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(clean);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
