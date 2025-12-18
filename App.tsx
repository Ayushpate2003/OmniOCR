
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, FileUp, Settings, Terminal, Layers, Search, User } from 'lucide-react';

// Main components
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import Logs from './components/Logs';
import SettingsView from './components/Settings';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar always visible */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Layers className="text-indigo-600 w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">Omni<span className="text-indigo-600">OCR</span></span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors">
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/upload" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors">
              <FileUp size={20} />
              <span className="font-medium">New OCR Job</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors">
              <Settings size={20} />
              <span className="font-medium">API Keys</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-100">
             <div className="flex items-center gap-3 p-3 text-slate-400">
                <User size={20} />
                <span className="text-sm font-medium">Guest Session</span>
             </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          {/* Header always visible */}
          <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between">
            <div className="md:hidden flex items-center gap-2">
              <Layers className="text-indigo-600 w-6 h-6" />
              <span className="font-bold">OmniOCR</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full w-96">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Search files..." className="bg-transparent border-none outline-none text-sm w-full" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-sm font-semibold">Public User</p>
                 <p className="text-xs text-slate-400">public-access@omniocr.io</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                P
              </div>
            </div>
          </header>

          <div className="p-6 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/logs/:fileId" element={<Logs />} />
              <Route path="/settings" element={<SettingsView />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
