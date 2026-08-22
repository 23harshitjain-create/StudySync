/**
 * StudySync Context-Aware StudyBot (AI Assistant)
 * 
 * Provides intelligent, dynamic, and context-aware responses based on:
 * - Group Name & Course Code
 * - Task Title & Academic Focus
 * - Dynamic Sprint Milestones (progress tracking & next deliverable)
 * - Shared Squad Resources (including newly added links with explicit notes)
 * - Question Intent NLP Classifier with zero external API key requirement
 */

export function generateStudyBotReply({ query = '', group = {}, currentStudent = {}, recentMessages = [] }) {
  const q = (query || '').trim().toLowerCase();
  
  // Clean query: strip "@studybot" mentions and punctuation
  const cleanQ = q.replace(/@studybot/gi, '').replace(/[?!.,;:]/g, ' ').trim();
  
  const courseCode = group.courseCode || 'CS 201';
  const groupName = group.name || 'Study Group';
  const taskTitle = group.taskTitle || 'Academic Assignment';
  const milestones = group.milestones || [];
  const resources = group.resources || [];
  const members = group.members || [];

  const completedMilestones = milestones.filter(m => m.completed);
  const pendingMilestones = milestones.filter(m => !m.completed);
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones.length / milestones.length) * 100) : 0;
  const nextMilestone = pendingMilestones[0];

  // =========================================================================
  // INTENT 1: AVL Trees / Rotations / Binary Search Trees
  // =========================================================================
  if (
    cleanQ.includes('avl') || 
    cleanQ.includes('rotation') || 
    cleanQ.includes('rotate') ||
    cleanQ.includes('bst') || 
    cleanQ.includes('balance factor') ||
    cleanQ.includes('binary search tree')
  ) {
    return `🌲 **AVL Tree Self-Balancing & Rotations Explained Simply:**

An AVL Tree is a Binary Search Tree (BST) that stays balanced so search, insert, and delete operations stay fast at **O(log n)** time.

### 1. The Balance Factor Rule
For every node:
$$\\text{Balance Factor} = \\text{Height}(\\text{Left Subtree}) - \\text{Height}(\\text{Right Subtree})$$
A node is balanced only when its Balance Factor is **-1, 0, or +1**. If it becomes $+2$ or $-2$, a rotation is required.

### 2. The 4 Rotation Types:
1. **Right Rotation (Left-Left / LL Case)**:
   - When a node's left child becomes too tall from an insertion into its left subtree.
   - *Fix*: The left child rises to become the new root; the old root becomes its right child.
2. **Left Rotation (Right-Right / RR Case)**:
   - When a node's right child becomes too tall from an insertion into its right subtree.
   - *Fix*: The right child rises to become the new root; the old root becomes its left child.
3. **Left-Right Rotation (LR Case)**:
   - Left child is heavy on its right side (zigzag). First Left-rotate the child, then Right-rotate the root.
4. **Right-Left Rotation (RL Case)**:
   - Right child is heavy on its left side (zigzag). First Right-rotate the child, then Left-rotate the root.

💡 **Pro-Tip for ${courseCode}**: After changing child pointers, always update node heights immediately:  
\`node->height = 1 + max(height(left), height(right))\`!`;
  }

  // =========================================================================
  // INTENT 2: Group Mission / Task Overview
  // =========================================================================
  if (
    cleanQ.includes('what are we working on') ||
    cleanQ.includes('what is this group') ||
    cleanQ.includes('group mission') ||
    cleanQ.includes('what are we doing') ||
    cleanQ.includes('assignment overview') ||
    cleanQ.includes('sprint goal') ||
    cleanQ.includes('summary of this group')
  ) {
    const resourceNames = resources.map(r => `• ${r.title}`).join('\n') || '• No shared links added yet';
    
    return `📋 **Group Mission & Task Overview for ${groupName}**

• **Course**: ${courseCode}
• **Target Task**: ${taskTitle}
• **Active Squad Size**: ${members.length} student${members.length === 1 ? '' : 's'} (${members.map(m => m.name).join(', ')})
• **Sprint Progress**: ${completedMilestones.length}/${milestones.length} Milestones Completed (${progressPercent}%)

**Current Sprint Deliverables:**
${milestones.map((m, idx) => `${idx + 1}. [${m.completed ? '✅ Completed' : '⏳ In Progress'}] ${m.title}`).join('\n')}

**Shared Resources Available:**
${resourceNames}

${nextMilestone ? `👉 **Immediate Next Goal**: Complete **"${nextMilestone.title}"**!` : '🎉 All sprint milestones are completed!'}`;
  }

  // =========================================================================
  // INTENT 3: Next Milestone / What Should I Complete Next
  // =========================================================================
  if (
    cleanQ.includes('what should i complete next') ||
    cleanQ.includes('what to do next') ||
    cleanQ.includes('what next') ||
    cleanQ.includes('next milestone') ||
    cleanQ.includes('next task') ||
    cleanQ.includes('current progress') ||
    cleanQ.includes('what is remaining')
  ) {
    if (!nextMilestone) {
      return `🎉 **All Milestones Completed!**

All **${milestones.length}/${milestones.length}** sprint milestones (100%) for **${groupName}** have been checked off! 

You and your squad are ready to do a final code review and submit your **${taskTitle}** work! 🚀`;
    }

    const remainingList = pendingMilestones
      .map((m, idx) => `  ${idx + 1}. **${m.title}** *(Assigned to: ${m.assignedTo || 'Unassigned'})*`)
      .join('\n');

    return `🎯 **Next Sprint Priority for ${currentStudent.name || 'Alex'}:**

Current Sprint Progress: **${completedMilestones.length}/${milestones.length} Milestones (${progressPercent}%)**

### 👉 Immediate Next Milestone:
**"${nextMilestone.title}"**  
• *Assigned to*: ${nextMilestone.assignedTo || 'Squad / Any member'}  
• *Status*: Pending completion

### Remaining Incomplete Milestones:
${remainingList}

*Tip: You can check off milestones on the left panel as you implement them to keep the group progress in sync!*`;
  }

  // =========================================================================
  // INTENT 4: Shared Resources Context & Assistance
  // =========================================================================
  if (
    cleanQ.includes('shared resource') ||
    cleanQ.includes('shared resources') ||
    cleanQ.includes('resources help') ||
    cleanQ.includes('how do the resources') ||
    cleanQ.includes('reference links') ||
    cleanQ.includes('study materials') ||
    cleanQ.includes('useful links')
  ) {
    if (resources.length === 0) {
      return `📚 **Shared Resources for ${groupName}**

No shared resources have been attached to this study room yet.

You can click **"+ Add Resource"** in the Shared Resources box on the left to add lecture slide links, cheatsheets, or GitHub repos to help your squad!`;
    }

    const resourceBreakdown = resources.map((res, i) => {
      let practicalHelp = '';
      const titleL = res.title.toLowerCase();
      if (titleL.includes('visual') || titleL.includes('animation') || titleL.includes('usfca')) {
        practicalHelp = 'Allows you to step through tree insertions/rotations visually before implementing code.';
      } else if (titleL.includes('test') || titleL.includes('suite') || titleL.includes('github')) {
        practicalHelp = 'Provides test input cases to verify correctness against edge cases.';
      } else if (titleL.includes('slide') || titleL.includes('lecture') || titleL.includes('cheatsheet')) {
        practicalHelp = 'Quick theoretical reference for algorithmic formulas and proof steps.';
      } else {
        practicalHelp = `Shared by ${res.addedBy || 'a team member'} for reference during the ${courseCode} sprint.`;
      }

      return `${i + 1}. 🔗 **${res.title}**
   • **Link**: [${res.url}](${res.url})
   • **Added by**: ${res.addedBy || 'Member'}
   • **How it helps**: ${practicalHelp}`;
    }).join('\n\n');

    return `📚 **How Our ${resources.length} Shared Resource${resources.length === 1 ? '' : 's'} Help with ${taskTitle}:**

${resourceBreakdown}

💡 *Note for squad*: As an in-app AI assistant, I don't crawl third-party live authentication pages directly, but I track every link, title, and annotation shared by your group members here!`;
  }

  // =========================================================================
  // INTENT 5: Virtual Memory / Systems / OS Concepts
  // =========================================================================
  if (
    cleanQ.includes('virtual memory') ||
    cleanQ.includes('paging') ||
    cleanQ.includes('page replacement') ||
    cleanQ.includes('lru') ||
    cleanQ.includes('tlb')
  ) {
    return `💾 **Virtual Memory & Page Replacement Core Concepts:**

1. **Virtual Address Translation**: Virtual addresses split into \`[Virtual Page Number (VPN) | Offset]\`. The Page Table maps VPN $\\rightarrow$ Physical Frame Number (PFN).
2. **Translation Lookaside Buffer (TLB)**: Hardware cache for fast address translation. On TLB Hit: 1 cycle; on TLB Miss: page table walk.
3. **Page Replacement (LRU)**: When physical memory is full, Least Recently Used (LRU) evicts the page whose last access timestamp is the oldest.
4. **Demand Paging**: Pages are loaded into RAM only when referenced, generating a page fault interrupt on first access.`;
  }

  // =========================================================================
  // INTENT 6: Linear Algebra / SVD / Matrix Concepts
  // =========================================================================
  if (
    cleanQ.includes('svd') ||
    cleanQ.includes('singular value') ||
    cleanQ.includes('eigenvalue') ||
    cleanQ.includes('diagonalization') ||
    cleanQ.includes('matrix')
  ) {
    return `📐 **Singular Value Decomposition (SVD) Quick Guide:**

Any $m \\times n$ real matrix $A$ can be factored into:
$$A = U \\Sigma V^T$$
• **$U$** ($m \\times m$): Left singular vectors (orthonormal eigenvectors of $A A^T$).
• **$\\Sigma$** ($m \\times n$): Diagonal matrix containing non-negative singular values $\\sigma_i = \\sqrt{\\lambda_i}$.
• **$V^T$** ($n \\times n$): Right singular vectors (transposed orthonormal eigenvectors of $A^T A$).

Used heavily for Principal Component Analysis (PCA), low-rank matrix approximation, and noise reduction.`;
  }

  // =========================================================================
  // INTENT 7: Dynamic Programming & Bioinformatics
  // =========================================================================
  if (
    cleanQ.includes('dynamic programming') ||
    cleanQ.includes('needleman') ||
    cleanQ.includes('smith waterman') ||
    cleanQ.includes('alignment')
  ) {
    return `🧬 **Sequence Alignment & Dynamic Programming:**

• **Needleman-Wunsch (Global Alignment)**: Optimizes alignment across the entire length of both sequences.
• **Smith-Waterman (Local Alignment)**: Finds the highest-scoring local matching regions; resets negative matrix values to 0.
• **Recurrence**:
  $$M(i,j) = \\max \\begin{cases} M(i-1, j-1) + \\text{Score}(S_1[i], S_2[j]) \\\\ M(i-1, j) - \\text{gap} \\\\ M(i, j-1) - \\text{gap} \\end{cases}$$`;
  }

  // =========================================================================
  // INTENT 8: Deadlocks & Concurrency
  // =========================================================================
  if (
    cleanQ.includes('deadlock') ||
    cleanQ.includes('mutex') ||
    cleanQ.includes('semaphore') ||
    cleanQ.includes('concurrency') ||
    cleanQ.includes('thread')
  ) {
    return `🔒 **Concurrency & 4 Coffman Conditions for Deadlocks:**

1. **Mutual Exclusion**: Non-shareable resource.
2. **Hold and Wait**: Process holds one resource while requesting another.
3. **No Preemption**: Resources cannot be forcibly seized.
4. **Circular Wait**: Cycle of processes each waiting for a resource held by the next.

💡 *Deadlock Prevention*: Enforce a strict global lock acquisition hierarchy or use Banker's algorithm!`;
  }

  // =========================================================================
  // INTENT 9: Greetings & Help
  // =========================================================================
  if (
    cleanQ === 'hi' || 
    cleanQ === 'hello' || 
    cleanQ === 'hey' || 
    cleanQ === 'help' ||
    cleanQ.includes('who are you')
  ) {
    return `👋 Hey **${currentStudent.name || 'there'}**! I'm your AI Study Assistant for **${groupName}** (${courseCode}).

Here are some things you can ask me:
• *"@StudyBot explain AVL rotation in simple terms"*
• *"@StudyBot what are we working on in this group?"*
• *"@StudyBot what should I complete next?"*
• *"@StudyBot how do the shared resources help with this assignment?"*
• Ask questions about your milestones, algorithms, or course concepts!`;
  }

  // =========================================================================
  // DEFAULT CONTEXTUAL FALLBACK
  // =========================================================================
  return `💡 **StudyBot Insight for ${courseCode} — ${taskTitle}:**

Regarding: *"${query.replace(/@studybot/gi, '').trim()}"*

• **Group Context**: We are collaborating in **${groupName}** on **${taskTitle}**.
• **Progress**: ${completedMilestones.length}/${milestones.length} milestones finished (${progressPercent}%).
${nextMilestone ? `• **Next Deliverable**: "${nextMilestone.title}".` : ''}
${resources.length > 0 ? `• **Available Squad Resources**: ${resources.map(r => r.title).join(', ')}.` : ''}

Feel free to ask me to explain specific concepts, review milestones, or summarize our shared squad materials!`;
}
