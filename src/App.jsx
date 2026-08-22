import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import FindPartners from './pages/FindPartners';
import GroupsPage from './pages/GroupsPage';
import GroupView from './pages/GroupView';
import AssignmentUploader from './components/AssignmentUploader';
import CreateGroupModal from './components/CreateGroupModal';
import { fetchAssignments, fetchGroups, fetchMatches } from './utils/api';

function MainApp() {
  const { currentStudent, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'find-partners', 'groups', 'group-view'
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [createGroupInitialData, setCreateGroupInitialData] = useState(null);
  const [selectedAssignmentForMatch, setSelectedAssignmentForMatch] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load assignments, groups, and matches whenever currentStudent or selected assignment changes
  const loadData = async () => {
    if (!currentStudent) return;
    try {
      setDataLoading(true);
      const [assignData, groupData] = await Promise.all([
        fetchAssignments(),
        fetchGroups()
      ]);
      setAssignments(assignData);
      setGroups(groupData);

      // Fetch AI matches for current student
      const matchData = await fetchMatches(
        currentStudent.id, 
        selectedAssignmentForMatch?.id || null
      );
      setMatches(matchData);
    } catch (err) {
      console.error('Error loading app data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentStudent, selectedAssignmentForMatch]);

  const handleFindPartnersForAssignment = (assignment) => {
    setSelectedAssignmentForMatch(assignment);
    setActiveTab('find-partners');
  };

  const handleOpenGroup = (group) => {
    setSelectedGroup(group);
    setActiveTab('group-view');
  };

  const handleOpenCreateGroup = (initData = null) => {
    setCreateGroupInitialData(initData);
    setIsCreateGroupOpen(true);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    setSelectedGroup(newGroup);
    setActiveTab('group-view');
  };

  const handleUpdateGroup = (updatedGroup) => {
    setSelectedGroup(updatedGroup);
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const handleTaskCreated = (newTask) => {
    setAssignments(prev => [newTask, ...prev]);
    setSelectedAssignmentForMatch(newTask);
    setActiveTab('find-partners');
    loadData();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 text-slate-300">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium font-display">Loading StudySync Environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab === 'group-view' ? 'groups' : activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
        onDataRefresh={loadData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            assignments={assignments}
            matches={matches}
            groups={groups}
            onFindPartnersForAssignment={handleFindPartnersForAssignment}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenGroup={handleOpenGroup}
          />
        )}

        {activeTab === 'find-partners' && (
          <FindPartners
            assignments={assignments}
            matches={matches}
            groups={groups}
            selectedAssignment={selectedAssignmentForMatch}
            onSelectAssignment={(task) => setSelectedAssignmentForMatch(task)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenGroup={handleOpenGroup}
            onOpenCreateGroup={handleOpenCreateGroup}
          />
        )}

        {activeTab === 'groups' && (
          <GroupsPage
            groups={groups}
            onJoinGroup={handleOpenGroup}
            onCreateGroup={handleOpenCreateGroup}
          />
        )}

        {activeTab === 'group-view' && (
          <GroupView
            group={selectedGroup}
            onBack={() => setActiveTab('groups')}
            onUpdateGroup={handleUpdateGroup}
          />
        )}

      </main>

      {/* Assignment Uploader & PDF AI Extractor Modal */}
      <AssignmentUploader
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Create Study Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        initialData={createGroupInitialData}
        onGroupCreated={handleGroupCreated}
      />

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-display font-medium text-slate-400">
            StudySync • AI-Powered Academic Collaboration Platform
          </p>
          <p className="text-slate-500">
            PromptWars Hackathon "Student Life" Challenge
          </p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
