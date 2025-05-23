import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedQuery extends Document {
  userId: number;
  name?: string;
  query: any;
  createdAt: Date;
}

const SavedQuerySchema = new Schema<ISavedQuery>(
  {
    userId: { type: Number, required: true },
    name: { type: String },
    query: { type: Schema.Types.Mixed, required: true },
  },
  {
    collection: 'saved_queries',
    timestamps: true,
  }
);

export const SavedQueryModel: Model<ISavedQuery> =
  mongoose.models.SavedQuery || mongoose.model<ISavedQuery>('SavedQuery', SavedQuerySchema);
