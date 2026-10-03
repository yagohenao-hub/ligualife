const fs = require('fs');
const path = require('path');

async function testFlux() {
  const prompt = 'cozy techy low-poly 3D diorama isometric game art of a modern office desk with dual monitors, glowing screens, cute small plant, vibrant soft pastel and neon violet lighting, smooth stylized 3D video game aesthetic';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&model=flux&nologo=true&seed=123`;
  
  console.log('Testing Pollinations Flux model...');
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const outputPath = path.join(__dirname, '../public/flashcards/test_flux.jpg');
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`Success! Saved Flux image (${buffer.byteLength} bytes) to ${outputPath}`);
    } else {
      console.error('Failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testFlux();
