import React, { useState } from 'react';
import { Database, FileCode, Server, Code2, Copy, Check } from 'lucide-react';

const SchemaViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'php'>('sql');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaSQL = `-- --------------------------------------------------------
-- HOSTING SETUP INSTRUCTIONS:
-- 1. Select your assigned database in phpMyAdmin: u131922718_iitjee_tracker
-- 2. Run the SQL below to create the required tables.
-- --------------------------------------------------------

-- Users Table
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
);

-- Topics Table
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
);

-- Test Scores Table
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
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

  const phpAPI = `<?php
/**
 * SAVE THIS FILE AS: api.php
 * UPLOAD TO: public_html/ (or your iitgeeprep.com folder)
 * ensure services/dataService.ts points to https://iitgeeprep.com/api.php
 */

// Enable Error Reporting for Debugging (Disable in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS Headers - Allow React App to Connect
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle Preflight Options Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// --- DATABASE CONFIGURATION ---
$host = 'localhost';
$db   = 'u131922718_iitjee_tracker'; 
$user = 'u131922718_iitjee_user'; 
$pass = 'YOUR_DB_PASSWORD';  // <--- ENTER YOUR REAL DATABASE PASSWORD HERE
// ------------------------------

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Helper to send JSON response
function sendResponse($data) {
    echo json_encode(["data" => $data]);
    exit;
}

function sendError($msg) {
    echo json_encode(["error" => $msg]);
    exit;
}

// ---------------- API ROUTES ----------------

// 1. User Registration
if ($action === 'registerUser' && $method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO users (name, email, password_hash, role, institute, target_year) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $input['name'], $input['email'], $input['password'], $input['role'], $input['institute'], $input['targetYear']);
    
    if ($stmt->execute()) {
        $input['id'] = $conn->insert_id;
        // Also Seed Initial Topics for the new user
        seedTopicsForUser($conn, $conn->insert_id);
        unset($input['password']); // Don't return password
        sendResponse($input);
    } else {
        sendError($stmt->error);
    }
}

// 2. User Login
if ($action === 'loginUser' && $method === 'POST') {
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $input['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user && $user['password_hash'] === $input['password']) {
        unset($user['password_hash']); 
        sendResponse($user);
    } else {
        sendError("Invalid credentials");
    }
}

// 3. Get Topics
if ($action === 'getTopics' && $method === 'GET') {
    $userId = $_GET['userId'] ?? 0;
    $stmt = $conn->prepare("SELECT * FROM topics WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $topics = [];
    while ($row = $result->fetch_assoc()) {
        $topics[] = $row;
    }
    sendResponse($topics);
}

// 4. Update Topic
if ($action === 'updateTopic' && $method === 'POST') {
    $stmt = $conn->prepare("UPDATE topics SET status=?, confidence=?, updated_at=NOW() WHERE id=?");
    $stmt->bind_param("sii", $input['status'], $input['confidence'], $input['id']);
    if ($stmt->execute()) {
        // Return updated list
        $userId = $input['userId'] ?? 0; // Ensure userId is passed in body
        $stmtList = $conn->prepare("SELECT * FROM topics WHERE user_id = ?");
        $stmtList->bind_param("i", $userId);
        $stmtList->execute();
        $res = $stmtList->get_result();
        $all = [];
        while ($r = $res->fetch_assoc()) $all[] = $r;
        sendResponse($all);
    } else {
        sendError($stmt->error);
    }
}

// 5. Get Scores
if ($action === 'getScores' && $method === 'GET') {
    $userId = $_GET['userId'] ?? 0;
    $stmt = $conn->prepare("SELECT * FROM test_scores WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $scores = [];
    while ($row = $result->fetch_assoc()) {
        $scores[] = $row;
    }
    sendResponse($scores);
}

// 6. Add Score
if ($action === 'addScore' && $method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO test_scores (user_id, test_name, test_date, physics_score, chemistry_score, math_score, max_score) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issiiii", $input['userId'], $input['testName'], $input['date'], $input['physicsScore'], $input['chemistryScore'], $input['mathScore'], $input['maxScore']);
    if ($stmt->execute()) {
        $newId = $conn->insert_id;
        // Return updated list
        $stmtList = $conn->prepare("SELECT * FROM test_scores WHERE user_id = ?");
        $stmtList->bind_param("i", $input['userId']);
        $stmtList->execute();
        $res = $stmtList->get_result();
        $all = [];
        while ($r = $res->fetch_assoc()) $all[] = $r;
        sendResponse($all);
    } else {
        sendError($stmt->error);
    }
}

// 7. Get Tasks
if ($action === 'getTasks' && $method === 'GET') {
    $userId = $_GET['userId'] ?? 0;
    $stmt = $conn->prepare("SELECT * FROM tasks WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        // Convert 1/0 to true/false for frontend
        $row['isCompleted'] = $row['is_completed'] == 1;
        $row['dueDate'] = $row['due_date'];
        $tasks[] = $row;
    }
    sendResponse($tasks);
}

// 8. Add Task
if ($action === 'addTask' && $method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO tasks (user_id, title, due_date) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $input['userId'], $input['title'], $input['dueDate']);
    if ($stmt->execute()) {
        fetchTasks($conn, $input['userId']);
    } else { sendError($stmt->error); }
}

// 9. Toggle Task
if ($action === 'toggleTask' && $method === 'POST') {
    // First check current status
    $check = $conn->prepare("SELECT is_completed FROM tasks WHERE id = ?");
    $check->bind_param("i", $input['id']);
    $check->execute();
    $row = $check->get_result()->fetch_assoc();
    $newState = $row['is_completed'] == 1 ? 0 : 1;

    $stmt = $conn->prepare("UPDATE tasks SET is_completed = ? WHERE id = ?");
    $stmt->bind_param("ii", $newState, $input['id']);
    if ($stmt->execute()) {
        fetchTasks($conn, $input['userId']);
    } else { sendError($stmt->error); }
}

// 10. Delete Task
if ($action === 'deleteTask' && $method === 'POST') {
    $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ?");
    $stmt->bind_param("i", $input['id']);
    if ($stmt->execute()) {
        fetchTasks($conn, $input['userId']);
    } else { sendError($stmt->error); }
}

// Utility to return task list after mod
function fetchTasks($conn, $userId) {
    $stmt = $conn->prepare("SELECT * FROM tasks WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $row['isCompleted'] = $row['is_completed'] == 1;
        $row['dueDate'] = $row['due_date'];
        $tasks[] = $row;
    }
    sendResponse($tasks);
}

// Utility to seed topics
function seedTopicsForUser($conn, $userId) {
    // Basic seed data
    $topics = [
        ['Units & Dimensions', 'Physics', 'Completed', 9],
        ['Kinematics', 'Physics', 'Completed', 8],
        ['Newtons Laws', 'Physics', 'In Progress', 6],
        ['Mole Concept', 'Chemistry', 'Completed', 9],
        ['Atomic Structure', 'Chemistry', 'In Progress', 7],
        ['Sets & Relations', 'Mathematics', 'Completed', 8],
        ['Quadratic Equations', 'Mathematics', 'In Progress', 5]
    ];
    
    $stmt = $conn->prepare("INSERT INTO topics (user_id, name, subject, status, confidence) VALUES (?, ?, ?, ?, ?)");
    foreach ($topics as $t) {
        $stmt->bind_param("isssi", $userId, $t[0], $t[1], $t[2], $t[3]);
        $stmt->execute();
    }
}

$conn->close();
?>`;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                <Database className="text-white w-5 h-5" />
            </div>
            <div>
                <h2 className="text-white font-bold text-lg">Backend Integration</h2>
                <p className="text-slate-300 text-xs">Setup your Real MySQL Database</p>
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
                onClick={() => setActiveTab('php')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'php' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'}`}
            >
                2. API Script
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
                        {activeTab === 'sql' ? 'Step 1: Create Database Tables' : 'Step 2: Connect via API'}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1 max-w-3xl">
                        {activeTab === 'sql' 
                            ? "Copy the SQL code below and run it in your phpMyAdmin's 'SQL' tab. This will create the necessary tables to store users, topics, and test scores." 
                            : "React cannot connect directly to MySQL for security. You must use an API. Copy the PHP code below, save it as 'api.php', add your password, and upload it to your website folder."}
                    </p>
                </div>
            </div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-800 relative">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
                <div className="flex items-center gap-2">
                    {activeTab === 'sql' ? <Database size={14} className="text-blue-400" /> : <Code2 size={14} className="text-purple-400" />}
                    <span className="text-xs text-slate-300 font-mono">
                        {activeTab === 'sql' ? 'schema.sql' : 'api.php'}
                    </span>
                </div>
                <button 
                    onClick={() => handleCopy(activeTab === 'sql' ? schemaSQL : phpAPI)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors"
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                </button>
            </div>
            <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto h-[400px]">
                <code className={activeTab === 'sql' ? 'text-blue-100' : 'text-purple-100'}>
                    {activeTab === 'sql' ? schemaSQL : phpAPI}
                </code>
            </pre>
        </div>
      </div>
    </div>
  );
};

export default SchemaViewer;