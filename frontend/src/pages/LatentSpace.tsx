import React from 'react';
import { ScatterChart as RechartsScatter, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LatentSpace = () => {
  const { history } = useAppContext();
  
  // Use real data if available, otherwise generate some mock data for empty state
  const data = history.length > 0 
    ? history.map((img, i) => ({
        id: img.id,
        name: img.name,
        // Since we don't have a real 2D UMAP projection from the backend, we use z and score as proxy coordinates
        x: img.z * 10 + (Math.random() * 2), 
        y: img.score * 100 + (Math.random() * 10),
        score: img.score,
        isAnomaly: img.flagged !== undefined ? img.flagged : img.score >= 0.7421
      }))
    : [];

  const normalData = data.filter(d => !d.isAnomaly);
  const anomalyData = data.filter(d => d.isAnomaly);

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto overflow-y-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-light text-warm-white">LATENT SPACE LAB</h1>
          <p className="text-gray-400 font-mono text-xs mt-1">2D UMAP PROJECTION OF 256-D EMBEDDINGS</p>
        </div>
        <div className="flex items-center text-rust text-xs font-mono bg-rust/10 border border-rust/30 px-3 py-1 rounded-sm">
          <Info className="w-3 h-3 mr-2" />
          Qualitative diagnostic only
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-sm p-4 relative flex flex-col min-h-[500px] hover:border-science/30 transition-colors">
        <div className="absolute top-6 left-6 z-10 flex flex-col space-y-2">
          <div className="bg-obsidian border border-gray-700 p-2 text-[10px] font-mono text-gray-300 rounded-sm flex items-center">
            <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
            Normal Distribution
          </div>
          <div className="bg-obsidian border border-gray-700 p-2 text-[10px] font-mono text-gray-300 rounded-sm flex items-center">
            <div className="w-2 h-2 rounded-full bg-rust mr-2 animate-pulse"></div>
            Flagged Anomalies
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <RechartsScatter margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" dataKey="x" name="UMAP 1" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: '#374151' }} />
            <YAxis type="number" dataKey="y" name="UMAP 2" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: '#374151' }} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid #1f2937', color: '#F4F1ED', fontFamily: 'monospace', fontSize: '10px' }}
            />
            <Scatter name="Normal" data={normalData} fill="#6b7280" opacity={0.6} />
            <Scatter name="Anomalies" data={anomalyData} fill="#B44525" />
          </RechartsScatter>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LatentSpace;
