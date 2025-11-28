import React, { useState, useMemo } from 'react';
import { TestScore } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, LabelList } from 'recharts';
import { Plus, Filter } from 'lucide-react';

interface TestAnalysisProps {
  scores: TestScore[];
  onAddScore: (score: TestScore) => void;
}

const TestAnalysis: React.FC<TestAnalysisProps> = ({ scores, onAddScore }) => {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'last3'>('all');
  const [newScore, setNewScore] = useState<Partial<TestScore>>({
    maxScore: 300,
    physicsScore: 0,
    chemistryScore: 0,
    mathScore: 0,
    testName: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScore.testName || !newScore.date) return;
    
    const totalScore = (newScore.physicsScore || 0) + (newScore.chemistryScore || 0) + (newScore.mathScore || 0);
    
    onAddScore({
      id: Date.now().toString(),
      testName: newScore.testName,
      date: newScore.date,
      physicsScore: newScore.physicsScore || 0,
      chemistryScore: newScore.chemistryScore || 0,
      mathScore: newScore.mathScore || 0,
      maxScore: newScore.maxScore || 300,
      totalScore
    });
    
    setShowForm(false);
    setNewScore({ maxScore: 300, physicsScore: 0, chemistryScore: 0, mathScore: 0, testName: '', date: new Date().toISOString().split('T')[0] });
  };

  const chartData = useMemo(() => {
    const sorted = [...scores].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const filtered = viewMode === 'last3' ? sorted.slice(-3) : sorted;

    // Calculate Trendline (Simple Linear Regression)
    if (filtered.length >= 2) {
         const n = filtered.length;
         let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
         
         filtered.forEach((d, i) => {
             sumX += i;
             sumY += d.totalScore;
             sumXY += i * d.totalScore;
             sumXX += i * i;
         });
         
         const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
         const intercept = (sumY - slope * sumX) / n;
         
         return filtered.map((d, i) => ({
             ...d,
             trend: Math.round(slope * i + intercept)
         }));
    }
    
    // Fallback if not enough data for regression
    return filtered.map(d => ({ ...d, trend: d.totalScore }));
  }, [scores, viewMode]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Test Analysis</h2>
        <div className="flex items-center gap-3">
             <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                <button 
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${viewMode === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    All Tests
                </button>
                <button 
                    onClick={() => setViewMode('last3')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${viewMode === 'last3' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Last 3
                </button>
             </div>
            <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
            <Plus size={16} /> Add Test Score
            </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Add New Mock Test</h3>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Test Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Full Syllabus Mock 3" 
              className="border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-indigo-500"
              value={newScore.testName}
              onChange={e => setNewScore({...newScore, testName: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Date</label>
            <input 
              required
              type="date" 
              className="border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-indigo-500"
              value={newScore.date}
              onChange={e => setNewScore({...newScore, date: e.target.value})}
            />
          </div>

          <div className="hidden lg:block"></div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Physics</label>
            <input 
              type="number" 
              className="border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-indigo-500"
              value={newScore.physicsScore}
              onChange={e => setNewScore({...newScore, physicsScore: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Chemistry</label>
            <input 
              type="number" 
              className="border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-indigo-500"
              value={newScore.chemistryScore}
              onChange={e => setNewScore({...newScore, chemistryScore: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Math</label>
            <input 
              type="number" 
              className="border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-indigo-500"
              value={newScore.mathScore}
              onChange={e => setNewScore({...newScore, mathScore: parseInt(e.target.value)})}
            />
          </div>
          
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Save Score</button>
          </div>
        </form>
      )}

      {scores.length > 0 ? (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
                <h3 className="text-md font-bold text-slate-700 mb-4 flex justify-between items-center">
                    Total Score Progression
                    {viewMode === 'last3' && <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-1 rounded">Last 3 Tests</span>}
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="testName" tick={{fontSize: 10}} interval={0} stroke="#94a3b8" />
                    <YAxis domain={[0, 'dataMax + 20']} tick={{fontSize: 12}} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Line type="monotone" dataKey="totalScore" stroke="#4f46e5" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Total Score" />
                    <Line type="monotone" dataKey="trend" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Trend" />
                    </LineChart>
                </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
                <h3 className="text-md font-bold text-slate-700 mb-4 flex justify-between items-center">
                    Subject Wise Performance
                    {viewMode === 'last3' && <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-1 rounded">Last 3 Tests</span>}
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="testName" tick={{fontSize: 10}} interval={0} stroke="#94a3b8" />
                    <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="physicsScore" fill="#818cf8" name="Physics" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="physicsScore" position="top" style={{ fontSize: '10px', fill: '#64748b' }} />
                    </Bar>
                    <Bar dataKey="chemistryScore" fill="#34d399" name="Chemistry" radius={[4, 4, 0, 0]}>
                         <LabelList dataKey="chemistryScore" position="top" style={{ fontSize: '10px', fill: '#64748b' }} />
                    </Bar>
                    <Bar dataKey="mathScore" fill="#f472b6" name="Math" radius={[4, 4, 0, 0]}>
                         <LabelList dataKey="mathScore" position="top" style={{ fontSize: '10px', fill: '#64748b' }} />
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Test Name</th>
                            <th className="p-4">Physics</th>
                            <th className="p-4">Chemistry</th>
                            <th className="p-4">Math</th>
                            <th className="p-4">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[...scores].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(score => (
                            <tr key={score.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-500">{score.date}</td>
                                <td className="p-4 font-medium text-slate-800">{score.testName}</td>
                                <td className="p-4 text-indigo-600">{score.physicsScore}</td>
                                <td className="p-4 text-teal-600">{score.chemistryScore}</td>
                                <td className="p-4 text-rose-600">{score.mathScore}</td>
                                <td className="p-4 font-bold text-slate-900">{score.totalScore}/{score.maxScore}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
      ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No test scores yet.</p>
              <p className="text-slate-400 text-sm mt-1">Add your first mock test result to see analytics.</p>
          </div>
      )}
    </div>
  );
};

export default TestAnalysis;