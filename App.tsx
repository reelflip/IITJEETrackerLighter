import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, LineChart, CheckSquare, Menu, X, Database, Server, Loader2, LogOut, ArrowLeft } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SyllabusTracker from './components/SyllabusTracker';
import TestAnalysis from './components/TestAnalysis';
import SchemaViewer from './components/AiTutor'; 
import Planner from './components/Planner';
import Login from './components/Login';
import { dataService } from './services/dataService';
import { Topic, TestScore, Task, User } from './types';

enum View {
  DASHBOARD = 'dashboard',
  SYLLABUS = 'syllabus',
  ANALYSIS = 'analysis',
  DATABASE = 'database',
  PLANNER = 'planner'
}

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSetup, setShowSetup] = useState(false); // New state to allow access to setup before login

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [scores, setScores] = useState<TestScore[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Loading States
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load data only after login
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        setIsAppLoading(true);
        try {
          const [fetchedTopics, fetchedScores, fetchedTasks] = await Promise.all([
            dataService.getTopics(),
            dataService.getScores(),
            dataService.getTasks()
          ]);
          setTopics(fetchedTopics);
          setScores(fetchedScores);
          setTasks(fetchedTasks);
        } catch (error) {
          console.error("Failed to fetch data from DB", error);
        } finally {
          setIsAppLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowSetup(false);
  };

  const handleUpdateTopic = async (topic: Topic) => {
    setIsSyncing(true);
    const updated = await dataService.updateTopic(topic);
    setTopics(updated);
    setIsSyncing(false);
  };

  const handleAddScore = async (score: TestScore) => {
    setIsSyncing(true);
    const updated = await dataService.addScore(score);
    setScores(updated);
    setIsSyncing(false);
  };

  const handleToggleTask = async (id: string) => {
    setIsSyncing(true);
    const updated = await dataService.toggleTask(id);
    setTasks(updated);
    setIsSyncing(false);
  };

  const handleAddTask = async (title: string, dueDate: string) => {
      setIsSyncing(true);
      const updated = await dataService.addTask(title, dueDate);
      setTasks(updated);
      setIsSyncing(false);
  }

  const handleDeleteTask = async (id: string) => {
      setIsSyncing(true);
      const updated = await dataService.deleteTask(id);
      setTasks(updated);
      setIsSyncing(false);
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView(View.DASHBOARD);
  };

  const navItems = [
    { id: View.DASHBOARD, label: 'Student Dashboard', icon: LayoutDashboard },
    { id: View.SYLLABUS, label: 'Syllabus', icon: BookOpen },
    { id: View.ANALYSIS, label: 'Analytics', icon: LineChart },
    { id: View.PLANNER, label: 'Planner', icon: CheckSquare },
    { id: View.DATABASE, label: 'DB Schema', icon: Database },
  ];

  const renderContent = () => {
    if (isAppLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 animate-pulse">
           <Loader2 size={48} className="animate-spin mb-4 text-indigo-600" />
           <p>Connecting to Database...</p>
        </div>
      );
    }

    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard user={currentUser} topics={topics} scores={scores} />;
      case View.SYLLABUS:
        return <SyllabusTracker topics={topics} onUpdateTopic={handleUpdateTopic} />;
      case View.ANALYSIS:
        return <TestAnalysis scores={scores} onAddScore={handleAddScore} />;
      case View.DATABASE:
        return <SchemaViewer />;
      case View.PLANNER:
        return <Planner tasks={tasks} onToggleTask={handleToggleTask} onAddTask={handleAddTask} onDeleteTask={handleDeleteTask} />;
      default:
        return <Dashboard user={currentUser} topics={topics} scores={scores} />;
    }
  };

  // Setup Mode (Access Schema without Login)
  if (!isAuthenticated && showSetup) {
      return (
          <div className="min-h-screen bg-slate-50 p-4">
              <div className="max-w-6xl mx-auto">
                  <button 
                    onClick={() => setShowSetup(false)}
                    className="mb-4 flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                  >
                      <ArrowLeft size={18} /> Back to Login
                  </button>
                  <SchemaViewer />
              </div>
          </div>
      );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} onShowSetup={() => setShowSetup(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">JP</div>
           JEE PrepPro
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-[calc(100vh-65px)] md:h-screen w-full md:w-64 bg-white border-r border-slate-200 z-10 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="hidden md:flex p-6 items-center gap-3 font-bold text-slate-900 text-xl border-b border-slate-100">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">JP</div>
           JEE PrepPro
        </div>

        <div className="px-6 py-4">
             <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                 <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                    {currentUser?.name.substring(0, 2) || 'ST'}
                 </div>
                 <div className="overflow-hidden">
                     <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.name || 'Student'}</p>
                     <p className="text-xs text-slate-500 capitalize">{currentUser?.role}</p>
                 </div>
             </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                ${currentView === item.id 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <item.icon size={20} className={currentView === item.id ? 'text-indigo-600' : 'text-slate-400'} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg flex items-start gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                <div>
                    <p className="text-xs font-bold text-slate-600">
                        {isSyncing ? 'Syncing...' : 'Connected'}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1">
                        MySQL Connector Ready
                    </p>
                </div>
            </div>
            
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
            >
                <LogOut size={16} />
                Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden h-full relative">
         <header className="mb-8 hidden md:block">
            {/* Header content moved into dashboard for specific design match */}
         </header>
         
         {renderContent()}
      </main>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/20 z-0 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default App;