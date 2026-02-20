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
  maxScores: {
    physics: { type: Number, default: 100 },
    chemistry: { type: Number, default: 100 },
    maths: { type: Number, default: 100 },
    bio: { type: Number, default: 100 },
  },
  totalScore: { type: Number },
  maxScore: { type: Number },
  attendance: { type: Number, required: true }, // Percentage (0-100)
  remarks: { type: String },
}, { timestamps: true });

marksSchema.pre('save', async function () {
  const stream = await mongoose.model('Student').findById(this.studentId).select('stream');
  this.totalScore = (this.scores.physics || 0) + (this.scores.chemistry || 0);
  this.maxScore = (this.maxScores.physics || 100) + (this.maxScores.chemistry || 100);

  if (stream && stream.stream === 'Medical') {
    this.totalScore += (this.scores.bio || 0);
    this.maxScore += (this.maxScores.bio || 100);
  } else {
    this.totalScore += (this.scores.maths || 0);
    this.maxScore += (this.maxScores.maths || 100);
  }
});

module.exports = mongoose.model('Marks', marksSchema);
