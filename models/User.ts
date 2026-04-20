import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'Admin' | 'User' | 'Editor';
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    phoneNumber: { 
      type: String,
      unique: true,
      sparse: true // Allow multiple nulls/empty if needed, though unique usually fails on multiple nulls if not sparse
    },
    role: {
      type: String,
      enum: ['Admin', 'User', 'Editor'],
      default: 'User',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { 
    timestamps: true 
  }
);

// Check if the model already exists to prevent duplication during HMR
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
