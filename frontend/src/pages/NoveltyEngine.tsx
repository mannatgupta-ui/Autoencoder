import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Sliders, AlertTriangle } from 'lucide-react';

const NoveltyEngine = () => {
  const [threshold, setThreshold] = useState(0.74);
  
  // Simulated density data
  const data = Array.from({ length: 100 }).map((_, i) => {
    const score = i / 100;
    // Log-normal looking distribution
    const density = Math.exp(-Math.pow(score - 0.2, 2) / 0.05) * 10 + 
                    Math.exp(-Math.pow(score - 0.8, 2) / 0.02) * 1; 
    return { score, density };
  });

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-warm-white">NOVELTY ENGINE</h1>
        <p className="text-gray-400 font-mono text-xs mt-1">EXTREME VALUE THEORY (EVT) TAIL CALIBRATION</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-panel border border-gray-800 p-5 rounded-sm col-span-2 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">NOVELTY SCORE DISTRIBUTION</h3>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDensity" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="70%" stopColor="#00D1FF" stopOpacity={0.1}/>
                    <stop offset="90%" stopColor="#B44525" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="score" tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
                <Tooltip contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid #1f2937', color: '#F4F1ED', fontFamily: 'monospace' }} />
                <ReferenceLine x={threshold} stroke="#B44525" strokeDasharray="3 3" label={{ position: 'top', value: 'EVT THRESHOLD', fill: '#B44525', fontSize: 10, fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="density" stroke="#4b5563" fillOpacity={1} fill="url(#colorDensity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-panel border border-gray-800 p-5 rounded-sm">
            <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-4 flex items-center">
              <Sliders className="w-3 h-3 mr-2" /> THRESHOLD SENSITIVITY
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-gray-300 mb-2">
                  <span>Simulated EVT Threshold</span>
                  <span className="text-rust">{threshold.toFixed(2)}</span>
                </div>
                <input type="range" min="0.5" max="0.95" step="0.01" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rust" />
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-gray-500">FLAGGED IMAGES</span>
                <span className="font-mono text-sm text-warm-white">{Math.floor((1 - threshold) * 100)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-gray-500">TAIL PROBABILITY</span>
                <span className="font-mono text-sm text-science">{(1 - threshold).toFixed(4)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-rust/5 border border-rust/20 p-4 rounded-sm">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-rust mr-3 shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-gray-400 leading-relaxed">
                The anomaly boundary is derived dynamically from the observed novelty-score tail using a Generalized Pareto Distribution (GPD) rather than an arbitrary fixed percentage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoveltyEngine;
