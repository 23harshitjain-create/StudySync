import React from 'react';
import { Users, CheckCircle2, ArrowRight, Share2, BookOpen } from 'lucide-react';

export default function GroupCard({ group, onJoin, onViewRoom }) {
  const { name, courseCode, taskTitle, members, milestones, maxCapacity, inviteCode } = group;
  const completedMilestones = milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = milestones?.length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

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
            <span>{members?.length || 1} / {maxCapacity || 4} Spots</span>
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
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.origin + `/join/${inviteCode}`);
            alert(`Copied share link for group "${name}"!\nCode: ${inviteCode}`);
          }}
          className="p-2 rounded-xl bg-surface-900 hover:bg-surface-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition text-xs flex items-center space-x-1"
          title="Copy invite link"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onJoin && onJoin(group)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <span>Enter Group Room</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
