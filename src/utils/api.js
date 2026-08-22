const RAW_API_URL = import.meta.env.VITE_API_URL || '';
export const BASE_URL = RAW_API_URL ? `${RAW_API_URL.replace(/\/$/, '')}/api` : '/api';

export async function fetchStudents() {
  try {
    const res = await fetch(`${BASE_URL}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
    const data = await res.json();
    return data.students || [];
  } catch (err) {
    console.error('API Error (fetchStudents):', err);
    return [];
  }
}

export async function fetchAssignments(studentId = null) {
  try {
    const url = studentId ? `${BASE_URL}/assignments?studentId=${studentId}` : `${BASE_URL}/assignments`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    const data = await res.json();
    return data.assignments || [];
  } catch (err) {
    console.error('API Error (fetchAssignments):', err);
    return [];
  }
}

export async function createAssignment(assignmentData) {
  try {
    const res = await fetch(`${BASE_URL}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData)
    });
    if (!res.ok) throw new Error('Failed to create assignment');
    const data = await res.json();
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

    const res = await fetch(`${BASE_URL}/assignments/extract-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to extract PDF data');
    }

    const data = await res.json();
    return data.metadata;
  } catch (err) {
    console.error('API Error (extractPdfAssignment):', err);
    throw err;
  }
}

export async function fetchGroups() {
  try {
    const res = await fetch(`${BASE_URL}/groups`);
    if (!res.ok) throw new Error('Failed to fetch groups');
    const data = await res.json();
    return data.groups || [];
  } catch (err) {
    console.error('API Error (fetchGroups):', err);
    return [];
  }
}

export async function createStudyGroup(groupData) {
  try {
    const res = await fetch(`${BASE_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create study group');
    }
    const data = await res.json();
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
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch matches');
    const data = await res.json();
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
