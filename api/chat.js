export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Only POST allowed');

  const { messages, model = 'gpt-4' } = req.body;

  try {
    const openRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, messages, temperature: 0.7 })
    });
    const data = await openRes.json();
    res.status(openRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'OpenAI request failed' });
  }
}
