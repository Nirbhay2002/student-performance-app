/**
 * Performance Formula:
 * (70% Test Performance) + (20% Improvement %) + (10% Attendance & Discipline)
 * 
 * Test Performance: (sum of marks / total possible marks) * 100
 * Improvement: Difference between current test % and average of previous tests %
 * Attendance & Discipline: ((attendance % * 0.7) + (discipline * 10 * 0.3))
 */

const getEffectiveTotalScore = (m) => {
  if (typeof m.totalScore === 'number') return m.totalScore;
  if (m.scores) {
    return (m.scores.math || 0) + (m.scores.science || 0) + (m.scores.english || 0);
  }
  return 0;
};

const calculatePerformance = (allMarks) => {
  if (!allMarks || allMarks.length === 0) return 0;

  const sortedMarks = [...allMarks].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sortedMarks[0];

  const avgTestScore = sortedMarks.reduce((acc, m) => {
    const total = getEffectiveTotalScore(m);
    const max = m.maxScore || 300;
    return acc + (total / max) * 100;
  }, 0) / sortedMarks.length;

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

  const latestAttendance = latest.attendance || 0;
  const latestDiscipline = (latest.disciplinePoint || 0) * 10;
  const attDisScore = (latestAttendance * 0.7) + (latestDiscipline * 0.3);

  const finalScore = (avgTestScore * 0.7) + (improvementScore * 0.2) + (attDisScore * 0.1);
  return finalScore || 0;
};

const getCategory = (score) => {
  if (score >= 80) return 'Best';
  if (score >= 50) return 'Medium';
  return 'Worst';
};

const calculateAverageMarks = (allMarks) => {
  if (!allMarks || allMarks.length === 0) return 0;
  const sum = allMarks.reduce((acc, m) => acc + getEffectiveTotalScore(m), 0);
  return sum / allMarks.length;
};

module.exports = { calculatePerformance, getCategory, calculateAverageMarks };
