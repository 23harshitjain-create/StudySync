import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  BookOpen,
  Users,
  Layers,
  PlusCircle,
  ChevronDown,
  Clock,
  Award,
  Edit3,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { updateStudent } from '../utils/api';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddTask,
  onDataRefresh
}) {
  const { currentStudent } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    major: '',
    year: '',
    studyStyle: '',
    preferredTimes: '',
    avatar: ''
  });

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Layers
    },
    {
      id: 'find-partners',
      label: 'Find Partners',
      icon: Sparkles,
      badge: 'AI Match'
    },
    {
      id: 'groups',
      label: 'Study Groups',
      icon: Users
    }
  ];

  const openEditProfile = () => {
    if (!currentStudent) return;

    setFormData({
      name: currentStudent.name || '',
      major: currentStudent.major || '',
      year: currentStudent.year || '',
      studyStyle: currentStudent.studyStyle || '',
      preferredTimes: Array.isArray(currentStudent.preferredTimes)
        ? currentStudent.preferredTimes.join(', ')
        : '',
      avatar: currentStudent.avatar || ''
    });

    setDropdownOpen(false);
    setEditOpen(true);
  };

  const closeEditProfile = () => {
    if (saving) return;
    setEditOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!currentStudent) return;

    if (!formData.name.trim()) {
      alert('Please enter your name.');
      return;
    }

    if (!formData.major.trim()) {
      alert('Please enter your major.');
      return;
    }

    setSaving(true);

    try {
      const updates = {
        name: formData.name.trim(),
        major: formData.major.trim(),
        year: formData.year.trim(),
        studyStyle: formData.studyStyle.trim(),
        preferredTimes: formData.preferredTimes
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        avatar: formData.avatar.trim()
      };

      await updateStudent(currentStudent.id, updates);

      if (onDataRefresh) {
        onDataRefresh();
      }

      setEditOpen(false);

      // Reload so AuthContext gets the updated student from the API.
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(
        `Failed to update profile.\n\n${error?.message || 'Please try again.'
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo & Brand */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 p-[2px] shadow-glow flex items-center justify-center">
                <div className="w-full h-full bg-surface-950 rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-brand-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-display font-bold text-xl tracking-tight text-white">
                    Study<span className="text-brand-400">Sync</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                  AI Academic Partner Matching
                </p>
              </div>
            </div>

            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 bg-surface-900/60 p-1 rounded-xl border border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-surface-800/60'
                      }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'
                        }`}
                    />

                    <span>{item.label}</span>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-brand-500/20 text-brand-300'
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">

              {/* Upload / Add Task */}
              <button
                onClick={onOpenAddTask}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-850 hover:bg-surface-800 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                title="Upload PDF or Add Task manually"
              >
                <PlusCircle className="w-3.5 h-3.5 text-brand-400" />

                <span className="hidden sm:inline">
                  Upload / Add Task
                </span>
              </button>

              {/* Profile Dropdown */}
              {currentStudent && (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-surface-900 hover:bg-surface-850 border border-slate-800 transition"
                  >
                    <img
                      src={currentStudent.avatar}
                      alt={currentStudent.name}
                      className="w-8 h-8 rounded-lg object-cover border border-brand-500/30"
                    />

                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-semibold text-white leading-tight">
                        {currentStudent.name}
                      </p>

                      <p className="text-[10px] text-brand-300 truncate max-w-[100px]">
                        {currentStudent.major}
                      </p>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-900 border border-slate-800 shadow-2xl p-2 z-50">

                      {/* Profile Header */}
                      <div className="px-3 py-3 border-b border-slate-800 mb-1">
                        <div className="flex items-center space-x-3">
                          <img
                            src={currentStudent.avatar}
                            alt={currentStudent.name}
                            className="w-11 h-11 rounded-xl object-cover border border-brand-500/30"
                          />

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {currentStudent.name}
                            </p>

                            <p className="text-xs text-slate-400 truncate">
                              {currentStudent.major}
                              {currentStudent.year
                                ? ` • ${currentStudent.year}`
                                : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="px-3 py-2 space-y-2">

                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            Style:{' '}
                            <span className="text-slate-200">
                              {currentStudent.studyStyle || 'Not set'}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-start space-x-2 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 mt-0.5" />

                          <span>
                            Prefers:{' '}
                            <span className="text-slate-200">
                              {currentStudent.preferredTimes?.length
                                ? currentStudent.preferredTimes.join(', ')
                                : 'Not set'}
                            </span>
                          </span>
                        </div>

                      </div>

                      {/* Edit Profile Button */}
                      <div className="border-t border-slate-800 pt-2 mt-1">
                        <button
                          onClick={openEditProfile}
                          className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-surface-800 transition"
                        >
                          <Edit3 className="w-4 h-4 text-brand-400" />
                          <span>Edit Profile</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex items-center justify-around bg-surface-900/90 py-2 border-t border-slate-800 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-1 rounded-lg text-xs font-medium ${isActive ? 'text-brand-400' : 'text-slate-400'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Edit Profile Modal */}
      {editOpen && currentStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl bg-surface-900 border border-slate-700 shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Edit Profile
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Update your academic and study preferences
                </p>
              </div>

              <button
                onClick={closeEditProfile}
                disabled={saving}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Major */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Major
                </label>

                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Year
                </label>

                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="e.g. Junior"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Study Style */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Study Style
                </label>

                <input
                  type="text"
                  name="studyStyle"
                  value={formData.studyStyle}
                  onChange={handleInputChange}
                  placeholder="e.g. Step-by-Step Problem Solving"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Preferred Times */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Preferred Study Times
                </label>

                <input
                  type="text"
                  name="preferredTimes"
                  value={formData.preferredTimes}
                  onChange={handleInputChange}
                  placeholder="e.g. Evening, Late Night"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />

                <p className="text-[11px] text-slate-500 mt-1">
                  Separate multiple times with commas.
                </p>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Profile Image URL
                </label>

                <input
                  type="text"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-800">

              <button
                onClick={closeEditProfile}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-surface-800 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}