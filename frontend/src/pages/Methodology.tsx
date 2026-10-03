import React from 'react';
import { ArrowDown, Database, Cpu, Eye, Activity, ShieldAlert, BookOpen } from 'lucide-react';

const Methodology = () => {
  const steps = [
    { icon: Database, name: 'DATA & PREPROCESSING', desc: 'HiRISE source imagery split into 227x227 crops, standardized and normalized.' },
    { icon: Cpu, name: 'MULTI-SCALE ENCODER', desc: 'Convolutional architecture extracting features at multiple spatial resolutions.' },
    { icon: Eye, name: 'MASKED MEMORY VAE', desc: 'Input masking combined with a sparse memory bank to enforce normal-pattern reconstruction.' },
    { icon: Activity, name: '256-D LATENT SPACE', desc: 'Dense representation vector capturing fundamental geological structures.' },
    { icon: ShieldAlert, name: 'STATISTICAL NOVELTY ENGINE', desc: 'Isolation Forest scoring followed by Extreme Value Theory (EVT) threshold calibration.' },
    { icon: BookOpen, name: 'HEATMAP & INTERPRETATION', desc: 'Fused structural, pixel, and gradient error maps to isolate local anomalies.' }
  ];

  return (
    <div className="h-full flex flex-col items-center justify-start p-8 overflow-y-auto">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-light text-warm-white text-center mb-2">RESEARCH METHODOLOGY</h1>
        <p className="text-gray-400 font-mono text-sm text-center mb-12">DEEP-GENERATIVE UNSUPERVISED PIPELINE ARCHITECTURE</p>
        
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-800 -translate-x-1/2 z-0"></div>
          
          <div className="space-y-12 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className={`flex items-center w-full ${isEven ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-1/2 ${isEven ? 'pl-12' : 'pr-12 text-right'}`}>
                    <div className="bg-panel border border-gray-700 p-6 rounded-sm shadow-xl hover:border-science transition-colors cursor-pointer group">
                      <h3 className="text-sm font-mono text-warm-white tracking-widest uppercase mb-2 group-hover:text-science">{step.name}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  
                  <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-obsidian border-2 border-gray-700 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="w-1/2"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Methodology;
