
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLogs, cancelJob, getFiles } from '../services/appwriteService';
import { OCRLog, OCRStatus } from '../types';
import { Terminal, ChevronLeft, Info, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

const Logs: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [logs, setLogs] = useState<OCRLog[]>([]);
  const [status, setStatus] = useState<OCRStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (fileId) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [fileId]);

  const fetchLogs = async () => {
    if (!fileId) return;
    try {
      const data = await getLogs(fileId);
      setLogs(data);
      
      const files = await getFiles();
      const currentFile = files.find(f => f.$id === fileId);
      if (currentFile) setStatus(currentFile.status);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!fileId) return;
    if (confirm('Cancel this extraction job?')) {
      await cancelJob(fileId);
      fetchLogs();
    }
  };

  const isCancellable = status === OCRStatus.QUEUED || status === OCRStatus.PROCESSING;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <ChevronLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Job Execution Logs</h1>
            <p className="text-slate-500 text-sm font-mono truncate max-w-xs md:max-w-md">ID: {fileId}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {isCancellable && (
            <button 
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
            >
              <XCircle size={16} />
              Cancel Job
            </button>
          )}
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal size={18} />
            <span className="text-xs font-mono uppercase tracking-widest font-bold">Terminal Output</span>
          </div>
          {status && (
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
               status === OCRStatus.COMPLETED ? 'bg-green-900/20 text-green-400 border-green-800' :
               status === OCRStatus.FAILED ? 'bg-red-900/20 text-red-400 border-red-800' :
               status === OCRStatus.CANCELLED ? 'bg-amber-900/20 text-amber-400 border-amber-800' :
               'bg-blue-900/20 text-blue-400 border-blue-800 animate-pulse'
             }`}>
               {status.toUpperCase()}
             </span>
          )}
        </div>
        
        <div className="p-8 font-mono text-[13px] space-y-4 min-h-[500px] max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {loading ? (
            <div className="flex items-center gap-2 text-indigo-400">
              <RefreshCw className="animate-spin" size={16} />
              <span>Initializing log stream...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-slate-600 italic border-l-2 border-slate-800 pl-4">Waiting for process start...</div>
          ) : (
            logs.map((log) => (
              <div key={log.$id} className="flex gap-4 border-l-2 border-slate-800 pl-4 hover:bg-slate-800/40 py-1.5 transition-colors group">
                <span className="text-slate-600 whitespace-nowrap opacity-70 group-hover:opacity-100">{new Date(log.createdAt).toLocaleTimeString()}</span>
                <span className={`flex-shrink-0 flex items-center gap-1 uppercase text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  log.level === 'error' ? 'bg-red-900/40 text-red-400' :
                  log.level === 'warning' ? 'bg-amber-900/40 text-amber-400' :
                  'bg-blue-900/40 text-blue-400'
                }`}>
                  {log.level === 'error' ? <AlertCircle size={10} /> : <Info size={10} />}
                  {log.level}
                </span>
                <span className={`leading-relaxed ${
                  log.level === 'error' ? 'text-red-300 font-medium' : 
                  log.message.includes('completed') ? 'text-green-300 font-medium' :
                  'text-slate-300'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          {!loading && status === OCRStatus.PROCESSING && (
            <div className="flex items-center gap-2 text-indigo-400 border-l-2 border-indigo-900 pl-4 py-1 animate-pulse">
              <span>_</span>
              <span>Process is active...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
