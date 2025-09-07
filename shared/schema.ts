import { z } from "zod";

// Daily Task Schema
export const dailyTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  duration: z.number(), // in minutes
  category: z.enum(['morning', 'skill', 'evening']),
  completed: z.boolean().default(false),
  icon: z.string(),
});

export type DailyTask = z.infer<typeof dailyTaskSchema>;

// User Progress Schema
export const userProgressSchema = z.object({
  currentDay: z.number().min(1).max(30),
  streak: z.number().min(0),
  completedDays: z.array(z.number()),
  totalTasksCompleted: z.number().default(0),
  startDate: z.date(),
  lastActiveDate: z.date(),
});

export type UserProgress = z.infer<typeof userProgressSchema>;

// Journal Entry Schema
export const journalEntrySchema = z.object({
  id: z.string(),
  date: z.date(),
  day: z.number(),
  wentWell: z.string(),
  couldImprove: z.string(),
  tomorrowPriority: z.string(),
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;

// Skill Path Schema
export const skillPathSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  isActive: z.boolean().default(false),
  progress: z.number().min(0).max(100).default(0),
  topics: z.array(z.object({
    name: z.string(),
    progress: z.number().min(0).max(100).default(0),
  })),
});

export type SkillPath = z.infer<typeof skillPathSchema>;

// Skill Learning Note Schema
export const learningNoteSchema = z.object({
  id: z.string(),
  date: z.date(),
  day: z.number(),
  skillPath: z.string(),
  content: z.string(),
});

export type LearningNote = z.infer<typeof learningNoteSchema>;

// Vision Goal Schema
export const visionGoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  targetDate: z.date(),
  progress: z.number().min(0).max(100).default(0),
  imageUrl: z.string().optional(),
  category: z.enum(['financial', 'material', 'business', 'personal']),
  currentValue: z.string().optional(),
  targetValue: z.string(),
});

export type VisionGoal = z.infer<typeof visionGoalSchema>;

// Timer State Schema
export const timerStateSchema = z.object({
  type: z.enum(['meditation', 'exercise']),
  duration: z.number(), // total duration in seconds
  remaining: z.number(), // remaining time in seconds
  isActive: z.boolean().default(false),
  isPaused: z.boolean().default(false),
});

export type TimerState = z.infer<typeof timerStateSchema>;

// App State Schema (for localStorage)
export const appStateSchema = z.object({
  progress: userProgressSchema,
  journalEntries: z.array(journalEntrySchema),
  skillPaths: z.array(skillPathSchema),
  learningNotes: z.array(learningNoteSchema),
  visionGoals: z.array(visionGoalSchema),
  dailyTasks: z.record(z.string(), z.array(dailyTaskSchema)), // keyed by day
  timerState: timerStateSchema.nullable(),
  lastQuoteIndex: z.number().default(0),
});

export type AppState = z.infer<typeof appStateSchema>;
