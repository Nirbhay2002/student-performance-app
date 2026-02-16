const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true }, // Parent's email
  batch: { type: String, default: 'General' },
  category: { type: String, enum: ['Best', 'Medium', 'Worst'], default: 'Medium' },
  performanceScore: { type: Number, default: 0 },
  averageMarks: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
