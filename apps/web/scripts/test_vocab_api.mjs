async function runTest() {
  const baseUrl = 'http://localhost:3000';
  console.log('Testing Vocabulary API...');

  const categories = [
    'time_words',
    'prepositions_in_on_at',
    'wh_words',
    'logical_connectors',
    'phrasal_verbs',
    'cefr_general'
  ];

  for (const cat of categories) {
    try {
      const res = await fetch(`${baseUrl}/api/student/vocabulary?category=${cat}&level=A1`);
      const data = await res.json();
      console.log(`[GET] Category "${cat}": Status ${res.status}, words: ${data.words?.length || 0}`);
      if (data.words && data.words.length > 0) {
        console.log(`  Sample word: "${data.words[0].word}" (${data.words[0].senses?.length} senses)`);
      }
    } catch (e) {
      console.error(`Error querying category ${cat}:`, e.message);
    }
  }
}

runTest().catch(console.error);
