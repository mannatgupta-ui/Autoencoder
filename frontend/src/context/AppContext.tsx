import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AnalysisRecord {
  id: string;
  rank: number;
  tier: string;
  name: string;
  score: number;
  score_norm: number;
  z: number;
  stands_out: boolean;
  flagged?: boolean;
  max_err?: number;
  mean_err?: number;
  p95_err?: number;
  affected_area?: number;
  original_b64: string;
  heatmap_b64: string;
  timestamp: string;
}

export interface AppState {
  history: AnalysisRecord[];
  addResults: (results: any[]) => void;
  clearHistory: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<AnalysisRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mars_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load history', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('mars_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history (possibly too large)', e);
    }
  }, [history]);

  const addResults = (results: any[]) => {
    const newRecords = results.map(r => ({
      ...r,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    }));
    setHistory(prev => [...newRecords, ...prev].slice(0, 100)); // keep last 100
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('mars_history');
  };

  return (
    <AppContext.Provider value={{ history, addResults, clearHistory }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

