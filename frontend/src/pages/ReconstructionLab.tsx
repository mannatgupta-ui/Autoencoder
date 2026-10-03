import React, { useState } from 'react';
import { Layers, Image as ImageIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ReconstructionLab = () => {
  const { history } = useAppContext();
  const [selectedId, setSelectedId] = useState<string>(history.length > 0 ? history[0].id : '');
  
  const selectedRecord = history.find(h => h.id === selectedId) || history[0];
  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-warm-white">RECONSTRUCTION LAB</h1>
        <p className="text-gray-400 font-mono text-xs mt-1">BATCH DECODER VISUALIZATION</p>
      </div>

      <div className="glass-panel rounded-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-mono text-xs text-gray-400 tracking-widest">LAYER BY LAYER DECODING</h3>
          <select 
            className="bg-obsidian border border-gray-700 text-xs font-mono px-3 py-1.5 text-gray-300 outline-none"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
             {history.length > 0 ? (
               history.map(h => <option key={h.id} value={h.id}>{h.name} [{h.tier}]</option>)
             ) : (
               <option value="">NO DATA AVAILABLE</option>
             )}
          </select>
        </div>
        
        <div className="grid grid-cols-6 gap-4">
           {['INPUT (227x227)', 'ENC BLOCK 1', 'ENC BLOCK 3', 'LATENT (256-D)', 'DEC BLOCK 2', 'RECON (227x227)'].map((label, idx) => (
             <div key={idx} className="flex flex-col items-center">
               <div className="w-full aspect-square bg-black border border-gray-700 mb-3 flex items-center justify-center relative overflow-hidden">
                 {idx === 3 ? (
                   <div className="grid grid-cols-16 grid-rows-16 w-full h-full p-1 gap-[1px]">
                     {Array.from({length: 256}).map((_, i) => (
                       <div key={i} className="bg-science/40" style={{ opacity: selectedRecord ? Math.random() : 0 }}></div>
                     ))}
                   </div>
                 ) : (
                   <img src={selectedRecord ? selectedRecord.original_b64 : 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=200&q=80'} className="w-full h-full object-cover grayscale opacity-70" style={{ filter: `blur(${Math.abs(3 - idx) * 2}px)` }} alt="Feature Map" />
                 )}
               </div>
               <div className="text-[10px] font-mono text-gray-500 tracking-widest text-center">{label}</div>
             </div>
           ))}
        </div>
      </div>
      
      <div className="glass-panel rounded-sm p-6">
         <h3 className="font-mono text-xs text-gray-400 tracking-widest mb-6">LATENT INTERPOLATION</h3>
         <div className="flex items-center space-x-2">
            <div className="w-24 aspect-square bg-black border border-gray-700 flex-shrink-0">
               <img src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=200&q=80" className="w-full h-full object-cover grayscale opacity-80" alt="Start" />
            </div>
            
            <div className="flex-1 flex justify-between px-4">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="w-16 aspect-square bg-black border border-gray-800">
                  <img src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=200&q=80" className="w-full h-full object-cover grayscale opacity-60" style={{ filter: `blur(${Math.abs(2.5 - i) * 1.5}px)` }} alt="Interpolation" />
                </div>
              ))}
            </div>
            
            <div className="w-24 aspect-square bg-black border border-rust flex-shrink-0">
               <img src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=200&q=80" className="w-full h-full object-cover grayscale opacity-80" alt="End" />
            </div>
         </div>
         <div className="flex justify-between mt-4">
            <span className="text-[10px] font-mono text-gray-500">NORMAL VECTOR</span>
            <span className="text-[10px] font-mono text-rust">ANOMALOUS VECTOR</span>
         </div>
      </div>
    </div>
  );
};

export default ReconstructionLab;
