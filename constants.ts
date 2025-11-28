import { Subject, Status, Topic } from './types.ts';

// A curated subset of the vast JEE syllabus for initial seeding
export const INITIAL_TOPICS: Topic[] = [
  // Physics
  { id: 'p1', name: 'Units & Dimensions', subject: Subject.PHYSICS, status: Status.COMPLETED, confidence: 9 },
  { id: 'p2', name: 'Kinematics', subject: Subject.PHYSICS, status: Status.COMPLETED, confidence: 8 },
  { id: 'p3', name: 'Newton\'s Laws of Motion', subject: Subject.PHYSICS, status: Status.IN_PROGRESS, confidence: 6 },
  { id: 'p4', name: 'Work, Energy & Power', subject: Subject.PHYSICS, status: Status.NOT_STARTED, confidence: 0 },
  { id: 'p5', name: 'Rotational Motion', subject: Subject.PHYSICS, status: Status.NOT_STARTED, confidence: 0 },
  { id: 'p6', name: 'Electrostatics', subject: Subject.PHYSICS, status: Status.NOT_STARTED, confidence: 0 },
  
  // Chemistry
  { id: 'c1', name: 'Mole Concept', subject: Subject.CHEMISTRY, status: Status.COMPLETED, confidence: 9 },
  { id: 'c2', name: 'Atomic Structure', subject: Subject.CHEMISTRY, status: Status.IN_PROGRESS, confidence: 7 },
  { id: 'c3', name: 'Chemical Bonding', subject: Subject.CHEMISTRY, status: Status.NOT_STARTED, confidence: 0 },
  { id: 'c4', name: 'Thermodynamics', subject: Subject.CHEMISTRY, status: Status.NOT_STARTED, confidence: 0 },
  { id: 'c5', name: 'Organic Chemistry Basics', subject: Subject.CHEMISTRY, status: Status.NOT_STARTED, confidence: 0 },

  // Math
  { id: 'm1', name: 'Sets, Relations & Functions', subject: Subject.MATH, status: Status.COMPLETED, confidence: 8 },
  { id: 'm2', name: 'Quadratic Equations', subject: Subject.MATH, status: Status.IN_PROGRESS, confidence: 5 },
  { id: 'm3', name: 'Complex Numbers', subject: Subject.MATH, status: Status.NOT_STARTED, confidence: 0 },
  { id: 'm4', name: 'Calculus: Limits', subject: Subject.MATH, status: Status.NOT_STARTED, confidence: 0 },
  { id: 'm5', name: 'Coordinate Geometry', subject: Subject.MATH, status: Status.NOT_STARTED, confidence: 0 },
];

export const MOCK_TEST_DATA = [
  { id: 't1', date: '2023-10-01', testName: 'Mock Test 1', physicsScore: 60, chemistryScore: 70, mathScore: 50, totalScore: 180, maxScore: 300 },
  { id: 't2', date: '2023-10-15', testName: 'Mock Test 2', physicsScore: 65, chemistryScore: 68, mathScore: 55, totalScore: 188, maxScore: 300 },
  { id: 't3', date: '2023-11-01', testName: 'Mock Test 3', physicsScore: 75, chemistryScore: 80, mathScore: 60, totalScore: 215, maxScore: 300 },
];