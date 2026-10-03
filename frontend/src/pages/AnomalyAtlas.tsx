import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, AlertTriangle, ExternalLink } from 'lucide-react';

import { useAppContext } from '../context/AppContext';

const AnomalyAtlas = () => {
  const navigate = useNavigate();
  const { history } = useAppContext();
  
  // Sort history by score descending
  const anomalies = [...history].sort((a, b) => b.score - a.score);

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto overflow-y-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-light text-warm-white">ANOMALY ATLAS</h1>
          <p className="text-gray-400 font-mono text-xs mt-1">TOP STATISTICALLY FLAGGED IMAGES</p>
        </div>
        <div className="flex space-x-4">
          <div className="bg-obsidian border border-gray-800 flex items-center px-3 py-1.5 rounded-sm">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input type="text" placeholder="Search ID..." className="bg-transparent border-none text-xs font-mono focus:outline-none w-32" />
          </div>
          <button className="bg-obsidian border border-gray-800 flex items-center px-3 py-1.5 rounded-sm text-xs font-mono text-gray-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4 mr-2" /> FILTER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {anomalies.map((item, idx) => (
          <div key={item.id} className="glass-panel p-4 rounded-sm flex hover:border-science/30 transition-colors">
            <div className="w-48 h-48 shrink-0 bg-black border border-gray-800 relative">
               <img src={item.original_b64} alt={item.name} className="w-full h-full object-cover grayscale opacity-80" />
               <div className="absolute top-2 left-2 bg-rust text-white text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold">
                 RANK #{idx + 1}
               </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-between pl-6 py-2">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-mono text-warm-white tracking-widest">{item.name}</h2>
                  <div className="bg-rust/10 border border-rust/30 px-3 py-1 rounded-sm flex items-center">
                    <AlertTriangle className="w-4 h-4 text-rust mr-2" />
                    <span className="text-rust text-xs font-mono font-bold tracking-widest">{item.score.toFixed(4)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Z-Score</div>
                    <div className="text-sm font-mono text-science">{item.z?.toFixed(2) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Tier</div>
                    <div className="text-sm font-mono text-gray-300 uppercase">{item.tier}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Timestamp</div>
                    <div className="text-xs font-mono text-gray-300">{new Date(item.timestamp).toLocaleTimeString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Flagged</div>
                    <div className="text-sm font-mono text-gray-300">{(item.flagged !== undefined ? item.flagged : item.score >= 0.7421) ? 'YES' : 'NO'}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={() => navigate(`/analysis/${item.id}`)}
                  className="flex items-center px-4 py-2 bg-obsidian border border-gray-700 hover:border-rust hover:text-rust text-gray-400 text-xs font-mono uppercase tracking-widest transition-colors rounded-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  OPEN CASE FILE
                </button>
              </div>
            </div>
          </div>
        ))}
        {anomalies.length === 0 && (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-sm">
            <h3 className="font-mono text-gray-500">NO ANOMALIES LOGGED YET</h3>
            <p className="text-xs text-gray-600 mt-2">Upload images to begin processing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyAtlas;
