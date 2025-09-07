import { db } from "./db";
import { 
  users, 
  dailyTasks, 
  userProgress, 
  journalEntries, 
  skillPaths, 
  learningNotes, 
  visionGoals,
  type User,
  type InsertUser,
  type DailyTask,
  type InsertDailyTask,
  type UserProgress,
  type InsertUserProgress,
  type JournalEntry,
  type InsertJournalEntry,
  type SkillPath,
  type InsertSkillPath,
  type LearningNote,
  type InsertLearningNote,
  type VisionGoal,
  type InsertVisionGoal,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // User Progress methods
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<UserProgress>;
  
  // Daily Tasks methods
  getDailyTasks(userId: string, day: number): Promise<DailyTask[]>;
  createDailyTask(task: InsertDailyTask): Promise<DailyTask>;
  updateDailyTask(id: string, updates: Partial<DailyTask>): Promise<DailyTask>;
  deleteDailyTask(id: string): Promise<void>;
  
  // Journal methods
  getJournalEntry(userId: string, day: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry>;
  
  // Skill Paths methods
  getSkillPaths(userId: string): Promise<SkillPath[]>;
  createSkillPath(skillPath: InsertSkillPath): Promise<SkillPath>;
  updateSkillPath(id: string, updates: Partial<SkillPath>): Promise<SkillPath>;
  deleteSkillPath(id: string): Promise<void>;
  
  // Learning Notes methods
  getLearningNotes(userId: string, day?: number): Promise<LearningNote[]>;
  createLearningNote(note: InsertLearningNote): Promise<LearningNote>;
  
  // Vision Goals methods
  getVisionGoals(userId: string): Promise<VisionGoal[]>;
  createVisionGoal(goal: InsertVisionGoal): Promise<VisionGoal>;
  updateVisionGoal(id: string, updates: Partial<VisionGoal>): Promise<VisionGoal>;
  deleteVisionGoal(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    
    // Create initial user progress
    await db.insert(userProgress).values({
      userId: user.id,
      currentDay: 1,
      streak: 0,
      completedDays: JSON.stringify([]),
      totalTasksCompleted: 0,
      startDate: new Date(),
      lastActiveDate: new Date(),
    });
    
    return user;
  }

  // User Progress methods
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress || undefined;
  }

  async updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    const [progress] = await db
      .update(userProgress)
      .set(updates)
      .where(eq(userProgress.userId, userId))
      .returning();
    return progress;
  }

  // Daily Tasks methods
  async getDailyTasks(userId: string, day: number): Promise<DailyTask[]> {
    return await db
      .select()
      .from(dailyTasks)
      .where(and(eq(dailyTasks.userId, userId), eq(dailyTasks.day, day)));
  }

  async createDailyTask(task: InsertDailyTask): Promise<DailyTask> {
    const [newTask] = await db.insert(dailyTasks).values(task).returning();
    return newTask;
  }

  async updateDailyTask(id: string, updates: Partial<DailyTask>): Promise<DailyTask> {
    const [task] = await db
      .update(dailyTasks)
      .set(updates)
      .where(eq(dailyTasks.id, id))
      .returning();
    return task;
  }

  async deleteDailyTask(id: string): Promise<void> {
    await db.delete(dailyTasks).where(eq(dailyTasks.id, id));
  }

  // Journal methods
  async getJournalEntry(userId: string, day: number): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.day, day)));
    return entry || undefined;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }

  async updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const [entry] = await db
      .update(journalEntries)
      .set(updates)
      .where(eq(journalEntries.id, id))
      .returning();
    return entry;
  }

  // Skill Paths methods
  async getSkillPaths(userId: string): Promise<SkillPath[]> {
    return await db.select().from(skillPaths).where(eq(skillPaths.userId, userId));
  }

  async createSkillPath(skillPath: InsertSkillPath): Promise<SkillPath> {
    const [newSkillPath] = await db.insert(skillPaths).values(skillPath).returning();
    return newSkillPath;
  }

  async updateSkillPath(id: string, updates: Partial<SkillPath>): Promise<SkillPath> {
    const [skillPath] = await db
      .update(skillPaths)
      .set(updates)
      .where(eq(skillPaths.id, id))
      .returning();
    return skillPath;
  }

  async deleteSkillPath(id: string): Promise<void> {
    await db.delete(skillPaths).where(eq(skillPaths.id, id));
  }

  // Learning Notes methods
  async getLearningNotes(userId: string, day?: number): Promise<LearningNote[]> {
    if (day !== undefined) {
      return await db
        .select()
        .from(learningNotes)
        .where(and(eq(learningNotes.userId, userId), eq(learningNotes.day, day)));
    }
    return await db.select().from(learningNotes).where(eq(learningNotes.userId, userId));
  }

  async createLearningNote(note: InsertLearningNote): Promise<LearningNote> {
    const [newNote] = await db.insert(learningNotes).values(note).returning();
    return newNote;
  }

  // Vision Goals methods
  async getVisionGoals(userId: string): Promise<VisionGoal[]> {
    return await db.select().from(visionGoals).where(eq(visionGoals.userId, userId));
  }

  async createVisionGoal(goal: InsertVisionGoal): Promise<VisionGoal> {
    const [newGoal] = await db.insert(visionGoals).values(goal).returning();
    return newGoal;
  }

  async updateVisionGoal(id: string, updates: Partial<VisionGoal>): Promise<VisionGoal> {
    const [goal] = await db
      .update(visionGoals)
      .set(updates)
      .where(eq(visionGoals.id, id))
      .returning();
    return goal;
  }

  async deleteVisionGoal(id: string): Promise<void> {
    await db.delete(visionGoals).where(eq(visionGoals.id, id));
  }
}

export const storage = new DatabaseStorage();
