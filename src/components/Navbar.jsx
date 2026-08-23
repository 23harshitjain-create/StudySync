import React, { useState, useRef, useEffect } from 'react';
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
  Check,
  Target
} from 'lucide-react';
import EditProfileModal from './EditProfileModal';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddTask,
  onDataRefresh
}) {
  const { students, currentStudent, switchStudent } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSelectStudent = (studentId) => {
    switchStudent(studentId);
    setDropdownOpen(false);
    if (onDataRefresh) {
      onDataRefresh();
    }
  };

  const handleOpenEditProfile = () => {
    setDropdownOpen(false);
    setIsEditProfileOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo & Brand */}
            <div
              className="flex items-center space-x-3 cursor-pointer select-none"
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
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-surface-800/60'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />

                    <span>{item.label}</span>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                          isActive
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
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-850 hover:bg-surface-800 text-slate-200 border border-slate-700 text-xs font-semibold transition hover:border-brand-500/40"
                title="Upload PDF or Add Task manually"
              >
                <PlusCircle className="w-3.5 h-3.5 text-brand-400" />
                <span className="hidden sm:inline">
                  Upload / Add Task
                </span>
              </button>

              {/* Student Profile Dropdown */}
              {currentStudent && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-surface-900 hover:bg-surface-850 border border-slate-800 hover:border-slate-700 transition focus:outline-none"
                    aria-label="Profile options"
                  >
                    <img
                      src={currentStudent.avatar}
                      alt={currentStudent.name}
                      className="w-8 h-8 rounded-lg object-cover border border-brand-500/40"
                    />

                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-semibold text-white leading-tight">
                        {currentStudent.name}
                      </p>

                      <p className="text-[10px] text-brand-300 truncate max-w-[100px]">
                        {currentStudent.major}
                      </p>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-surface-900 border border-slate-800 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                      {/* Profile Header */}
                      <div className="p-3 rounded-xl bg-surface-950/60 border border-slate-800/80 mb-2">
                        <div className="flex items-center space-x-3">
                          <img
                            src={currentStudent.avatar}
                            alt={currentStudent.name}
                            className="w-12 h-12 rounded-xl object-cover border border-brand-500/40 shadow-glow flex-shrink-0"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">
                              {currentStudent.name}
                            </p>

                            <p className="text-xs text-brand-300 truncate">
                              {currentStudent.major}
                            </p>

                            <p className="text-[11px] text-slate-400 truncate">
                              {currentStudent.university || 'State Tech University'} • {currentStudent.year || 'Student'}
                            </p>
                          </div>
                        </div>

                        {/* Profile Meta Details */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                          {currentStudent.targetGrade && (
                            <div className="flex items-center space-x-2">
                              <Target className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                              <span className="truncate">Goal: <span className="text-slate-200 font-medium">{currentStudent.targetGrade}</span></span>
                            </div>
                          )}

                          {currentStudent.studyStyle && (
                            <div className="flex items-center space-x-2">
                              <Award className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                              <span className="truncate">Style: <span className="text-slate-200 font-medium">{currentStudent.studyStyle}</span></span>
                            </div>
                          )}

                          {currentStudent.preferredTimes && currentStudent.preferredTimes.length > 0 && (
                            <div className="flex items-start space-x-2">
                              <Clock className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">Prefers: <span className="text-slate-200 font-medium">{Array.isArray(currentStudent.preferredTimes) ? currentStudent.preferredTimes.join(', ') : currentStudent.preferredTimes}</span></span>
                            </div>
                          )}
                        </div>

                        {/* Edit Profile Action Button */}
                        <div className="mt-3 pt-2 border-t border-slate-800/80">
                          <button
                            onClick={handleOpenEditProfile}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-semibold transition"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-brand-400" />
                            <span>Edit Profile</span>
                          </button>
                        </div>
                      </div>

                      {/* Switch Student Profiles List */}
                      {students && students.length > 0 && (
                        <div className="space-y-1">
                          <div className="px-2 py-1 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Switch Student Profile
                            </p>
                            <span className="text-[10px] text-slate-500">
                              {students.length} Accounts
                            </span>
                          </div>

                          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                            {students.map((student) => {
                              const isSelected = student.id === currentStudent.id;
                              return (
                                <button
                                  key={student.id}
                                  onClick={() => handleSelectStudent(student.id)}
                                  className={`w-full flex items-center space-x-2.5 p-2 rounded-xl text-left transition ${
                                    isSelected
                                      ? 'bg-brand-600/20 border border-brand-500/30 text-white'
                                      : 'hover:bg-surface-800/80 text-slate-300 border border-transparent hover:border-slate-700/60'
                                  }`}
                                >
                                  <img
                                    src={student.avatar}
                                    alt={student.name}
                                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-brand-300' : 'text-white'}`}>
                                      {student.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {student.major} • {student.year}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                                      <Check className="w-3 h-3" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

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
                className={`flex flex-col items-center space-y-1 px-3 py-1 rounded-lg text-xs font-medium ${
                  isActive ? 'text-brand-400' : 'text-slate-400'
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
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSaveSuccess={onDataRefresh}
      />
    </>
  );
}