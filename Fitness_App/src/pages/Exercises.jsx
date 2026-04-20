import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, Dumbbell, Play, Loader2, X } from 'lucide-react';
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

  // ✅ FETCH FROM BACKEND (FIXED)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const url = apiUrl('/api/exercises?limit=1500');
      console.log("API CALL 👉", url); // 🔥 DEBUG

      const res = await fetch("https://fitverse-1-lv1o.onrender.com/api/exercises?limit=1500");

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    }
  });

  const exercises = data || [];

  const filters = ["All", "chest", "upper legs", "back", "lower arms", "shoulders"];

  const filtered = exercises
    .map(ex => ({
      ...ex,
      gifUrl:
        ex.gifUrl ||
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80"
    }))
    .filter(ex => {
      const matchSearch = ex.name?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        activeFilter === "All" ||
        ex.bodyPart?.toLowerCase() === activeFilter;
      return matchSearch && matchFilter;
    });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 relative"
    >
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Exercise Library</h1>
        <p className="text-zinc-400">
          Master your form with our AI-curated workout database.
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl"
      >
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm capitalize",
                activeFilter === filter
                  ? "bg-blue-500 text-black"
                  : "bg-white/5 text-zinc-400"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {/* LOADING */}
      {isLoading && (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-zinc-400 mt-2">Loading exercises...</p>
        </div>
      )}

      {/* ERROR */}
      {isError && (
        <div className="text-center py-20 text-red-500 bg-red-500/10 rounded-xl">
          <Dumbbell className="w-10 h-10 mx-auto mb-2" />
          <p className="font-bold">Backend connection failed ❌</p>
          <p className="text-sm mt-2">
            {error?.message || "Check API URL / backend deployment"}
          </p>
        </div>
      )}

      {/* GRID */}
      {!isLoading && !isError && (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map(ex => (
              <motion.div
                key={ex.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setActiveVideo(ex)}
              >
                <img
                  src={ex.gifUrl}
                  alt={ex.name}
                  className="w-full h-60 object-contain bg-gray-200"
                />

                <div className="p-4">
                  <h3 className="font-bold capitalize">{ex.name}</h3>
                  <p className="text-sm text-zinc-400">
                    Target: {ex.target}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* EMPTY */}
      {!isLoading && !isError && filtered.length === 0 && (
        <p className="text-center text-zinc-500 py-20">
          No exercises found
        </p>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/80">
            <div className="bg-black p-6 rounded-xl max-w-lg w-full">
              <button onClick={() => setActiveVideo(null)}>
                <X />
              </button>
              <img src={activeVideo.gifUrl} />
              <h2 className="text-xl mt-2">{activeVideo.name}</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}