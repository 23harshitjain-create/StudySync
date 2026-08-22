import express from 'express';
import { dataStore } from '../store/dataStore.js';
import { extractAssignmentFromPdf } from '../services/pdfExtractor.js';

const router = express.Router();

// POST extract assignment details from PDF (base64 or raw text)
router.post('/extract-pdf', async (req, res) => {
  try {
    const { pdfBase64, rawText, fileName } = req.body;

    let bufferOrText = null;
    if (pdfBase64) {
      bufferOrText = Buffer.from(pdfBase64, 'base64');
    } else if (rawText) {
      bufferOrText = rawText;
    } else {
      return res.status(400).json({ success: false, error: 'No PDF data or text provided' });
    }

    const metadata = await extractAssignmentFromPdf(bufferOrText, fileName || 'assignment.pdf');
    res.json({
      success: true,
      metadata,
      message: 'PDF assignment parsed successfully'
    });
  } catch (err) {
    console.error('PDF Extraction Error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to extract information from PDF: ' + err.message
    });
  }
});

// GET all assignments (optional filters: ?studentId=... &courseCode=...)
router.get('/', (req, res) => {
  const { studentId, courseCode } = req.query;
  const assignments = dataStore.getAssignments({ studentId, courseCode });
  res.json({ success: true, assignments });
});

// GET single assignment
router.get('/:id', (req, res) => {
  const assignment = dataStore.getAssignmentById(req.params.id);
  if (!assignment) {
    return res.status(404).json({ success: false, error: 'Assignment not found' });
  }
  res.json({ success: true, assignment });
});

// POST create assignment
router.post('/', (req, res) => {
  const { studentId, courseCode, courseName, title, taskType, topics, deadline, estimatedHours, difficulty, description } = req.body;

  if (!studentId || !courseCode || !title) {
    return res.status(400).json({ success: false, error: 'studentId, courseCode, and title are required' });
  }

  const student = dataStore.getStudentById(studentId);
  const newAssignment = dataStore.createAssignment({
    studentId,
    studentName: student ? student.name : 'Anonymous',
    courseCode: courseCode.trim().toUpperCase(),
    courseName: courseName || courseCode,
    title: title.trim(),
    taskType: taskType || 'Assignment',
    topics: Array.isArray(topics) ? topics : (topics ? topics.split(',').map(t => t.trim()) : []),
    deadline: deadline || new Date(Date.now() + 86400000 * 3).toISOString(),
    estimatedHours: Number(estimatedHours) || 4,
    difficulty: difficulty || 'Medium',
    description: description || ''
  });

  res.status(201).json({ success: true, assignment: newAssignment });
});

// DELETE assignment
router.delete('/:id', (req, res) => {
  const deleted = dataStore.deleteAssignment(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Assignment not found' });
  }
  res.json({ success: true, message: 'Assignment deleted successfully', assignment: deleted });
});

export default router;
