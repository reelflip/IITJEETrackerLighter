import React from 'react';
import { Topic, Subject, Status } from '../types.ts';
import { CheckCircle2, Circle, Clock, CheckCircle } from 'lucide-react';

interface SyllabusTrackerProps {
  topics: Topic[];
  onUpdateTopic: (topic: Topic) => void;
}

const statusConfig = {
  [Status.NOT_STARTED]: { color: 'text-slate-300', icon: Circle, label: 'Not Started', bg: 'bg-slate-50' },
  [Status.IN_PROGRESS]: { color: 'text-blue-500', icon: Clock, label: 'In Progress', bg: 'bg-blue-50' },
  [Status.COMPLETED]: { color: 'text-green-500', icon: CheckCircle2, label: 'Completed', bg: 'bg-green-50' },
  [Status.REVISION_DONE]: { color: 'text-purple-500', icon: CheckCircle, label: 'Revised', bg: 'bg-purple-50' }
};

const SyllabusTracker: React.FC<SyllabusTrackerProps> = ({ topics, onUpdateTopic }) => {
  const subjects = [Subject.PHYSICS, Subject.CHEMISTRY, Subject.MATH];

  const handleStatusChange = (topic: Topic, newStatus: Status) => {
    onUpdateTopic({ ...topic, status: newStatus });
  };

  const handleConfidenceChange = (topic: Topic, value: number) => {
    onUpdateTopic({ ...topic, confidence: value });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-slate-900">Syllabus Tracker</h2>
         <div className="text-sm text-slate-500">Track your progress chapter by chapter</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <div key={subject} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className={`p-4 border-b border-slate-100 font-bold text-lg flex items-center gap-2
              ${subject === Subject.PHYSICS ? 'text-indigo-600 bg-indigo-50/50' : ''}
              ${subject === Subject.CHEMISTRY ? 'text-teal-600 bg-teal-50/50' : ''}
              ${subject === Subject.MATH ? 'text-rose-600 bg-rose-50/50' : ''}
            `}>
              {subject}
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px]">
              {topics.filter(t => t.subject === subject).map(topic => {
                const CurrentIcon = statusConfig[topic.status].icon;
                
                return (
                  <div key={topic.id} className="group p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-all bg-white hover:shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-800 text-sm">{topic.name}</h4>
                      <div className="relative group/menu">
                        <button className={`p-1 rounded-full hover:bg-slate-100 ${statusConfig[topic.status].color}`}>
                          <CurrentIcon size={18} />
                        </button>
                        {/* Dropdown for status */}
                        <div className="absolute right-0 top-6 z-10 hidden group-hover/menu:block min-w-[140px] bg-white shadow-lg rounded-lg border border-slate-100 py-1">
                           {Object.values(Status).map(s => (
                             <button
                               key={s}
                               onClick={() => handleStatusChange(topic, s)}
                               className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 ${topic.status === s ? 'font-bold text-slate-800' : 'text-slate-500'}`}
                             >
                               {s}
                             </button>
                           ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Confidence</span>
                        <span>{topic.confidence}/10</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={topic.confidence}
                        onChange={(e) => handleConfidenceChange(topic, parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                );
              })}
              {topics.filter(t => t.subject === subject).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                    No topics added yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusTracker;