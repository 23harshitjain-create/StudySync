import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  ArrowLeft, 
  Share2, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Send, 
  BookOpen, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Layers, 
  Paperclip,
  Flame,
  Award,
  LogOut,
  UserMinus,
  UserPlus
} from 'lucide-react';
import { generateStudyBotReply } from '../utils/studyBot';
import { BASE_URL, leaveGroup as leaveGroupApi, removeGroupMember as removeGroupMemberApi, joinGroup as joinGroupApi } from '../utils/api';

export default function GroupView({ group, onBack, onUpdateGroup }) {
  const { currentStudent } = useAuth();
  const [activeGroup, setActiveGroup] = useState(group);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [showAddResource, setShowAddResource] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync activeGroup when group prop updates
  useEffect(() => {
    if (group) {
      setActiveGroup(prev => {
        if (!prev || prev.id !== group.id) return group;
        return { ...prev, ...group };
      });
    }
  }, [group]);

  // Load group data & chat messages once per group ID
  useEffect(() => {
    if (!group?.id) return;
    
    async function loadGroupData() {
      try {
        const res = await fetch(`${BASE_URL}/groups/${group.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.group) setActiveGroup(data.group);
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(prev => {
              if (prev.length === 0) return data.messages;
              const existingIds = new Set(prev.map(m => m.id));
              const existingSigs = new Set(prev.map(m => `${m.senderId}-${m.content}`));
              const newItems = data.messages.filter(m => 
                !existingIds.has(m.id) && !existingSigs.has(`${m.senderId}-${m.content}`)
              );
              return [...prev, ...newItems];
            });
          }
        }
      } catch (err) {
        console.error('Error fetching group data:', err);
      }
    }
    loadGroupData();
  }, [group?.id]);

  if (!activeGroup) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white font-display">No Study Group Selected</h2>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  // Calculated metrics
  const completedMilestones = activeGroup.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = activeGroup.milestones?.length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Toggle milestone completion with optimistic update & backend persistence
  const handleToggleMilestone = async (milestoneId) => {
    if (!activeGroup?.milestones || !activeGroup?.id) return;

    // 1. Optimistically update local state & parent group (milestones only, preserves chat messages untouched)
    const updatedMilestones = activeGroup.milestones.map(m => {
      if (m.id === milestoneId) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });

    const updatedGroup = { ...activeGroup, milestones: updatedMilestones };
    setActiveGroup(updatedGroup);
    if (onUpdateGroup) onUpdateGroup(updatedGroup);

    // 2. Persist to API backend without touching chat messages state
    try {
      const res = await fetch(`${BASE_URL}/groups/${activeGroup.id}/milestones/${milestoneId}/toggle`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.group) {
          setActiveGroup(data.group);
          if (onUpdateGroup) onUpdateGroup(data.group);
        }
      }
    } catch (err) {
      console.error('Failed to toggle milestone on server:', err);
    }
  };

  // Add new milestone with backend persistence
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !activeGroup?.id) return;

    const milestonePayload = {
      title: newMilestoneTitle.trim(),
      assignedTo: currentStudent ? currentStudent.name : 'Unassigned'
    };

    setNewMilestoneTitle('');

    try {
      const res = await fetch(`${BASE_URL}/groups/${activeGroup.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestonePayload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.group) {
          setActiveGroup(data.group);
          if (onUpdateGroup) onUpdateGroup(data.group);
        }
      }
    } catch (err) {
      console.error('Failed to add milestone on server:', err);
    }
  };

  // Add new resource with backend persistence & immediate optimistic state update
  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!newResourceTitle.trim() || !newResourceUrl.trim() || !activeGroup?.id) return;

    const resourcePayload = {
      id: `res-${Date.now()}`,
      title: newResourceTitle.trim(),
      url: newResourceUrl.trim().startsWith('http') ? newResourceUrl.trim() : `https://${newResourceUrl.trim()}`,
      addedBy: currentStudent ? currentStudent.name : 'Member',
      type: 'link'
    };

    setNewResourceTitle('');
    setNewResourceUrl('');
    setShowAddResource(false);

    // Optimistic UI update so StudyBot and Resource list immediately have the new resource
    setActiveGroup(prev => ({
      ...prev,
      resources: [...(prev.resources || []), resourcePayload]
    }));

    try {
      const res = await fetch(`${BASE_URL}/groups/${activeGroup.id}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourcePayload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.group) {
          setActiveGroup(data.group);
          if (onUpdateGroup) onUpdateGroup(data.group);
        }
      }
    } catch (err) {
      console.error('Failed to add resource on server:', err);
    }
  };

  // Send a message with immediate local update + dynamic context-aware StudyBot reply
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeGroup?.id) return;

    const content = newMessage.trim();
    setNewMessage('');

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      groupId: activeGroup.id,
      senderId: currentStudent?.id || 'student-1',
      senderName: currentStudent?.name || 'Alex Rivera',
      senderAvatar: currentStudent?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    // 1. Immediately append to chat state
    setMessages(prev => [...prev, newMsg]);

    // 2. Persist message to backend API
    try {
      await fetch(`${BASE_URL}/groups/${activeGroup.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch (err) {
      console.error('Failed to persist message to server:', err);
    }

    // 3. If message mentions @StudyBot or asks for help/greetings, respond with intelligent dynamic AI buddy
    if (
      content.toLowerCase().includes('@studybot') || 
      content.toLowerCase().includes('help') || 
      content.toLowerCase().includes('how') ||
      content.toLowerCase() === 'hi' ||
      content.toLowerCase() === 'hello'
    ) {
      setTimeout(async () => {
        const botContent = await generateStudyBotReply({
          query: content,
          group: activeGroup,
          currentStudent: currentStudent || { name: 'Alex Rivera' },
          recentMessages: messages
        });

        const botReply = {
          id: `msg-bot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          groupId: activeGroup.id,
          senderId: 'studybot',
          senderName: 'StudyBot (AI Assistant)',
          senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          content: botContent,
          timestamp: new Date().toISOString(),
          type: 'ai_insight'
        };

        setMessages(prev => [...prev, botReply]);

        try {
          await fetch(`${BASE_URL}/groups/${activeGroup.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(botReply)
          });
        } catch (err) {
          console.error('Failed to persist bot message:', err);
        }
      }, 300);
    }
  };

  const isMember = activeGroup?.members?.some(m => m.studentId === currentStudent?.id);
  const isOwner = activeGroup?.createdById === currentStudent?.id || activeGroup?.members?.find(m => m.studentId === currentStudent?.id)?.role === 'Admin';
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    if (!activeGroup?.id || !currentStudent?.id || leavingGroup) return;

    setLeavingGroup(true);
    try {
      const res = await leaveGroupApi(activeGroup.id, currentStudent.id);
      if (res?.group) {
        setActiveGroup(res.group);
        if (onUpdateGroup) onUpdateGroup(res.group);
      }
      if (onBack) onBack();
    } catch (err) {
      console.error('Failed to leave group:', err);
      alert('Failed to leave group. Please try again.');
    } finally {
      setLeavingGroup(false);
    }
  };

  const handleRemoveMember = async (targetStudentId, targetMemberName) => {
    if (!window.confirm("Remove this member from the group?")) return;
    if (!activeGroup?.id || !targetStudentId || !currentStudent?.id || removingMemberId) return;

    setRemovingMemberId(targetStudentId);
    try {
      const res = await removeGroupMemberApi(activeGroup.id, targetStudentId, currentStudent.id);
      if (res?.group) {
        setActiveGroup(res.group);
        if (onUpdateGroup) onUpdateGroup(res.group);
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Failed to remove member. Please try again.');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleJoinGroup = async () => {
    if (!activeGroup?.id || !currentStudent?.id) return;
    try {
      const res = await joinGroupApi(activeGroup.id, currentStudent.id);
      if (res?.group) {
        setActiveGroup(res.group);
        if (onUpdateGroup) onUpdateGroup(res.group);
      }
    } catch (err) {
      console.error('Failed to join group:', err);
      alert('Failed to join group. Please try again.');
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(window.location.origin + `/join/${activeGroup.inviteCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Navigation Bar */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-start sm:items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface-900 hover:bg-surface-800 text-slate-400 hover:text-white border border-slate-800 transition flex-shrink-0"
            title="Back to Groups"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
                {activeGroup.name}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-display">
                {activeGroup.courseCode}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-500 inline mr-1" />
              <span>{activeGroup.taskTitle}</span>
            </p>
          </div>
        </div>

        {/* Action Controls (Invite Code, Copy Link & Leave/Join Group) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500 font-sans">Code:</span>
            <span className="text-brand-400 font-bold">{activeGroup.inviteCode}</span>
          </div>

          <button
            onClick={handleCopyInvite}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/40 text-xs font-semibold transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Copied Link!' : 'Share Room'}</span>
          </button>

          {isMember ? (
            <button
              onClick={handleLeaveGroup}
              disabled={leavingGroup}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition disabled:opacity-50"
              title="Leave this study group"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>{leavingGroup ? 'Leaving...' : 'Leave Group'}</span>
            </button>
          ) : (
            <button
              onClick={handleJoinGroup}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Join Group</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Study Room Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Milestones, Resources & Members (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Milestone Progress Board */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white font-display flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Sprint Milestones</span>
                </h2>
                <p className="text-xs text-slate-400">Track collaborative assignment deliverables together</p>
              </div>

              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {progressPercent}% Complete ({completedMilestones}/{totalMilestones})
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-surface-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>

            {/* Milestone Checklist Items */}
            <div className="space-y-2 pt-1">
              {activeGroup.milestones?.map((milestone) => (
                <div
                  key={milestone.id}
                  onClick={() => handleToggleMilestone(milestone.id)}
                  className={`flex items-start space-x-3 p-3 rounded-xl border transition cursor-pointer ${
                    milestone.completed 
                      ? 'bg-surface-900/40 border-slate-800 text-slate-400' 
                      : 'bg-surface-900/80 border-slate-800/80 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <button type="button" className="mt-0.5 text-emerald-400 flex-shrink-0">
                    {milestone.completed ? (
                      <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${milestone.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {milestone.title}
                    </p>
                    {milestone.assignedTo && (
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Assigned: <span className="text-slate-400">{milestone.assignedTo}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Milestone Form */}
            <form onSubmit={handleAddMilestone} className="flex items-center space-x-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Add next assignment milestone..."
                className="flex-1 px-3 py-2 rounded-xl bg-surface-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

          </div>

          {/* Shared Resource Bucket */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white font-display flex items-center space-x-2">
                  <Paperclip className="w-4 h-4 text-brand-400" />
                  <span>Shared Resources & Notes</span>
                </h2>
                <p className="text-xs text-slate-400">Links, specs, docs, and visualizer tools</p>
              </div>

              <button
                onClick={() => setShowAddResource(!showAddResource)}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Resource</span>
              </button>
            </div>

            {/* Add Resource Form Modal/Panel */}
            {showAddResource && (
              <form onSubmit={handleAddResource} className="p-3.5 rounded-2xl bg-surface-900 border border-brand-500/30 space-y-2.5 animate-in fade-in">
                <input
                  type="text"
                  required
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  placeholder="Resource Title (e.g. Visualgo AVL Simulator)"
                  className="w-full px-3 py-1.5 rounded-xl bg-surface-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
                <input
                  type="text"
                  required
                  value={newResourceUrl}
                  onChange={(e) => setNewResourceUrl(e.target.value)}
                  placeholder="Resource URL (e.g. https://visualgo.net)"
                  className="w-full px-3 py-1.5 rounded-xl bg-surface-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddResource(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Save Resource
                  </button>
                </div>
              </form>
            )}

            {/* Resource List */}
            <div className="space-y-2">
              {activeGroup.resources?.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No resources shared yet. Share starter code or diagrams!</p>
              ) : (
                activeGroup.resources?.map((res) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-900/80 border border-slate-800 hover:border-brand-500/30 transition group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-brand-300 transition">
                          {res.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Shared by {res.addedBy} • {res.url}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 transition flex-shrink-0" />
                  </a>
                ))
              )}
            </div>

          </div>

          {/* Active Members Roster & Progress */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white font-display flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Group Members ({activeGroup.members?.length || 0}/{activeGroup.maxCapacity || 4})</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Individual Sprint Contributions
              </span>
            </div>

            <div className="space-y-2.5">
              {activeGroup.members?.map((member, idx) => {
                // Calculate dynamic progress for this member based on assigned tasks or recorded progress
                const assignedMilestones = activeGroup.milestones?.filter(m =>
                  m.assignedTo && (
                    m.assignedTo.toLowerCase() === member.name.toLowerCase() ||
                    m.assignedTo.toLowerCase() === (member.studentId || '').toLowerCase()
                  )
                ) || [];

                let memberProgressPercent = 0;
                let progressSubtitle = 'Sprint Member';

                if (assignedMilestones.length > 0) {
                  const completedCount = assignedMilestones.filter(m => m.completed).length;
                  memberProgressPercent = Math.round((completedCount / assignedMilestones.length) * 100);
                  progressSubtitle = `${completedCount}/${assignedMilestones.length} assigned deliverables done`;
                } else if (member.progress !== undefined && member.progress !== null) {
                  memberProgressPercent = member.progress;
                  progressSubtitle = `${memberProgressPercent}% sprint milestones complete`;
                } else {
                  memberProgressPercent = 0;
                  progressSubtitle = 'Newly joined';
                }

                return (
                  <div 
                    key={member.studentId || idx} 
                    className="p-3 rounded-2xl bg-surface-900/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={member.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-surface-950" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <p className="text-xs font-bold text-white truncate">{member.name}</p>
                            {member.role === 'Admin' ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Admin
                              </span>
                            ) : (
                              <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-surface-800 text-slate-400 border border-slate-700">
                                Member
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {progressSubtitle}
                          </p>
                        </div>
                      </div>

                      {/* Owner Remove Action & Percentage Badge */}
                      <div className="flex items-center space-x-2.5 flex-shrink-0 pl-2">
                        {isOwner && member.studentId !== currentStudent?.id && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.studentId, member.name)}
                            disabled={removingMemberId === member.studentId}
                            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] font-semibold transition disabled:opacity-50"
                            title={`Remove ${member.name} from group`}
                          >
                            <UserMinus className="w-3 h-3 text-rose-400" />
                            <span>{removingMemberId === member.studentId ? 'Removing...' : 'Remove'}</span>
                          </button>
                        )}

                        <div className="text-right">
                          <span className={`text-xs font-bold font-display ${
                            memberProgressPercent >= 70 ? 'text-emerald-400' : memberProgressPercent >= 30 ? 'text-brand-300' : 'text-slate-400'
                          }`}>
                            {memberProgressPercent}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Member Progress Bar */}
                    <div className="w-full h-1.5 bg-surface-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          memberProgressPercent >= 70 ? 'bg-emerald-500' : memberProgressPercent >= 30 ? 'bg-brand-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${Math.max(memberProgressPercent, 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Live Group Study Room Chat (5 cols) */}
        <div className="lg:col-span-5 flex flex-col glass-panel rounded-3xl border border-slate-800 overflow-hidden h-[620px]">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-surface-900/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white font-display">Study Room Live Chat</h3>
                <p className="text-[10px] text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{activeGroup.members?.length || 1} Members in session</span>
                </p>
              </div>
            </div>

            <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-md border border-brand-500/30 font-medium">
              @StudyBot Ready
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-medium">No messages yet in this study room.</p>
                <p className="text-[11px] text-slate-600 mt-1">Say hello or ask @StudyBot a question!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentStudent?.id;
                const isBot = msg.type === 'ai_insight' || msg.senderId === 'studybot';

                return (
                  <div 
                    key={msg.id}
                    className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    <img
                      src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-lg object-cover flex-shrink-0 mt-0.5 border border-slate-700"
                    />

                    <div className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                      isBot 
                        ? 'bg-brand-950/40 border border-brand-500/30 text-brand-200'
                        : isMe
                          ? 'bg-brand-600 text-white rounded-tr-none'
                          : 'bg-surface-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <span className={`text-[10px] font-bold ${isBot ? 'text-brand-400 font-display flex items-center space-x-1' : isMe ? 'text-brand-200' : 'text-slate-400'}`}>
                          {isBot && <Sparkles className="w-3 h-3 inline mr-1" />}
                          {msg.senderName}
                        </span>
                        <span className="text-[9px] opacity-60">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-surface-900/60 flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message your study group or ask @StudyBot..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-surface-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm shadow-brand-600/30"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
