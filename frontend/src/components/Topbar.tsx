import React from 'react';

const Topbar = () => {
  return (
    <div className="h-16 glass-panel border-b flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center space-x-2 font-mono tracking-widest text-sm">
        <span className="text-warm-white font-semibold">HI-RISE</span>
        <span className="text-rust">//</span>
        <span className="text-science">ANOMALY INTELLIGENCE</span>
      </div>
      
      <div className="flex items-center space-x-6 text-xs font-mono text-gray-400">
        <div className="flex flex-col items-end">
          <span className="text-warm-white font-bold tracking-wider">NSSC 2026</span>
          <span>Pipeline Status: <span className="text-science">NOMINAL</span></span>
        </div>
        <div className="h-8 w-px bg-gray-800"></div>
        <div className="flex flex-col">
          <span>Model: <span className="text-warm-white">Geo-Masked Memory VAE</span></span>
          <span>Detector: <span className="text-warm-white">Isolation Forest</span></span>
          <span>Threshold: <span className="text-warm-white">EVT-POT</span></span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
