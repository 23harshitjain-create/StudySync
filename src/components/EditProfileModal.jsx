import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  BookOpen,
  GraduationCap,
  Sparkles,
  Clock,
  Target,
  Image as ImageIcon,
  Building,
  FileText,
  Save,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
];

const STUDY_STYLE_OPTIONS = [
  'Step-by-Step Problem Solving',
  'Collaborative Discussion',
  'Deep Focus',
  'Visual & Conceptual',
  'Practice Problems & Quizzing'
];

const TIME_SLOT_OPTIONS = [
  'Morning',
  'Afternoon',
  'Evening',
  'Late Night'
];

const TARGET_GRADE_OPTIONS = [
  'A / 4.0',
  'A- / 3.7',
  'B+ / 3.3',
  'Pass / Good',
  'High Honors'
];

const YEAR_OPTIONS = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate'
];

export default function EditProfileModal({ isOpen, onClose, onSaveSuccess }) {
  const { currentStudent, updateStudent } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    major: '',
    year: 'Junior',
    university: '',
    bio: '',
    studyStyle: '',
    preferredTimes: [],
    targetGrade: 'A / 4.0',
    avatar: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync form data when student or modal state changes
  useEffect(() => {
    if (currentStudent && isOpen) {
      setFormData({
        name: currentStudent.name || '',
        major: currentStudent.major || '',
        year: currentStudent.year || 'Junior',
        university: currentStudent.university || 'State Tech University',
        bio: currentStudent.bio || '',
        studyStyle: currentStudent.studyStyle || STUDY_STYLE_OPTIONS[0],
        preferredTimes: Array.isArray(currentStudent.preferredTimes)
          ? [...currentStudent.preferredTimes]
          : currentStudent.preferredTimes
          ? [currentStudent.preferredTimes]
          : ['Evening'],
        targetGrade: currentStudent.targetGrade || 'A / 4.0',
        avatar: currentStudent.avatar || PRESET_AVATARS[0]
      });
      setError('');
      setSuccess(false);
    }
  }, [currentStudent, isOpen]);

  if (!isOpen || !currentStudent) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const togglePreferredTime = (timeSlot) => {
    setFormData((prev) => {
      const exists = prev.preferredTimes.includes(timeSlot);
      const updatedTimes = exists
        ? prev.preferredTimes.filter((t) => t !== timeSlot)
        : [...prev.preferredTimes, timeSlot];
      return {
        ...prev,
        preferredTimes: updatedTimes
      };
    });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.major.trim()) {
      setError('Please enter your academic major.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updates = {
        name: formData.name.trim(),
        major: formData.major.trim(),
        year: formData.year.trim(),
        university: formData.university.trim() || 'State Tech University',
        bio: formData.bio.trim(),
        studyStyle: formData.studyStyle.trim(),
        preferredTimes: formData.preferredTimes.length > 0 ? formData.preferredTimes : ['Evening'],
        targetGrade: formData.targetGrade.trim(),
        avatar: formData.avatar.trim() || PRESET_AVATARS[0]
      };

      await updateStudent(currentStudent.id, updates);
      setSuccess(true);

      if (onSaveSuccess) {
        onSaveSuccess(updates);
      }

      // Close modal gracefully after brief success feedback
      setTimeout(() => {
        setSaving(false);
        onClose();
      }, 400);
    } catch (err) {
      console.error('Failed to update student profile:', err);
      setError(err?.message || 'Failed to save changes. Please check server connection.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-3xl bg-surface-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-surface-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Edit Student Profile</h2>
              <p className="text-xs text-slate-400">Update your academic information and study preferences</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-800 transition disabled:opacity-50"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Avatar Selection & Preview */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5 uppercase tracking-wider">
              <ImageIcon className="w-3.5 h-3.5 text-brand-400" />
              <span>Profile Avatar</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-950/50 p-4 rounded-2xl border border-slate-800">
              {/* Preview */}
              <div className="relative flex-shrink-0">
                <img
                  src={formData.avatar || PRESET_AVATARS[0]}
                  alt="Avatar Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/40 shadow-glow"
                  onError={(e) => {
                    e.target.src = PRESET_AVATARS[0];
                  }}
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-brand-600 rounded-md text-[9px] font-bold text-white uppercase">
                  Active
                </span>
              </div>

              {/* Preset Avatar Selector */}
              <div className="flex-1 w-full space-y-2">
                <p className="text-[11px] text-slate-400">Choose from preset avatars or enter custom image URL:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatar: url }))}
                      className={`relative w-8 h-8 rounded-lg overflow-hidden border-2 transition ${
                        formData.avatar === url
                          ? 'border-brand-400 scale-105 shadow-glow ring-2 ring-brand-500/30'
                          : 'border-transparent hover:border-slate-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-surface-900 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Core Academic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Alex Rivera"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            {/* Major */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                <span>Academic Major *</span>
              </label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                required
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Class Year</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* University */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>University / College</span>
              </label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                placeholder="e.g. State Tech University"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          {/* Section 3: Study Preferences & Matching Factors */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Study Preferences & Matching Factors
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Study Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Preferred Study Style</span>
                </label>
                <select
                  name="studyStyle"
                  value={formData.studyStyle}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                >
                  {STUDY_STYLE_OPTIONS.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Grade / GPA */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target Grade / Goal</span>
                </label>
                <select
                  name="targetGrade"
                  value={formData.targetGrade}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                >
                  {TARGET_GRADE_OPTIONS.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preferred Study Times */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Preferred Study Time Slots</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIME_SLOT_OPTIONS.map((slot) => {
                  const isSelected = formData.preferredTimes.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => togglePreferredTime(slot)}
                      className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition border ${
                        isSelected
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm'
                          : 'bg-surface-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio / Academic Focus */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Bio & Study Interests</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                placeholder="Share your focus areas, problem sets you are working on, or how you like to collaborate..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition resize-none"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-surface-950/40">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-surface-800 text-slate-300 text-xs font-semibold transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
