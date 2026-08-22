import express from 'express';
import { dataStore } from '../store/dataStore.js';

const router = express.Router();

// GET all students
router.get('/', (req, res) => {
  const students = dataStore.getStudents();
  res.json({ success: true, students });
});

// GET student by ID
router.get('/:id', (req, res) => {
  const student = dataStore.getStudentById(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  res.json({ success: true, student });
});

// PATCH update student profile
router.patch('/:id', (req, res) => {
  const updated = dataStore.updateStudent(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  res.json({ success: true, student: updated });
});

export default router;
