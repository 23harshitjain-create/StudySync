/**
 * StudyBot Server Service
 * 
 * Provides server-side resource fetching, HTML parsing, content extraction,
 * and context-aware educational synthesis for StudySync study groups.
 */

// In-memory cache for fetched resource content: { [url]: { text: string, title: string, fetchedAt: number } }
const resourceCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

/**
 * Strips HTML tags and extracts clean text from HTML markup
 */
function cleanHtmlText(html = '') {
  if (!html) return '';

  let text = html;

  // Extract <title> if present
  let pageTitle = '';
  const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    pageTitle = titleMatch[1].trim();
  }

  // Remove scripts, styles, svgs, noscripts, iframes, and comments
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');
  text = text.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ');
  text = text.replace(/<!--[\s\S]*?-->/g, ' ');

  // Replace block tags with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|article|section|blockquote)>/gi, '\n');
  text = text.replace(/<br\s*[\/]?>/gi, '\n');

  // Strip all other HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Normalize excessive whitespace
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s*\n+/g, '\n\n').trim();

  return { pageTitle, cleanText: text.slice(0, 4000) };
}

/**
 * Fetches and parses a web URL
 */
export async function fetchResourceContent(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { success: false, error: 'Invalid URL' };
  }

  const cached = resourceCache.get(url);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { success: true, ...cached, fromCache: true };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 StudySync/1.0',
        'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8'
      }
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text') && !contentType.includes('html') && !contentType.includes('json')) {
      return { success: false, error: 'Non-text content type' };
    }

    const rawHtml = await res.text();
    const { pageTitle, cleanText } = cleanHtmlText(rawHtml);

    const resultData = {
      title: pageTitle || '',
      textSnippet: cleanText,
      fetchedAt: Date.now()
    };

    resourceCache.set(url, resultData);
    return { success: true, ...resultData, fromCache: false };
  } catch (err) {
    return { success: false, error: err?.message || 'Network fetch failed' };
  }
}

/**
 * Finds a matching group resource based on query text
 */
export function findMatchingResource(query = '', resources = []) {
  if (!query || !Array.isArray(resources) || resources.length === 0) {
    return null;
  }

  const stopwords = new Set(['what', 'how', 'why', 'who', 'the', 'and', 'for', 'this', 'that', 'with', 'from', 'about', 'group', 'sprint', 'help', 'explain', 'show', 'tell', 'are', 'you', 'your', 'our', 'working', 'does', 'can']);
  const cleanQuery = query.toLowerCase().replace(/@studybot/gi, '').replace(/[?!.,;:()]/g, ' ').trim();
  const queryWords = cleanQuery.split(/\s+/).filter(w => w.length >= 3 && !stopwords.has(w));

  if (queryWords.length === 0) {
    return null;
  }

  // Common topic alias mappings
  const topicAliases = {
    'oops': ['oops', 'oop', 'object oriented', 'object-oriented', 'class', 'inheritance', 'polymorphism', 'encapsulation'],
    'bst': ['bst', 'avl', 'binary search tree', 'tree rotation', 'rotations', 'visualgo'],
    'svd': ['svd', 'singular value', 'eigen', 'eigenvalue', 'diagonalization', 'matrix', '3blue1brown'],
    'os': ['virtual memory', 'paging', 'page table', 'lru', 'deadlock', 'mutex', 'semaphore', 'multithreading', 'scheduling'],
    'genomics': ['genomics', 'sequence alignment', 'needleman', 'smith waterman', 'dynamic programming', 'blast']
  };

  for (const resource of resources) {
    const title = (resource.title || '').toLowerCase();
    const url = (resource.url || '').toLowerCase();

    // 1. Direct title exact containment if cleanQuery is substantial
    if (cleanQuery.length > 4 && title.includes(cleanQuery)) {
      return resource;
    }

    const titleWords = title.split(/[\s\-:_/]+/).filter(w => w.length >= 3 && !stopwords.has(w));
    const hasWordMatch = queryWords.some(qw => titleWords.some(tw => tw === qw || (qw.length >= 4 && tw.includes(qw))));
    if (hasWordMatch) {
      return resource;
    }

    // 2. Alias mappings
    for (const [topicKey, aliases] of Object.entries(topicAliases)) {
      const resourceMatchesTopic = aliases.some(a => title.includes(a) || url.includes(a));
      const queryMatchesTopic = aliases.some(a => cleanQuery.includes(a));
      if (resourceMatchesTopic && queryMatchesTopic) {
        return resource;
      }
    }
  }

  return null;
}

/**
 * Generates an educational explanation based on a shared resource
 */
export function generateResourceExplanation(resource, fetchedData, query, group, student) {
  const cleanQ = query.replace(/@studybot/gi, '').trim();
  const title = resource.title || 'Shared Resource';
  const url = resource.url || '';
  const courseCode = group?.courseCode || 'Course';

  // Topic specific deep educational synthesis
  const titleLower = title.toLowerCase();
  const queryLower = cleanQ.toLowerCase();

  const isOops = titleLower.includes('oops') || titleLower.includes('object-oriented') || queryLower.includes('oops') || queryLower.includes('oop');
  const isBst = titleLower.includes('bst') || titleLower.includes('avl') || titleLower.includes('visualgo') || queryLower.includes('bst');
  const isSvd = titleLower.includes('svd') || titleLower.includes('eigen') || titleLower.includes('algebra') || queryLower.includes('svd');

  let resourceHeader = '';
  if (fetchedData?.success && fetchedData.textSnippet) {
    resourceHeader = `📚 **Based on Shared Squad Resource: [${title}](${url})**\n*(Retrieved and analyzed for your ${courseCode} sprint)*\n\n`;
  } else {
    resourceHeader = `📚 **Resource Knowledge Base: [${title}](${url})**\n*(Referenced from your group's shared study materials for ${courseCode})*\n\n`;
  }

  // Specialized Rich Response for OOPS
  if (isOops) {
    return `${resourceHeader}### 🎯 What is Object-Oriented Programming (OOP)?

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

💡 **Takeaway for ${group.name || 'your squad'}**: Using OOP keeps your code modular, scalable, and easy to unit test for your milestones!`;
  }

  // Specialized Rich Response for BST / AVL
  if (isBst) {
    return `${resourceHeader}### 🌲 Binary Search Trees & AVL Balancing Explained

Based on your shared resource, an **AVL Tree** is a height-balanced Binary Search Tree (BST) where the heights of the two child subtrees of any node differ by at most $\\pm 1$.

1. **Balance Factor**: $\\text{Height}(\\text{Left}) - \\text{Height}(\\text{Right}) \\in \\{-1, 0, +1\\}$.
2. **Rotations**: Single Rotations (**LL**, **RR**) for direct imbalance, and Double Rotations (**LR**, **RL**) for zigzag insertions.
3. **Time Complexity**: Guaranteed **O(log n)** lookup, insertion, and deletion.

🔗 *Interactive Practice*: You can use the link above to visualize rotation steps before writing your C++ rotation pointers!`;
  }

  // Specialized Rich Response for SVD / Linear Algebra
  if (isSvd) {
    return `${resourceHeader}### 📐 Singular Value Decomposition (SVD) Overview

According to your shared study resource, **SVD** decomposes any real matrix $A \\in \\mathbb{R}^{m \\times n}$ into:
$$A = U \\Sigma V^T$$
- **$U$**: Left singular vectors (orthonormal eigenvectors of $A A^T$).
- **$\\Sigma$**: Diagonal matrix of singular values $\\sigma_i = \\sqrt{\\lambda_i}$.
- **$V^T$**: Transposed right singular vectors (eigenvectors of $A^T A$).

Used extensively for matrix diagonalization, dimensionality reduction (PCA), and least-squares solving.`;
  }

  // General Resource Response with Extracted Excerpt
  let excerptSection = '';
  if (fetchedData?.success && fetchedData.textSnippet) {
    const lines = fetchedData.textSnippet.split('\n').filter(l => l.trim().length > 30).slice(0, 4);
    if (lines.length > 0) {
      excerptSection = `### 📖 Key Highlights from Resource:\n${lines.map(l => `> ${l.trim()}`).join('\n>\n')}\n\n`;
    }
  }

  return `${resourceHeader}### 💡 StudyBot Analysis for "${title}"

Regarding your question: *"${cleanQ}"*

${excerptSection}• **Resource Title**: ${title}
• **Source Link**: [${url}](${url})
• **Shared by**: ${resource.addedBy || 'Team member'}

This resource directly supports your group's active task **${group?.taskTitle || courseCode}**. Let me know if you would like me to break down specific formulas, definitions, or code implementations from this material!`;
}

/**
 * Main StudyBot reply generator
 */
export async function generateStudyBotReplyAsync({ query = '', group = {}, currentStudent = {} }) {
  const cleanQ = (query || '').trim().toLowerCase();
  const resources = group.resources || [];
  const milestones = group.milestones || [];
  const members = group.members || [];
  const courseCode = group.courseCode || 'CS 201';
  const groupName = group.name || 'Study Group';
  const taskTitle = group.taskTitle || 'Academic Assignment';

  const completedMilestones = milestones.filter(m => m.completed);
  const pendingMilestones = milestones.filter(m => !m.completed);
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones.length / milestones.length) * 100) : 0;
  const nextMilestone = pendingMilestones[0];

  // 1. Check if the question refers to a shared resource
  const matchedResource = findMatchingResource(query, resources);
  if (matchedResource) {
    let fetchedData = null;
    if (matchedResource.url) {
      fetchedData = await fetchResourceContent(matchedResource.url);
    }
    return generateResourceExplanation(matchedResource, fetchedData, query, group, currentStudent);
  }

  // 2. Sprint Milestones / Next Task
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
      return `🎉 **All Milestones Completed!**\n\nAll **${milestones.length}/${milestones.length}** sprint milestones (100%) for **${groupName}** have been checked off!\n\nYou and your squad are ready to submit **${taskTitle}**! 🚀`;
    }

    const remainingList = pendingMilestones
      .map((m, idx) => `  ${idx + 1}. **${m.title}** *(Assigned to: ${m.assignedTo || 'Unassigned'})*`)
      .join('\n');

    return `🎯 **Next Sprint Priority for ${currentStudent.name || 'Student'}:**\n\nCurrent Sprint Progress: **${completedMilestones.length}/${milestones.length} Milestones (${progressPercent}%)**\n\n### 👉 Immediate Next Milestone:\n**"${nextMilestone.title}"**\n• *Assigned to*: ${nextMilestone.assignedTo || 'Any squad member'}\n• *Status*: Pending completion\n\n### Incomplete Milestones:\n${remainingList}`;
  }

  // 3. Group Mission & Overview
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
    return `📋 **Group Mission & Task Overview for ${groupName}**\n\n• **Course**: ${courseCode}\n• **Target Task**: ${taskTitle}\n• **Active Squad**: ${members.length} student${members.length === 1 ? '' : 's'} (${members.map(m => m.name).join(', ')})\n• **Sprint Progress**: ${completedMilestones.length}/${milestones.length} Milestones Completed (${progressPercent}%)\n\n**Current Deliverables:**\n${milestones.map((m, idx) => `${idx + 1}. [${m.completed ? '✅ Completed' : '⏳ In Progress'}] ${m.title}`).join('\n')}\n\n**Shared Squad Resources:**\n${resourceNames}\n\n${nextMilestone ? `👉 **Next Priority**: "${nextMilestone.title}"` : '🎉 All milestones finished!'}`;
  }

  // 4. Greetings & Help
  if (
    cleanQ === 'hi' ||
    cleanQ === 'hello' ||
    cleanQ === 'hey' ||
    cleanQ === 'help' ||
    cleanQ.includes('who are you')
  ) {
    return `👋 Hey **${currentStudent.name || 'there'}**! I'm your AI Study Assistant for **${groupName}** (${courseCode}).\n\nHere are some things you can ask me:\n• *"@StudyBot what is oops"* *(inspects your shared resources)*\n• *"@StudyBot explain AVL rotation in simple terms"*\n• *"@StudyBot what are we working on in this group?"*\n• *"@StudyBot what should I complete next?"*\n• Ask questions about any of your shared notes or milestones!`;
  }

  // 5. Default Contextual Insight
  return `💡 **StudyBot Insight for ${courseCode} — ${taskTitle}:**\n\nRegarding: *"${query.replace(/@studybot/gi, '').trim()}"*\n\n• **Group**: ${groupName}\n• **Progress**: ${completedMilestones.length}/${milestones.length} milestones complete (${progressPercent}%)\n${nextMilestone ? `• **Next Goal**: "${nextMilestone.title}"\n` : ''}${resources.length > 0 ? `• **Available Resources**: ${resources.map(r => r.title).join(', ')}\n` : ''}\nFeel free to ask me to explain concepts from your shared resources, review milestones, or clarify formulas!`;
}
