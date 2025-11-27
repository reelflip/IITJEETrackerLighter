export enum Subject {
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  MATH = 'Mathematics'
}

export enum Status {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  REVISION_DONE = 'Revision Done'
}

export interface Topic {
  id: string;
  name: string;
  subject: Subject;
  status: Status;
  confidence: number; // 1-10
  notes?: string;
}

export interface TestScore {
  id: string;
  date: string;
  testName: string;
  physicsScore: number;
  chemistryScore: number;
  mathScore: number;
  totalScore: number;
  maxScore: number;
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type UserRole = 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institute?: string;
  targetYear?: string;
}