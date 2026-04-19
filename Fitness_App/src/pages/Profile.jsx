import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Save, Dumbbell, Shield, ShieldCheck, Edit, Camera, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { useProfileStore } from '../store/useProfileStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const profileStore = useProfileStore();

  // States
  const [displayName, setDisplayName] = useState(user?.displayName || user?.email?.split('@')[0] || 'Athlete');
  const [photoURL, setPhotoURL] = useState(profileStore.localPhotoURL || user?.photoURL || '');
  const fileInputRef = React.useRef(null);

  const [localProfile, setLocalProfile] = useState({
    goal: profileStore.goal,
    level: profileStore.level,
    age: profileStore.age,
    weight: profileStore.weight,
    height: profileStore.height,
    gender: profileStore.gender || "Male",
    diet: profileStore.diet
  });

  const handleUpdateProfile = async () => {
    setSaving(true);
    setError('');
    try {
      if (user) {
        // Firebase strictly blocks updating large Base64 URLs natively ('photoURL too long').
        // We gracefully push the displayName to Firebase:
        await updateUserProfile({ displayName });
        
        // And exclusively push the massive base64 payload into our native local robust persistence engine:
        profileStore.updateProfileData({ localPhotoURL: photoURL });
      }
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Please select an image smaller than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBiometrics = () => {
    profileStore.updateProfileData(localProfile);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 max-w-4xl"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-zinc-400">Manage your attributes for the AI Coach context.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2">
           <AlertCircle className="w-5 h-5 flex-shrink-0" />
           <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        
        {/* Left Column - Avatar & Core Details */}
        <motion.div variants={itemVariants} className="col-span-1 space-y-6">
          <div className="glass-card p-6 flex flex-col items-center text-center relative group overflow-hidden">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400"
              >
                 <Edit className="w-4 h-4" />
              </button>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
            />

            <div 
              className={cn("w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 p-1 mb-4 relative", isEditing && "cursor-pointer")}
              onClick={() => isEditing && fileInputRef.current?.click()}
            >
              <div className="w-full h-full bg-dark-900 rounded-full flex items-center justify-center border-2 border-transparent overflow-hidden">
                {photoURL ? (
                   <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (user?.photoURL ? (
                   <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                   <User className="w-10 h-10 text-brand-400" />
                ))}
              </div>
              {isEditing && (
                 <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Upload</span>
                 </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="w-full space-y-3 mt-2 text-left">
                 <div>
                   <label className="text-xs text-zinc-500 font-medium ml-1">Display Name</label>
                   <input 
                     type="text" 
                     value={displayName}
                     onChange={(e) => setDisplayName(e.target.value)}
                     className="w-full mt-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                   />
                 </div>
                 <button 
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="w-full mt-4 bg-brand-500 text-dark-900 font-bold py-2.5 rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:opacity-80 flex items-center justify-center gap-2"
                 >
                   <Save className="w-4 h-4" />
                   {saving ? "Saving..." : "Save Profile"}
                 </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold capitalize">{displayName}</h2>
                <p className="text-xs text-zinc-400 mb-2">{user?.email}</p>
                <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1 justify-center">
                  <ShieldCheck className="w-4 h-4 text-brand-500" /> Pro Member
                </p>
              </>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Dumbbell className="w-5 h-5 text-brand-400" /> Goal Setup
            </h3>
            <div className="space-y-4">
               <div>
                  <label className="text-xs text-zinc-500 font-medium ml-1">Current Goal</label>
                  <select 
                    value={localProfile.goal}
                    onChange={(e) => setLocalProfile({...localProfile, goal: e.target.value})}
                    className="w-full mt-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Fat Loss">Fat Loss</option>
                    <option value="Strength">Strength</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs text-zinc-500 font-medium ml-1">Fitness Level</label>
                  <select 
                    value={localProfile.level}
                    onChange={(e) => setLocalProfile({...localProfile, level: e.target.value})}
                    className="w-full mt-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Biometrics & Account */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-xl">
              <Settings className="w-5 h-5 text-zinc-400" /> Biometrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-zinc-500 font-medium ml-1">Age</label>
                <input 
                  type="number" 
                  value={localProfile.age} 
                  onChange={(e) => setLocalProfile({...localProfile, age: Number(e.target.value)})}
                  className="w-full mt-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-medium ml-1">Weight (kg)</label>
                <input 
                  type="number" 
                  value={localProfile.weight} 
                  onChange={(e) => setLocalProfile({...localProfile, weight: Number(e.target.value)})}
                  className="w-full mt-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-medium ml-1">Height (cm)</label>
                <input 
                  type="number" 
                  value={localProfile.height}
                  onChange={(e) => setLocalProfile({...localProfile, height: Number(e.target.value)})}
                  className="w-full mt-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-medium ml-1">Gender</label>
                <select 
                  value={localProfile.gender}
                  onChange={(e) => setLocalProfile({...localProfile, gender: e.target.value})}
                  className="w-full mt-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-medium ml-1">Dietary Preference</label>
                <select 
                  value={localProfile.diet}
                  onChange={(e) => setLocalProfile({...localProfile, diet: e.target.value})}
                  className="w-full mt-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="None">None</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Keto">Keto</option>
                  <option value="High Protein">High Protein</option>
                </select>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSaveBiometrics}
                className="bg-brand-500 hover:bg-brand-400 text-dark-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
          
          <div className="glass-card p-6 border-red-500/20 bg-red-500/5">
            <h3 className="font-bold flex items-center gap-2 mb-2 text-red-400">
              <Shield className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-sm text-zinc-400 mb-4">Permanently delete your account and all associated workout data.</p>
            <button className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-all">
              Delete Account
            </button>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
