export const INITIAL_STUDENTS = [
  {
    id: "student-1",
    name: "Alex Rivera",
    email: "alex.rivera@campus.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    university: "State Tech University",
    major: "Computer Science",
    year: "Junior",
    bio: "Focused on systems programming & algorithms. I love breaking down complex problem sets into code snippets.",
    studyStyle: "Step-by-Step Problem Solving",
    preferredTimes: ["Evening", "Late Night"],
    targetGrade: "A / 4.0",
    timezone: "PST (UTC-8)",
    activeAssignmentIds: ["assign-1", "assign-2", "assign-5"]
  },
  {
    id: "student-2",
    name: "Priya Patel",
    email: "priya.patel@campus.edu",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    university: "State Tech University",
    major: "Computer Science",
    year: "Junior",
    bio: "Passionate about data structures and tree algorithms. Looking for peers to grind LeetCode & Lab 3.",
    studyStyle: "Collaborative Discussion",
    preferredTimes: ["Late Night", "Evening"],
    targetGrade: "A / 4.0",
    timezone: "PST (UTC-8)",
    activeAssignmentIds: ["assign-1", "assign-3"]
  },
  {
    id: "student-3",
    name: "Marcus Vance",
    email: "marcus.v@campus.edu",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    university: "State Tech University",
    major: "Data Science & Math",
    year: "Sophomore",
    bio: "Linear algebra enthusiast. Prefer quiet, deep-focus study sprints with periodic checkpoints.",
    studyStyle: "Deep Focus",
    preferredTimes: ["Afternoon", "Evening"],
    targetGrade: "A / 4.0",
    timezone: "PST (UTC-8)",
    activeAssignmentIds: ["assign-2", "assign-4"]
  },
  {
    id: "student-4",
    name: "Elena Rostova",
    email: "elena.r@campus.edu",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    university: "State Tech University",
    major: "Electrical & Computer Eng",
    year: "Senior",
    bio: "Working on OS concurrency & multithreading labs. Looking for someone to debug race conditions together.",
    studyStyle: "Step-by-Step Problem Solving",
    preferredTimes: ["Late Night"],
    targetGrade: "Pass / Good",
    timezone: "PST (UTC-8)",
    activeAssignmentIds: ["assign-5", "assign-6"]
  },
  {
    id: "student-5",
    name: "Jordan Lee",
    email: "jordan.lee@campus.edu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    university: "State Tech University",
    major: "Bioinformatics",
    year: "Sophomore",
    bio: "Balancing genomics computation and statistics homework. Early riser who likes morning focus blocks.",
    studyStyle: "Deep Focus",
    preferredTimes: ["Morning", "Afternoon"],
    targetGrade: "A / 4.0",
    timezone: "PST (UTC-8)",
    activeAssignmentIds: ["assign-4", "assign-7"]
  }
];

export const INITIAL_ASSIGNMENTS = [
  {
    id: "assign-1",
    studentId: "student-1",
    studentName: "Alex Rivera",
    courseCode: "CS 201",
    courseName: "Data Structures & Algorithms",
    title: "Lab 3: Binary Search Tree Traversals & Balancing",
    taskType: "Lab",
    topics: ["Binary Search Tree", "AVL Trees", "Recursion", "Tree Rotations", "C++"],
    deadline: "2026-08-25T23:59:00Z", // In ~3 days
    estimatedHours: 8,
    difficulty: "Challenging",
    description: "Implement recursive insertion, deletion, and AVL self-balancing rotations in C++. Include runtime benchmark analysis.",
    status: "In Progress",
    createdAt: "2026-08-21T10:00:00Z"
  },
  {
    id: "assign-2",
    studentId: "student-1",
    studentName: "Alex Rivera",
    courseCode: "MATH 240",
    courseName: "Linear Algebra & Applications",
    title: "Problem Set 4: Eigenvalues & Matrix Diagonalization",
    taskType: "Assignment",
    topics: ["Eigenvalues", "Eigenvectors", "Diagonalization", "Orthogonal Projections", "MATLAB"],
    deadline: "2026-08-26T18:00:00Z", // In ~4 days
    estimatedHours: 6,
    difficulty: "Medium",
    description: "Solve theoretical proofs on defective matrices and compute 5x5 matrix diagonalizations using MATLAB.",
    status: "Not Started",
    createdAt: "2026-08-20T14:30:00Z"
  },
  {
    id: "assign-3",
    studentId: "student-2",
    studentName: "Priya Patel",
    courseCode: "CS 201",
    courseName: "Data Structures & Algorithms",
    title: "Lab 3: BST & AVL Tree Implementation",
    taskType: "Lab",
    topics: ["Binary Search Tree", "Tree Rotations", "Recursion", "Inorder Traversal", "C++"],
    deadline: "2026-08-25T23:59:00Z", // Same deadline as Alex!
    estimatedHours: 7,
    difficulty: "Challenging",
    description: "Writing the height calculation and double-rotation methods for our BST assignment. Need a partner to test edge cases.",
    status: "In Progress",
    createdAt: "2026-08-21T11:15:00Z"
  },
  {
    id: "assign-4",
    studentId: "student-3",
    studentName: "Marcus Vance",
    courseCode: "MATH 240",
    courseName: "Linear Algebra & Applications",
    title: "Problem Set 4: Eigenvalues & Vector Spaces",
    taskType: "Assignment",
    topics: ["Eigenvalues", "Eigenvectors", "Linear Transformations", "Diagonalization"],
    deadline: "2026-08-26T20:00:00Z", // Within 2 hours of Alex's math assignment
    estimatedHours: 5,
    difficulty: "Medium",
    description: "Working on questions 4 through 8 regarding characteristic polynomials and spectral theorem applications.",
    status: "In Progress",
    createdAt: "2026-08-21T08:00:00Z"
  },
  {
    id: "assign-5",
    studentId: "student-1",
    studentName: "Alex Rivera",
    courseCode: "CS 330",
    courseName: "Operating Systems Principles",
    title: "Project 2: Multithreaded Kernel Scheduling",
    taskType: "Project",
    topics: ["Threads", "POSIX Mutex", "Deadlock Prevention", "Round Robin", "C"],
    deadline: "2026-08-29T23:59:00Z",
    estimatedHours: 14,
    difficulty: "Hard",
    description: "Build a preemptive round-robin thread scheduler simulator with condition variables and semaphore synchronization.",
    status: "Not Started",
    createdAt: "2026-08-22T09:00:00Z"
  },
  {
    id: "assign-6",
    studentId: "student-4",
    studentName: "Elena Rostova",
    courseCode: "CS 330",
    courseName: "Operating Systems Principles",
    title: "Project 2: Multithreaded Scheduling Simulation",
    taskType: "Project",
    topics: ["Threads", "POSIX Mutex", "Concurrency", "Semaphores", "C"],
    deadline: "2026-08-29T23:59:00Z",
    estimatedHours: 12,
    difficulty: "Hard",
    description: "Implementing thread context switching and lock acquisition order to prevent circular wait deadlocks.",
    status: "In Progress",
    createdAt: "2026-08-21T18:45:00Z"
  },
  {
    id: "assign-7",
    studentId: "student-5",
    studentName: "Jordan Lee",
    courseCode: "BIO 210",
    courseName: "Computational Genomics",
    title: "Quiz 2 Prep: Sequence Alignment Algorithms",
    taskType: "Quiz",
    topics: ["Needleman-Wunsch", "Smith-Waterman", "Dynamic Programming", "BLAST"],
    deadline: "2026-08-27T12:00:00Z",
    estimatedHours: 4,
    difficulty: "Medium",
    description: "Reviewing matrix traceback for local and global pairwise sequence alignment.",
    status: "In Progress",
    createdAt: "2026-08-22T08:30:00Z"
  }
];

export const INITIAL_GROUPS = [
  {
    id: "group-1",
    name: "CS201 BST Slayers",
    courseCode: "CS 201",
    taskTitle: "Lab 3: Binary Search Tree Traversals & Balancing",
    inviteCode: "SYNC-CS201",
    shareableUrl: "/join/SYNC-CS201",
    description: "Active sprint group for finishing the AVL tree rotation test cases and edge cases.",
    createdById: "student-2",
    maxCapacity: 4,
    members: [
      {
        studentId: "student-2",
        name: "Priya Patel",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        role: "Admin",
        progress: 65,
        joinedAt: "2026-08-21T11:20:00Z"
      },
      {
        studentId: "student-4",
        name: "Elena Rostova",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
        role: "Member",
        progress: 40,
        joinedAt: "2026-08-21T14:10:00Z"
      }
    ],
    milestones: [
      { id: "m-1", title: "Implement basic BST Node and Insert", completed: true, assignedTo: "Priya Patel" },
      { id: "m-2", title: "Write Inorder, Preorder, Postorder traversals", completed: true, assignedTo: "Elena Rostova" },
      { id: "m-3", title: "Calculate Subtree Heights and Balance Factor", completed: true, assignedTo: "Priya Patel" },
      { id: "m-4", title: "Implement Left and Right AVL Rotations", completed: false, assignedTo: "Unassigned" },
      { id: "m-5", title: "Pass Stress Test Benchmark Suite", completed: false, assignedTo: "Unassigned" }
    ],
    resources: [
      { id: "r-1", title: "Visualgo BST & AVL Interactive Demo", url: "https://visualgo.net/en/bst", addedBy: "Priya Patel", type: "link" },
      { id: "r-2", title: "Lab 3 Spec & Starter Code", url: "https://campus.edu/cs201/lab3.pdf", addedBy: "Elena Rostova", type: "document" }
    ],
    createdAt: "2026-08-21T11:20:00Z"
  },
  {
    id: "group-2",
    name: "Linear Algebra Eigen Squad",
    courseCode: "MATH 240",
    taskTitle: "Problem Set 4: Eigenvalues & Diagonalization",
    inviteCode: "SYNC-MATH240",
    shareableUrl: "/join/SYNC-MATH240",
    description: "Deep focus group proofing theoretical linear algebra problem set theorems.",
    createdById: "student-3",
    maxCapacity: 3,
    members: [
      {
        studentId: "student-3",
        name: "Marcus Vance",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        role: "Admin",
        progress: 50,
        joinedAt: "2026-08-21T08:15:00Z"
      }
    ],
    milestones: [
      { id: "m-10", title: "Proof for invertible matrix eigenvalues", completed: true, assignedTo: "Marcus Vance" },
      { id: "m-11", title: "Diagonalization calculation for Question 5", completed: false, assignedTo: "Unassigned" },
      { id: "m-12", title: "MATLAB script validation", completed: false, assignedTo: "Unassigned" }
    ],
    resources: [
      { id: "r-10", title: "3Blue1Brown Essence of Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", addedBy: "Marcus Vance", type: "link" }
    ],
    createdAt: "2026-08-21T08:15:00Z"
  }
];
