// Normalizes the base API URL (handles missing protocol, trailing slashes, or missing /api path)
function getNormalizedBaseUrl() {
  let url = (import.meta.env.VITE_API_URL || '').trim();
  if (!url) return '/api';

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

export const BASE_URL = getNormalizedBaseUrl();

async function safeFetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    throw new Error(
      `Received HTML instead of API response from "${url}". Make sure VITE_API_URL is set in Vercel and your Railway backend is live.`
    );
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || errorBody.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return await res.json();
}

export async function fetchStudents() {
  try {
    const data = await safeFetchJson(`${BASE_URL}/students`);
    return data.students || [];
  } catch (err) {
    console.error('API Error (fetchStudents):', err);
    return [];
  }
}

export async function fetchAssignments(studentId = null) {
  try {
    const url = studentId ? `${BASE_URL}/assignments?studentId=${studentId}` : `${BASE_URL}/assignments`;
    const data = await safeFetchJson(url);
    return data.assignments || [];
  } catch (err) {
    console.error('API Error (fetchAssignments):', err);
    return [];
  }
}

export async function createAssignment(assignmentData) {
  try {
    const data = await safeFetchJson(`${BASE_URL}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData)
    });
    return data.assignment;
  } catch (err) {
    console.error('API Error (createAssignment):', err);
    throw err;
  }
}

export async function extractPdfAssignment(fileOrData, fileName = '') {
  try {
    let payload = {};

    if (fileOrData instanceof File) {
      // 100% reliable browser FileReader
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            const parts = result.split(',');
            resolve(parts[1] || parts[0]);
          } else {
            resolve('');
          }
        };
        reader.onerror = (e) => reject(new Error('Failed to read PDF file on client'));
        reader.readAsDataURL(fileOrData);
      });

      payload = {
        pdfBase64: base64,
        fileName: fileOrData.name
      };
    } else if (typeof fileOrData === 'string') {
      if (fileOrData.startsWith('JVBERi0') || fileOrData.startsWith('%PDF')) {
        payload = {
          pdfBase64: fileOrData,
          fileName: fileName || 'assignment.pdf'
        };
      } else {
        payload = {
          rawText: fileOrData,
          fileName: fileName || 'assignment.pdf'
        };
      }
    }

    return await safeFetchJson(`${BASE_URL}/assignments/extract-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(d => d.metadata);
  } catch (err) {
    console.error('API Error (extractPdfAssignment):', err);
    throw err;
  }
}

export async function fetchGroups() {
  try {
    const data = await safeFetchJson(`${BASE_URL}/groups`);
    return data.groups || [];
  } catch (err) {
    console.error('API Error (fetchGroups):', err);
    return [];
  }
}

export async function createStudyGroup(groupData) {
  try {
    const data = await safeFetchJson(`${BASE_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData)
    });
    return data.group;
  } catch (err) {
    console.error('API Error (createStudyGroup):', err);
    throw err;
  }
}

export async function fetchMatches(studentId, assignmentId = null) {
  try {
    const url = assignmentId
      ? `${BASE_URL}/matches/${studentId}?assignmentId=${assignmentId}`
      : `${BASE_URL}/matches/${studentId}`;
    const data = await safeFetchJson(url);
    return data.matches || [];
  } catch (err) {
    console.error('API Error (fetchMatches):', err);
    return [];
  }
}

export async function resetDemoData() {
  try {
    const res = await fetch(`${BASE_URL}/matches/reset-demo`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    console.error('API Error (resetDemoData):', err);
    return { success: false };
  }
}
export async function updateStudent(studentId, updates) {
  try {
    const data = await safeFetchJson(`${BASE_URL}/students/${studentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    return data.student;
  } catch (err) {
    console.error('API Error (updateStudent):', err);
    throw err;
  }
}

export async function joinGroup(groupId, studentId) {
  try {
    const data = await safeFetchJson(`${BASE_URL}/groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    });
    return data;
  } catch (err) {
    console.error('API Error (joinGroup):', err);
    throw err;
  }
}

export async function leaveGroup(groupId, studentId) {
  try {
    const data = await safeFetchJson(`${BASE_URL}/groups/${groupId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    });
    return data;
  } catch (err) {
    console.error('API Error (leaveGroup):', err);
    throw err;
  }
}

export async function removeGroupMember(groupId, targetStudentId, requesterId) {
  try {
    const data = await safeFetchJson(`${BASE_URL}/groups/${groupId}/remove-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStudentId, requesterId })
    });
    return data;
  } catch (err) {
    console.error('API Error (removeGroupMember):', err);
    throw err;
  }
}

export async function queryStudyBot(groupId, { query, studentId, studentName }) {
  try {
    const data = await safeFetchJson(`${BASE_URL}/groups/${groupId}/studybot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, studentId, studentName })
    });
    return data;
  } catch (err) {
    console.error('API Error (queryStudyBot):', err);
    throw err;
  }
}

export async function fetchResourceContent(url) {
  try {
    const data = await safeFetchJson(`${BASE_URL}/groups/fetch-resource`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return data;
  } catch (err) {
    console.error('API Error (fetchResourceContent):', err);
    return { success: false, error: err.message };
  }
}