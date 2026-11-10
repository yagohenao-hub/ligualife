import fs from 'fs';

async function auditBackend() {
  const monica = { id: '23cf0a83-2436-4569-bfde-45c3f9ad23cf', pin: '5MO546', name: 'Mónica Torres' };
  const camila = { id: '7cc88332-5008-4dc6-89c8-20bc91ccd1c6', pin: 'MA4590', name: 'María Camila Moreno' };

  console.log('=== AUDITORÍA 1: LOGIN POR PIN ===');
  for (const s of [monica, camila]) {
    const res = await fetch('http://localhost:3000/api/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: s.pin })
    });
    console.log(`Login ${s.name} (PIN: ${s.pin}): HTTP ${res.status}`);
    const data = await res.json();
    if (!res.ok) console.error('  Error:', data);
    else console.log(`  OK -> ID: ${data.student?.id}, Name: ${data.student?.['Full Name'] || data.student?.name}`);
  }

  console.log('\n=== AUDITORÍA 2: SESIONES Y TEMAS (TOPICS 1 A 6) ===');
  for (const s of [monica, camila]) {
    const res = await fetch(`http://localhost:3000/api/student/sessions?studentId=${s.id}`);
    const data = await res.json();
    console.log(`Sessions ${s.name}: HTTP ${res.status}`);
    console.log(`  Completed: ${data.completedSessions?.length} topics`);
    console.log(`  Upcoming: ${data.upcomingSessions?.length} classes`);
    console.log(`  Mastery Map keys:`, Object.keys(data.masteryMap || {}));
  }

  console.log('\n=== AUDITORÍA 3: TRIVIA QUESTIONS (TOPICS 1 A 6) ===');
  for (let topicNum = 1; topicNum <= 6; topicNum++) {
    const res = await fetch(`http://localhost:3000/api/student/trivia-questions?topicOrder=${topicNum}&studentId=${monica.id}`);
    const data = await res.json();
    console.log(`Trivia Topic ${topicNum}: HTTP ${res.status} | Questions returned: ${data.questions?.length}`);
    if (data.questions && data.questions.length > 0) {
      console.log(`  Sample Q: "${data.questions[0].question.slice(0, 60)}..."`);
    } else {
      console.warn(`  Warning: No questions returned for Topic ${topicNum}`);
    }
  }

  console.log('\n=== AUDITORÍA 4: GENERATE PRACTICE (GIMNASIO MENTAL REPASO) ===');
  // Test generating practice for Topic 6 (Prepositions)
  const practiceRes = await fetch('http://localhost:3000/api/student/generate-practice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topicOrder: 6,
      topicName: 'Prepositions (In, On, At) & Preposition Stranding',
      studentId: monica.id
    })
  });
  console.log(`Practice Topic 6: HTTP ${practiceRes.status}`);
  const practiceData = await practiceRes.json();
  if (practiceRes.ok) {
    console.log(`  Title: ${practiceData.practice?.documentTitle}`);
    console.log(`  Activities: ${practiceData.practice?.activities?.length}`);
    practiceData.practice?.activities?.forEach((act, i) => {
      console.log(`    Act ${i+1}: ${act.title} (${act.items?.length} items)`);
    });
  } else {
    console.error('  Practice Error:', practiceData);
  }

  console.log('\n=== AUDITORÍA 5: TOPIC MASTERY (GUARDADO DE RACHA/TIER) ===');
  const masteryRes = await fetch('http://localhost:3000/api/student/topic-mastery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: monica.id,
      topicOrder: 6,
      tier: 1, // Bronze
      streak: 5
    })
  });
  console.log(`Topic Mastery Topic 6: HTTP ${masteryRes.status}`);
  const masteryData = await masteryRes.json();
  console.log('  Response:', masteryData);
}

auditBackend().catch(console.error);
