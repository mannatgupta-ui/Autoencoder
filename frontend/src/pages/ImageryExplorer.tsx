import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List as ListIcon, Maximize } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ImageryExplorer = () => {
  const { history } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto overflow-y-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-light text-warm-white">IMAGERY EXPLORER</h1>
          <p className="text-gray-400 font-mono text-xs mt-1">BROWSE SOURCE MARTIAN OBSERVATIONS</p>
        </div>
        <div className="flex space-x-4">
          <div className="bg-obsidian border border-gray-800 flex items-center px-3 py-1.5 rounded-sm">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input type="text" placeholder="Search Observation ID..." className="bg-transparent border-none text-xs font-mono focus:outline-none w-48" />
          </div>
          <div className="flex bg-obsidian border border-gray-800 rounded-sm">
            <button className="px-3 py-1.5 border-r border-gray-800 text-science bg-science/10 hover:text-white transition-colors"><Grid className="w-4 h-4" /></button>
            <button className="px-3 py-1.5 text-gray-500 hover:text-white transition-colors"><ListIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {history.map((img) => (
          <div key={img.id} className="glass-panel rounded-sm overflow-hidden group hover:border-science/30 transition-colors">
            <div className="aspect-square bg-black relative overflow-hidden">
               <img src={img.original_b64} alt={img.name} className="w-full h-full object-cover grayscale opacity-70 group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <button 
                    onClick={() => navigate('/analysis/result')}
                    className="flex items-center text-xs font-mono text-white tracking-widest hover:text-science transition-colors"
                  >
                    <Maximize className="w-3 h-3 mr-2" /> VIEW ANALYSIS
                  </button>
               </div>
            </div>
            <div className="p-4">
               <h3 className="font-mono text-sm text-warm-white tracking-widest mb-3 truncate" title={img.name}>{img.name}</h3>
               <div className="space-y-1">
                 <div className="flex justify-between text-[10px] font-mono"><span className="text-gray-500">Tier</span><span className="text-gray-400 uppercase">{img.tier}</span></div>
                 <div className="flex justify-between text-[10px] font-mono"><span className="text-gray-500">Score</span><span className="text-gray-400">{img.score.toFixed(4)}</span></div>
                 <div className="flex justify-between text-[10px] font-mono"><span className="text-gray-500">Status</span><span className={img.stands_out ? "text-rust" : "text-science"}>{img.stands_out ? 'ANOMALOUS' : 'NOMINAL'}</span></div>
               </div>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="col-span-4 text-center py-20 border border-dashed border-gray-800 rounded-sm">
            <h3 className="font-mono text-gray-500">NO IMAGERY LOGGED YET</h3>
            <p className="text-xs text-gray-600 mt-2">Upload images to begin tracking observations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageryExplorer;
