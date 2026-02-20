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

const getEffectiveTotalScore = (m) => {
  if (typeof m.totalScore === 'number') return m.totalScore;
  if (m.scores) {
    return (m.scores.physics || 0) + (m.scores.chemistry || 0) + (m.scores.maths || 0) + (m.scores.bio || 0);
  }
  return 0;
};

const calculatePerformance = (allMarks, stream = 'Non-Medical') => {
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
  const attendanceScore = latest.attendance || 0;

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
  const students = await StudentModel.find().sort({ performanceScore: -1 });
  const total = students.length;
  if (total === 0) return;

  const top25Index = Math.floor(total * 0.25);
  const bottom25Index = Math.floor(total * 0.75);

  const bulkOps = students.map((student, index) => {
    const currentRank = index + 1;
    let category = 'Medium';
    if (index < top25Index) category = 'Best';
    else if (index >= bottom25Index) category = 'Worst';

    const previousRank = student.currentRank || currentRank;
    const bestRank = Math.min(student.bestRank || 999999, currentRank);

    return {
      updateOne: {
        filter: { _id: student._id },
        update: { category, currentRank, previousRank, bestRank }
      }
    };
  });

  if (bulkOps.length > 0) {
    await StudentModel.bulkWrite(bulkOps);
    console.log(`[Ranking] Recalculated categories for ${total} students (Percentile-based)`);
  }
};

module.exports = { calculatePerformance, getCategory, calculateAverageMarks, recalculateAllCategories };
