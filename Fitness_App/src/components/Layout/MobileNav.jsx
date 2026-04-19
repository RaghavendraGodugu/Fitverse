import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Activity, BarChart2, User, ClipboardList } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Plan', path: '/plan', icon: ClipboardList },
  { name: 'Workouts', path: '/workouts', icon: Activity },
  { name: 'Exercises', path: '/exercises', icon: Dumbbell },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#141414]/90 backdrop-blur-xl border-t border-white/10 lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-evenly items-center px-1 py-1 sm:px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium transition-all group flex-1 touch-manipulation',
                  isActive
                    ? 'text-brand-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-[22px] h-[22px] mb-1 z-10 transition-colors',
                      isActive ? 'text-brand-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    )}
                  />
                  <span className="z-10 text-[10px] tracking-wide">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-bg"
                      className="absolute inset-x-2 inset-y-1 bg-brand-500/10 rounded-xl z-0"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
