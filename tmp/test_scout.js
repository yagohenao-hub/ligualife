const { discoverVideos } = require('../apps/web/lib/scout');

async function test() {
  console.log("Testing discovery...");
  try {
    const results = await discoverVideos('', false); // Random search, strict mode
    console.log(`Found ${results.videos.length} videos`);
    results.videos.forEach(v => {
      console.log(`- ${v.title} (${v.duration}s): ${v.url}`);
    });
    if (results.debug) {
      console.log("Debug info:", results.debug);
    }
  } catch (err) {
    console.error("Discovery failed:", err);
  }
}

test();
