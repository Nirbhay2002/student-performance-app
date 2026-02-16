const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  examName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  scores: {
    physics: { type: Number, default: 0 },
    chemistry: { type: Number, default: 0 },
    maths: { type: Number, default: 0 }, // For Non-Medical
    bio: { type: Number, default: 0 },   // For Medical
  },
  totalScore: { type: Number },
  maxScore: { type: Number, default: 300 },
  attendance: { type: Number, required: true }, // Percentage (0-100)
  disciplinePoint: { type: Number, required: true }, // Rating (1-10)
  remarks: { type: String },
}, { timestamps: true });

marksSchema.pre('save', function () {
  this.totalScore = (this.scores.physics || 0) + (this.scores.chemistry || 0) + (this.scores.maths || 0) + (this.scores.bio || 0);
});

module.exports = mongoose.model('Marks', marksSchema);
