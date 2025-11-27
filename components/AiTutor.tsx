import React from 'react';
import { Database, FileCode, Server } from 'lucide-react';

const SchemaViewer: React.FC = () => {
  const schemaSQL = `
-- Database: jee_preppro_db

-- Table for storing user accounts (Students & Parents)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'parent') NOT NULL,
    institute VARCHAR(255), -- Nullable for parents
    target_year VARCHAR(50), -- Nullable for parents
    security_question VARCHAR(255),
    security_answer_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing subjects and topics
CREATE TABLE topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Link topics to specific user
    name VARCHAR(255) NOT NULL,
    subject ENUM('Physics', 'Chemistry', 'Mathematics') NOT NULL,
    status ENUM('Not Started', 'In Progress', 'Completed', 'Revision Done') DEFAULT 'Not Started',
    confidence INT DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for storing mock test scores
CREATE TABLE test_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    physics_score INT NOT NULL,
    chemistry_score INT NOT NULL,
    math_score INT NOT NULL,
    total_score INT GENERATED ALWAYS AS (physics_score + chemistry_score + math_score) STORED,
    max_score INT DEFAULT 300,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for planner tasks
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_topic_subject ON topics(subject);
CREATE INDEX idx_test_date ON test_scores(test_date);
`;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
            <Database className="text-white w-5 h-5" />
        </div>
        <div>
            <h2 className="text-white font-bold text-lg">Backend Integration</h2>
            <p className="text-slate-300 text-xs">MySQL Database Schema</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Server size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Database Connection</h3>
                    <p className="text-slate-600 text-sm mt-1">
                        This application is currently running in <strong>mock mode</strong>. 
                        To deploy with a real backend, execute the SQL below on your MySQL server and update the API endpoints in <code>dataService.ts</code>.
                    </p>
                </div>
            </div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-800">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
                <div className="flex items-center gap-2">
                    <FileCode size={14} className="text-blue-400" />
                    <span className="text-xs text-slate-300 font-mono">schema.sql</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
            </div>
            <pre className="p-4 text-sm text-blue-100 overflow-x-auto sql-code leading-relaxed">
                <code>{schemaSQL}</code>
            </pre>
        </div>
      </div>
    </div>
  );
};

export default SchemaViewer;