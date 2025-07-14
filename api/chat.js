export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ✅ 1. Extract and check Basic Auth credentials
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Protected"');
    return res.status(401).end('Authorization required');
  }

  const [user, pass] = Buffer.from(token, 'base64').toString().split(':');

  if (
    user !== process.env.LOGIN_USER ||
    pass !== process.env.LOGIN_PASS
  ) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Protected"');
    return res.status(401).end('Invalid credentials');
  }

  // ✅ 2. Proceed to call OpenAI API
  const { messages, model = 'gpt-4' } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
}
