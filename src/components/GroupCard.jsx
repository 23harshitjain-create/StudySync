import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Share2, 
  BookOpen, 
  UserPlus, 
  Check, 
  Loader2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { joinGroup as joinGroupApi, leaveGroup as leaveGroupApi } from '../utils/api';

export default function GroupCard({ group, onJoin, onUpdateGroup }) {
  const { currentStudent } = useAuth();
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [joinedLocally, setJoinedLocally] = useState(null);

  useEffect(() => {
    setJoinedLocally(null);
  }, [currentStudent?.id, group?.id]);

  const { id, name, courseCode, taskTitle, members, milestones, maxCapacity, inviteCode } = group;
  const completedMilestones = milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = milestones?.length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const isMember = joinedLocally === true || (joinedLocally !== false && members?.some(m => m.studentId === currentStudent?.id));

  const handleJoinClick = async (e) => {
    e.stopPropagation();
    if (!id || !currentStudent?.id || joining || isMember) return;

    setJoining(true);
    try {
      const res = await joinGroupApi(id, currentStudent.id);
      setJoinedLocally(true);
      if (res?.group && onUpdateGroup) {
        onUpdateGroup(res.group);
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
    if (!id || !currentStudent?.id || leaving) return;

    setLeaving(true);
    try {
      const res = await leaveGroupApi(id, currentStudent.id);
      setJoinedLocally(false);
      if (res?.group && onUpdateGroup) {
        onUpdateGroup(res.group);
      }
    } catch (err) {
      console.error('Failed to leave group:', err);
      alert('Failed to leave group. Please try again.');
    } finally {
      setLeaving(false);
    }
  };

  const handleCopyShare = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.origin + `/join/${inviteCode}`);
    alert(`Copied share link for group "${name}"!\nCode: ${inviteCode}`);
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
      
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-display">
            {courseCode}
          </span>

          <span className="text-xs text-slate-400 font-medium flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{(members?.length || 0) + (joinedLocally && !members?.some(m => m.studentId === currentStudent?.id) ? 1 : 0)} / {maxCapacity || 4} Spots</span>
          </span>
        </div>

        {/* Group Name & Task Title */}
        <h3 className="text-base font-bold text-white font-display line-clamp-1 mb-1">
          {name}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-1 mb-3.5 flex items-center space-x-1">
          <BookOpen className="w-3.5 h-3.5 text-slate-500 inline mr-1 flex-shrink-0" />
          <span>{taskTitle}</span>
        </p>

        {/* Members Avatars */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center -space-x-2 overflow-hidden">
            {members?.map((m, idx) => (
              <img
                key={idx}
                src={m.avatar}
                alt={m.name}
                title={`${m.name} (${m.role})`}
                className="w-8 h-8 rounded-full border-2 border-surface-900 object-cover"
              />
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-mono bg-surface-900 px-2 py-0.5 rounded border border-slate-800">
            {inviteCode}
          </span>
        </div>

        {/* Milestone Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Milestones: {completedMilestones}/{totalMilestones}</span>
            </span>
            <span className="font-semibold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={handleCopyShare}
          className="p-2 rounded-xl bg-surface-900 hover:bg-surface-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition text-xs flex items-center space-x-1"
          title="Copy invite link"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center space-x-2">
          {!isMember ? (
            <>
              <button
                type="button"
                onClick={() => onJoin && onJoin(group)}
                className="px-3 py-1.5 rounded-xl bg-surface-900 hover:bg-surface-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition"
              >
                View
              </button>

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
            </>
          ) : (
            <>
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

              <button
                type="button"
                onClick={() => onJoin && onJoin(group)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Enter Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
