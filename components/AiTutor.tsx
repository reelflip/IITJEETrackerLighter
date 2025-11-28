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
-- 1. Select your assigned database in phpMyAdmin (e.g., u131922718_iitjee)
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
    user_id INT NOT NULL, -- Currently mocked as 0 or 1
    name VARCHAR(255) NOT NULL,
    subject ENUM('Physics', 'Chemistry', 'Mathematics') NOT NULL,
    status ENUM('Not Started', 'In Progress', 'Completed', 'Revision Done') DEFAULT 'Not Started',
    confidence INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

  const phpAPI = `<?php
/**
 * SAVE THIS FILE AS: api.php
 * UPLOAD TO: public_html/jee-tracker/ (or similar folder)
 * UPDATE "services/dataService.ts" with the URL to this file.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// --- DATABASE CONFIGURATION (UPDATE THESE) ---
$host = 'localhost';
$db   = 'u131922718_iitjee'; // Your Database Name
$user = 'u131922718_iitjee'; // Your Database User
$pass = 'YOUR_DB_PASSWORD';  // Your Database Password
// ---------------------------------------------

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
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

// ---------------- API ROUTES ----------------

if ($action === 'registerUser' && $method === 'POST') {
    // Basic registration example
    $stmt = $conn->prepare("INSERT INTO users (name, email, password_hash, role, institute, target_year) VALUES (?, ?, ?, ?, ?, ?)");
    // WARNING: In production, use password_hash($input['password'], PASSWORD_DEFAULT)
    $stmt->bind_param("ssssss", $input['name'], $input['email'], $input['password'], $input['role'], $input['institute'], $input['targetYear']);
    
    if ($stmt->execute()) {
        $input['id'] = $conn->insert_id;
        sendResponse($input);
    } else {
        echo json_encode(["error" => $stmt->error]);
    }
}

if ($action === 'loginUser' && $method === 'POST') {
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $input['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    // WARNING: In production, verify hash: password_verify($input['password'], $user['password_hash'])
    if ($user && $user['password_hash'] === $input['password']) {
        unset($user['password_hash']); // Don't send password back
        sendResponse($user);
    } else {
        echo json_encode(["error" => "Invalid credentials"]);
    }
}

if ($action === 'getTopics' && $method === 'GET') {
    $result = $conn->query("SELECT * FROM topics");
    $topics = [];
    while ($row = $result->fetch_assoc()) {
        $topics[] = $row;
    }
    sendResponse($topics);
}

// ... Add similar blocks for 'updateTopic', 'getScores', 'addScore', etc. ...

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
                            : "React cannot connect directly to MySQL for security. You must use an API. Copy the PHP code below, save it as 'api.php', and upload it to your website folder."}
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