
import React, { useEffect, useState } from 'react';
import { DetectionResult, DetectionLabel } from '../types';
import { getForensicAnalysis } from '../services/geminiService';
import { CheckCircle2, AlertTriangle, Eye, ShieldCheck, Zap } from 'lucide-react';

interface ComparisonViewProps {
  result: DetectionResult;
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ result, onClose }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalysis = async () => {
      const report = await getForensicAnalysis(result.imageUrl, result.label, result.confidence);
      setAnalysis(report);
      setLoading(false);
    };
    loadAnalysis();
  }, [result]);

  const isFake = result.label === DetectionLabel.FAKE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative glass w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900/95 z-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Forensic Report: <span className="mono text-slate-400 text-sm font-normal">{result.filename}</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Visual Analysis Section */}
          <div className="space-y-6">
            <div className="relative group overflow-hidden rounded-2xl border border-slate-700 aspect-square bg-slate-800">
              <img 
                src={result.imageUrl} 
                className="w-full h-full object-contain" 
                alt="Source"
              />
              {/* Overlay simulation of detection hotspots */}
              {isFake && (
                <div className="absolute inset-0 pointer-events-none opacity-40 animate-pulse">
                  <div className="absolute top-1/4 left-1/3 w-20 h-20 border-2 border-rose-500 rounded-full" />
                  <div className="absolute top-1/2 right-1/4 w-32 h-32 border-2 border-rose-500 rounded-full" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
                 <Eye className="w-4 h-4 text-blue-400" />
                 <span className="text-xs font-semibold uppercase tracking-wider">Source Analysis Visualization</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-500 text-xs mb-1 uppercase font-bold tracking-widest">Global Conf.</p>
                <p className="text-2xl font-bold mono">{(result.confidence * 100).toFixed(2)}%</p>
              </div>
              <div className={`p-4 rounded-xl border ${isFake ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                <p className="text-xs mb-1 uppercase font-bold tracking-widest">Final Status</p>
                <div className="flex items-center gap-2">
                  {isFake ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  <p className="text-2xl font-black uppercase italic">{result.label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Forensic Reasoning */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <h3 className="text-xl font-bold">Neural Engine Reasoning</h3>
            </div>

            <div className="flex-1 space-y-8">
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Model Findings</h4>
                <ul className="space-y-3">
                  {result.anomalies?.length ? result.anomalies.map((a, i) => (
                    <li key={i} className="flex gap-3 text-slate-300 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span className="text-sm">{a}</span>
                    </li>
                  )) : (
                    <li className="flex gap-3 text-emerald-400 items-center">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">No structural anomalies detected in pixel hierarchy.</span>
                    </li>
                  )}
                </ul>
              </section>

              <section className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl relative">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  AI Forensic Summary (Powered by Gemini)
                </h4>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-xs text-slate-500 italic">Synthesizing forensic findings...</p>
                  </div>
                ) : (
                  <p className="text-slate-300 leading-relaxed italic text-sm">
                    "{analysis}"
                  </p>
                )}
                <div className="absolute -bottom-3 -right-3">
                  <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded text-[10px] font-mono text-slate-500">
                    PROCESS: LLM_FORENSICS_v2
                  </div>
                </div>
              </section>

              <div className="mt-auto pt-6 border-t border-slate-800 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                AI-Buster - Confidential Diagnostic Tool
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default ComparisonView;
