import fs from 'fs';

async function testLoginAndTrivia() {
  const monica = { email: 'monica.torrespi@gmail.com', pin: '5MO546', name: 'Mónica Torres' };
  const camila = { email: 'macamilamorenogil@gmail.com', pin: 'MA4590', name: 'María Camila Moreno' };

  console.log('=== 1. TEST LOGIN ===');
  for (const s of [monica, camila]) {
    const res = await fetch('http://localhost:3000/api/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: s.email, pin: s.pin })
    });
    const data = await res.json();
    console.log(`Login ${s.name} (${s.email}): HTTP ${res.status}`);
    console.log('  Data:', JSON.stringify(data, null, 2));
  }

  console.log('\n=== 2. TEST TRIVIA POST (TOPICS 1 A 6) ===');
  for (let topicNum = 1; topicNum <= 6; topicNum++) {
    const res = await fetch('http://localhost:3000/api/student/trivia-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicOrder: topicNum,
        topicName: `Tema ${topicNum}`,
        studentName: 'Mónica',
        level: 'A1-A2'
      })
    });
    const data = await res.json();
    console.log(`Trivia Topic ${topicNum}: HTTP ${res.status} | Questions returned: ${data.questions?.length}`);
    if (data.questions && data.questions.length > 0) {
      console.log(`  Sample Q: "${data.questions[0].question}"`);
      console.log(`  Options: ${JSON.stringify(data.questions[0].options)}`);
      console.log(`  Correct: Option #${data.questions[0].correctIndex + 1}: "${data.questions[0].options[data.questions[0].correctIndex]}"`);
    }
  }

  console.log('\n=== 3. TEST GENERATE PRACTICE (REPASO) ===');
  const pRes = await fetch('http://localhost:3000/api/student/generate-practice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topicName: 'Prepositions (In, On, At) & Preposition Stranding',
      topicOrder: 6,
      studentName: 'Mónica',
      level: 'A2'
    })
  });
  const pData = await pRes.json();
  console.log(`Generate Practice HTTP ${pRes.status}: ${pData.documentTitle}`);
  console.log(`  Activities: ${pData.activities?.length}`);
  pData.activities?.forEach((act, idx) => {
    console.log(`    Activity ${idx + 1}: "${act.title}" (${act.items?.length} items)`);
    if (act.items?.[0]) {
      console.log(`      Item 1 Prompt: "${act.items[0].prompt}" | Solution: "${act.items[0].solution}"`);
    }
  });

  console.log('\n=== 4. TEST SHORT READING ===');
  const srRes = await fetch('http://localhost:3000/api/student/generate-short-reading', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topicOrder: 6,
      topicName: 'Prepositions (In, On, At) & Preposition Stranding',
      studentName: 'Mónica'
    })
  });
  const srData = await srRes.json();
  console.log(`Short Reading HTTP ${srRes.status}: Title "${srData.reading?.title}"`);
  console.log(`  Paragraphs: ${srData.reading?.paragraphs?.length}`);
  console.log(`  Vocabulary highlight count: ${srData.reading?.vocabulary?.length}`);
}

testLoginAndTrivia().catch(console.error);
