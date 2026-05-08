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
    const { userMessage, transcript, history, targetPhrases } = JSON.parse(
      event.body || "{}"
    );

    const systemPrompt = `You are Lindsay, one of the hosts of the "All Ears English" podcast. You are warm, enthusiastic, and encouraging. Your co-host (the user) is playing the role of Aubrey.

Your job is to have a natural conversation based on this episode's ROLEPLAY section only:
---
${transcript}
---

Target phrases/vocabulary for this session: ${targetPhrases?.join(", ") || "use natural phrases from the transcript"}

Guidelines:
- Stay in character as Lindsay throughout the roleplay
- Naturally weave in the target phrases when appropriate
- Keep responses conversational and relatively short (2-4 sentences) — this is spoken dialogue, not an essay
- Focus ONLY on the roleplay content. Do NOT mention podcast promotion phrases like "hit the follow button", "subscribe", "check out our website", "follow the show", or any advertising language
- After your response, add a brief "💬 回饋：" section (in 繁體中文 Traditional Chinese) noting: (1) any grammar/vocabulary mistakes the user made, (2) a phrase the user could use more naturally next time
- Use the transcript as a guide but don't read it verbatim — improvise naturally around its themes
- Be encouraging! Connection NOT Perfection is the AEE motto.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: userMessage },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    const parts = reply.split("💬 Feedback:");
    const dialoguePart = parts[0].trim();
    const feedbackPart = parts[1] ? parts[1].trim() : "";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, dialoguePart, feedbackPart }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
