import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      isSessionActive: false,
      isTimerRunning: false,
      sessionTime: 0,
      exercises: [],
      activeRoutineName: 'Free Workout',
      workoutHistory: [],
      savedRoutines: [],

      addSavedRoutine: (routine) =>
        set((state) => ({
          savedRoutines: [routine, ...state.savedRoutines],
        })),

      removeSavedRoutine: (id) =>
        set((state) => ({
          savedRoutines: state.savedRoutines.filter((r) => r.id !== id),
        })),

      initSession: (routineName = 'Free Workout', initialExercises = []) => {
        set({
          isSessionActive: true,
          isTimerRunning: false,
          sessionTime: 0,
          exercises: initialExercises,
          activeRoutineName: routineName,
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
            if (Number.isFinite(w) && Number.isFinite(r)) {
              totalVolume += w * r;
            }
          }
        }

        const entry = {
          id: makeId(),
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
          activeRoutineName: 'Free Workout',
        });
      },

      addExercise: () =>
        set((state) => ({
          exercises: [
            ...state.exercises,
            {
              id: makeId(),
              name: '',
              sets: [{ id: makeId(), weight: '', reps: '' }],
            },
          ],
        })),

      removeExercise: (id) =>
        set((state) => ({
          exercises: state.exercises.filter((ex) => ex.id !== id),
        })),

      updateExerciseName: (id, name) =>
        set((state) => ({
          exercises: state.exercises.map((ex) =>
            ex.id === id ? { ...ex, name } : ex
          ),
        })),

      addSet: (exerciseId) =>
        set((state) => ({
          exercises: state.exercises.map((ex) => {
            if (ex.id === exerciseId) {
              return {
                ...ex,
                sets: [...ex.sets, { id: makeId(), weight: '', reps: '' }],
              };
            }
            return ex;
          }),
        })),

      removeSet: (exerciseId, setId) =>
        set((state) => ({
          exercises: state.exercises.map((ex) => {
            if (ex.id === exerciseId) {
              const nextSets = ex.sets.filter((s) => s.id !== setId);
              return {
                ...ex,
                sets: nextSets.length > 0 ? nextSets : [{ id: makeId(), weight: '', reps: '' }],
              };
            }
            return ex;
          }),
        })),

      updateSet: (exerciseId, setId, field, value) =>
        set((state) => ({
          exercises: state.exercises.map((ex) => {
            if (ex.id === exerciseId) {
              return {
                ...ex,
                sets: ex.sets.map((set) =>
                  set.id === setId ? { ...set, [field]: value } : set
                ),
              };
            }
            return ex;
          }),
        })),

      clearWorkoutHistory: () => set({ workoutHistory: [] }),
    }),
    {
      name: 'workout-progress-storage',
      partialize: (state) => ({
        workoutHistory: state.workoutHistory,
        savedRoutines: state.savedRoutines,
      }),
    }
  )
);
