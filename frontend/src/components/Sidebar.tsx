import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Rocket, UploadCloud, Map, ScatterChart, 
  Settings, BookOpen, Layers, BarChart2, 
  History, FileText, CheckCircle, Activity 
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Overview', path: '/overview', icon: Rocket },
  { name: 'Image Upload', path: '/upload', icon: UploadCloud },
  { name: 'Analysis Workstation', path: '/analysis/result', icon: Activity },
  { name: 'Imagery Explorer', path: '/explorer', icon: Map },
  { name: 'Latent Space', path: '/latent-space', icon: ScatterChart },
  { name: 'Novelty Engine', path: '/novelty-engine', icon: Settings },
  { name: 'Anomaly Atlas', path: '/anomaly-atlas', icon: BookOpen },
  { name: 'Reconstruction Lab', path: '/reconstruction-lab', icon: Layers },
  { name: 'Metadata Analysis', path: '/metadata-analysis', icon: BarChart2 },
  { name: 'Model Evolution', path: '/model-evolution', icon: History },
  { name: 'Methodology', path: '/methodology', icon: FileText },
  { name: 'Results', path: '/results', icon: CheckCircle },
];

const Sidebar = () => {
  return (
    <div className="w-64 h-full glass-panel flex flex-col justify-between z-40 relative">
      <div>
        <div className="p-6">
          <h2 className="text-xs font-mono text-gray-500 tracking-widest mb-4 uppercase">Mission Control</h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => {
                    const isDynamicMatch = item.path.startsWith('/analysis') && location.pathname.startsWith('/analysis');
                    const active = isActive || isDynamicMatch;
                    return clsx(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-sm border-l-2 transition-colors",
                      active 
                        ? "border-rust text-rust bg-rust/10" 
                        : "border-transparent text-gray-400 hover:text-warm-white hover:bg-gray-800"
                    );
                  }}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-6 border-t border-gray-800/50 bg-transparent">
        <h2 className="text-xs font-mono text-gray-500 tracking-widest mb-4 uppercase">System Status</h2>
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">DATASET</span>
            <span className="flex items-center text-science"><span className="w-2 h-2 rounded-full bg-science mr-2 animate-pulse"></span>READY</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">MODEL</span>
            <span className="flex items-center text-science"><span className="w-2 h-2 rounded-full bg-science mr-2 animate-pulse"></span>READY</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">DETECTOR</span>
            <span className="flex items-center text-science"><span className="w-2 h-2 rounded-full bg-science mr-2 animate-pulse"></span>READY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
