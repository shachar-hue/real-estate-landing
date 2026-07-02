const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in environment. Copy .env.example to .env and set the key.');
  process.exit(1);
}

app.use(express.json());
app.use(express.static('public'));

app.post('/api/claude', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const body = {
      model: 'claude-fable-5',
      prompt: `Human: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: 800,
      temperature: 0.2,
      top_p: 1,
      stop_sequences: ['Human:']
    };

    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const json = await response.json();
    const text = json?.completion ?? json?.output ?? '';
    return res.json({ result: text });
  } catch (error) {
    console.error('Claude request failed:', error);
    return res.status(500).json({ error: 'Claude request failed' });
  }
});

app.listen(port, () => {
  console.log(`Claude demo server listening at http://localhost:${port}`);
});
