import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProfileStore = create(
  persist(
    (set) => ({
      localPhotoURL: "",
      goal: "Muscle Gain",
      level: "Intermediate",
      age: 28,
      weight: 80,
      height: 180,
      gender: "Male",
      diet: "None",
      updateProfileData: (data) => set((state) => ({ ...state, ...data }))
    }),
    {
      name: 'fitness-profile-storage', // saves perfectly to localStorage seamlessly!
    }
  )
);
