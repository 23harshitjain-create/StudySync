import express from 'express';
import { dataStore } from '../store/dataStore.js';
import { findMatchesForStudent, calculateCompatibility } from '../services/matchingEngine.js';

const router = express.Router();

// GET matches for active student (optional query ?assignmentId=...)
router.get('/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { assignmentId } = req.query;

  const matches = findMatchesForStudent(studentId, assignmentId, dataStore);
  res.json({
    success: true,
    count: matches.length,
    matches
  });
});

// POST calculate on-the-fly custom match score between two tasks/profiles
router.post('/compare', (req, res) => {
  const { sourceStudentId, sourceTask, targetStudentId, targetTask } = req.body;

  const sourceStudent = dataStore.getStudentById(sourceStudentId) || { preferredTimes: ["Late Night"], studyStyle: "Deep Focus", targetGrade: "A / 4.0" };
  const targetStudent = dataStore.getStudentById(targetStudentId) || { preferredTimes: ["Late Night"], studyStyle: "Deep Focus", targetGrade: "A / 4.0" };

  const compatibility = calculateCompatibility(sourceStudent, sourceTask, targetStudent, targetTask);
  res.json({ success: true, compatibility });
});

// POST reset demo data
router.post('/reset-demo', (req, res) => {
  dataStore.reset();
  res.json({ success: true, message: 'Demo data reset successfully to initial state' });
});

export default router;
