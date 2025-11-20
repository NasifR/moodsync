import OpenAI from "openai";

export async function POST(req) {
  const { prompt } = await req.json();

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Create a streaming response
  const stream = await client.responses.stream({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  // Convert the stream into a readable stream for the client
  const readable = stream.toReadableStream();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
