import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Tag
} from 'lucide-react';

export default function AssignmentCard({ assignment, onFindPartners, isSelected }) {
  const { courseCode, courseName, title, taskType, topics, deadline, estimatedHours, difficulty, status } = assignment;

  // Calculate days/hours remaining
  const getDeadlineInfo = (dl) => {
    if (!dl) return { text: 'No deadline', isUrgent: false };
    const diffMs = new Date(dl).getTime() - Date.now();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) return { text: 'Past Due', isUrgent: true };
    if (diffHours <= 24) return { text: `${diffHours}h left (Urgent!)`, isUrgent: true };
    const diffDays = Math.round(diffHours / 24);
    return { text: `${diffDays} days left`, isUrgent: diffDays <= 3 };
  };

  const deadlineInfo = getDeadlineInfo(deadline);

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'challenging':
      case 'hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className={`glass-card rounded-2xl p-5 border transition-all ${
      isSelected 
        ? 'border-brand-500 bg-brand-950/20 shadow-glow' 
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 font-display">
            {courseCode}
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 border border-slate-700">
            {taskType || 'Assignment'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyColor(difficulty)}`}>
            {difficulty || 'Medium'}
          </span>
          
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
            deadlineInfo.isUrgent ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-surface-800 text-slate-400'
          }`}>
            <Clock className="w-3 h-3" />
            <span>{deadlineInfo.text}</span>
          </span>
        </div>
      </div>

      {/* Assignment Title & Course */}
      <h3 className="text-base font-bold text-white font-display line-clamp-1 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-400 line-clamp-1 mb-3">
        {courseName}
      </p>

      {/* Topics */}
      {topics && topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {topics.slice(0, 4).map((topic, idx) => (
            <span 
              key={idx} 
              className="text-[10px] bg-surface-900/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 flex items-center space-x-1"
            >
              <Tag className="w-2.5 h-2.5 text-brand-400" />
              <span>{topic}</span>
            </span>
          ))}
        </div>
      )}

      {/* Action CTA */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span>Due: {deadline ? new Date(deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Flexible'}</span>
        </div>

        <button
          onClick={() => onFindPartners && onFindPartners(assignment)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/40 text-xs font-semibold transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Find Partners</span>
        </button>
      </div>

    </div>
  );
}
