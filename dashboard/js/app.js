import { getState, setState, subscribe } from './state.js';
import { validateTeacherPIN, fetchSessions, fetchStudent, fetchTopic, fetchRecentExercises } from './api.js';

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const classroomView = document.getElementById('classroom-view');
const loginBtn = document.getElementById('login-btn');
const pinInput = document.getElementById('teacher-pin');
const authError = document.getElementById('auth-error');
const teacherNameDisplay = document.getElementById('teacher-name');
const sessionsContainer = document.getElementById('sessions-container');
const timeDisplay = document.getElementById('current-time');
const logoutBtn = document.getElementById('logout-btn');

// Initialize State Listeners
subscribe((state) => {
    // Handle View Switching
    [authView, dashboardView, classroomView].forEach(view => view.classList.add('hidden'));
    [authView, dashboardView, classroomView].forEach(view => view.classList.remove('active'));

    const activeView = document.getElementById(`${state.view}-view`);
    if (activeView) {
        activeView.classList.remove('hidden');
        setTimeout(() => activeView.classList.add('active'), 10);
    }

    // Update Dashboard Data
    if (state.view === 'dashboard' && state.teacher) {
        teacherNameDisplay.textContent = `Bienvenido, ${state.teacher.name.split(' ')[0]}`;
        renderSessions(state.sessions);
    }

    // Update Classroom Data
    if (state.view === 'classroom' && state.currentSessionData) {
        renderClassroom(state.currentSessionData);
    }
});

// Classroom Phase Management
document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const phase = tab.dataset.phase;
        document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderPhase(phase);
    });
});

// Auth Logic
loginBtn.addEventListener('click', handleLogin);
pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

async function handleLogin() {
    const pin = pinInput.value;
    if (pin.length < 4) return;

    setState({ loading: true, error: null });
    authError.classList.add('hidden');

    try {
        console.log('Intentando validar PIN...');
        const teacher = await validateTeacherPIN(pin);
        if (teacher) {
            console.log('Profesor validado:', teacher.name);
            const sessions = await fetchSessions(teacher.id);
            setState({ 
                view: 'dashboard', 
                teacher, 
                sessions,
                loading: false 
            });
        } else {
            console.warn('PIN no encontrado en Airtable.');
            authError.textContent = 'PIN no encontrado. Verifica en Airtable (Tabla Teachers, campo PIN).';
            authError.classList.remove('hidden');
            setState({ loading: false });
        }
    } catch (err) {
        console.error('Error en login:', err);
        authError.innerHTML = `<strong>Error de conexión:</strong><br>${err.message}<br><br><small>Verifica que la tabla <strong>Teachers</strong> tenga un campo llamado <strong>PIN</strong>.</small>`;
        authError.classList.remove('hidden');
        setState({ loading: false });
    }
}

logoutBtn.addEventListener('click', () => {
    setState({ view: 'auth', teacher: null, sessions: [] });
    pinInput.value = '';
});

// UI Rendering
function renderSessions(sessions) {
    if (sessions.length === 0) {
        sessionsContainer.innerHTML = '<div class="empty-state">No tienes sesiones programadas para hoy.</div>';
        return;
    }

    sessionsContainer.innerHTML = sessions.map(session => `
        <div class="session-card glass-morphism" onclick="window.enterClassroom('${session.id}')">
            <div class="session-info">
                <h4>${session.fields['Session Name']}</h4>
                <div class="session-meta">
                    <div class="meta-item">
                        <i data-lucide="clock"></i>
                        <span>${new Date(session.fields['Scheduled Date/Time']).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="meta-item">
                        <i data-lucide="user"></i>
                        <span>${session.fields['Student Name'] || 'Alumno'}</span>
                    </div>
                </div>
            </div>
            <div class="session-status">
                <span class="status-indicator status-${session.fields['Status'].toLowerCase()}">${session.fields['Status']}</span>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// Global scope for onclick handlers
window.enterClassroom = async (sessionId) => {
    setState({ loading: true });
    try {
        const session = getState().sessions.find(s => s.id === sessionId);
        const studentId = session.fields['Session Participants'][0]; // Assuming first participant is student
        const topicId = session.fields['Curriculum Topic'] ? session.fields['Curriculum Topic'][0] : null;

        const [student, topic, recentExercises] = await Promise.all([
            fetchStudent(studentId),
            topicId ? fetchTopic(topicId) : Promise.resolve(null),
            fetchRecentExercises(studentId)
        ]);

        setState({ 
            view: 'classroom', 
            currentSessionData: { session, student, topic, recentExercises },
            loading: false 
        });
        
        startClassroomTimer();
        renderPhase('warmup'); // Start with warmup
    } catch (err) {
        console.error(err);
        setState({ loading: false });
    }
};

window.exitClassroom = () => {
    stopClassroomTimer();
    setState({ view: 'dashboard', currentSessionData: null });
};

function renderClassroom(data) {
    const { student, session, topic, recentExercises } = data;
    
    // Header
    document.getElementById('classroom-title').textContent = `Clase con ${student.fields['Full Name']}`;
    
    // Profile
    document.getElementById('class-student-name').textContent = student.fields['Full Name'];
    document.getElementById('student-initials').textContent = student.fields['Full Name'].split(' ').map(n => n[0]).join('');
    document.getElementById('student-level').textContent = `Nivel ${student.fields['Level'] || 'B1'}`;
    
    // Interests
    const interests = student.fields['Interests'] ? student.fields['Interests'].split(',') : [];
    document.getElementById('student-interests').innerHTML = interests.map(i => `<span class="tag">${i.trim()}</span>`).join('');
    
    // Recent Exercises (Errors)
    document.getElementById('recent-errors').innerHTML = recentExercises.map(ex => `
        <div class="error-item">
            <p class="error-text">"${ex.fields['Generated Example']}"</p>
            <small>${ex.fields['Solution/Archetype']}</small>
        </div>
    `).join('');

    // Update Phase Tabs with Dynamic Times
    const order = topic?.fields['Order'] || 1;
    const times = getMicrostructure(order);
    
    document.querySelector('[data-phase="warmup"] .timer-inline').textContent = `${times.warmup}m`;
    document.querySelector('[data-phase="core"] .timer-inline').textContent = `${times.explanation + times.conversation}m`;
    document.querySelector('[data-phase="download"] .timer-inline').textContent = `${times.download}m`;
    
    lucide.createIcons();
}

function getMicrostructure(order) {
    const totalCore = 45;
    let ratio; // % of conversation
    if (order <= 15) ratio = 0.15; // Installer
    else if (order <= 35) ratio = 0.40; // Builder
    else ratio = 0.70; // Negotiator

    return {
        warmup: 7,
        explanation: Math.round(totalCore * (1 - ratio)),
        conversation: Math.round(totalCore * ratio),
        download: 8
    };
}

function renderPhase(phase) {
    const data = getState().currentSessionData;
    const instruction = document.getElementById('phase-instruction');
    const suggestionBody = document.getElementById('suggestion-body');
    
    const phases = {
        warmup: {
            text: "Calentamiento mental: Reactiva los temas de la clase anterior basándote en los errores recientes.",
            suggestion: `
                <h5>Ejercicio de Reactivación</h5>
                <p>Basado en el error reciente: <strong>"${data.recentExercises[0]?.fields['Generated Example'] || 'Sin errores previos'}"</strong></p>
                <p>Pide al alumno que reformule la idea usando la fórmula LDS y corrige la pronunciación de inmediato.</p>
            `
        },
        core: {
            text: `Tema Principal: ${data.topic?.fields['Topic Name'] || 'No asignado'} (Clase #${data.topic?.fields['Order'] || '?'}). Guía al alumno a través del descubrimiento lógico.`,
            suggestion: `
                <h5>Despliegue de Lógica (LDS)</h5>
                <p><strong>Fórmula:</strong> ${data.topic?.fields['LDS_Formula'] || 'S + T + A'}</p>
                <p><strong>Contexto:</strong> ${data.topic?.fields['AI_Context'] || 'Tema general'}</p>
                <div class="time-allocation">
                    <p><strong>Distribución de Tiempo:</strong></p>
                    <ul>
                        <li>Teoría/Instalación: ${getMicrostructure(data.topic?.fields['Order'] || 1).explanation} min</li>
                        <li>Conversación/Práctica: ${getMicrostructure(data.topic?.fields['Order'] || 1).conversation} min</li>
                    </ul>
                </div>
                <p>Escenario: Presenta una situación de su vertical (${data.student.fields['Vertical Name'] || 'General'}) y pídele que construya la frase.</p>
            `
        },
        download: {
            text: "El Download: Feedback quirúrgico y registro para el Pocket Coach.",
            suggestion: `
                <h5>Resumen & Envío</h5>
                <p>Elige EL ERROR que más se repitió. Explica la lógica una última vez.</p>
                <p>Al finalizar, el tema se enviará automáticamente al Chatbot para refuerzo 24/7.</p>
            `
        }
    };
    
    const current = phases[phase];
    instruction.querySelector('p').textContent = current.text;
    suggestionBody.innerHTML = current.suggestion;
}

let classroomInterval;
function startClassroomTimer() {
    let seconds = 0;
    const timerDisplay = document.getElementById('classroom-timer');
    classroomInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        // Dynamic colors based on time
        if (mins >= 45) timerDisplay.style.color = 'var(--danger)';
        else if (mins >= 7) timerDisplay.style.color = 'var(--warning)';
    }, 1000);
}

function stopClassroomTimer() {
    clearInterval(classroomInterval);
}

// Real-time Clock
setInterval(() => {
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString();
}, 1000);

// Init Date
document.getElementById('today-date').textContent = new Date().toLocaleDateString('es-CO', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
});
