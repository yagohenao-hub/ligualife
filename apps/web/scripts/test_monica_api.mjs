import fs from 'fs';
import path from 'path';

async function main() {
  const url = 'http://localhost:3000/api/student/sessions?studentId=23cf0a83-2436-4569-bfde-45c3f9ad23cf';
  const res = await fetch(url);
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('studentProfile:', JSON.stringify(data.studentProfile, null, 2));
  console.log('completedSessions count:', data.completedSessions?.length);
  console.log('completedSessions topics:', data.completedSessions?.map(s => ({ id: s.id, order: s.topicOrder, name: s.topicName })));
  console.log('upcomingSessions count:', data.upcomingSessions?.length);
  console.log('upcomingSessions details:', data.upcomingSessions?.map(s => ({ id: s.id, date: s.date, name: s.topicName })));
}

main().catch(console.error);
