import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  BookOpen, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  CheckCircle,
  ArrowRight,
  Zap,
  UserPlus,
  Check,
  Loader2,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { joinGroup as joinGroupApi, leaveGroup as leaveGroupApi } from '../utils/api';

export default function MatchCard({ match, onConnect, onJoinGroup, onOpenGroup }) {
  const { currentStudent } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [joinedLocally, setJoinedLocally] = useState(null);

  useEffect(() => {
    setJoinedLocally(null);
  }, [currentStudent?.id, match?.matchId, match?.targetGroup?.id]);

  const { type, targetStudent, targetTask, targetGroup, overallScore, breakdown, highlightReasons } = match;

  // Determine badge color based on compatibility score
  const getScoreColor = (score) => {
    if (score >= 85) return 'from-emerald-500 to-teal-400 text-emerald-300 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'from-brand-500 to-indigo-400 text-brand-300 border-brand-500/30 bg-brand-500/10';
    if (score >= 50) return 'from-amber-500 to-orange-400 text-amber-300 border-amber-500/30 bg-amber-500/10';
    return 'from-slate-500 to-slate-400 text-slate-300 border-slate-700 bg-slate-800/40';
  };

  const isGroup = type === 'group';

  // Check if current student is already a member of this group
  const isAlreadyMember = isGroup && (
    joinedLocally === true || 
    (joinedLocally !== false && targetGroup?.members?.some(m => m.studentId === currentStudent?.id))
  );

  const handleJoinClick = async (e) => {
    e.stopPropagation();
    if (!targetGroup?.id || !currentStudent?.id || joining || isAlreadyMember) return;

    setJoining(true);
    try {
      const res = await joinGroupApi(targetGroup.id, currentStudent.id);
      setJoinedLocally(true);
      if (res?.group) {
        if (onJoinGroup) onJoinGroup(res.group);
      }
    } catch (err) {
      console.error('Failed to join group:', err);
      alert('Failed to join group. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveClick = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    if (!targetGroup?.id || !currentStudent?.id || leaving) return;

    setLeaving(true);
    try {
      const res = await leaveGroupApi(targetGroup.id, currentStudent.id);
      setJoinedLocally(false);
      if (res?.group && onJoinGroup) {
        onJoinGroup(res.group);
      }
    } catch (err) {
      console.error('Failed to leave group:', err);
      alert('Failed to leave group. Please try again.');
    } finally {
      setLeaving(false);
    }
  };

  const handleOpenClick = () => {
    if (isGroup && targetGroup) {
      if (onOpenGroup) onOpenGroup(targetGroup);
      else if (onConnect) onConnect(match);
    } else {
      if (onConnect) onConnect(match);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 transition-all hover:border-brand-500/40">
      
      {/* Header: Student/Group Info + Match Score */}
      <div className="flex items-start justify-between gap-4">
        
        <div className="flex items-start space-x-3.5">
          {isGroup ? (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-surface-900 rounded-[10px] flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-300" />
              </div>
            </div>
          ) : (
            <img
              src={targetStudent?.avatar}
              alt={targetStudent?.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-brand-500/30 flex-shrink-0 shadow-md"
            />
          )}

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white font-display">
                {isGroup ? targetGroup?.name : targetStudent?.name}
              </h3>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                isGroup 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                  : 'bg-brand-500/20 text-brand-300 border-brand-500/30'
              }`}>
                {isGroup ? 'Study Group' : 'Peer Match'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              {isGroup 
                ? `${targetGroup?.courseCode} • ${(targetGroup?.members?.length || 0) + (joinedLocally && !targetGroup?.members?.some(m => m.studentId === currentStudent?.id) ? 1 : 0)}/${targetGroup?.maxCapacity || 4} Members`
                : `${targetStudent?.major} • ${targetStudent?.year}`}
            </p>
          </div>
        </div>

        {/* Circular Overall Score Pill */}
        <div className="flex flex-col items-end flex-shrink-0">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${getScoreColor(overallScore)}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-display font-extrabold text-sm tracking-tight">{overallScore}%</span>
            <span className="text-[10px] font-medium opacity-80">Match</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            {overallScore >= 85 ? '🌟 High Compatibility' : overallScore >= 70 ? '✨ Good Match' : '👍 Moderate'}
          </span>
        </div>

      </div>

      {/* Task / Context Preview */}
      <div className="mt-4 p-3 rounded-xl bg-surface-900/80 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold text-brand-300 flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5 inline mr-1" />
            {isGroup ? targetGroup?.courseCode : targetTask?.courseCode}: {isGroup ? targetGroup?.taskTitle : targetTask?.title}
          </span>
          {targetTask?.deadline && (
            <span className="flex items-center space-x-1 text-slate-400">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Due {new Date(targetTask.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </span>
          )}
        </div>

        {!isGroup && targetTask?.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {targetTask.topics.slice(0, 4).map((topic, i) => (
              <span key={i} className="text-[10px] bg-surface-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Highlight Reasons ("Why you matched") */}
      {highlightReasons && highlightReasons.length > 0 && (
        <div className="mt-3.5 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Why you matched</span>
          </p>
          <div className="space-y-1">
            {highlightReasons.map((reason, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="line-clamp-1">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Factor Breakdown */}
      {breakdown && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <span>Compatibility Breakdown (5 Factors)</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2.5 text-xs animate-in fade-in slide-in-from-top-1">
              {/* Factor 1: Course & Task (30%) */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Course & Task Similarity (30% weight)</span>
                  <span className="font-semibold text-brand-300">{breakdown.courseSimilarity}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${breakdown.courseSimilarity}%` }} />
                </div>
              </div>

              {/* Factor 2: Topic Overlap (25%) */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Topic & Concept Overlap (25% weight)</span>
                  <span className="font-semibold text-indigo-300">{breakdown.topicOverlap}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${breakdown.topicOverlap}%` }} />
                </div>
              </div>

              {/* Factor 3: Deadline Proximity (20%) */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Deadline Urgency Alignment (20% weight)</span>
                  <span className="font-semibold text-amber-300">{breakdown.deadlineProximity}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${breakdown.deadlineProximity}%` }} />
                </div>
              </div>

              {/* Factor 4: Availability Overlap (15%) */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Study Schedule Overlap (15% weight)</span>
                  <span className="font-semibold text-teal-300">{breakdown.availabilityOverlap}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${breakdown.availabilityOverlap}%` }} />
                </div>
              </div>

              {/* Factor 5: Study Preferences (10%) */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Work Style & Goal Alignment (10% weight)</span>
                  <span className="font-semibold text-purple-300">{breakdown.studyPreferences}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${breakdown.studyPreferences}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {!isGroup && targetStudent && (
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
            <span className="truncate">Prefers: {targetStudent.preferredTimes?.slice(0, 2).join(', ')}</span>
          </div>
        )}
        
        {isGroup && (
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>{targetGroup?.milestones?.filter(m => m.completed).length || 0}/{targetGroup?.milestones?.length || 0} Milestones</span>
          </div>
        )}

        <div className="ml-auto flex items-center space-x-2 flex-shrink-0">
          {isGroup ? (
            <>
              {/* View Group Button */}
              <button
                type="button"
                onClick={handleOpenClick}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-900 hover:bg-surface-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition"
              >
                <span>View Group</span>
              </button>

              {/* Join Group Button / Joined + Leave Action */}
              {isAlreadyMember ? (
                <>
                  <button
                    type="button"
                    onClick={handleOpenClick}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition hover:bg-emerald-500/30"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Joined</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLeaveClick}
                    disabled={leaving}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition disabled:opacity-50"
                    title="Leave group"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>{leaving ? 'Leaving...' : 'Leave'}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleJoinClick}
                  disabled={joining}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {joining ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Join Group</span>
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleOpenClick}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02]"
            >
              <span>Study Together</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
