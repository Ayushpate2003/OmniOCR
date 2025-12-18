
import React, { useEffect, useState } from 'react';
import { getFiles, getDownloadUrl, cancelJob } from '../services/appwriteService';
import { OCRFile, OCRStatus } from '../types';
import { FileText, Download, Terminal, Clock, CheckCircle, AlertCircle, RefreshCw, MoreVertical, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatusBadge: React.FC<{ status: OCRStatus }> = ({ status }) => {
  const styles = {
    [OCRStatus.QUEUED]: "bg-slate-100 text-slate-600 border-slate-200",
    [OCRStatus.PROCESSING]: "bg-blue-50 text-blue-600 border-blue-200 animate-pulse",
    [OCRStatus.COMPLETED]: "bg-green-50 text-green-600 border-green-200",
    [OCRStatus.FAILED]: "bg-red-50 text-red-600 border-red-200",
    [OCRStatus.CANCELLED]: "bg-amber-50 text-amber-600 border-amber-200"
  };

  const icons = {
    [OCRStatus.QUEUED]: <Clock size={14} />,
    [OCRStatus.PROCESSING]: <RefreshCw size={14} className="animate-spin" />,
    [OCRStatus.COMPLETED]: <CheckCircle size={14} />,
    [OCRStatus.FAILED]: <AlertCircle size={14} />,
    [OCRStatus.CANCELLED]: <XCircle size={14} />
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status.toUpperCase()}
    </span>
  );
};

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<OCRFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 3000); 
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this job?')) {
      await cancelJob(id);
      fetchFiles();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Dashboard</h1>
          <p className="text-slate-500">Manage and download your processed OCR results.</p>
        </div>
        <Link to="/upload" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-2">
          <FileText size={18} />
          New Job
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">File Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Engine</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading your files...</td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileText size={48} strokeWidth={1} />
                    <p>No documents processed yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.$id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">{file.fileName}</p>
                        <p className="text-xs text-slate-400">{file.fileType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-slate-600 px-2 py-1 bg-slate-100 rounded capitalize">{file.ocrEngine}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatSize(file.fileSize)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={file.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/logs/${file.$id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Logs">
                        <Terminal size={18} />
                      </Link>
                      {file.status === OCRStatus.COMPLETED && (
                        <a 
                          href={getDownloadUrl(file.$id)} 
                          download={`${file.fileName}.txt`}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Download Text"
                        >
                          <Download size={18} />
                        </a>
                      )}
                      {(file.status === OCRStatus.QUEUED || file.status === OCRStatus.PROCESSING) && (
                        <button 
                          onClick={() => handleCancel(file.$id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Cancel Job"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
