import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Flame, Target, Trophy, Clock, Brain, Activity, Dumbbell, Play, Calendar, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useProfileStore } from '../store/useProfileStore';
import {
  computeCurrentStreak,
  computeWorkoutsLast7Days,
  buildQuickInsights,
} from '../utils/analytics';
import { cn } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, gradient }) => (
  <motion.div variants={itemVariants} className="glass-card p-5 sm:p-6 relative overflow-hidden group">
    <div
      className={cn(
        'absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity',
        gradient
      )}
    />
    <div className="flex justify-between items-start mb-4">
      <div className="min-w-0 pr-2">
        <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white break-words">{value}</h3>
      </div>
      <div className={cn('p-3 rounded-xl bg-white/5 border border-white/10 shrink-0', colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="text-sm text-zinc-500 font-medium flex items-center gap-1 flex-wrap">{subtitle}</p>
  </motion.div>
);

export default function Home() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Athlete';
  const { isSessionActive, sessionTime, activeRoutineName, workoutHistory, savedRoutines } = useWorkoutStore();
  const { goal, level } = useProfileStore();

  const streak = useMemo(() => computeCurrentStreak(workoutHistory), [workoutHistory]);
  const weekCount = useMemo(() => computeWorkoutsLast7Days(workoutHistory), [workoutHistory]);
  const insights = useMemo(() => buildQuickInsights(workoutHistory), [workoutHistory]);

  const suggestedNext = useMemo(() => {
    if (savedRoutines?.length) return savedRoutines[0].name;
    const sorted = [...(workoutHistory || [])].sort((a, b) => (b.id || 0) - (a.id || 0));
    return sorted[0]?.name || 'Freestyle session';
  }, [savedRoutines, workoutHistory]);

  const totalSessions = workoutHistory?.length ?? 0;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 pb-20 md:pb-16"
    >
      {isSessionActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-4 flex flex-col md:flex-row shadow-[0_0_20px_rgba(59,130,246,0.12)] justify-between items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse shrink-0" />
            <div>
              <p className="text-brand-400 font-bold">Active workout</p>
              <p className="text-xs text-brand-500/80 uppercase tracking-widest font-mono font-bold mt-1">
                {activeRoutineName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-2xl font-mono text-white font-bold">{formatTime(sessionTime)}</div>
            <Link
              to="/workouts"
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-lg font-bold text-sm transition-colors touch-manipulation text-center"
            >
              Open tracker
            </Link>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 capitalize">
            Welcome back, <span className="text-brand-400">{displayName}</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            Suggested focus:{' '}
            <span className="text-white font-medium">{suggestedNext}</span> (from your routines or last session).
          </p>
        </div>
        {!isSessionActive && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
            <Link
              to="/plan"
              className="flex justify-center bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 px-6 py-3 rounded-xl font-bold items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] touch-manipulation sm:hover:-translate-y-1"
            >
              <ClipboardList className="w-5 h-5" />
              {localStorage.getItem('fitverse_workout_plan') ? 'Smart Workout Plan' : 'Create Smart Workout Plan'}
            </Link>
            <Link
              to="/workouts"
              className="flex justify-center bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-xl font-bold items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] touch-manipulation sm:hover:-translate-y-1"
            >
              <Dumbbell className="w-5 h-5" />
              Start session
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Current streak"
          value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
          subtitle={
            <>
              <Flame className="w-4 h-4 text-orange-500 shrink-0" /> From your workout history
            </>
          }
          icon={Flame}
          colorClass="text-orange-400"
          gradient="bg-orange-500"
        />
        <StatCard
          title="Goal"
          value={goal}
          icon={Target}
          colorClass="text-blue-400"
          gradient="bg-blue-500"
        />
        <StatCard
          title="Level"
          value={level}
          subtitle={
            <>
              <Trophy className="w-4 h-4 text-yellow-500 shrink-0" /> {totalSessions} sessions logged
            </>
          }
          icon={Trophy}
          colorClass="text-yellow-400"
          gradient="bg-yellow-500"
        />
        <StatCard
          title="Last 7 days"
          value={`${weekCount}/7`}
          subtitle="Distinct days with a finished workout"
          icon={Activity}
          colorClass="text-brand-400"
          gradient="bg-brand-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 glass-card p-4 sm:p-6 flex flex-col relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-brand-500/10 transition-colors" />

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 border-b border-white/5 pb-4 relative z-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-brand-500 shrink-0" />
                Training calendar
              </h2>
              <p className="text-zinc-400 text-sm mt-1">This month — days match saved workout history</p>
            </div>
            <div className="bg-dark-900 border border-white/10 text-white text-sm font-bold rounded-lg px-4 py-2 w-fit">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 flex-1 relative z-10">
            <div className="flex-1 bg-dark-900/40 rounded-2xl p-4 sm:p-5 border border-white/5 shadow-inner min-w-0">
              <div className="flex justify-between items-center mb-4 gap-2">
                <h3 className="text-sm font-bold text-zinc-300">Activity</h3>
                <div className="flex gap-2 text-xs items-center text-zinc-500 shrink-0">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-sm bg-white/5" />
                  <div className="w-3 h-3 rounded-sm bg-brand-500/40" />
                  <div className="w-3 h-3 rounded-sm bg-brand-500" />
                  <span>More</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                  <div key={day} className="text-center text-[10px] sm:text-xs font-bold text-zinc-500 mb-1">
                    {day}
                  </div>
                ))}

                {Array.from({ length: 35 }).map((_, i) => {
                  const d = new Date();
                  const today = d.getDate();
                  const isToday = i + 1 === today;
                  const isFuture = i + 1 > today;
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(i + 1).padStart(2, '0');
                  const dateStr = `${year}-${month}-${dayStr}`;
                  const hasWorkout = workoutHistory?.some((w) => w.date === dateStr);

                  return (
                    <div
                      key={i}
                      className={cn(
                        'aspect-square rounded-md flex items-center justify-center text-[10px] sm:text-xs transition-all relative border min-h-[28px]',
                        isToday ? 'border-brand-500 text-white font-bold bg-brand-500/20' : 'border-transparent',
                        !isToday && !isFuture && hasWorkout ? 'bg-brand-500 text-white font-bold' : '',
                        !isToday && !isFuture && !hasWorkout ? 'bg-white/5 text-zinc-600' : '',
                        isFuture ? 'bg-transparent text-zinc-700 border border-white/5' : ''
                      )}
                    >
                      {i + 1 <= 31 ? i + 1 : ''}
                      {isToday && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full md:w-[280px] flex flex-col gap-4 shrink-0">
              <div className="bg-gradient-to-br from-brand-500/10 to-transparent border border-brand-500/20 rounded-2xl p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-brand-400 shrink-0" />
                  <h3 className="font-bold text-white">Today&apos;s target</h3>
                </div>
                <h4 className="text-xl sm:text-2xl font-black mb-1 break-words">{suggestedNext}</h4>
                <p className="text-xs text-brand-200 mt-auto leading-relaxed">
                  {streak > 0
                    ? `You're on a ${streak}-day streak. Logging today keeps it going.`
                    : 'Finish a session today to start a streak from your real workout data.'}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Status</h3>
                  {(() => {
                    const dt = new Date();
                    const localTodayStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
                    const workoutDoneToday = workoutHistory?.some((w) => w.date === localTodayStr);

                    if (isSessionActive) {
                      return (
                        <span className="text-sm font-bold text-brand-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shrink-0" />
                          In progress
                        </span>
                      );
                    }
                    if (workoutDoneToday) {
                      return <span className="text-sm font-bold text-brand-400">Completed</span>;
                    }
                    return <span className="text-sm font-bold text-zinc-300">Not started</span>;
                  })()}
                </div>
                <div className="w-10 h-10 rounded-full bg-dark-900 border border-white/5 flex items-center justify-center shrink-0">
                  {isSessionActive ? (
                    <Activity className="w-4 h-4 text-brand-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
              </div>

              {!isSessionActive && (
                <Link
                  to="/workouts"
                  className="w-full py-4 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.45)] flex justify-center items-center gap-2 touch-manipulation"
                >
                  <Play className="w-5 h-5 fill-current shrink-0" />
                  Start today&apos;s workout
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        <div className="space-y-6 lg:space-y-8 flex flex-col">
          <motion.div
            variants={itemVariants}
            className="glass-card p-5 sm:p-6 flex-1 bg-gradient-to-br from-[#141414] to-brand-950/30 border-brand-500/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
                <Brain className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">Insights</h2>
            </div>

            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-4 rounded-xl border flex gap-3 items-start',
                    insight.type === 'warning'
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-200'
                      : insight.type === 'success'
                        ? 'bg-brand-500/10 border-brand-500/20 text-brand-200'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-200'
                  )}
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full mt-2.5 shrink-0',
                      insight.type === 'warning'
                        ? 'bg-orange-500'
                        : insight.type === 'success'
                          ? 'bg-brand-500'
                          : 'bg-blue-500'
                    )}
                  />
                  <p className="text-sm leading-relaxed">{insight.message}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
