import React from 'react';
import { History, ArrowRight } from 'lucide-react';

const ModelEvolution = () => {
  const versions = [
    {
      version: 'V1', name: 'Baseline CNN Autoencoder',
      problem: 'High reconstruction error on standard geological textures. Blurred outputs.',
      modification: 'Implemented standard Convolutional Autoencoder with simple Mean Squared Error (MSE).',
      result: 'Failed to reconstruct sharp edges; anomalies were hidden within general blur.'
    },
    {
      version: 'V2', name: 'Structural Reconstruction',
      problem: 'MSE alone failed to penalize structural deviances.',
      modification: 'Integrated Structural Similarity Index (SSIM) and L1 Gradient Loss into the objective function.',
      result: 'Much sharper reconstructions. Anomalies localized better, but model generalized too well to anomalies.'
    },
    {
      version: 'V3', name: 'Masked Memory VAE',
      problem: 'Model could perfectly reconstruct true anomalies (identity mapping).',
      modification: 'Added variational bottleneck (VAE), input masking (MAE), and a sparse normality Memory Bank (MemAE).',
      result: 'Model is now forced to reconstruct anomalies as normal terrain, causing massive, easily detectable error spikes.'
    },
    {
      version: 'V4', name: 'Statistical Novelty Engine',
      problem: 'Heuristic thresholds flagged too many false positives.',
      modification: 'Replaced simple MSE thresholds with an Isolation Forest mapped via Extreme Value Theory (EVT-POT).',
      result: 'Statistically rigorous anomaly boundary. Dramatically improved precision.'
    }
  ];

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-warm-white">MODEL EVOLUTION</h1>
        <p className="text-gray-400 font-mono text-xs mt-1">ITERATIVE ARCHITECTURE DEVELOPMENT</p>
      </div>

      <div className="space-y-6">
        {versions.map((v) => (
          <div key={v.version} className="bg-panel border border-gray-800 p-6 rounded-sm flex">
            <div className="w-32 shrink-0 border-r border-gray-800 pr-6 mr-6 flex flex-col items-end justify-center">
              <span className="text-4xl font-light text-warm-white">{v.version}</span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-2">{v.name}</span>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-6">
              <div>
                <h4 className="text-[10px] font-mono text-gray-500 mb-2 uppercase tracking-widest">Problem</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{v.problem}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-mono text-science mb-2 uppercase tracking-widest">Modification</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{v.modification}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-mono text-rust mb-2 uppercase tracking-widest">Observed Result</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{v.result}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelEvolution;
