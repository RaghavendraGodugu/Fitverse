import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingButton from '../AIChat/FloatingButton';
import ChatModal from '../AIChat/ChatModal';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import MobileNav from './MobileNav';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Dumbbell, MoreVertical, Settings } from 'lucide-react';

export default function MainLayout() {
  const tickTime = useWorkoutStore((state) => state.tickTime);
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const int = setInterval(() => {
      tickTime();
    }, 1000);
    return () => clearInterval(int);
  }, [tickTime]);

  return (
    <div className="min-h-[100dvh] bg-dark-900 text-white flex overflow-hidden selection:bg-brand-500/30 relative">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-[100dvh] lg:min-h-screen min-w-0 lg:ml-64">
        
        {/* Mobile Top Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#141414]/90 backdrop-blur-xl sticky top-0 z-40">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-brand-300 flex items-center justify-center">
              <Dumbbell className="text-white w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Fit<span className="text-brand-400">verse</span>
            </h1>
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl overflow-hidden py-1 z-50 origin-top-right backdrop-blur-xl"
                >
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/profile');
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="h-px w-full bg-white/10" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <main className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

          <div className="flex-1 overflow-y-auto relative z-10 px-4 py-4 sm:px-6 sm:py-6 lg:p-8 hide-scrollbar pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-[max(1rem,env(safe-area-inset-bottom))]">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-7xl mx-auto min-h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <FloatingButton />
      <ChatModal />
      <MobileNav />
    </div>
  );
}
