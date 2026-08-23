-- schema_17_tables.sql
-- Creado automáticamente basado en las 17 tablas de Airtable

DROP TABLE IF EXISTS public.curriculum_topics CASCADE;
CREATE TABLE public.curriculum_topics (
    id text primary key default gen_random_uuid()::text,
    "Topic Name" text,
    "Curriculum" text,
    "Order" text,
    "Description" text,
    "Level" text,
    "Sessions" text,
    "Student Topic Progress" text,
    "Exercises" text,
    "Session Participants" text,
    "LDS_Formula" text,
    "AI_Context" text,
    "Fase" text,
    "Slides URL" text,
    "Cached Slides" text,
    "Cached Warmup" text,
    "Cached Cooldown" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.curriculums CASCADE;
CREATE TABLE public.curriculums (
    id text primary key default gen_random_uuid()::text,
    "Curriculum Name" text,
    "Description" text,
    "Vertical" text,
    "Status" text,
    "Curriculum Topics" text,
    "Student Curriculum" text,
    "Study Groups" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.error_patterns CASCADE;
CREATE TABLE public.error_patterns (
    id text primary key default gen_random_uuid()::text,
    "Error Pattern" text,
    "Description" text,
    "Category" text,
    "Active?" text,
    "Session Participants" text,
    "Exercises" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.interests CASCADE;
CREATE TABLE public.interests (
    id text primary key default gen_random_uuid()::text,
    "Interest Name" text,
    "Description" text,
    "Related Verticals" text,
    "Interest Type" text,
    "Date Added" text,
    "Tags" text,
    "Students" text,
    "Teachers" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.progress_apply_queue CASCADE;
CREATE TABLE public.progress_apply_queue (
    id text primary key default gen_random_uuid()::text,
    "Queue Item" text,
    "Queued At" text,
    "Session Participant" text,
    "Session" text,
    "Student" text,
    "Curriculum Topic" text,
    "Status" text,
    "Applied At" text,
    "Notes" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.series_requests CASCADE;
CREATE TABLE public.series_requests (
    id text primary key default gen_random_uuid()::text,
    "Series Name" text,
    "Student" text,
    "Status" text,
    "Request Date" text,
    "Notes" text,
    "Student ID" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.session_participants CASCADE;
CREATE TABLE public.session_participants (
    id text primary key default gen_random_uuid()::text,
    "Participation" text,
    "Session" text,
    "Student" text,
    "Attendance" text,
    "Teacher Observations" text,
    "Feedback (for student)" text,
    "Progress Applied?" text,
    "Topic (from Session)" text,
    "Error Patterns" text,
    "Sessions" text,
    "Apply Progress?" text,
    "Apply Progress Batch Key" text,
    "Curriculum Topic" text,
    "Progress Apply Queue" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.sessions CASCADE;
CREATE TABLE public.sessions (
    id text primary key default gen_random_uuid()::text,
    "Session Name" text,
    "Teacher" text,
    "Curriculum Topic" text,
    "Scheduled Date/Time" text,
    "Duration (minutes)" text,
    "Location/Link" text,
    "Status" text,
    "Canceled Reason" text,
    "Rescheduled From" text,
    "Notes (internal)" text,
    "Session Participants" text,
    "Student Topic Progress" text,
    "Progress Applied?" text,
    "Apply Progress Now" text,
    "Participants (link)" text,
    "Extraordinary Session (Token)" text,
    "Study Group" text,
    "Is Holiday" text,
    "Holiday Confirmed (Teacher)" text,
    "Holiday Confirmed (Student)" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.student_curriculum CASCADE;
CREATE TABLE public.student_curriculum (
    id text primary key default gen_random_uuid()::text,
    "Enrollment" text,
    "Student" text,
    "Curriculum" text,
    "Status" text,
    "Start Date" text,
    "End Date" text,
    "Primary Teacher" text,
    "Notes" text,
    "Exercises" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.student_topic_progress CASCADE;
CREATE TABLE public.student_topic_progress (
    id text primary key default gen_random_uuid()::text,
    "Student + Topic" text,
    "Student" text,
    "Curriculum Topic" text,
    "Status" text,
    "Completed At" text,
    "Completed In Session" text,
    "Notes" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.student_teacher CASCADE;
CREATE TABLE public.student_teacher (
    id text primary key default gen_random_uuid()::text,
    "Enrollment" text,
    "Student" text,
    "Teacher" text,
    "Status" text,
    "Start Date" text,
    "End Date" text,
    "Notes" text,
    "Recurrence Day" text,
    "Recurrence Time" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.students CASCADE;
CREATE TABLE public.students (
    id text primary key default gen_random_uuid()::text,
    "Full Name" text,
    "Email" text,
    "Phone" text,
    "Date of Birth" text,
    "Timezone" text,
    "Notes" text,
    "Student-Teacher" text,
    "Student Curriculum" text,
    "Session Participants" text,
    "Student Topic Progress" text,
    "Exercises" text,
    "Interests" text,
    "Verticals" text,
    "Pocket Coach Status" text,
    "Vertical (Lookup)" text,
    "Current Topic (Bot)" text,
    "Tokens de Reposición" text,
    "PIN" text,
    "Status" text,
    "Age Range" text,
    "Availability" text,
    "Study Groups" text,
    "Open to Group Classes" text,
    "Series Requests" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.study_groups CASCADE;
CREATE TABLE public.study_groups (
    id text primary key default gen_random_uuid()::text,
    "Group Name" text,
    "Group Type" text,
    "Status" text,
    "Students" text,
    "Primary Teacher" text,
    "Curriculum" text,
    "Sessions" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.teacher_availability CASCADE;
CREATE TABLE public.teacher_availability (
    id text primary key default gen_random_uuid()::text,
    "Availability Slot" text,
    "Teacher" text,
    "Type" text,
    "Day of Week" text,
    "Start" text,
    "End" text,
    "Timezone" text,
    "Status" text,
    "Notes" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.teachers CASCADE;
CREATE TABLE public.teachers (
    id text primary key default gen_random_uuid()::text,
    "Name" text,
    "Email" text,
    "Phone" text,
    "Bio" text,
    "Photo" text,
    "Timezone" text,
    "Student-Teacher" text,
    "Teacher Availability" text,
    "Student Curriculum" text,
    "Sessions" text,
    "PIN" text,
    "Meeting Link" text,
    "Availability" text,
    "Bank Account Details" text,
    "Academic Interests" text,
    "Study Groups" text,
    "SS Document URL" text,
    "SS Expiry Date" text,
    "SS Last Updated" text,
    "Status" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.verticals CASCADE;
CREATE TABLE public.verticals (
    id text primary key default gen_random_uuid()::text,
    "Vertical Name" text,
    "Description" text,
    "Interests" text,
    "Curriculums" text,
    "Students" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS public.video_bank CASCADE;
CREATE TABLE public.video_bank (
    id text primary key default gen_random_uuid()::text,
    "Title" text,
    "YouTube URL" text,
    "Thumbnail" text,
    "Level" text,
    "Vertical" text,
    "Status" text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
