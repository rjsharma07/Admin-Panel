import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserPolicy extends Document {
  userId: mongoose.Types.ObjectId;
  policyUrl: string;
  createdAt: Date;
}

const UserPolicySchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  policyUrl: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const UserPolicy: Model<IUserPolicy> = mongoose.models.UserPolicy || mongoose.model<IUserPolicy>("UserPolicy", UserPolicySchema);
export default UserPolicy;
