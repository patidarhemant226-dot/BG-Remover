import React from 'react';
import { Cpu, ScanLine, Brain, Scissors, CheckCircle2 } from 'lucide-react';

const STEP_ICONS = [ScanLine, Brain, Scissors, CheckCircle2];

export default function ProgressBar({ progress, stepIdx, steps }) {
  return (
    <div className="flex flex-col items-center gap-10 py-10 px-4">
      {/* Liquid progress bar */}
      <div className="w-full max-w-xl">
        <div className="flex justify-between items-end mb-4 px-2">
           <div>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Extraction</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {progress === 0 ? 'Initializing AI Engine…' : (steps[stepIdx]?.label || 'Analyzing…')}
             </p>
           </div>
           <p className="text-3xl font-black text-blue-600 tracking-tighter">{progress}%</p>
        </div>

        <div className="neu-concave p-2 h-10 overflow-hidden">
          <div
            className="h-full rounded-[1rem] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) relative overflow-hidden"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--primary))',
              backgroundSize: '200% 100%',
              animation: 'liquid-flow 3s linear infinite',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
          </div>
        </div>
      </div>

      {/* Steps Visual */}
      <div className="flex items-center gap-3 md:gap-6 flex-wrap justify-center bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[i];
          const done = i < stepIdx;
          const active = i === stepIdx;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all duration-500 ${
                active ? 'bg-white shadow-md scale-105 border border-slate-100' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                <Icon size={16} />
              </div>
              <span className={`text-[11px] font-black uppercase tracking-widest ${
                active ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {step.label.split('…')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
