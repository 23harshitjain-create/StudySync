import { INITIAL_STUDENTS, INITIAL_ASSIGNMENTS, INITIAL_GROUPS } from '../services/mockData.js';

class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    // Deep clone to ensure mutation safety
    this.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    this.assignments = JSON.parse(JSON.stringify(INITIAL_ASSIGNMENTS));
    this.groups = JSON.parse(JSON.stringify(INITIAL_GROUPS));
    this.messages = {
      "group-1": [
        {
          id: "msg-1",
          groupId: "group-1",
          senderId: "student-2",
          senderName: "Priya Patel",
          senderAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
          content: "Hey team! I finished the basic BST insertion logic. Working on the double rotation bug next.",
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          type: "text"
        },
        {
          id: "msg-2",
          groupId: "group-1",
          senderId: "student-4",
          senderName: "Elena Rostova",
          senderAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
          content: "Great! I just added the Visualgo interactive visualizer to our resources tab.",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          type: "text"
        }
      ],
      "group-2": [
        {
          id: "msg-10",
          groupId: "group-2",
          senderId: "student-3",
          senderName: "Marcus Vance",
          senderAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
          content: "Starting Problem Set 4 question 5. Anyone available for a focus block tonight?",
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          type: "text"
        }
      ]
    };
  }

  // --- Students ---
  getStudents() {
    return this.students;
  }

  getStudentById(id) {
    return this.students.find(s => s.id === id) || null;
  }

  updateStudent(id, updates) {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.students[idx] = { ...this.students[idx], ...updates };
      return this.students[idx];
    }
    return null;
  }

  // --- Assignments ---
  getAssignments(filter = {}) {
    let result = [...this.assignments];
    if (filter.studentId) {
      result = result.filter(a => a.studentId === filter.studentId);
    }
    if (filter.courseCode) {
      result = result.filter(a => a.courseCode.toLowerCase() === filter.courseCode.toLowerCase());
    }
    return result;
  }

  getAssignmentById(id) {
    return this.assignments.find(a => a.id === id) || null;
  }

  createAssignment(data) {
    const newAssignment = {
      id: `assign-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "In Progress",
      topics: [],
      ...data
    };
    this.assignments.unshift(newAssignment);

    // Also attach to student's active assignments
    const student = this.getStudentById(data.studentId);
    if (student && !student.activeAssignmentIds.includes(newAssignment.id)) {
      student.activeAssignmentIds.push(newAssignment.id);
    }

    return newAssignment;
  }

  deleteAssignment(id) {
    const idx = this.assignments.findIndex(a => a.id === id);
    if (idx !== -1) {
      const deleted = this.assignments.splice(idx, 1)[0];
      return deleted;
    }
    return null;
  }

  // --- Groups ---
  getGroups() {
    return this.groups;
  }

  getGroupById(id) {
    return this.groups.find(g => g.id === id) || null;
  }

  getGroupByInviteCode(code) {
    const cleanCode = code.trim().toUpperCase();
    return this.groups.find(g => g.inviteCode.toUpperCase() === cleanCode) || null;
  }

  createGroup(data) {
    const newGroup = {
      id: `group-${Date.now()}`,
      inviteCode: `SYNC-${(data.courseCode || 'GRP').replace(/\s+/g, '').toUpperCase().slice(0, 7)}-${Math.floor(100 + Math.random() * 900)}`,
      shareableUrl: '',
      members: [],
      milestones: [],
      resources: [],
      maxCapacity: 4,
      createdAt: new Date().toISOString(),
      ...data
    };
    newGroup.shareableUrl = `/join/${newGroup.inviteCode}`;
    this.groups.unshift(newGroup);
    return newGroup;
  }

  joinGroup(groupId, student) {
    const group = this.getGroupById(groupId);
    if (!group) return { error: "Group not found" };

    const alreadyMember = group.members.some(m => m.studentId === student.id);
    if (alreadyMember) return { group, alreadyJoined: true };

    if (group.members.length >= group.maxCapacity) {
      return { error: "Group is currently full" };
    }

    group.members.push({
      studentId: student.id,
      name: student.name,
      avatar: student.avatar,
      role: "Member",
      progress: 0,
      joinedAt: new Date().toISOString()
    });

    return { group, success: true };
  }

  leaveGroup(groupId, studentId) {
    const group = this.getGroupById(groupId);
    if (!group) return { error: "Group not found" };

    const memberIdx = group.members.findIndex(m => m.studentId === studentId);
    if (memberIdx === -1) {
      return { error: "Student is not a member of this group" };
    }

    const removedMember = group.members[memberIdx];
    group.members.splice(memberIdx, 1);

    // Reassign any milestones assigned to this student
    if (group.milestones) {
      group.milestones.forEach(m => {
        if (m.assignedTo && (
          m.assignedTo.toLowerCase() === (removedMember.name || '').toLowerCase() ||
          m.assignedTo === studentId
        )) {
          m.assignedTo = 'Unassigned';
        }
      });
    }

    return { group, success: true };
  }

  removeMember(groupId, targetStudentId, requesterId) {
    const group = this.getGroupById(groupId);
    if (!group) return { error: "Group not found" };

    // Verify requester is owner or admin
    const requester = group.members.find(m => m.studentId === requesterId);
    const isOwner = group.createdById === requesterId || requester?.role === 'Admin';
    if (!isOwner) {
      return { error: "Only the group owner/admin can remove members" };
    }

    if (group.createdById === targetStudentId) {
      return { error: "Owner cannot remove themselves from the group" };
    }

    const memberIdx = group.members.findIndex(m => m.studentId === targetStudentId);
    if (memberIdx === -1) {
      return { error: "Target student is not a member of this group" };
    }

    const removedMember = group.members[memberIdx];
    group.members.splice(memberIdx, 1);

    // Reassign milestones assigned to this member
    if (group.milestones) {
      group.milestones.forEach(m => {
        if (m.assignedTo && (
          m.assignedTo.toLowerCase() === (removedMember.name || '').toLowerCase() ||
          m.assignedTo === targetStudentId
        )) {
          m.assignedTo = 'Unassigned';
        }
      });
    }

    return { group, success: true };
  }

  toggleMilestone(groupId, milestoneId) {
    const group = this.getGroupById(groupId);
    if (!group) return null;

    const milestone = (group.milestones || []).find(m => m.id === milestoneId);
    if (!milestone) return null;

    milestone.completed = !milestone.completed;

    // Recalculate member progress
    const total = group.milestones.length;
    const completed = group.milestones.filter(m => m.completed).length;
    const overallProgressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    group.members.forEach(member => {
      const assigned = group.milestones.filter(m =>
        m.assignedTo && (
          m.assignedTo.toLowerCase() === member.name.toLowerCase() ||
          m.assignedTo.toLowerCase() === (member.studentId || '').toLowerCase()
        )
      );

      if (assigned.length > 0) {
        const memberCompleted = assigned.filter(m => m.completed).length;
        member.progress = Math.round((memberCompleted / assigned.length) * 100);
      } else {
        // If no specifically assigned tasks, share the group's overall progress
        member.progress = overallProgressPercent;
      }
    });

    return group;
  }

  addMilestone(groupId, milestoneData) {
    const group = this.getGroupById(groupId);
    if (!group) return null;

    const newMilestone = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      completed: false,
      assignedTo: 'Unassigned',
      ...milestoneData
    };

    if (!group.milestones) group.milestones = [];
    group.milestones.push(newMilestone);
    return group;
  }

  addResource(groupId, resourceData) {
    const group = this.getGroupById(groupId);
    if (!group) return null;

    const newResource = {
      id: `r-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'link',
      ...resourceData
    };

    if (!group.resources) group.resources = [];
    group.resources.push(newResource);
    return group;
  }

  updateGroup(groupId, updates) {
    const group = this.getGroupById(groupId);
    if (!group) return null;
    Object.assign(group, updates);
    return group;
  }

  // --- Messages ---
  getMessages(groupId) {
    return this.messages[groupId] || [];
  }

  addMessage(groupId, message) {
    if (!this.messages[groupId]) {
      this.messages[groupId] = [];
    }
    const newMsg = {
      id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      groupId,
      timestamp: message.timestamp || new Date().toISOString(),
      content: message.content,
      senderId: message.senderId || 'anonymous',
      senderName: message.senderName || 'Anonymous',
      senderAvatar: message.senderAvatar || '',
      type: message.type || 'text'
    };
    this.messages[groupId].push(newMsg);
    return newMsg;
  }
}

export const dataStore = new DataStore();
