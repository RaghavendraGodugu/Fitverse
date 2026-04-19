import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      isSessionActive: false,
      isTimerRunning: false,
      sessionTime: 0,
      exercises: [],
      activeRoutineName: "Free Workout",
      workoutHistory: [],
      savedRoutines: [],

      // Routine Management
      addSavedRoutine: (routine) => set((state) => ({ savedRoutines: [routine, ...state.savedRoutines] })),
      removeSavedRoutine: (id) => set((state) => ({ savedRoutines: state.savedRoutines.filter(r => r.id !== id) })),

      // Session Control
      initSession: (routineName = "Free Workout", initialExercises = []) => {
        const state = get();
        // If there's an active session, reset it to the new one or keep it?
        // We will just override it for the Smart Plan.
        set({ 
          isSessionActive: true, 
          isTimerRunning: false, 
          sessionTime: 0,
          exercises: initialExercises,
          activeRoutineName: routineName
        });
      },
      
      startTimer: () => set({ isTimerRunning: true }),
      resumeTimer: () => set({ isTimerRunning: true }),
      pauseTimer: () => set({ isTimerRunning: false }),
      tickTime: () => {
        const { isTimerRunning } = get();
        if (isTimerRunning) {
          set((state) => ({ sessionTime: state.sessionTime + 1 }));
        }
      },
      
      endSession: () => {
        const state = get();
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const exercisesSnapshot = state.exercises.map(({ id, name, sets }) => ({
          id,
          name: String(name || '').trim() || 'Unnamed exercise',
          sets: (sets || []).map(({ id: sid, weight, reps }) => ({
            id: sid,
            weight,
            reps,
          })),
        }));

        let totalSets = 0;
        let totalVolume = 0;
        for (const ex of exercisesSnapshot) {
          totalSets += ex.sets.length;
          for (const set of ex.sets) {
            const w = parseFloat(String(set.weight).replace(',', '.'));
            const r = parseFloat(String(set.reps).replace(',', '.'));
            if (Number.isFinite(w) && Number.isFinite(r)) totalVolume += w * r;
          }
        }

        const entry = {
          id: Date.now(),
          date: todayStr,
          name: state.activeRoutineName,
          time: state.sessionTime,
          exercises: exercisesSnapshot,
          totalSets,
          totalVolume,
        };

        set({
          workoutHistory: [...state.workoutHistory, entry],
          isSessionActive: false,
          isTimerRunning: false,
          sessionTime: 0,
          exercises: [],
        });
      },

      // Exercise Management
      addExercise: () => set((state) => ({
        exercises: [
          ...state.exercises, 
          { id: Date.now(), name: "", sets: [{ id: Date.now() + 1, weight: "", reps: "" }] }
        ]
      })),

      removeExercise: (id) => set((state) => ({
        exercises: state.exercises.filter(ex => ex.id !== id)
      })),

      updateExerciseName: (id, name) => set((state) => ({
        exercises: state.exercises.map(ex => ex.id === id ? { ...ex, name } : ex)
      })),

      addSet: (exerciseId) => set((state) => ({
        exercises: state.exercises.map(ex => {
          if (ex.id === exerciseId) {
            return { ...ex, sets: [...ex.sets, { id: Date.now(), weight: "", reps: "" }] };
          }
          return ex;
        })
      })),

      removeSet: (exerciseId, setId) => set((state) => ({
        exercises: state.exercises.map(ex => {
          if (ex.id === exerciseId) {
            return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
          }
          return ex;
        })
      })),

      updateSet: (exerciseId, setId, field, value) => set((state) => ({
        exercises: state.exercises.map(ex => {
          if (ex.id === exerciseId) {
            return {
              ...ex,
              sets: ex.sets.map(set => set.id === setId ? { ...set, [field]: value } : set)
            };
          }
          return ex;
        })
      }))
    }),
    {
      name: 'workout-progress-storage',
    }
  )
);
