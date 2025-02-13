const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String
});

const UrlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  alias: { type: String, unique: true, required: true },
  topic: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analytics: [AnalyticsSchema]
});

module.exports = mongoose.model('Url', UrlSchema);
