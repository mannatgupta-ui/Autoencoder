import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, Activity, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useAppContext } from '../context/AppContext';

const Upload = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const { addResults } = useAppContext();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type.startsWith('image/'));
    const fileData = validFiles.map(f => ({
      file: f,
      id: Math.random().toString(36).substring(7),
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      type: f.type.split('/')[1].toUpperCase(),
      status: 'WAITING',
      dimensions: '227x227', 
      previewUrl: URL.createObjectURL(f)
    }));
    setFiles(prev => [...prev, ...fileData]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startAnalysis = async () => {
    if (files.length === 0) return;
    setAnalyzing(true);
    
    // Start fake progress for UI
    const steps = 12;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps) setPipelineStep(currentStep);
    }, 800);
    
    try {
      const formData = new FormData();
      files.forEach(f => {
        formData.append('files', f.file);
      });
      
      const backendUrl = `http://${window.location.hostname}:8000/api/analyze`;
      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      clearInterval(interval);
      setPipelineStep(steps);
      
      if (data.records) {
        addResults(data.records);
      }
      
      setTimeout(() => {
        // Navigate to analysis results
        navigate(`/analysis/result`);
      }, 1000);
      
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setAnalyzing(false);
      alert(`Backend connection failed. Details: ${err.message || err}`);
    }
  };

  const pipelineStages = [
    'IMAGE INGESTION', 'PREPROCESSING & SCALING', 'MULTI-SCALE ENCODER', 'MASKED RECONSTRUCTION',
    'VAE LATENT REPRESENTATION', 'NORMALITY MEMORY BANK', '256-D LATENT VECTOR',
    'ISOLATION FOREST', 'NOVELTY SCORE', 'EVT THRESHOLD CALIBRATION', 'RECONSTRUCTION ANALYSIS',
    'HEATMAP FUSION', 'GEOLOGICAL HYPOTHESIS'
  ];

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto overflow-y-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-light text-warm-white">IMAGE UPLOAD</h1>
          <p className="text-gray-400 font-mono text-xs mt-1">SUPPORTED FORMATS: PNG, JPG/JPEG, WEBP, TIFF</p>
        </div>
        <div className="bg-rust/10 border border-rust/30 px-3 py-1.5 rounded-sm flex items-center">
          <AlertCircle className="w-4 h-4 text-rust mr-2" />
          <span className="text-rust text-xs font-mono">RECOMMENDED INPUT: 227 × 227</span>
        </div>
      </div>

      {!analyzing ? (
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={clsx(
                "border-2 border-dashed rounded-lg p-16 flex flex-col items-center justify-center transition-all h-96 glass-panel",
                isDragging ? "border-science glow-science" : "border-gray-700 hover:border-science/50"
              )}
            >
              <div className="w-20 h-20 rounded-full bg-obsidian border border-gray-800 flex items-center justify-center mb-6">
                <UploadCloud className={clsx("w-10 h-10 transition-colors", isDragging ? "text-science" : "text-gray-500")} />
              </div>
              <h3 className="text-xl font-light text-warm-white mb-2">DROP HI-RISE IMAGE HERE</h3>
              <p className="text-gray-500 font-mono text-sm mb-6">or browse from your computer</p>
              
              <label className="cursor-pointer px-6 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-sm text-sm font-mono transition-colors">
                BROWSE IMAGES
                <input type="file" multiple accept="image/*" className="hidden" onChange={onFileInput} />
              </label>
            </div>
          </div>

          <div className="col-span-1 glass-panel rounded-lg p-6 flex flex-col h-96">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800">
              <h3 className="font-mono text-sm text-gray-400">UPLOAD QUEUE ({files.length})</h3>
              {files.length > 0 && (
                <button onClick={() => setFiles([])} className="text-xs text-gray-500 hover:text-rust transition-colors uppercase font-mono">
                  Clear Queue
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {files.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 font-mono text-xs text-center px-4">
                  Queue is empty. Upload images to begin analysis.
                </div>
              ) : (
                files.map(file => (
                  <div key={file.id} className="bg-obsidian border border-gray-800 p-3 rounded-sm flex items-start group">
                    <img src={file.previewUrl} alt="preview" className="w-12 h-12 object-cover border border-gray-700 mr-3 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{file.name}</p>
                      <div className="flex items-center text-[10px] font-mono text-gray-500 mt-1 space-x-2">
                        <span>{file.dimensions}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span className="text-science">{file.status}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFile(file.id)} className="text-gray-600 hover:text-rust opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
              <button 
                onClick={startAnalysis}
                disabled={files.length === 0}
                className={clsx(
                  "w-full py-3 font-mono text-sm uppercase tracking-wider rounded-sm transition-colors border",
                  files.length === 0 
                    ? "bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed" 
                    : "bg-science/10 text-science border-science/30 hover:bg-science/20"
                )}
              >
                Analyze All
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center mt-12">
          <div className="bg-science/10 border border-science/30 text-science px-4 py-2 font-mono text-sm mb-12 animate-pulse rounded-sm uppercase tracking-widest">
            LIVE BACKEND INFERENCE RUNNING
          </div>
          
          <div className="w-full max-w-3xl">
            {pipelineStages.map((stage, idx) => {
              const isPast = idx < pipelineStep;
              const isCurrent = idx === pipelineStep;
              
              return (
                <div key={stage} className="flex items-center">
                  <div className="w-1/2 text-right pr-6">
                    <span className={clsx(
                      "font-mono text-xs tracking-wider transition-colors",
                      isCurrent ? "text-science font-bold" : isPast ? "text-gray-500" : "text-gray-800"
                    )}>
                      {stage}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={clsx(
                      "w-3 h-3 rounded-full border transition-all duration-300",
                      isCurrent ? "bg-science border-science shadow-[0_0_10px_rgba(0,209,255,0.8)]" : 
                      isPast ? "bg-gray-600 border-gray-600" : "bg-transparent border-gray-800"
                    )}></div>
                    {idx < pipelineStages.length - 1 && (
                      <div className={clsx(
                        "w-px h-6 transition-colors duration-300",
                        isPast ? "bg-gray-600" : "bg-gray-800"
                      )}></div>
                    )}
                  </div>
                  <div className="w-1/2 pl-6">
                    {isCurrent && (
                      <span className="font-mono text-[10px] text-gray-400 flex items-center">
                        <Activity className="w-3 h-3 mr-2 animate-spin text-science" />
                        PROCESSING...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
