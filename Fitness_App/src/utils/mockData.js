export const mockProfile = {
  name: "Alex",
  age: 28,
  goal: "Muscle Gain",
  streak: 12,
  level: "Intermediate",
  nextWorkout: "Upper Body Power",
};

export const weeklyActivity = [
  { day: 'Mon', duration: 45, volume: 4500 },
  { day: 'Tue', duration: 60, volume: 5200 },
  { day: 'Wed', duration: 0, volume: 0 },
  { day: 'Thu', duration: 55, volume: 4800 },
  { day: 'Fri', duration: 70, volume: 6100 },
  { day: 'Sat', duration: 40, volume: 3800 },
  { day: 'Sun', duration: 0, volume: 0 },
];

export const aiInsights = [
  {
    type: "warning",
    message: "You are overtraining chest. Consider reducing volume next session."
  },
  {
    type: "success",
    message: "Great job keeping your 12-day streak! You are 5% stronger this week."
  },
  {
    type: "info",
    message: "Diet check: Ensure you consume enough protein today for muscle recovery."
  }
];

export const recentWorkouts = [
  { id: 1, name: "Push Day (Hypertrophy)", date: "Today", duration: "60 min", intensity: "High" },
  { id: 2, name: "Pull Day (Strength)", date: "Yesterday", duration: "55 min", intensity: "Medium" },
  { id: 3, name: "Legs (Quads Focus)", date: "3 Days ago", duration: "70 min", intensity: "Very High" },
];
