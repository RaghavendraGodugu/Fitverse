import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Dumbbell, Play, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiUrl } from '../lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Exercises() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeVideo, setActiveVideo] = useState(null);

  // Fetch Exercises from Backend
  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/exercises?limit=1500'));
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.data;
    }
  });

  const exercises = responseData || [];

  const filters = ["All", "chest", "upper legs", "back", "lower arms", "shoulders"];

  const filtered = exercises.map(ex => ({
    ...ex,
    gifUrl: ex.gifUrl || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80"
  })).filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || ex.bodyPart.toLowerCase() === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 relative"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Exercise Library</h1>
        <p className="text-zinc-400">Master your form with our AI-curated wger API database.</p>
      </div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl glass-card">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar py-2 md:py-0">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap capitalize",
                activeFilter === filter 
                  ? "bg-brand-500 text-dark-900" 
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20 flex-col gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
          <p className="text-zinc-400 font-medium">Fetching 300+ wger Exercise Definitions...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-20 text-red-500 bg-red-500/10 rounded-2xl border border-red-500/20 max-w-2xl mx-auto">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="font-bold">Failed to connect to the backend server.</p>
          <p className="text-sm mt-2 text-red-300">
            Run <code className="text-red-200">npm run dev</code> from the app folder (starts Vite and the API), or{' '}
            <code className="text-red-200">cd backend && npm run dev</code> if you only use Vite.
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((exercise) => (
              <motion.div
                layout
                key={exercise.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveVideo(exercise)}
                className="group glass-card overflow-hidden cursor-pointer flex flex-col border border-white/5 hover:border-brand-500/30 transition-all shadow-[0_0_0_transparent] hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
              >
                <div className="relative h-60 overflow-hidden bg-[#E9E9E9] p-2 flex justify-center items-center">
                  <img 
                    src={exercise.gifUrl} 
                    alt={exercise.name} 
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter "
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80" />
                  <button className="absolute inset-0 m-auto w-12 h-12 bg-brand-500 border border-brand-400/50 rounded-full flex items-center justify-center text-dark-900 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                    <Play className="w-5 h-5 ml-1" />
                  </button>
                </div>
                
                <div className="p-5 flex flex-col flex-1 relative">
                  <div className="absolute -top-6 right-5 p-2 bg-dark-900 border border-white/10 rounded-lg">
                    <Dumbbell className="w-5 h-5 text-brand-400" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 group-hover:text-brand-400 transition-colors capitalize">{exercise.name}</h3>
                  <p className="text-sm text-zinc-400 capitalize mb-4">Target: {exercise.target}</p>
                  
                  <div className="flex gap-2 mt-auto">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-zinc-300 border border-white/10 capitalize">{exercise.bodyPart}</span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-zinc-300 border border-white/10 capitalize">{exercise.equipment}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No exercises found matching your criteria.</p>
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden glass-card flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-dark-800">
                <h3 className="text-xl font-bold capitalize text-white">{activeVideo.name}</h3>
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 bg-zinc-100 flex justify-center items-center">
                <img 
                  src={activeVideo.gifUrl} 
                  alt={activeVideo.name} 
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="max-h-[500px] w-auto rounded-lg shadow-xl"
                />
              </div>
              <div className="p-6 bg-dark-900">
                <p className="text-zinc-400 text-sm">Follow the animation closely to ensure proper form. Ensure your <span className="text-brand-400 capitalize">{activeVideo.target}</span> is fully engaged during the movement.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
