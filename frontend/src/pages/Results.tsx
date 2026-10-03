import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Results = () => {
  const modelData = [
    { name: 'V1 (CNN+MSE)', reconError: 0.120, auc: 0.65 },
    { name: 'V2 (SSIM)', reconError: 0.080, auc: 0.72 },
    { name: 'V3 (VAE+Mem)', reconError: 0.045, auc: 0.86 },
    { name: 'V4 (EVT)', reconError: 0.042, auc: 0.94 },
  ];

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-warm-white">RESEARCH RESULTS</h1>
        <p className="text-gray-400 font-mono text-xs mt-1">MODEL EVOLUTION PERFORMANCE COMPARISON</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-panel border border-gray-800 p-5 rounded-sm h-80 flex flex-col">
           <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-4">SEPARABILITY (PROXY AUROC)</h3>
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
                  <YAxis domain={[0, 1]} tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
                  <Tooltip cursor={{ fill: '#1f2937', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid #1f2937', color: '#F4F1ED', fontFamily: 'monospace' }} />
                  <Bar dataKey="auc" fill="#00D1FF" name="AUROC" radius={[2, 2, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
        
        <div className="bg-panel border border-gray-800 p-5 rounded-sm h-80 flex flex-col">
           <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-4">RECONSTRUCTION ERROR</h3>
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
                  <Tooltip cursor={{ fill: '#1f2937', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid #1f2937', color: '#F4F1ED', fontFamily: 'monospace' }} />
                  <Bar dataKey="reconError" fill="#B44525" name="Error Rate" radius={[2, 2, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
      
      <div className="bg-panel border border-gray-800 p-5 rounded-sm">
        <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-4">CONTRIBUTIONS</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-obsidian border border-gray-700 p-4 rounded-sm">
            <h4 className="text-xs font-mono text-warm-white mb-2">Masked Learning</h4>
            <p className="text-[10px] text-gray-400">Forces network to infer structures from context.</p>
          </div>
          <div className="bg-obsidian border border-gray-700 p-4 rounded-sm">
            <h4 className="text-xs font-mono text-warm-white mb-2">Memory Bank</h4>
            <p className="text-[10px] text-gray-400">Hard-limits reconstruction to normal planetary topologies.</p>
          </div>
          <div className="bg-obsidian border border-gray-700 p-4 rounded-sm">
            <h4 className="text-xs font-mono text-warm-white mb-2">EVT Threshold</h4>
            <p className="text-[10px] text-gray-400">Statistically derived boundary replacing heuristics.</p>
          </div>
          <div className="bg-obsidian border border-gray-700 p-4 rounded-sm">
            <h4 className="text-xs font-mono text-warm-white mb-2">Fused Heatmaps</h4>
            <p className="text-[10px] text-gray-400">Isolates structural deviances directly in pixel space.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
