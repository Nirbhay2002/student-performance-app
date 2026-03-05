/**
 * Performance Formula:
 * (70% Test Performance) + (20% Improvement %) + (10% Attendance)
 * 
 * Test Performance: (sum of marks / total possible marks) * 100
 * Improvement: Difference between current test % and average of previous tests %
 * Attendance: latest attendance %
 */

const getMaxScore = (mark, stream) => {
  if (mark.maxScore) return mark.maxScore;
  // Default based on stream
  if (stream === 'Medical') return 720;
  return 300; // Default / Non-Medical
};

// Null = absent (not scored 0). Only sum subjects the student appeared in.
const getEffectiveTotalScore = (m) => {
  if (typeof m.totalScore === 'number') return m.totalScore;
  const s = m.scores;
  return [s.physics, s.chemistry, s.maths, s.botany, s.zoology]
    .reduce((acc, v) => acc + (v !== null && v !== undefined ? v : 0), 0);
};

const calculatePerformance = (allMarks, stream = 'Non-Medical', attendancePct = undefined) => {
  if (!allMarks || allMarks.length === 0) return 0;

  // Sort by date descending to get latest attendance
  const sortedMarks = [...allMarks].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sortedMarks[0];

  let improvement = 0;
  if (sortedMarks.length > 1) {
    const previousAvg = sortedMarks.slice(1).reduce((acc, m) => {
      const total = getEffectiveTotalScore(m);
      const max = m.maxScore || 300;
      return acc + (total / max) * 100;
    }, 0) / (sortedMarks.length - 1);

    const latestTotal = getEffectiveTotalScore(latest);
    const latestMax = latest.maxScore || 300;
    const latestScore = (latestTotal / latestMax) * 100;
    improvement = latestScore - previousAvg;
  }

  const improvementScore = Math.min(Math.max((improvement + 50), 0), 100);

  let totalObtained = 0;
  let totalMax = 0;

  sortedMarks.forEach(mark => {
    totalObtained += getEffectiveTotalScore(mark);
    totalMax += getMaxScore(mark, stream);
  });

  const academicScore = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  // Prefer dynamic attendance from Attendance collection; fall back to Marks field
  const attendanceScore = (attendancePct !== null && attendancePct !== undefined)
    ? attendancePct
    : (latest.attendance || 0);

  // Final Score: 70% Academic + 20% Improvement + 10% Attendance
  const finalScore = (academicScore * 0.7) + (improvementScore * 0.2) + (attendanceScore * 0.1);

  console.log(`[Ranking] Stream: ${stream}, Academic: ${academicScore.toFixed(2)}%, Attendance: ${attendanceScore}%, Final: ${finalScore.toFixed(2)}`);

  return parseFloat(finalScore.toFixed(2));
};

const getCategory = (score) => {
  if (score >= 85) return 'Best';
  if (score >= 60) return 'Medium';
  return 'Worst';
};

const calculateAverageMarks = (allMarks, stream = 'Non-Medical') => {
  if (!allMarks || allMarks.length === 0) return 0;

  let totalObtained = 0;
  let totalMax = 0;

  allMarks.forEach(mark => {
    totalObtained += getEffectiveTotalScore(mark);
    totalMax += getMaxScore(mark, stream);
  });

  return totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
};

const recalculateAllCategories = async (StudentModel) => {
  // Fetch all students (lean for speed)
  const students = await StudentModel.find().lean();
  const total = students.length;
  if (total === 0) return;

  // Group by stream + batch
  const groups = {};
  students.forEach(s => {
    const key = `${s.stream || 'Unknown'}__${s.batch || 'Unknown'}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  const bulkOps = [];

  Object.entries(groups).forEach(([key, groupStudents]) => {
    // Sort by performanceScore descending within each group
    groupStudents.sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));

    const n = groupStudents.length;
    const top25 = Math.floor(n * 0.25);
    const bottom25 = Math.floor(n * 0.75);

    groupStudents.forEach((student, index) => {
      const newRank = index + 1;
      let category = 'Medium';
      if (index < top25) category = 'Best';
      if (index >= bottom25) category = 'Worst';

      const previousRank = student.currentRank || newRank;
      const bestRank = Math.min(student.bestRank || 999999, newRank);

      bulkOps.push({
        updateOne: {
          filter: { _id: student._id },
          update: { category, currentRank: newRank, previousRank, bestRank }
        }
      });
    });

    console.log(`[Ranking] ${key}: ${n} students ranked`);
  });

  if (bulkOps.length > 0) {
    await StudentModel.bulkWrite(bulkOps);
    console.log(`[Ranking] ✅ Group-scoped categories recalculated for ${total} students across ${Object.keys(groups).length} groups`);
  }
};

module.exports = { calculatePerformance, getCategory, calculateAverageMarks, recalculateAllCategories };
