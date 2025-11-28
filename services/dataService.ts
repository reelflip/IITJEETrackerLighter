import { Topic, TestScore, Task, User } from '../types.ts';
import { INITIAL_TOPICS, MOCK_TEST_DATA } from '../constants.ts';

// ============================================================================
//  DATABASE CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  // Set to TRUE to use the Python Backend
  USE_REAL_BACKEND: true, 

  // PRODUCTION URL (Relative path works for both Vercel and Local if proxied)
  // When deployed on Vercel, this points to the /api serverless function
  API_BASE_URL: '/api'
};

// ============================================================================

const DB_TABLES = {
  TOPICS: 'jee_tracker_topics',
  SCORES: 'jee_tracker_scores',
  TASKS: 'jee_tracker_tasks',
  USERS: 'jee_tracker_users'
};

const SIMULATED_LATENCY = 400;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get current user ID
const getCurrentUserId = () => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            return JSON.parse(userStr).id;
        } catch (e) {
            return null;
        }
    }
    return null;
};

// Helper for Real API Calls
const apiCall = async (action: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    try {
        const userId = getCurrentUserId();
        
        // Construct URL with query parameters
        // Note: When API_BASE_URL is relative (starts with /), new URL() requires a base
        const baseUrl = API_CONFIG.API_BASE_URL.startsWith('/') 
            ? window.location.origin + API_CONFIG.API_BASE_URL 
            : API_CONFIG.API_BASE_URL;

        const url = new URL(baseUrl);
        url.searchParams.append('action', action);
        
        // Append userId to GET requests if available
        if (method === 'GET' && userId) {
            url.searchParams.append('userId', userId);
        }

        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        // Append userId to POST body if available
        if (body) {
            const payload = { ...body };
            if (userId && !payload.userId) {
                payload.userId = userId;
            }
            options.body = JSON.stringify(payload);
        }

        const response = await fetch(url.toString(), options);
        
        // Handle non-JSON responses (like PHP/Python errors printed to screen)
        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error("Invalid JSON response from server:", text);
            throw new Error(`Server Error: ${text.substring(0, 100)}...`);
        }

        if (!response.ok || result.error) {
            throw new Error(result.error || `API Error: ${response.statusText}`);
        }
        
        return result.data;
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
};

const initializeDatabase = () => {
  if (API_CONFIG.USE_REAL_BACKEND) return; 

  if (!localStorage.getItem(DB_TABLES.TOPICS)) {
    localStorage.setItem(DB_TABLES.TOPICS, JSON.stringify(INITIAL_TOPICS));
  }
  if (!localStorage.getItem(DB_TABLES.SCORES)) {
    localStorage.setItem(DB_TABLES.SCORES, JSON.stringify(MOCK_TEST_DATA));
  }
  if (!localStorage.getItem(DB_TABLES.TASKS)) {
    const initialTasks: Task[] = [
      { id: 'task1', title: 'Complete Rotational Motion HC Verma', isCompleted: false, dueDate: '2023-12-01' },
      { id: 'task2', title: 'Revise Periodic Table', isCompleted: true, dueDate: '2023-11-20' },
    ];
    localStorage.setItem(DB_TABLES.TASKS, JSON.stringify(initialTasks));
  }
  if (!localStorage.getItem(DB_TABLES.USERS)) {
    localStorage.setItem(DB_TABLES.USERS, JSON.stringify([]));
  }
};

initializeDatabase();

export const dataService = {
  // --- USERS TABLE OPERATIONS ---
  
  registerUser: async (user: Omit<User, 'id'> & { password?: string, securityQuestion?: string, securityAnswer?: string }): Promise<User> => {
    if (API_CONFIG.USE_REAL_BACKEND) {
        return await apiCall('registerUser', 'POST', user);
    }

    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.USERS);
    const users: User[] = data ? JSON.parse(data) : [];

    if (users.find(u => u.email === user.email)) {
        throw new Error("User already exists with this email.");
    }

    const newUser: User = { 
        id: Date.now().toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        institute: user.institute,
        targetYear: user.targetYear
    };
    
    users.push(newUser);
    localStorage.setItem(DB_TABLES.USERS, JSON.stringify(users));
    return newUser;
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    if (API_CONFIG.USE_REAL_BACKEND) {
        return await apiCall('loginUser', 'POST', { email, password });
    }

    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.USERS);
    const users: User[] = data ? JSON.parse(data) : [];
    
    const user = users.find(u => u.email === email);
    if (!user) {
        throw new Error("Invalid credentials");
    }
    
    return user;
  },

  // --- TOPICS TABLE OPERATIONS ---
  
  getTopics: async (): Promise<Topic[]> => {
    if (API_CONFIG.USE_REAL_BACKEND) return await apiCall('getTopics', 'GET');

    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.TOPICS);
    return data ? JSON.parse(data) : [];
  },

  updateTopic: async (updatedTopic: Topic): Promise<Topic[]> => {
    if (API_CONFIG.USE_REAL_BACKEND) return await apiCall('updateTopic', 'POST', updatedTopic);

    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.TOPICS);
    let topics: Topic[] = data ? JSON.parse(data) : [];
    
    const index = topics.findIndex(t => t.id === updatedTopic.id);
    if (index !== -1) {
      topics[index] = updatedTopic;
      localStorage.setItem(DB_TABLES.TOPICS, JSON.stringify(topics));
    }
    return topics;
  },

  // --- TEST_SCORES TABLE OPERATIONS ---

  getScores: async (): Promise<TestScore[]> => {
    if (API_CONFIG.USE_REAL_BACKEND) return await apiCall('getScores', 'GET');

    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.SCORES);
    return data ? JSON.parse(data) : [];
  },

  addScore: async (score: TestScore): Promise<TestScore[]> => {
    if (API_CONFIG.USE_REAL_BACKEND) return await apiCall('addScore', 'POST', score);

    await delay(SIMULATED_LATENCY); 
    const data = localStorage.getItem(DB_TABLES.SCORES);
    const scores: TestScore[] = data ? JSON.parse(data) : [];
    
    const newScores = [...scores, score];
    localStorage.setItem(DB_TABLES.SCORES, JSON.stringify(newScores));
    return newScores;
  },

  // --- TASKS TABLE OPERATIONS ---

  getTasks: async (): Promise<Task[]> => {
    if (API_CONFIG.USE_REAL_BACKEND) return await apiCall('getTasks', 'GET');

    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.TASKS);
    return data ? JSON.parse(data) : [];
  },

  toggleTask: async (id: string): Promise<Task[]> => {
    if (API_CONFIG.USE_REAL_BACKEND) return await apiCall('toggleTask', 'POST', { id });

    await delay(SIMULATED_LATENCY / 2);
    const data = localStorage.getItem(DB_TABLES.TASKS);
    let tasks: Task[] = data ? JSON.parse(data) : [];
    
    const updated = tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
    localStorage.setItem(DB_TABLES.TASKS, JSON.stringify(updated));
    return updated;
  },
  
  addTask: async (title: string, dueDate: string): Promise<Task[]> => {
    if (API_CONFIG.USE_REAL_BACKEND) return await apiCall('addTask', 'POST', { title, dueDate });

    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.TASKS);
    const tasks: Task[] = data ? JSON.parse(data) : [];
    
    const newTask: Task = {
        id: Date.now().toString(),
        title,
        dueDate,
        isCompleted: false
    };
    const updated = [...tasks, newTask];
    localStorage.setItem(DB_TABLES.TASKS, JSON.stringify(updated));
    return updated;
  },

  deleteTask: async (id: string): Promise<Task[]> => {
    if (API_CONFIG.USE_REAL_BACKEND) return await apiCall('deleteTask', 'POST', { id });

    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.TASKS);
    const tasks: Task[] = data ? JSON.parse(data) : [];
    
    const updated = tasks.filter(t => t.id !== id);
    localStorage.setItem(DB_TABLES.TASKS, JSON.stringify(updated));
    return updated;
  }
};