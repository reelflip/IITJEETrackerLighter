import { Topic, TestScore, Task, User } from '../types';
import { INITIAL_TOPICS, MOCK_TEST_DATA } from '../constants';

// CONSTANTS FOR STORAGE (Simulating DB Tables)
const DB_TABLES = {
  TOPICS: 'jee_tracker_topics',
  SCORES: 'jee_tracker_scores',
  TASKS: 'jee_tracker_tasks',
  USERS: 'jee_tracker_users'
};

// Simulate Network Latency (Real DB connection time)
const SIMULATED_LATENCY = 400;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize simulated DB tables
const initializeDatabase = () => {
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

// In a real application, these methods would perform fetch() calls to your backend API
// e.g., await fetch('https://api.jeepreppro.com/topics', { method: 'GET' })

export const dataService = {
  // --- USERS TABLE OPERATIONS ---
  
  registerUser: async (user: Omit<User, 'id'> & { password?: string, securityQuestion?: string, securityAnswer?: string }): Promise<User> => {
    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.USERS);
    const users: User[] = data ? JSON.parse(data) : [];

    // Simple check for existing email
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
    
    // In a real app, we would store password hashes, security questions separately
    // For this simulation, we just store the user profile
    users.push(newUser);
    localStorage.setItem(DB_TABLES.USERS, JSON.stringify(users));
    return newUser;
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.USERS);
    const users: User[] = data ? JSON.parse(data) : [];
    
    // In a real app, we would verify password hash
    const user = users.find(u => u.email === email);
    
    if (!user) {
        throw new Error("Invalid credentials");
    }
    
    return user;
  },

  // --- TOPICS TABLE OPERATIONS ---
  
  getTopics: async (): Promise<Topic[]> => {
    await delay(SIMULATED_LATENCY); // Simulate MySQL query time
    const data = localStorage.getItem(DB_TABLES.TOPICS);
    return data ? JSON.parse(data) : [];
  },

  updateTopic: async (updatedTopic: Topic): Promise<Topic[]> => {
    await delay(SIMULATED_LATENCY); // Simulate UPDATE query
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
    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.SCORES);
    return data ? JSON.parse(data) : [];
  },

  addScore: async (score: TestScore): Promise<TestScore[]> => {
    await delay(SIMULATED_LATENCY); // Simulate INSERT query
    const data = localStorage.getItem(DB_TABLES.SCORES);
    const scores: TestScore[] = data ? JSON.parse(data) : [];
    
    const newScores = [...scores, score];
    localStorage.setItem(DB_TABLES.SCORES, JSON.stringify(newScores));
    return newScores;
  },

  // --- TASKS TABLE OPERATIONS ---

  getTasks: async (): Promise<Task[]> => {
    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.TASKS);
    return data ? JSON.parse(data) : [];
  },

  toggleTask: async (id: string): Promise<Task[]> => {
    await delay(SIMULATED_LATENCY / 2); // Faster update
    const data = localStorage.getItem(DB_TABLES.TASKS);
    let tasks: Task[] = data ? JSON.parse(data) : [];
    
    const updated = tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
    localStorage.setItem(DB_TABLES.TASKS, JSON.stringify(updated));
    return updated;
  },
  
  addTask: async (title: string, dueDate: string): Promise<Task[]> => {
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
    await delay(SIMULATED_LATENCY);
    const data = localStorage.getItem(DB_TABLES.TASKS);
    const tasks: Task[] = data ? JSON.parse(data) : [];
    
    const updated = tasks.filter(t => t.id !== id);
    localStorage.setItem(DB_TABLES.TASKS, JSON.stringify(updated));
    return updated;
  }
};