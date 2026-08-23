import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Clock, 
  Calendar, 
  Plus, 
  ArrowRight,
  Target,
  Flame,
  Award,
  Zap
} from 'lucide-react';
import AssignmentCard from '../components/AssignmentCard';
import MatchCard from '../components/MatchCard';
import GroupCard from '../components/GroupCard';

export default function Dashboard({ 
  assignments, 
  matches, 
  groups, 
  onFindPartnersForAssignment, 
  onOpenAddTask, 
  onNavigateTab,
  onOpenGroup,
  onUpdateGroup
}) {
  const { currentStudent } = useAuth();

  // Filter assignments for current student
  const studentAssignments = assignments.filter(a => a.studentId === currentStudent?.id);
  
  // High compatibility top matches (>70%)
  const topMatches = matches.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Profile Banner */}
      {currentStudent && (
        <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-surface-900 via-surface-900/90 to-brand-950/30">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start sm:items-center space-x-4">
              <div className="relative">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-brand-500/40 shadow-glow"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-surface-950 text-white" title="Online & Studying">
                  <Flame className="w-3 h-3" />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                    Welcome back, {currentStudent.name}
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold">
                    {currentStudent.year}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {currentStudent.university} • <span className="text-slate-300 font-medium">{currentStudent.major}</span>
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-800/80 text-slate-300 border border-slate-700/60 flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-brand-400" />
                    <span>Goal: {currentStudent.targetGrade}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-surface-800/80 text-slate-300 border border-slate-700/60 flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    <span>Style: {currentStudent.studyStyle}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-surface-800/80 text-slate-300 border border-slate-700/60 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Slots: {Array.isArray(currentStudent.preferredTimes) ? currentStudent.preferredTimes.join(', ') : (currentStudent.preferredTimes || 'Flexible')}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Banner */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigateTab('find-partners')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Find Match Deck</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">My Active Tasks</p>
            <p className="text-xl font-bold text-white font-display">{studentAssignments.length}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Matched Peers</p>
            <p className="text-xl font-bold text-white font-display">{matches.length}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Groups</p>
            <p className="text-xl font-bold text-white font-display">{groups.length}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Next Due Date</p>
            <p className="text-sm font-bold text-white font-display">In 3 Days</p>
          </div>
        </div>

      </div>

      {/* Section 1: My Academic Tasks & Deadlines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-display flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <span>My Assignments & Tasks</span>
            </h2>
            <p className="text-xs text-slate-400">Click "Find Partners" on any task to run the AI matching engine</p>
          </div>

          <button
            onClick={onOpenAddTask}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {studentAssignments.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center border border-dashed border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No active assignments for this student.</p>
            <button
              onClick={onOpenAddTask}
              className="mt-3 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold"
            >
              Add Your First Assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onFindPartners={() => onFindPartnersForAssignment(assignment)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Top AI Matched Partners Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-display flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <span>Top AI Matched Study Partners & Groups</span>
            </h2>
            <p className="text-xs text-slate-400">Deterministic scoring across 5 academic compatibility dimensions</p>
          </div>

          <button
            onClick={() => onNavigateTab('find-partners')}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1"
          >
            <span>View All Matches ({matches.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {topMatches.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800">
            <p className="text-sm text-slate-400">No matching peers found yet. Try adding more assignments!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {topMatches.map((match, idx) => (
              <MatchCard
                key={match.matchId || idx}
                match={match}
                onJoinGroup={(updatedGroup) => {
                  if (onUpdateGroup) onUpdateGroup(updatedGroup);
                }}
                onOpenGroup={(targetGroup) => {
                  if (onOpenGroup) onOpenGroup(targetGroup);
                }}
                onConnect={() => onNavigateTab('find-partners')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Active Study Groups */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-display flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Featured Study Groups</span>
            </h2>
            <p className="text-xs text-slate-400">Join active peer study rooms or create a new group</p>
          </div>

          <button
            onClick={() => onNavigateTab('groups')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>Browse All Groups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={(selectedGroup) => {
                if (onOpenGroup) onOpenGroup(selectedGroup);
              }}
              onUpdateGroup={(updatedGroup) => {
                if (onUpdateGroup) onUpdateGroup(updatedGroup);
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
