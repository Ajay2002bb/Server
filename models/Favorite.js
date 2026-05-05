const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  template_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
  },
}, { timestamps: true });

// Ensure a user can only favorite a template once
favoriteSchema.index({ user_id: 1, template_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
