/**
 * Performance Formula:
 * (70% Test Performance) + (20% Improvement %) + (10% Attendance & Discipline)
 * 
 * Test Performance: (sum of marks / total possible marks) * 100
 * Improvement: Difference between current test % and average of previous tests %
 * Attendance & Discipline: ((attendance % * 0.7) + (discipline * 10 * 0.3))
 */

const calculatePerformance = (allMarks) => {
  if (!allMarks || allMarks.length === 0) return 0;

  // Sort by date to get latest
  const sortedMarks = [...allMarks].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sortedMarks[0];
  
  // 1. Test Performance (70%)
  const avgTestScore = sortedMarks.reduce((acc, m) => acc + (m.totalScore / m.maxScore) * 100, 0) / sortedMarks.length;
  
  // 2. Improvement (20%)
  let improvement = 0;
  if (sortedMarks.length > 1) {
    const previousAvg = sortedMarks.slice(1).reduce((acc, m) => acc + (m.totalScore / m.maxScore) * 100, 0) / (sortedMarks.length - 1);
    const latestScore = (latest.totalScore / latest.maxScore) * 100;
    improvement = latestScore - previousAvg;
  }
  
  // Normalize improvement to a 0-100 scale (roughly, cap at 100 or min 0 for scoring)
  const improvementScore = Math.min(Math.max((improvement + 50), 0), 100); 

  // 3. Attendance & Discipline (10%)
  const latestAttendance = latest.attendance;
  const latestDiscipline = latest.disciplinePoint * 10;
  const attDisScore = (latestAttendance * 0.7) + (latestDiscipline * 0.3);

  const finalScore = (avgTestScore * 0.7) + (improvementScore * 0.2) + (attDisScore * 0.1);
  return finalScore;
};

const getCategory = (score) => {
  if (score >= 80) return 'Best';
  if (score >= 50) return 'Medium';
  return 'Worst';
};

module.exports = { calculatePerformance, getCategory };
