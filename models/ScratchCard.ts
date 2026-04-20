import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScratchCard extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  code: string;
  isRedeemed: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScratchCardSchema: Schema = new Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    code: { 
      type: String, 
      unique: true, 
      required: true 
    },
    isRedeemed: { 
      type: Boolean, 
      default: false 
    },
    expiresAt: { 
      type: Date 
    },
  },
  { 
    timestamps: true 
  }
);

// Indexing for faster lookups
ScratchCardSchema.index({ code: 1 });
ScratchCardSchema.index({ userId: 1 });

const ScratchCard: Model<IScratchCard> = mongoose.models.ScratchCard || mongoose.model<IScratchCard>('ScratchCard', ScratchCardSchema);

export default ScratchCard;
