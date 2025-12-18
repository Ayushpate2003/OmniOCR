
import React, { useState } from 'react';
import { uploadFile, updateFileStatus } from '../services/appwriteService';
import { performGeminiOCR } from '../services/geminiService';
import { OCREngine, OCRStatus } from '../types';
import { Upload as UploadIcon, File, X, Info, Zap, Cpu, Sparkles, RefreshCw, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [engine, setEngine] = useState<OCREngine>(OCREngine.GEMINI); 
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const dbFile = await uploadFile(file, engine);
      
      // We navigate immediately but the process continues in background logic 
      // linked to the file ID in localStorage for this demo
      if (engine === OCREngine.GEMINI) {
        // We start processing asynchronously
        (async () => {
           try {
             await updateFileStatus(dbFile.$id, OCRStatus.PROCESSING);
             const extractedText = await performGeminiOCR(file);
             await updateFileStatus(dbFile.$id, OCRStatus.COMPLETED, extractedText);
           } catch (ocrError) {
             console.error("OCR Error:", ocrError);
             await updateFileStatus(dbFile.$id, OCRStatus.FAILED);
           }
        })();
      } else {
          // Simulation for other engines
          setTimeout(async () => {
              await updateFileStatus(dbFile.$id, OCRStatus.PROCESSING);
              setTimeout(async () => {
                  await updateFileStatus(dbFile.$id, OCRStatus.COMPLETED, "Simulated result for " + engine + ". To use the real engine, please deploy the backend Docker stack.");
              }, 4000);
          }, 1500);
      }

      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Action failed. Ensure your environment is ready.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submit New Document</h1>
        <p className="text-slate-500">Choose your OCR engine and upload your file for processing.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">Select OCR Engine</label>
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">Gemini Recommended</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setEngine(OCREngine.GEMINI)}
              className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${engine === OCREngine.GEMINI ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm ring-2 ring-indigo-600 ring-opacity-20' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'}`}
            >
              <Bot size={24} />
              <div className="text-center">
                <p className="font-bold">Gemini OCR</p>
                <p className="text-xs opacity-70">Multimodal AI</p>
              </div>
            </button>
            <button 
              onClick={() => setEngine(OCREngine.MISTRAL)}
              className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${engine === OCREngine.MISTRAL ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm ring-2 ring-indigo-600 ring-opacity-20' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'}`}
            >
              <Sparkles size={24} />
              <div className="text-center">
                <p className="font-bold">Mistral OCR</p>
                <p className="text-xs opacity-70">Mistral API</p>
              </div>
            </button>
            <button 
              onClick={() => setEngine(OCREngine.DOCTR)}
              className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${engine === OCREngine.DOCTR ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm ring-2 ring-indigo-600 ring-opacity-20' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'}`}
            >
              <Cpu size={24} />
              <div className="text-center">
                <p className="font-bold">docTR</p>
                <p className="text-xs opacity-70">Local DL</p>
              </div>
            </button>
            <button 
              onClick={() => setEngine(OCREngine.TESSERACT)}
              className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${engine === OCREngine.TESSERACT ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm ring-2 ring-indigo-600 ring-opacity-20' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'}`}
            >
              <Zap size={24} />
              <div className="text-center">
                <p className="font-bold">Tesseract</p>
                <p className="text-xs opacity-70">Legacy</p>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700">Document Upload (PDF, PNG, JPG)</label>
          <div className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${file ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'}`}>
            <input 
              type="file" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.png,.jpg,.jpeg"
            />
            {!file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
                  <UploadIcon size={32} />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">Drop your file here or click to browse</p>
                  <p className="text-sm text-slate-500 mt-1">Maximum file size: 25MB</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <File className="text-indigo-600" size={32} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm">
          <Info size={18} className="flex-shrink-0 mt-0.5" />
          <p>
            {engine === OCREngine.GEMINI ? 
              "Gemini OCR will process your document in real-time right here in your browser." : 
              "This engine requires the Docker backend stack. In this preview, we'll simulate the process."}
          </p>
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${!file || isUploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
        >
          {isUploading ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              Initializing Job...
            </>
          ) : (
            <>
              <Zap size={20} fill="currentColor" />
              Start Extraction
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Upload;
