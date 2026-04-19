import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Calendar, CheckSquare, Settings2, CheckCircle2, X, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWorkoutStore } from '../store/useWorkoutStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Workouts() {
  const [activeTab, setActiveTab] = useState("routines");
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { 
    initSession, savedRoutines, addSavedRoutine, removeSavedRoutine, workoutHistory,
    isSessionActive, isTimerRunning, sessionTime, activeRoutineName 
  } = useWorkoutStore();

  React.useEffect(() => {
    if (isSessionActive) {
      setShowSessionModal(true);
    }
  }, [isSessionActive]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // New Routine Form State
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineFocus, setNewRoutineFocus] = useState("");

  const handleCreateRoutine = (e) => {
    e.preventDefault();
    if (!newRoutineName.trim()) return;

    const newRoutine = {
      id: Date.now(),
      name: newRoutineName,
      lastPerformed: "Never",
      exercises: 0,
      focus: newRoutineFocus || "General Fit"
    };

    addSavedRoutine(newRoutine);
    setShowCreateModal(false);
    setNewRoutineName("");
    setNewRoutineFocus("");
  };
  
  const openActiveSession = () => {
    initSession("Free Workout");
    setShowSessionModal(true);
  };

  const openRoutineSession = (routineName) => {
    initSession(routineName);
    setShowSessionModal(true);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 relative"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Workouts</h1>
          <p className="text-zinc-400">Track your loads, maximize your gains.</p>
        </div>
        <button 
          onClick={openActiveSession}
          className="bg-brand-500 hover:bg-brand-400 text-dark-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
        >
          <Play className="w-5 h-5 fill-current" />
          {isSessionActive && activeRoutineName === "Free Workout" ? "Show Empty Session" : "Start Empty Session"}
        </button>
      </div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex border-b border-white/10 w-full overflow-x-auto hide-scrollbar">
        {["routines", "history", "programs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors capitalize border-b-2 relative",
              activeTab === tab 
                ? "text-brand-400 border-brand-400" 
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            )}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Routines View */}
      {activeTab === "routines" && (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <motion.div 
            variants={itemVariants}
            onClick={() => setShowCreateModal(true)}
            className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:border-brand-500/50 group border-dashed border-2 bg-transparent"
            style={{ minHeight: '220px' }}
          >
            <div className="w-14 h-14 rounded-full bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 group-hover:scale-110 transition-all">
              <Plus className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors">Create Routine</h3>
              <p className="text-xs text-zinc-500 mt-1">Build from scratch</p>
            </div>
          </motion.div>

          {/* Routine Cards */}
          <AnimatePresence>
            {savedRoutines.map((routine) => {
              const isActive = isSessionActive && activeRoutineName === routine.name;
              return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                variants={itemVariants}
                key={routine.id}
                className={cn(
                  "glass-card p-6 flex flex-col justify-between group cursor-pointer border transition-all",
                  isActive ? "border-brand-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-brand-500/5 hover:border-brand-400" : "border-white/5 hover:border-brand-500/30"
                )}
                style={{ minHeight: '220px' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 rounded-lg border transition-colors", isActive ? "bg-brand-500/20 border-brand-500/30" : "bg-white/5 border-white/10 group-hover:bg-brand-500/10")}>
                      <CheckSquare className={cn("w-5 h-5 transition-colors", isActive ? "text-brand-400 animate-pulse" : "text-zinc-400 group-hover:text-brand-400")} />
                    </div>
                    <button onClick={() => removeSavedRoutine(routine.id)} className="p-1 hover:bg-white/10 rounded-md transition-colors text-zinc-500 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{routine.name}</h3>
                  <p className="text-xs text-brand-400 font-medium mb-3">{routine.focus}</p>
                  <div className="flex gap-4 text-xs text-zinc-400 mb-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {routine.lastPerformed}</span>
                    <span>•</span>
                    <span>{routine.exercises} Exercises</span>
                  </div>
                  {isActive && (
                    <div className="mt-4 flex items-center justify-center p-2 rounded-lg bg-dark-900 border border-brand-500/30 text-brand-400 font-mono font-bold tracking-wider">
                      {isTimerRunning && <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse mr-2" />}
                      {formatTime(sessionTime)}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => openRoutineSession(routine.name)}
                  className={cn(
                    "w-full py-2.5 mt-4 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 border",
                    isActive 
                      ? "bg-brand-500/20 text-brand-400 border-brand-500/30 hover:bg-brand-500 hover:text-dark-900 hover:border-transparent" 
                      : "bg-white/5 hover:bg-brand-500 text-white hover:text-dark-900 border-white/10 hover:border-transparent"
                  )}
                >
                  <Play className={cn("w-4 h-4", isActive && "fill-current")} /> {isActive ? "Show Routine" : "Start Routine"}
                </button>
              </motion.div>
            )})}
          </AnimatePresence>
        </motion.div>
      )}

      {activeTab === "history" && (
        <motion.div variants={containerVariants} className="space-y-3 sm:space-y-4">
          {workoutHistory.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-16 px-4 text-zinc-500 glass-card rounded-2xl">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Finish a session with the tracker to build your history.</p>
              <p className="text-xs mt-2 text-zinc-600">Data is stored in this browser (local storage).</p>
            </motion.div>
          ) : (
            [...workoutHistory]
              .slice()
              .reverse()
              .map((w) => {
                const sets =
                  w.totalSets ??
                  w.exercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) ??
                  0;
                const vol = w.totalVolume;
                const durMin = Math.floor((w.time || 0) / 60);
                const durSec = (w.time || 0) % 60;
                return (
                  <motion.div
                    variants={itemVariants}
                    key={w.id || `${w.date}-${w.name}-${w.time}`}
                    className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-white/5"
                  >
                    <div>
                      <h3 className="font-bold text-white text-lg">{w.name}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{w.date}</p>
                      {w.exercises?.length > 0 && (
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                          {w.exercises
                            .map((e) => e.name)
                            .filter(Boolean)
                            .slice(0, 4)
                            .join(' · ')}
                          {w.exercises.length > 4 ? '…' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        {durMin}m {durSec}s
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">{sets} sets</span>
                      {vol != null && vol > 0 && (
                        <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                          {Math.round(vol)} vol
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
          )}
        </motion.div>
      )}

      {activeTab === "programs" && (
        <motion.div variants={itemVariants} className="text-center py-16 text-zinc-500 glass-card px-4">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Programs coming soon. Use Routines for now.</p>
        </motion.div>
      )}

      {/* Create Routine Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden glass-card p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                   <Plus className="w-6 h-6 text-brand-400" /> New Routine
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white">
                   <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateRoutine} className="space-y-4">
                 <div>
                    <label className="text-xs text-zinc-500 font-medium block mb-1">Routine Name</label>
                    <input 
                      type="text" 
                      required
                      value={newRoutineName}
                      onChange={(e) => setNewRoutineName(e.target.value)}
                      className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" 
                      placeholder="e.g. Explosive Leg Day" 
                    />
                 </div>
                 <div>
                    <label className="text-xs text-zinc-500 font-medium block mb-1">Target Muscles / Focus</label>
                    <input 
                      type="text" 
                      value={newRoutineFocus}
                      onChange={(e) => setNewRoutineFocus(e.target.value)}
                      className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" 
                      placeholder="e.g. Quads, Glutes" 
                    />
                 </div>

                 <button 
                  type="submit"
                  className="w-full mt-4 bg-brand-500 hover:bg-brand-400 text-dark-900 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] flex justify-center items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Routine
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Session Placeholder Modal */}
      <AnimatePresence>
        {showSessionModal && (
          <ActiveSessionModal onClose={() => setShowSessionModal(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Sub-component for the Active Session Tracker to encapsulate its complex state and timer
function ActiveSessionModal({ onClose }) {
  const { 
    sessionTime, 
    exercises,
    activeRoutineName,
    addExercise, 
    removeExercise, 
    updateExerciseName, 
    addSet, 
    removeSet, 
    updateSet,
    isTimerRunning,
    startTimer,
    resumeTimer,
    pauseTimer,
    endSession
  } = useWorkoutStore();

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleFinish = () => {
    endSession();
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden glass-card flex flex-col max-h-full"
      >
        {/* Tracker Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-dark-800">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <span className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]", isTimerRunning ? "bg-brand-500 animate-pulse" : "bg-orange-500")} />
              Active Session
            </h2>
            <p className="text-zinc-400 text-sm mt-1">{isTimerRunning ? `${activeRoutineName} running` : "Timer Paused"}</p>
          </div>
          <div className="text-right flex items-center gap-4">
            <div className="text-xl md:text-3xl font-mono tracking-wider font-bold text-brand-400">
              {formatTime(sessionTime)}
            </div>
            {/* Global Minimize Button */}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400">
               <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tracker Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 hide-scrollbar">
          
          {exercises.length === 0 && (
            <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl bg-white/5">
              <CheckCircle2 className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No exercises added yet</h3>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto shadow-none">
                Tap 'Add Exercise' below to insert a new exercise block. You can title it anything (e.g. "Barbell Squats") and start tracking your rep/load progression!
              </p>
            </div>
          )}

          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="bg-white/5 border border-white/5 rounded-xl p-4 md:p-5 relative group">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-brand-500 font-bold bg-brand-500/10 w-8 h-8 rounded-full flex items-center justify-center">{index + 1}</span>
                  <div className="flex-1 w-full relative">
                    <label className="text-[10px] text-brand-400 uppercase font-bold tracking-wider mb-1 block pl-1">Exercise Name / Info</label>
                    <input 
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                      placeholder="e.g. Barbell Squats..."
                      className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-all shadow-inner font-bold text-lg"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => removeExercise(exercise.id)}
                  className="p-2 bg-dark-900 border border-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                  title="Remove Exercise"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Headers */}
                <div className="flex gap-2 md:gap-4 px-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  <div className="w-8 text-center">Set</div>
                  <div className="flex-1 text-center">kg / lbs</div>
                  <div className="flex-1 text-center">Reps</div>
                  <div className="w-10 md:w-12">Act</div>
                </div>

                {/* Sets */}
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="flex gap-2 md:gap-4 items-center bg-dark-900/50 p-2 rounded-lg border border-white/5">
                    <div className="w-8 text-center font-mono text-zinc-400">{setIndex + 1}</div>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        value={set.weight}
                        onChange={(e) => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                        placeholder="--"
                        className="w-full bg-dark-800 border border-white/10 rounded-lg px-2 md:px-3 py-2 text-center text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        value={set.reps}
                        onChange={(e) => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                        placeholder="--"
                        className="w-full bg-dark-800 border border-white/10 rounded-lg px-2 md:px-3 py-2 text-center text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                    <button 
                      onClick={() => removeSet(exercise.id, set.id)}
                      className="w-10 md:w-12 h-10 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors shadow-none"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}

                <button 
                  onClick={() => addSet(exercise.id)}
                  className="w-full py-2 mt-4 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-none"
                >
                  <Plus className="w-4 h-4" /> Add Set
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={addExercise}
            className="w-full py-4 rounded-xl border border-dashed border-white/20 hover:border-brand-500/50 text-zinc-400 hover:text-brand-400 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" /> Add New Exercise
          </button>
        </div>

        {/* Tracker Footer Action */}
        <div className="p-4 md:p-6 border-t border-white/10 bg-dark-800 flex flex-wrap gap-2 md:gap-4">
          {!isTimerRunning ? (
            <button 
              onClick={sessionTime === 0 ? startTimer : resumeTimer}
              className="flex-1 px-4 py-3 rounded-xl font-bold bg-brand-500 hover:bg-brand-400 text-dark-900 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              {sessionTime === 0 ? "Start Workout" : "Resume Workout"}
            </button>
          ) : (
            <button 
              onClick={pauseTimer}
              className="flex-1 px-4 py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-400 text-white transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2"
            >
              Pause Timer
            </button>
          )}

          <button 
            onClick={() => alert("Workout Progress Saved!")}
            className="flex-1 px-4 py-3 rounded-xl font-bold bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-all flex items-center justify-center gap-2 shadow-none"
          >
            <Save className="w-4 h-4" /> Save
          </button>

          <button 
            onClick={handleFinish}
            className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-all flex items-center justify-center gap-2 shadow-none"
          >
            <CheckCircle2 className="w-5 h-5" /> Finish
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
