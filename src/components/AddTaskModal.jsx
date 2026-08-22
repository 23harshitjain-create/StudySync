import React, { useState } from 'react';
import { X, BookOpen, Calendar, Tag, Layers, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createAssignment } from '../utils/api';

export default function AddTaskModal({ isOpen, onClose, onTaskCreated }) {
  const { currentStudent } = useAuth();
  const [courseCode, setCourseCode] = useState('CS 201');
  const [courseName, setCourseName] = useState('Data Structures & Algorithms');
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('Assignment');
  const [topics, setTopics] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(6);
  const [difficulty, setDifficulty] = useState('Medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
      onClose();
    } catch (err) {
      setError('Failed to create assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Plus className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Add Academic Task</h2>
              <p className="text-xs text-slate-400">Add an assignment or lab to find matching study partners</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          
          {/* Course Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Code</label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CS 201"
                className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment / Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lab 4: AVL Trees & Double Rotations"
              className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Task Type & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Task Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Assignment">Assignment</option>
                <option value="Lab">Lab</option>
                <option value="Project">Project</option>
                <option value="Quiz">Quiz</option>
                <option value="Exam Prep">Exam Prep</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Challenging">Challenging</option>
              </select>
            </div>
          </div>

          {/* Key Topics & Concepts */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Topics / Keywords <span className="text-slate-500 font-normal">(Comma separated for AI matching)</span>
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. Binary Search Tree, AVL, Recursion, C++"
              className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Deadline & Estimated Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Work Hours</label>
              <input
                type="number"
                min="1"
                max="50"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description / Goal</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you hoping to collaborate on?"
              className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-800 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save & Match Partners'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
