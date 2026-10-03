import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Overview from './pages/Overview';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Placeholder from './pages/Placeholder';
import ImageryExplorer from './pages/ImageryExplorer';
import ReconstructionLab from './pages/ReconstructionLab';
import MetadataAnalysis from './pages/MetadataAnalysis';
import ModelEvolution from './pages/ModelEvolution';
import AnomalyAtlas from './pages/AnomalyAtlas';
import Methodology from './pages/Methodology';
import LatentSpace from './pages/LatentSpace';
import NoveltyEngine from './pages/NoveltyEngine';
import Results from './pages/Results';
import { AppProvider } from './context/AppContext';


function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex h-screen bg-transparent text-warm-white font-sans overflow-hidden">
        {/* Persistent Left Sidebar */}
        <Sidebar />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Navigation */}
          <Topbar />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-transparent relative bg-grid-pattern bg-grid">
            <div className="absolute inset-0 bg-gradient-to-b from-obsidian-light/50 to-obsidian/90 pointer-events-none"></div>
            <div className="relative z-10 h-full">
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/analysis/:id" element={<Analysis />} />
                <Route path="/explorer" element={<ImageryExplorer />} />
                <Route path="/latent-space" element={<LatentSpace />} />
                <Route path="/novelty-engine" element={<NoveltyEngine />} />
                <Route path="/anomaly-atlas" element={<AnomalyAtlas />} />
                <Route path="/reconstruction-lab" element={<ReconstructionLab />} />
                <Route path="/metadata-analysis" element={<MetadataAnalysis />} />
                <Route path="/model-evolution" element={<ModelEvolution />} />
                <Route path="/methodology" element={<Methodology />} />
                <Route path="/results" element={<Results />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      </Router>
    </AppProvider>
  );
}

export default App;
