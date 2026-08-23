import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  Tag, 
  Layers, 
  Plus, 
  ArrowRight, 
  RotateCcw,
  Zap,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createAssignment, extractPdfAssignment } from '../utils/api';

// Sample presets for quick testing / 1-click sample templates
const SAMPLE_PRESETS = [
  {
    label: 'CS 330: Virtual Memory Lab',
    desc: 'Operating Systems - LRU Paging & Page Tables',
    rawText: `CS 330: Operating Systems Principles
Lab 4: Virtual Memory Management and LRU Page Replacement
Due Date: October 28, 2026 at 23:59
Task Type: Laboratory Project

Description:
Implement a demand-paged virtual memory simulator in C. Students will implement the page table walk, translation lookaside buffer (TLB), FIFO and Least Recently Used (LRU) page replacement algorithms, and calculate page fault rates under varying memory workloads.

Key Topics:
Virtual Memory, Paging, Page Replacement, LRU, TLB, Cache Hit Ratio, Process Memory, C

Estimated Workload: 12 Hours
Difficulty: Challenging`
  },
  {
    label: 'MATH 240: SVD Problem Set',
    desc: 'Linear Algebra - Matrix Decomposition',
    rawText: `MATH 240: Linear Algebra & Applications
Problem Set 5: Singular Value Decomposition & Orthogonal Projections
Due Date: October 26, 2026 at 18:00
Task Type: Assignment

Description:
Derive singular values for rectangular matrices, compute principal component axes, and prove orthogonality theorems for symmetric positive-definite matrices. Implement SVD matrix approximation in MATLAB.

Topics:
Singular Value Decomposition, SVD, Orthogonal Projections, Eigenvalues, Matrix Approximation, MATLAB

Estimated Workload: 6 Hours
Difficulty: Medium`
  },
  {
    label: 'BIO 210: Sequence Alignment',
    desc: 'Genomics - Dynamic Programming',
    rawText: `BIO 210: Computational Genomics & Bioinformatics
Lab 2: Global and Local Sequence Alignment
Due Date: October 27, 2026 at 23:59
Task Type: Lab

Description:
Implement Needleman-Wunsch and Smith-Waterman dynamic programming scoring algorithms to find optimal pairwise alignments between DNA sequences with affine gap penalties.

Topics:
Needleman-Wunsch, Smith-Waterman, Dynamic Programming, Sequence Alignment, BLAST, Python

Estimated Workload: 8 Hours
Difficulty: Medium`
  }
];

export default function AssignmentUploader({ isOpen, onClose, onTaskCreated }) {
  const { currentStudent } = useAuth();
  
  // Tab Mode: 'upload' | 'manual'
  const [activeTab, setActiveTab] = useState('upload');
  
  // Drag-and-drop / File State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMethod, setExtractionMethod] = useState('');
  const [error, setError] = useState('');
  
  // Review Form Fields (Extracted or Manual)
  const [courseCode, setCourseCode] = useState('CS 201');
  const [courseName, setCourseName] = useState('Data Structures & Algorithms');
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('Assignment');
  const [topics, setTopics] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(6);
  const [difficulty, setDifficulty] = useState('Medium');
  const [description, setDescription] = useState('');
  
  const [extractedReady, setExtractedReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle Drag Events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Populate Review Form from Extracted Metadata
  const populateFormWithMetadata = (meta) => {
    if (!meta) return;
    setCourseCode(meta.courseCode || 'CS 201');
    setCourseName(meta.courseName || 'Computer Science Course');
    setTitle(meta.title || 'Academic Task');
    setTaskType(meta.taskType || 'Assignment');
    setTopics(Array.isArray(meta.topics) ? meta.topics.join(', ') : (meta.topics || ''));
    if (meta.deadline) {
      try {
        const d = new Date(meta.deadline);
        if (!isNaN(d.getTime())) {
          // Format as YYYY-MM-DDTHH:mm
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setDeadline(localIso);
        }
      } catch (e) {}
    }
    setEstimatedHours(meta.estimatedHours || 6);
    setDifficulty(meta.difficulty || 'Medium');
    setDescription(meta.summary || '');
    setExtractionMethod(meta.extractionMethod || 'Deterministic Heuristic NLP');
    setExtractedReady(true);
    setError('');
  };

  // Process PDF File
  const handleFileProcess = async (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file (.pdf). Invalid file format rejected.');
      return;
    }

    try {
      setSelectedFile(file);
      setError('');
      setIsExtracting(true);

      const metadata = await extractPdfAssignment(file);
      populateFormWithMetadata(metadata);
    } catch (err) {
      setError('Failed to extract PDF data: ' + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Handle Preset Selection
  const handleSelectPreset = async (preset) => {
    try {
      setError('');
      setIsExtracting(true);
      setSelectedFile({ name: `${preset.label.replace(/[^a-z0-9]/gi, '_')}.pdf`, size: 142850 });
      
      const metadata = await extractPdfAssignment(preset.rawText, preset.label);
      populateFormWithMetadata(metadata);
    } catch (err) {
      setError('Failed to process sample preset: ' + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  // Submit Final Assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !courseCode.trim()) {
      setError('Please fill in the course code and assignment title');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const payload = {
        studentId: currentStudent?.id || 'student-1',
        courseCode: courseCode.trim().toUpperCase(),
        courseName: courseName.trim() || courseCode.trim(),
        title: title.trim(),
        taskType,
        topics: topics.split(',').map(t => t.trim()).filter(Boolean),
        deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 86400000 * 3).toISOString(),
        estimatedHours: Number(estimatedHours) || 4,
        difficulty,
        description: description.trim()
      };

      const newAssignment = await createAssignment(payload);
      if (onTaskCreated) onTaskCreated(newAssignment);
      handleReset();
      onClose();
    } catch (err) {
      setError('Failed to create assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractedReady(false);
    setError('');
    setTitle('');
    setDescription('');
    setTopics('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-surface-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 p-0.5 shadow-glow flex items-center justify-center">
              <div className="w-full h-full bg-surface-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white font-display">Add & Understand Academic Task</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  AI Extractor
                </span>
              </div>
              <p className="text-xs text-slate-400">Upload assignment PDF or syllabus to automatically extract metadata & match peers</p>
            </div>
          </div>

          <button
            onClick={() => { handleReset(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (PDF Upload vs Manual) */}
        {!extractedReady && (
          <div className="flex border-b border-slate-800 bg-surface-950/40 px-6 pt-3">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 pb-3 px-4 text-xs font-semibold border-b-2 transition ${
                activeTab === 'upload'
                  ? 'border-brand-500 text-brand-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>PDF Upload & AI Extractor</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center space-x-2 pb-3 px-4 text-xs font-semibold border-b-2 transition ${
                activeTab === 'manual'
                  ? 'border-brand-500 text-brand-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Manual Form Entry</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MODE 1: PDF Dropzone & Presets (if not extracted yet and in upload tab) */}
          {activeTab === 'upload' && !extractedReady && !isExtracting && (
            <div className="space-y-5">
              
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-brand-400 bg-brand-950/30 scale-[1.01]' 
                    : 'border-slate-700/80 bg-surface-900/40 hover:border-brand-500/60 hover:bg-surface-900/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mx-auto flex items-center justify-center mb-3.5 shadow-glow">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <h3 className="text-sm font-bold text-white font-display">
                  Drop your Assignment PDF here, or <span className="text-brand-400 hover:underline">browse files</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Upload homework, lab instructions, syllabus or project specs (.pdf up to 10MB)
                </p>

                <div className="mt-4 flex items-center justify-center space-x-4 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Auto-extracts Course & Topics</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deterministic Fallback Ready</span>
                  </span>
                </div>
              </div>

              {/* 1-Click Sample Assignment Presets */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Start: Try Sample Assignment Presets</span>
                  </p>
                  <span className="text-[10px] text-slate-500">1-Click Sample</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="p-3 rounded-2xl bg-surface-900/80 hover:bg-surface-850 border border-slate-800 hover:border-brand-500/40 text-left transition group"
                    >
                      <p className="text-xs font-bold text-brand-300 group-hover:text-brand-200 truncate">
                        {preset.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {preset.desc}
                      </p>
                      <span className="mt-2 inline-flex items-center space-x-1 text-[10px] text-brand-400 font-semibold">
                        <span>Parse Sample</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* LOADING STATE: AI Parsing In Progress */}
          {isExtracting && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-brand-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Extracting Academic Metadata</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Analyzing course codes, topic keywords, deadlines, and requirements from {selectedFile?.name || 'PDF'}...
                </p>
              </div>
            </div>
          )}

          {/* REVIEW & CONFIRMATION FORM (When extracted or in manual mode) */}
          {(extractedReady || activeTab === 'manual') && !isExtracting && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Extraction Success Banner */}
              {extractedReady && (
                <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FileCheck className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        Extracted from: <span className="text-brand-300">{selectedFile?.name}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Method: <span className="text-emerald-400 font-semibold">{extractionMethod}</span> • Review and adjust any details below
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-surface-900 hover:bg-surface-800 text-slate-400 hover:text-slate-200 text-[11px] font-semibold flex items-center space-x-1 flex-shrink-0"
                    title="Upload different PDF"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Change PDF</span>
                  </button>
                </div>
              )}

              {/* Course Code & Course Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course Code <span className="text-brand-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS 330"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course Name</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Operating Systems Principles"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assignment Title <span className="text-brand-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lab 4: Virtual Memory Management & Page Tables"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Task Type & Difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Task Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Lab">Lab</option>
                    <option value="Project">Project</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Exam Prep">Exam Prep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>
              </div>

              {/* Key Topics Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Concepts & Topics <span className="text-slate-500 font-normal">(Comma separated tags used by AI Matching Engine)</span>
                </label>
                <input
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="e.g. Virtual Memory, Paging, LRU, C, Threads"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Deadline & Estimated Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Submission Deadline</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Work Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Summary</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of requirements or what you want to collaborate on..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { handleReset(); onClose(); }}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-surface-800 text-xs font-medium transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Saving Assignment...' : 'Confirm & Find Study Partners'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
