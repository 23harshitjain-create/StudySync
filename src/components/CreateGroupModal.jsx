import React, { useState, useEffect } from 'react';
import { X, Users, BookOpen, Layers, CheckCircle2, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createStudyGroup } from '../utils/api';

export default function CreateGroupModal({ isOpen, onClose, initialData, onGroupCreated }) {
  const { currentStudent } = useAuth();
  const [name, setName] = useState('');
  const [courseCode, setCourseCode] = useState('CS 201');
  const [taskTitle, setTaskTitle] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(4);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill from initialData when opened from a match
  useEffect(() => {
    if (initialData) {
      const code = initialData.courseCode || 'CS 201';
      const title = initialData.taskTitle || initialData.title || `${code} Study Sprint`;
      setCourseCode(code);
      setTaskTitle(title);
      setName(`${code} ${initialData.partnerName ? `& ${initialData.partnerName.split(' ')[0]}'s Sprint` : 'Study Sprint'}`);
      setDescription(`Collaborative sprint group for ${title}.`);
    } else {
      setName('CS 201 Study Sprint');
      setCourseCode('CS 201');
      setTaskTitle('Data Structures Lab 3');
      setDescription('Collaborative sprint group to work through assignment deliverables.');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !courseCode.trim()) {
      setError('Please provide a group name and course code');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        name: name.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        taskTitle: taskTitle.trim() || `${courseCode} Study Group`,
        createdById: currentStudent?.id || 'student-1',
        maxCapacity: Number(maxCapacity) || 4,
        description: description.trim() || 'Collaborative sprint group to work through assignment deliverables.',
        initialMilestones: [
          { id: `m-${Date.now()}-1`, title: 'Review assignment requirements and setup workspace', completed: false, assignedTo: currentStudent?.name || 'Admin' },
          { id: `m-${Date.now()}-2`, title: 'Draft core algorithm / implementation outline', completed: false, assignedTo: 'Unassigned' },
          { id: `m-${Date.now()}-3`, title: 'Pass test benchmark cases & review submission', completed: false, assignedTo: 'Unassigned' }
        ]
      };

      const newGroup = await createStudyGroup(payload);
      if (onGroupCreated) onGroupCreated(newGroup);
      onClose();
    } catch (err) {
      setError('Failed to create study group: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-slate-700 shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Create Study Group</h2>
              <p className="text-xs text-slate-400">Start a collaborative room with milestones & live chat</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Group Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Group Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CS330 Virtual Memory Sprint"
              className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Course Code & Capacity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Code</label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CS 330"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Capacity</label>
              <select
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value={3}>3 Peers</option>
                <option value={4}>4 Peers</option>
                <option value={5}>5 Peers</option>
                <option value={6}>6 Peers</option>
              </select>
            </div>
          </div>

          {/* Task / Assignment Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment / Task Title</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Lab 4: Virtual Memory & Page Replacement"
              className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Sprint Goals / Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What deliverables will your group focus on together?"
              className="w-full px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2.5">
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{submitting ? 'Creating Room...' : 'Create & Enter Room'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
