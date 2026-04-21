import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPolicy extends Document {
  userId: mongoose.Types.ObjectId;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

const PolicySchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number 
  },
  mimeType: { 
    type: String 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Avoid model re-compilation in development
const Policy: Model<IPolicy> = mongoose.models.Policy || mongoose.model<IPolicy>("Policy", PolicySchema);

export default Policy;
