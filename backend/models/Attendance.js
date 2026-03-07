const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['Present', 'Absent'], default: 'Present' }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    batch: { type: String, required: true },
    subBatch: { type: String, default: 'None' },
    stream: { type: String, enum: ['Medical', 'Non-Medical'], required: true },
    records: [attendanceRecordSchema],
}, { timestamps: true });

// Normalize the date to midnight UTC before saving so "same day" comparison works
attendanceSchema.pre('save', function (next) {
    const d = new Date(this.date);
    d.setUTCHours(0, 0, 0, 0);
    this.date = d;
    next();
});

// One session per batch+subBatch+stream per day
attendanceSchema.index({ date: 1, batch: 1, subBatch: 1, stream: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
