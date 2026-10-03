async function test() {
  try {
    const res = await fetch('https://perchance.org/ai-text-to-image-generator', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('HTTP Status:', res.status);
    const text = await res.text();
    console.log('Response length:', text.length);
    console.log('Snippet:', text.slice(0, 300));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
