
import React from 'react';
import { DetectionResult, DetectionLabel } from '../types';
import { BarChart2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface StatsDashboardProps {
  results: DetectionResult[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ results }) => {
  const total = results.length;
  const fakes = results.filter(r => r.label === DetectionLabel.FAKE).length;
  const reals = total - fakes;
  const avgConfidence = results.reduce((acc, r) => acc + r.confidence, 0) / total || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard 
        label="Total Analyzed" 
        value={total.toString()} 
        icon={<BarChart2 className="text-blue-400" />} 
      />
      <StatCard 
        label="Deepfakes Flagged" 
        value={fakes.toString()} 
        icon={<AlertCircle className="text-rose-400" />} 
        colorClass="text-rose-400"
      />
      <StatCard 
        label="Authentic Verified" 
        value={reals.toString()} 
        icon={<CheckCircle className="text-emerald-400" />} 
        colorClass="text-emerald-400"
      />
      <StatCard 
        label="Avg. Confidence" 
        value={`${(avgConfidence * 100).toFixed(1)}%`} 
        icon={<TrendingUp className="text-indigo-400" />} 
      />
    </div>
  );
};

const StatCard = ({ label, value, icon, colorClass = "" }: any) => (
  <div className="glass p-6 rounded-2xl border border-slate-700/50">
    <div className="flex justify-between items-start mb-4">
      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</span>
      {icon}
    </div>
    <span className={`text-3xl font-bold mono ${colorClass}`}>{value}</span>
  </div>
);

export default StatsDashboard;
