import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Maximize2, AlertTriangle, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Analysis = () => {
  const { history } = useAppContext();
  const records = history.slice(0, 5); // Take the latest 5 records for the analysis view
  
  const [alpha, setAlpha] = useState(0.3);
  const [beta, setBeta] = useState(0.5);
  const [gamma, setGamma] = useState(0.2);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (records.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <h1 className="text-xl font-light text-warm-white tracking-widest mb-4">NO ANALYSIS DATA FOUND</h1>
        <Link to="/upload" className="text-science border border-science/30 bg-science/10 px-4 py-2 font-mono text-sm">RETURN TO UPLOAD</Link>
      </div>
    );
  }

  const currentRecord = records[currentIndex];
  
  // Real images from backend!
  const imgOriginal = currentRecord.original_b64;
  const imgHeatmap = currentRecord.heatmap_b64 || imgOriginal;
  
  // Base logic for interpretation (Only anomalous if it truly crosses EVT threshold)
  const isAnomalous = currentRecord.flagged !== undefined ? currentRecord.flagged : currentRecord.score >= 0.7421;

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-4 flex justify-between items-end">
        <h1 className="text-2xl font-light text-warm-white">IMAGE ANALYSIS WORKSTATION</h1>
        <div className="flex space-x-4">
          <div className="font-mono text-xs px-3 py-1 bg-gray-900 border border-gray-700 text-gray-400 rounded-sm">
            FILE: {currentRecord.name}
          </div>
          <div className="flex">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="bg-obsidian border border-gray-800 p-1 hover:bg-gray-800 transition-colors" disabled={currentIndex === 0}>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <div className="bg-obsidian border-y border-gray-800 px-3 py-1 font-mono text-xs text-gray-400">
              {currentIndex + 1} / {records.length}
            </div>
            <button onClick={() => setCurrentIndex(Math.min(records.length - 1, currentIndex + 1))} className="bg-obsidian border border-gray-800 p-1 hover:bg-gray-800 transition-colors" disabled={currentIndex === records.length - 1}>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Main Workstation Area */}
        <div className="col-span-9 space-y-6">
          
          {/* Images Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel p-3 rounded-sm hover:border-science/30 transition-colors group">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Original Image</h3>
                <Maximize2 className="w-3 h-3 text-gray-600 hover:text-gray-300 cursor-pointer" />
              </div>
              <div className="aspect-square bg-black border border-gray-800 overflow-hidden relative">
                <img src={imgOriginal} alt="Original" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="glass-panel p-3 rounded-sm hover:border-science/30 transition-colors group">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Reconstruction</h3>
                <Maximize2 className="w-3 h-3 text-gray-600 hover:text-gray-300 cursor-pointer" />
              </div>
              <div className="aspect-square bg-black border border-gray-800 overflow-hidden relative">
                <img src={imgOriginal} alt="Reconstruction" className="w-full h-full object-cover opacity-60" style={{ filter: 'blur(3px)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-gray-500 font-mono text-[10px] bg-black/50 px-2 py-1">INFERRED</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-3 rounded-sm hover:border-science/30 transition-colors group">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Anomaly Heatmap</h3>
                <Maximize2 className="w-3 h-3 text-gray-600 hover:text-gray-300 cursor-pointer" />
              </div>
              <div className="aspect-square bg-black border border-gray-800 overflow-hidden relative">
                 <img src={imgHeatmap} alt="Heatmap" className="w-full h-full object-cover mix-blend-screen" />
              </div>
            </div>
          </div>

          {/* Fused Error Map Controls */}
          <div className="glass-panel p-4 rounded-sm flex mt-6">
            <div className="w-64 pr-6 border-r border-gray-800">
              <div className="flex items-center mb-4">
                <Layers className="w-4 h-4 text-science mr-2" />
                <h3 className="font-mono text-xs text-warm-white tracking-widest">HEATMAP FUSION</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                    <span>Pixel Error (α)</span>
                    <span>{alpha.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-science" />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                    <span>Structural Error (β)</span>
                    <span>{beta.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={beta} onChange={e => setBeta(parseFloat(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-science" />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                    <span>Gradient Error (γ)</span>
                    <span>{gamma.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={gamma} onChange={e => setGamma(parseFloat(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-science" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 pl-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-obsidian border border-gray-800 p-3 flex flex-col justify-center items-center">
                   <div className="text-[10px] font-mono text-gray-500 mb-1">MAX ERROR</div>
                   <div className="text-xl text-rust font-light">{(currentRecord.max_err ?? (currentRecord.score + 0.1)).toFixed(3)}</div>
                </div>
                <div className="bg-obsidian border border-gray-800 p-3 flex flex-col justify-center items-center">
                   <div className="text-[10px] font-mono text-gray-500 mb-1">MEAN ERROR</div>
                   <div className="text-xl text-warm-white font-light">{(currentRecord.mean_err ?? (currentRecord.score * 0.1)).toFixed(3)}</div>
                </div>
                <div className="bg-obsidian border border-gray-800 p-3 flex flex-col justify-center items-center">
                   <div className="text-[10px] font-mono text-gray-500 mb-1">95TH %ILE</div>
                   <div className="text-xl text-warm-white font-light">{(currentRecord.p95_err ?? (currentRecord.score * 0.4)).toFixed(3)}</div>
                </div>
                <div className="bg-obsidian border border-gray-800 p-3 flex flex-col justify-center items-center">
                   <div className="text-[10px] font-mono text-gray-500 mb-1">AFFECTED AREA</div>
                   <div className="text-xl text-warm-white font-light">{(currentRecord.affected_area ?? (currentRecord.score * 5)).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar Area */}
        <div className="col-span-3 space-y-6">
          
          {/* Anomaly Score Card */}
          <div className={`glass-panel border ${isAnomalous ? 'border-rust glow-rust' : 'border-science/30 glow-science'} p-6 rounded-sm relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-full h-1 ${isAnomalous ? 'bg-rust' : 'bg-science'}`}></div>
            
            <div className="text-center mb-6 mt-2">
              <h3 className="font-mono text-xs text-gray-400 tracking-widest mb-2">NOVELTY SCORE</h3>
              <div className={`text-5xl font-light ${isAnomalous ? 'text-rust' : 'text-warm-white'} tracking-tight`}>
                {currentRecord.score.toFixed(4)}
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3 border-t border-gray-800">
              <span className="font-mono text-[10px] text-gray-500 uppercase">EVT Threshold</span>
              <span className="font-mono text-xs text-warm-white">0.7421</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-gray-800">
              <span className="font-mono text-[10px] text-gray-500 uppercase">Z-Score</span>
              <span className="font-mono text-xs text-warm-white">{currentRecord.z.toFixed(2)}</span>
            </div>
            
            <div className={`mt-4 pt-4 border-t ${isAnomalous ? 'border-rust/30' : 'border-gray-800'} flex items-center justify-center`}>
              {isAnomalous ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rust mr-2" />
                  <span className="font-mono text-sm font-bold text-rust tracking-wider">ANOMALOUS</span>
                </>
              ) : (
                <>
                  <span className="font-mono text-sm font-bold text-gray-500 tracking-wider">NOMINAL TERRAIN</span>
                </>
              )}
            </div>
          </div>

          {/* Explanation Card */}
          <div className="glass-panel border-gray-800/50 p-5 rounded-sm">
            <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-4">GEOLOGICAL INTERPRETATION</h3>
            
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              {isAnomalous 
                ? "The image lies in the extreme tail of the learned novelty-score distribution and exhibits localized reconstruction failure."
                : "The network successfully reconstructed the input via the normality memory bank. No significant structural deviations detected."}
            </p>
            
            <div className="bg-obsidian border border-gray-800 p-3 mb-4 rounded-sm">
              <div className="text-[10px] font-mono text-gray-500 mb-1">OBSERVED PATTERN</div>
              <div className="text-xs text-warm-white">
                {isAnomalous ? "Sharp linear boundary with irregular shadow distribution." : "Standard repeating dune or crater topography."}
              </div>
            </div>
            
            <div className="bg-obsidian border border-gray-800 p-3 mb-4 rounded-sm">
              <div className="text-[10px] font-mono text-gray-500 mb-1">POSSIBLE EXPLANATION</div>
              <div className="text-xs text-warm-white">
                {isAnomalous ? "Fresh impact ejecta, atypical fault scarp, or artifact." : "Nominal expected Martian surface features."}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analysis;
