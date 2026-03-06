const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true }, // Parent's email
  batch: { type: String, default: 'General' },
  stream: { type: String, enum: ['Medical', 'Non-Medical'], required: true },
  category: { type: String, enum: ['Best', 'Medium', 'Worst'], default: 'Medium' },
  performanceScore: { type: Number, default: 0 },
  averageMarks: { type: Number, default: 0 },
  currentRank: { type: Number, default: 0 },
  previousRank: { type: Number, default: 0 },
  bestRank: { type: Number, default: 999999 },
  previousPerformanceScore: { type: Number, default: 0 }
}, { timestamps: true });

// Fix #4: Cascade-delete all marks AND attendance records when a student is removed
studentSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await mongoose.model('Marks').deleteMany({ studentId: this._id });
  await mongoose.model('Attendance').updateMany(
    { 'records.studentId': this._id },
    { $pull: { records: { studentId: this._id } } }
  );
});

// Also handle Model.deleteOne({ ... }) query-style deletions
studentSchema.pre('deleteOne', { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await mongoose.model('Marks').deleteMany({ studentId: doc._id });
    await mongoose.model('Attendance').updateMany(
      { 'records.studentId': doc._id },
      { $pull: { records: { studentId: doc._id } } }
    );
  }
});

// Handle findOneAndDelete (used by some Mongoose helpers)
studentSchema.pre('findOneAndDelete', async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await mongoose.model('Marks').deleteMany({ studentId: doc._id });
    await mongoose.model('Attendance').updateMany(
      { 'records.studentId': doc._id },
      { $pull: { records: { studentId: doc._id } } }
    );
  }
});

module.exports = mongoose.model('Student', studentSchema);
