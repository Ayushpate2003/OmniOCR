
import React, { useState } from 'react';
import { account } from '../services/appwriteService';
import { ID } from 'appwrite';
import { Layers, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface LoginProps {
  onAuth: () => void;
}

const Login: React.FC<LoginProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await account.createEmailSession(email, password);
      } else {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailSession(email, password);
      }
      onAuth();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-10">
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <Layers size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome to OmniOCR</h1>
            <p className="text-slate-500 text-sm">{isLogin ? 'Login to your account' : 'Create your secure account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    placeholder="John Doe"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="name@company.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group">
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
