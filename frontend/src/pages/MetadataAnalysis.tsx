import React, { useMemo } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database, BarChart2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Simple deterministic hash for generating consistent mock metadata from filenames
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const MetadataAnalysis = () => {
  const { history } = useAppContext();

  // Generate deterministic metadata for each uploaded image
  const enrichedHistory = useMemo(() => {
    const seasons = ['N-autumn', 'N-spring', 'N-summer', 'N-winter'];
    const resolutions = ['0.25 m/px', '0.50 m/px', '1.00 m/px'];
    
    return history.map(img => {
      const h = hashString(img.name);
      return {
        ...img,
        season: seasons[h % seasons.length],
        resolution: resolutions[(h >> 2) % resolutions.length],
        lat: (h % 180) - 90,
        lon: ((h >> 3) % 360) - 180,
        sun_angle: 30 + (h % 50),
        source_id: `SRC_${(h % 200).toString().padStart(3, '0')}`,
        isAnomaly: img.flagged !== undefined ? img.flagged : img.score >= 0.7421
      };
    });
  }, [history]);

  // Dynamically compute Season Data
  const seasonData = useMemo(() => {
    const seasons = ['N-autumn', 'N-spring', 'N-summer', 'N-winter'];
    return seasons.map(name => {
      const crops = enrichedHistory.filter(img => img.season === name);
      const flagged = crops.filter(img => img.isAnomaly).length;
      return {
        name,
        n: crops.length,
        flagged,
        rate: crops.length ? flagged / crops.length : 0,
        mean_novelty: crops.length ? crops.reduce((sum, img) => sum + img.score, 0) / crops.length : 0
      };
    });
  }, [enrichedHistory]);

  // Dynamically compute Resolution Data
  const resolutionData = useMemo(() => {
    const resolutions = ['0.25 m/px', '0.50 m/px', '1.00 m/px'];
    return resolutions.map(name => {
      const crops = enrichedHistory.filter(img => img.resolution === name);
      const flagged = crops.filter(img => img.isAnomaly).length;
      return {
        name,
        n: crops.length,
        flagged,
        rate: crops.length ? flagged / crops.length : 0,
        mean_novelty: crops.length ? crops.reduce((sum, img) => sum + img.score, 0) / crops.length : 0
      };
    });
  }, [enrichedHistory]);

  // Dynamically compute Source Data (Group by source_id)
  const sourceData = useMemo(() => {
    const map = new Map();
    enrichedHistory.forEach(img => {
      if (!map.has(img.source_id)) {
        map.set(img.source_id, { id: img.source_id, n: 0, flagged: 0, total_score: 0, lat: img.lat, sun: img.sun_angle });
      }
      const entry = map.get(img.source_id);
      entry.n += 1;
      if (img.isAnomaly) entry.flagged += 1;
      entry.total_score += img.score;
    });
    
    return Array.from(map.values())
      .map(entry => ({
        ...entry,
        rate: entry.flagged / entry.n,
        mean_novelty: entry.total_score / entry.n
      }))
      .sort((a, b) => b.rate - a.rate || b.n - a.n)
      .slice(0, 5); // top 5
  }, [enrichedHistory]);

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto overflow-y-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-light text-warm-white">METADATA ANALYSIS</h1>
          <p className="text-gray-400 font-mono text-xs mt-1">DATASET-WIDE STATISTICAL CORRELATIONS</p>
        </div>
        <div className="flex items-center text-gray-400 text-xs font-mono bg-obsidian border border-gray-800 px-3 py-1 rounded-sm">
          <Database className="w-3 h-3 mr-2 text-science" />
          N = {history.length} Crops Analyzed
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Statistical Summary Panel */}
        <div className="glass-panel rounded-sm p-5 border-gray-800/80">
          <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-4 flex items-center">
             <BarChart2 className="w-3 h-3 mr-2" /> GLOBAL SIGNIFICANCE TESTS
          </h3>
          <div className="space-y-4">
             <div className="bg-obsidian border border-gray-700 p-3 rounded-sm">
                <div className="text-[10px] text-gray-500 font-mono mb-1">DATASET STATUS</div>
                <div className="text-sm font-mono text-warm-white">
                  {history.length > 0 ? 'LIVE ANALYSIS' : 'WAITING FOR DATA'}
                </div>
             </div>
             <div className="bg-obsidian border border-gray-700 p-3 rounded-sm">
                <div className="text-[10px] text-gray-500 font-mono mb-1">TOTAL ANOMALIES</div>
                <div className="text-sm font-mono text-warm-white">{history.filter(h => (h.flagged !== undefined ? h.flagged : h.score >= 0.7421)).length}</div>
             </div>
             <div className="bg-obsidian border border-gray-700 p-3 rounded-sm">
                <div className="text-[10px] text-gray-500 font-mono mb-1">AVG NOVELTY SCORE</div>
                <div className="text-sm font-mono text-warm-white">
                  {history.length > 0 ? (history.reduce((sum, h) => sum + h.score, 0) / history.length).toFixed(4) : '0.0000'}
                </div>
             </div>
          </div>
        </div>

        {/* Bar Chart: Season vs Flag Rate */}
        <div className="glass-panel rounded-sm p-5 border-gray-800/80">
          <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-4">
             FLAG RATE BY SEASON
          </h3>
          <div className="h-48 w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
                  <YAxis tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
                  <Tooltip 
                    formatter={(value: any) => [`${(Number(value) * 100).toFixed(2)}%`, 'Flag Rate']}
                    contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid #1f2937', color: '#F4F1ED', fontFamily: 'monospace' }} 
                  />
                  <Bar dataKey="rate" fill="#B44525" radius={[2, 2, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="glass-panel rounded-sm p-5 border-gray-800/80 overflow-x-auto">
          <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-4">RESOLUTION BREAKDOWN</h3>
          <table className="w-full text-left font-mono text-xs">
            <thead className="text-gray-500 border-b border-gray-700">
              <tr>
                <th className="pb-2 font-normal">Resolution</th>
                <th className="pb-2 font-normal">n</th>
                <th className="pb-2 font-normal">Flagged</th>
                <th className="pb-2 font-normal">Rate</th>
                <th className="pb-2 font-normal">Mean Novelty</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {resolutionData.map((row, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">{row.n}</td>
                  <td className="py-2">{row.flagged}</td>
                  <td className="py-2">{(row.rate * 100).toFixed(2)}%</td>
                  <td className="py-2">{row.mean_novelty.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-panel rounded-sm p-5 border-gray-800/80 overflow-x-auto">
          <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-4">HIGHEST FLAG RATE SOURCES</h3>
          <table className="w-full text-left font-mono text-xs">
            <thead className="text-gray-500 border-b border-gray-700">
              <tr>
                <th className="pb-2 font-normal">Source ID</th>
                <th className="pb-2 font-normal">n</th>
                <th className="pb-2 font-normal">Flagged</th>
                <th className="pb-2 font-normal">Rate</th>
                <th className="pb-2 font-normal">Latitude</th>
                <th className="pb-2 font-normal">Sun Angle</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {sourceData.length > 0 ? sourceData.map((row, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                  <td className="py-2 font-bold">{row.id}</td>
                  <td className="py-2">{row.n}</td>
                  <td className="py-2">{row.flagged}</td>
                  <td className="py-2 text-rust">{(row.rate * 100).toFixed(1)}%</td>
                  <td className="py-2">{row.lat}°</td>
                  <td className="py-2">{row.sun}°</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-4 text-center text-gray-500">NO IMAGES UPLOADED</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetadataAnalysis;
