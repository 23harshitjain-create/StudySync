/**
 * StudySync PDF Information Extractor & AI Task Understanding Service
 * 
 * Features:
 * 1. Extracts text from raw PDF buffer using pdf-parse or fallback stream parser.
 * 2. Deterministic & explainable heuristic academic NLP extraction (course code, title, type, topics, deadline, difficulty, hours, summary).
 * 3. Optional Gemini API structured JSON extraction if GEMINI_API_KEY is configured.
 * 4. 100% offline & zero-key reliable fallback for hackathon demonstration.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let PDFParseClass = null;
try {
  const pdfModule = require('pdf-parse');
  PDFParseClass = pdfModule.PDFParse || pdfModule;
} catch (e) {
  console.warn('pdf-parse module load notice:', e.message);
}

// Course catalog map for common abbreviations to human readable names
const COURSE_CATALOG = {
  'CS 101': 'Introduction to Computer Science',
  'CS 106': 'Programming Abstractions',
  'CS 201': 'Data Structures & Algorithms',
  'CS 229': 'Machine Learning',
  'CS 230': 'Deep Learning & Neural Networks',
  'CS 330': 'Operating Systems Principles',
  'CS 348': 'Computer Networks & Distributed Systems',
  'CS 450': 'Database Systems & SQL Optimization',
  'MATH 101': 'Single Variable Calculus',
  'MATH 240': 'Linear Algebra & Applications',
  'MATH 310': 'Probability & Mathematical Statistics',
  'BIO 110': 'Cell & Molecular Biology',
  'BIO 210': 'Computational Genomics & Bioinformatics',
  'PHYS 150': 'Physics: Mechanics & Wave Motion',
  'CHEM 101': 'General Chemistry & Lab',
  'EE 201': 'Digital Circuits & Logic Design',
  'DATA 101': 'Introduction to Data Science'
};

// Known technical topic keywords across subjects
const ACADEMIC_TOPICS = [
  // Data Structures & Algos
  'Binary Search Tree', 'AVL Trees', 'Red-Black Trees', 'B-Trees', 'Recursion', 
  'Dynamic Programming', 'Dijkstra', 'Graph Traversal', 'BFS', 'DFS', 'Heap', 
  'Hash Table', 'Sorting', 'Quicksort', 'Merge Sort', 'Tree Rotations',
  
  // Systems & OS
  'Virtual Memory', 'Paging', 'Page Replacement', 'LRU', 'Threads', 'Concurrency', 
  'POSIX Mutex', 'Semaphores', 'Deadlock Prevention', 'Round Robin', 'CPU Scheduling', 
  'Kernel', 'Context Switching', 'Process Synchronization', 'File Systems',
  
  // Math & Stats
  'Eigenvalues', 'Eigenvectors', 'Matrix Diagonalization', 'Vector Spaces', 
  'Orthogonal Projections', 'Singular Value Decomposition', 'Determinant', 
  'Markov Chains', 'Bayesian Inference', 'Hypothesis Testing', 'Linear Regression',
  
  // AI & ML
  'Neural Networks', 'Backpropagation', 'Gradient Descent', 'Convolutional Layers', 
  'Transformers', 'Attention Mechanism', 'Support Vector Machines', 'Decision Trees',
  
  // Programming Languages & Tools
  'C++', 'C', 'Python', 'Java', 'Rust', 'MATLAB', 'SQL', 'R', 'Go', 'Assembly'
];

/**
 * Heuristic Extractor: parses raw text without external APIs
 */
export function extractMetadataHeuristically(rawText = '', fileName = '') {
  const text = (rawText || '').trim();
  const textUpper = text.toUpperCase();

  // 1. Extract Course Code (e.g. CS 201, CS-201, CS201, MATH 240, etc.)
  let courseCode = 'CS 201';
  let courseName = 'Data Structures & Algorithms';

  const courseMatch = text.match(/\b([A-Z]{2,4})\s*[-–]?\s*(\d{3}[A-Z]?)\b/i) || 
                      fileName.match(/\b([A-Z]{2,4})\s*[-–]?\s*(\d{3}[A-Z]?)\b/i);

  if (courseMatch) {
    courseCode = `${courseMatch[1].toUpperCase()} ${courseMatch[2].toUpperCase()}`;
    if (COURSE_CATALOG[courseCode]) {
      courseName = COURSE_CATALOG[courseCode];
    } else {
      const dept = courseMatch[1].toUpperCase();
      courseName = dept === 'CS' || dept === 'CSE' ? 'Computer Science' :
                   dept === 'MATH' ? 'Mathematics' :
                   dept === 'BIO' ? 'Biology' :
                   dept === 'PHYS' ? 'Physics' :
                   dept === 'EE' ? 'Electrical Engineering' : `${dept} Course`;
    }
  }

  // 2. Extract Task Type
  let taskType = 'Assignment';
  if (/\b(LAB|LABORATORY)\b/i.test(text) || /\bLAB\b/i.test(fileName)) {
    taskType = 'Lab';
  } else if (/\b(PROJECT|FINAL PROJECT|MILESTONE)\b/i.test(text) || /PROJECT/i.test(fileName)) {
    taskType = 'Project';
  } else if (/\b(QUIZ|MIDTERM|EXAM|TEST)\b/i.test(text) || /QUIZ|EXAM/i.test(fileName)) {
    taskType = /\b(QUIZ)\b/i.test(text) ? 'Quiz' : 'Exam Prep';
  } else if (/\b(PROBLEM SET|PSET|HOMEWORK|HW)\b/i.test(text)) {
    taskType = 'Assignment';
  }

  // 3. Extract Assignment / Task Title
  let title = '';
  // Try pattern: "Lab 3: Binary Search Trees" or "Assignment 4 - Eigenvalues"
  const titleMatch = text.match(/(?:Assignment|Lab|Project|Problem Set|Pset|Homework|HW)\s*#?\s*\d*\s*[:\-–]\s*([^\n\r]+)/i);
  if (titleMatch && titleMatch[1]?.trim().length > 3) {
    title = titleMatch[0].trim().replace(/\s+/g, ' ');
  } else {
    // Check first 3 lines for a prominent header
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 5);
    if (lines.length > 0) {
      const candidate = lines.find(l => !l.startsWith('Due') && !l.startsWith('Date') && l.length < 80);
      title = candidate || `${taskType} on ${courseCode}`;
    } else {
      title = `${taskType}: ${courseCode} Comprehensive Practice`;
    }
  }
  // Clean title length
  if (title.length > 70) {
    title = title.substring(0, 67) + '...';
  }

  // 4. Extract Relevant Topics
  const extractedTopics = [];
  ACADEMIC_TOPICS.forEach(topic => {
    const regex = new RegExp(`\\b${topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text) || regex.test(fileName)) {
      if (!extractedTopics.includes(topic)) {
        extractedTopics.push(topic);
      }
    }
  });

  // If no predefined topic matches, extract capitalized multi-word phrases
  if (extractedTopics.length === 0) {
    const words = text.match(/\b[A-Z][a-z]{3,}\s+[A-Z][a-z]{3,}\b/g);
    if (words) {
      words.slice(0, 3).forEach(w => {
        if (!extractedTopics.includes(w)) extractedTopics.push(w);
      });
    }
  }

  // Ensure fallback topics
  if (extractedTopics.length === 0) {
    extractedTopics.push(courseCode, taskType, 'Problem Solving');
  }

  // 5. Extract Submission Deadline
  let deadline = '';
  const dueMatch = text.match(/(?:Due|Deadline|Submission Date|Submit by|Date Due)[:\s]*([A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?,?\s*\d{0,4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (dueMatch && dueMatch[1]) {
    try {
      const parsedDate = new Date(dueMatch[1]);
      if (!isNaN(parsedDate.getTime()) && parsedDate.getTime() > Date.now() - 86400000 * 30) {
        deadline = parsedDate.toISOString();
      }
    } catch (e) {
      // Fallback below
    }
  }
  
  if (!deadline) {
    // Default to 4 days from now at 11:59 PM
    const target = new Date(Date.now() + 86400000 * 4);
    target.setHours(23, 59, 0, 0);
    deadline = target.toISOString();
  }

  // 6. Estimate Hours & Difficulty
  let estimatedHours = 6;
  let difficulty = 'Medium';

  if (taskType === 'Project') {
    estimatedHours = 14;
    difficulty = 'Hard';
  } else if (taskType === 'Lab') {
    estimatedHours = 8;
    difficulty = extractedTopics.some(t => ['AVL Trees', 'Virtual Memory', 'Deadlock Prevention', 'Semaphores', 'Backpropagation'].includes(t)) 
      ? 'Challenging' 
      : 'Medium';
  } else if (taskType === 'Quiz') {
    estimatedHours = 4;
    difficulty = 'Medium';
  }

  // 7. Generate Short Summary
  let summary = '';
  const summarySentences = text.split(/(?<=[.?!])\s+/).filter(s => s.length > 20 && s.length < 160);
  if (summarySentences.length > 0) {
    summary = summarySentences.slice(0, 2).join(' ').trim();
  } else {
    summary = `Work on ${courseCode} ${taskType} focusing on ${extractedTopics.slice(0, 3).join(', ')}.`;
  }

  return {
    courseCode,
    courseName,
    title,
    taskType,
    topics: extractedTopics.slice(0, 5),
    deadline,
    estimatedHours,
    difficulty,
    summary,
    extractionMethod: 'Deterministic Heuristic NLP'
  };
}

/**
 * Extract raw text from PDF buffer
 */
export async function parsePdfBuffer(pdfBuffer) {
  if (!pdfBuffer) return '';

  // 1. Try PDFParse Class (v2.x)
  if (PDFParseClass) {
    try {
      const uint8 = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
      const parser = typeof PDFParseClass === 'function' ? new PDFParseClass({ data: uint8 }) : null;
      if (parser && typeof parser.getText === 'function') {
        const res = await parser.getText();
        const extractedText = (res && typeof res.text === 'string') ? res.text : (typeof res === 'string' ? res : '');
        if (extractedText && extractedText.trim().length > 0) {
          return extractedText.trim();
        }
      }
    } catch (parseErr) {
      console.warn('PDFParseClass parsing failed, trying text stream fallback:', parseErr.message);
    }
  }

  // 2. Pure JS stream / ASCII text extractor fallback
  try {
    const rawString = Buffer.isBuffer(pdfBuffer) ? pdfBuffer.toString('binary') : String(pdfBuffer);
    const textChunks = [];
    const textObjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = textObjRegex.exec(rawString)) !== null) {
      textChunks.push(match[1]);
    }

    if (textChunks.length > 0) {
      return textChunks.join(' ');
    }

    // Secondary fallback: extract readable ASCII words
    const asciiMatches = rawString.match(/[A-Za-z0-9\s.,:;()'"\-_/]{4,}/g) || [];
    return asciiMatches.join(' ');
  } catch (fallbackErr) {
    console.error('Text stream extraction fallback error:', fallbackErr);
    return '';
  }
}

/**
 * Main Extraction Pipeline (PDF Buffer / Text -> Structured Task)
 */
export async function extractAssignmentFromPdf(pdfBuffer, fileName = '') {
  let rawText = '';

  if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
    rawText = await parsePdfBuffer(pdfBuffer);
  } else if (typeof pdfBuffer === 'string') {
    rawText = pdfBuffer;
  }

  // If Gemini API Key is available in environment, try LLM extraction
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && rawText.length > 30) {
    try {
      const prompt = `Analyze this academic assignment text and return ONLY valid JSON with keys:
- courseCode: string (e.g. "CS 201", "MATH 240")
- courseName: string (e.g. "Data Structures & Algorithms")
- title: string (e.g. "Lab 3: Binary Search Trees")
- taskType: "Assignment" | "Lab" | "Project" | "Quiz" | "Exam Prep"
- topics: string[] (top 3 to 5 core concept keywords)
- deadline: string (ISO date string if found or empty)
- estimatedHours: number
- difficulty: "Easy" | "Medium" | "Hard" | "Challenging"
- summary: string (1-2 sentence description)

Assignment Text:
${rawText.substring(0, 3000)}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return {
            ...parsed,
            extractionMethod: 'Google Gemini AI'
          };
        }
      }
    } catch (llmErr) {
      console.warn('Gemini API call failed, falling back to deterministic heuristic parser:', llmErr.message);
    }
  }

  // Deterministic Heuristic Extraction
  return extractMetadataHeuristically(rawText, fileName);
}
