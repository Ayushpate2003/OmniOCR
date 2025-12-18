
import React, { useState } from 'react';
import { saveApiKey } from '../services/appwriteService';
import { Shield, Key, Eye, EyeOff, Save, ExternalLink } from 'lucide-react';

const Settings: React.FC = () => {
  // Pre-filled with the provided Mistral API key for demonstration/testing
  const [mistralKey, setMistralKey] = useState('nVYiXrzAu9Ddat4zhKyhCg5tQDb87wMC');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (provider: string, key: string) => {
    if (!key) return;
    setIsSaving(true);
    try {
      await saveApiKey(provider, key);
      alert(`${provider} key saved successfully!`);
    } catch (e) {
      console.error(e);
      alert('Failed to save key.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API Settings</h1>
        <p className="text-slate-500">Securely store your keys for external OCR providers.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-10">
        <div className="flex items-start gap-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
          <Shield className="text-indigo-600 flex-shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-bold text-indigo-900">Key Encryption</h3>
            <p className="text-sm text-indigo-700 leading-relaxed">
              Your keys are encrypted using AES-256 before storage. They are only decrypted inside the isolated Appwrite Function environment during extraction.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                Mistral AI API Key
              </label>
              <a href="https://console.mistral.ai/" target="_blank" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                Get Key <ExternalLink size={10} />
              </a>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type={showKey ? "text" : "password"}
                  value={mistralKey}
                  onChange={(e) => setMistralKey(e.target.value)}
                  placeholder="Paste your Mistral API key here"
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                />
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button 
                onClick={() => handleSave('Mistral', mistralKey)}
                disabled={!mistralKey || isSaving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <Save size={18} />
                Save
              </button>
            </div>
            <p className="text-xs text-slate-400">Mistral OCR provides superior results for complex layouts and handwritten text.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
