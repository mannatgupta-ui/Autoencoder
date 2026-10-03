import React from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Compass, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Overview = () => {
  const { history } = useAppContext();
  
  const totalAnalyzed = history.length;
  const flaggedCount = history.filter(h => h.flagged !== undefined ? h.flagged : h.score >= 0.7421).length;
  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative rounded-lg border border-gray-800 overflow-hidden mb-8 h-96 flex-shrink-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-transparent"></div>
        
        <div className="relative z-10 h-full flex flex-col justify-center p-12 w-2/3">
          <h1 className="text-5xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-warm-white to-gray-400">
            FINDING WHAT DOESN'T BELONG ON MARS.
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-light leading-relaxed border-l-2 border-rust pl-4">
            An unsupervised deep-generative pipeline for discovering anomalous planetary imagery without predefined anomaly labels.
          </p>
          
          <div className="flex space-x-4">
            <Link to="/upload" className="flex items-center px-6 py-3 bg-rust hover:bg-rust-light text-white font-mono text-sm uppercase tracking-wider rounded-sm transition-colors border border-rust-light/50">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload HiRISE Image
            </Link>
            <Link to="/anomaly-atlas" className="flex items-center px-6 py-3 bg-obsidian-light hover:bg-gray-800 text-science font-mono text-sm uppercase tracking-wider rounded-sm transition-colors border border-science/30">
              <Compass className="mr-2 h-4 w-4" />
              Explore Anomaly Atlas
            </Link>
            <Link to="/methodology" className="flex items-center px-6 py-3 bg-obsidian-light hover:bg-gray-800 text-gray-300 font-mono text-sm uppercase tracking-wider rounded-sm transition-colors border border-gray-700">
              <Activity className="mr-2 h-4 w-4" />
              View Pipeline
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'SOURCE OBSERVATIONS', value: '180' },
          { label: 'IMAGES ANALYZED', value: (720 + totalAnalyzed).toString() },
          { label: 'LATENT DIMENSION', value: '256' },
          { label: 'DETECTOR', value: 'Isolation Forest' },
          { label: 'THRESHOLD', value: 'EVT-POT' },
          { label: 'FLAGGED', value: (34 + flaggedCount).toString(), color: 'text-rust' },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-panel p-4 flex flex-col justify-between relative group hover:border-science/30 transition-colors rounded-sm">
            <div className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-2">{kpi.label}</div>
            <div className={`text-2xl font-light ${kpi.color || 'text-warm-white'}`}>{kpi.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
