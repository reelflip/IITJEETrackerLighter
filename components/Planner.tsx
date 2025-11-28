import React, { useState } from 'react';
import { Task } from '../types.ts';
import { Check, Trash2, Plus, Calendar } from 'lucide-react';

interface PlannerProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, dueDate: string) => void;
  onDeleteTask: (id: string) => void;
}

const Planner: React.FC<PlannerProps> = ({ tasks, onToggleTask, onAddTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle, dueDate || new Date().toISOString().split('T')[0]);
    setNewTaskTitle('');
    setDueDate('');
  };

  const sortedTasks = [...tasks].sort((a, b) => {
      if (a.isCompleted === b.isCompleted) return 0;
      return a.isCompleted ? 1 : -1;
  });

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-slate-900">Study Planner</h2>
        </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Input */}
        <div className="lg:col-span-1">
            <div className="bg-indigo-600 p-6 rounded-xl text-white shadow-lg">
                <h3 className="font-bold text-lg mb-4">Add New Task</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-indigo-200 text-xs font-medium mb-1">Task Description</label>
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="e.g. Solve HC Verma Ch 5"
                            className="w-full px-3 py-2 bg-indigo-700/50 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-indigo-300 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-indigo-200 text-xs font-medium mb-1">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 bg-indigo-700/50 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-sm"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-white text-indigo-600 font-bold py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                        <Plus size={18} /> Add Task
                    </button>
                </form>
            </div>
            
            <div className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-slate-600">Completed: {tasks.filter(t => t.isCompleted).length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium text-slate-600">Pending: {tasks.filter(t => !t.isCompleted).length}</span>
                </div>
            </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2 space-y-3">
            {sortedTasks.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center">
                    <p className="text-slate-400">No tasks found. Create one to get started!</p>
                </div>
            ) : (
                sortedTasks.map(task => (
                    <div 
                        key={task.id} 
                        className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                        ${task.isCompleted ? 'bg-slate-50 border-slate-100 opacity-75' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onToggleTask(task.id)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors
                                ${task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-indigo-500'}
                                `}
                            >
                                {task.isCompleted && <Check size={14} />}
                            </button>
                            <div>
                                <p className={`font-medium ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                    <Calendar size={12} />
                                    <span>{task.dueDate}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => onDeleteTask(task.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default Planner;