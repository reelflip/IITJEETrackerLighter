import React, { useState } from 'react';
import { User, Lock, Mail, Building2, Calendar, ShieldCheck, ChevronUp, ArrowRight, Loader2, AlertCircle, Database } from 'lucide-react';
import { dataService } from '../services/dataService.ts';
import { UserRole, User as UserType } from '../types.ts';

interface LoginProps {
  onLogin: (user: UserType) => void;
  onShowSetup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onShowSetup }) => {
  const [view, setView] = useState<'login' | 'register'>('register');
  const [userType, setUserType] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      password: '',
      institute: '',
      targetYear: '',
      securityQuestion: 'What is the name of your first pet?',
      securityAnswer: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value
      });
      setError(''); // Clear error on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        let user: UserType;
        if (view === 'register') {
            user = await dataService.registerUser({
                name: formData.fullName,
                email: formData.email,
                role: userType,
                institute: userType === 'student' ? formData.institute : undefined,
                targetYear: userType === 'student' ? formData.targetYear : undefined,
                password: formData.password,
                securityQuestion: formData.securityQuestion,
                securityAnswer: formData.securityAnswer
            });
        } else {
            user = await dataService.loginUser(formData.email, formData.password);
        }
        
        // CRITICAL: Save user to local storage so API service can grab the ID for subsequent requests
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        onLogin(user);
    } catch (err: any) {
        setError(err.message || 'An error occurred');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 relative">
        
        {/* Header Section */}
        <div className="pt-8 pb-6 text-center bg-white">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
                <span className="text-slate-900">IIT</span> <span className="text-orange-600">JEE</span>
            </h1>
            
            <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center relative overflow-hidden shadow-lg border-4 border-white">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-800"></div>
                    <div className="relative z-10 text-center">
                        <ChevronUp className="text-blue-400 w-10 h-10 mx-auto -mb-1" strokeWidth={3} />
                        <div className="flex gap-1 justify-center text-[10px] text-yellow-400 font-serif opacity-80">
                            <span>α</span>
                            <span>∑</span>
                            <span>π</span>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-blue-600 tracking-wide mb-2">TRACKER</h2>
            
            <div className="flex items-center justify-center gap-3 px-8">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Your Journey. Your Data.</span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-8">
            <div className="flex justify-between items-baseline mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                    {view === 'register' ? 'Create Account' : 'Welcome Back'}
                </h3>
                <button 
                    type="button"
                    onClick={() => {
                        setView(view === 'register' ? 'login' : 'register');
                        setError('');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    {view === 'register' ? 'Back to Login' : 'Create an Account'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {view === 'register' && (
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setUserType('student')}
                            className={`text-sm font-medium py-2 rounded-md transition-all ${userType === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            I am a Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType('parent')}
                            className={`text-sm font-medium py-2 rounded-md transition-all ${userType === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            I am a Parent
                        </button>
                    </div>
                )}

                {view === 'register' && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    name="fullName"
                                    type="text" 
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required={view === 'register'}
                                    placeholder={userType === 'student' ? "Student Name" : "Parent Name"}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {userType === 'student' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Institute</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            name="institute"
                                            type="text" 
                                            value={formData.institute}
                                            onChange={handleChange}
                                            placeholder="Bakliwal"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Year</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            name="targetYear"
                                            type="text" 
                                            value={formData.targetYear}
                                            onChange={handleChange}
                                            placeholder="IIT JEE 2025"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            name="email"
                            type="email" 
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={userType === 'student' ? "student@example.com" : "parent@example.com"}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            name="password"
                            type="password" 
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={view === 'register' ? "Create a strong password" : "Enter your password"}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {view === 'register' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                        <div className="flex items-center gap-2 mb-3 text-blue-800">
                            <ShieldCheck size={16} />
                            <span className="text-xs font-bold">Account Recovery Setup</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-blue-600/70 uppercase tracking-wider mb-1.5">Security Question</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                                        <span className="text-xs font-bold">?</span>
                                    </div>
                                    <select 
                                        name="securityQuestion"
                                        value={formData.securityQuestion}
                                        onChange={handleChange}
                                        className="w-full pl-8 pr-4 py-2 bg-white border border-blue-200 rounded text-sm text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                                    >
                                        <option>What is the name of your first pet?</option>
                                        <option>What is your mother's maiden name?</option>
                                        <option>What city were you born in?</option>
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label className="block text-[10px] font-bold text-blue-600/70 uppercase tracking-wider mb-1.5">Answer</label>
                                <input 
                                    name="securityAnswer"
                                    type="text" 
                                    value={formData.securityAnswer}
                                    onChange={handleChange}
                                    required={view === 'register'}
                                    placeholder="e.g. Fluffy"
                                    className="w-full px-4 py-2 bg-white border border-blue-200 rounded text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            {view === 'register' ? 'Create Account' : 'Login Securely'}
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>

        {/* Database Setup Link */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400">&copy; 2024 JEE PrepPro.</span>
            <button 
                onClick={onShowSetup}
                className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
            >
                <Database size={12} />
                Database Setup
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;