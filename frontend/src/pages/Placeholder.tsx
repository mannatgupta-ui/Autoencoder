import React from 'react';
import { Code, Construction } from 'lucide-react';

const Placeholder = ({ title }: { title: string }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-24 h-24 mb-6 rounded-full border border-gray-800 bg-panel flex items-center justify-center">
        <Construction className="w-10 h-10 text-gray-600" />
      </div>
      <h1 className="text-3xl font-light text-warm-white tracking-widest uppercase mb-4">{title}</h1>
      <p className="text-gray-500 font-mono text-sm max-w-lg text-center">
        This module is currently under development for the NSSC 2026 prototype. 
        Backend integration pending.
      </p>
      
      <div className="mt-12 p-4 bg-obsidian-light border border-gray-800 rounded-sm font-mono text-xs text-gray-600 flex items-start">
        <Code className="w-4 h-4 mr-3 shrink-0 mt-0.5" />
        <div>
          <div>// TODO:</div>
          <div>- Connect /services/inferenceService</div>
          <div>- Fetch mock data payload</div>
          <div>- Implement D3/Recharts visualizations</div>
        </div>
      </div>
    </div>
  );
};

export default Placeholder;
