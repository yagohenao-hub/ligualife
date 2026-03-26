// State Management for LinguaLife Teacher Dashboard

const state = {
    view: 'auth', // 'auth', 'dashboard', 'classroom'
    teacher: null, // { id, name, pin, sessions }
    currentSession: null,
    sessions: [],
    loading: false,
    error: null
};

const listeners = [];

export const getState = () => ({ ...state });

export const setState = (newState) => {
    Object.assign(state, newState);
    notifyListeners();
};

export const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
    };
};

const notifyListeners = () => {
    listeners.forEach(listener => listener(state));
};
