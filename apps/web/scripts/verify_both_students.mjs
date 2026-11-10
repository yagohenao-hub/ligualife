import fs from 'fs';

async function checkStudent(name, id) {
  const url = `http://localhost:3000/api/student/sessions?studentId=${id}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`\n=================== ${name} ===================`);
  console.log('Status HTTP:', res.status);
  console.log('Profile:', JSON.stringify(data.studentProfile, null, 2));
  console.log('Completed sessions count:', data.completedSessions?.length);
  console.log('Completed topics:', data.completedSessions?.map(s => ({ order: s.topicOrder, name: s.topicName, date: s.date })));
  console.log('Upcoming sessions count:', data.upcomingSessions?.length);
  console.log('Upcoming topics:', data.upcomingSessions?.map(s => ({ order: s.topicOrder, name: s.topicName, date: s.date })));
}

async function main() {
  await checkStudent('MÓNICA TORRES', '23cf0a83-2436-4569-bfde-45c3f9ad23cf');
  await checkStudent('MARÍA CAMILA MORENO', '7cc88332-5008-4dc6-89c8-20bc91ccd1c6');
}

main().catch(console.error);
