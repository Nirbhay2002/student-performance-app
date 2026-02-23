const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  testNames: {
    physics: { type: String, default: 'Combined test' },
    chemistry: { type: String, default: 'Combined test' },
    maths: { type: String, default: 'Combined test' },
    botany: { type: String, default: 'Combined test' },
    zoology: { type: String, default: 'Combined test' },
  },
  date: { type: Date, default: Date.now },
  scores: {
    // null = absent for that subject, 0 = appeared but scored zero
    physics: { type: Number, default: null },
    chemistry: { type: Number, default: null },
    maths: { type: Number, default: null }, // For Non-Medical
    botany: { type: Number, default: null }, // For Medical
    zoology: { type: Number, default: null }, // For Medical
  },
  maxScores: {
    physics: { type: Number, default: 100 },
    chemistry: { type: Number, default: 100 },
    maths: { type: Number, default: 100 },
    botany: { type: Number, default: 100 },
    zoology: { type: Number, default: 100 },
  },
  totalScore: { type: Number },
  maxScore: { type: Number },
  attendance: { type: Number, required: true }, // Percentage (0-100)
  remarks: { type: String },
}, { timestamps: true });

// Helper: only include subjects the student actually appeared in
const addIfPresent = (score, max) => ({ score: score ?? null, max });

marksSchema.pre('save', async function () {
  const stream = await mongoose.model('Student').findById(this.studentId).select('stream');

  // Core subjects always included
  let totalScore = 0;
  let maxScore = 0;

  const phy = this.scores.physics;
  const chem = this.scores.chemistry;

  if (phy !== null && phy !== undefined) { totalScore += phy; maxScore += (this.maxScores.physics || 100); }
  if (chem !== null && chem !== undefined) { totalScore += chem; maxScore += (this.maxScores.chemistry || 100); }

  if (stream && stream.stream === 'Medical') {
    const bot = this.scores.botany;
    const zoo = this.scores.zoology;
    if (bot !== null && bot !== undefined) { totalScore += bot; maxScore += (this.maxScores.botany || 100); }
    if (zoo !== null && zoo !== undefined) { totalScore += zoo; maxScore += (this.maxScores.zoology || 100); }
  } else {
    const mth = this.scores.maths;
    if (mth !== null && mth !== undefined) { totalScore += mth; maxScore += (this.maxScores.maths || 100); }
  }

  this.totalScore = totalScore;
  this.maxScore = maxScore;
});

module.exports = mongoose.model('Marks', marksSchema);
