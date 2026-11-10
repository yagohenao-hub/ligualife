async function runTest() {
  const baseUrl = 'http://localhost:3000';
  console.log('Testing Vocabulary API...');

  const categories = ['time_words', 'prepositions_in_on_at', 'wh_words', 'cefr_general'];

  for (const cat of categories) {
    try {
      const res = await fetch(`${baseUrl}/api/student/vocabulary?category=${cat}`);
      const data = await res.json();
      console.log(`[GET] Category "${cat}": Status ${res.status}, words: ${data.words?.length || 0}`);
      if (data.words && data.words.length > 0) {
        console.log(`  Sample word: "${data.words[0].word}" (${data.words[0].senses?.length} senses)`);
      }
    } catch (e) {
      console.error(`Error querying category ${cat}:`, e.message);
    }
  }

  // Test POST status update
  try {
    const postRes = await fetch(`${baseUrl}/api/student/vocabulary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: '23cf0a83-2436-4569-bfde-45c3f9ad23cf', // Mónica Torres
        wordId: 'vw-can',
        senseId: 'vs-can-1',
        status: 'mastered'
      })
    });
    const postData = await postRes.json();
    console.log('[POST] Update word status:', postRes.status, postData);
  } catch (e) {
    console.error('Error posting status:', e.message);
  }
}

runTest().catch(console.error);
