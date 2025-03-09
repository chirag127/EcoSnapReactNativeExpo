import mongoose from 'mongoose';

const ClassificationSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  classification: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Classification', ClassificationSchema);
