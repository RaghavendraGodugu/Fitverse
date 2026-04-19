import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    age: Number,
    height: Number, // in cm
    weight: Number, // in kg
    gender: String,
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    goal: {
      type: String,
      enum: ['Fat loss', 'Muscle gain', 'Maintenance', 'Strength'],
      default: 'Maintenance'
    },
    dietaryPreference: String
  },
  streak: { type: Number, default: 0 },
  lastActive: Date
}, { timestamps: true });

export default mongoose.model('User', userSchema);
