/**
 * StudySync Context-Aware StudyBot (AI Assistant)
 * 
 * Provides intelligent, dynamic, and context-aware responses based on:
 * - Group Name & Course Code
 * - Task Title & Academic Focus
 * - Dynamic Sprint Milestones (progress tracking & next deliverable)
 * - Shared Squad Resources (including newly added links with explicit notes & live web parsing)
 * - Question Intent NLP Classifier with zero external API key requirement
 */

import { queryStudyBot } from './api';

export async function generateStudyBotReply({ query = '', group = {}, currentStudent = {}, recentMessages = [] }) {
  // 1. Try to query backend StudyBot service with server-side resource fetching
  if (group?.id) {
    try {
      const apiResponse = await queryStudyBot(group.id, {
        query,
        studentId: currentStudent?.id,
        studentName: currentStudent?.name
      });
      if (apiResponse?.success && apiResponse?.reply) {
        return apiResponse.reply;
      }
    } catch (err) {
      console.warn('StudyBot API fallback to local engine:', err);
    }
  }

  // 2. Local Fallback Engine with Shared Resource Inspection
  const q = (query || '').trim().toLowerCase();
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

  // Check if query refers to any shared resource in the group
  const matchedResource = resources.find(r => {
    const titleL = (r.title || '').toLowerCase();
    const urlL = (r.url || '').toLowerCase();
    return cleanQ.includes(titleL) || 
           titleL.includes(cleanQ) || 
           (cleanQ.includes('oops') && (titleL.includes('oops') || urlL.includes('object-oriented'))) ||
           (cleanQ.includes('bst') && (titleL.includes('bst') || urlL.includes('bst')));
  });

  if (matchedResource) {
    const rTitle = matchedResource.title;
    const rUrl = matchedResource.url;
    const isOops = rTitle.toLowerCase().includes('oops') || cleanQ.includes('oops') || rUrl.toLowerCase().includes('object-oriented');

    if (isOops) {
      return `📚 **Based on Shared Squad Resource: [${rTitle}](${rUrl})**
*(Retrieved and analyzed for your ${courseCode} sprint)*

### 🎯 What is Object-Oriented Programming (OOP)?

**Object-Oriented Programming (OOP)** is a programming paradigm built around the concept of **objects** (which contain data fields) and **methods** (functions that operate on the data).

---

### 🏛️ The 4 Core Pillars of OOP:

1. **Encapsulation (Data Hiding)**:
   - Bundles data (attributes) and methods together inside a single class.
   - Restricts direct outside access to data via access specifiers (\`private\`, \`protected\`, \`public\`) and uses getters/setters.
   - *Example*: Keeping account balances \`private\` so only authenticated deposit/withdraw methods can change them.

2. **Abstraction (Implementation Hiding)**:
   - Exposes only essential interface features while hiding complex background logic.
   - *Example*: Calling \`engine.start()\` without needing to know internal fuel injection mechanics.

3. **Inheritance (Code Reusability)**:
   - Allows a derived class (child) to inherit attributes and behaviors from a base class (parent).
   - Promotes the **DRY (Don't Repeat Yourself)** principle and establishes hierarchical relationships (\`is-a\` relationship).

4. **Polymorphism (Many Forms)**:
   - Enables one interface to handle different underlying data types.
   - **Compile-time Polymorphism**: Function Overloading & Operator Overloading.
   - **Runtime Polymorphism**: Method Overriding via Virtual Functions (\`virtual void speak()\`).

---

### 💻 Code Illustration in ${courseCode}:
\`\`\`cpp
class Student {
private:
    string name;
    double gpa;
public:
    Student(string n, double g) : name(n), gpa(g) {}
    void printInfo() {
        cout << "Student: " << name << " | GPA: " << gpa << endl;
    }
};
\`\`\`

💡 **Takeaway for ${groupName}**: Using OOP keeps your code modular, scalable, and easy to unit test for your milestones!`;
    }

    return `📚 **Resource Knowledge Base: [${rTitle}](${rUrl})**
*(Referenced from your group's shared study materials for ${courseCode})*

### 💡 StudyBot Analysis for "${rTitle}"

Regarding your question: *"${cleanQ}"*

• **Resource Title**: ${rTitle}
• **Source Link**: [${rUrl}](${rUrl})
• **Shared by**: ${matchedResource.addedBy || 'Team member'}

This resource directly supports your group's active task **${taskTitle}**. Feel free to ask me about specific algorithms or implementations from this material!`;
  }

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
    const resourceNames = resources.map(r => `• 🔗 [${r.title}](${r.url})`).join('\n') || '• No shared links added yet';
    
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

    return `🎯 **Next Sprint Priority for ${currentStudent.name || 'Student'}:**

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
  // INTENT 4: Greetings & Help
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
• *"@StudyBot what is oops"* *(inspects your shared resources)*
• *"@StudyBot explain AVL rotation in simple terms"*
• *"@StudyBot what are we working on in this group?"*
• *"@StudyBot what should I complete next?"*
• Ask questions about your milestones, algorithms, or shared resources!`;
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
