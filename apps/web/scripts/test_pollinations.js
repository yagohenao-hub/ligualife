const fs = require('fs');
const path = require('path');

async function testPollinations() {
  const prompt = 'cozy warm colored pencil sketch of a cute wooden desk with plants, tech laptop, soft lighting, storybook illustration style, vibrant pastel colors';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true&seed=42`;
  
  console.log('Testing Pollinations API URL:', url);
  try {
    const res = await fetch(url);
    console.log('Pollinations Response Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const outputPath = path.join(__dirname, '../public/flashcards/test_pollinations.jpg');
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`Success! Saved test image (${buffer.byteLength} bytes) to ${outputPath}`);
    } else {
      console.error('Failed with status:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Error connecting to Pollinations:', err.message);
  }
}

testPollinations();
