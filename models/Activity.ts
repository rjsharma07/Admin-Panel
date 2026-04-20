import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
  action: string;
  details: string;
  adminName: string;
  timestamp: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    action: { 
      type: String, 
      required: true 
    },
    details: { 
      type: String, 
      required: true 
    },
    adminName: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
  }
);

// Check if the model already exists to prevent duplication during HMR
const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
