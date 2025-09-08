import { AppState } from '@shared/schema';

const STORAGE_KEY = 'life-reset-30-app-state';

// Default app state
export const getDefaultAppState = (): AppState => ({
  progress: {
    currentDay: 1,
    streak: 0,
    completedDays: [],
    totalTasksCompleted: 0,
    startDate: new Date(),
    lastActiveDate: new Date(),
  },
  journalEntries: [],
  skillPaths: [
    {
      id: 'coding',
      name: 'Coding',
      description: 'React, JavaScript, APIs',
      icon: 'fas fa-code',
      isActive: true,
      progress: 0,
      topics: [
        { name: 'React Fundamentals', progress: 0 },
        { name: 'State Management', progress: 0 },
        { name: 'API Integration', progress: 0 },
      ],
    },
    {
      id: 'entrepreneurship',
      name: 'Entrepreneurship',
      description: 'Business, Strategy, Marketing',
      icon: 'fas fa-rocket',
      isActive: false,
      progress: 0,
      topics: [
        { name: 'Business Planning', progress: 0 },
        { name: 'Market Research', progress: 0 },
        { name: 'Strategy Development', progress: 0 },
      ],
    },
    {
      id: 'digital-marketing',
      name: 'Digital Marketing',
      description: 'SEO, Social Media, Content',
      icon: 'fas fa-bullhorn',
      isActive: false,
      progress: 0,
      topics: [
        { name: 'SEO Fundamentals', progress: 0 },
        { name: 'Social Media Strategy', progress: 0 },
        { name: 'Content Marketing', progress: 0 },
      ],
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Communication, Negotiation',
      icon: 'fas fa-handshake',
      isActive: false,
      progress: 0,
      topics: [
        { name: 'Communication Skills', progress: 0 },
        { name: 'Negotiation Tactics', progress: 0 },
        { name: 'Customer Psychology', progress: 0 },
      ],
    },
  ],
  learningNotes: [],
  visionGoals: [],
  dailyTasks: {},
  timerState: null,
  lastQuoteIndex: 0,
});

// Generate daily tasks for a specific day
export const generateDailyTasks = (day: number) => {
  type FrontendDailyTask = {
    id: string;
    title: string;
    description: string;
    duration: number;
    category: 'morning' | 'skill' | 'evening';
    completed: boolean;
    icon: string;
  priority: 'low' | 'high' | 'immediate';
  };

  const activeSkill = getActiveSkillPath();
  
  const tasks: FrontendDailyTask[] = [
    {
      id: `${day}-cold-shower`,
      title: 'Cold Shower',
      description: '5 minutes • Boost alertness',
      duration: 5,
      category: 'morning' as const,
      completed: false,
  icon: 'fas fa-shower',
  priority: 'low',
    },
    {
      id: `${day}-meditation`,
      title: 'Meditation Session',
      description: '10 minutes • Clear your mind',
      duration: 10,
      category: 'morning' as const,
      completed: false,
  icon: 'fas fa-om',
  priority: 'low',
    },
    {
      id: `${day}-gratitude-journal`,
      title: 'Gratitude Journal',
      description: '5 minutes • Count your blessings',
      duration: 5,
      category: 'morning' as const,
      completed: false,
  icon: 'fas fa-heart',
  priority: 'low',
    },
    {
      id: `${day}-skill-learning`,
      title: 'Skill Learning',
      description: `30 minutes • ${activeSkill.name}`,
      duration: 30,
      category: 'skill' as const,
      completed: false,
  icon: activeSkill.icon,
  priority: 'low',
    },
    {
      id: `${day}-exercise`,
      title: 'Exercise',
      description: '20 minutes • Build strength',
      duration: 20,
      category: 'evening' as const,
      completed: false,
  icon: 'fas fa-dumbbell',
  priority: 'low',
    },
    {
      id: `${day}-evening-reflection`,
      title: 'Evening Reflection',
      description: '10 minutes • Reflect on today',
      duration: 10,
      category: 'evening' as const,
      completed: false,
  icon: 'fas fa-moon',
  priority: 'low',
    },
  ];
  return tasks;
};

// Get active skill path
type LocalSkillPath = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  progress: number;
  topics: { name: string; progress: number; }[] | string;
};

export const getActiveSkillPath = (): LocalSkillPath => {
  const appState = loadAppState();
  return appState.skillPaths.find(skill => skill.isActive) || appState.skillPaths[0];
};

// Save app state to localStorage
export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving app state:', error);
  }
};

// Load app state from localStorage
export const loadAppState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored, (key, value) => {
        // Parse dates
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value);
        }
        return value;
      });
      return { ...getDefaultAppState(), ...parsed };
    }
  } catch (error) {
    console.error('Error loading app state:', error);
  }
  return getDefaultAppState();
};

// Check if daily reset is needed
export const checkDailyReset = (state: AppState): AppState => {
  const today = new Date();
  const lastActive = new Date(state.progress.lastActiveDate);
  
  // Check if it's a new day
  if (today.toDateString() !== lastActive.toDateString()) {
    const daysPassed = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    // Reset streak if more than 1 day passed
    const newStreak = daysPassed > 1 ? 0 : state.progress.streak;
    
    return {
      ...state,
      progress: {
        ...state.progress,
        lastActiveDate: today,
        streak: newStreak,
      },
    };
  }
  
  return state;
};

// Export journal entries as text file
export const exportJournal = (entries: Array<{ date: Date; day: number; wentWell: string; couldImprove: string; tomorrowPriority: string; }>): void => {
  const text = entries
    .map(entry => {
      return `Day ${entry.day} - ${entry.date.toDateString()}

What went well today:
${entry.wentWell}

What could I improve:
${entry.couldImprove}

Tomorrow's priority:
${entry.tomorrowPriority}

---

`;
    })
    .join('');
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `life-reset-30-journal-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
