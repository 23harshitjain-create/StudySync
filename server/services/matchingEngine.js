/**
 * StudySync Deterministic & Explainable Matching Engine
 * 
 * Weights:
 * - Assignment/Course Similarity: 30%
 * - Topic Overlap: 25%
 * - Deadline Proximity: 20%
 * - Availability Overlap: 15%
 * - Study Preferences: 10%
 */

// Helper to normalize string for comparison
function cleanStr(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Calculate Course & Task Similarity (30%)
export function calculateCourseSimilarity(taskA, taskB) {
  if (!taskA || !taskB) return { score: 0, reason: null };

  const codeA = cleanStr(taskA.courseCode);
  const codeB = cleanStr(taskB.courseCode);

  let score = 0;
  let reason = null;

  if (codeA && codeB && codeA === codeB) {
    score = 100;
    reason = `Exact course match (${taskA.courseCode})`;
    // Check task type for synergy
    if (taskA.taskType && taskB.taskType && taskA.taskType.toLowerCase() === taskB.taskType.toLowerCase()) {
      reason += ` - Both working on a ${taskA.taskType}`;
    }
  } else if (taskA.courseCode && taskB.courseCode) {
    const deptA = taskA.courseCode.split(/\s|\d/)[0].toLowerCase();
    const deptB = taskB.courseCode.split(/\s|\d/)[0].toLowerCase();
    if (deptA && deptB && deptA === deptB) {
      score = 65;
      reason = `Same department/subject area (${deptA.toUpperCase()})`;
    } else {
      score = 20;
    }
  } else {
    score = 15;
  }

  return { score, reason };
}

// Calculate Topic Overlap using Jaccard Similarity (25%)
export function calculateTopicOverlap(taskA, taskB) {
  if (!taskA || !taskB) return { score: 0, commonTopics: [], reason: null };

  const topicsA = new Set((taskA.topics || []).map(t => t.toLowerCase().trim()));
  const topicsB = new Set((taskB.topics || []).map(t => t.toLowerCase().trim()));

  if (topicsA.size === 0 && topicsB.size === 0) {
    return { score: 50, commonTopics: [], reason: null };
  }

  const intersection = [];
  topicsA.forEach(t => {
    if (topicsB.has(t)) {
      intersection.push(t);
    }
  });

  const union = new Set([...topicsA, ...topicsB]);
  const jaccard = union.size > 0 ? (intersection.length / union.size) : 0;
  const score = Math.round(jaccard * 100);

  let reason = null;
  if (intersection.length > 0) {
    const topicDisplay = intersection.slice(0, 3).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
    reason = `Shared core topics: ${topicDisplay}`;
  }

  return { score, commonTopics: intersection, reason };
}

// Calculate Deadline Proximity (20%)
export function calculateDeadlineProximity(taskA, taskB) {
  if (!taskA?.deadline || !taskB?.deadline) {
    return { score: 50, hoursDiff: null, reason: null };
  }

  const dateA = new Date(taskA.deadline);
  const dateB = new Date(taskB.deadline);

  if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
    return { score: 50, hoursDiff: null, reason: null };
  }

  const diffMs = Math.abs(dateA.getTime() - dateB.getTime());
  const hoursDiff = Math.round(diffMs / (1000 * 60 * 60));

  let score = 0;
  let reason = null;

  if (hoursDiff <= 4) {
    score = 100;
    reason = `Identical submission deadline (within ${hoursDiff}h)`;
  } else if (hoursDiff <= 24) {
    score = Math.max(0, 100 - Math.round(hoursDiff * 1.5));
    reason = `Due within 24 hours of each other (${hoursDiff}h apart)`;
  } else if (hoursDiff <= 72) {
    score = Math.max(20, Math.round(100 - (hoursDiff / 72) * 80));
    reason = `Deadlines within the same 3-day sprint (${Math.round(hoursDiff / 24)} days)`;
  } else {
    score = Math.max(5, Math.round(100 - (hoursDiff / 168) * 100));
  }

  return { score, hoursDiff, reason };
}

// Calculate Availability Overlap (15%)
export function calculateAvailabilityOverlap(studentA, studentB) {
  if (!studentA || !studentB) return { score: 50, commonSlots: [], reason: null };

  const timesA = new Set(studentA.preferredTimes || []);
  const timesB = new Set(studentB.preferredTimes || []);

  const commonSlots = [];
  timesA.forEach(time => {
    if (timesB.has(time)) {
      commonSlots.push(time);
    }
  });

  const union = new Set([...timesA, ...timesB]);
  let score = 0;
  let reason = null;

  if (union.size === 0) {
    score = 50;
  } else {
    const ratio = commonSlots.length / Math.min(timesA.size || 1, timesB.size || 1);
    score = Math.round(ratio * 100);
  }

  if (commonSlots.length > 0) {
    reason = `Both study during ${commonSlots.join(' & ')}`;
  }

  return { score, commonSlots, reason };
}

// Calculate Study Preference Compatibility (10%)
export function calculateStudyPreferenceScore(studentA, studentB) {
  if (!studentA || !studentB) return { score: 50, reason: null };

  let score = 0;
  const reasons = [];

  // Style match
  if (studentA.studyStyle && studentB.studyStyle) {
    if (studentA.studyStyle === studentB.studyStyle) {
      score += 60;
      reasons.push(`Matching study style: "${studentA.studyStyle}"`);
    } else {
      score += 35; // Complementary styles still have baseline value
    }
  } else {
    score += 40;
  }

  // Target Grade alignment
  if (studentA.targetGrade && studentB.targetGrade) {
    if (studentA.targetGrade === studentB.targetGrade) {
      score += 40;
      reasons.push(`Targeting ${studentA.targetGrade}`);
    } else {
      score += 20;
    }
  } else {
    score += 25;
  }

  score = Math.min(100, score);
  return { score, reason: reasons.join(' • ') || null };
}

/**
 * Calculate Comprehensive Compatibility between a Source Task/Student and a Target Task/Student
 */
export function calculateCompatibility(sourceStudent, sourceTask, targetStudent, targetTask) {
  const courseSim = calculateCourseSimilarity(sourceTask, targetTask);
  const topicSim = calculateTopicOverlap(sourceTask, targetTask);
  const deadlineSim = calculateDeadlineProximity(sourceTask, targetTask);
  const availSim = calculateAvailabilityOverlap(sourceStudent, targetStudent);
  const prefSim = calculateStudyPreferenceScore(sourceStudent, targetStudent);

  // Weighted sum
  // Course: 30%, Topic: 25%, Deadline: 20%, Availability: 15%, Preferences: 10%
  const weightedScore = Math.round(
    (courseSim.score * 0.30) +
    (topicSim.score * 0.25) +
    (deadlineSim.score * 0.20) +
    (availSim.score * 0.15) +
    (prefSim.score * 0.10)
  );

  const reasons = [];
  if (courseSim.reason) reasons.push(courseSim.reason);
  if (topicSim.reason) reasons.push(topicSim.reason);
  if (deadlineSim.reason) reasons.push(deadlineSim.reason);
  if (availSim.reason) reasons.push(availSim.reason);
  if (prefSim.reason) reasons.push(prefSim.reason);

  return {
    overallScore: Math.max(0, Math.min(100, weightedScore)),
    breakdown: {
      courseSimilarity: courseSim.score,
      topicOverlap: topicSim.score,
      deadlineProximity: deadlineSim.score,
      availabilityOverlap: availSim.score,
      studyPreferences: prefSim.score
    },
    highlightReasons: reasons
  };
}

/**
 * Find Top Matches for a Given Student & Assignment
 */
export function findMatchesForStudent(studentId, assignmentId, dataStore) {
  const sourceStudent = dataStore.getStudentById(studentId);
  if (!sourceStudent) return [];

  let sourceTask = null;
  if (assignmentId) {
    sourceTask = dataStore.getAssignmentById(assignmentId);
  } else if (sourceStudent.activeAssignmentIds?.length > 0) {
    sourceTask = dataStore.getAssignmentById(sourceStudent.activeAssignmentIds[0]);
  }

  const allAssignments = dataStore.getAssignments();
  const allGroups = dataStore.getGroups();
  const matches = [];

  // Match against other students' assignments
  allAssignments.forEach(targetTask => {
    // Skip own assignments
    if (targetTask.studentId === studentId) return;

    const targetStudent = dataStore.getStudentById(targetTask.studentId);
    if (!targetStudent) return;

    const compatibility = calculateCompatibility(sourceStudent, sourceTask, targetStudent, targetTask);

    matches.push({
      matchId: `match-${targetTask.id}`,
      type: "peer",
      targetStudent,
      targetTask,
      sourceTask,
      overallScore: compatibility.overallScore,
      breakdown: compatibility.breakdown,
      highlightReasons: compatibility.highlightReasons
    });
  });

  // Also match against active study groups
  allGroups.forEach(group => {
    // Calculate simulated group compatibility
    const groupTask = {
      courseCode: group.courseCode,
      title: group.taskTitle,
      taskType: "Assignment",
      topics: [group.courseCode, group.name]
    };

    // Calculate against group admin/creator
    const admin = dataStore.getStudentById(group.createdById) || sourceStudent;
    const compatibility = calculateCompatibility(sourceStudent, sourceTask, admin, groupTask);

    // Boost score if group has open spots
    const hasCapacity = group.members.length < group.maxCapacity;
    const adjustedScore = hasCapacity ? compatibility.overallScore : Math.max(10, compatibility.overallScore - 20);

    matches.push({
      matchId: `match-grp-${group.id}`,
      type: "group",
      targetGroup: group,
      sourceTask,
      overallScore: adjustedScore,
      breakdown: compatibility.breakdown,
      highlightReasons: [
        `Active Study Group with ${group.members.length}/${group.maxCapacity} members`,
        ...compatibility.highlightReasons
      ]
    });
  });

  // Sort descending by overall compatibility score
  matches.sort((a, b) => b.overallScore - a.overallScore);

  return matches;
}
