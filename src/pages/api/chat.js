export const prerender = false;

export async function POST({ request }) {
  const { messages } = await request.json();

  const apiKey = import.meta.env.OPENAI_API_KEY;
  console.log("API Key:", apiKey); // Debugging line to check if the API key is being read correctly
  console.log(import.meta.env); // Debugging line to check the environment variables

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}