import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 bg-brand-500/10 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-brand-500/20"
          >
            <Activity className="w-10 h-10 text-brand-400" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Fit<span className="text-brand-400">verse</span></h1>
          <p className="text-zinc-400">Your AI-Powered Personal Coach</p>
        </div>

        <div className="glass-card p-8 border-white/10 backdrop-blur-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-zinc-400 block mb-2 font-mono uppercase tracking-wider">Email Window</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                  placeholder="athlete@fitverse.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-400 block mb-2 font-mono uppercase tracking-wider">Secure Pattern</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className={cn(
                "w-full bg-brand-500 hover:bg-brand-400 text-dark-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2",
                loading ? "opacity-70 cursor-not-allowed" : "shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-1"
              )}
            >
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {loading ? 'Processing...' : (isLogin ? 'Initialize Session' : 'Register Profile')}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-[1px] bg-white/10 flex-1" />
            <span className="text-xs text-zinc-500 font-mono uppercase">Neural Link</span>
            <div className="h-[1px] bg-white/10 flex-1" />
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 w-full bg-white text-dark-900 font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path><path d="M1 1h22v22H1z" fill="none"></path></svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center mt-8 text-zinc-500 text-sm">
          {isLogin ? "Don't have a profile yet? " : "Already have a profile? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-400 font-bold hover:text-brand-300 transition-colors"
          >
            {isLogin ? "Register Core" : "Initialize Session"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
