# LinguaLife MVP Validation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate the complete LinguaLife MVP cycle end-to-end in production (Vercel) and fix any bugs found, so the platform is ready for first paying students.

**Architecture:** No new features. The entire codebase already implements the MVP. This plan walks through each flow in production, identifies failures, and fixes them. Work is ordered by priority: P1 (core) blocks P2 (operations) blocks P3 (growth).

**Tech Stack:** Next.js 16 (Pages Router), Airtable REST API, Google Gemini 2.5 Flash, Vercel

---

## Task 0: Seed Airtable with Minimum Viable Data

**Context:** The E2E validation requires real data in Airtable. Without this, no other task can proceed. You will create records directly in the Airtable web UI (not via API) to ensure the data structure is correct.

**Files:** None (Airtable web UI work)

- [ ] **Step 1: Create 1 Teacher record**

Open Airtable base `app9ZtojlxX5FoZ7y`, table `Teachers`. Create a record:

| Field | Value |
|-------|-------|
| Name | "Sebastian" (or your real name) |
| PIN | "1234" |
| Email | your real email |
| Phone | your real phone |
| Meeting Link | your Zoom/Google Meet URL |
| Availability | `[[false,false,false,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false],[true,true,true,true,true,false,false],[true,true,true,true,true,false,false],[true,true,true,true,true,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false]]` |

Note: That availability grid means available Mon-Fri at 9am, 10am, 11am (rows 3,4,5 = hours 9,10,11 since row 0 = 6am).

- [ ] **Step 2: Create 2 Student records**

Table `Students`. Create 2 records:

**Student 1:**
| Field | Value |
|-------|-------|
| Full Name | "Estudiante Prueba 1" |
| PIN | "5678" |
| Email | test email |
| Status | "Active" |
| Tokens de Reposicion | 3 |
| Interests | "Technology, Startups" |
| Notes | "Test student for MVP validation" |

**Student 2:**
| Field | Value |
|-------|-------|
| Full Name | "Estudiante Prueba 2" |
| PIN | "9012" |
| Email | second test email |
| Status | "Active" |
| Tokens de Reposicion | 2 |
| Interests | "Music, Travel" |

- [ ] **Step 3: Create Student-Teacher links**

Table `Student-Teacher`. Create 2 records linking each student to the teacher:

| Field | Value |
|-------|-------|
| Student | [link to Student 1] |
| Teacher | [link to Teacher] |
| Status | "Active" |

Repeat for Student 2.

- [ ] **Step 4: Create 10 Curriculum Topics**

Table `Curriculum Topics`. Create these 10 records in order:

| Order | Title | Level | LDS Formula | AI Context |
|-------|-------|-------|-------------|------------|
| 1 | "Present Simple - Daily Routines" | "B1" | "S + do/does + Action" | "Focus on routine verbs: wake up, commute, work, eat, sleep. Colombian context: traffic in Bogota, tinto breaks." |
| 2 | "Present Continuous - Right Now" | "B1" | "S + am/is/are + Action-ing" | "Actions happening now. Use classroom context: what are you doing right now?" |
| 3 | "Past Simple - Yesterday" | "B1" | "S + Action-ed / irregular" | "Narrate yesterday. Common irregulars: went, had, made, took, got." |
| 4 | "Future Simple - Plans" | "B1" | "S + will + Action" | "Future plans and predictions. Weekend plans, career goals." |
| 5 | "Present Perfect - Experience" | "B1" | "S + have/has + Action-ed" | "Life experiences: travel, food, achievements. Have you ever...?" |
| 6 | "Conditionals Type 1 - If/When" | "B2" | "If + S + present, S + will + Action" | "Real possibilities. Colombian scenarios: if it rains in Bogota, if you get the job." |
| 7 | "Modal Verbs - Advice" | "B2" | "S + should/could/must + Action" | "Giving advice at work. Professional Colombian context." |
| 8 | "Passive Voice - News" | "B2" | "Object + was/were + Action-ed" | "Reading news headlines. Transform active to passive." |
| 9 | "Reported Speech - Gossip" | "B2" | "S + said that + S + past" | "Reporting what others said. Office gossip, family stories." |
| 10 | "Phrasal Verbs - Business" | "B2" | "S + Verb + Particle" | "Common business phrasal verbs: set up, carry out, look into, bring up." |

For all records, set `Description` to a 1-sentence summary of the topic.

- [ ] **Step 5: Verify data integrity**

In Airtable, confirm:
- Teacher record has all fields populated (especially PIN and Availability)
- Both Students have PIN, Status=Active, and Tokens > 0
- Student-Teacher links show correct relationships (Status=Active)
- Curriculum Topics are numbered 1-10 with no gaps in Order

---

## Task 1: Validate Authentication (P1)

**Context:** Authentication is PIN-based via `POST /api/validate-unified`. If this fails, nothing else works. The endpoint first checks Teachers table, then Students table. Student login also resolves the active teacher via Student-Teacher junction.

**Files:**
- Test: `pages/api/validate-unified.ts` (read-only, fix if needed)
- Test: `pages/index.tsx` (read-only, fix if needed)
- Test: `hooks/useRequireAuth.ts` (read-only, fix if needed)

**Production URL:** Your Vercel deployment URL

- [ ] **Step 1: Test teacher login**

Open your Vercel URL in browser. Enter PIN "1234".

Expected: Redirect to `/dashboard`. Open browser DevTools → Application → Session Storage. Verify `lingualife_session` contains `{"teacherId":"recXXX","name":"Sebastian"}`.

If FAIL: Check browser console for errors. Check Vercel Function Logs for the `/api/validate-unified` call.

- [ ] **Step 2: Test student login**

Clear sessionStorage (DevTools → Application → Session Storage → Clear). Go back to `/`. Enter PIN "5678".

Expected: Redirect to `/student`. Session Storage has `ll_student` with `{id, name, tokens: 3, teacherId, teacherName}`.

If FAIL: Common issue — Student-Teacher link might not have Status=Active, or the field names in Airtable don't match what the code expects (`Full Name`, `Name`, `PIN`).

- [ ] **Step 3: Test invalid PIN**

Clear sessionStorage. Enter PIN "0000".

Expected: Error message "PIN invalido" displayed. No redirect.

- [ ] **Step 4: Test auth guard on protected pages**

Without logging in (clear sessionStorage), navigate directly to `/dashboard`.

Expected: Redirect to `/` (login page).

- [ ] **Step 5: Document results and fix bugs**

Create a file to track validation results:

```bash
touch apps/web/flows/apps/mvp-validation-log.md
```

Log each test result. If any test failed, investigate and fix the specific issue before proceeding.

- [ ] **Step 6: Commit fixes (if any)**

```bash
cd apps/web
git add -A
git commit -m "fix: auth validation bugs found during MVP E2E testing"
```

If no fixes needed, skip this step.

---

## Task 2: Validate Admin Panel (P1)

**Context:** Admin uses hardcoded token `LinguaAdmin2025` in header `x-admin-token`. The admin panel manages students, teachers, matchmaking, and bulk class generation. The critical path is: view students → edit status/tokens → generate classes.

**Files:**
- Test: `pages/admin.tsx`
- Test: `pages/api/admin/students.ts`
- Test: `pages/api/admin/generate-classes.ts`
- Fix: any of the above if bugs found

- [ ] **Step 1: Access admin panel**

Navigate to `/admin` in browser.

Expected: Admin panel loads with tabs (Overview, Students, Teachers, Matchmaker, Groups). If it requires authentication, check that the page sends the `x-admin-token` header.

If FAIL: Check if `admin.tsx` sends the auth header on API calls. It should include `headers: { 'x-admin-token': 'LinguaAdmin2025' }` in every fetch.

- [ ] **Step 2: Verify metrics load**

On the Overview tab, check that metrics cards show data.

Expected: Total students = 2, Total teachers = 1, other metrics may be 0.

- [ ] **Step 3: Verify student list**

Click "Students" tab.

Expected: See both test students with their Status, Tokens, and other fields.

- [ ] **Step 4: Edit a student**

Change Student 2's tokens from 2 to 5. Save.

Expected: Airtable record updates. Refresh page — tokens show 5.

- [ ] **Step 5: Generate classes for Student 1**

This is the critical test. In the admin panel, trigger class generation for Student 1:
- Student: Estudiante Prueba 1
- Teacher: Sebastian
- Weeks: 4

Expected: API returns success. Check Airtable:
- `Sessions` table has new records (should be ~20 sessions for 4 weeks x 5 days Mon-Fri)
- Each session has Teacher linked, Scheduled Date/Time set, Status="Scheduled"
- Sessions on Colombian holidays (check `lib/holidays.ts`) have Status="Canceled" and IsHoliday=true
- `Session Participants` table has records linking each session to Student 1

If FAIL: Common issues:
- Availability grid format mismatch (rows=hours, cols=days)
- Missing Airtable field names
- Batch insert failing (max 10 records per Airtable API call)

- [ ] **Step 6: Document results and fix bugs**

Log results in `mvp-validation-log.md`. Fix any bugs found.

- [ ] **Step 7: Commit fixes (if any)**

```bash
git add -A
git commit -m "fix: admin panel bugs found during MVP E2E testing"
```

---

## Task 3: Validate Teacher Dashboard + Classroom (P1)

**Context:** This is the heart of the MVP. The teacher logs in, sees today's sessions, enters a classroom, generates AI slides, uses the timer, and saves notes. If this flow breaks, there's no product.

**Files:**
- Test: `pages/dashboard.tsx`
- Test: `pages/classroom.tsx`
- Test: `pages/api/generate-slides.ts`
- Test: `pages/api/session-notes.ts`
- Test: `pages/api/sessions.ts`
- Test: `pages/api/curriculum-nav.ts`
- Fix: any of the above if bugs found

- [ ] **Step 1: Login as teacher and verify dashboard**

Login with PIN "1234". You should land on `/dashboard`.

Expected: See the Agenda tab with SessionCards for today's sessions (generated in Task 2). Each card shows: student name, time, topic name (or "Sin tema" if no topic assigned).

If FAIL: Check that `/api/sessions` is filtering by today's date correctly. Timezone issues are common — the code uses `new Date()` which depends on server timezone (UTC on Vercel).

- [ ] **Step 2: Click a session to enter classroom**

Click on a SessionCard → should navigate to `/classroom?sessionId=recXXX`.

Expected: Classroom page loads with:
- Student name and level displayed
- Topic title displayed
- Timer shows "Pre-clase" state (not started)
- Curriculum nav sidebar shows topics list

If FAIL: Check that the session record in Airtable has the `Curriculum Topic` field linked. If topics weren't assigned during generate-classes, the classroom may show "Sin tema".

- [ ] **Step 3: Generate slides**

Click "Generar Slides" button.

Expected: Loading spinner → then 4 slides appear:
1. Logic Decoder (LDS formula explanation)
2. Colombian Filter (common errors)
3. Real-Life Chunks (expressions)
4. Conversation & News

Plus warmup assets (icebreaker, spanglish phrases) and cooldown assets (idioms, tiny action, tongue twister).

If FAIL: Check Vercel function logs for `/api/generate-slides`. Common issues:
- `GEMINI_API_KEY` not set or invalid
- Gemini API rate limit
- Response parsing fails (markers `[[SLIDE_1:...]]` not found in response)

- [ ] **Step 4: Test timer phases**

Click "Iniciar Clase". Timer should start in Warmup phase (amber color).

Expected: Timer counts up. Phase bar fills. After 7 minutes (or click to advance), transitions to Core phase (blue). After 45 min Core → Download phase (green). After 8 min Download → class finished.

For testing, you don't need to wait the full 60 minutes — just verify:
- Timer starts and counts
- Phase colors are correct
- Manual phase advance works (if implemented)

- [ ] **Step 5: Save session notes**

Open the notes panel. Type test notes: "Estudiante tuvo dificultad con past simple irregular verbs. Practicar: went, had, made."

Click save.

Expected: Notes saved successfully (toast/notification). Check Airtable Sessions record — notes field should contain the text.

If FAIL: Check `/api/session-notes` endpoint. Verify it patches the correct Session record.

- [ ] **Step 6: Verify "next session" info**

After finishing or on the download phase, the classroom should show info about the next scheduled session.

Expected: Shows date/time of next session, or "No hay mas sesiones programadas" if none.

- [ ] **Step 7: Document results and fix bugs**

Log all results. This task is likely to have the most bugs — prioritize:
1. Slides generation (no slides = no class)
2. Session loading (no data = blank page)
3. Timer (cosmetic but important)
4. Notes (can work around manually)

- [ ] **Step 8: Redeploy to Vercel after fixes**

```bash
cd /Users/svelezvelasq/Documents/PersonalDev/ligualife/apps/web
git add -A
git commit -m "fix: classroom and dashboard bugs found during MVP E2E testing"
npx vercel --prod --yes
```

---

## Task 4: Validate Student Dashboard (P2)

**Context:** Student dashboard shows upcoming/completed sessions, token count, progress bar, and enables rescheduling. The rescheduling flow with tokens is the most complex business logic in the app.

**Files:**
- Test: `pages/student.tsx`
- Test: `pages/api/student/redeem-token.ts`
- Test: `pages/api/student/teacher-availability.ts`
- Test: `pages/api/reschedule-session.ts`
- Fix: any of the above if bugs found

- [ ] **Step 1: Login as student and verify dashboard**

Clear sessionStorage. Login with PIN "5678".

Expected: `/student` loads with:
- Student name: "Estudiante Prueba 1"
- Tokens: 3
- Teacher name: "Sebastian"
- Upcoming sessions listed (generated in Task 2)
- Progress bar (likely 0% if no topics completed)

If FAIL: Check that `ll_student` in sessionStorage has all required fields. Check that the student page reads from sessionStorage correctly.

- [ ] **Step 2: Verify session list**

Expected: See upcoming sessions ordered by date. Each shows date, time, topic (if assigned), and status.

- [ ] **Step 3: Test rescheduling — cancel session**

Click "Reagendar" on one of the upcoming sessions.

Expected: Session status changes to "Canceled". Token count increases by 1 (3 → 4 in UI, verified in Airtable).

If FAIL: Check `/api/reschedule-session`. Verify it patches the Session status AND increments the student's tokens.

- [ ] **Step 4: Test rescheduling — select new slot**

After canceling, a calendar/modal should appear showing available slots.

Expected: See the teacher's available slots (Mon-Fri 9am-11am based on our seed data). Slots are shown for the next 14 days.

If FAIL: Check `/api/student/teacher-availability`. Verify it reads the teacher's Availability JSON correctly.

- [ ] **Step 5: Test rescheduling — redeem token**

Select an available slot (e.g., next Monday at 10am).

Expected:
- New session created in Airtable (Status=Scheduled, ExtraordinaryToken=true)
- Session Participant record created
- Token decremented (4 → 3)
- 24h rule: if you try to book a slot less than 24h away, should get error

If FAIL: Check `/api/student/redeem-token`. This is the most complex endpoint — review the 7-step logic carefully.

- [ ] **Step 6: Document results and fix bugs**

- [ ] **Step 7: Commit fixes (if any)**

```bash
git add -A
git commit -m "fix: student dashboard and token flow bugs from MVP E2E testing"
```

---

## Task 5: Validate Holiday Confirmation (P2)

**Context:** Sessions on Colombian holidays (from `lib/holidays.ts`) require dual confirmation from both teacher and student. Both must confirm for the session to be reactivated.

**Files:**
- Test: `pages/api/confirm-holiday.ts`
- Test: `lib/holidays.ts`

- [ ] **Step 1: Identify a holiday session**

Check the Sessions table in Airtable for any session with `IsHoliday=true`. These were created by generate-classes in Task 2.

If no holiday sessions exist (no holidays in the next 4 weeks), manually create one:
- Find the next Colombian holiday from `lib/holidays.ts`
- Create a Session record on that date with IsHoliday=true, Status="Canceled"

- [ ] **Step 2: Teacher confirms holiday**

Login as teacher. Find the holiday session in the dashboard. Click "Confirmar Festivo".

Expected: `holidayConfirmedTeacher` field updates to true in Airtable. Session status stays "Canceled" (needs both confirmations).

- [ ] **Step 3: Student confirms holiday**

Login as student. Find the same holiday session. Click "Confirmar Festivo".

Expected: `holidayConfirmedStudent` updates to true. Since both confirmed → Session Status changes to "Scheduled".

- [ ] **Step 4: Document and fix**

Log results. Fix any bugs.

- [ ] **Step 5: Commit fixes (if any)**

```bash
git add -A
git commit -m "fix: holiday confirmation bugs from MVP E2E testing"
```

---

## Task 6: Validate Registration (P3)

**Context:** Public registration wizards for students (5 steps) and teachers (4 steps). These create records in Airtable with Status=Pending.

**Files:**
- Test: `pages/register/student.tsx`
- Test: `pages/register/teacher.tsx`
- Test: `pages/api/register/student.ts`
- Test: `pages/api/register/teacher.ts`
- Test: `pages/api/register/global-availability.ts`

- [ ] **Step 1: Test student registration — navigate**

Go to `/register/student`.

Expected: Step 1 loads (personal info form: name, email, phone, age range).

- [ ] **Step 2: Complete all 5 steps**

Fill in each step with test data:
1. Personal: "Test Registro", test email, test phone, "18-24"
2. Goals: select any goal
3. Interests: type "Technology"
4. Availability: select some time slots (should show global heatmap)
5. Confirmation: review and submit

Expected: Success message. Check Airtable Students table — new record with Status="Pending" and all fields populated.

If FAIL: Common issues:
- Field IDs in `api/register/student.ts` are hardcoded Airtable field IDs (e.g., `fldbdDNucZwILRMwO`). These are specific to the Airtable base and won't change, but verify they match.
- Global availability endpoint may fail if no students have availability data yet.

- [ ] **Step 3: Test teacher registration**

Go to `/register/teacher`. Complete all 4 steps with test data.

Expected: Success. New record in Teachers table.

- [ ] **Step 4: Clean up test data**

Delete the test registration records from Airtable (they have Status=Pending and test names).

- [ ] **Step 5: Document and fix**

- [ ] **Step 6: Commit fixes (if any)**

```bash
git add -A
git commit -m "fix: registration flow bugs from MVP E2E testing"
```

---

## Task 7: Smoke Test and Final Deploy

**Context:** After fixing all bugs from Tasks 1-6, do one final run through the complete P1 flow to make sure fixes didn't break anything.

- [ ] **Step 1: Full P1 smoke test**

Run through this exact sequence without stopping:

1. Go to `/admin` → verify metrics show correct counts
2. Clear sessionStorage → go to `/` → login as teacher "1234" → verify dashboard loads with sessions
3. Click a session → enter classroom → generate slides → verify 4 slides render
4. Save a test note → verify it saves
5. Go back to dashboard → logout (clear sessionStorage)
6. Login as student "5678" → verify dashboard shows sessions + tokens + teacher name
7. Verify upcoming sessions list is correct

All 7 must pass without errors.

- [ ] **Step 2: Check Vercel function logs**

Go to Vercel dashboard → your project → Functions tab. Check for any 500 errors in the last hour of testing.

Expected: No 500 errors on any endpoint.

- [ ] **Step 3: Final deploy**

```bash
cd /Users/svelezvelasq/Documents/PersonalDev/ligualife/apps/web
git add -A
git commit -m "chore: MVP validation complete - all P1/P2/P3 flows verified"
npx vercel --prod --yes
```

- [ ] **Step 4: Update validation log**

Mark all passing items in `mvp-validation-log.md`. Record the date and Vercel deployment URL.

---

## Validation Completion Criteria

The MVP is **ready for launch** when:

- [ ] All P1 items pass (AUTH 1-4, ADMIN 1-6, DASH 1-2, CLASS 1-7)
- [ ] At least 80% of P2 items pass (STU 1-4, RESCH 1-4, HOL 1-4)
- [ ] P3 registration works (REG 1-5)
- [ ] No 500 errors in Vercel function logs
- [ ] Smoke test passes end-to-end without manual intervention
