import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { TrendingUp, Activity, Calendar, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWorkoutStore } from '../store/useWorkoutStore';
import {
  buildLiftProgression,
  buildMuscleDistribution,
  buildMonthlyConsistency,
  hasAnalyticsData,
} from '../utils/analytics';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const BAR_FILL = '#3b82f6';
const BAR_FILL_SOFT = 'rgba(59, 130, 246, 0.35)';

export default function Analytics() {
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);

  const progressionData = useMemo(() => buildLiftProgression(workoutHistory, 6), [workoutHistory]);
  const muscleDistribution = useMemo(() => buildMuscleDistribution(workoutHistory), [workoutHistory]);
  const monthlyData = useMemo(() => buildMonthlyConsistency(workoutHistory), [workoutHistory]);

  const hasHistory = hasAnalyticsData(workoutHistory);
  const hasLiftData = progressionData.some(
    (row) => row.bench != null || row.squat != null || row.deadlift != null
  );
  const hasMuscleData = muscleDistribution.some((m) => m.value > 0);
  const hasMonthlyData = monthlyData.some(w => w.sets > 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8 pb-24 md:pb-20"
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Analytics</h1>
        <p className="text-zinc-400 text-sm md:text-base">
          Metrics from your saved workouts (local storage). Finish sessions with exercises logged to fill these charts.
        </p>
      </div>

      {!hasHistory && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-6 md:p-8 flex flex-col items-center text-center gap-3 border border-brand-500/20"
        >
          <BarChart2 className="w-12 h-12 text-brand-400 opacity-80" />
          <h2 className="text-lg font-bold text-white">No workout history yet</h2>
          <p className="text-zinc-400 text-sm max-w-md">
            Start a session on Workouts, add exercises and sets, then tap <strong>Finish</strong>. Your data stays in this
            browser (local storage).
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <motion.div variants={itemVariants} className="glass-card p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">Lift progression</h2>
              <p className="text-xs md:text-sm text-zinc-400">
                Max weight per month (bench / squat / deadlift — matched from exercise names)
              </p>
            </div>
          </div>

          <div className="h-[260px] md:h-[300px] w-full min-w-0">
            {!hasLiftData ? (
              <p className="text-sm text-zinc-500 h-full flex items-center justify-center px-4 text-center">
                Log exercises whose names include bench, squat, or deadlift to see this chart.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="bench"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ fill: '#60a5fa', r: 3 }}
                    name="Bench"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="squat"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ fill: '#38bdf8', r: 3 }}
                    name="Squat"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="deadlift"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    dot={{ fill: '#a78bfa', r: 3 }}
                    name="Deadlift"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">Volume by muscle group</h2>
              <p className="text-xs md:text-sm text-zinc-400">Total sets inferred from exercise names</p>
            </div>
          </div>

          <div className="h-[260px] md:h-[300px] w-full min-w-0">
            {!hasMuscleData ? (
              <p className="text-sm text-zinc-500 h-full flex items-center justify-center px-4 text-center">
                No sets recorded yet. Older history entries without exercises only count toward the heatmap.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={muscleDistribution}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#fff"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={88}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Sets">
                    {muscleDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? BAR_FILL : BAR_FILL_SOFT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4 md:mb-8">
            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">Monthly Consistency</h2>
              <p className="text-xs md:text-sm text-zinc-400">Progression broken down by current month</p>
            </div>
          </div>

          {!hasMonthlyData ? (
            <p className="text-sm text-zinc-500 py-8 text-center">Complete at least one workout this month to see weekly progress.</p>
          ) : (
            <div className="h-[260px] md:h-[300px] w-full min-w-0">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                   <YAxis yAxisId="left" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={30} />
                   <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={40} />
                   <Tooltip
                     cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                     contentStyle={{
                       backgroundColor: '#18181b',
                       borderColor: 'rgba(255,255,255,0.1)',
                       borderRadius: '12px',
                     }}
                   />
                   <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                   <Bar yAxisId="left" dataKey="sets" name="Total Sets" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={24} />
                   <Bar yAxisId="right" dataKey="volume" name="Total Volume" fill="#f97316" radius={[4, 4, 0, 0]} barSize={24} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
