import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserScratchCard extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const UserScratchCardSchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const UserScratchCard: Model<IUserScratchCard> = mongoose.models.UserScratchCard || mongoose.model<IUserScratchCard>("UserScratchCard", UserScratchCardSchema);
export default UserScratchCard;
