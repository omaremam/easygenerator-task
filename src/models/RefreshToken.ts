import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  ipAddress?: string;
  deviceName?: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  deviceName: {
    type: String,
    trim: true
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for efficient queries
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Method to check if token is valid
refreshTokenSchema.methods['isValid'] = function(): boolean {
  return !this['isRevoked'] && this['expiresAt'] > new Date();
};

// Static method to find valid token
refreshTokenSchema.statics['findValidToken'] = function(token: string) {
  return this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics['revokeAllForUser'] = function(userId: string) {
  return this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
};

// Static method to revoke specific token
refreshTokenSchema.statics['revokeToken'] = function(token: string) {
  return this.updateOne(
    { token },
    { isRevoked: true }
  );
};

// Static method to clean up expired tokens
refreshTokenSchema.statics['cleanupExpired'] = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

export default mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema); 