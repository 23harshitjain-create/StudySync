import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Layers, 
  PlusCircle, 
  RotateCcw, 
  ChevronDown,
  Clock,
  Award
} from 'lucide-react';
import { resetDemoData } from '../utils/api';

export default function Navbar({ activeTab, setActiveTab, onOpenAddTask, onDataRefresh }) {
  const { students, currentStudent, switchStudent } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (confirm('Reset demo data back to default state?')) {
      setResetting(true);
      await resetDemoData();
      if (onDataRefresh) onDataRefresh();
      setTimeout(() => setResetting(false), 600);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'find-partners', label: 'Find Partners', icon: Sparkles, badge: 'AI Match' },
    { id: 'groups', label: 'Study Groups', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 p-[2px] shadow-glow flex items-center justify-center">
              <div className="w-full h-full bg-surface-950 rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-bold text-xl tracking-tight text-white">Study<span className="text-brand-400">Sync</span></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Hackathon
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">AI Academic Partner Matching</p>
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
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-brand-500/20 text-brand-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions & Student Switcher */}
          <div className="flex items-center space-x-3">
            
            {/* Quick Upload / Add Assignment Button */}
            <button
              onClick={onOpenAddTask}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-850 hover:bg-surface-800 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Upload PDF or Add Task manually"
            >
              <PlusCircle className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">Upload / Add Task</span>
            </button>

            {/* Reset Demo State Button */}
            <button
              onClick={handleReset}
              disabled={resetting}
              className="p-2 rounded-lg bg-surface-900 hover:bg-surface-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
              title="Reset Demo Data"
            >
              <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin text-brand-400' : ''}`} />
            </button>

            {/* Active Student Switcher Dropdown */}
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
                    <p className="text-xs font-semibold text-white leading-tight">{currentStudent.name}</p>
                    <p className="text-[10px] text-brand-300 truncate max-w-[100px]">{currentStudent.major}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl bg-surface-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Switch Demo Student</p>
                      <p className="text-[11px] text-slate-500">Test matching from different perspectives</p>
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {students.map((student) => {
                        const isSelected = student.id === currentStudent.id;
                        return (
                          <button
                            key={student.id}
                            onClick={() => {
                              switchStudent(student.id);
                              setDropdownOpen(false);
                              if (onDataRefresh) onDataRefresh();
                            }}
                            className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition ${
                              isSelected
                                ? 'bg-brand-600/20 border border-brand-500/30'
                                : 'hover:bg-surface-800 border border-transparent'
                            }`}
                          >
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold ${isSelected ? 'text-brand-300' : 'text-white'}`}>
                                {student.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {student.major} • {student.year}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active student info summary */}
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 px-2 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Style: {currentStudent.studyStyle}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>Prefers: {currentStudent.preferredTimes?.join(', ')}</span>
                      </div>
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
  );
}
