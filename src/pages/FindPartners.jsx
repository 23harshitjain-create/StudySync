import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Filter, 
  Layers, 
  BookOpen, 
  Users, 
  UserCheck, 
  Flame, 
  CheckCircle2, 
  SlidersHorizontal,
  Info
} from 'lucide-react';
import MatchCard from '../components/MatchCard';

export default function FindPartners({ 
  assignments, 
  matches, 
  groups,
  selectedAssignment, 
  onSelectAssignment, 
  onNavigateTab,
  onOpenGroup,
  onOpenCreateGroup,
  onUpdateGroup
}) {
  const { currentStudent } = useAuth();
  const [filterType, setFilterType] = useState('all'); // 'all', 'high-match', 'peers', 'groups'
  const [courseFilter, setCourseFilter] = useState('all');

  const studentAssignments = assignments.filter(a => a.studentId === currentStudent?.id);

  // Filter matches based on user selection
  const filteredMatches = matches.filter(match => {
    // Type filter
    if (filterType === 'high-match' && match.overallScore < 75) return false;
    if (filterType === 'peers' && match.type !== 'peer') return false;
    if (filterType === 'groups' && match.type !== 'group') return false;

    // Course filter
    if (courseFilter !== 'all') {
      const matchCourse = match.type === 'peer' 
        ? match.targetTask?.courseCode 
        : match.targetGroup?.courseCode;
      if (matchCourse !== courseFilter) return false;
    }

    return true;
  });

  // Extract unique courses from assignments
  const availableCourses = Array.from(new Set(assignments.map(a => a.courseCode)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
              AI Academic Match Discovery Deck
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Calculated using our 5-factor weighted algorithm: Course Similarity (30%), Topic Overlap (25%), Deadline Proximity (20%), Schedule Availability (15%), and Study Preferences (10%).
          </p>
        </div>

        {/* Current Task Selector Pill */}
        {studentAssignments.length > 0 && (
          <div className="flex flex-col sm:items-end">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Matching For Task:
            </label>
            <select
              value={selectedAssignment?.id || ''}
              onChange={(e) => {
                const found = studentAssignments.find(a => a.id === e.target.value);
                if (found && onSelectAssignment) onSelectAssignment(found);
              }}
              className="px-3 py-2 rounded-xl bg-surface-900 border border-brand-500/40 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All My Active Assignments</option>
              {studentAssignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.courseCode}: {a.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Algorithm Weights & Transparency Box */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 bg-surface-950/60">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
          <span>Multi-Factor Compatibility Weights:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
          <div className="bg-surface-900/90 p-2 rounded-xl border border-slate-800/80">
            <p className="text-slate-400">Course & Task</p>
            <p className="font-bold text-brand-300">30% Weight</p>
          </div>
          <div className="bg-surface-900/90 p-2 rounded-xl border border-slate-800/80">
            <p className="text-slate-400">Topic Overlap</p>
            <p className="font-bold text-indigo-300">25% Weight</p>
          </div>
          <div className="bg-surface-900/90 p-2 rounded-xl border border-slate-800/80">
            <p className="text-slate-400">Deadline Urgency</p>
            <p className="font-bold text-amber-300">20% Weight</p>
          </div>
          <div className="bg-surface-900/90 p-2 rounded-xl border border-slate-800/80">
            <p className="text-slate-400">Availability</p>
            <p className="font-bold text-teal-300">15% Weight</p>
          </div>
          <div className="bg-surface-900/90 p-2 rounded-xl border border-slate-800/80">
            <p className="text-slate-400">Study Style</p>
            <p className="font-bold text-purple-300">10% Weight</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Course Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-900/60 p-2 rounded-2xl border border-slate-800">
        
        {/* Type Filter Buttons */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All Matches', count: matches.length },
            { id: 'high-match', label: 'High Compatibility (>75%)', count: matches.filter(m => m.overallScore >= 75).length },
            { id: 'peers', label: 'Peers', count: matches.filter(m => m.type === 'peer').length },
            { id: 'groups', label: 'Study Groups', count: matches.filter(m => m.type === 'group').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center space-x-2 px-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-900 border border-slate-800 text-slate-300 text-xs font-medium focus:outline-none"
          >
            <option value="all">All Courses</option>
            {availableCourses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">No matches fit the selected filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try switching filters or selecting a different assignment above.</p>
          <button
            onClick={() => { setFilterType('all'); setCourseFilter('all'); }}
            className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match, idx) => (
            <MatchCard
              key={match.matchId || idx}
              match={match}
              onJoinGroup={(updatedGroup) => {
                if (onUpdateGroup) onUpdateGroup(updatedGroup);
              }}
              onOpenGroup={(targetGroup) => {
                if (onOpenGroup) onOpenGroup(targetGroup);
              }}
              onConnect={() => {
                if (match.type === 'group' && match.targetGroup) {
                  if (onOpenGroup) onOpenGroup(match.targetGroup);
                } else {
                  const targetCode = (match.targetTask?.courseCode || '').trim().toUpperCase();
                  const existingGroup = (groups || []).find(g => (g.courseCode || '').trim().toUpperCase() === targetCode);

                  if (existingGroup && onOpenGroup) {
                    onOpenGroup(existingGroup);
                  } else if (onOpenCreateGroup) {
                    onOpenCreateGroup({
                      courseCode: match.targetTask?.courseCode,
                      taskTitle: match.targetTask?.title,
                      partnerName: match.targetStudent?.name
                    });
                  }
                }
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
}
