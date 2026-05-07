import { YoutubeTranscript } from "youtube-transcript";

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
    const { videoId } = JSON.parse(event.body || "{}");
    if (!videoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "缺少 videoId" }),
      };
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });

    // 合併成完整文字，保留時間戳
    const segments = transcript.map((item) => ({
      text: item.text.replace(/\n/g, " ").trim(),
      offset: Math.floor(item.offset / 1000),
    }));

    const fullText = segments.map((s) => s.text).join(" ");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ segments, fullText }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "無法取得字幕" }),
    };
  }
};
