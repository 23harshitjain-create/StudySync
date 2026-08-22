import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  Share2, 
  Sparkles,
  Layers
} from 'lucide-react';
import GroupCard from '../components/GroupCard';

export default function GroupsPage({ groups, onJoinGroup, onCreateGroup }) {
  const { currentStudent } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(g => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || 
           g.courseCode.toLowerCase().includes(q) || 
           g.taskTitle.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
              Study Groups & Sprints
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Collaborate in small focused groups (3-4 peers) with milestone checklists, resources, and live room links.
          </p>
        </div>

        {/* Actions: Search Input & Create Group Button */}
        <div className="flex items-center space-x-3">
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course or topic..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {onCreateGroup && (
            <button
              onClick={() => onCreateGroup()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Group</span>
            </button>
          )}
        </div>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">No study groups found</h3>
          <p className="text-xs text-slate-400 mt-1">Try a different search keyword or create a new group.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={() => {
                alert(`Entered group "${group.name}"!\nInvite Code: ${group.inviteCode}`);
                if (onJoinGroup) onJoinGroup(group);
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
}
