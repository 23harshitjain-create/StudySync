import express from 'express';
import { dataStore } from '../store/dataStore.js';
import { generateStudyBotReplyAsync, fetchResourceContent } from '../services/studyBotService.js';

const router = express.Router();

// GET all study groups
router.get('/', (req, res) => {
  const groups = dataStore.getGroups();
  res.json({ success: true, groups });
});

// GET group by ID
router.get('/:id', (req, res) => {
  const group = dataStore.getGroupById(req.params.id);
  if (!group) {
    return res.status(404).json({ success: false, error: 'Group not found' });
  }
  const messages = dataStore.getMessages(req.params.id);
  res.json({ success: true, group, messages });
});

// GET group by invite code (e.g. /api/groups/invite/SYNC-CS201)
router.get('/invite/:code', (req, res) => {
  const group = dataStore.getGroupByInviteCode(req.params.code);
  if (!group) {
    return res.status(404).json({ success: false, error: 'Invalid invite code or group not found' });
  }
  res.json({ success: true, group });
});

// POST create study group
router.post('/', (req, res) => {
  const { name, courseCode, taskTitle, createdById, maxCapacity, description, initialMilestones } = req.body;

  if (!name || !courseCode || !createdById) {
    return res.status(400).json({ success: false, error: 'name, courseCode, and createdById are required' });
  }

  const creator = dataStore.getStudentById(createdById);
  if (!creator) {
    return res.status(404).json({ success: false, error: 'Creator student not found' });
  }

  const newGroup = dataStore.createGroup({
    name,
    courseCode: courseCode.trim().toUpperCase(),
    taskTitle: taskTitle || `${courseCode} Study Group`,
    createdById,
    description: description || 'Collaborative study and assignment sprint group.',
    maxCapacity: Number(maxCapacity) || 4,
    members: [
      {
        studentId: creator.id,
        name: creator.name,
        avatar: creator.avatar,
        role: 'Admin',
        progress: 0,
        joinedAt: new Date().toISOString()
      }
    ],
    milestones: initialMilestones || [
      { id: `m-${Date.now()}-1`, title: 'Review assignment requirements and setup workspace', completed: false, assignedTo: creator.name },
      { id: `m-${Date.now()}-2`, title: 'Draft core solution / implementation outline', completed: false, assignedTo: 'Unassigned' },
      { id: `m-${Date.now()}-3`, title: 'Final testing and code review', completed: false, assignedTo: 'Unassigned' }
    ]
  });

  res.status(201).json({ success: true, group: newGroup });
});

// POST join group
router.post('/:id/join', (req, res) => {
  const { studentId } = req.body;
  const student = dataStore.getStudentById(studentId);
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }

  const result = dataStore.joinGroup(req.params.id, student);
  if (result.error) {
    return res.status(400).json({ success: false, error: result.error });
  }

  res.json({ success: true, group: result.group, alreadyJoined: result.alreadyJoined || false });
});

// POST leave group
router.post('/:id/leave', (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ success: false, error: 'studentId is required' });
  }

  const result = dataStore.leaveGroup(req.params.id, studentId);
  if (result.error) {
    return res.status(400).json({ success: false, error: result.error });
  }

  res.json({ success: true, group: result.group });
});

// POST remove member by owner
router.post('/:id/remove-member', (req, res) => {
  const { targetStudentId, requesterId } = req.body;
  if (!targetStudentId || !requesterId) {
    return res.status(400).json({ success: false, error: 'targetStudentId and requesterId are required' });
  }

  const result = dataStore.removeMember(req.params.id, targetStudentId, requesterId);
  if (result.error) {
    return res.status(400).json({ success: false, error: result.error });
  }

  res.json({ success: true, group: result.group });
});

// PATCH toggle milestone
router.patch('/:id/milestones/:milestoneId/toggle', (req, res) => {
  const updatedGroup = dataStore.toggleMilestone(req.params.id, req.params.milestoneId);
  if (!updatedGroup) {
    return res.status(404).json({ success: false, error: 'Group or milestone not found' });
  }
  res.json({ success: true, group: updatedGroup });
});

// POST add milestone
router.post('/:id/milestones', (req, res) => {
  const updatedGroup = dataStore.addMilestone(req.params.id, req.body);
  if (!updatedGroup) {
    return res.status(404).json({ success: false, error: 'Group not found' });
  }
  res.json({ success: true, group: updatedGroup });
});

// POST add resource
router.post('/:id/resources', (req, res) => {
  const updatedGroup = dataStore.addResource(req.params.id, req.body);
  if (!updatedGroup) {
    return res.status(404).json({ success: false, error: 'Group not found' });
  }
  res.json({ success: true, group: updatedGroup });
});

// GET group messages
router.get('/:id/messages', (req, res) => {
  const messages = dataStore.getMessages(req.params.id);
  res.json({ success: true, messages });
});

// POST group message
router.post('/:id/messages', (req, res) => {
  const { content, senderId, senderName, senderAvatar, type, id, timestamp } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Message content is required' });
  }
  const newMsg = dataStore.addMessage(req.params.id, {
    id,
    timestamp,
    content: content.trim(),
    senderId: senderId || 'anonymous',
    senderName: senderName || 'Anonymous',
    senderAvatar: senderAvatar || '',
    type: type || 'text'
  });
  res.status(201).json({ success: true, message: newMsg, messages: dataStore.getMessages(req.params.id) });
});

// POST StudyBot query with server-side resource fetching
router.post('/:id/studybot', async (req, res) => {
  const { query, studentId, studentName } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ success: false, error: 'Query is required' });
  }

  const group = dataStore.getGroupById(req.params.id);
  if (!group) {
    return res.status(404).json({ success: false, error: 'Group not found' });
  }

  let student = null;
  if (studentId) {
    student = dataStore.getStudentById(studentId);
  }
  if (!student && studentName) {
    student = { name: studentName, id: studentId || 'student-1' };
  }

  try {
    const botReply = await generateStudyBotReplyAsync({
      query: query.trim(),
      group,
      currentStudent: student || { name: 'Student' }
    });

    res.json({ success: true, reply: botReply });
  } catch (err) {
    console.error('StudyBot Error:', err);
    res.status(500).json({ success: false, error: 'Failed to process StudyBot query' });
  }
});

// POST fetch resource text
router.post('/fetch-resource', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  try {
    const result = await fetchResourceContent(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
