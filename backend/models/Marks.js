const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  examName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  scores: {
    math: { type: Number, default: 0 },
    science: { type: Number, default: 0 },
    english: { type: Number, default: 0 },
  },
  totalScore: { type: Number },
  maxScore: { type: Number, default: 300 },
  attendance: { type: Number, required: true }, // Percentage (0-100)
  disciplinePoint: { type: Number, required: true }, // Rating (1-10)
  remarks: { type: String },
}, { timestamps: true });

marksSchema.pre('save', function(next) {
  this.totalScore = this.scores.math + this.scores.science + this.scores.english;
  next();
});

module.exports = mongoose.model('Marks', marksSchema);
