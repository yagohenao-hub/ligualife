// Airtable API Integration for LinguaLife

const CONFIG = {
    BASE_ID: 'app9ZtojlxX5FoZ7y',
    API_KEY: 'REPLACE_WITH_YOUR_PAT', // Removed for security. Use environment variables or proxy.
    TABLES: {
        SESSIONS: 'Sessions',
        TEACHERS: 'Teachers',
        STUDENTS: 'Students',
        EXERCISES: 'Exercises',
        CURRICULUM_TOPICS: 'Curriculum Topics'
    }
};

export const fetchSessions = async (teacherId) => {
    const formula = `AND(FIND('${teacherId}', ARRAYJOIN({Teacher})), {Status} = 'Scheduled')`;
    const url = `https://api.airtable.com/v0/${CONFIG.BASE_ID}/${CONFIG.TABLES.SESSIONS}?filterByFormula=${encodeURIComponent(formula)}&sort[0][field]=Scheduled Date/Time&sort[0][direction]=asc`;
    
    console.log('Fetching sessions from:', url);
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${CONFIG.API_KEY}` }
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Airtable Error (Sessions):', errorData);
        throw new Error(`Airtable Error: ${errorData.error.message || response.statusText}`);
    }
    const data = await response.json();
    return data.records;
};

export const validateTeacherPIN = async (pin) => {
    const formula = `{PIN} = '${pin}'`;
    const url = `https://api.airtable.com/v0/${CONFIG.BASE_ID}/${CONFIG.TABLES.TEACHERS}?filterByFormula=${encodeURIComponent(formula)}`;
    
    console.log('Validating PIN at:', url);
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${CONFIG.API_KEY}` }
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Airtable Error (PIN):', errorData);
        throw new Error(`Airtable Error: ${errorData.error.message || response.statusText}`);
    }
    const data = await response.json();
    
    if (data.records.length === 0) return null;
    return {
        id: data.records[0].id,
        name: data.records[0].fields['Name'],
        pin: pin
    };
};

export const fetchStudent = async (studentId) => {
    const url = `https://api.airtable.com/v0/${CONFIG.BASE_ID}/${CONFIG.TABLES.STUDENTS}/${studentId}`;
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${CONFIG.API_KEY}` }
    });
    if (!response.ok) throw new Error('Error al cargar alumno');
    return await response.json();
};

export const fetchTopic = async (topicId) => {
    const url = `https://api.airtable.com/v0/${CONFIG.BASE_ID}/${CONFIG.TABLES.CURRICULUM_TOPICS}/${topicId}`;
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${CONFIG.API_KEY}` }
    });
    if (!response.ok) throw new Error('Error al cargar tema');
    return await response.json();
};

export const fetchRecentExercises = async (studentId) => {
    const formula = `{Student} = '${studentId}'`;
    const url = `https://api.airtable.com/v0/${CONFIG.BASE_ID}/${CONFIG.TABLES.EXERCISES}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=5&sort[0][field]=Generated At&sort[0][direction]=desc`;
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${CONFIG.API_KEY}` }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.records;
};
