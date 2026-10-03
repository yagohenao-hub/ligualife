const fs = require('fs');
const path = require('path');

async function downloadSample(prompt, filename) {
  // Using Pollinations with prompt enhancement and seed
  const cleanPrompt = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=768&height=768&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;
  
  console.log(`[Batch Test] Generating: ${filename}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const buffer = await res.arrayBuffer();
    const dest = path.join(__dirname, '../public/flashcards', filename);
    fs.writeFileSync(dest, Buffer.from(buffer));
    console.log(`[Batch Test] Saved: ${dest} (${buffer.byteLength} bytes)`);
    return true;
  } catch (err) {
    console.error(`[Batch Test] Error generating ${filename}:`, err.message);
    return false;
  }
}

async function run() {
  await downloadSample(
    'Cozy low-poly 3D diorama of a cute pair of silver scissors snipping a wooden block corner, revealing funny loose colorful game cables inside, vibrant indie puzzle game style',
    'sample_cut_corners_lowpoly.jpg'
  );

  await downloadSample(
    'Cozy stylized colored pencil sketch of a student sitting with books having an eureka moment, a glowing warm vintage lightbulb sparkling above their head, soft pastel violet and golden colored-pencil shading on cream paper',
    'sample_realize_sketch.jpg'
  );
}

run();
