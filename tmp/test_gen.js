const fetch = require('node-fetch');

async function testGeneration() {
  const url = 'http://localhost:3000/api/generate-slides';
  const body = {
    studentName: 'Santiago',
    level: 'B2',
    vertical: 'Tech',
    interests: 'AI, Gaming',
    topicName: 'Past Simple',
    previousTopic: 'Present Simple',
    ldsFormula: 'S + V-ed + C'
  };

  console.log('Testing generation...');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Error:', text);
      return;
    }

    const data = await res.json();
    console.log('SUCCESS!');
    console.log('Slides count:', data.slides.length);
    console.log('Warmup Assets:', JSON.stringify(data.warmup, null, 2));
    console.log('Cooldown Assets:', JSON.stringify(data.cooldown, null, 2));
    
    if (data.warmup && data.cooldown && data.slides.length > 0) {
      console.log('VERIFICATION PASSED');
    } else {
      console.log('VERIFICATION FAILED: Missing assets');
    }
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}

testGeneration();
