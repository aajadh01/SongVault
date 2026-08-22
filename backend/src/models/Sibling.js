import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SiblingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sibling name is required'],
      trim: true,
    },
    cardId: {
      type: String,
      required: [true, 'Card ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]{4,16}$/, 'Card ID must be 4-16 alphanumeric characters'],
    },
    secretCodeHash: {
      type: String,
      required: [true, 'Secret code hash is required'],
    },
    hint: {
      type: String,
      default: '',
      trim: true,
    },
    profileImageUrl: {
      type: String,
      default: '',
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    welcomeMessage: {
      type: String,
      default: 'Some memories deserve their own little place. ♡',
      trim: true,
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

// Method to verify secret code
SiblingSchema.methods.verifySecretCode = async function (plainCode) {
  return bcrypt.compare(plainCode, this.secretCodeHash);
};

// Static helper to hash secret code
SiblingSchema.statics.hashSecretCode = async function (plainCode) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainCode, salt);
};

export const Sibling = mongoose.model('Sibling', SiblingSchema);
