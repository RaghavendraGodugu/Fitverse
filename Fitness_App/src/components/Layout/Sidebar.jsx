import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Dumbbell, Activity, BarChart2, User, Settings, LogOut, ClipboardList } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Smart Workout Plan', path: '/plan', icon: ClipboardList },
  { name: 'Workouts', path: '/workouts', icon: Activity },
  { name: 'Exercises', path: '/exercises', icon: Dumbbell },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function Sidebar() {
  const { logout } = useAuth();

  const handleNav = () => {
    // No longer needed for mobile close
  };

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 h-[100dvh] w-64 glass border-r border-white/10 hidden lg:flex flex-col z-50 transition-transform duration-300 ease-out translate-x-0'
        )}
      >
        <Link 
          to="/"
          className="p-5 sm:p-6 flex items-center gap-3 border-b border-white/5 pt-[max(1.25rem,env(safe-area-inset-top))] hover:bg-white/5 transition-colors touch-manipulation group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-300 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.45)] group-hover:scale-105 transition-transform">
            <Dumbbell className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-brand-400 transition-colors">
            Fit<span className="text-brand-400 group-hover:text-white transition-colors">verse</span>
          </h1>
        </Link>

        <div className="flex-1 overflow-y-auto hide-scrollbar py-6">
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNav}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group overflow-hidden touch-manipulation',
                      isActive
                        ? 'text-brand-400 bg-white/5 shadow-inner border border-white/5'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'w-5 h-5 z-10 transition-colors shrink-0',
                          isActive ? 'text-brand-400' : 'text-zinc-500 group-hover:text-zinc-300'
                        )}
                      />
                      <span className="z-10">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute inset-0 bg-brand-500/10 z-0"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-3 sm:p-4 border-t border-white/5 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link
            to="/profile"
            onClick={handleNav}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all w-full text-left group touch-manipulation"
          >
            <Settings className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
            Settings
          </Link>
          <button
            type="button"
            onClick={() => {
              handleNav();
              logout();
            }}
            className="flex items-center gap-3 px-4 py-3 mt-1 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full text-left group touch-manipulation"
          >
            <LogOut className="w-5 h-5 transition-colors shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
