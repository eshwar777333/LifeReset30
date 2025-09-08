import { z } from "zod";
import { pgTable, text, integer, boolean, timestamp, uuid, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Database Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyTasks = pgTable("daily_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in minutes
  category: text("category").notNull(), // 'morning', 'skill', 'evening'
  completed: boolean("completed").default(false),
  icon: text("icon").notNull(),
  // Task priority: low, high, immediate
  priority: text("priority").notNull().default('low'),
  day: integer("day").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  currentDay: integer("current_day").default(1),
  streak: integer("streak").default(0),
  completedDays: text("completed_days").default(""), // JSON array as string
  totalTasksCompleted: integer("total_tasks_completed").default(0),
  startDate: timestamp("start_date").defaultNow(),
  lastActiveDate: timestamp("last_active_date").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  day: integer("day").notNull(),
  wentWell: text("went_well").notNull(),
  couldImprove: text("could_improve").notNull(),
  tomorrowPriority: text("tomorrow_priority").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skillPaths = pgTable("skill_paths", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  isActive: boolean("is_active").default(false),
  progress: real("progress").default(0),
  topics: text("topics").notNull(), // JSON array as string
});

export const learningNotes = pgTable("learning_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  day: integer("day").notNull(),
  skillPathId: uuid("skill_path_id").references(() => skillPaths.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visionGoals = pgTable("vision_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetDate: timestamp("target_date").notNull(),
  progress: real("progress").default(0),
  imageUrl: text("image_url"),
  category: text("category").notNull(), // 'financial', 'material', 'business', 'personal'
  currentValue: text("current_value"),
  targetValue: text("target_value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Database Relations
export const usersRelations = relations(users, ({ many }) => ({
  dailyTasks: many(dailyTasks),
  progress: many(userProgress),
  journalEntries: many(journalEntries),
  skillPaths: many(skillPaths),
  learningNotes: many(learningNotes),
  visionGoals: many(visionGoals),
}));

export const dailyTasksRelations = relations(dailyTasks, ({ one }) => ({
  user: one(users, { fields: [dailyTasks.userId], references: [users.id] }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, { fields: [journalEntries.userId], references: [users.id] }),
}));

export const skillPathsRelations = relations(skillPaths, ({ one, many }) => ({
  user: one(users, { fields: [skillPaths.userId], references: [users.id] }),
  learningNotes: many(learningNotes),
}));

export const learningNotesRelations = relations(learningNotes, ({ one }) => ({
  user: one(users, { fields: [learningNotes.userId], references: [users.id] }),
  skillPath: one(skillPaths, { fields: [learningNotes.skillPathId], references: [skillPaths.id] }),
}));

export const visionGoalsRelations = relations(visionGoals, ({ one }) => ({
  user: one(users, { fields: [visionGoals.userId], references: [users.id] }),
}));

// Zod Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertDailyTaskSchema = createInsertSchema(dailyTasks);
export const selectDailyTaskSchema = createSelectSchema(dailyTasks);
export const insertUserProgressSchema = createInsertSchema(userProgress);
export const selectUserProgressSchema = createSelectSchema(userProgress);
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const selectJournalEntrySchema = createSelectSchema(journalEntries);
export const insertSkillPathSchema = createInsertSchema(skillPaths);
export const selectSkillPathSchema = createSelectSchema(skillPaths);
export const insertLearningNoteSchema = createInsertSchema(learningNotes);
export const selectLearningNoteSchema = createSelectSchema(learningNotes);
export const insertVisionGoalSchema = createInsertSchema(visionGoals);
export const selectVisionGoalSchema = createSelectSchema(visionGoals);

// Types inferred from database schema
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = typeof dailyTasks.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;
export type SkillPath = typeof skillPaths.$inferSelect;
export type InsertSkillPath = typeof skillPaths.$inferInsert;
export type LearningNote = typeof learningNotes.$inferSelect;
export type InsertLearningNote = typeof learningNotes.$inferInsert;
export type VisionGoal = typeof visionGoals.$inferSelect;
export type InsertVisionGoal = typeof visionGoals.$inferInsert;

// Legacy schemas for backward compatibility (will be removed)
export const dailyTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  duration: z.number(),
  category: z.enum(['morning', 'skill', 'evening']),
  completed: z.boolean().default(false),
  icon: z.string(),
  // Optional in legacy localStorage to stay backward-compatible
  priority: z.enum(['low', 'high', 'immediate']).optional().default('low'),
});

export const userProgressSchema = z.object({
  currentDay: z.number().min(1).max(30),
  streak: z.number().min(0),
  completedDays: z.array(z.number()),
  totalTasksCompleted: z.number().default(0),
  startDate: z.date(),
  lastActiveDate: z.date(),
});

export const journalEntrySchema = z.object({
  id: z.string(),
  date: z.date(),
  day: z.number(),
  wentWell: z.string(),
  couldImprove: z.string(),
  tomorrowPriority: z.string(),
});

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

export const learningNoteSchema = z.object({
  id: z.string(),
  date: z.date(),
  day: z.number(),
  skillPath: z.string(),
  content: z.string(),
});

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

export const timerStateSchema = z.object({
  type: z.enum(['meditation', 'exercise']),
  duration: z.number(),
  remaining: z.number(),
  isActive: z.boolean().default(false),
  isPaused: z.boolean().default(false),
});

export type TimerState = z.infer<typeof timerStateSchema>;

// App State Schema (for localStorage - legacy)
export const appStateSchema = z.object({
  progress: userProgressSchema,
  journalEntries: z.array(journalEntrySchema),
  skillPaths: z.array(skillPathSchema),
  learningNotes: z.array(learningNoteSchema),
  visionGoals: z.array(visionGoalSchema),
  dailyTasks: z.record(z.string(), z.array(dailyTaskSchema)),
  timerState: timerStateSchema.nullable(),
  lastQuoteIndex: z.number().default(0),
});

export type AppState = z.infer<typeof appStateSchema>;
