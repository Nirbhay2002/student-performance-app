const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Marks = require('../models/Marks');
const { calculatePerformance, calculateAverageMarks, recalculateAllCategories } = require('../logic/ranking');

// Helper: compute attendance % for a student from the Attendance collection
const getAttendancePct = async (studentId) => {
    const sessions = await Attendance.find({ 'records.studentId': studentId });
    if (sessions.length === 0) return null; // Signal "use fallback"

    let present = 0;
    for (const session of sessions) {
        const record = session.records.find(r => r.studentId.toString() === studentId.toString());
        if (record && record.status === 'Present') present++;
    }
    return Math.round((present / sessions.length) * 100);
};

// GET /api/attendance/student-summary
// Returns attendance % for every student who has at least one session
// Optional query: startDate, endDate
exports.getStudentSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        if (startDate) { const s = new Date(startDate); s.setUTCHours(0, 0, 0, 0); dateFilter.$gte = s; }
        if (endDate) { const e = new Date(endDate); e.setUTCHours(23, 59, 59, 999); dateFilter.$lte = e; }

        const matchStage = Object.keys(dateFilter).length ? { date: dateFilter } : {};

        const agg = await Attendance.aggregate([
            { $match: matchStage },
            { $unwind: '$records' },
            {
                $group: {
                    _id: '$records.studentId',
                    totalSessions: { $sum: 1 },
                    presentCount: { $sum: { $cond: [{ $eq: ['$records.status', 'Present'] }, 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $project: {
                    _id: 0,
                    studentId: '$_id',
                    name: '$student.name',
                    rollNumber: '$student.rollNumber',
                    totalSessions: 1,
                    presentCount: 1,
                    attendancePct: {
                        $round: [{ $multiply: [{ $divide: ['$presentCount', '$totalSessions'] }, 100] }, 0]
                    }
                }
            },
            { $sort: { name: 1 } }
        ]);

        res.json(agg);
    } catch (err) {
        console.error('❌ Error in getStudentSummary:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Helper: batch-compute attendance % for multiple students in ONE aggregate
const batchGetAttendancePct = async (studentIds) => {
    const objectIds = studentIds.map(id =>
        typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
    );

    const results = await Attendance.aggregate([
        { $match: { 'records.studentId': { $in: objectIds } } },
        { $unwind: '$records' },
        { $match: { 'records.studentId': { $in: objectIds } } },
        {
            $group: {
                _id: '$records.studentId',
                total: { $sum: 1 },
                present: { $sum: { $cond: [{ $eq: ['$records.status', 'Present'] }, 1, 0] } }
            }
        }
    ]);

    // Build a map: studentId (string) -> pct
    const map = {};
    results.forEach(r => {
        map[r._id.toString()] = r.total > 0 ? Math.round((r.present / r.total) * 100) : 0;
    });
    return map;
};

// Optimised batch recalculation: 4 DB ops total regardless of class size
const recalcStudents = async (studentIds) => {
    if (!studentIds || studentIds.length === 0) return;

    // 1. Batch-fetch attendance % for all students in one aggregate
    const attendancePctMap = await batchGetAttendancePct(studentIds);

    // 2. Batch-fetch all marks for all students in one query
    const allMarksArr = await Marks.find({ studentId: { $in: studentIds } }).lean();
    const marksByStudent = {};
    allMarksArr.forEach(m => {
        const key = m.studentId.toString();
        if (!marksByStudent[key]) marksByStudent[key] = [];
        marksByStudent[key].push(m);
    });

    // 3. Batch-fetch all student documents in one query
    const students = await Student.find({ _id: { $in: studentIds } }).lean();

    // 4. Compute scores and write all updates in a single bulkWrite
    const bulkOps = students.map(student => {
        const sid = student._id.toString();
        const marks = marksByStudent[sid] || [];
        const attendancePct = sid in attendancePctMap ? attendancePctMap[sid] : null;

        const score = calculatePerformance(marks, student.stream, attendancePct);
        const avgMarks = calculateAverageMarks(marks, student.stream);

        return {
            updateOne: {
                filter: { _id: student._id },
                update: {
                    previousPerformanceScore: student.performanceScore,
                    performanceScore: score,
                    averageMarks: avgMarks,
                }
            }
        };
    });

    if (bulkOps.length > 0) await Student.bulkWrite(bulkOps);

    // 5. Recalculate category buckets (Best/Medium/Worst) across all students
    await recalculateAllCategories(Student);

    console.log(`[Attendance] ✅ Recalculated scores for ${students.length} students in 4 DB ops`);
};


// POST /api/attendance
// Body: { date, batch, stream, records: [{ studentId, status }] }
exports.saveAttendance = async (req, res) => {
    try {
        const { date, batch, stream, records } = req.body;

        if (!date || !batch || !stream || !records || !Array.isArray(records)) {
            return res.status(400).json({ error: 'date, batch, stream, and records[] are required.' });
        }

        // Normalise to midnight UTC
        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0);

        // Upsert the session
        const session = await Attendance.findOneAndUpdate(
            { date: d, batch, stream },
            { date: d, batch, stream, records },
            { upsert: true, new: true, runValidators: true }
        );

        // Recalculate performance for every student in this session
        const studentIds = records.map(r => r.studentId);
        await recalcStudents(studentIds);

        res.json({ session });
    } catch (err) {
        console.error('❌ Error in saveAttendance:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/attendance
// Query: batch, stream, startDate, endDate, page, limit
exports.getAttendance = async (req, res) => {
    try {
        const { batch, stream, startDate, endDate, page = 0, limit = 20 } = req.query;
        const filter = {};

        if (batch) filter.batch = batch;
        if (stream) filter.stream = stream;

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) {
                const s = new Date(startDate);
                s.setUTCHours(0, 0, 0, 0);
                filter.date.$gte = s;
            }
            if (endDate) {
                const e = new Date(endDate);
                e.setUTCHours(23, 59, 59, 999);
                filter.date.$lte = e;
            }
        }

        const total = await Attendance.countDocuments(filter);
        const sessions = await Attendance.find(filter)
            .sort({ date: -1 })
            .skip(parseInt(page) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('records.studentId', 'name rollNumber')
            .lean();

        // Add summary counts and flatten student info into each record
        const sessionsWithCounts = sessions.map(s => ({
            ...s,
            presentCount: s.records.filter(r => r.status === 'Present').length,
            totalCount: s.records.length,
            records: s.records.map(r => ({
                studentId: r.studentId?._id || r.studentId,
                studentName: r.studentId?.name || 'Unknown',
                rollNumber: r.studentId?.rollNumber || '',
                status: r.status,
            })),
        }));

        res.json({ sessions: sessionsWithCounts, total });
    } catch (err) {
        console.error('❌ Error in getAttendance:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/attendance/student/:id
exports.getStudentAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate) { const s = new Date(startDate); s.setUTCHours(0, 0, 0, 0); dateFilter.$gte = s; }
        if (endDate) { const e = new Date(endDate); e.setUTCHours(23, 59, 59, 999); dateFilter.$lte = e; }

        const sessionFilter = { 'records.studentId': id };
        if (Object.keys(dateFilter).length) sessionFilter.date = dateFilter;

        const sessions = await Attendance.find(sessionFilter).sort({ date: -1 }).lean();

        const history = sessions.map(s => {
            const record = s.records.find(r => r.studentId.toString() === id);
            return {
                _id: s._id,
                date: s.date,
                batch: s.batch,
                stream: s.stream,
                status: record ? record.status : null,
            };
        });

        // Always compute overall % from ALL sessions (ignore date filter for the %)
        const attendancePct = await getAttendancePct(id);
        res.json({ history, attendancePct });
    } catch (err) {
        console.error('❌ Error in getStudentAttendance:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/attendance/:id
exports.deleteAttendance = async (req, res) => {
    try {
        const session = await Attendance.findById(req.params.id);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const studentIds = session.records.map(r => r.studentId);
        await Attendance.findByIdAndDelete(req.params.id);

        // Recalculate performance for affected students
        await recalcStudents(studentIds);

        res.json({ message: 'Session deleted and scores recalculated.' });
    } catch (err) {
        console.error('❌ Error in deleteAttendance:', err.message);
        res.status(500).json({ error: err.message });
    }
};
