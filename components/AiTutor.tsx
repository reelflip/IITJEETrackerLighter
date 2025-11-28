import React, { useState } from 'react';
import { Database, FileCode, Server, Code2, Copy, Check, Download } from 'lucide-react';

const SchemaViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'python'>('sql');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const schemaSQL = `-- --------------------------------------------------------
-- DATABASE IMPORT SCRIPT for u131922718_iitjee_tracker
-- --------------------------------------------------------
-- INSTRUCTIONS:
-- 1. Log in to phpMyAdmin.
-- 2. Select the database: u131922718_iitjee_tracker
-- 3. Click "Import" tab at the top.
-- 4. Upload this file and click "Go".
-- --------------------------------------------------------

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Table structure for table 'users'
--

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'parent') NOT NULL,
    institute VARCHAR(255),
    target_year VARCHAR(50),
    security_question VARCHAR(255),
    security_answer_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Default Admin User
--
INSERT IGNORE INTO users (name, email, password_hash, role, institute, target_year) VALUES 
('Admin User', 'admin@iitgeeprep.com', 'admin123', 'student', 'IIT Bombay', 'IIT JEE 2025');

--
-- Table structure for table 'topics'
--

CREATE TABLE IF NOT EXISTS topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
    name VARCHAR(255) NOT NULL,
    subject ENUM('Physics', 'Chemistry', 'Mathematics') NOT NULL,
    status ENUM('Not Started', 'In Progress', 'Completed', 'Revision Done') DEFAULT 'Not Started',
    confidence INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table 'test_scores'
--

CREATE TABLE IF NOT EXISTS test_scores (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table 'tasks'
--

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
`;

  const pythonAPI = `# app.py
# ------------------------------------------------------------------
# PYTHON FLASK API for IIT JEE Tracker
# ------------------------------------------------------------------
# Requirements: 
#   pip install flask flask-cors mysql-connector-python
#
# Run:
#   python app.py
# ------------------------------------------------------------------

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime

app = Flask(__name__)
# Allow CORS so your React app can talk to this server
CORS(app)

# --- DATABASE CONFIGURATION ---
DB_CONFIG = {
    'user': 'u131922718_iitjee_user',
    'password': 'YOUR_DB_PASSWORD',  # <--- REPLACE THIS
    'host': 'localhost',
    'database': 'u131922718_iitjee_tracker'
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Helper to standardise responses
def send_response(data):
    return jsonify({"data": data}), 200

def send_error(message, code=400):
    return jsonify({"error": message}), code

@app.route('/api', methods=['GET', 'POST', 'OPTIONS'])
def handle_api():
    if request.method == 'OPTIONS':
        return '', 200
        
    action = request.args.get('action')
    data = request.json if request.is_json else {}
    
    conn = get_db_connection()
    if not conn:
        return send_error("Database connection failed", 500)
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 1. Register User
        if action == 'registerUser' and request.method == 'POST':
            sql = "INSERT INTO users (name, email, password_hash, role, institute, target_year) VALUES (%s, %s, %s, %s, %s, %s)"
            val = (data.get('name'), data.get('email'), data.get('password'), data.get('role'), data.get('institute'), data.get('targetYear'))
            cursor.execute(sql, val)
            conn.commit()
            
            new_user_id = cursor.lastrowid
            data['id'] = new_user_id
            del data['password']
            
            # Seed topics
            seed_topics(conn, new_user_id)
            return send_response(data)

        # 2. Login User
        elif action == 'loginUser' and request.method == 'POST':
            sql = "SELECT * FROM users WHERE email = %s"
            cursor.execute(sql, (data.get('email'),))
            user = cursor.fetchone()
            
            if user and user['password_hash'] == data.get('password'):
                del user['password_hash']
                return send_response(user)
            else:
                return send_error("Invalid credentials")

        # 3. Get Topics
        elif action == 'getTopics':
            user_id = request.args.get('userId')
            cursor.execute("SELECT * FROM topics WHERE user_id = %s", (user_id,))
            topics = cursor.fetchall()
            return send_response(topics)

        # 4. Update Topic
        elif action == 'updateTopic' and request.method == 'POST':
            sql = "UPDATE topics SET status=%s, confidence=%s, updated_at=NOW() WHERE id=%s"
            cursor.execute(sql, (data.get('status'), data.get('confidence'), data.get('id')))
            conn.commit()
            
            # Return updated list
            user_id = data.get('userId')
            cursor.execute("SELECT * FROM topics WHERE user_id = %s", (user_id,))
            return send_response(cursor.fetchall())

        # 5. Get Scores
        elif action == 'getScores':
            user_id = request.args.get('userId')
            cursor.execute("SELECT * FROM test_scores WHERE user_id = %s", (user_id,))
            
            # Convert date objects to strings
            scores = cursor.fetchall()
            for s in scores:
                if s['test_date']:
                    s['test_date'] = str(s['test_date'])
            
            return send_response(scores)

        # 6. Add Score
        elif action == 'addScore' and request.method == 'POST':
            sql = "INSERT INTO test_scores (user_id, test_name, test_date, physics_score, chemistry_score, math_score, max_score) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            val = (data.get('userId'), data.get('testName'), data.get('date'), data.get('physicsScore'), data.get('chemistryScore'), data.get('mathScore'), data.get('maxScore'))
            cursor.execute(sql, val)
            conn.commit()
            
            # Return updated list
            cursor.execute("SELECT * FROM test_scores WHERE user_id = %s", (data.get('userId'),))
            scores = cursor.fetchall()
            for s in scores:
                if s['test_date']:
                    s['test_date'] = str(s['test_date'])
            return send_response(scores)

        # 7. Get Tasks
        elif action == 'getTasks':
            user_id = request.args.get('userId')
            cursor.execute("SELECT * FROM tasks WHERE user_id = %s", (user_id,))
            tasks = cursor.fetchall()
            # Convert DB format to Frontend format
            frontend_tasks = []
            for t in tasks:
                frontend_tasks.append({
                    'id': t['id'],
                    'title': t['title'],
                    'isCompleted': bool(t['is_completed']),
                    'dueDate': str(t['due_date']) if t['due_date'] else ''
                })
            return send_response(frontend_tasks)

        # 8. Add Task
        elif action == 'addTask' and request.method == 'POST':
            sql = "INSERT INTO tasks (user_id, title, due_date) VALUES (%s, %s, %s)"
            cursor.execute(sql, (data.get('userId'), data.get('title'), data.get('dueDate')))
            conn.commit()
            return fetch_tasks(cursor, data.get('userId'))

        # 9. Toggle Task
        elif action == 'toggleTask' and request.method == 'POST':
            task_id = data.get('id')
            # Get current
            cursor.execute("SELECT is_completed FROM tasks WHERE id = %s", (task_id,))
            current = cursor.fetchone()
            new_status = 0 if current['is_completed'] else 1
            
            cursor.execute("UPDATE tasks SET is_completed = %s WHERE id = %s", (new_status, task_id))
            conn.commit()
            
            # Get User ID for this task to refresh list
            cursor.execute("SELECT user_id FROM tasks WHERE id = %s", (task_id,))
            uid = cursor.fetchone()['user_id']
            return fetch_tasks(cursor, uid)
            
        # 10. Delete Task
        elif action == 'deleteTask' and request.method == 'POST':
            task_id = data.get('id')
            # Get User ID first
            cursor.execute("SELECT user_id FROM tasks WHERE id = %s", (task_id,))
            row = cursor.fetchone()
            if row:
                uid = row['user_id']
                cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
                conn.commit()
                return fetch_tasks(cursor, uid)
            return send_response([])

        else:
            return send_error(f"Unknown action: {action}")

    except Exception as e:
        print(e)
        return send_error(str(e), 500)
    finally:
        cursor.close()
        conn.close()

def fetch_tasks(cursor, user_id):
    cursor.execute("SELECT * FROM tasks WHERE user_id = %s", (user_id,))
    tasks = cursor.fetchall()
    frontend_tasks = []
    for t in tasks:
        frontend_tasks.append({
            'id': t['id'],
            'title': t['title'],
            'isCompleted': bool(t['is_completed']),
            'dueDate': str(t['due_date']) if t['due_date'] else ''
        })
    return send_response(frontend_tasks)

def seed_topics(conn, user_id):
    cursor = conn.cursor()
    topics = [
        ('Units & Dimensions', 'Physics', 'Completed', 9),
        ('Kinematics', 'Physics', 'Completed', 8),
        ('Newtons Laws', 'Physics', 'In Progress', 6),
        ('Mole Concept', 'Chemistry', 'Completed', 9),
        ('Atomic Structure', 'Chemistry', 'In Progress', 7),
        ('Sets & Relations', 'Mathematics', 'Completed', 8),
        ('Quadratic Equations', 'Mathematics', 'In Progress', 5)
    ]
    sql = "INSERT INTO topics (user_id, name, subject, status, confidence) VALUES (%s, %s, %s, %s, %s)"
    for t in topics:
        cursor.execute(sql, (user_id, t[0], t[1], t[2], t[3]))
    conn.commit()
    cursor.close()

if __name__ == '__main__':
    # Run on port 5000
    app.run(debug=True, port=5000)
`;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                <Database className="text-white w-5 h-5" />
            </div>
            <div>
                <h2 className="text-white font-bold text-lg">Backend Integration (Python)</h2>
                <p className="text-slate-300 text-xs">Setup your Real MySQL Database with Flask</p>
            </div>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('sql')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'sql' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'}`}
            >
                1. DB Schema
            </button>
            <button 
                onClick={() => setActiveTab('python')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'python' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'}`}
            >
                2. Python Script
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                    <Server size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">
                        {activeTab === 'sql' ? 'Step 1: Create Database Tables' : 'Step 2: Connect via Python API'}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1 max-w-3xl">
                        {activeTab === 'sql' 
                            ? "Download the SQL file below and import it via phpMyAdmin. This will create all the necessary tables for the app to function." 
                            : "Copy the Python code below, save it as 'app.py', and run it on your server. Ensure you have installed Flask and mysql-connector-python."}
                    </p>
                </div>
            </div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-800 relative">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
                <div className="flex items-center gap-2">
                    {activeTab === 'sql' ? <Database size={14} className="text-blue-400" /> : <Code2 size={14} className="text-yellow-400" />}
                    <span className="text-xs text-slate-300 font-mono">
                        {activeTab === 'sql' ? 'schema.sql' : 'app.py'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {activeTab === 'sql' && (
                        <button 
                            onClick={() => handleDownload(schemaSQL, 'jee_tracker_schema.sql')}
                            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors border border-white/20"
                        >
                            <Download size={12} />
                            Download .sql
                        </button>
                    )}
                    <button 
                        onClick={() => handleCopy(activeTab === 'sql' ? schemaSQL : pythonAPI)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors border border-white/20"
                    >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                </div>
            </div>
            <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto h-[400px]">
                <code className={activeTab === 'sql' ? 'text-blue-100' : 'text-yellow-100'}>
                    {activeTab === 'sql' ? schemaSQL : pythonAPI}
                </code>
            </pre>
        </div>
      </div>
    </div>
  );
};

export default SchemaViewer;