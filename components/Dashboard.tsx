import React, { useMemo, useState } from 'react';
import { Topic, TestScore, Status, User, Subject } from '../types';
import { Quote, Search, LayoutGrid, Calendar as CalendarIcon, Save, ChevronDown, Info, Clock, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  topics: Topic[];
  scores: TestScore[];
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ topics, scores, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<'All' | Subject>('All');

  const stats = useMemo(() => {
    const total = topics.length;
    const completed = topics.filter(t => t.status === Status.COMPLETED || t.status === Status.REVISION_DONE).length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [topics]);

  const filteredTopics = topics.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || t.subject === selectedSubject;
      return matchesSearch && matchesSubject;
  });

  const getSubjectColor = (subject: Subject) => {
      switch (subject) {
          case Subject.PHYSICS: return 'bg-purple-100 text-purple-700';
          case Subject.CHEMISTRY: return 'bg-teal-100 text-teal-700';
          case Subject.MATH: return 'bg-rose-100 text-rose-700';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  const getStatusColor = (status: Status) => {
      if (status === Status.COMPLETED || status === Status.REVISION_DONE) return 'text-green-600 bg-green-50 border-green-200';
      if (status === Status.IN_PROGRESS) return 'text-blue-600 bg-blue-50 border-blue-200';
      return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-fade-in -mt-4">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Motivation Card */}
        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] p-8 rounded-2xl shadow-lg text-white relative overflow-hidden flex flex-col justify-center min-h-[220px]">
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
             
             <div className="flex items-center gap-2 text-purple-200 font-bold text-xs tracking-widest uppercase mb-4">
                <Quote size={16} className="rotate-180" />
                Daily Motivation
             </div>

             <h2 className="text-2xl md:text-3xl font-serif italic leading-relaxed text-white mb-6">
                "Success is the sum of small efforts, repeated day in and day out."
             </h2>

             <div className="flex items-center gap-4">
                <div className="h-px bg-purple-400/50 w-12"></div>
                <p className="text-sm font-bold text-purple-100 tracking-wider uppercase">Robert Collier</p>
                <div className="h-px bg-purple-400/50 w-12"></div>
             </div>
        </div>

        {/* Student Notice Board */}
        <div className="bg-[#fff7ed] rounded-2xl border border-orange-100 p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-2">
                    <span className="text-orange-500"><Info size={20}/></span>
                    <h3 className="font-bold text-slate-800">Student Notice Board</h3>
                </div>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded border border-orange-200">2 Updates</span>
            </div>
            
            <div className="p-4 space-y-3 bg-white flex-1">
                {/* Notice 1 */}
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg relative">
                     <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-red-700">Mock Test Schedule Update</h4>
                        <span className="text-[10px] flex items-center gap-1 text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
                            <CalendarIcon size={10} /> 2025-11-25
                        </span>
                     </div>
                     <p className="text-xs text-slate-600 leading-relaxed">
                        The Major Test 3 has been rescheduled to next Sunday. Please prepare accordingly.
                     </p>
                </div>

                {/* Notice 2 */}
                 <div className="p-3 bg-slate-50 border-l-4 border-slate-400 rounded-r-lg relative">
                     <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-slate-700">Holiday Announcement</h4>
                         <span className="text-[10px] flex items-center gap-1 text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
                            <CalendarIcon size={10} /> 2025-11-25
                        </span>
                     </div>
                     <p className="text-xs text-slate-600 leading-relaxed">
                        Institute will remain closed on Wednesday due to public holiday.
                     </p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Welcome Back Card */}
         <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
                <h2 className="text-xl font-bold text-slate-800">Welcome Back, <span className="text-indigo-600">{user?.name || 'Student'}!</span></h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Consistent effort is the key to cracking JEE with excellence. You have completed <strong className="text-slate-800">{stats.completed} out of {stats.total}</strong> major topics.
                </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center min-w-[140px]">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                    <Clock size={12}/> Time Remaining
                </p>
                <p className="text-2xl font-bold text-indigo-600 mb-1">1 Yr 2 Mo</p>
                <p className="text-[10px] text-slate-400">Target: {user?.targetYear || 'IIT JEE'}</p>
            </div>
         </div>

         {/* Overall Progress */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-slate-500">Overall Progress</h3>
                <LayoutGrid size={20} className="text-indigo-600" />
            </div>
            <div>
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-slate-800">{stats.percentage}%</span>
                    <span className="text-sm text-slate-500">completed</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${stats.percentage}%` }}></div>
                </div>
            </div>
         </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search topics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50"
            />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {['All', Subject.PHYSICS, Subject.CHEMISTRY, Subject.MATH].map((sub) => (
                <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub as any)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                        ${selectedSubject === sub 
                            ? 'bg-slate-800 text-white' 
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}
                    `}
                >
                    {sub}
                </button>
            ))}
             <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>
             <button className="flex items-center gap-2 bg-[#0056b3] hover:bg-[#004494] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ml-auto md:ml-0">
                <Save size={16} /> Save Changes
             </button>
        </div>
      </div>

      {/* Phase 1 Header */}
      <div className="pt-2">
          <h2 className="text-xl font-bold text-slate-900">Phase 1</h2>
          <div className="h-px bg-slate-200 w-full mt-2"></div>
      </div>

      {/* Topic List */}
      <div className="space-y-4 pb-20">
          {filteredTopics.length > 0 ? (
              filteredTopics.map((topic, index) => (
                <div key={topic.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 transition-all hover:border-indigo-200 hover:shadow-md">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getSubjectColor(topic.subject)}`}>
                                {topic.subject}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                                Phase 1
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-lg">{topic.name}</h3>
                            <ChevronDown size={16} className="text-slate-400" />
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="text-xs text-slate-500 font-medium">Est. 8 Hours</div>
                            <div className="flex items-center gap-2 flex-1 max-w-xs">
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-300 w-0"></div>
                                </div>
                                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">0% Questions</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${getStatusColor(topic.status)}`}>
                            {topic.status === Status.COMPLETED && <CheckCircle2 size={16} />}
                            {topic.status}
                            <ChevronDown size={14} className="opacity-50 ml-1" />
                        </div>
                        <button className="text-sm font-bold text-[#0056b3] hover:underline underline-offset-2">
                            Details
                        </button>
                    </div>
                </div>
              ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400">No topics found matching your filters.</p>
            </div>
          )}
      </div>

    </div>
  );
};

export default Dashboard;