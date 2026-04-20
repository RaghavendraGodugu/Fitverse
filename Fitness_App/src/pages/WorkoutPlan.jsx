import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  User,
  Check,
  RefreshCcw,
  Dumbbell,
  Scale,
  CalendarDays,
  Play,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { apiUrl } from '../lib/api';
import { useProfileStore } from '../store/useProfileStore';
import { useWorkoutStore } from '../store/useWorkoutStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkoutPlan() {
  const profileStore = useProfileStore();
  const navigate = useNavigate();
  const { initSession, startTimer } = useWorkoutStore();

  const [hasPlan, setHasPlan] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Generating...');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  const [formData, setFormData] = useState({
    height: profileStore.height || '',
    weight: profileStore.weight || '',
    days: '4',
    goal: profileStore.goal || 'Muscular',
    gender: profileStore.gender || 'Male',
  });

  useEffect(() => {
    const saved = localStorage.getItem('fitverse_workout_plan');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPlanData(parsed);
      setHasPlan(true);

      let day = new Date().getDay() - 1;
      if (day === -1) day = 6;
      setSelectedDayIdx(day);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingText('Consulting Gemini AI...');

    try {
      const query = `Create a 7-day weekly smart workout plan for a user. Profile: Weight: ${formData.weight}, Height: ${formData.height}, Goal: ${formData.goal}, Gender: ${formData.gender}, Workouts per week: ${formData.days}. 
Output strict JSON exactly matching this array format inside an object with a 'schedule' key. Example of one day: {"dayName": "Monday", "focus": "Full Body", "isRest": false, "analysis": "This full body session will elevate your heart rate and build muscle.", "exercises": ["Jumping Jacks", "Push-ups", "Crunches"]}. 
Return 7 days starting from Monday to Sunday. If it is a rest day, set "isRest": true, "exercises": [], "focus": "Rest Day", and provide a recovery "analysis".`;

      const aiRes = await fetch(apiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!aiRes.ok) throw new Error('AI API Error');

      const aiJson = await aiRes.json();

      let generatedSchedule = [];

      if (aiJson.data?.schedule) {
        generatedSchedule = aiJson.data.schedule;
      } else if (aiJson.data?.actionPlan) {
        generatedSchedule = FULL_DAYS.map((d, i) => ({
          dayName: d,
          focus: i % 2 === 0 ? 'Full Body' : 'Rest Day',
          isRest: i % 2 !== 0,
          exercises: i % 2 === 0 ? ['Jumping Jacks', 'Push-ups', 'Squats'] : [],
          analysis:
            i % 2 === 0
              ? 'A balanced training day to build strength and endurance.'
              : 'Take the day off to rest and recover.',
        }));
      } else {
        const parsedObj =
          typeof aiJson.data === 'string' ? JSON.parse(aiJson.data) : aiJson.data;
        generatedSchedule = parsedObj?.schedule || [];
      }

      setLoadingText('Mapping to WGER Exercises...');

      const wgerRes = await fetch(apiUrl('/api/exercises?limit=800'));
      if (!wgerRes.ok) throw new Error('Exercises API Error');

      const wgerJson = await wgerRes.json();
      const allExercises = wgerJson.data || [];

      const finalSchedule = FULL_DAYS.map((fullDayName, idx) => {
        let dayObj = generatedSchedule.find(
          (d) => String(d.dayName).toLowerCase() === fullDayName.toLowerCase()
        );

        if (!dayObj && generatedSchedule[idx]) {
          dayObj = generatedSchedule[idx];
        }

        if (!dayObj) {
          dayObj = {
            dayName: fullDayName,
            focus: 'Rest Day',
            isRest: true,
            exercises: [],
            analysis:
              'Take the day off to rest and recover. Drink plenty of water and prioritize quality sleep to repair.',
          };
        }

        const mappedExercises = (dayObj.exercises || []).map((exName) => {
          const cleanName = typeof exName === 'string' ? exName.toLowerCase() : '';
          const match = allExercises.find((ex) =>
            ex.name?.toLowerCase().includes(cleanName)
          );

          if (match) return match;

          const randomEx =
            allExercises.length > 0
              ? allExercises[Math.floor(Math.random() * allExercises.length)]
              : null;

          return {
            ...(randomEx || {}),
            name: exName,
            gifUrl:
              randomEx?.gifUrl ||
              'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
            bodyPart: randomEx?.bodyPart || 'full body',
          };
        });

        return {
          ...dayObj,
          dayName: fullDayName,
          mappedExercises,
        };
      });

      const todayIdx = new Date().getDay() - 1;

      const generatedPlan = {
        metadata: formData,
        schedule: finalSchedule,
      };

      localStorage.setItem('fitverse_workout_plan', JSON.stringify(generatedPlan));
      setPlanData(generatedPlan);
      setHasPlan(true);
      setSelectedDayIdx(todayIdx === -1 ? 6 : todayIdx);
    } catch (err) {
      console.error('Failed to generate plan', err);
      alert('Error generating plan from Gemini or exercise backend.');
    } finally {
      setLoading(false);
    }
  };

  const resetPlan = () => {
    localStorage.removeItem('fitverse_workout_plan');
    setHasPlan(false);
    setPlanData(null);
  };

  const handleStartWorkout = () => {
    const activeDay = planData?.schedule ? planData.schedule[selectedDayIdx] : null;
    if (!activeDay || activeDay.isRest) return;

    const finalEx = (activeDay.mappedExercises || []).map((ex, idx) => ({
      id: Date.now() + idx,
      name: ex.name,
      sets: [
        { id: Date.now() + 1000 + idx, weight: '0', reps: '0' },
        { id: Date.now() + 2000 + idx, weight: '0', reps: '0' },
      ],
    }));

    initSession(`Plan: ${activeDay.dayName} - ${activeDay.focus}`, finalEx);
    startTimer();
    navigate('/workouts');
  };

  const activeDay = planData?.schedule?.[selectedDayIdx] || {
    dayName: FULL_DAYS[selectedDayIdx],
    focus: 'Data Missing',
    isRest: true,
    analysis:
      'Please click the top-right refresh icon to cleanly regenerate your complete 7-day schedule.',
    mappedExercises: [],
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8 pb-24 md:pb-20"
    >
      <AnimatePresence mode="wait">
        {!hasPlan ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Smart Weekly Workout Plan
              </h1>
              <p className="text-zinc-400 text-sm md:text-base">
                Dynamically generate a complete Monday to Sunday schedule using Gemini AI and WGER.
              </p>
            </div>

            <div className="glass-card p-6 md:p-8 max-w-2xl border border-brand-500/20">
              <form onSubmit={generatePlan} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-brand-400" /> Current Weight
                    </label>
                    <input
                      required
                      type="text"
                      name="weight"
                      placeholder="e.g., 75 kg or 165 lbs"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-400" /> Height
                    </label>
                    <input
                      required
                      type="text"
                      name="height"
                      placeholder="e.g., 180 cm or 5'11"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-brand-400" /> Days per week you can workout
                  </label>
                  <select
                    name="days"
                    value={formData.days}
                    onChange={handleChange}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                  >
                    <option value="3">3 Days</option>
                    <option value="4">4 Days</option>
                    <option value="5">5 Days</option>
                    <option value="6">6 Days</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-400" /> Goal & Gender
                  </label>
                  <div className="flex gap-4">
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="w-1/2 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                    >
                      <option value="General Fitness">General Fitness</option>
                      <option value="Muscular">Muscular / Hypertrophy</option>
                      <option value="Lean">Lean Muscle</option>
                      <option value="Fat Loss">Fat Loss & Toning</option>
                    </select>

                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-1/2 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-400 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)] flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{loadingText}</span>
                    </div>
                  ) : (
                    <>
                      <Dumbbell className="w-5 h-5" />
                      Generate Plan
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col min-h-[85vh] bg-dark-900 rounded-[40px] border border-white/5 shadow-2xl pb-16 relative overflow-hidden"
          >
            <div className="pt-8 px-6 sm:px-10 pb-10 bg-dark-800 flex flex-col relative z-10 border-b border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
                  Your Plan
                </h1>
                <button
                  onClick={resetPlan}
                  className="p-2 sm:p-2.5 bg-dark-900 hover:bg-white/5 border border-white/5 rounded-xl transition-all shadow-sm"
                >
                  <RefreshCcw className="w-5 h-5 text-zinc-400 hover:text-white" />
                </button>
              </div>

              <p className="uppercase text-xs tracking-widest font-bold mb-8 text-brand-400">
                {planData.metadata.goal} • WEEK 1
              </p>

              <div className="flex justify-between items-center w-full max-w-md mx-auto mb-2 bg-dark-900 border border-white/5 p-2 rounded-[24px]">
                {DAYS_OF_WEEK.map((d, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 cursor-pointer group p-1"
                    onClick={() => setSelectedDayIdx(i)}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all',
                        selectedDayIdx === i
                          ? 'bg-brand-500 text-dark-900 shadow-[0_0_15px_rgba(59,130,246,0.5)] transform scale-105'
                          : 'bg-transparent text-zinc-500 group-hover:text-zinc-300 hover:bg-white/5'
                      )}
                    >
                      {d}
                    </div>

                    <div className="h-1.5 w-1.5 shrink-0 flex justify-center">
                      {selectedDayIdx !== i && planData.schedule[i]?.isRest === false && (
                        <div className="w-1.5 h-1.5 bg-brand-500/50 rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 px-4 sm:px-6 relative z-20 mt-8 mb-4">
              {activeDay && (
                <motion.div
                  key={selectedDayIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-800 rounded-[32px] p-6 border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-lg mx-auto text-white min-h-[400px]"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center shadow-inner border border-brand-500/20">
                      <User className="text-brand-400 w-7 h-7" />
                    </div>

                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {activeDay.focus}
                      </h2>
                      <p className="text-zinc-400 font-medium">
                        {activeDay.isRest ? 'Rest & Recover' : 'Today'}
                      </p>
                    </div>

                    <button className="p-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors">
                      <MoreHorizontal className="w-6 h-6 text-zinc-500" />
                    </button>
                  </div>

                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium bg-dark-900 p-4 rounded-xl border border-white/5">
                    {activeDay.analysis ||
                      (activeDay.isRest
                        ? 'Take the day off to rest and recover. Drink plenty of water and prioritize quality sleep to repair.'
                        : 'Scientifically proven to provide the best results in the shortest possible time. Push your limits.')}
                  </p>

                  {!activeDay.isRest && (
                    <button
                      onClick={handleStartWorkout}
                      className="w-full bg-brand-500 rounded-2xl py-4 text-dark-900 font-black text-lg flex items-center justify-center gap-2 hover:bg-brand-400 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-8"
                    >
                      <Play className="w-5 h-5 fill-dark-900" />
                      Start Workout
                    </button>
                  )}

                  {!activeDay.isRest && activeDay.mappedExercises?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Exercises</h3>
                      <div className="space-y-4">
                        {activeDay.mappedExercises.map((ex, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors"
                          >
                            <div className="w-16 h-16 bg-white/10 rounded-xl overflow-hidden p-1 flex items-center justify-center relative backdrop-blur-sm border border-white/5">
                              <img
                                src={
                                  ex.gifUrl ||
                                  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80'
                                }
                                alt={ex.name || 'Exercise image'}
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/20 transition-colors" />
                            </div>

                            <div className="flex-1">
                              <p className="font-bold text-white capitalize text-sm group-hover:text-brand-400 transition-colors">
                                {ex.name}
                              </p>
                              <p className="text-xs text-zinc-500 capitalize mt-0.5">
                                {ex.bodyPart || 'Full Body'}
                              </p>
                            </div>

                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:border-brand-500 group-hover:bg-brand-500/10 transition-all">
                              <Play className="w-3.5 h-3.5 ml-0.5 group-hover:fill-brand-400 group-hover:text-brand-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeDay.isRest && (
                    <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
                      <Check className="w-12 h-12 text-emerald-500 mb-4 bg-emerald-500/10 rounded-full p-2" />
                      <p className="font-bold">Rest Day</p>
                      <p className="text-zinc-500 text-sm mt-1">No exercises scheduled</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
