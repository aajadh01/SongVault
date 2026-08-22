import mongoose from 'mongoose';

const RecordingSchema = new mongoose.Schema(
  {
    siblingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sibling',
      required: [true, 'Sibling reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Recording title is required'],
      trim: true,
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required'],
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    backgroundMediaType: {
      type: String,
      enum: ['video', 'image', 'none'],
      default: 'none',
      required: true,
    },
    backgroundVideoUrl: {
      type: String,
      default: '',
    },
    backgroundImageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    personalMessage: {
      type: String,
      default: '',
      trim: true,
    },
    lyrics: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

RecordingSchema.index({ siblingId: 1, order: 1 });

export const Recording = mongoose.model('Recording', RecordingSchema);
